import type { Insight, Trend } from '@/types/dashboard'
import { DashboardClient } from './DashboardClient'

export const metadata = { title: 'Intelligent Product Assistant' }

export default async function DashboardPage() {
  let initialInsights: Insight[] = []
  let initialTrends: Trend[] = []

  try {
    const [insightsRes, trendsRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/insights?limit=100`, { cache: 'no-store' }),
      fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/trends?limit=200`, { cache: 'no-store' }),
    ])

    const insightsData = await insightsRes.json()
    const trendsData = await trendsRes.json()

    initialInsights = insightsData.docs ?? []
    initialTrends = trendsData.docs ?? []
  } catch {
    return (
      <main>
        <div role="alert">Data could not be loaded. Please try again.</div>
      </main>
    )
  }

  return <DashboardClient initialInsights={initialInsights} initialTrends={initialTrends} />
}
