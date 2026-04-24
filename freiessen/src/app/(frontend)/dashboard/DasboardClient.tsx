'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Signal } from '@/lib/signals/types'
import type { UseCase } from '@/lib/signals/constants'
import { getMetrics, type SignalMetrics } from '@/lib/signals/scoring'
import { UseCaseTabs } from './UseCaseTabs'
import { SignalStrengthChart } from './SingleStrengthChart'
import { SignalList } from './SignalList'
import { AutomatedDetectionPanel } from './AutomatedDetectionPanel'
import { ChatbotWidget } from './ChatbotWidget'
import { CompetitorSignalsChart } from './CompetitorSignalsChart'

type CompetitorWithToken = { id: string; name: string; token: string }

export default function DashboardClient({
  signals: initialSignals,
  competitors,
  useCases,
  loadError,
}: {
  signals: Signal[]
  competitors: CompetitorWithToken[]
  useCases: UseCase[]
  loadError?: string | null
}) {
  const router = useRouter()

  const [detectWarning, setDetectWarning] = useState<string | null>(null)
  const [detectError, setDetectError] = useState<string | null>(null)
  const [detecting, setDetecting] = useState(false)
  const [lastDetected, setLastDetected] = useState<string | null>(null)
  const [serverDetectedCount, setServerDetectedCount] = useState<number | null>(null)

  const [keyword, setKeyword] = useState('')
  const [activeUC, setActiveUC] = useState<string>('') // set after useCases load
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    if (!useCases?.length) return
    setActiveUC((prev) => (prev && useCases.some((u) => u.id === prev) ? prev : useCases[0].id))
  }, [useCases])

  const uc = useMemo(() => {
    if (!useCases?.length) {
      return {
        id: 'uc1',
        label: 'Use Cases',
        icon: '📌',
        description: 'No use-cases found. Seed the collection.',
        types: [],
      } as UseCase
    }
    return useCases.find((u) => u.id === activeUC) ?? useCases[0]
  }, [activeUC, useCases])

  const byUC = useMemo(() => {
    if (!uc.types?.length) return initialSignals
    return initialSignals.filter((s) => uc.types.includes(s.signal_type))
  }, [initialSignals, uc.types])

  const metricsById = useMemo(() => {
    const map = new Map<string, SignalMetrics>()
    for (const s of byUC) {
      const id = (s as any).id
      if (!id) continue
      map.set(String(id), getMetrics(s, { competitors, activeUseCase: uc }))
    }
    return map
  }, [byUC, competitors, uc])

  const detectedSignals = useMemo(() => {
    return byUC.filter((s) => {
      const id = String((s as any).id ?? '')
      const m = metricsById.get(id) ?? getMetrics(s, { competitors, activeUseCase: uc })
      const score = (m.freshness + m.evidenceQuality + m.relevance) / 3
      return score >= 60
    })
  }, [byUC, metricsById, competitors, uc])

  const derivedDetectedCount = detectedSignals.length

  async function runDetection(mode: 'all' | 'keyword' = 'all') {
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

      const data = await res.json().catch(() => ({}) as any)
      if (!res.ok) throw new Error(data?.error ?? `Detection failed (HTTP ${res.status})`)

      setServerDetectedCount(typeof data?.detected === 'number' ? data.detected : 0)
      setLastDetected(new Date().toLocaleTimeString())

      router.refresh()
    } catch (e) {
      setDetectError(e instanceof Error ? e.message : 'Detection failed.')
    } finally {
      setDetecting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <h1 className="text-2xl font-bold text-gray-900">Market Signal Dashboard</h1>
        <p className="text-gray-400 text-sm mt-0.5">
          Last updated: {new Date().toLocaleDateString()} · {initialSignals.length} signals tracked
        </p>
      </div>

      <div className="p-6 max-w-6xl mx-auto">
        {loadError && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-3 mb-4 text-sm">
            {loadError}
          </div>
        )}

        {detectError && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-3 mb-4 text-sm">
            {detectError}
          </div>
        )}

        {detectWarning && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl p-3 mb-4 text-sm">
            {detectWarning}
          </div>
        )}

        <AutomatedDetectionPanel
          detecting={detecting}
          lastDetected={lastDetected}
          detectedCount={derivedDetectedCount}
          keyword={keyword}
          setKeyword={setKeyword}
          runDetection={runDetection}
        />

        <UseCaseTabs
          useCases={useCases}
          activeId={uc.id}
          onChange={(id) => {
            setActiveUC(id)
            setExpandedId(null)
          }}
        />

        <SignalStrengthChart signals={byUC} metricsById={metricsById} metric="relevance" />

        {/* ✅ now competitors includes token */}
        <CompetitorSignalsChart signals={byUC} competitors={competitors} />

        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">
            Signals <span className="text-gray-400 font-normal">({byUC.length})</span>
          </h2>
        </div>

        <SignalList
          signals={byUC}
          expandedId={expandedId}
          setExpandedId={setExpandedId}
          metricsById={metricsById}
        />
      </div>

      <ChatbotWidget />
    </div>
  )
}
