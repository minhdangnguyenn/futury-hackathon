from config import PERSONAS
from data.default_signals import ALL_SIGNALS
from agents.debate_engine import DebateEngine
from agents.signal_correlator import SignalCorrelator
from models.portfolio import SignalPortfolio
from models.signal import MarketSignal, SignalType


class DebateOrchestrator:
    """Coordinates the combined-signal workflow for the API layer."""

    def __init__(self):
        self.correlator = SignalCorrelator()

    def stream_combined_debate(
        self,
        persona_keys: list[str],
        rounds: int,
        source_mode: str = "default",
        signals: list[MarketSignal] | None = None,
    ):
        portfolio = self._build_portfolio(source_mode=source_mode, signals=signals)

        yield {
            "type": "session_started",
            "rounds": rounds,
            "personas": persona_keys,
            "source_mode": source_mode,
            "signals": [self._serialize_signal(signal) for signal in portfolio.signals],
        }

        correlation_chunks = []
        yield {"type": "correlation_started"}
        for chunk in self.correlator.stream_correlate(portfolio):
            correlation_chunks.append(chunk)
            yield {"type": "correlation_chunk", "content": chunk}

        correlation_text = "".join(correlation_chunks)
        portfolio = self.correlator._parse_correlations(correlation_text, portfolio)
        yield {
            "type": "correlation_completed",
            "correlation_text": correlation_text,
            "portfolio": self._serialize_portfolio(portfolio),
        }

        brief_chunks = []
        yield {"type": "brief_started"}
        for chunk in self.correlator.stream_combined_debate_brief(portfolio):
            brief_chunks.append(chunk)
            yield {"type": "brief_chunk", "content": chunk}

        brief = "".join(brief_chunks)
        combined_signal = self._build_combined_signal(brief)
        yield {
            "type": "brief_completed",
            "brief": brief,
            "combined_signal": self._serialize_signal(combined_signal),
        }

        engine = DebateEngine(persona_keys=persona_keys, max_rounds=rounds)
        for event in engine.run_stream(combined_signal):
            yield event

    def list_personas(self) -> list[dict]:
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
        return personas

    def _build_portfolio(
        self,
        source_mode: str = "default",
        signals: list[MarketSignal] | None = None,
    ) -> SignalPortfolio:
        portfolio = SignalPortfolio()

        if signals is not None:
            source_signals = signals
        else:
            source_signals = ALL_SIGNALS
            if source_mode == "dashboard_data":
                source_signals = []

        for signal in source_signals:
            portfolio.add_signal(signal)
        return portfolio

    def _build_combined_signal(self, brief: str) -> MarketSignal:
        return MarketSignal(
            title="COMBINED: Smart Fitting + Data Center + Green Materials Convergence",
            description=brief,
            signal_type=SignalType.MARKET_TREND,
            source="Multi-Signal Correlation Analysis",
            region="European Union",
        )

    def _serialize_signal(self, signal: MarketSignal) -> dict:
        return signal.to_dict()

    def _serialize_portfolio(self, portfolio: SignalPortfolio) -> dict:
        return {
            "signals": [self._serialize_signal(signal) for signal in portfolio.signals],
            "themes": portfolio.themes,
            "convergence_insight": portfolio.convergence_insight,
            "strategic_window": portfolio.strategic_window,
            "combined_recommendation": portfolio.combined_recommendation,
        }
