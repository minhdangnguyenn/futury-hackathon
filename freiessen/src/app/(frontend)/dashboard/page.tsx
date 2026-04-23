import { getPayload } from 'payload'
import config from '@payload-config'
import { cookies } from 'next/headers'
import DashboardClient from './DasboardClient'

export default async function DashboardPage() {
  const payload = await getPayload({ config })

  let signals: any[] = []
  let loadError: string | null = null

  try {
    const res = await payload.find({
      collection: 'signals',
      limit: 100,
    })
    signals = res?.docs ?? []
  } catch (err) {
    // Don’t crash the page if DB/table isn’t ready
    loadError = err instanceof Error ? err.message : 'Could not load signals from the database.'
    signals = []
  }

  return <DashboardClient signals={signals} loadError={loadError} />
}
