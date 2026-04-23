import { NextResponse } from 'next/server'

/**
 * Very simple suggestion source:
 * - a fixed vocabulary (fast, no DB needed)
 * - plus basic filtering
 *
 * You can later replace this with DB-based suggestions
 * (e.g. last 100 signal titles, categories, etc.)
 */
const VOCAB = [
  'heat pump',
  'hvac',
  'valve',
  'press fitting',
  'press connect',
  'pipe corrosion',
  'lead-free solder',
  'copper pipe',
  'drinking water',
  'data center cooling',
  'modular data center',
  'smart building',
  'leak detection',
  'IoT sensor',
  'installer labor shortage',
  'installation time reduction',
  'Geberit',
  'Uponor',
  'Viega',
]

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const query = (searchParams.get('query') ?? '').trim().toLowerCase()

  if (!query) return NextResponse.json({ suggestions: [] })

  const suggestions = VOCAB.filter((k) => k.toLowerCase().includes(query)).slice(0, 8)

  return NextResponse.json({ suggestions })
}
