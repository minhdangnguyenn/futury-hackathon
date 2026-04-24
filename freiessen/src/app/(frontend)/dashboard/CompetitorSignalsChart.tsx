'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import type { Signal } from '@/lib/signals/types'

type Mode = 'count' | 'share'

function normalizeName(value: unknown) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function buildSearchText(signal: Signal) {
  const title = normalizeName((signal as any).title)
  const summary = normalizeName((signal as any).summary)
  const evidence = Array.isArray((signal as any).evidence_urls) ? (signal as any).evidence_urls : []

  const evidenceText = evidence
    .flatMap(
      (item: { label?: string; url?: string }): Array<string | undefined> => [
        item?.label,
        item?.url,
      ],
    )
    .map((value: string | undefined) => normalizeName(value))
    .filter(Boolean)
    .join(' ')

  return [title, summary, evidenceText].filter(Boolean).join(' ')
}

function getRelationId(value: unknown) {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id
    if (typeof id === 'string' || typeof id === 'number') return String(id)
  }
  return null
}

function getRelationName(value: unknown) {
  if (value && typeof value === 'object' && 'name' in value) {
    return normalizeName((value as { name?: unknown }).name)
  }
  return ''
}

export function CompetitorSignalsChart({
  signals,
  competitors,
  title = 'Competitor Mentions (by signals)',
}: {
  signals: Signal[]
  competitors: { id: string; name: string; token: string }[]
  title?: string
}) {
  const [mode, setMode] = useState<Mode>('count')

  const competitorMeta = useMemo(() => {
    const byId = new Map<string, string>()
    const byName = new Map<string, string>()
    const tokenByName = new Map<string, string>()

    for (const c of competitors) {
      const normalizedName = normalizeName(c.name)
      byId.set(String(c.id), c.name)
      byName.set(normalizedName, c.name)
      tokenByName.set(c.name, c.token)
    }

    return { byId, byName, tokenByName }
  }, [competitors])

  const rows = useMemo(() => {
    const competitorNames = competitors.map((c) => c.name)
    const counts = new Map<string, number>()

    // init all to 0 so they always show
    for (const name of competitorNames) counts.set(name, 0)

    for (const s of signals) {
      const mentioned = new Set<string>()
      const searchableText = buildSearchText(s)

      const entities = Array.isArray((s as any).entities) ? (s as any).entities : []
      for (const entity of entities) {
        const match = competitorMeta.byName.get(normalizeName(entity?.name))
        if (match) mentioned.add(match)
      }

      const primary = (s as any).company
      const primaryId = getRelationId(primary)
      if (primaryId) {
        const match = competitorMeta.byId.get(primaryId)
        if (match) mentioned.add(match)
      }

      const primaryName = getRelationName(primary)
      if (primaryName) {
        const match = competitorMeta.byName.get(primaryName)
        if (match) mentioned.add(match)
      }

      const relatedCompetitors = Array.isArray((s as any).competitors) ? (s as any).competitors : []
      for (const competitor of relatedCompetitors) {
        const competitorId = getRelationId(competitor)
        if (competitorId) {
          const match = competitorMeta.byId.get(competitorId)
          if (match) mentioned.add(match)
        }

        const competitorName = getRelationName(competitor)
        if (competitorName) {
          const match = competitorMeta.byName.get(competitorName)
          if (match) mentioned.add(match)
        }
      }

      for (const competitor of competitors) {
        const normalizedCompetitorName = normalizeName(competitor.name)
        if (normalizedCompetitorName && searchableText.includes(normalizedCompetitorName)) {
          mentioned.add(competitor.name)
        }
      }

      for (const name of mentioned) {
        counts.set(name, (counts.get(name) ?? 0) + 1)
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
  }, [signals, competitors, competitorMeta, mode])

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
            Based on competitor mentions in signal content, entities, and links.
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
          const token = competitorMeta.tokenByName.get(r.name)
          const href = token ? `/competitors/t/${token}` : null

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

              {href ? (
                <Link className="text-xs text-blue-600 hover:underline" href={href}>
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
