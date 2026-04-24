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
import { CompetitorSignalsChart } from './CompetitorSignalsChart'
import { ChatbotWidget } from './ChatbotWidget'
import { EnergyTrendChart } from './EnergeTrendChart'

type CompetitorWithToken = { id: string; name: string; token: string }
type PricePoint = { date: string; price: number }

export default function DashboardClient({
  signals: initialSignals,
  competitors,
  useCases,
  loadError,

  // keep these props (optional). We will fall back to them if present.
  oilPrices = [],
  gasPrices = [],
}: {
  signals: Signal[]
  competitors: CompetitorWithToken[]
  useCases: UseCase[]
  loadError?: string | null
  oilPrices?: PricePoint[]
  gasPrices?: PricePoint[]
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

  // ✅ energy state fetched from API (so DashboardPage can remain unchanged)
  const [energyLoading, setEnergyLoading] = useState(false)
  const [energyError, setEnergyError] = useState<string | null>(null)
  const [energyOil, setEnergyOil] = useState<PricePoint[]>([])
  const [energyGas, setEnergyGas] = useState<PricePoint[]>([])

  useEffect(() => {
    if (!useCases?.length) return
    setActiveUC((prev) => (prev && useCases.some((u) => u.id === prev) ? prev : useCases[0].id))
  }, [useCases])

  // Fetch energy prices once
  useEffect(() => {
    let cancelled = false

    async function loadEnergy() {
      setEnergyLoading(true)
      setEnergyError(null)
      try {
        const res = await fetch('/api/energy-prices', { method: 'GET' })
        const data = await res.json().catch(() => ({}) as any)
        if (!res.ok) throw new Error(data?.error ?? `Energy fetch failed (HTTP ${res.status})`)

        const oil = Array.isArray(data?.oil) ? data.oil : []
        const gas = Array.isArray(data?.gas) ? data.gas : []

        const normOil = oil
          .map((p: any) => ({ date: String(p.date), price: Number(p.price) }))
          .filter((p: any) => p.date && Number.isFinite(p.price))

        const normGas = gas
          .map((p: any) => ({ date: String(p.date), price: Number(p.price) }))
          .filter((p: any) => p.date && Number.isFinite(p.price))

        if (!cancelled) {
          setEnergyOil(normOil)
          setEnergyGas(normGas)
        }
      } catch (e) {
        if (!cancelled)
          setEnergyError(e instanceof Error ? e.message : 'Failed to load energy prices')
      } finally {
        if (!cancelled) setEnergyLoading(false)
      }
    }

    loadEnergy()
    return () => {
      cancelled = true
    }
  }, [])

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

  // ✅ Choose API-fetched energy first; fall back to props if you later pass them
  const chartOilPoints = useMemo<PricePoint[]>(() => {
    const source = energyOil.length ? energyOil : oilPrices
    return (source ?? [])
      .map((p: any) => ({ date: String(p.date), price: Number(p.price) }))
      .filter((p) => p.date && Number.isFinite(p.price))
  }, [energyOil, oilPrices])

  const chartGasPoints = useMemo<PricePoint[]>(() => {
    const source = energyGas.length ? energyGas : gasPrices
    return (source ?? [])
      .map((p: any) => ({ date: String(p.date), price: Number(p.price) }))
      .filter((p) => p.date && Number.isFinite(p.price))
  }, [energyGas, gasPrices])

  const chatContext = useMemo(() => {
    const topSignals = byUC.slice(0, 10).map((s) => {
      const id = String((s as any).id ?? '')
      const m = metricsById.get(id)
      return {
        id,
        title: (s as any).title ?? (s as any).name ?? null,
        signal_type: (s as any).signal_type ?? null,
        relevance: m?.relevance ?? null,
        freshness: m?.freshness ?? null,
        evidenceQuality: m?.evidenceQuality ?? null,
        sentiment: (s as any).sentiment ?? null,
      }
    })

    return {
      activeUseCase: { id: uc.id, label: uc.label, types: uc.types ?? [] },
      keyword,
      expandedSignalId: expandedId,
      counts: {
        totalSignals: initialSignals.length,
        signalsInUseCase: byUC.length,
        detectedSignalsDerived: derivedDetectedCount,
        detectedSignalsFromServer: serverDetectedCount,
        competitors: competitors.length,
        useCases: useCases.length,
      },
      topSignals,
      energy: {
        oilPoints: chartOilPoints.slice(-12),
        gasPoints: chartGasPoints.slice(-12),
      },
    }
  }, [
    byUC,
    chartGasPoints,
    chartOilPoints,
    competitors.length,
    derivedDetectedCount,
    expandedId,
    initialSignals.length,
    keyword,
    metricsById,
    serverDetectedCount,
    uc.id,
    uc.label,
    uc.types,
    useCases.length,
  ])

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

        {/* ✅ Energy price trend charts (Oil + Gas) */}
        <div className="mb-2 text-xs text-gray-400">
          {energyLoading
            ? 'Loading energy prices...'
            : energyError
              ? `Energy prices error: ${energyError}`
              : `Oil points: ${chartOilPoints.length} · Gas points: ${chartGasPoints.length}`}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-6">
          <EnergyTrendChart title="Oil price trend" points={chartOilPoints} />
          <EnergyTrendChart title="Gas price trend" points={chartGasPoints} />
        </div>

        <SignalStrengthChart signals={byUC} metricsById={metricsById} metric="relevance" />

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

      <ChatbotWidget context={chatContext} />
    </div>
  )
}
