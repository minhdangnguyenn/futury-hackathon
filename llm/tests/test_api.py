import asyncio
import unittest
from datetime import date
from unittest.mock import patch

from fastapi import HTTPException
from pydantic import ValidationError

from api import (
    FIXED_DASHBOARD_LIMIT,
    FIXED_DEBATE_ROUNDS,
    FIXED_PERSONAS,
    DebateStreamRequest,
    IdeaDebateRequest,
    fetch_dashboard_rows,
    stream_debate,
    stream_idea_debate,
)


async def collect_stream_body(response):
    chunks = []
    async for chunk in response.body_iterator:
        if isinstance(chunk, bytes):
            chunks.append(chunk.decode("utf-8"))
        else:
            chunks.append(chunk)
    return "".join(chunks)


class FakeCursor:
    def __init__(self, rows):
        self.rows = rows
        self.query = None
        self.params = None

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False

    def execute(self, query, params):
        self.query = query
        self.params = params

    def fetchall(self):
        return self.rows


class FakeConnection:
    def __init__(self, rows):
        self.rows = rows
        self.cursor_instance = None
        self.closed = False

    def cursor(self, cursor_factory=None):
        self.cursor_instance = FakeCursor(self.rows)
        return self.cursor_instance

    def close(self):
        self.closed = True


class FakeOrchestrator:
    def __init__(self):
        self.calls = []

    def stream_combined_debate(self, persona_keys, rounds, source_mode="default", signals=None):
        self.calls.append(
            {
                "persona_keys": persona_keys,
                "rounds": rounds,
                "source_mode": source_mode,
                "signals": signals,
            }
        )
        yield {
            "type": "session_started",
            "personas": persona_keys,
            "rounds": rounds,
            "source_mode": source_mode,
            "signal_count": len(signals or []),
        }


class DebateApiTests(unittest.TestCase):
    def setUp(self):
        self.db_rows = [
            {
                "signal_id": "sig-1",
                "source_type": "forum_discussion",
                "source_url": "https://example.com/reddit/1",
                "source_date": date(2026, 4, 24),
                "source_author": "reddit-user",
                "evidence_quality": "low",
                "relevance_score": 0.92,
                "freshness_score": 0.98,
                "sentiment": -0.1,
                "language": "en",
            }
        ]

    def test_fetch_dashboard_rows_uses_db_ordering_and_filter(self):
        conn = FakeConnection(self.db_rows)

        with patch("api.get_db_connection", return_value=conn):
            rows = fetch_dashboard_rows(
                limit=5,
                offset=0,
                source_type="forum_discussion",
                debate_order=True,
            )

        self.assertEqual(rows, self.db_rows)
        self.assertIn("WHERE source_type = %s", conn.cursor_instance.query)
        self.assertIn("source_date DESC NULLS LAST", conn.cursor_instance.query)
        self.assertIn("relevance_score DESC NULLS LAST", conn.cursor_instance.query)
        self.assertIn("freshness_score DESC NULLS LAST", conn.cursor_instance.query)
        self.assertEqual(conn.cursor_instance.params, ["forum_discussion", 5, 0])
        self.assertTrue(conn.closed)

    def test_default_mode_remains_backward_compatible(self):
        orchestrator = FakeOrchestrator()
        request = DebateStreamRequest(rounds=2, personas=["david", "josef"])

        with patch("api.get_orchestrator", return_value=orchestrator):
            response = stream_debate(request)
            body = asyncio.run(collect_stream_body(response))

        self.assertIn("event: session_started", body)
        self.assertIn('"source_mode": "default"', body)
        self.assertIn("event: done", body)
        self.assertEqual(orchestrator.calls[0]["source_mode"], "default")
        self.assertIsNone(orchestrator.calls[0]["signals"])

    def test_dashboard_data_mode_streams_real_db_rows(self):
        conn = FakeConnection(self.db_rows)
        orchestrator = FakeOrchestrator()
        request = DebateStreamRequest(
            rounds=2,
            personas=["david", "josef"],
            source_mode="dashboard_data",
            limit=2,
            source_type="forum_discussion",
        )

        with patch("api.get_db_connection", return_value=conn), patch(
            "api.get_orchestrator", return_value=orchestrator
        ):
            response = stream_debate(request)
            body = asyncio.run(collect_stream_body(response))

        self.assertIn("event: session_started", body)
        self.assertIn('"source_mode": "dashboard_data"', body)
        self.assertIn("event: done", body)
        self.assertEqual(orchestrator.calls[0]["source_mode"], "dashboard_data")
        self.assertEqual(len(orchestrator.calls[0]["signals"]), 1)
        self.assertEqual(orchestrator.calls[0]["signals"][0].signal_id, "sig-1")
        self.assertEqual(orchestrator.calls[0]["signals"][0].source_type, "forum_discussion")

    def test_dashboard_data_mode_returns_404_when_no_rows_found(self):
        conn = FakeConnection([])
        request = DebateStreamRequest(
            rounds=2,
            personas=["david", "josef"],
            source_mode="dashboard_data",
        )

        with patch("api.get_db_connection", return_value=conn):
            with self.assertRaises(HTTPException) as exc_info:
                stream_debate(request)

        self.assertEqual(exc_info.exception.status_code, 404)

    def test_invalid_personas_raise_422(self):
        request = DebateStreamRequest(rounds=2, personas=["david", "unknown"])

        with self.assertRaises(HTTPException) as exc_info:
            stream_debate(request)

        self.assertEqual(exc_info.exception.status_code, 422)

    def test_invalid_source_mode_is_rejected_by_request_model(self):
        with self.assertRaises(ValidationError):
            DebateStreamRequest(
                rounds=2,
                personas=["david", "josef"],
                source_mode="invalid_mode",
            )

    def test_idea_stream_uses_fixed_rounds_personas_and_latest_dashboard_rows(self):
        conn = FakeConnection(self.db_rows)
        orchestrator = FakeOrchestrator()
        request = IdeaDebateRequest(idea="Launch a contractor-facing AI fitting assistant.")

        with patch("api.get_db_connection", return_value=conn), patch(
            "api.get_orchestrator", return_value=orchestrator
        ):
            response = stream_idea_debate(request)
            body = asyncio.run(collect_stream_body(response))

        self.assertIn("event: idea_received", body)
        self.assertIn("event: session_started", body)
        self.assertIn('"source_mode": "dashboard_data_plus_idea"', body)
        self.assertIn("event: done", body)
        self.assertEqual(orchestrator.calls[0]["rounds"], FIXED_DEBATE_ROUNDS)
        self.assertEqual(orchestrator.calls[0]["persona_keys"], FIXED_PERSONAS)
        self.assertEqual(orchestrator.calls[0]["source_mode"], "dashboard_data_plus_idea")
        self.assertEqual(len(orchestrator.calls[0]["signals"]), 2)
        self.assertEqual(orchestrator.calls[0]["signals"][0].signal_id, "user-idea")
        self.assertEqual(orchestrator.calls[0]["signals"][0].source_type, "user_idea")
        self.assertEqual(orchestrator.calls[0]["signals"][1].signal_id, "sig-1")
        self.assertEqual(conn.cursor_instance.params, [FIXED_DASHBOARD_LIMIT, 0])

    def test_idea_stream_returns_404_when_dashboard_is_empty(self):
        conn = FakeConnection([])
        request = IdeaDebateRequest(idea="Evaluate an AI quoting copilot for installers.")

        with patch("api.get_db_connection", return_value=conn):
            with self.assertRaises(HTTPException) as exc_info:
                stream_idea_debate(request)

        self.assertEqual(exc_info.exception.status_code, 404)


if __name__ == "__main__":
    unittest.main()
