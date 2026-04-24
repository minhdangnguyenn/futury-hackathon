'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import type { Signal } from '@/lib/signals/types'
import { getRecommendation } from '@/lib/signals/scoring'
import { SignalStrengthChart } from '@/app/(frontend)/dashboard/SingleStrengthChart'
import { SignalList } from '@/app/(frontend)/dashboard/SignalList'

export default function CompetitorDetailClient({
  competitor,
  signals,
}: {
  competitor: {
    id: string
    name: string
    url?: string
    country?: string
    tags?: string[]
  }
  signals: Signal[]
}) {
  const stats = useMemo(() => {
    const byType: Record<string, number> = {}
    const byRec: Record<string, number> = { build: 0, invest: 0, ignore: 0 }

    for (const s of signals) {
      byType[s.signal_type] = (byType[s.signal_type] ?? 0) + 1
      const rec = getRecommendation(s).id
      byRec[rec] = (byRec[rec] ?? 0) + 1
    }

    return { byType, byRec, total: signals.length }
  }, [signals])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="max-w-6xl mx-auto">
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-800">
            ← Back to dashboard
          </Link>

          <div className="mt-2 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{competitor.name}</h1>
              <div className="text-sm text-gray-500 mt-1">
                {competitor.country ? <span>{competitor.country}</span> : null}
                {competitor.url ? (
                  <>
                    {competitor.country ? ' · ' : null}
                    <a className="underline" href={competitor.url} target="_blank" rel="noreferrer">
                      {competitor.url}
                    </a>
                  </>
                ) : null}
              </div>

              {competitor.tags?.length ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {competitor.tags.map((t) => (
                    <span
                      key={t}
                      className="text-xs bg-gray-100 border border-gray-200 rounded-full px-2 py-1 text-gray-700"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 min-w-[220px]">
              <div className="text-xs text-gray-500">Signals tracked</div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="mt-2 text-xs text-gray-600">
                Build: {stats.byRec.build} · Invest: {stats.byRec.invest} · Ignore:{' '}
                {stats.byRec.ignore}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-6xl mx-auto">
        {/* Reuse your existing “strength distribution” chart */}
        <SignalStrengthChart signals={signals} />

        {/* Simple breakdown */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mt-6">
          <h2 className="font-semibold text-gray-800 mb-3">Signal types</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.byType)
              .sort((a, b) => b[1] - a[1])
              .map(([type, count]) => (
                <span key={type} className="text-sm bg-gray-50 border rounded-full px-3 py-1">
                  {type}: <span className="font-semibold">{count}</span>
                </span>
              ))}
          </div>
        </div>

        <div className="mt-6">
          <h2 className="font-semibold text-gray-800 mb-3">Signals</h2>
          <SignalList signals={signals} expandedId={null} setExpandedId={() => {}} />
        </div>
      </div>
    </div>
  )
}
