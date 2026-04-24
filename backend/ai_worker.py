import asyncio
import os
import json
import psycopg2
from google import genai

# The new SDK automatically picks up the GEMINI_API_KEY environment variable
client = genai.Client()


def get_db_connection():
    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        database=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASS"),
    )


def init_db():
    conn = get_db_connection()
    with conn.cursor() as cur:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS signal_intelligence (
                id SERIAL PRIMARY KEY,
                signal_id VARCHAR UNIQUE REFERENCES market_signals(signal_id),
                
                josef_opinion TEXT,
                steffen_opinion TEXT,
                david_opinion TEXT,
                volkmar_opinion TEXT,
                nick_opinion TEXT,
                
                debate_summary TEXT,
                action_decision VARCHAR(50),
                strategic_reasoning TEXT,
                
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
    conn.commit()
    conn.close()
    print("AI Worker: Intelligence table verified.")


async def generate_persona_opinion(persona_name, persona_description, raw_text):
    """Phase 1: Fan-Out."""
    prompt = f"""
    You are {persona_name}, {persona_description}.
    Read this market signal: "{raw_text}"
    In exactly 2 sentences, state your strong opinion on this signal based on your persona's traits.
    """

    # New aio (async) syntax
    response = await client.aio.models.generate_content(
        model="gemini-2.5-flash", contents=prompt
    )
    return persona_name, response.text.strip()


async def synthesize_debate(raw_text, persona_opinions):
    """Phase 2: Fan-In."""
    opinions_text = "\n".join(
        [f"{name}: {opinion}" for name, opinion in persona_opinions.items()]
    )

    prompt = f"""
    You are the Lead Product Manager at Viega. 
    Analyze this raw market signal: "{raw_text}"
    
    Here is what your stakeholders think:
    {opinions_text}
    
    Synthesize this debate and output ONLY a valid JSON object with these exact keys:
    "debate_summary" (A 2-sentence summary of the agreements/conflicts)
    "action_decision" (Must be exactly one of: "Build", "Invest", "Ignore")
    "strategic_reasoning" (Why you chose this action, incorporating the stakeholder feedback)
    
    CRITICAL INSTRUCTION FOR 'IGNORE': 
    You must aggressively choose "Ignore" if the raw signal is an administrative forum post, moderation rules, spam, or entirely lacks actionable business value for a plumbing and piping manufacturer.
    """

    # New aio (async) syntax
    response = await client.aio.models.generate_content(
        model="gemini-2.5-flash", contents=prompt
    )

    json_str = response.text.strip().replace("```json", "").replace("```", "")
    return json.loads(json_str)


async def process_unprocessed_signals():
    conn = get_db_connection()

    with conn.cursor() as cur:
        cur.execute("""
            SELECT signal_id, raw_text FROM market_signals 
            WHERE signal_id NOT IN (SELECT signal_id FROM signal_intelligence)
            LIMIT 1;
        """)
        row = cur.fetchone()

    if not row:
        print("No new signals to process.")
        conn.close()
        return

    signal_id, raw_text = row
    print(f"Processing Signal: {signal_id}...")

    personas = [
        (
            "Josef",
            "the Loyal Traditionalist who values reliability, proven methods, and existing metallic systems",
        ),
        (
            "Steffen",
            "the Demanding Doer who wants fast, practical solutions that get the job done efficiently",
        ),
        (
            "David",
            "the Digital Innovator who pushes for smart-tech, automation, and software integration",
        ),
        (
            "Volkmar",
            "the Cautious Follower who fears risk, worries about costs, and waits for market validation",
        ),
        (
            "Nick",
            "the Sustainable Companion who prioritizes green materials, lead-free tech, and energy efficiency",
        ),
    ]

    tasks = [generate_persona_opinion(name, desc, raw_text) for name, desc in personas]
    results = await asyncio.gather(*tasks)

    persona_opinions = {name: opinion for name, opinion in results}
    print("Personas have spoken. Synthesizing debate...")

    pm_decision = await synthesize_debate(raw_text, persona_opinions)

    with conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO signal_intelligence 
            (signal_id, josef_opinion, steffen_opinion, david_opinion, volkmar_opinion, nick_opinion, 
             debate_summary, action_decision, strategic_reasoning)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """,
            (
                signal_id,
                persona_opinions["Josef"],
                persona_opinions["Steffen"],
                persona_opinions["David"],
                persona_opinions["Volkmar"],
                persona_opinions["Nick"],
                pm_decision["debate_summary"],
                pm_decision["action_decision"],
                pm_decision["strategic_reasoning"],
            ),
        )
    conn.commit()
    conn.close()

    print(
        f"✅ Intelligence saved for {signal_id}! Action: {pm_decision['action_decision']}"
    )


if __name__ == "__main__":
    init_db()
    asyncio.run(process_unprocessed_signals())
