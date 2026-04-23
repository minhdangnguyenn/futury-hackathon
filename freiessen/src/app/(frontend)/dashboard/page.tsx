import { getPayload } from 'payload'
import config from '@payload-config'
import { cookies } from 'next/headers'
import DashboardClient from './DasboardClient'

export default async function DashboardPage() {
  const payload = await getPayload({ config })

  // cookies() is async in Next.js 15
  const cookieStore = await cookies()

  const { user } = await payload.auth({
    headers: new Headers({
      cookie: cookieStore.toString(),
    }),
  })

  const { docs: signals } = await payload.find({
    collection: 'signals',
    limit: 100,
  })

  return <DashboardClient signals={signals as any[]} />
}
