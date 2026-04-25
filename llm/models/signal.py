from dataclasses import dataclass, field
from datetime import date, datetime
from typing import Any, Optional
from enum import Enum
from urllib.parse import urlparse


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
    signal_id: Optional[str] = None
    source_type: Optional[str] = None
    source_url: Optional[str] = None
    source_date: Optional[date] = None
    source_author: Optional[str] = None
    evidence_quality: Optional[str] = None
    relevance_score: Optional[float] = None
    freshness_score: Optional[float] = None
    sentiment: Optional[float] = None
    language: Optional[str] = None
    
    def to_context(self) -> str:
        lines = [
            f"Signal Title: {self.title}",
            f"Type: {self.signal_type.value}",
            f"Description: {self.description}",
            f"Source: {self.source or 'Public'}",
        ]

        if self.source_type:
            lines.append(f"Source Type: {self.source_type}")
        if self.evidence_quality:
            lines.append(f"Evidence Quality: {self.evidence_quality}")
        if self.relevance_score is not None:
            lines.append(f"Relevance Score: {self.relevance_score:.2f}")
        if self.freshness_score is not None:
            lines.append(f"Freshness Score: {self.freshness_score:.2f}")
        if self.sentiment is not None:
            lines.append(f"Sentiment: {self.sentiment:.2f}")
        if self.source_date:
            lines.append(f"Source Date: {self.source_date.isoformat()}")
        if self.source_author:
            lines.append(f"Source Author: {self.source_author}")
        if self.source_url:
            lines.append(f"Source URL: {self.source_url}")
        if self.region:
            lines.append(f"Region: {self.region}")

        return "\n".join(lines)

    def to_dict(self) -> dict[str, Any]:
        return {
            "signal_id": self.signal_id,
            "title": self.title,
            "description": self.description.strip(),
            "signal_type": self.signal_type.value,
            "source": self.source,
            "region": self.region,
            "source_type": self.source_type,
            "source_url": self.source_url,
            "source_date": self.source_date.isoformat() if self.source_date else None,
            "source_author": self.source_author,
            "evidence_quality": self.evidence_quality,
            "relevance_score": self.relevance_score,
            "freshness_score": self.freshness_score,
            "sentiment": self.sentiment,
            "language": self.language,
        }


def _parse_date(value: Any) -> Optional[date]:
    if value is None:
        return None
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value
    if isinstance(value, str) and value.strip():
        try:
            return datetime.fromisoformat(value.replace("Z", "+00:00")).date()
        except ValueError:
            return None
    return None


def _to_float(value: Any) -> Optional[float]:
    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _format_source_type(source_type: Optional[str]) -> str:
    if not source_type:
        return "market signal"
    return source_type.replace("_", " ").strip()


def _score_band(value: Optional[float]) -> str:
    if value is None:
        return "unknown"
    if value >= 0.75:
        return "high"
    if value >= 0.4:
        return "medium"
    return "low"


def _sentiment_label(value: Optional[float]) -> str:
    if value is None:
        return "neutral"
    if value >= 0.25:
        return "positive"
    if value <= -0.25:
        return "negative"
    return "neutral"


def _host_from_url(url: Optional[str]) -> Optional[str]:
    if not url:
        return None
    parsed = urlparse(url)
    return parsed.netloc or None


def map_source_type_to_signal_type(source_type: Optional[str]) -> SignalType:
    normalized = (source_type or "").strip().lower()

    if any(keyword in normalized for keyword in ("patent", "ip_filing")):
        return SignalType.PATENT
    if any(keyword in normalized for keyword in ("regulation", "regulatory", "compliance", "law")):
        return SignalType.REGULATION
    if any(keyword in normalized for keyword in ("technology", "emerging_tech", "research", "innovation")):
        return SignalType.TECHNOLOGY
    if any(keyword in normalized for keyword in ("competitor", "press_release", "product_launch")):
        return SignalType.COMPETITOR_MOVE
    return SignalType.MARKET_TREND


def build_dashboard_signal_source(row: dict[str, Any]) -> str:
    source_author = row.get("source_author")
    source_url = row.get("source_url")
    source_type = row.get("source_type")
    host = _host_from_url(source_url)

    if source_author and host:
        return f"{source_author} ({host})"
    if source_author:
        return str(source_author)
    if host:
        return host
    if source_type:
        return _format_source_type(str(source_type)).title()
    return "Public"


def build_dashboard_signal_title(row: dict[str, Any]) -> str:
    source_type = _format_source_type(row.get("source_type")).title()
    evidence_quality = str(row.get("evidence_quality") or "unknown").title()
    source_author = row.get("source_author")
    host = _host_from_url(row.get("source_url"))

    if source_author:
        return f"{source_type}: {evidence_quality} evidence from {source_author}"
    if host:
        return f"{source_type}: {evidence_quality} evidence via {host}"
    return f"{source_type}: {evidence_quality} evidence signal"


def build_dashboard_signal_description(row: dict[str, Any]) -> str:
    source_type = row.get("source_type") or "unknown"
    evidence_quality = str(row.get("evidence_quality") or "unknown")
    relevance_score = _score_band(_to_float(row.get("relevance_score")))
    freshness_score = _score_band(_to_float(row.get("freshness_score")))
    sentiment = _sentiment_label(_to_float(row.get("sentiment")))

    parts = [
        f"Signal from {source_type}",
        f"with {evidence_quality} evidence quality",
        f"{relevance_score} relevance",
        f"{freshness_score} freshness",
        f"and {sentiment} sentiment",
    ]

    source_author = row.get("source_author")
    source_date = _parse_date(row.get("source_date"))
    source_url = row.get("source_url")

    if source_author:
        parts.append(f"published by {source_author}")
    if source_date:
        parts.append(f"on {source_date.isoformat()}")
    if source_url:
        parts.append(f"source URL {source_url}")

    return ", ".join(parts) + "."


def dashboard_row_to_market_signal(row: dict[str, Any]) -> MarketSignal:
    signal_type = map_source_type_to_signal_type(row.get("source_type"))

    return MarketSignal(
        signal_id=row.get("signal_id"),
        title=build_dashboard_signal_title(row),
        description=build_dashboard_signal_description(row),
        signal_type=signal_type,
        source=build_dashboard_signal_source(row),
        region=None,
        source_type=row.get("source_type"),
        source_url=row.get("source_url"),
        source_date=_parse_date(row.get("source_date")),
        source_author=row.get("source_author"),
        evidence_quality=row.get("evidence_quality"),
        relevance_score=_to_float(row.get("relevance_score")),
        freshness_score=_to_float(row.get("freshness_score")),
        sentiment=_to_float(row.get("sentiment")),
        language=row.get("language"),
    )


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
