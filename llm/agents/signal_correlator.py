import google.generativeai as genai
from config import MODEL_NAME, require_google_api_key
from models.signal import MarketSignal
from models.portfolio import SignalPortfolio, SignalCorrelation


CORRELATOR_PROMPT = """
You are a Senior Strategic Intelligence Analyst at Viega.
Your unique skill is finding NON-OBVIOUS connections between 
seemingly unrelated market signals.

You think in patterns:
- What signals REINFORCE each other? (same trend from different angles)
- What signals CONTRADICT each other? (conflicting market directions)
- What signals ENABLE each other? (one makes another more valuable)
- What signals create a CONVERGENCE? (all pointing to same opportunity/threat)

You always ask:
"What does COMBINING these signals tell us that each one alone does NOT?"

Viega context: Press fittings, piping, drainage, pre-wall tech.
Markets: Heating/Cooling, Drinking Water, Industrial, Shipbuilding.
Customers: Installers, Planners, Wholesalers, End Users.
"""

class SignalCorrelator:
    def __init__(self):
        genai.configure(api_key=require_google_api_key())
        self.model = genai.GenerativeModel(
            model_name=MODEL_NAME,
            system_instruction=CORRELATOR_PROMPT,
            generation_config={"temperature": 0.4}
        )

    def _build_correlation_prompt(self, portfolio: SignalPortfolio) -> str:
        signal_block = ""
        for i, signal in enumerate(portfolio.signals, 1):
            signal_block += f"""
            SIGNAL {i}: {signal.title}
            Type: {signal.signal_type.value}
            Description: {signal.description}
            ---
            """

        return f"""
        Analyze these {len(portfolio.signals)} market signals TOGETHER for Viega:
        
        {signal_block}
        
        Find the hidden connections. Provide your analysis in this format:
        
        PAIRWISE CONNECTIONS:
        (For each pair of signals, identify their relationship)
        
        SIGNAL_1 + SIGNAL_2:
        RELATIONSHIP: [REINFORCES/CONTRADICTS/ENABLES/THREATENS]
        INSIGHT: [What does this combination reveal?]
        COMBINED_URGENCY: [1-10]
        
        (repeat for all pairs)
        
        EMERGING THEMES:
        - [Theme 1: name and 1-sentence description]
        - [Theme 2: name and 1-sentence description]
        - [Theme 3 if applicable]
        
        CONVERGENCE INSIGHT:
        [2-3 sentences: What is the BIG PICTURE when all signals are viewed together?
         What opportunity or threat is emerging that no single signal reveals alone?]
        
        STRATEGIC WINDOW:
        [1-2 sentences: How much time does Viega have to respond? 
         Is this urgent (act in 3 months), important (6-12 months), or long-term (1-3 years)?]
        
        COMBINED RECOMMENDATION:
        [BUILD/INVEST/MONITOR/IGNORE] - [One sentence on the combined strategic action]
        """

    def correlate(self, portfolio: SignalPortfolio) -> SignalPortfolio:
        """Find connections between all signals in the portfolio."""

        response = self.model.generate_content(self._build_correlation_prompt(portfolio))
        response_text = response.text
        portfolio = self._parse_correlations(response_text, portfolio)
        return portfolio

    def stream_correlate(self, portfolio: SignalPortfolio):
        """Yield correlation text as the model generates it."""

        response = self.model.generate_content(
            self._build_correlation_prompt(portfolio),
            stream=True,
        )
        for chunk in response:
            text = getattr(chunk, "text", "")
            if text:
                yield text
    
    def _parse_correlations(
        self, 
        response_text: str, 
        portfolio: SignalPortfolio
    ) -> SignalPortfolio:
        """Parse the LLM response into structured data"""
        
        lines = response_text.split('\n')
        current_section = None
        themes = []
        convergence_lines = []
        window_lines = []
        
        i = 0
        while i < len(lines):
            line = lines[i].strip()
            
            if 'EMERGING THEMES:' in line:
                current_section = 'themes'
            elif 'CONVERGENCE INSIGHT:' in line:
                current_section = 'convergence'
            elif 'STRATEGIC WINDOW:' in line:
                current_section = 'window'
            elif 'COMBINED RECOMMENDATION:' in line:
                portfolio.combined_recommendation = line.replace(
                    'COMBINED RECOMMENDATION:', ''
                ).strip()
                current_section = None
            elif current_section == 'themes' and line.startswith('-'):
                themes.append(line[1:].strip())
            elif current_section == 'convergence' and line:
                convergence_lines.append(line)
            elif current_section == 'window' and line:
                window_lines.append(line)
            
            i += 1
        
        portfolio.themes = themes[:3]
        portfolio.convergence_insight = ' '.join(convergence_lines[:3])
        portfolio.strategic_window = ' '.join(window_lines[:2])
        
        # Store full response for display
        portfolio._full_correlation = response_text
        
        return portfolio
    
    def _build_combined_debate_brief_prompt(self, portfolio: SignalPortfolio) -> str:
        return f"""
        Create a SINGLE strategic debate brief that combines these signals:
        
        {portfolio.summary()}
        
        CONVERGENCE INSIGHT: {portfolio.convergence_insight}
        THEMES: {', '.join(portfolio.themes)}
        
        Write a 150-word brief for Viega's strategy team that:
        1. Frames the combined situation (not individual signals)
        2. States the core strategic question Viega must answer
        3. Highlights the time pressure
        
        This brief will be used to trigger a persona debate.
        Write it as if briefing senior executives before a strategy meeting.
        """

    def generate_combined_debate_brief(
        self,
        portfolio: SignalPortfolio
    ) -> str:
        """Generate a single brief that combines all signals for personas to debate."""

        response = self.model.generate_content(
            self._build_combined_debate_brief_prompt(portfolio)
        )
        return response.text

    def stream_combined_debate_brief(self, portfolio: SignalPortfolio):
        """Yield the executive brief as the model generates it."""

        response = self.model.generate_content(
            self._build_combined_debate_brief_prompt(portfolio),
            stream=True,
        )
        for chunk in response:
            text = getattr(chunk, "text", "")
            if text:
                yield text
