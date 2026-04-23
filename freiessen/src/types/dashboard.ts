export type PersonaKey = 'josef' | 'steffen' | 'david' | 'volkmar' | 'nick'

export type UseCaseKey = 'competitor_move' | 'market_problem' | 'technology_scouting'

export type DecisionLabel = 'Build' | 'Invest' | 'Ignore'

export interface TrendDataPoint {
  date: string
  count: number
}

export interface Insight {
  id: string | number
  title: string
  summary: string
  fullText?: any // Lexical rich text
  decisionLabel: DecisionLabel
  reasoning?: string
  sourceCategory: 'patent' | 'forum' | 'news' | 'research' | 'social'
  sourceUrls?: { url: string }[]
  personas: PersonaKey[]
  useCase?: UseCaseKey
  detectedAt: string
}

export interface Trend {
  id: string | number
  topic: string
  date: string
  count: number
  useCase?: UseCaseKey
}

export interface Signal {
  id: string | number
  title: string
  content: string
  sourceUrl?: string
  sourceCategory?: 'patent' | 'forum' | 'news' | 'research' | 'social'
  topic: string
  detectedAt: string
  personas: PersonaKey[]
  useCase?: UseCaseKey
}
