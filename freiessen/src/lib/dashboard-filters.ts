import type { Insight, Signal, Trend, PersonaKey, UseCaseKey } from '../types/dashboard'

/**
 * Filter insights by persona.
 * Returns all insights if persona is null.
 */
export function filterByPersona(insights: Insight[], persona: PersonaKey | null): Insight[] {
  if (persona === null) return insights
  return insights.filter((insight) => insight.personas.includes(persona))
}

/**
 * Filter insights by use case.
 * Returns all insights if useCase is null.
 */
export function filterByUseCase(insights: Insight[], useCase: UseCaseKey | null): Insight[] {
  if (useCase === null) return insights
  return insights.filter((insight) => insight.useCase === useCase)
}

export function filterSignalsByPersona(signals: Signal[], persona: PersonaKey | null): Signal[] {
  if (persona === null) return signals
  return signals.filter((signal) => signal.personas.includes(persona))
}

export function filterSignalsByUseCase(signals: Signal[], useCase: UseCaseKey | null): Signal[] {
  if (useCase === null) return signals
  return signals.filter((signal) => signal.useCase === useCase)
}

export function filterTrendsByUseCase(trends: Trend[], useCase: UseCaseKey | null): Trend[] {
  if (useCase === null) return trends
  return trends.filter((trend) => trend.useCase === useCase)
}

/**
 * Aggregate trends by topic and return the top N topics by total volume descending.
 */
export function getTopTrends(trends: Trend[], n: number): Array<{ topic: string; totalCount: number }> {
  const totals = new Map<string, number>()
  for (const trend of trends) {
    totals.set(trend.topic, (totals.get(trend.topic) ?? 0) + trend.count)
  }
  return Array.from(totals.entries())
    .map(([topic, totalCount]) => ({ topic, totalCount }))
    .sort((a, b) => b.totalCount - a.totalCount)
    .slice(0, n)
}

/**
 * Truncate a summary string to max characters, appending '...' if truncated.
 */
export function truncateSummary(text: string, max: number): string {
  if (text.length <= max) return text
  return text.slice(0, max) + '...'
}
