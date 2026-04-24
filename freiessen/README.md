# Freiessen — Intelligent Market Signal Dashboard

A hackathon prototype for Viega product managers. It continuously collects market signals from public sources, scores them, and surfaces actionable recommendations — so the team can decide what to **Build**, **Invest in**, or **Ignore**.

---

## Idea

Product managers are flooded with noise: forum threads, patents, competitor launches, regulatory changes. This tool cuts through it by:

1. Pulling raw signals from HackerNews, Reddit (r/HVAC, r/plumbing), and simulated news/patent feeds
2. Scoring each signal on momentum, impact, novelty, and confidence
3. Mapping signals to three product use cases and surfacing a clear recommendation

---

## Stack

- **Next.js 16** (App Router) — frontend + API routes
- **PayloadCMS 3** — content management and database ORM
- **PostgreSQL** — persistent storage for signals and competitors
- **Tailwind CSS** — styling

---

## Data Model

### Signals

The core entity. Each signal represents a market event detected from a source.

| Field               | Description                                                                         |
| ------------------- | ----------------------------------------------------------------------------------- |
| `signal_type`       | `trend`, `weak_signal`, `disruption`, `emerging_tech`, `regulatory`, `market_shift` |
| `source`            | Where it came from (`hackernews`, `reddit`, `simulated_news`, etc.)                 |
| `title` / `summary` | What happened                                                                       |
| `entities`          | Companies, technologies, or topics mentioned                                        |
| `evidence_urls`     | Links to source material                                                            |
| `trend_metrics`     | Scores (0–100) for momentum, impact, novelty, confidence                            |

### Competitors

A registry of tracked companies. Used to associate incoming signals with known players in the market.

---

## Trend Metrics (Meaning + Calculation)

Every signal includes `trend_metrics` on a **0–100** scale:

- **Momentum** — “Is attention growing right now?”
- **Impact** — “How big could the market/business effect be?”
- **Novelty** — “How new vs. what we’ve already seen?”
- **Confidence** — “How trustworthy is the signal & its evidence?”

### Momentum (0–100)

**Meaning:** how fast this signal/topic is accelerating.

**How we calculate it (prototype):**

- **Recency-weighted** score (newer signals score higher)
- **Engagement boosts** if available (e.g., upvotes/comments from sources)
- **Repeat mentions** boost if similar signals appear across multiple sources

> In the hackathon prototype, many seed signals come with a preset momentum value.

### Impact (0–100)

**Meaning:** potential magnitude of consequences for product strategy.

**What increases impact:**

- Regulatory changes / mandates / compliance deadlines
- Competitor launches with meaningful capability improvements
- Strong customer pain points (install time, failure rates, corrosion, leakage)
- Large adoption shifts (e.g., heat pump penetration driving component demand)

**How we calculate it (prototype):**

- Baseline by `signal_type` (e.g., `regulatory` and `disruption` tend to start higher)
- Keyword/entity boosts (e.g., “mandate”, “launch”, “patent”, “adoption”, “deadline”)
- Clamped to 0–100

> In the hackathon prototype, many seed signals come with a preset impact value.

### Novelty (0–100)

**Meaning:** how different the signal is from existing signals.

**How we calculate it (prototype):**

- Compare the signal’s **entities + keywords** to previously stored signals
- High overlap → lower novelty; new entities/phrasing → higher novelty
- Clamped to 0–100

> In the hackathon prototype, many seed signals come with a preset novelty value.

### Confidence (0–100)

**Meaning:** how credible we think the signal is.

**What increases confidence:**

- High-quality sources (official releases, regulatory sites, patents)
- Multiple evidence URLs
- Specificity (dates, numbers, named organizations)

**How we calculate it (prototype):**

- Baseline by source type (e.g., patents/regulations higher than forum posts)
- - points per evidence URL (capped)
- - penalties for missing evidence or overly vague summaries
- Clamped to 0–100

> In the hackathon prototype, many seed signals come with a preset confidence value.

---

## Composite Score & Recommendation Logic

We combine the four metrics into a single score:

```txt
score = round( (momentum + impact + novelty + confidence) / 4 )
## Scoring & Recommendations

Each signal gets a composite score:

```

score = avg(momentum, impact, novelty, confidence)

````

| Score | Recommendation                             |
| ----- | ------------------------------------------ |
| ≥ 75  | 🟢 **Build** — high priority, act now      |
| 55–74 | 🟡 **Invest** — worth monitoring           |
| < 55  | 🔴 **Ignore** — low signal, not actionable |

---

## Dashboard Flow

The dashboard at `/dashboard` is the main interface:

1. **Signal Detection panel** — trigger a fresh crawl manually, either across all sources or for a specific keyword (with autocomplete suggestions)
2. **Use Case tabs** — filter signals by product context:
   - ⚔️ **Competitor Moves** — market shifts and disruptions
   - 📉 **Market Problems** — trends, regulatory changes, weak signals
   - 🔬 **Tech Scouting** — emerging technologies
3. **Recommendation summary** — counts of Build / Invest / Ignore for the active use case, clickable to filter the list
4. **Signal strength chart** — visual distribution of scores across the current signal set
5. **Signal list** — expandable cards showing title, score bar, entities, reasoning, and evidence links

---

## API Routes

| Route                      | Method | Purpose                                                                                                |
| -------------------------- | ------ | ------------------------------------------------------------------------------------------------------ |
| `/api/detect-signals`      | `POST` | Crawl sources and store new signals. Body: `{ mode: 'all' }` or `{ mode: 'keyword', keyword: string }` |
| `/api/keyword-suggestions` | `GET`  | Autocomplete suggestions for keyword search. Query: `?query=...`                                       |

---

## Seed Data

```bash
# Seed competitor registry
bun seed:competitors

# Seed signals (simulated news, patents, forum posts)
bun seed:signals
````

---

## Getting Started

```bash
cp .env.example .env
# fill in DATABASE_URL and PAYLOAD_SECRET

pnpm install
pnpm dev
```

Then open `http://localhost:3000/dashboard`.

To populate the admin panel and seed content, visit `/admin` first to create your account.
