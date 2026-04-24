'use client'

import type { Signal } from '@/lib/signals/types'
import type { SignalMetrics } from '@/lib/signals/scoring'
import { SignalCard } from './SignalCard'

export function SignalList({
  signals,
  expandedId,
  setExpandedId,
  metricsById,
}: {
  signals: Signal[]
  expandedId: string | null
  setExpandedId: (id: string | null) => void
  metricsById?: Map<string, SignalMetrics>
}) {
  return (
    <div className="space-y-4">
      {signals.map((signal) => {
        const id = String((signal as any).id)
        const metrics = metricsById?.get(id)

        return (
          <SignalCard
            key={id}
            signal={signal}
            expanded={expandedId === id}
            onToggle={() => setExpandedId(expandedId === id ? null : id)}
            metrics={metrics}
          />
        )
      })}
    </div>
  )
}
