import type { Signal } from './types'
import type { UseCase } from './constants'

export type SignalMetrics = {
  freshness: number
  evidenceQuality: number
  relevance: number
}

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n))
}

function toDate(value: unknown): Date | null {
  if (!value) return null
  const d = value instanceof Date ? value : new Date(String(value))
  return Number.isFinite(d.getTime()) ? d : null
}

function daysAgo(date: Date) {
  const ms = Date.now() - date.getTime()
  return ms / (1000 * 60 * 60 * 24)
}

/**
 * 1) Freshness (0–100)
 * 0–1 day: 100
 * 2–7 days: 80
 * 8–30 days: 50
 * >30 days: 20
 */
export function getFreshness(signal: Signal): number {
  const created = toDate((signal as any).createdAt) ?? toDate((signal as any).publishedAt)
  if (!created) return 50 // fallback if missing dates

  const d = daysAgo(created)

  if (d <= 1) return 100
  if (d <= 7) return 80
  if (d <= 30) return 50
  return 20
}

/**
 * 2) Evidence Quality (0–100)
 * Base by source + +5 per evidence URL (cap +20)
 */
export function getEvidenceQuality(signal: Signal): number {
  const source = String((signal as any).source ?? '').toLowerCase()

  let base = 55
  if (source.includes('patent')) base = 80
  else if (source.includes('regulat')) base = 85
  else if (source.includes('news') || source.includes('press') || source.includes('release'))
    base = 65
  else if (source.includes('forum') || source.includes('social') || source.includes('reddit'))
    base = 40

  // evidence_urls may be [{url,label}] in your Payload schema
  const evidence = Array.isArray((signal as any).evidence_urls) ? (signal as any).evidence_urls : []
  const urlCount = evidence.length

  const bonus = Math.min(urlCount * 5, 20)
  return clamp(base + bonus)
}

/**
 * 3) Relevance (0–100)
 * +30 competitor mentioned (entities contain competitor)
 * +10 per keyword match in title/summary (cap +40)
 * +20 if signal_type is in active use-case types
 */
const DEFAULT_KEYWORDS = [
  'valve',
  'press fitting',
  'pressfitting',
  'hydronic',
  'leak',
  'leakage',
  'corrosion',
  'bim',
  'revit',
  'district heating',
  'heat pump',
  'retrofit',
]

function normalizeText(s: unknown) {
  return String(s ?? '').toLowerCase()
}

export function getRelevance(
  signal: Signal,
  opts?: {
    competitors?: { name: string }[]
    activeUseCase?: UseCase | null
    keywords?: string[]
  },
): number {
  const text = `${normalizeText((signal as any).title)} ${normalizeText((signal as any).summary)}`

  const entities = Array.isArray((signal as any).entities) ? (signal as any).entities : []
  const entityNames = new Set(entities.map((e: any) => normalizeText(e?.name)))

  const competitorNames = (opts?.competitors ?? []).map((c) => normalizeText(c.name))
  const competitorMentioned =
    competitorNames.length > 0 && competitorNames.some((n) => n && entityNames.has(n))

  let score = 0

  if (competitorMentioned) score += 30

  const keywords = opts?.keywords?.length ? opts.keywords : DEFAULT_KEYWORDS
  let hits = 0
  for (const kw of keywords) {
    if (kw && text.includes(kw.toLowerCase())) hits += 1
  }
  score += Math.min(hits * 10, 40)

  const signalType = String((signal as any).signal_type ?? '')
  const uc = opts?.activeUseCase
  if (uc?.types?.includes(signalType as any)) score += 20

  return clamp(score)
}

/**
 * Convenience helper: compute all metrics at once.
 */
export function getMetrics(
  signal: Signal,
  opts?: {
    competitors?: { name: string }[]
    activeUseCase?: UseCase | null
    keywords?: string[]
  },
): SignalMetrics {
  return {
    freshness: getFreshness(signal),
    evidenceQuality: getEvidenceQuality(signal),
    relevance: getRelevance(signal, opts),
  }
}
