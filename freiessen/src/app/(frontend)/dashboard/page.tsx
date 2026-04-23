import { getDashboardData } from '@/lib/dashboard-data'
import { DashboardClient } from './DashboardClient'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Viega Dashboard | Intelligent Product Assistant' }

export default async function DashboardPage() {
  const { insights, signals, trends, dataSource } = await getDashboardData()

  return (
    <DashboardClient
      dataSource={dataSource}
      initialInsights={insights}
      initialSignals={signals}
      initialTrends={trends}
    />
  )
}
