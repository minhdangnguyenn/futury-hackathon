import type { Recommendation, Signal } from './types'

export function getScore(signal: Signal) {
  const { momentum = 0, impact = 0, novelty = 0, confidence = 0 } = signal.trend_metrics ?? {}
  return Math.round((momentum + impact + novelty + confidence) / 4)
}

export function getRecommendation(signal: Signal): Recommendation {
  const score = getScore(signal)

  if (score >= 75)
    return {
      id: 'build',
      label: '🟢 Build',
      reason: 'High signal strength — recommend proceeding',
      badge: 'bg-green-100 text-green-700 border-green-300',
      border: 'border-l-green-500',
      score,
    }

  if (score >= 55)
    return {
      id: 'invest',
      label: '🟡 Invest',
      reason: 'Moderate signal — worth monitoring and investing',
      badge: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      border: 'border-l-yellow-500',
      score,
    }

  return {
    id: 'ignore',
    label: '🔴 Ignore',
    reason: 'Low signal strength — not actionable yet',
    badge: 'bg-red-100 text-red-700 border-red-300',
    border: 'border-l-red-500',
    score,
  }
}
