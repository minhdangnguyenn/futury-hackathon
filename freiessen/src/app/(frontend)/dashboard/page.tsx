import config from '@/payload.config'
import { getPayload } from 'payload'
import { signId } from '@/lib/id-token'
import DashboardClient from './DasboardClient'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const payload = await getPayload({ config })

  let signals: any[] = []
  let competitors: any[] = []
  let loadError: string | null = null

  const useCasesRes = await payload.find({
    collection: 'use-cases',
    limit: 100,
    overrideAccess: true,
  })

  const useCases = useCasesRes.docs.map((u: any) => ({
    id: u.key,
    label: u.label,
    icon: u.icon,
    description: u.description,
    types: (u.types ?? []).map((t: any) => t.type),
  }))

  try {
    const [signalsRes, competitorsRes] = await Promise.all([
      payload.find({
        collection: 'signals',
        limit: 500,
        overrideAccess: true,
      }),
      payload.find({
        collection: 'competitors',
        limit: 500,
        overrideAccess: true,
      }),
    ])

    signals = signalsRes.docs ?? []
    competitors = competitorsRes.docs ?? []
  } catch (err) {
    loadError = err instanceof Error ? err.message : 'Could not load data from the database.'
    signals = []
    competitors = []
  }

  const competitorsWithToken = competitors.map((c: any) => ({
    id: String(c.id),
    name: String(c.name ?? ''),
    token: signId({ id: String(c.id), col: 'competitors' }),
  }))

  const signalsWithToken = signals.map((s: any) => ({
    ...s,
    token: signId({ id: String(s.id), col: 'signals' }),
  }))

  return (
    <DashboardClient
      signals={signalsWithToken as any}
      competitors={competitorsWithToken}
      useCases={useCases as any}
      loadError={loadError}
    />
  )
}
