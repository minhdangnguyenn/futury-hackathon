'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import type { Signal } from '@/lib/signals/types'

type Mode = 'count' | 'share'

export function CompetitorSignalsChart({
  signals,
  competitors,
  title = 'Competitor Mentions (by signals)',
}: {
  signals: Signal[]
  competitors: { id: string; name: string }[]
  title?: string
}) {
  const [mode, setMode] = useState<Mode>('count')

  const rows = useMemo(() => {
    const competitorNames = competitors.map((c) => c.name)
    const counts = new Map<string, number>()

    // init all to 0 so they always show
    for (const name of competitorNames) counts.set(name, 0)

    for (const s of signals) {
      const entities = Array.isArray((s as any).entities) ? (s as any).entities : []
      const entityNames = new Set(
        entities
          .map((e: any) =>
            String(e?.name ?? '')
              .toLowerCase()
              .trim(),
          )
          .filter(Boolean),
      )

      for (const name of competitorNames) {
        const key = name.toLowerCase().trim()
        if (key && entityNames.has(key)) {
          counts.set(name, (counts.get(name) ?? 0) + 1)
        }
      }
    }

    const totalSignals = signals.length || 1

    return competitorNames
      .map((name) => {
        const count = counts.get(name) ?? 0
        const value = mode === 'share' ? (count / totalSignals) * 100 : count
        return { name, count, value }
      })
      .sort((a, b) => b.value - a.value)
  }, [signals, competitors, mode])

  const maxValue = useMemo(() => {
    if (!rows.length) return 1
    return Math.max(1, ...rows.map((r) => r.value))
  }, [rows])

  function ToggleButton({
    active,
    children,
    onClick,
  }: {
    active: boolean
    children: React.ReactNode
    onClick: () => void
  }) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={[
          'px-3 py-1.5 rounded-lg text-sm border transition-colors',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
          active
            ? 'bg-blue-600 border-blue-600 text-white'
            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50',
        ].join(' ')}
      >
        {children}
      </button>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-semibold text-gray-900">{title}</h2>
          <p className="text-xs text-gray-500 mt-1">
            Based on entity matches inside each signal (not total mentions).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ToggleButton active={mode === 'count'} onClick={() => setMode('count')}>
            Count
          </ToggleButton>
          <ToggleButton active={mode === 'share'} onClick={() => setMode('share')}>
            Share %
          </ToggleButton>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {rows.map((r) => {
          const pct = (r.value / maxValue) * 100
          return (
            <div key={r.name} className="flex items-center gap-3">
              <div className="w-56 truncate text-xs text-gray-700">{r.name}</div>

              <div className="flex-1 bg-gray-100 rounded h-2 overflow-hidden">
                <div
                  className="h-2 bg-yellow-400"
                  style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
                />
              </div>

              <div className="w-14 text-right text-xs text-gray-600 tabular-nums">
                {mode === 'share' ? `${r.value.toFixed(0)}%` : r.count}
              </div>

              {/* Optional: link to competitor detail if you want */}
              {competitors.find((c) => c.name === r.name)?.id ? (
                <Link
                  className="text-xs text-blue-600 hover:underline"
                  href={`/competitors/${competitors.find((c) => c.name === r.name)!.id}`}
                >
                  View
                </Link>
              ) : null}
            </div>
          )
        })}

        {!rows.length ? (
          <div className="text-sm text-gray-500">No competitors to display.</div>
        ) : null}
      </div>
    </div>
  )
}
