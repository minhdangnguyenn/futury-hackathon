'use client'

import { useState } from 'react'
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

const PERSONAS = [
  { id: 'josef', label: 'Josef', focus: 'compliance' },
  { id: 'steffen', label: 'Steffen', focus: 'feasibility' },
  { id: 'david', label: 'David', focus: 'innovation' },
  { id: 'volkmar', label: 'Volkmar', focus: 'market' },
  { id: 'nick', label: 'Nick', focus: 'sustainability' },
]

const USE_CASES = [
  { id: 'uc1', label: 'UC1 — Competitor Moves', types: ['market_shift', 'disruption'] },
  { id: 'uc2', label: 'UC2 — Market Problems', types: ['trend', 'regulatory', 'weak_signal'] },
  { id: 'uc3', label: 'UC3 — Tech Scouting', types: ['emerging_tech'] },
]

function getRecommendation(signal: any, persona: string) {
  const { momentum, impact, novelty, confidence } = signal.trend_metrics ?? {}
  const score = (momentum + impact + novelty + confidence) / 4

  // a lookup table that maps each persona to their own version of the recommendation reason text.
  const recMap: Record<string, { build: string; invest: string; ignore: string }> = {
    josef: {
      build: 'Meets compliance standards — proceed',
      invest: 'Assess regulatory risk first',
      ignore: 'Low reliability signal',
    },
    steffen: {
      build: 'High feasibility — ship it',
      invest: 'Needs scoping before commit',
      ignore: 'Not actionable yet',
    },
    david: {
      build: 'Strong differentiation opportunity',
      invest: 'Explore further for novelty',
      ignore: 'Too incremental',
    },
    volkmar: {
      build: 'Market confirmed — move fast',
      invest: 'Monitor competitors closely',
      ignore: 'Weak market signal',
    },
    nick: {
      build: 'Strong sustainability fit',
      invest: 'Evaluate lifecycle impact',
      ignore: 'Low green relevance',
    },
  }

  const labels = recMap[persona] ?? recMap.david

  if (score >= 75)
    return { label: '🟢 Build', reason: labels.build, color: 'bg-green-100 border-green-400' }
  if (score >= 55)
    return { label: '🟡 Invest', reason: labels.invest, color: 'bg-yellow-100 border-yellow-400' }
  return { label: '🔴 Ignore', reason: labels.ignore, color: 'bg-red-100 border-red-400' }
}

export default function DashboardClient({ signals }: { signals: any[] }) {
  const [activeUC, setActiveUC] = useState('uc1')
  const [activePersona, setActivePersona] = useState('josef')

  const uc = USE_CASES.find((u) => u.id === activeUC)!
  const filtered = signals.filter((s) => uc.types.includes(s.signal_type))

  // Bar chart data
  const barData = filtered.map((s) => ({
    name: s.title.slice(0, 28) + '…',
    Momentum: s.trend_metrics?.momentum ?? 0,
    Impact: s.trend_metrics?.impact ?? 0,
    Novelty: s.trend_metrics?.novelty ?? 0,
    Confidence: s.trend_metrics?.confidence ?? 0,
  }))

  // Radar chart — average across filtered signals
  const avg = (key: string) =>
    Math.round(
      filtered.reduce((acc, s) => acc + (s.trend_metrics?.[key] ?? 0), 0) / (filtered.length || 1),
    )

  const radarData = [
    { metric: 'Momentum', value: avg('momentum') },
    { metric: 'Impact', value: avg('impact') },
    { metric: 'Novelty', value: avg('novelty') },
    { metric: 'Confidence', value: avg('confidence') },
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Signal Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Persona selector */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Persona</p>
        <div className="flex gap-2 flex-wrap">
          {PERSONAS.map((p) => (
            <button
              key={p.id}
              onClick={() => setActivePersona(p.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all
                ${
                  activePersona === p.id
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Use case tabs */}
      <div className="mb-6 flex gap-2">
        {USE_CASES.map((u) => (
          <button
            key={u.id}
            onClick={() => setActiveUC(u.id)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold border transition-all
              ${
                activeUC === u.id
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-gray-600'
              }`}
          >
            {u.label}
          </button>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Bar chart */}
        <div className="bg-white rounded-2xl shadow p-4">
          <h2 className="font-semibold text-gray-700 mb-4">Signal Metrics Comparison</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData} margin={{ left: -10 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Momentum" fill="#3b82f6" />
              <Bar dataKey="Impact" fill="#10b981" />
              <Bar dataKey="Novelty" fill="#f59e0b" />
              <Bar dataKey="Confidence" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Radar chart */}
        <div className="bg-white rounded-2xl shadow p-4">
          <h2 className="font-semibold text-gray-700 mb-4">Average Signal Profile</h2>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <Radar
                name="Score"
                dataKey="value"
                fill="#3b82f6"
                fillOpacity={0.4}
                stroke="#3b82f6"
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Signal cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((signal) => {
          const rec = getRecommendation(signal, activePersona)
          return (
            <div
              key={signal.id}
              className={`bg-white rounded-2xl shadow border-l-4 p-5 ${rec.color}`}
            >
              {/* Badge + type */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  {signal.signal_type.replace('_', ' ')}
                </span>
                <span className={`text-xs font-bold px-2 py-1 rounded-full border ${rec.color}`}>
                  {rec.label}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-bold text-gray-800 text-sm mb-2 leading-snug">{signal.title}</h3>

              {/* Summary */}
              <p className="text-gray-500 text-xs leading-relaxed mb-3">{signal.summary}</p>

              {/* Recommendation reason */}
              <div className="text-xs font-medium text-gray-700 mb-3 italic">💡 {rec.reason}</div>

              {/* Entities */}
              {signal.entities?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {signal.entities.map((e: any, i: number) => (
                    <span
                      key={i}
                      className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full"
                    >
                      {e.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Evidence links */}
              {signal.evidence_urls?.length > 0 && (
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
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
