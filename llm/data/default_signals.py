from models.signal import MarketSignal, SignalType


ALL_SIGNALS = [
    MarketSignal(
        title="AquaSystems Inc. - Smart-Press Fitting Launch",
        description="""
        Competitor AquaSystems Inc. launched 'Smart-Press' fitting series claiming
        30% faster installation. Related patent filed in USPTO. Strong installer
        interest in German trade press. Targets Profipress market segment directly.
        """,
        signal_type=SignalType.COMPETITOR_MOVE,
        source="Press Release + USPTO",
        region="US + EU",
    ),
    MarketSignal(
        title="Data Center Cooling Installation Inefficiency",
        description="""
        Professional forums show 340% increase in discussions about inefficiencies
        in cooling system installation for modular data centers. Pain points:
        non-standard connections, long install times, high labor cost, need for
        flexible reconfiguration. Growing trend in EU market.
        """,
        signal_type=SignalType.MARKET_TREND,
        source="HVAC-Talk Forums + LinkedIn",
        region="European Union",
    ),
    MarketSignal(
        title="Lead-Free Soldering Technology - Delft University",
        description="""
        Delft University published research on bismuth-silver lead-free solder
        for copper pipes, validated for drinking water (EU Directive 2020/2184).
        No commercial partner yet. Part of broader green building materials trend
        driven by EU Green Deal regulations.
        """,
        signal_type=SignalType.TECHNOLOGY,
        source="Academic Publication",
        region="European Union",
    ),
]
