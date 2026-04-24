FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY scraper.py .
COPY ai_worker.py .
COPY gemini_cleaner.py .
COPY .env .
