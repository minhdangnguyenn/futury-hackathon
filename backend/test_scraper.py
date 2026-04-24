import requests
import feedparser
import json

def scrape_reddit_market_signals():
    url = "https://www.reddit.com/r/Plumbing/hot.json?limit=10"
    # Reddit requires a custom User-Agent to prevent blocking
    headers = {"User-Agent": "ViegaHackathonBot/1.0"}
    
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        print(f"Reddit API Error: {response.status_code}")
        return []
        
    posts = response.json()['data']['children']
    signals = []
    
    for post in posts:
        data = post['data']
        # Filter for actual text discussions, skip memes/images
        if data.get('selftext'):
            signals.append({
                "signal_id": f"reddit_{data['id']}",
                "source_type": "forum_discussion",
                "source_name": "r/Plumbing",
                "raw_text": f"Title: {data['title']} | Content: {data['selftext'][:200]}...", # Trimmed for console readability
            })
    return signals

def scrape_competitor_news():
    url = "https://news.google.com/rss/search?q=Geberit+OR+NIBCO+plumbing&hl=en-US&gl=US&ceid=US:en"
    feed = feedparser.parse(url)
    
    signals = []
    for entry in feed.entries[:5]: # Grab top 5 news items
        signals.append({
            "signal_id": f"news_{entry.id}",
            "source_type": "competitor_news",
            "source_name": entry.source.title if 'source' in entry else "News Outlet",
            "raw_text": f"Title: {entry.title} | Link: {entry.link}",
        })
    return signals

if __name__ == "__main__":
    print("Fetching Reddit Data...")
    market_data = scrape_reddit_market_signals()
    
    print("\n" + "="*50)
    print("🔥 REDDIT MARKET SIGNALS (SANITY CHECK) 🔥")
    print("="*50)
    # json.dumps with indent=2 makes it highly readable in the terminal
    print(json.dumps(market_data, indent=2))
    
    print("\nFetching News Data...")
    competitor_data = scrape_competitor_news()
    
    print("\n" + "="*50)
    print("📰 COMPETITOR NEWS SIGNALS (SANITY CHECK) 📰")
    print("="*50)
    print(json.dumps(competitor_data, indent=2))
    
    print("\n" + "="*50)
    print(f"Total signals scraped: {len(market_data) + len(competitor_data)}")
    print("If this looks good, you are clear to add the database logic!")
