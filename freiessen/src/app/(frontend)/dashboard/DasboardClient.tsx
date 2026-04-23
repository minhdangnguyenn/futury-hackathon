'use client'

import { useMemo, useState } from 'react'
import type { Signal } from '@/lib/signals/types'
import type { UseCase } from '@/lib/signals/constants'
import { RECOMMENDATION_FILTERS } from '@/lib/signals/constants'
import { getRecommendation, getScore } from '@/lib/signals/scoring'
import { UseCaseTabs } from './UseCaseTabs'
import { RecommendationSummary } from './RecommendationSummary'
import { SignalStrengthChart } from './SingleStrengthChart'
import { SignalList } from './SignalList'
import { AutomatedDetectionPanel } from './AutomatedDetectionPanel'

export const USE_CASES: UseCase[] = [
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

export default function DashboardClient({
  signals,
  loadError,
}: {
  signals: Signal[]
  loadError?: string | null
}) {
  const [detectWarning, setDetectWarning] = useState<string | null>(null)
  const [activeUC, setActiveUC] = useState<string>('uc1')
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const [detecting, setDetecting] = useState(false)
  const [lastDetected, setLastDetected] = useState<string | null>(null)
  const [detectedCount, setDetectedCount] = useState<number | null>(null)
  const [keyword, setKeyword] = useState('')

  const [detectError, setDetectError] = useState<string | null>(null)

  async function runDetection(mode: 'all' | 'keyword' = 'all') {
    // clear previous messages
    setDetectError(null)
    setDetectWarning(null)

    if (mode === 'keyword' && !keyword.trim()) {
      setDetectWarning('Keyword input is empty. Please type a keyword first.')
      return
    }

    setDetecting(true)
    try {
      const body =
        mode === 'keyword' ? { mode: 'keyword', keyword: keyword.trim() } : { mode: 'all' }

      const res = await fetch('/api/detect-signals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error ?? `Detection failed (HTTP ${res.status})`)

      setDetectedCount(data.detected ?? 0)
      setLastDetected(new Date().toLocaleTimeString())

      window.location.reload()
    } catch (e) {
      setDetectError(e instanceof Error ? e.message : 'Detection failed.')
    } finally {
      setDetecting(false)
    }
  }

  const uc = useMemo(() => USE_CASES.find((u) => u.id === activeUC) ?? USE_CASES[0], [activeUC])

  const byUC = useMemo(
    () => signals.filter((s) => uc.types.includes(s.signal_type)),
    [signals, uc.types],
  )

  const filtered = useMemo(() => {
    return byUC.filter((s) =>
      activeFilter === 'all' ? true : getRecommendation(s).id === activeFilter,
    )
  }, [byUC, activeFilter])

  const buildCount = useMemo(
    () => byUC.filter((s) => getRecommendation(s).id === 'build').length,
    [byUC],
  )
  const investCount = useMemo(
    () => byUC.filter((s) => getRecommendation(s).id === 'invest').length,
    [byUC],
  )
  const ignoreCount = useMemo(
    () => byUC.filter((s) => getRecommendation(s).id === 'ignore').length,
    [byUC],
  )

  // optional: keep this if you still need getScore elsewhere; otherwise remove
  void getScore

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <h1 className="text-2xl font-bold text-gray-900">Market Signal Dashboard</h1>
        <p className="text-gray-400 text-sm mt-0.5">
          Last updated: {new Date().toLocaleDateString()} · {signals.length} signals tracked
        </p>
      </div>

      <div className="p-6 max-w-6xl mx-auto">
        {detectWarning && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl p-3 mb-4 text-sm">
            {detectWarning}
          </div>
        )}
        <AutomatedDetectionPanel
          detecting={detecting}
          lastDetected={lastDetected}
          detectedCount={detectedCount}
          keyword={keyword}
          setKeyword={setKeyword}
          runDetection={runDetection}
        />

        <UseCaseTabs
          useCases={USE_CASES}
          activeId={activeUC}
          onChange={(id) => {
            setActiveUC(id)
            setActiveFilter('all')
            setExpandedId(null)
          }}
        />

        <RecommendationSummary
          buildCount={buildCount}
          investCount={investCount}
          ignoreCount={ignoreCount}
          activeFilter={activeFilter}
          onToggle={(id) => setActiveFilter(activeFilter === id ? 'all' : id)}
        />

        <SignalStrengthChart signals={byUC} />

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

        <SignalList signals={filtered} expandedId={expandedId} setExpandedId={setExpandedId} />
      </div>
    </div>
  )
}
