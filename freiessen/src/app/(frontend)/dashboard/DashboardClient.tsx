'use client'

import { useState } from 'react'
import type { Insight, Trend, PersonaKey, UseCaseKey, TrendDataPoint } from '@/types/dashboard'
import { filterByPersona, filterByUseCase, getTopTrends } from '@/lib/dashboard-filters'
import { PersonaFilter } from '@/components/dashboard/PersonaFilter'
import { UseCaseSelector } from '@/components/dashboard/UseCaseSelector'
import { SummaryBar } from '@/components/dashboard/SummaryBar'
import { SignalCard } from '@/components/dashboard/SignalCard'
import { TrendingTopicsList } from '@/components/dashboard/TrendingTopicsList'
import { TrendChart } from '@/components/dashboard/TrendChart'
import { InsightDetailModal } from '@/components/dashboard/InsightDetailModal'

interface DashboardClientProps {
  initialInsights: Insight[]
  initialTrends: Trend[]
}

export function DashboardClient({ initialInsights, initialTrends }: DashboardClientProps) {
  const [insights, setInsights] = useState<Insight[]>(initialInsights)
  const [trends, setTrends] = useState<Trend[]>(initialTrends)
  const [activePersona, setActivePersona] = useState<PersonaKey | null>(null)
  const [activeUseCase, setActiveUseCase] = useState<UseCaseKey | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Derived state: filter by persona then use case
  const filteredInsights = filterByUseCase(filterByPersona(insights, activePersona), activeUseCase)

  // Trend data
  const topTrends = getTopTrends(trends, 5)
  const topTopic = topTrends[0]?.topic
  const chartData: TrendDataPoint[] = topTopic
    ? trends
        .filter((t) => t.topic === topTopic)
        .map((t) => ({ date: t.date, count: t.count }))
    : []

  async function handleRefresh() {
    setIsLoading(true)
    setError(null)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? ''
      const [insightsRes, trendsRes] = await Promise.all([
        fetch(`${baseUrl}/api/insights?limit=100`),
        fetch(`${baseUrl}/api/trends?limit=200`),
      ])

      if (!insightsRes.ok) throw new Error(`Failed to fetch insights: ${insightsRes.statusText}`)
      if (!trendsRes.ok) throw new Error(`Failed to fetch trends: ${trendsRes.statusText}`)

      const insightsData = await insightsRes.json()
      const trendsData = await trendsRes.json()

      setInsights(insightsData.docs ?? insightsData)
      setTrends(trendsData.docs ?? trendsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="flex items-center justify-between gap-4 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          {/* Viega logo placeholder */}
          <div className="h-8 w-20 rounded bg-[#FFD700]" aria-label="Viega logo" />
          <span className="text-lg font-semibold text-gray-900">Intelligent Product Assistant</span>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Refreshing…' : 'Refresh'}
        </button>
      </nav>

      {/* Error banner */}
      {error && (
        <div role="alert" className="mx-6 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mx-auto max-w-screen-xl px-6 py-6 space-y-6">
        {/* Persona filter */}
        <section aria-label="Filter by persona">
          <PersonaFilter activePersona={activePersona} onSelect={setActivePersona} />
        </section>

        {/* Use case selector */}
        <section aria-label="Filter by use case">
          <UseCaseSelector activeUseCase={activeUseCase} onSelect={setActiveUseCase} />
        </section>

        {/* Insights grid */}
        <section aria-label="Insights">
          <div className="mb-4">
            <SummaryBar insights={filteredInsights} />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-40 animate-pulse rounded-lg bg-gray-200"
                  aria-hidden="true"
                />
              ))}
            </div>
          ) : filteredInsights.length === 0 ? (
            <p className="text-sm text-gray-500">
              No insights available yet. Data is updated daily by the pipeline.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredInsights.map((insight) => (
                <SignalCard key={insight.id} insight={insight} onClick={setSelectedInsight} />
              ))}
            </div>
          )}
        </section>

        {/* Trend section */}
        <section aria-label="Trends" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <h2 className="mb-3 text-base font-semibold text-gray-900">Trending Topics</h2>
            <TrendingTopicsList trends={topTrends} />
          </div>
          <div>
            <h2 className="mb-3 text-base font-semibold text-gray-900">
              {topTopic ? `Trend: ${topTopic}` : 'Trend Chart'}
            </h2>
            <div className="h-64">
              <TrendChart data={chartData} topic={topTopic ?? ''} />
            </div>
          </div>
        </section>
      </div>

      {/* Insight detail modal */}
      <InsightDetailModal insight={selectedInsight} onClose={() => setSelectedInsight(null)} />
    </main>
  )
}
