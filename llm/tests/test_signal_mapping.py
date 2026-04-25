import unittest
from datetime import date

from models.signal import (
    SignalType,
    dashboard_row_to_market_signal,
    map_source_type_to_signal_type,
)


class DashboardSignalMappingTests(unittest.TestCase):
    def setUp(self):
        self.base_row = {
            "signal_id": "sig-1",
            "source_type": "competitor_news",
            "source_url": "https://example.com/news/1",
            "source_date": date(2026, 4, 24),
            "source_author": "Reuters",
            "evidence_quality": "medium",
            "relevance_score": 0.91,
            "freshness_score": 0.88,
            "sentiment": -0.45,
            "language": "en",
        }

    def test_source_type_maps_to_expected_signal_type(self):
        cases = {
            "competitor_news": SignalType.COMPETITOR_MOVE,
            "patent_filing": SignalType.PATENT,
            "forum_discussion": SignalType.MARKET_TREND,
            "regulatory_update": SignalType.REGULATION,
            "emerging_technology": SignalType.TECHNOLOGY,
            "unknown_type": SignalType.MARKET_TREND,
        }

        for source_type, expected in cases.items():
            with self.subTest(source_type=source_type):
                self.assertEqual(map_source_type_to_signal_type(source_type), expected)

    def test_dashboard_row_to_market_signal_handles_missing_nullable_fields(self):
        row = {
            "signal_id": "sig-2",
            "source_type": "forum_discussion",
            "source_url": None,
            "source_date": None,
            "source_author": None,
            "evidence_quality": None,
            "relevance_score": None,
            "freshness_score": None,
            "sentiment": None,
            "language": None,
        }

        signal = dashboard_row_to_market_signal(row)

        self.assertEqual(signal.signal_id, "sig-2")
        self.assertEqual(signal.signal_type, SignalType.MARKET_TREND)
        self.assertTrue(signal.title)
        self.assertTrue(signal.description)
        self.assertEqual(signal.source, "Forum Discussion")

    def test_title_and_description_generation_is_deterministic(self):
        first = dashboard_row_to_market_signal(self.base_row)
        second = dashboard_row_to_market_signal(self.base_row)

        self.assertEqual(first.title, second.title)
        self.assertEqual(first.description, second.description)
        self.assertEqual(first.source, second.source)

    def test_to_context_includes_decision_driving_db_fields(self):
        signal = dashboard_row_to_market_signal(self.base_row)
        context = signal.to_context()

        self.assertIn("Signal Title:", context)
        self.assertIn("Source Type: competitor_news", context)
        self.assertIn("Evidence Quality: medium", context)
        self.assertIn("Relevance Score: 0.91", context)
        self.assertIn("Freshness Score: 0.88", context)
        self.assertIn("Sentiment: -0.45", context)
        self.assertIn("Source Date: 2026-04-24", context)
        self.assertIn("Source Author: Reuters", context)
        self.assertIn("Source URL: https://example.com/news/1", context)
        self.assertNotIn("Language:", context)


if __name__ == "__main__":
    unittest.main()
