export type Signal = {
  id: string
  title: string
  summary?: string
  signal_type: string
  source?: string
  token?: string
  trend_metrics?: {
    momentum?: number
    impact?: number
    novelty?: number
    confidence?: number
  }
  entities?: { name: string }[]
  evidence_urls?: { url: string; label?: string }[]
  competitors?: Array<string | { id: string; name?: string }>
}

export type UseCase = {
  id: string
  label: string
  icon: string
  description: string
  types: string[]
}

export type RecommendationId = 'build' | 'invest' | 'ignore'

export type Recommendation = {
  id: RecommendationId
  label: string
  reason: string
  badge: string
  border: string
  score: number
}
