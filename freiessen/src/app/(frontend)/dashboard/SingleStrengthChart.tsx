'use client'

import { useMemo, useState } from 'react'
import type { Signal } from '@/lib/signals/types'
import type { SignalMetrics } from '@/lib/signals/scoring'

type MetricKey = keyof SignalMetrics

function MetricButton({
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
        // ✅ prevent default "black-ish" focus styles and use a blue focus ring instead
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

export function SignalStrengthChart({
  signals,
  metricsById,
  metric,
}: {
  signals: Signal[]
  metricsById: Map<string, SignalMetrics>
  metric?: MetricKey
}) {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>(metric ?? 'relevance')

  const rows = useMemo(() => {
    return signals.map((s) => {
      const id = String((s as any).id ?? (s as any)._id ?? '')
      const m = id ? metricsById.get(id) : undefined
      const value = m ? m[selectedMetric] : 0
      return { id, signal: s, value }
    })
  }, [signals, metricsById, selectedMetric])

  const avg = useMemo(() => {
    if (!rows.length) return 0
    const sum = rows.reduce((acc, r) => acc + (Number.isFinite(r.value) ? r.value : 0), 0)
    return Math.round(sum / rows.length)
  }, [rows])

  const label: Record<MetricKey, string> = {
    freshness: 'Freshness',
    evidenceQuality: 'Evidence quality',
    relevance: 'Relevance',
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-semibold text-gray-900">Signal Metrics Overview</h2>
          <p className="text-xs text-gray-500 mt-1">
            Average {label[selectedMetric]}: <span className="font-semibold">{avg}</span>/100
          </p>
        </div>

        {/* ✅ Buttons instead of dropdown */}
        <div className="flex items-center gap-2">
          <MetricButton
            active={selectedMetric === 'relevance'}
            onClick={() => setSelectedMetric('relevance')}
          >
            Relevance
          </MetricButton>

          <MetricButton
            active={selectedMetric === 'freshness'}
            onClick={() => setSelectedMetric('freshness')}
          >
            Freshness
          </MetricButton>

          <MetricButton
            active={selectedMetric === 'evidenceQuality'}
            onClick={() => setSelectedMetric('evidenceQuality')}
          >
            Evidence quality
          </MetricButton>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {rows.slice(0, 12).map((r) => (
          <div key={r.id} className="flex items-center gap-3">
            <div className="w-56 truncate text-xs text-gray-700">
              {String((r.signal as any).title ?? (r.signal as any).summary ?? r.id)}
            </div>

            <div className="flex-1 bg-gray-100 rounded h-2 overflow-hidden">
              {/* ✅ yellow bars */}
              <div
                className="h-2 bg-yellow-400"
                style={{ width: `${Math.max(0, Math.min(100, r.value))}%` }}
              />
            </div>

            <div className="w-10 text-right text-xs text-gray-600">{Math.round(r.value)}</div>
          </div>
        ))}

        {!rows.length ? <div className="text-sm text-gray-500">No signals to display.</div> : null}
      </div>
    </div>
  )
}
