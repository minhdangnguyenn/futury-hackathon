import { getPayload } from 'payload'
import config from '@payload-config'
import DashboardClient from './DasboardClient'

export default async function DashboardPage() {
  const payload = await getPayload({ config })
  const { docs: signals } = await payload.find({
    collection: 'signals',
    limit: 100,
  })

  return <DashboardClient signals={signals as any[]} />
}
