'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PersonaFilter } from '@/components/dashboard/PersonaFilter'
import { InsightDetailModal } from '@/components/dashboard/InsightDetailModal'
import { SignalCard } from '@/components/dashboard/SignalCard'
import { SummaryBar } from '@/components/dashboard/SummaryBar'
import { TrendChart } from '@/components/dashboard/TrendChart'
import { TrendingTopicsList } from '@/components/dashboard/TrendingTopicsList'
import { UseCaseSelector } from '@/components/dashboard/UseCaseSelector'
import {
  filterByPersona,
  filterByUseCase,
  filterSignalsByPersona,
  filterSignalsByUseCase,
  filterTrendsByUseCase,
  getTopTrends,
} from '@/lib/dashboard-filters'
import type {
  Insight,
  PersonaKey,
  Signal,
  Trend,
  TrendDataPoint,
  UseCaseKey,
} from '@/types/dashboard'

interface DashboardClientProps {
  initialInsights: Insight[]
  initialSignals: Signal[]
  initialTrends: Trend[]
  dataSource: 'database' | 'seed'
}

const useCaseCopy: Record<UseCaseKey, { title: string; description: string; focus: string }> = {
  competitor_move: {
    title: 'React To A Competitor Move',
    description:
      'Track launches, patents, and channel chatter to decide whether Viega should respond now or stay disciplined.',
    focus: 'Decision focus: protect the core portfolio without chasing low-fit competitor moves.',
  },
  market_problem: {
    title: 'Analyze A Market Problem Signal',
    description:
      'Validate recurring installer and market pain points, then translate them into concrete product opportunities.',
    focus: 'Decision focus: choose the problems that are urgent, measurable, and worth solving first.',
  },
  technology_scouting: {
    title: 'Scout A New Technology',
    description:
      'Review research and startup activity to identify what should become a build, invest, or monitor decision.',
    focus: 'Decision focus: back technology that strengthens Viega differentiation in the EU market.',
  },
}

const personaNames: Record<PersonaKey, string> = {
  josef: 'Josef',
  steffen: 'Steffen',
  david: 'David',
  volkmar: 'Volkmar',
  nick: 'Nick',
}

const signalSourceLabels: Record<NonNullable<Signal['sourceCategory']>, string> = {
  patent: 'Patent',
  forum: 'Forum',
  news: 'News',
  research: 'Research',
  social: 'Social',
}

export function DashboardClient({
  initialInsights,
  initialSignals,
  initialTrends,
  dataSource,
}: DashboardClientProps) {
  const router = useRouter()
  const [isPending, startRefreshTransition] = useTransition()
  const [activePersona, setActivePersona] = useState<PersonaKey | null>(null)
  const [activeUseCase, setActiveUseCase] = useState<UseCaseKey | null>(null)
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null)

  const filteredInsights = useMemo(
    () => filterByUseCase(filterByPersona(initialInsights, activePersona), activeUseCase),
    [activePersona, activeUseCase, initialInsights],
  )
  const filteredSignals = useMemo(
    () => filterSignalsByUseCase(filterSignalsByPersona(initialSignals, activePersona), activeUseCase),
    [activePersona, activeUseCase, initialSignals],
  )
  const filteredTrends = useMemo(
    () => filterTrendsByUseCase(initialTrends, activeUseCase),
    [activeUseCase, initialTrends],
  )

  const topTrends = useMemo(() => getTopTrends(filteredTrends, 5), [filteredTrends])
  const topTopic = topTrends[0]?.topic
  const chartData: TrendDataPoint[] = useMemo(() => {
    if (!topTopic) return []

    return filteredTrends
      .filter((trend) => trend.topic === topTopic)
      .slice()
      .sort((left, right) => left.date.localeCompare(right.date))
      .map((trend) => ({ date: trend.date.slice(0, 10), count: trend.count }))
  }, [filteredTrends, topTopic])

  const visibleSignals = filteredSignals.slice(0, 6)
  const activeUseCaseMeta = activeUseCase ? useCaseCopy[activeUseCase] : null
  const newestSignalDate = filteredSignals[0]?.detectedAt ?? filteredInsights[0]?.detectedAt ?? null
  const buildNowCount = filteredInsights.filter((insight) => insight.decisionLabel === 'Build').length

  function handleRefresh() {
    startRefreshTransition(() => {
      router.refresh()
    })
  }

  return (
    <main className="min-h-screen bg-stone-100">
      <section className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">
              Viega Hackathon Dashboard
            </p>
            <div className="flex items-center gap-3">
              <div className="h-8 w-3 rounded-full bg-[#f6c744]" aria-hidden="true" />
              <h1 className="text-2xl font-semibold text-stone-950">
                Intelligent Product Assistant
              </h1>
            </div>
            <p className="max-w-3xl text-sm text-stone-600">
              Transform scattered public or simulated market signals into clear product actions for
              Viega teams: build, invest, or ignore.
            </p>
          </div>
          <Button onClick={handleRefresh} disabled={isPending} variant="outline">
            {isPending ? 'Refreshing...' : 'Refresh dashboard'}
          </Button>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-6 px-6 py-8">
        {dataSource === 'seed' && (
          <Card className="border-amber-300 bg-amber-50">
            <CardContent className="p-4 text-sm text-amber-950">
              The dashboard is currently showing simulated seed data. Once you seed the Postgres
              collections in Payload, the page will switch to live database reads through Drizzle.
            </CardContent>
          </Card>
        )}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Signals monitored</CardDescription>
              <CardTitle>{filteredSignals.length}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-stone-600">
              Public and simulated evidence points supporting the active dashboard view.
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Recommendations</CardDescription>
              <CardTitle>{filteredInsights.length}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-stone-600">
              Actionable product calls for the selected persona and use case.
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Build now</CardDescription>
              <CardTitle>{buildNowCount}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-stone-600">
              Opportunities where the signal strength already supports a build decision.
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Top trend</CardDescription>
              <CardTitle className="text-xl">{topTopic ?? 'No data yet'}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-stone-600">
              {newestSignalDate ? `Latest update: ${newestSignalDate.slice(0, 10)}` : 'Waiting for signals.'}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(340px,1fr)]">
          <div className="space-y-6">
            <Card>
              <CardHeader className="space-y-4">
                <div>
                  <CardTitle className="text-xl">Dashboard Filters</CardTitle>
                  <CardDescription>
                    Review the dashboard through the lens of the five required product personas and
                    the three hackathon use cases.
                  </CardDescription>
                </div>
                <div className="space-y-3" aria-label="Filter by persona">
                  <p className="text-sm font-medium text-stone-900">Personas</p>
                  <PersonaFilter activePersona={activePersona} onSelect={setActivePersona} />
                </div>
                <div className="space-y-3" aria-label="Filter by use case">
                  <p className="text-sm font-medium text-stone-900">Use cases</p>
                  <UseCaseSelector activeUseCase={activeUseCase} onSelect={setActiveUseCase} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone-500">
                    {activePersona ? `Persona focus: ${personaNames[activePersona]}` : 'Persona focus: all five'}
                  </p>
                  {activeUseCaseMeta ? (
                    <div className="mt-2 space-y-2">
                      <h2 className="text-lg font-semibold text-stone-950">{activeUseCaseMeta.title}</h2>
                      <p className="text-sm text-stone-700">{activeUseCaseMeta.description}</p>
                      <p className="text-sm text-stone-600">{activeUseCaseMeta.focus}</p>
                    </div>
                  ) : (
                    <div className="mt-2 space-y-2">
                      <h2 className="text-lg font-semibold text-stone-950">
                        Product manager command center
                      </h2>
                      <p className="text-sm text-stone-700">
                        Start broad, then narrow into a specific scenario to inspect the supporting
                        signals, recommendation mix, and trend volume.
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <SummaryBar insights={filteredInsights} />
                </div>
              </CardContent>
            </Card>

            <section aria-label="Insights">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-stone-950">Recommendations</h2>
                <p className="text-sm text-stone-600">
                  Click a recommendation card to inspect the reasoning and source references.
                </p>
              </div>

              {filteredInsights.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-sm text-stone-600">
                    No recommendations match the current filters yet.
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {filteredInsights.map((insight) => (
                    <SignalCard key={insight.id} insight={insight} onClick={setSelectedInsight} />
                  ))}
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Latest Signals</CardTitle>
                <CardDescription>
                  The most recent evidence points feeding the recommendation engine.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {visibleSignals.length === 0 ? (
                  <p className="text-sm text-stone-600">No signals match the active filters.</p>
                ) : (
                  <div className="space-y-4">
                    {visibleSignals.map((signal) => (
                      <article
                        key={signal.id}
                        className="rounded-xl border border-stone-200 bg-stone-50 p-4"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-white px-2 py-1 text-xs font-medium text-stone-600">
                            {signal.topic}
                          </span>
                          {signal.sourceCategory && (
                            <span className="rounded-full bg-white px-2 py-1 text-xs font-medium text-stone-600">
                              {signalSourceLabels[signal.sourceCategory]}
                            </span>
                          )}
                          <span className="text-xs text-stone-500">{signal.detectedAt.slice(0, 10)}</span>
                        </div>
                        <h3 className="mt-3 text-sm font-semibold text-stone-950">{signal.title}</h3>
                        <p className="mt-2 text-sm text-stone-700">{signal.content}</p>
                        {signal.sourceUrl && (
                          <a
                            className="mt-3 inline-flex text-sm font-medium text-blue-700 hover:underline"
                            href={signal.sourceUrl}
                            rel="noreferrer noopener"
                            target="_blank"
                          >
                            Open source
                          </a>
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Trending Topics</CardTitle>
                <CardDescription>
                  Signal volume across the active use case to help size urgency.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <TrendingTopicsList trends={topTrends} />
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-stone-900">
                    {topTopic ? `${topTopic} volume over time` : 'Trend chart'}
                  </h3>
                  <div className="h-64">
                    <TrendChart data={chartData} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>
        </section>
      </div>

      <InsightDetailModal insight={selectedInsight} onClose={() => setSelectedInsight(null)} />
    </main>
  )
}
