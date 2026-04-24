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

// ── Helpers ────────────────────────────────────────────────────────
function toHNQuery(keyword: string) {
  // "lead free solder" -> "lead+free+solder"
  return keyword.trim().split(/\s+/g).filter(Boolean).join('+')
}

async function fetchHackerNewsByQuery(hnQuery: string, label: string) {
  try {
    const res = await fetch(
      `https://hn.algolia.com/api/v1/search?query=${hnQuery}&tags=story&hitsPerPage=5`,
    )
    const data = await res.json()

    return (data.hits ?? []).map((hit: any) => ({
      signal_type: 'emerging_tech' as const,
      source: 'hackernews',
      title: hit.title,
      summary: `[${label}] Discussed on HackerNews with ${hit.points} upvotes and ${hit.num_comments} comments.`,
      entities: [{ name: 'HackerNews Community', type: 'company' as const }],
      evidence_urls: [
        {
          url: hit.url ?? `https://news.ycombinator.com/item?id=${hit.objectID}`,
          label: 'HackerNews Discussion',
        },
      ],
      trend_metrics: scoreFromHN(hit),
    }))
  } catch (err) {
    console.error('HN fetch failed:', err)
    return [] // ✅ always return an array
  }
}

async function fetchRedditByQuery(redditQuery: string, subreddit: string, label: string) {
  try {
    const res = await fetch(
      `https://www.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(redditQuery)}&sort=new&limit=5`,
      { headers: { 'User-Agent': 'viega-dashboard/1.0' } },
    )
    const data = await res.json()
    const posts = data?.data?.children ?? []

    return posts.map((post: any) => ({
      signal_type: 'trend' as const,
      source: 'reddit',
      title: post.data.title,
      summary: `[${label}] Posted on r/${post.data.subreddit} with ${post.data.score} upvotes and ${post.data.num_comments} comments.`,
      entities: [{ name: post.data.subreddit, type: 'topic' as const }],
      evidence_urls: [
        {
          url: `https://reddit.com${post.data.permalink}`,
          label: `r/${post.data.subreddit}`,
        },
      ],
      trend_metrics: scoreFromReddit(post),
    }))
  } catch (err) {
    console.error('Reddit fetch failed:', err)
    return [] // ✅ always return an array
  }
}

// ── Main route ─────────────────────────────────────────────────────
type DetectMode = 'all' | 'keyword'

export async function POST(req: Request) {
  const payload = await getPayload({ config })

  const body = await req.json().catch(() => ({}) as any)
  const mode: DetectMode = body?.mode === 'keyword' ? 'keyword' : 'all'
  const keyword = String(body?.keyword ?? '').trim()

  // Validate
  if (mode === 'keyword' && !keyword) {
    return NextResponse.json({ success: false, error: 'Keyword input is empty.' }, { status: 400 })
  }

  // 1) Build list of jobs
  const jobs: Array<Promise<{ category: string; signals: any[] }>> = []

  if (mode === 'keyword') {
    const label = `Keyword: ${keyword}`
    const hnQuery = toHNQuery(keyword)

    // pick a sensible subreddit set for generic keyword searches
    const subreddit = 'HVAC+plumbing+Plumbing+homeautomation+smarthome+construction+sysadmin'

    jobs.push(
      Promise.all([
        fetchHackerNewsByQuery(hnQuery, label),
        fetchRedditByQuery(keyword, subreddit, label),
      ]).then(([hn, reddit]) => ({ category: label, signals: [...hn, ...reddit] })),
    )
  } else {
    // mode === 'all'
    for (const cat of CATEGORIES) {
      jobs.push(
        Promise.all([
          fetchHackerNewsByQuery(cat.hnQuery, cat.label),
          fetchRedditByQuery(cat.redditQuery, cat.subreddit, cat.label),
        ]).then(([hn, reddit]) => ({ category: cat.label, signals: [...hn, ...reddit] })),
      )
    }
  }

  // 2) Execute jobs
  const results = await Promise.all(jobs)
  const allSignals = results.flatMap((r) => r.signals)

  // 3) Save into Payload + count results
  let inserted = 0
  let failed = 0
  const errors: Array<{ title?: string; reason: string }> = []

  for (const signal of allSignals) {
    try {
      await payload.create({
        collection: 'signals',
        data: signal,
      })
      inserted++
    } catch (err: any) {
      failed++

      const cause = err?.cause ?? err?.originalError ?? err?.original ?? err
      console.error('INSERT FAILED (cause):', {
        message: cause?.message ?? err?.message,
        code: cause?.code,
        detail: cause?.detail,
        constraint: cause?.constraint,
        table: cause?.table,
        column: cause?.column,
      })

      errors.push({
        title: signal?.title,
        reason: cause?.message ?? err?.message ?? 'Insert failed',
      })

      // continue
    }
  }

  // 4) Return summary to frontend
  return NextResponse.json({
    success: true,
    mode,
    keyword: mode === 'keyword' ? keyword : null,
    fetched: allSignals.length, // ✅ how many rows fetched from sources
    inserted, // ✅ how many saved successfully
    failed, // ✅ how many failed to save
    categories: results.map((r) => ({ category: r.category, count: r.signals.length })),
    errors: errors.slice(0, 10), // optional debug
    fetchedAt: new Date().toISOString(),
  })
}
