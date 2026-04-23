'use client'

import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const USE_CASES = [
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
]

function getScore(signal: any) {
  const { momentum = 0, impact = 0, novelty = 0, confidence = 0 } = signal.trend_metrics ?? {}
  return Math.round((momentum + impact + novelty + confidence) / 4)
}

function getRecommendation(signal: any) {
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

export default function DashboardClient({ signals }: { signals: any[] }) {
  const [activeUC, setActiveUC] = useState('uc1')
  const [activeFilter, setActiveFilter] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const uc = USE_CASES.find((u) => u.id === activeUC)!
  const byUC = signals.filter((s) => uc.types.includes(s.signal_type))

  const filtered = byUC.filter((s) => {
    if (activeFilter === 'all') return true
    return getRecommendation(s).id === activeFilter
  })

  // Summary stats
  const buildCount = byUC.filter((s) => getRecommendation(s).id === 'build').length
  const investCount = byUC.filter((s) => getRecommendation(s).id === 'invest').length
  const ignoreCount = byUC.filter((s) => getRecommendation(s).id === 'ignore').length

  // Chart — one bar per signal showing overall score
  const chartData = byUC.map((s) => ({
    name: s.title.slice(0, 22) + '…',
    Score: getScore(s),
    fill: getScore(s) >= 75 ? '#22c55e' : getScore(s) >= 55 ? '#eab308' : '#ef4444',
  }))

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Page header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <h1 className="text-2xl font-bold text-gray-900">Market Signal Dashboard</h1>
        <p className="text-gray-400 text-sm mt-0.5">
          Last updated: {new Date().toLocaleDateString()} · {signals.length} signals tracked
        </p>
      </div>

      <div className="p-6 max-w-6xl mx-auto">
        {/* UC Tabs */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {USE_CASES.map((u) => (
            <button
              key={u.id}
              onClick={() => {
                setActiveUC(u.id)
                setActiveFilter('all')
                setExpandedId(null)
              }}
              className={`text-left p-4 rounded-xl border-2 transition-all
                ${
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

        {/* Summary stat cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <button
            onClick={() => setActiveFilter(activeFilter === 'build' ? 'all' : 'build')}
            className={`p-4 rounded-xl border-2 text-left transition-all
              ${activeFilter === 'build' ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white hover:border-green-300'}`}
          >
            <div className="text-2xl font-bold text-green-600">{buildCount}</div>
            <div className="text-sm font-medium text-gray-700">🟢 Build</div>
            <div className="text-xs text-gray-400">High priority signals</div>
          </button>
          <button
            onClick={() => setActiveFilter(activeFilter === 'invest' ? 'all' : 'invest')}
            className={`p-4 rounded-xl border-2 text-left transition-all
              ${activeFilter === 'invest' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 bg-white hover:border-yellow-300'}`}
          >
            <div className="text-2xl font-bold text-yellow-600">{investCount}</div>
            <div className="text-sm font-medium text-gray-700">🟡 Invest</div>
            <div className="text-xs text-gray-400">Worth monitoring</div>
          </button>
          <button
            onClick={() => setActiveFilter(activeFilter === 'ignore' ? 'all' : 'ignore')}
            className={`p-4 rounded-xl border-2 text-left transition-all
              ${activeFilter === 'ignore' ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white hover:border-red-300'}`}
          >
            <div className="text-2xl font-bold text-red-500">{ignoreCount}</div>
            <div className="text-sm font-medium text-gray-700">🔴 Ignore</div>
            <div className="text-xs text-gray-400">Low priority signals</div>
          </button>
        </div>

        {/* Score chart */}
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

        {/* Filter bar */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">
            Signals <span className="text-gray-400 font-normal">({filtered.length})</span>
          </h2>
          <div className="flex gap-2">
            {RECOMMENDATION_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all
                  ${
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

        {/* Signal cards */}
        <div className="flex flex-col gap-3">
          {filtered.map((signal) => {
            const rec = getRecommendation(signal)
            const isExpanded = expandedId === signal.id

            return (
              <div
                key={signal.id}
                className={`bg-white rounded-xl border border-gray-200 border-l-4 ${rec.border} shadow-sm transition-all`}
              >
                {/* Card header — always visible, clickable */}
                <button
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-4"
                  onClick={() => setExpandedId(isExpanded ? null : signal.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        {signal.signal_type.replace(/_/g, ' ')}
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full border ${rec.badge}`}
                      >
                        {rec.label}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-800 text-sm leading-snug truncate">
                      {signal.title}
                    </h3>
                    {/* Score bar */}
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

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-5 pb-4 border-t border-gray-100 pt-3">
                    {/* Summary */}
                    <p className="text-gray-600 text-sm leading-relaxed mb-3">{signal.summary}</p>

                    {/* Recommendation */}
                    <div
                      className={`text-sm font-medium px-3 py-2 rounded-lg border mb-3 ${rec.badge}`}
                    >
                      💡 {rec.reason}
                    </div>

                    {/* Entities */}
                    {signal.entities?.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-gray-400 uppercase mb-1">
                          Entities
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {signal.entities.map((e: any, i: number) => (
                            <span
                              key={i}
                              className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full"
                            >
                              {e.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Metrics */}
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {['momentum', 'impact', 'novelty', 'confidence'].map((key) => (
                        <div key={key} className="text-center bg-gray-50 rounded-lg p-2">
                          <div className="text-sm font-bold text-gray-800">
                            {signal.trend_metrics?.[key] ?? 0}
                          </div>
                          <div className="text-xs text-gray-400 capitalize">{key}</div>
                        </div>
                      ))}
                    </div>

                    {/* Evidence links */}
                    {signal.evidence_urls?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase mb-1">
                          Evidence
                        </p>
                        <div className="flex flex-col gap-1">
                          {signal.evidence_urls.map((e: any, i: number) => (
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
                    )}
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
