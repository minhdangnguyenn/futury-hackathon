import { getPayload } from 'payload'
import config from '@payload-config'
import { NextResponse } from 'next/server'

// ── Scoring logic ──────────────────────────────────────────────────
function scoreFromHN(hit: any) {
  return {
    momentum: Math.min(100, hit.points ?? 0),
    impact: Math.min(100, (hit.num_comments ?? 0) * 3),
    novelty: 75,
    confidence: 55,
  }
}

function scoreFromReddit(post: any) {
  const data = post.data
  return {
    momentum: Math.min(100, data.score ?? 0),
    impact: Math.min(100, (data.num_comments ?? 0) * 2),
    novelty: 60,
    confidence: 50,
  }
}

// ── Categories to scan ─────────────────────────────────────────────
const CATEGORIES = [
  {
    label: 'Heat Pumps & HVAC',
    hnQuery: 'heat+pump+HVAC+valve',
    redditQuery: 'heat pump valve HVAC',
    subreddit: 'HVAC+plumbing',
  },
  {
    label: 'Pipe & Fitting Technology',
    hnQuery: 'pipe+fitting+press+connect+plumbing',
    redditQuery: 'press fit pipe copper corrosion',
    subreddit: 'Plumbing+DIY',
  },
  {
    label: 'Smart Building & IoT',
    hnQuery: 'smart+building+IoT+sensor+water',
    redditQuery: 'smart building water leak sensor IoT',
    subreddit: 'homeautomation+smarthome',
  },
  {
    label: 'Green Materials & Sustainability',
    hnQuery: 'lead+free+solder+copper+green+building',
    redditQuery: 'lead free solder green building materials',
    subreddit: 'sustainability+architecture',
  },
  {
    label: 'Data Center Cooling',
    hnQuery: 'data+center+cooling+modular+infrastructure',
    redditQuery: 'data center cooling modular installation',
    subreddit: 'sysadmin+datacenter',
  },
  {
    label: 'Competitor & Market Moves',
    hnQuery: 'Viega+Geberit+Uponor+Watts+plumbing+fitting',
    redditQuery: 'plumbing brand fitting press system installer',
    subreddit: 'Plumbing+construction',
  },
]

// ── Fetch from HackerNews ──────────────────────────────────────────
async function fetchHackerNews(category: (typeof CATEGORIES)[0]) {
  try {
    const res = await fetch(
      `https://hn.algolia.com/api/v1/search?query=${category.hnQuery}&tags=story&hitsPerPage=3`,
    )
    const data = await res.json()

    return (data.hits ?? []).map((hit: any) => ({
      signal_type: 'emerging_tech' as const,
      source: 'hackernews',
      title: hit.title,
      summary: `[${category.label}] Discussed on HackerNews with ${hit.points} upvotes and ${hit.num_comments} comments.`,
      entities: [{ name: 'HackerNews Community', type: 'company' as const }],
      evidence_urls: [
        {
          url: hit.url ?? `https://news.ycombinator.com/item?id=${hit.objectID}`,
          label: 'HackerNews Discussion',
        },
      ],
      trend_metrics: scoreFromHN(hit),
    }))
  } catch {
    return []
  }
}

// ── Fetch from Reddit ──────────────────────────────────────────────
async function fetchReddit(category: (typeof CATEGORIES)[0]) {
  try {
    const res = await fetch(
      `https://www.reddit.com/r/${category.subreddit}/search.json?q=${encodeURIComponent(category.redditQuery)}&sort=new&limit=3`,
      { headers: { 'User-Agent': 'viega-dashboard/1.0' } },
    )
    const data = await res.json()
    const posts = data?.data?.children ?? []

    return posts.map((post: any) => ({
      signal_type: 'trend' as const,
      source: 'reddit',
      title: post.data.title,
      summary: `[${category.label}] Posted on r/${post.data.subreddit} with ${post.data.score} upvotes and ${post.data.num_comments} comments.`,
      entities: [{ name: post.data.subreddit, type: 'topic' as const }],
      evidence_urls: [
        {
          url: `https://reddit.com${post.data.permalink}`,
          label: `r/${post.data.subreddit}`,
        },
      ],
      trend_metrics: scoreFromReddit(post),
    }))
  } catch {
    return []
  }
}

// ── Main route ─────────────────────────────────────────────────────
export async function POST() {
  try {
    const payload = await getPayload({ config })

    // Fetch all categories in parallel
    const results = await Promise.all(
      CATEGORIES.map((cat) =>
        Promise.all([fetchHackerNews(cat), fetchReddit(cat)]).then(([hn, reddit]) => ({
          category: cat.label,
          signals: [...hn, ...reddit],
        })),
      ),
    )

    const allSignals = results.flatMap((r) => r.signals)
    const created = []

    for (const signal of allSignals) {
      const result = await payload.create({
        collection: 'signals',
        data: signal,
      })
      created.push(result.title)
    }

    return NextResponse.json({
      success: true,
      detected: created.length,
      categories: results.map((r) => ({ category: r.category, count: r.signals.length })),
      signals: created,
      fetchedAt: new Date().toISOString(),
    })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
