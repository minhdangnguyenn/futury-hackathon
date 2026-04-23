'use client'

import React from 'react'
import type { Signal } from '@/lib/signals/types'
import { SignalCard } from './SignalCard'

export function SignalList({
  signals,
  expandedId,
  setExpandedId,
}: {
  signals: Signal[]
  expandedId: string | null
  setExpandedId: (id: string | null) => void
}) {
  return (
    <div className="flex flex-col gap-3">
      {signals.map((signal) => {
        const isExpanded = expandedId === signal.id
        return (
          <SignalCard
            key={signal.id}
            signal={signal}
            expanded={isExpanded}
            onToggle={() => setExpandedId(isExpanded ? null : signal.id)}
          />
        )
      })}

      {signals.length === 0 && (
        <div className="text-center py-12 text-gray-400">No signals found for this filter.</div>
      )}
    </div>
  )
}
