import re
from collections import Counter
from typing import Iterable, List

import google.generativeai as genai

from agents.personas import PersonaAgent
from config import GOOGLE_API_KEY, MAX_DEBATE_ROUNDS, MODEL_NAME, PERSONAS
from models.signal import DebateArgument, DebateResult, MarketSignal
from utils.display import Display


genai.configure(api_key=GOOGLE_API_KEY)


SYNTHESIS_PROMPT = """
You are the neutral facilitator for a Viega strategic debate.
Your job is to synthesize persona arguments into one practical decision.

Recommendations must be one of: BUILD, INVEST, MONITOR, IGNORE.
Prefer clear, actionable next steps over generic summaries.
"""


class DebateEngine:
    """Runs a multi-persona debate and returns a structured recommendation."""

    def __init__(
        self,
        persona_keys: Iterable[str],
        max_rounds: int = MAX_DEBATE_ROUNDS,
        display: Display | None = None,
    ):
        self.persona_keys = self._validate_personas(persona_keys)
        self.max_rounds = max(1, max_rounds)
        self.display = display or Display()
        self.personas = [PersonaAgent(key) for key in self.persona_keys]
        self.synthesis_model = genai.GenerativeModel(
            model_name=MODEL_NAME,
            system_instruction=SYNTHESIS_PROMPT,
            generation_config={"temperature": 0.3},
        )

    def run(self, signal: MarketSignal) -> DebateResult:
        """Run debate rounds for a signal and synthesize the final result."""

        result = DebateResult(signal=signal)
        self.display.signal_card(signal)

        for round_num in range(1, self.max_rounds + 1):
            self.display.round_header(round_num)
            context = self._build_context(result.arguments)

            for persona in self.personas:
                argument = persona.argue(
                    signal=signal,
                    context=context,
                    round_num=round_num,
                )
                result.arguments.append(argument)
                self._print_argument(argument)

        self._synthesize(result)
        self.display.recommendation_card(result)
        return result

    def run_stream(self, signal: MarketSignal):
        """Yield debate events as text becomes available."""

        result = DebateResult(signal=signal)
        yield {
            "type": "debate_started",
            "signal": self._serialize_signal(signal),
            "personas": self.persona_keys,
            "rounds": self.max_rounds,
        }

        for round_num in range(1, self.max_rounds + 1):
            yield {"type": "round_started", "round": round_num}
            context = self._build_context(result.arguments)

            for persona in self.personas:
                yield {
                    "type": "persona_started",
                    "round": round_num,
                    "persona_key": persona.persona_key,
                    "persona_name": persona.persona_info["name"],
                    "persona_title": persona.persona_info["title"],
                }

                chunks = []
                for chunk in persona.stream_argument(
                    signal=signal,
                    context=context,
                    round_num=round_num,
                ):
                    chunks.append(chunk)
                    yield {
                        "type": "persona_chunk",
                        "round": round_num,
                        "persona_key": persona.persona_key,
                        "content": chunk,
                    }

                argument = persona.parse_argument("".join(chunks), round_num)
                result.arguments.append(argument)
                yield {
                    "type": "persona_completed",
                    "round": round_num,
                    "persona_key": persona.persona_key,
                    "argument": self._serialize_argument(argument),
                }

        yield {"type": "synthesis_started"}
        synthesis_chunks = []

        try:
            for chunk in self._stream_synthesis(result):
                synthesis_chunks.append(chunk)
                yield {"type": "synthesis_chunk", "content": chunk}

            self._parse_synthesis("".join(synthesis_chunks), result)
        except Exception as exc:
            self._fallback_synthesis(result, exc)

        yield {
            "type": "final_result",
            "result": self._serialize_result(result),
        }

    def _validate_personas(self, persona_keys: Iterable[str]) -> List[str]:
        valid_keys = []
        for key in persona_keys:
            normalized = key.strip().lower()
            if normalized in PERSONAS and normalized not in valid_keys:
                valid_keys.append(normalized)

        if len(valid_keys) < 2:
            raise ValueError(
                "DebateEngine requires at least two valid persona keys. "
                f"Available personas: {', '.join(PERSONAS)}"
            )

        return valid_keys

    def _build_context(self, arguments: list[DebateArgument]) -> str:
        if not arguments:
            return "No previous arguments yet."

        transcript = []
        for argument in arguments:
            transcript.append(
                f"ROUND {argument.round_number} - {argument.persona_name} "
                f"({argument.stance}):\n{argument.argument}"
            )
        return "\n\n".join(transcript)

    def _print_argument(self, argument: DebateArgument):
        print(
            f"\n{argument.persona_name} - {argument.persona_title} "
            f"[{argument.stance}]"
        )
        print(argument.argument.strip())

    def _synthesize(self, result: DebateResult):
        try:
            response = self.synthesis_model.generate_content(
                self._build_synthesis_prompt(result)
            )
            self._parse_synthesis(response.text, result)
        except Exception as exc:
            self._fallback_synthesis(result, exc)

    def _build_synthesis_prompt(self, result: DebateResult) -> str:
        return f"""
        Signal under debate:
        {result.signal.to_context()}

        Persona debate transcript:
        {self._build_context(result.arguments)}

        Produce a decision in exactly this format:
        RECOMMENDATION: [BUILD/INVEST/MONITOR/IGNORE]
        CONFIDENCE: [1-10]
        REASONING: [2-4 sentences]
        AGREEMENTS:
        - [agreement 1]
        - [agreement 2]
        CONFLICTS:
        - [conflict 1]
        - [conflict 2]
        NEXT ACTIONS:
        1. [action 1]
        2. [action 2]
        3. [action 3]
        """

    def _stream_synthesis(self, result: DebateResult):
        response = self.synthesis_model.generate_content(
            self._build_synthesis_prompt(result),
            stream=True,
        )
        for chunk in response:
            text = getattr(chunk, "text", "")
            if text:
                yield text

    def _parse_synthesis(self, response_text: str, result: DebateResult):
        current_section = None

        for raw_line in response_text.splitlines():
            line = raw_line.strip()
            if not line:
                continue

            upper_line = line.upper()
            if upper_line.startswith("RECOMMENDATION:"):
                result.recommendation = line.split(":", 1)[1].strip()
                current_section = None
            elif upper_line.startswith("CONFIDENCE:"):
                result.confidence_score = self._parse_confidence(line)
                current_section = None
            elif upper_line.startswith("REASONING:"):
                result.reasoning = line.split(":", 1)[1].strip()
                current_section = "reasoning"
            elif upper_line.startswith("AGREEMENTS:"):
                current_section = "agreements"
            elif upper_line.startswith("CONFLICTS:"):
                current_section = "conflicts"
            elif upper_line.startswith("NEXT ACTIONS:"):
                current_section = "next_actions"
            elif current_section == "reasoning":
                result.reasoning = f"{result.reasoning or ''} {line}".strip()
            elif current_section == "agreements":
                result.agreements.append(self._strip_list_marker(line))
            elif current_section == "conflicts":
                result.conflicts.append(self._strip_list_marker(line))
            elif current_section == "next_actions":
                result.next_actions.append(self._strip_list_marker(line))

        if not result.recommendation:
            result.recommendation = self._majority_stance(result.arguments)
        if not result.confidence_score:
            result.confidence_score = 6
        if not result.reasoning:
            result.reasoning = "Recommendation synthesized from the persona debate."

    def _fallback_synthesis(self, result: DebateResult, exc: Exception):
        result.recommendation = self._majority_stance(result.arguments)
        result.confidence_score = 5
        result.reasoning = (
            "The debate completed, but automatic synthesis failed. "
            f"Using the majority persona stance as a fallback. Details: {exc}"
        )
        result.agreements = ["Personas reviewed the signal from multiple strategic angles."]
        result.conflicts = ["A full facilitator synthesis could not be generated."]
        result.next_actions = [
            "Review the persona arguments manually.",
            "Validate the strongest claims with market and technical evidence.",
            "Decide whether to rerun synthesis after resolving the model error.",
        ]

    def _majority_stance(self, arguments: list[DebateArgument]) -> str:
        allowed = {"BUILD", "INVEST", "MONITOR", "IGNORE"}
        stances = [
            argument.stance.upper()
            for argument in arguments
            if argument.stance.upper() in allowed
        ]
        if not stances:
            return "MONITOR"
        return Counter(stances).most_common(1)[0][0]

    def _parse_confidence(self, line: str) -> int:
        match = re.search(r"\d+", line)
        if not match:
            return 6
        return max(1, min(10, int(match.group(0))))

    def _strip_list_marker(self, line: str) -> str:
        return re.sub(r"^[-*\d.)\s]+", "", line).strip()

    def _serialize_signal(self, signal: MarketSignal) -> dict:
        return {
            "title": signal.title,
            "description": signal.description.strip(),
            "signal_type": signal.signal_type.value,
            "source": signal.source,
            "region": signal.region,
        }

    def _serialize_argument(self, argument: DebateArgument) -> dict:
        return {
            "persona_name": argument.persona_name,
            "persona_title": argument.persona_title,
            "argument": argument.argument,
            "stance": argument.stance,
            "round_number": argument.round_number,
        }

    def _serialize_result(self, result: DebateResult) -> dict:
        return {
            "signal": self._serialize_signal(result.signal),
            "arguments": [self._serialize_argument(arg) for arg in result.arguments],
            "conflicts": result.conflicts,
            "agreements": result.agreements,
            "recommendation": result.recommendation,
            "reasoning": result.reasoning,
            "next_actions": result.next_actions,
            "confidence_score": result.confidence_score,
        }
