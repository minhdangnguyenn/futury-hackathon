import asyncio
import os
import requests
import feedparser
import trafilatura
import psycopg2
from psycopg2.extras import execute_values
from datetime import datetime, timezone
import time


# --- PREPROCESSING ---
def clean_text(text, max_chars=3000):
    if not text:
        return ""
    clean = " ".join(text.split())
    return clean[:max_chars] + "..." if len(clean) > max_chars else clean


def fetch_article_text(url):
    try:
        downloaded = trafilatura.fetch_url(url)
        if downloaded:
            return clean_text(trafilatura.extract(downloaded))
    except Exception:
        pass
    return "Content extraction failed."


# --- DATABASE LOGIC ---
def get_db_connection():
    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        database=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASS"),
    )


def init_db():
    """Self-healing setup for the scraper."""
    conn = get_db_connection()
    with conn.cursor() as cur:
        # 1. Ensure the raw signals table exists
        cur.execute("""
            CREATE TABLE IF NOT EXISTS market_signals (
                id SERIAL PRIMARY KEY,
                signal_id VARCHAR UNIQUE,
                source_type VARCHAR,
                source_name VARCHAR,
                raw_text TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # 2. Ensure the configurable sources table exists
        cur.execute("""
            CREATE TABLE IF NOT EXISTS scraping_sources (
                id SERIAL PRIMARY KEY,
                source_name VARCHAR(100) UNIQUE,
                url TEXT,
                source_type VARCHAR(50), 
                strategy VARCHAR(50),
                is_active BOOLEAN DEFAULT TRUE
            );
        """)

        # 3. Seed the database with our default scraping targets
        cur.execute("""
            INSERT INTO scraping_sources (source_name, url, source_type, strategy) VALUES
            ('r/Plumbing', 'https://www.reddit.com/r/Plumbing/hot.json?limit=5', 'forum_discussion', 'reddit_json'),
            ('Geberit & NIBCO News', 'https://news.google.com/rss/search?q=Geberit+OR+NIBCO+plumbing&hl=en-US&gl=US&ceid=US:en', 'competitor_news', 'google_news_rss'),
            ('Competitor Patents', 'https://news.google.com/rss/search?q=patent+(Geberit+OR+NIBCO+OR+Viega)&hl=en-US&gl=US&ceid=US:en', 'patent_filing', 'google_news_rss')
            ON CONFLICT (source_name) DO NOTHING;
        """)
    conn.commit()
    conn.close()
    print("Scraper: Database tables verified and seeded.")


def save_to_db(signals):
    """Thread-safe DB insert. Each thread opens its own connection."""
    if not signals:
        return

    conn = get_db_connection()
    try:
        insert_query = """
            INSERT INTO market_signals (signal_id, source_type, source_name, raw_text, published_at)
            VALUES %s
            ON CONFLICT (signal_id) DO NOTHING;
        """
        # Added s['published_at'] to the tuple
        values = [
            (
                s["signal_id"],
                s["source_type"],
                s["source_name"],
                s["raw_text"],
                s["published_at"],
            )
            for s in signals
        ]

        with conn.cursor() as cur:
            execute_values(cur, insert_query, values)
        conn.commit()
        print(
            f"✅ Saved {len(signals)} signals from {signals[0]['source_name']} to DB."
        )
    except Exception as e:
        print(f"Database insertion failed for {signals[0]['source_name']}: {e}")
    finally:
        conn.close()


# --- STRATEGIES ---
def execute_reddit_strategy(source_name, url, source_type):
    """Strategy for parsing dynamic Reddit JSON endpoints."""
    headers = {"User-Agent": "ViegaHackathonBot/3.0"}

    # Dynamically extract subreddit from the config URL
    # e.g., "https://www.reddit.com/r/HVAC/hot.json" -> "HVAC"
    try:
        subreddit = url.split("/r/")[1].split("/")[0]
    except IndexError:
        print(f"Invalid Reddit URL format: {url}")
        return []

    try:
        response = requests.get(url, headers=headers)
        if response.status_code != 200:
            return []

        signals = []
        for post in response.json().get("data", {}).get("children", []):
            data = post["data"]
            if data.get("stickied"):
                continue

            post_id = data["id"]
            title = data["title"]
            body = data.get("selftext", "")

            # Extract Reddit's Unix timestamp
            created_utc = data.get("created_utc")
            if created_utc:
                published_at = datetime.fromtimestamp(created_utc, tz=timezone.utc)
            else:
                published_at = datetime.now(timezone.utc)

            # Dynamic sub-request for comments
            comments_url = (
                f"https://www.reddit.com/r/{subreddit}/comments/{post_id}.json?limit=3"
            )
            try:
                c_resp = requests.get(comments_url, headers=headers).json()
                c_data = c_resp[1]["data"]["children"]
                comments = " | ".join(
                    [c["data"].get("body", "") for c in c_data if "body" in c["data"]]
                )
            except:
                comments = "No comments."

            full_context = f"DATE: {published_at.strftime('%Y-%m-%d')}\nTITLE: {title}\nPOST: {body}\nTOP COMMENTS: {comments}"
            signals.append(
                {
                    "signal_id": f"reddit_{post_id}",
                    "source_type": source_type,
                    "source_name": source_name,
                    "raw_text": clean_text(full_context),
                    "published_at": published_at,  # <--- New field
                }
            )

        # Thread-safe save
        save_to_db(signals)
        return signals
    except Exception as e:
        print(f"Reddit Strategy Failed ({source_name}): {e}")
        return []


def execute_rss_strategy(source_name, url, source_type):
    """Strategy for parsing RSS feeds with Trafilatura deep-extraction."""
    try:
        feed = feedparser.parse(url)
        signals = []
        for entry in feed.entries[:3]:
            article_text = fetch_article_text(entry.link)

            # Extract RSS time struct and convert to datetime
            parsed_time = entry.get("published_parsed")
            if parsed_time:
                published_at = datetime.fromtimestamp(
                    time.mktime(parsed_time), tz=timezone.utc
                )
            else:
                published_at = datetime.now(timezone.utc)

            full_context = f"DATE: {published_at.strftime('%Y-%m-%d')}\nTITLE: {entry.title}\nCONTENT: {article_text}"

            signals.append(
                {
                    "signal_id": f"news_{entry.id}",
                    "source_type": source_type,
                    "source_name": source_name,
                    "raw_text": clean_text(full_context),
                    "published_at": published_at,  # <--- New field
                }
            )

        # Thread-safe save
        save_to_db(signals)
        return signals
    except Exception as e:
        print(f"RSS Strategy Failed ({source_name}): {e}")
        return []


# --- ROUTER & ORCHESTRATOR ---
def route_strategy(source_config):
    """Routes the DB config to the correct python function."""
    _, name, url, source_type, strategy, _ = source_config
    print(f"Starting thread for {name}...")

    if strategy == "reddit_json":
        return execute_reddit_strategy(name, url, source_type)
    elif strategy == "google_news_rss":
        return execute_rss_strategy(name, url, source_type)
    else:
        print(f"Unknown strategy: {strategy}")
        return []


async def main():
    # 1. Initialize tables and seed default data
    init_db()

    conn = get_db_connection()
    # 2. Fetch active configurations from the database
    with conn.cursor() as cur:
        cur.execute(
            "SELECT id, source_name, url, source_type, strategy, is_active FROM scraping_sources WHERE is_active = TRUE;"
        )
        active_sources = cur.fetchall()
    conn.close()

    if not active_sources:
        print("No active scraping sources found in DB.")
        return

    print(
        f"Found {len(active_sources)} active providers. Executing parallel threads..."
    )

    # 3. FAN-OUT: Run all blocking web scrapers concurrently
    tasks = [asyncio.to_thread(route_strategy, source) for source in active_sources]

    await asyncio.gather(*tasks)
    print("Data extraction and insertion complete!")


if __name__ == "__main__":
    asyncio.run(main())
