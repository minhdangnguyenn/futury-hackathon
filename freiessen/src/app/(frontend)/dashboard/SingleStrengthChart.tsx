'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { Signal } from '@/lib/signals/types'
import type { SignalMetrics } from '@/lib/signals/scoring'

export function SignalStrengthChart({
  signals,
  metricsById,
  metric = 'relevance',
}: {
  signals: Signal[]
  metricsById: Map<string, SignalMetrics>
  metric?: keyof SignalMetrics // 'freshness' | 'evidenceQuality' | 'relevance'
}) {
  const label =
    metric === 'freshness'
      ? 'Freshness'
      : metric === 'evidenceQuality'
        ? 'Evidence Quality'
        : 'Relevance'

  const chartData = signals.map((s) => {
    const id = String((s as any).id)
    const m = metricsById.get(id)
    const value = m?.[metric] ?? 0

    return {
      name: (s.title ?? '').slice(0, 22) + '…',
      value,
      fill: value >= 75 ? '#22c55e' : value >= 55 ? '#eab308' : '#ef4444',
    }
  })

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
      <h2 className="font-semibold text-gray-700 mb-3 text-sm">
        Signal Metrics Overview — {label}
      </h2>

      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={chartData} margin={{ left: -20 }}>
          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
          <Tooltip formatter={(value) => [`${value}/100`, label]} contentStyle={{ fontSize: 12 }} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
