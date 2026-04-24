import { getPayload } from 'payload'
import config from '@payload-config'
import DashboardClient from './DasboardClient'

export default async function DashboardPage() {
  const payload = await getPayload({ config })

  let signals: any[] = []
  let competitors: any[] = []
  let loadError: string | null = null

  try {
    const [signalsRes, competitorsRes] = await Promise.all([
      payload.find({ collection: 'signals', limit: 100 }),
      payload.find({ collection: 'competitors', limit: 200 }),
    ])

    signals = signalsRes?.docs ?? []
    competitors = competitorsRes?.docs ?? []
  } catch (err) {
    loadError = err instanceof Error ? err.message : 'Could not load data from the database.'
    signals = []
    competitors = []
  }

  return (
    <DashboardClient
      signals={signals}
      competitors={competitors.map((c: any) => ({ id: c.id, name: c.name }))}
      loadError={loadError}
    />
  )
}
