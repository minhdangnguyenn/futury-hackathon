'use client'

import React, { useEffect, useRef, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

type Signal = {
  id: string
  title: string
  summary?: string
  signal_type: string
  source?: string
  trend_metrics?: {
    momentum?: number
    impact?: number
    novelty?: number
    confidence?: number
  }
  entities?: { name: string }[]
  evidence_urls?: { url: string; label?: string }[]
}

type UseCase = {
  id: string
  label: string
  icon: string
  description: string
  types: string[]
}

const USE_CASES: UseCase[] = [
  {
    id: 'uc1',
    label: 'Competitor Moves',
    icon: '⚔️',
    description: 'Track what competitors are building and launching',
    types: ['market_shift', 'disruption'],
  },
  {
    id: 'uc2',
    label: 'Market Problems',
    icon: '📉',
    description: 'Identify unmet needs and pain points in the market',
    types: ['trend', 'regulatory', 'weak_signal'],
  },
  {
    id: 'uc3',
    label: 'Tech Scouting',
    icon: '🔬',
    description: 'Discover emerging technologies and innovations',
    types: ['emerging_tech'],
  },
]

const RECOMMENDATION_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'build', label: '🟢 Build' },
  { id: 'invest', label: '🟡 Invest' },
  { id: 'ignore', label: '🔴 Ignore' },
] as const

function getScore(signal: Signal) {
  const { momentum = 0, impact = 0, novelty = 0, confidence = 0 } = signal.trend_metrics ?? {}
  return Math.round((momentum + impact + novelty + confidence) / 4)
}

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(t)
  }, [value, delayMs])
  return debounced
}

type DetectSignalsPanelProps = {
  keyword: string
  setKeyword: React.Dispatch<React.SetStateAction<string>>
}

export function DetectSignalsPanel({ keyword, setKeyword }: DetectSignalsPanelProps) {
  const debouncedKeyword = useDebouncedValue(keyword, 200)

  const [suggestions, setSuggestions] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)

  const containerRef = useRef<HTMLDivElement | null>(null)

  // Close dropdown if you click outside
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  // Close on Escape
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  // Fetch suggestions
  useEffect(() => {
    const q = debouncedKeyword.trim()

    if (!q) {
      setSuggestions([])
      setOpen(false)
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        setIsLoadingSuggestions(true)
        const res = await fetch(`/api/keyword-suggestions?query=${encodeURIComponent(q)}`)
        const data = await res.json()
        if (cancelled) return

        const next = Array.isArray(data?.suggestions) ? (data.suggestions as string[]) : []
        setSuggestions(next)
        setOpen(true)
      } catch {
        if (!cancelled) {
          setSuggestions([])
          // keep open=false on hard error
          setOpen(false)
        }
      } finally {
        if (!cancelled) setIsLoadingSuggestions(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [debouncedKeyword])

  const onPick = (s: string) => {
    setKeyword(s)
    setOpen(false)
  }

  const showPanel =
    open && (isLoadingSuggestions || suggestions.length > 0 || debouncedKeyword.trim().length > 0)

  return (
    <div ref={containerRef} style={{ position: 'relative', maxWidth: 520 }}>
      <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Keyword</label>

      <input
        value={keyword}
        onChange={(e) => {
          setKeyword(e.target.value)
          if (!open) setOpen(true)
        }}
        onFocus={() => {
          if (keyword.trim()) setOpen(true)
        }}
        placeholder="Type: heat pump, pipe corrosion, lead-free solder..."
        style={{
          width: '100%',
          padding: '10px 12px',
          border: '1px solid #d1d5db',
          borderRadius: 10,
          outline: 'none',
        }}
      />

      {showPanel && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: 12,
            boxShadow: '0 10px 25px rgba(0,0,0,0.10)',
            zIndex: 9999,
            padding: 10,
            overflow: 'hidden',
          }}
        >
          {isLoadingSuggestions && (
            <div style={{ padding: '6px 2px', fontSize: 13, color: '#666' }}>Loading…</div>
          )}

          {/* ✅ Suggestions as buttons (chips) */}
          {suggestions.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onPick(s)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 999,
                    border: '1px solid #e5e7eb',
                    background: '#f9fafb',
                    cursor: 'pointer',
                    fontSize: 13,
                    lineHeight: 1.1,
                    maxWidth: '100%',
                  }}
                  title={s}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {!isLoadingSuggestions && suggestions.length === 0 && (
            <div style={{ padding: '6px 2px', fontSize: 13, color: '#666' }}>No suggestions</div>
          )}
        </div>
      )}
    </div>
  )
}

function getRecommendation(signal: Signal) {
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

function ScoreBar({ value }: { value: number }) {
  const color = value >= 75 ? '#22c55e' : value >= 55 ? '#eab308' : '#ef4444'
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
      <div
        className="h-1.5 rounded-full transition-all"
        style={{ width: `${value}%`, backgroundColor: color }}
      />
    </div>
  )
}

export default function DashboardClient({ signals }: { signals: Signal[] }) {
  const [activeUC, setActiveUC] = useState<string>('uc1')
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const [detecting, setDetecting] = useState(false)
  const [lastDetected, setLastDetected] = useState<string | null>(null)
  const [detectedCount, setDetectedCount] = useState<number | null>(null)
  const [keyword, setKeyword] = useState('')

  async function runDetection(mode: 'all' | 'keyword' = 'all') {
    if (mode === 'keyword' && !keyword.trim()) return null
    setDetecting(true)
    try {
      const payload =
        mode === 'keyword' ? { mode: 'keyword', keyword: keyword.trim() } : { mode: 'all' }

      const res = await fetch('/api/detect-signals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.error ?? 'Detection failed')

      setDetectedCount(data.detected)
      setLastDetected(new Date().toLocaleTimeString())

      window.location.reload()
    } finally {
      setDetecting(false)
    }
  }

  const uc = USE_CASES.find((u) => u.id === activeUC) ?? USE_CASES[0]
  const byUC = signals.filter((s) => uc.types.includes(s.signal_type))

  const filtered = byUC.filter((s) => {
    if (activeFilter === 'all') return true
    return getRecommendation(s).id === activeFilter
  })

  const buildCount = byUC.filter((s) => getRecommendation(s).id === 'build').length
  const investCount = byUC.filter((s) => getRecommendation(s).id === 'invest').length
  const ignoreCount = byUC.filter((s) => getRecommendation(s).id === 'ignore').length

  const chartData = byUC.map((s) => {
    const score = getScore(s)
    return {
      name: (s.title ?? '').slice(0, 22) + '…',
      Score: score,
      fill: score >= 75 ? '#22c55e' : score >= 55 ? '#eab308' : '#ef4444',
    }
  })

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <h1 className="text-2xl font-bold text-gray-900">Market Signal Dashboard</h1>
        <p className="text-gray-400 text-sm mt-0.5">
          Last updated: {new Date().toLocaleDateString()} · {signals.length} signals tracked
        </p>
      </div>

      <div className="p-6 max-w-6xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold text-gray-800 text-sm">🤖 Automated Signal Detection</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Sources: HackerNews · Reddit r/HVAC · Reddit r/plumbing
              </p>
              {lastDetected && (
                <p className="text-xs text-green-600 mt-1">
                  ✅ {detectedCount} new signals detected at {lastDetected}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => runDetection('all')}
                disabled={detecting}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50"
                style={{ backgroundColor: detecting ? '#999' : '#E2001A' }}
              >
                {detecting ? '⏳ Detecting...' : '🔍 Detect All'}
              </button>

              <button
                onClick={() => runDetection('keyword')}
                disabled={detecting || !keyword.trim()}
                className="px-4 py-2 rounded-lg text-sm font-semibold border transition-all disabled:opacity-50"
              >
                Detect keyword
              </button>
            </div>
          </div>

          <div className="mt-4">
            <DetectSignalsPanel keyword={keyword} setKeyword={setKeyword} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {USE_CASES.map((u) => (
            <button
              key={u.id}
              onClick={() => {
                setActiveUC(u.id)
                setActiveFilter('all')
                setExpandedId(null)
              }}
              className={`text-left p-4 rounded-xl border-2 transition-all ${
                activeUC === u.id
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
              }`}
            >
              <div className="text-2xl mb-1">{u.icon}</div>
              <div className="font-semibold text-sm">{u.label}</div>
              <div
                className={`text-xs mt-0.5 ${activeUC === u.id ? 'text-gray-300' : 'text-gray-400'}`}
              >
                {u.description}
              </div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <button
            onClick={() => setActiveFilter(activeFilter === 'build' ? 'all' : 'build')}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              activeFilter === 'build'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 bg-white hover:border-green-300'
            }`}
          >
            <div className="text-2xl font-bold text-green-600">{buildCount}</div>
            <div className="text-sm font-medium text-gray-700">🟢 Build</div>
            <div className="text-xs text-gray-400">High priority signals</div>
          </button>

          <button
            onClick={() => setActiveFilter(activeFilter === 'invest' ? 'all' : 'invest')}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              activeFilter === 'invest'
                ? 'border-yellow-500 bg-yellow-50'
                : 'border-gray-200 bg-white hover:border-yellow-300'
            }`}
          >
            <div className="text-2xl font-bold text-yellow-600">{investCount}</div>
            <div className="text-sm font-medium text-gray-700">🟡 Invest</div>
            <div className="text-xs text-gray-400">Worth monitoring</div>
          </button>

          <button
            onClick={() => setActiveFilter(activeFilter === 'ignore' ? 'all' : 'ignore')}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              activeFilter === 'ignore'
                ? 'border-red-400 bg-red-50'
                : 'border-gray-200 bg-white hover:border-red-300'
            }`}
          >
            <div className="text-2xl font-bold text-red-500">{ignoreCount}</div>
            <div className="text-sm font-medium text-gray-700">🔴 Ignore</div>
            <div className="text-xs text-gray-400">Low priority signals</div>
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <h2 className="font-semibold text-gray-700 mb-3 text-sm">Signal Strength Overview</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} margin={{ left: -20 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Tooltip
                formatter={(value) => [`${value}/100`, 'Score']}
                contentStyle={{ fontSize: 12 }}
              />
              <Bar dataKey="Score" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">
            Signals <span className="text-gray-400 font-normal">({filtered.length})</span>
          </h2>

          <div className="flex gap-2">
            {RECOMMENDATION_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                  activeFilter === f.id
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-gray-500'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {filtered.map((signal) => {
            const rec = getRecommendation(signal)
            const isExpanded = expandedId === signal.id

            return (
              <div
                key={signal.id}
                className={`bg-white rounded-xl border border-gray-200 border-l-4 ${rec.border} shadow-sm transition-all`}
              >
                <button
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-4"
                  onClick={() => setExpandedId(isExpanded ? null : signal.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        {(signal.signal_type ?? '').replace(/_/g, ' ')}
                      </span>

                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full border ${rec.badge}`}
                      >
                        {rec.label}
                      </span>

                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                        {signal.source === 'hackernews' && '🟠 HackerNews'}
                        {signal.source === 'reddit' && '🔴 Reddit'}
                        {signal.source === 'simulated_news' && '📰 News'}
                        {signal.source === 'simulated_patent' && '📋 Patent'}
                        {signal.source === 'simulated_forum' && '💬 Forum'}
                        {signal.source === 'simulated_release' && '🚀 Release'}
                        {signal.source === 'google_trends' && '📈 Google Trends'}
                      </span>
                    </div>

                    <h3 className="font-semibold text-gray-800 text-sm leading-snug truncate">
                      {signal.title}
                    </h3>

                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-400 w-10 shrink-0">Score</span>
                      <div className="flex-1">
                        <ScoreBar value={rec.score} />
                      </div>
                      <span className="text-xs font-bold text-gray-600 w-8 text-right">
                        {rec.score}
                      </span>
                    </div>
                  </div>

                  <span className="text-gray-400 text-lg shrink-0">{isExpanded ? '▲' : '▼'}</span>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-4 border-t border-gray-100 pt-3">
                    <p className="text-gray-600 text-sm leading-relaxed mb-3">{signal.summary}</p>

                    <div
                      className={`text-sm font-medium px-3 py-2 rounded-lg border mb-3 ${rec.badge}`}
                    >
                      💡 {rec.reason}
                    </div>

                    {signal.entities?.length ? (
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-gray-400 uppercase mb-1">
                          Entities
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {signal.entities.map((e, i) => (
                            <span
                              key={i}
                              className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full"
                            >
                              {e.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {(['momentum', 'impact', 'novelty', 'confidence'] as const).map((key) => (
                        <div key={key} className="text-center bg-gray-50 rounded-lg p-2">
                          <div className="text-sm font-bold text-gray-800">
                            {signal.trend_metrics?.[key] ?? 0}
                          </div>
                          <div className="text-xs text-gray-400 capitalize">{key}</div>
                        </div>
                      ))}
                    </div>

                    {signal.evidence_urls?.length ? (
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase mb-1">
                          Evidence
                        </p>
                        <div className="flex flex-col gap-1">
                          {signal.evidence_urls.map((e, i) => (
                            <a
                              key={i}
                              href={e.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 text-xs underline hover:text-blue-700 truncate"
                            >
                              🔗 {e.label || e.url}
                            </a>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            )
          })}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">No signals found for this filter.</div>
          )}
        </div>
      </div>
    </div>
  )
}
