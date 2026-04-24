'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import type { Signal } from '@/lib/signals/types'
import { useRouter } from 'next/navigation'

export type Competitor = {
  id: string
  name: string
}

function normalize(s: string) {
  return s.trim().toLowerCase()
}

// counts signals that mention each competitor by name in entities
function countSignalsByCompetitor(signals: Signal[], competitors: Competitor[]) {
  const index = new Map<string, string>() // normalizedName -> displayName
  for (const c of competitors) index.set(normalize(c.name), c.name)

  const counts = new Map<string, number>()
  for (const c of competitors) counts.set(c.name, 0)

  for (const s of signals) {
    const names = (s.entities ?? []).map((e) => normalize(e.name))
    for (const n of names) {
      const display = index.get(n)
      if (display) counts.set(display, (counts.get(display) ?? 0) + 1)
    }
  }

  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}

export function CompetitorSignalsChart({
  signals,
  competitors,
  title = 'Competitor Mentions (by signals)',
}: {
  signals: Signal[]
  competitors: Competitor[]
  title?: string
}) {
  const [selected, setSelected] = useState<string[]>([]) // competitor names
  const allSelected = selected.length === 0

  const chartDataAll = useMemo(
    () => countSignalsByCompetitor(signals, competitors),
    [signals, competitors],
  )

  const router = useRouter()

  const competitorIdByName = useMemo(() => {
    const m = new Map<string, string>()
    for (const c of competitors) m.set(c.name, c.id)
    return m
  }, [competitors])

  const chartData = useMemo(() => {
    if (allSelected) return chartDataAll
    const selectedSet = new Set(selected)
    return chartDataAll.filter((d) => selectedSet.has(d.name))
  }, [allSelected, chartDataAll, selected])

  const toggle = (name: string) => {
    setSelected((prev) => (prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]))
  }

  const clear = () => setSelected([])

  if (!competitors.length) return null

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h2 className="font-semibold text-gray-700 text-sm">{title}</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {allSelected ? 'Showing: All competitors' : `Showing: ${selected.length} selected`}
          </p>
        </div>

        <button
          type="button"
          onClick={clear}
          className="text-xs px-3 py-1 rounded-full border border-gray-300 text-gray-600 hover:border-gray-500"
          disabled={allSelected}
        >
          Show all
        </button>
      </div>

      {/* selector chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {competitors.map((c) => {
          const active = allSelected ? true : selected.includes(c.name)
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => toggle(c.name)}
              className={`px-3 py-1 rounded-full text-xs border transition-all ${
                active
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'
              }`}
              title={c.name}
            >
              <Link
                href={`/competitors/${c.id}`}
                className="underline underline-offset-2"
                onClick={(e) => e.stopPropagation()} // important: prevents toggling when navigating
              >
                {c.name}
              </Link>
            </button>
          )
        })}
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ left: -10 }}>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11 }}
            interval={0}
            angle={-15}
            textAnchor="end"
            height={60}
          />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip formatter={(v) => [v, 'Signals']} />
          <Bar
            dataKey="count"
            radius={[6, 6, 0, 0]}
            onClick={(data: any) => {
              const id = competitorIdByName.get(data?.name)
              if (id) router.push(`/competitors/${id}`)
            }}
          />
        </BarChart>
      </ResponsiveContainer>

      {chartData.length === 0 && (
        <div className="text-xs text-gray-400 mt-3">
          No signals mention the selected competitors.
        </div>
      )}
    </div>
  )
}
