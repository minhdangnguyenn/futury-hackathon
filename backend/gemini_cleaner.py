import asyncio
import hashlib
import json
import os
import time
from datetime import date, datetime
from typing import Any

import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv
from google import genai


BASE_DIR = os.path.dirname(__file__)
OUTPUT_FILE = os.path.join(BASE_DIR, "clean_data.json")
DEFAULT_MODEL = os.getenv("GEMINI_MODEL", "gemini-3-pro-preview")


load_dotenv(os.path.join(BASE_DIR, ".env"), override=False)


EXTRACTION_SCHEMA = {
    "type": "object",
    "properties": {
        "url": {
            "type": ["string", "null"],
            "description": "Source URL mentioned in the text, if any.",
        },
        "date": {
            "type": ["string", "null"],
            "format": "date",
            "description": "Publication date in YYYY-MM-DD format, if present.",
        },
        "author": {
            "type": ["string", "null"],
            "description": "Author, publisher, or organisation responsible for the text.",
        },
        "evidence_quality": {
            "type": ["string", "null"],
            "enum": ["high", "medium", "low", None],
            "description": "high for patents or papers, medium for news, low for forums or social posts.",
        },
        "relevance_score": {
            "type": ["number", "null"],
            "minimum": 0,
            "maximum": 1,
            "description": "Relevance for plumbing, piping, building systems, or close competitors.",
        },
        "sentiment": {
            "type": ["number", "null"],
            "minimum": -1,
            "maximum": 1,
            "description": "Overall sentiment of the text.",
        },
        "language": {
            "type": ["string", "null"],
            "description": "ISO 639-1 language code such as en or de.",
        },
    },
    "required": [
        "url",
        "date",
        "author",
        "evidence_quality",
        "relevance_score",
        "sentiment",
        "language",
    ],
    "additionalProperties": False,
}


EXTRACTION_PROMPT = """\
You are a data extraction assistant for market intelligence.

Read the market signal text and extract metadata for downstream analytics.
If a value is not present or cannot be inferred confidently, return null.
Keep scores conservative and do not invent facts.

Market signal text:
\"\"\"
{raw_text}
\"\"\"
"""


def get_client() -> genai.Client:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not set.")
    return genai.Client(api_key=api_key)


def get_db_connection():
    retries = int(os.getenv("DB_CONNECT_RETRIES", "5"))
    delay_seconds = float(os.getenv("DB_CONNECT_DELAY_SECONDS", "2"))

    while retries > 0:
        try:
            return psycopg2.connect(
                host=os.getenv("DB_HOST", "localhost"),
                port=os.getenv("DB_PORT", "5432"),
                database=os.getenv("DB_NAME", "freiessen"),
                user=os.getenv("DB_USER", "postgres"),
                password=os.getenv("DB_PASS"),
            )
        except psycopg2.OperationalError:
            retries -= 1
            if retries == 0:
                break
            print("Waiting for database...")
            time.sleep(delay_seconds)

    raise RuntimeError("Could not connect to the database.")


def fetch_all_signals(conn):
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT signal_id, source_type, source_name, raw_text, created_at
            FROM market_signals
            WHERE raw_text IS NOT NULL AND btrim(raw_text) <> ''
            ORDER BY created_at DESC;
            """
        )
        rows = cur.fetchall()

    return [
        {
            "signal_id": row[0],
            "source_type": row[1],
            "source_name": row[2],
            "raw_text": row[3],
            "created_at": row[4],
        }
        for row in rows
    ]


def init_dashboard_table(conn):
    with conn.cursor() as cur:
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS dashboard_data (
                signal_id VARCHAR PRIMARY KEY,
                source_type VARCHAR,
                source_url TEXT,
                source_date DATE,
                source_author TEXT,
                evidence_quality VARCHAR,
                relevance_score DOUBLE PRECISION,
                freshness_score DOUBLE PRECISION,
                sentiment DOUBLE PRECISION,
                language VARCHAR(10)
            );
            """
        )
    conn.commit()


def save_dashboard_data(conn, clean_records: list[dict[str, Any]]):
    if not clean_records:
        return

    values = [
        (
            record["signal_id"],
            record["source"]["type"],
            record["source"]["url"],
            record["source"]["date"],
            record["source"]["author"],
            record["metadata"]["evidence_quality"],
            record["metadata"]["relevance_score"],
            record["metadata"]["freshness_score"],
            record["metadata"]["sentiment"],
            record["metadata"]["language"],
        )
        for record in clean_records
    ]

    with conn.cursor() as cur:
        execute_values(
            cur,
            """
            INSERT INTO dashboard_data (
                signal_id,
                source_type,
                source_url,
                source_date,
                source_author,
                evidence_quality,
                relevance_score,
                freshness_score,
                sentiment,
                language
            )
            VALUES %s
            ON CONFLICT (signal_id) DO UPDATE SET
                source_type = EXCLUDED.source_type,
                source_url = EXCLUDED.source_url,
                source_date = EXCLUDED.source_date,
                source_author = EXCLUDED.source_author,
                evidence_quality = EXCLUDED.evidence_quality,
                relevance_score = EXCLUDED.relevance_score,
                freshness_score = EXCLUDED.freshness_score,
                sentiment = EXCLUDED.sentiment,
                language = EXCLUDED.language;
            """,
            values,
        )
    conn.commit()


def clamp_number(value: Any, minimum: float, maximum: float, default: float) -> float:
    try:
        numeric_value = float(value)
    except (TypeError, ValueError):
        return default
    return round(min(max(numeric_value, minimum), maximum), 4)


def clean_snippet(raw_text: str, max_chars: int = 200) -> str:
    compact = " ".join((raw_text or "").split())
    if len(compact) <= max_chars:
        return compact
    return compact[: max_chars - 3].rstrip() + "..."


def normalize_date(value: Any) -> str | None:
    if not value:
        return None

    if isinstance(value, date):
        return value.isoformat()

    text = str(value).strip()
    if not text:
        return None

    for parser in ("%Y-%m-%d", "%Y/%m/%d", "%d.%m.%Y", "%Y-%m-%dT%H:%M:%S"):
        try:
            return datetime.strptime(text, parser).date().isoformat()
        except ValueError:
            continue

    try:
        return datetime.fromisoformat(text.replace("Z", "+00:00")).date().isoformat()
    except ValueError:
        return None


def compute_freshness(signal_date_value: Any, created_at: Any) -> float:
    ref_date = normalize_date(signal_date_value)
    if ref_date:
        parsed_date = datetime.strptime(ref_date, "%Y-%m-%d").date()
    elif created_at:
        parsed_date = created_at.date() if hasattr(created_at, "date") else created_at
    else:
        return 0.5

    days_old = (date.today() - parsed_date).days
    freshness = 1.0 - (days_old / 365)
    return round(min(max(freshness, 0.0), 1.0), 4)


def build_clean_record(row: dict[str, Any], extracted: dict[str, Any]) -> dict[str, Any]:
    normalized_date = normalize_date(extracted.get("date"))
    evidence_quality = extracted.get("evidence_quality")
    if evidence_quality not in {"high", "medium", "low"}:
        evidence_quality = "low"

    source_id = row.get("signal_id") or hashlib.sha256(
        row["raw_text"].encode("utf-8")
    ).hexdigest()

    return {
        "signal_id": source_id,
        "source": {
            "type": row.get("source_type"),
            "url": extracted.get("url"),
            "date": normalized_date,
            "author": extracted.get("author"),
        },
        "metadata": {
            "evidence_quality": evidence_quality,
            "relevance_score": clamp_number(
                extracted.get("relevance_score"), 0.0, 1.0, 0.0
            ),
            "freshness_score": compute_freshness(normalized_date, row.get("created_at")),
            "sentiment": clamp_number(extracted.get("sentiment"), -1.0, 1.0, 0.0),
            "language": extracted.get("language"),
        },
        "extracted_signals": {
            "raw_text_snippet": clean_snippet(row.get("raw_text", "")),
        },
    }


async def extract_with_gemini(
    client: genai.Client,
    row: dict[str, Any],
    semaphore: asyncio.Semaphore,
    model_name: str,
) -> dict[str, Any]:
    async with semaphore:
        prompt = EXTRACTION_PROMPT.format(raw_text=row["raw_text"])

        try:
            response = await client.aio.models.generate_content(
                model=model_name,
                contents=prompt,
                config={
                    "response_mime_type": "application/json",
                    "response_json_schema": EXTRACTION_SCHEMA,
                },
            )
            extracted = json.loads(response.text)
        except Exception as exc:
            print(
                f"  [WARN] Gemini extraction failed for {row['signal_id']}: {exc}. Using defaults."
            )
            extracted = {
                "url": None,
                "date": None,
                "author": None,
                "evidence_quality": "low",
                "relevance_score": 0.0,
                "sentiment": 0.0,
                "language": None,
            }

        clean_record = build_clean_record(row, extracted)
        print(
            "  [OK] "
            f"{row['signal_id']} -> "
            f"quality={clean_record['metadata']['evidence_quality']}, "
            f"freshness={clean_record['metadata']['freshness_score']}"
        )
        return clean_record


async def run():
    print("Connecting to database...")
    conn = get_db_connection()
    try:
        init_dashboard_table(conn)
        rows = fetch_all_signals(conn)
    finally:
        conn.close()

    if not rows:
        print("No signals found in market_signals table.")
        with open(OUTPUT_FILE, "w", encoding="utf-8") as file_handle:
            json.dump([], file_handle, indent=2, ensure_ascii=False)
        return

    model_name = os.getenv("GEMINI_MODEL", DEFAULT_MODEL)
    concurrency = max(1, int(os.getenv("GEMINI_CONCURRENCY", "3")))

    print(
        f"Found {len(rows)} signal(s). Sending to Gemini model '{model_name}' with concurrency={concurrency}..."
    )

    client = get_client()
    semaphore = asyncio.Semaphore(concurrency)
    tasks = [
        extract_with_gemini(client, row, semaphore, model_name)
        for row in rows
    ]
    clean_records = await asyncio.gather(*tasks)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as file_handle:
        json.dump(clean_records, file_handle, indent=2, ensure_ascii=False)

    conn = get_db_connection()
    try:
        init_dashboard_table(conn)
        save_dashboard_data(conn, clean_records)
    finally:
        conn.close()

    print(
        f"Done. {len(clean_records)} signal(s) written to {OUTPUT_FILE} and synced to dashboard_data."
    )


if __name__ == "__main__":
    asyncio.run(run())
