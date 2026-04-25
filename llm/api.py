import json
import os
from datetime import date
from functools import lru_cache
from typing import Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
import psycopg2
from psycopg2.extras import RealDictCursor

from config import PERSONAS
from models.signal import MarketSignal, SignalType, dashboard_row_to_market_signal


app = FastAPI(
    title="Viega Intelligence API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DebateStreamRequest(BaseModel):
    rounds: int = Field(default=2, ge=1, le=5)
    personas: list[str] = Field(..., min_length=2, max_length=5)
    source_mode: Literal["default", "dashboard_data"] = "default"
    limit: int = Field(default=5, ge=1, le=20)
    source_type: str | None = None


class IdeaDebateRequest(BaseModel):
    idea: str = Field(..., min_length=5, max_length=4000)


class DashboardDataItem(BaseModel):
    signal_id: str
    source_type: str | None = None
    source_url: str | None = None
    source_date: date | None = None
    source_author: str | None = None
    evidence_quality: str | None = None
    relevance_score: float | None = None
    freshness_score: float | None = None
    sentiment: float | None = None
    language: str | None = None


class DashboardDataResponse(BaseModel):
    items: list[DashboardDataItem]
    count: int


FIXED_DEBATE_ROUNDS = 2
FIXED_DASHBOARD_LIMIT = 5
FIXED_PERSONAS = list(PERSONAS.keys())


def get_db_connection():
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", "5432"),
        database=os.getenv("DB_NAME", "freiessen"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASS"),
    )


def fetch_dashboard_rows(
    limit: int = 100,
    offset: int = 0,
    source_type: str | None = None,
    debate_order: bool = False,
) -> list[dict]:
    safe_limit = min(max(limit, 1), 500)
    safe_offset = max(offset, 0)

    query = """
        SELECT
            signal_id,
            source_type,
            source_url,
            source_date,
            source_author,
            evidence_quality,
            relevance_score,
            freshness_score,
            sentiment,
            language
        FROM dashboard_data
    """
    params: list[object] = []

    if source_type:
        query += " WHERE source_type = %s"
        params.append(source_type)

    if debate_order:
        query += """
            ORDER BY
                source_date DESC NULLS LAST,
                relevance_score DESC NULLS LAST,
                freshness_score DESC NULLS LAST,
                signal_id ASC
        """
    else:
        query += """
            ORDER BY
                source_date DESC NULLS LAST,
                signal_id ASC
        """

    query += """
        LIMIT %s OFFSET %s
    """
    params.extend([safe_limit, safe_offset])

    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(query, params)
            return [dict(row) for row in cur.fetchall()]
    finally:
        conn.close()


def fetch_dashboard_market_signals(
    limit: int = 5,
    source_type: str | None = None,
) -> list[MarketSignal]:
    rows = fetch_dashboard_rows(
        limit=limit,
        offset=0,
        source_type=source_type,
        debate_order=True,
    )
    return [dashboard_row_to_market_signal(row) for row in rows]


@lru_cache(maxsize=1)
def get_orchestrator():
    from agents.orchestrator import DebateOrchestrator

    return DebateOrchestrator()


def _normalize_personas(personas: list[str]) -> list[str]:
    normalized = []
    for persona in personas:
        key = persona.strip().lower()
        if key in PERSONAS and key not in normalized:
            normalized.append(key)

    if len(normalized) < 2:
        raise ValueError("Choose at least two valid personas.")

    return normalized


def _format_sse(event_name: str, payload: dict) -> str:
    return f"event: {event_name}\ndata: {json.dumps(payload, ensure_ascii=False)}\n\n"


def _build_user_idea_signal(idea: str) -> MarketSignal:
    normalized_idea = " ".join(idea.split())
    short_title = normalized_idea[:77].rstrip()
    if len(normalized_idea) > 77:
        short_title += "..."

    return MarketSignal(
        signal_id="user-idea",
        title=f"User Idea: {short_title}",
        description=(
            "User-submitted idea to test against the latest market signals: "
            f"{normalized_idea}"
        ),
        signal_type=SignalType.MARKET_TREND,
        source="User Input",
        region=None,
        source_type="user_idea",
        source_author="user",
    )


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/personas")
def list_personas():
    personas = []
    for key, info in PERSONAS.items():
        personas.append(
            {
                "key": key,
                "name": info["name"],
                "title": info["title"],
                "age": info["age"],
                "emoji": info["emoji"],
            }
        )
    return {"personas": personas}


@app.get("/dashboard-data", response_model=DashboardDataResponse)
def get_dashboard_data(
    limit: int = 100,
    offset: int = 0,
    source_type: str | None = None,
):
    try:
        rows = fetch_dashboard_rows(
            limit=limit,
            offset=offset,
            source_type=source_type,
        )
    except psycopg2.Error as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Database query failed: {exc.pgerror or str(exc)}",
        ) from exc

    return {"items": rows, "count": len(rows)}


@app.post("/debates/stream")
def stream_debate(request: DebateStreamRequest):
    try:
        personas = _normalize_personas(request.personas)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    dashboard_signals: list[MarketSignal] | None = None
    if request.source_mode == "dashboard_data":
        try:
            dashboard_signals = fetch_dashboard_market_signals(
                limit=request.limit,
                source_type=request.source_type,
            )
        except psycopg2.Error as exc:
            raise HTTPException(
                status_code=500,
                detail=f"Database query failed: {exc.pgerror or str(exc)}",
            ) from exc

        if not dashboard_signals:
            raise HTTPException(
                status_code=404,
                detail="No dashboard signals found for the requested filters.",
            )

    def event_stream():
        try:
            orchestrator = get_orchestrator()
            for event in orchestrator.stream_combined_debate(
                persona_keys=personas,
                rounds=request.rounds,
                source_mode=request.source_mode,
                signals=dashboard_signals,
            ):
                yield _format_sse(event["type"], event)
        except Exception as exc:
            error_event = {"type": "error", "message": str(exc)}
            yield _format_sse("error", error_event)
        finally:
            yield _format_sse("done", {"type": "done"})

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@app.post("/debates/stream/idea")
def stream_idea_debate(request: IdeaDebateRequest):
    try:
        dashboard_signals = fetch_dashboard_market_signals(limit=FIXED_DASHBOARD_LIMIT)
    except psycopg2.Error as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Database query failed: {exc.pgerror or str(exc)}",
        ) from exc

    if not dashboard_signals:
        raise HTTPException(
            status_code=404,
            detail="No dashboard signals found for the debate.",
        )

    combined_signals = [_build_user_idea_signal(request.idea), *dashboard_signals]

    def event_stream():
        try:
            orchestrator = get_orchestrator()
            yield _format_sse(
                "idea_received",
                {
                    "type": "idea_received",
                    "idea": request.idea,
                    "rounds": FIXED_DEBATE_ROUNDS,
                    "personas": FIXED_PERSONAS,
                    "dashboard_limit": FIXED_DASHBOARD_LIMIT,
                },
            )
            for event in orchestrator.stream_combined_debate(
                persona_keys=FIXED_PERSONAS,
                rounds=FIXED_DEBATE_ROUNDS,
                source_mode="dashboard_data_plus_idea",
                signals=combined_signals,
            ):
                yield _format_sse(event["type"], event)
        except Exception as exc:
            error_event = {"type": "error", "message": str(exc)}
            yield _format_sse("error", error_event)
        finally:
            yield _format_sse("done", {"type": "done"})

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
