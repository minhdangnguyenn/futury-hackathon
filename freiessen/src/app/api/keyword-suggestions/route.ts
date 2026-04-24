import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

const STATIC_KEYWORDS = [
  'heat pump',
  'hydraulic balancing',
  'press fitting',
  'pipe corrosion',
  'leak detection',
  'district heating',
  'BIM',
  'Revit',
  'lead-free solder',
  'smart building',
]

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = String(searchParams.get('query') ?? '').trim()

  if (!q) return NextResponse.json({ suggestions: [] })

  const query = q.toLowerCase()
  const suggestions = new Set<string>()

  // 1) Static suggestions
  for (const k of STATIC_KEYWORDS) {
    if (k.toLowerCase().includes(query)) suggestions.add(k)
  }

  // 2) Competitor name suggestions
  try {
    const payload = await getPayload({ config })

    const competitorsRes = await payload.find({
      collection: 'competitors',
      limit: 50,
      where: {
        name: { contains: q }, // Payload "contains"
      },
    })

    for (const c of competitorsRes.docs as any[]) {
      if (c?.name) suggestions.add(String(c.name))
    }
  } catch (e) {
    // Don’t fail suggestions if DB is down
    // (optional) console.error(e)
  }

  return NextResponse.json({
    suggestions: Array.from(suggestions).slice(0, 12),
  })
}
