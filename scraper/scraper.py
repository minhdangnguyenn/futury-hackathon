import requests
import feedparser
import psycopg2
from psycopg2.extras import execute_values
import os
import time


# --- Database Setup ---
def get_db_connection():
    # Retry logic because the scraper might boot up milliseconds before Postgres is ready
    retries = 5
    while retries > 0:
        try:
            conn = psycopg2.connect(
                host=os.getenv("DB_HOST", "localhost"),
                database=os.getenv("DB_NAME", "signalforge"),
                user=os.getenv("DB_USER", "viega_user"),
                password=os.getenv("DB_PASS", "vibe_password"),
            )
            return conn
        except psycopg2.OperationalError:
            print("Waiting for database...")
            time.sleep(2)
            retries -= 1
    raise Exception("Could not connect to the database")


def init_db(conn):
    with conn.cursor() as cur:
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
    conn.commit()


def save_to_db(conn, signals):
    if not signals:
        return

    # We use execute_values for fast batch insertion
    insert_query = """
        INSERT INTO market_signals (signal_id, source_type, source_name, raw_text)
        VALUES %s
        ON CONFLICT (signal_id) DO NOTHING;
    """

    values = [
        (s["signal_id"], s["source_type"], s["source_name"], s["raw_text"])
        for s in signals
    ]

    with conn.cursor() as cur:
        execute_values(cur, insert_query, values)
    conn.commit()
    print(f"Inserted batch of {len(signals)} signals into Postgres.")


# --- Scraping Logic (Same as before) ---
def scrape_reddit_market_signals():
    url = "https://www.reddit.com/r/Plumbing/hot.json?limit=10"
    headers = {"User-Agent": "ViegaHackathonBot/1.0"}
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        return []

    posts = response.json()["data"]["children"]
    signals = []
    for post in posts:
        data = post["data"]
        if data.get("selftext"):
            signals.append(
                {
                    "signal_id": f"reddit_{data['id']}",
                    "source_type": "forum_discussion",
                    "source_name": "r/Plumbing",
                    "raw_text": f"Title: {data['title']} | Content: {data['selftext'][:500]}...",
                }
            )
    return signals


def scrape_competitor_news():
    url = "https://news.google.com/rss/search?q=Geberit+OR+NIBCO+plumbing&hl=en-US&gl=US&ceid=US:en"
    feed = feedparser.parse(url)
    signals = []
    for entry in feed.entries[:5]:
        signals.append(
            {
                "signal_id": f"news_{entry.id}",
                "source_type": "competitor_news",
                "source_name": entry.source.title
                if "source" in entry
                else "News Outlet",
                "raw_text": f"Title: {entry.title} | Link: {entry.link}",
            }
        )
    return signals


# --- Main Execution ---
if __name__ == "__main__":
    print("Connecting to DB...")
    conn = get_db_connection()
    init_db(conn)

    print("Scraping Reddit...")
    market_data = scrape_reddit_market_signals()
    save_to_db(conn, market_data)

    print("Scraping News...")
    competitor_data = scrape_competitor_news()
    save_to_db(conn, competitor_data)

    conn.close()
    print("Vibe check passed. Data is secured.")
