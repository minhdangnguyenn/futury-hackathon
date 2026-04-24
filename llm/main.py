from models.signal import MarketSignal, SignalType
from models.portfolio import SignalPortfolio
from agents.debate_engine import DebateEngine
from agents.signal_correlator import SignalCorrelator
from data.default_signals import ALL_SIGNALS
from utils.display import Display


def run_combined_mode(display: Display):
    """Analyze all signals together, find correlations, then debate"""
    
    display.header("COMBINED SIGNAL ANALYSIS MODE")
    
    # Build portfolio
    portfolio = SignalPortfolio()
    for signal in ALL_SIGNALS:
        portfolio.add_signal(signal)
    
    print(f"\n📦 Loaded {len(portfolio.signals)} signals into portfolio:")
    for i, s in enumerate(portfolio.signals, 1):
        print(f"   {i}. {s.signal_type.value}: {s.title}")
    
    # Step 1: Correlate signals
    display.section("🔍 FINDING SIGNAL CORRELATIONS")
    print("⏳ Analyzing connections between signals...\n")
    
    correlator = SignalCorrelator()
    portfolio = correlator.correlate(portfolio)
    
    # Display correlation results
    print(portfolio._full_correlation)
    
    # Step 2: Generate combined brief
    display.section("📋 COMBINED STRATEGIC BRIEF")
    brief = correlator.generate_combined_debate_brief(portfolio)
    print(brief)
    
    # Step 3: Create a combined signal for debate
    combined_signal = MarketSignal(
        title="COMBINED: Smart Fitting + Data Center + Green Materials Convergence",
        description=brief,
        signal_type=SignalType.MARKET_TREND,
        source="Multi-Signal Correlation Analysis",
        region="European Union"
    )
    
    # Step 4: Run persona debate on combined signal
    display.section("🎭 COMBINED SIGNAL PERSONA DEBATE")
    print("Which personas should debate the COMBINED picture?")
    
    persona_map = {
        "1": "david", "2": "josef", "3": "steffen",
        "4": "volkmar", "5": "nick"
    }
    labels = {
        "1": "💻 David - Digital Innovator",
        "2": "🔧 Josef - Loyal Traditionalist", 
        "3": "⚡ Steffen - Demanding Doer",
        "4": "📊 Volkmar - Cautious Follower",
        "5": "🌱 Nick - Sustainable Companion"
    }
    
    for k, v in labels.items():
        print(f"  {k}. {v}")
    
    print("\nSelect 2-3 personas (e.g. '1,2,5'): ", end="")
    choices = input().strip().split(',')
    selected = [persona_map[c.strip()] for c in choices if c.strip() in persona_map]
    
    if len(selected) < 2:
        selected = ["david", "nick"]  # Default: Innovation vs Sustainability
        print(f"⚠️  Defaulting to David + Nick")
    
    engine = DebateEngine(persona_keys=selected)
    result = engine.run(combined_signal)
    
    # Store result
    portfolio.individual_results.append(result)
    
    return portfolio


def main():
    display = Display()
    
    print("\n" + "=" * 60)
    print("  🏭 VIEGA INTELLIGENCE SYSTEM v2.0")
    print("  Combined Multi-Signal Intelligence")
    print("=" * 60)

    run_combined_mode(display)


if __name__ == "__main__":
    main()
