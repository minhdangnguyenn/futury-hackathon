#!/usr/bin/env python3
"""Run prompt_product.md against the Google AI Studio Gemini API.

Install:
    pip install -U google-genai

You can provide the API key with --api-key or by setting GEMINI_API_KEY
or GOOGLE_API_KEY.

Examples:
    python3 google_ai_studio_product_extractor.py --text "Page URL: https://example.com\nPage content: ..."
    python3 google_ai_studio_product_extractor.py --input-file page.txt
    cat page.txt | python3 google_ai_studio_product_extractor.py
"""

from __future__ import annotations

import argparse
import getpass
import json
import os
import sys
from pathlib import Path


DEFAULT_API_KEY = os.getenv("GEMINI_API_KEY", os.getenv("GOOGLE_API_KEY"))
DEFAULT_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
DEFAULT_PROMPT_FILE = Path(__file__).resolve().with_name("prompt_product.md")

RESPONSE_JSON_SCHEMA = {
    "type": "object",
    "properties": {
        "page_summary": {
            "type": "string",
            "description": "A concise 1-3 sentence summary of the page.",
        },
        "products": {
            "type": "array",
            "description": "Products that the page clearly presents as new, newly launched, newly announced, newly released, newly added, or newly featured.",
            "items": {
                "type": "object",
                "properties": {
                    "product_title": {
                        "type": "string",
                        "description": "The product title exactly as supported by the page content.",
                    },
                    "url": {
                        "type": "string",
                        "description": "The direct product page URL, or an empty string if unavailable.",
                    },
                    "description": {
                        "type": "string",
                        "description": "A short factual description of the product.",
                    },
                },
                "required": ["product_title", "url", "description"],
                "propertyOrdering": ["product_title", "url", "description"],
                "additionalProperties": False,
            },
        },
    },
    "required": ["page_summary", "products"],
    "propertyOrdering": ["page_summary", "products"],
    "additionalProperties": False,
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Send input text to Google AI Studio using prompt_product.md as the system prompt."
    )
    parser.add_argument(
        "--api-key",
        default=DEFAULT_API_KEY,
        help="Gemini API key. Defaults to GEMINI_API_KEY or GOOGLE_API_KEY.",
    )
    parser.add_argument(
        "--model",
        default=DEFAULT_MODEL,
        help=f"Gemini model name. Defaults to GEMINI_MODEL or '{DEFAULT_MODEL}'.",
    )
    parser.add_argument(
        "--prompt-file",
        default=str(DEFAULT_PROMPT_FILE),
        help=f"Path to the system prompt file. Defaults to {DEFAULT_PROMPT_FILE.name}.",
    )
    input_group = parser.add_mutually_exclusive_group()
    input_group.add_argument("--text", help="Input text to send as the user prompt.")
    input_group.add_argument("--input-file", help="Read the input text from a file.")
    parser.add_argument(
        "--raw",
        action="store_true",
        help="Print the raw model output instead of pretty-printing JSON when possible.",
    )
    return parser.parse_args()


def prompt_for_api_key(api_key: str | None) -> str:
    if api_key:
        return api_key
    if sys.stdin.isatty():
        api_key = getpass.getpass("Gemini API key: ").strip()
    if not api_key:
        raise SystemExit(
            "Missing API key. Pass --api-key or set GEMINI_API_KEY / GOOGLE_API_KEY."
        )
    return api_key


def load_text(args: argparse.Namespace) -> str:
    if args.text is not None:
        text = args.text
    elif args.input_file:
        text = Path(args.input_file).read_text(encoding="utf-8")
    elif not sys.stdin.isatty():
        text = sys.stdin.read()
    else:
        print(
            "Paste the input text to send to Google AI Studio, then press Ctrl-D when finished.",
            file=sys.stderr,
        )
        text = sys.stdin.read()

    if not text.strip():
        raise SystemExit("Input text is empty. Use --text, --input-file, or pipe text on stdin.")
    return text


def load_system_prompt(prompt_file: str) -> str:
    path = Path(prompt_file)
    if not path.exists():
        raise SystemExit(f"Prompt file not found: {path}")
    prompt = path.read_text(encoding="utf-8").strip()
    if not prompt:
        raise SystemExit(f"Prompt file is empty: {path}")
    return prompt


def strip_code_fences(text: str) -> str:
    stripped = text.strip()
    if stripped.startswith("```") and stripped.endswith("```"):
        lines = stripped.splitlines()
        if len(lines) >= 3:
            return "\n".join(lines[1:-1]).strip()
    return stripped


def create_client(api_key: str):
    try:
        from google import genai
    except ImportError as exc:
        raise SystemExit(
            "Missing dependency: install it with 'pip install -U google-genai'."
        ) from exc

    return genai.Client(api_key=api_key)


def generate_output(
    *,
    api_key: str,
    model: str,
    system_prompt: str,
    input_text: str,
):
    try:
        from google.genai import types
    except ImportError as exc:
        raise SystemExit(
            "Missing dependency: install it with 'pip install -U google-genai'."
        ) from exc

    client = create_client(api_key)
    response = client.models.generate_content(
        model=model,
        contents=input_text,
        config=types.GenerateContentConfig(
            system_instruction=system_prompt,
            temperature=0,
            response_mime_type="application/json",
            response_json_schema=RESPONSE_JSON_SCHEMA,
        ),
    )
    return response


def print_output(response, raw: bool) -> None:
    if not raw and getattr(response, "parsed", None) is not None:
        print(json.dumps(response.parsed, indent=2, ensure_ascii=False))
        return

    response_text = strip_code_fences((response.text or "").strip())
    if not response_text:
        raise SystemExit(
            "Google AI Studio returned an empty response. Check the API key, model access, and prompt/input."
        )

    if raw:
        print(response_text)
        return

    try:
        parsed = json.loads(response_text)
    except json.JSONDecodeError:
        print(response_text)
        return

    print(json.dumps(parsed, indent=2, ensure_ascii=False))


def main() -> None:
    args = parse_args()
    api_key = prompt_for_api_key(args.api_key)
    system_prompt = load_system_prompt(args.prompt_file)
    input_text = load_text(args)
    response = generate_output(
        api_key=api_key,
        model=args.model,
        system_prompt=system_prompt,
        input_text=input_text,
    )
    print_output(response, raw=args.raw)


if __name__ == "__main__":
    main()
