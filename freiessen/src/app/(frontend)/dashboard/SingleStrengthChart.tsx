'use client'

import { useMemo, useState } from 'react'
import type { Signal } from '@/lib/signals/types'
import type { SignalMetrics } from '@/lib/signals/scoring'

type MetricKey = keyof SignalMetrics

export function SignalStrengthChart({
  signals,
  metricsById,
  metric,
}: {
  signals: Signal[]
  metricsById: Map<string, SignalMetrics>
  metric?: MetricKey
}) {
  // ✅ local selection, seeded from prop (or default to relevance)
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>(metric ?? 'relevance')

  // If the parent changes `metric` prop later and you want to sync it,
  // we can add an effect — but keeping it simple is usually fine.

  const rows = useMemo(() => {
    return signals.map((s) => {
      const id = String((s as any).id ?? (s as any)._id ?? '')
      const m = id ? metricsById.get(id) : undefined
      const value = m ? m[selectedMetric] : 0
      return {
        id,
        signal: s,
        value,
      }
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
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-semibold text-gray-900">Signal Metrics Overview</h2>
          <p className="text-xs text-gray-500 mt-1">
            Average {label[selectedMetric]}: <span className="font-semibold">{avg}</span>/100
          </p>
        </div>

        {/* ✅ Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600" htmlFor="metricSelect">
            Metric
          </label>
          <select
            id="metricSelect"
            className="border border-gray-200 rounded-lg px-2 py-1 text-sm bg-white"
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value as MetricKey)}
          >
            <option value="relevance">Relevance</option>
            <option value="freshness">Freshness</option>
            <option value="evidenceQuality">Evidence quality</option>
          </select>
        </div>
      </div>

      {/* Example “bar list” chart (simple, no external chart lib) */}
      <div className="mt-4 space-y-2">
        {rows.slice(0, 12).map((r) => (
          <div key={r.id} className="flex items-center gap-3">
            <div className="w-56 truncate text-xs text-gray-700">
              {String((r.signal as any).title ?? (r.signal as any).summary ?? r.id)}
            </div>

            <div className="flex-1 bg-gray-100 rounded h-2 overflow-hidden">
              <div
                className="h-2 bg-gray-900"
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
