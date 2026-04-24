from dataclasses import dataclass, field
from typing import Optional
from enum import Enum


class SignalType(Enum):
    COMPETITOR_MOVE = "Competitor Move"
    MARKET_TREND = "Market Trend"
    TECHNOLOGY = "New Technology"
    PATENT = "Patent Filing"
    REGULATION = "Regulatory Change"


class Recommendation(Enum):
    BUILD = "🟢 BUILD"
    INVEST = "🟡 INVEST"
    IGNORE = "🔴 IGNORE"
    MONITOR = "🔵 MONITOR"


@dataclass
class MarketSignal:
    title: str
    description: str
    signal_type: SignalType
    source: Optional[str] = None
    region: Optional[str] = "European Union"
    
    def to_context(self) -> str:
        return f"""
        Signal Title: {self.title}
        Type: {self.signal_type.value}
        Description: {self.description}
        Source: {self.source or 'Public'}
        Region: {self.region}
        """


@dataclass
class DebateArgument:
    persona_name: str
    persona_title: str
    argument: str
    stance: str  # "FOR" / "AGAINST" / "NEUTRAL"
    round_number: int


@dataclass 
class DebateResult:
    signal: MarketSignal
    arguments: list = field(default_factory=list)
    conflicts: list = field(default_factory=list)
    agreements: list = field(default_factory=list)
    recommendation: Optional[str] = None
    reasoning: Optional[str] = None
    next_actions: list = field(default_factory=list)
    confidence_score: Optional[int] = None
