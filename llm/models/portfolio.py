from dataclasses import dataclass, field
from typing import List, Optional
from models.signal import MarketSignal, DebateResult


@dataclass
class SignalCorrelation:
    signal_a: str           # signal title
    signal_b: str           # signal title
    relationship: str       # "REINFORCES" / "CONTRADICTS" / "ENABLES" / "THREATENS"
    insight: str            # what the connection means
    combined_urgency: int   # 1-10, higher than individual scores


@dataclass
class SignalPortfolio:
    """A collection of signals analyzed together"""
    signals: List[MarketSignal] = field(default_factory=list)
    correlations: List[SignalCorrelation] = field(default_factory=list)
    themes: List[str] = field(default_factory=list)          # e.g. "Green Tech", "Smart Fittings"
    convergence_insight: Optional[str] = None                # the big picture
    strategic_window: Optional[str] = None                   # time pressure assessment
    combined_recommendation: Optional[str] = None
    individual_results: List[DebateResult] = field(default_factory=list)
    
    def add_signal(self, signal: MarketSignal):
        self.signals.append(signal)
    
    def summary(self) -> str:
        lines = []
        for i, s in enumerate(self.signals, 1):
            lines.append(f"{i}. [{s.signal_type.value}] {s.title}")
        return "\n".join(lines)
