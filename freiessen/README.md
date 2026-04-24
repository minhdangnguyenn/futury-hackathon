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

A hackathon prototype for Viega product managers. It continuously collects market signals from public sources, scores them, and surfaces actionable recommendations — so the team can decide what to **Build**, **Invest in**, or **Ignore**.

---

## Idea

Product managers are flooded with noise: forum threads, patents, competitor launches, regulatory changes. This tool cuts through it by:

1. Pulling raw signals from HackerNews, Reddit (r/HACV, r/plumbing), and simulated news/patent feeds
2. Scoring each signal on **freshness**, **evidence quality**, and **relevance**
3. Mapping signals to product use cases and surfacing a clear recommendation

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
| `metrics`           | Scores (0–100) for `freshness`, `evidenceQuality`, `relevance`                      |

### Competitors

A registry of tracked companies. Used to associate incoming signals with known players in the market.

---

## Signal Metrics (Meaning + Calculation)

Every signal can be evaluated on a **0–100** scale across three metrics:

- **Freshness** — “How recent is this signal?”
- **Evidence Quality** — “How credible / well-supported is it?”
- **Relevance** — “How relevant is it to our competitors, keywords, and active use case?”

> Implementation lives in `src/lib/signals/scoring.ts` (`getFreshness`, `getEvidenceQuality`, `getRelevance`, `getMetrics`).

---

### Freshness (0–100)

**Meaning:** how recent the signal is.

**How we calculate it (prototype):**

- Uses `createdAt` (fallback `publishedAt` if present)
- Bucketed scoring:
  - 0–1 day: **100**
  - 2–7 days: **80**
  - 8–30 days: **50**
  - > 30 days: **20**
- If dates are missing: defaults to **50**

---

### Evidence Quality (0–100)

**Meaning:** how trustworthy the signal is based on source type and supporting links.

**How we calculate it (prototype):**

- Baseline by source string:
  - `patent` → higher
  - `regulat*` → higher
  - `news` / `press` / `release` → medium-high
  - `forum` / `social` / `reddit` → lower
- Evidence bonus: **+5 per evidence URL** (capped at **+20**)
- Clamped to **0–100**

---

### Relevance (0–100)

**Meaning:** how relevant the signal is to the selected product context.

**How we calculate it (prototype):**

- **+30** if a tracked competitor is mentioned (signal `entities` contains competitor name)
- Keyword matching in `title` + `summary`:
  - **+10 per keyword hit**, capped at **+40**
- **+20** if `signal_type` is included in the active use case’s `types`
- Clamped to **0–100**

Keywords default to a built-in list (e.g., `valve`, `press fitting`, `hydronic`, `leak`, `corrosion`, `bim`, `district heating`, `heat pump`, `retrofit`), but can be overridden when calling scoring helpers.

---

## Composite Score & Recommendation Logic

We combine the three metrics into a single score:

````txt
score = round( (freshness + evidenceQuality + relevance) / 3 )


---

## Composite Score & Recommendation Logic

We combine the four metrics into a single score:

```txt
score = round( (momentum + impact + novelty + confidence) / 4 )
## Scoring & Recommendations

Each signal gets a composite score:

````

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
