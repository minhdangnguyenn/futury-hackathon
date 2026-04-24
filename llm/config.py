import os
from dotenv import load_dotenv

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY not set in .env file")

MODEL_NAME = "gemini-3.1-pro-preview"
MAX_DEBATE_ROUNDS = 2
TEMPERATURE = 0.7

PERSONAS = {
    "david": {
        "name": "David",
        "title": "Digital Innovator",
        "age": 32,
        "emoji": "💻",
        "color": "\033[94m",
    },
    "josef": {
        "name": "Josef",
        "title": "Loyal Traditionalist",
        "age": 58,
        "emoji": "🔧",
        "color": "\033[93m",
    },
    "steffen": {
        "name": "Steffen",
        "title": "Demanding Doer",
        "age": 45,
        "emoji": "⚡",
        "color": "\033[91m",
    },
    "volkmar": {
        "name": "Volkmar",
        "title": "Cautious Follower",
        "age": 52,
        "emoji": "📊",
        "color": "\033[92m",
    },
    "nick": {
        "name": "Nick",
        "title": "Sustainable Companion",
        "age": 38,
        "emoji": "🌱",
        "color": "\033[96m",
    }
}
