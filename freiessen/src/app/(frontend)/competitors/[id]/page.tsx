import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import CompetitorDetailClient from './CompetitosDetailClient'

export default async function CompetitorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const payload = await getPayload({ config })

  const competitor = await payload
    .findByID({
      collection: 'competitors',
      id,
      depth: 0,
      overrideAccess: true,
    })
    .catch(() => null)

  if (!competitor) return notFound()

  const signalsRes = await payload.find({
    collection: 'signals',
    limit: 200,
    depth: 0,
    overrideAccess: true,
    where: {
      'entities.name': { equals: competitor.name },
    },
    sort: '-createdAt',
  })

  return <CompetitorDetailClient competitor={competitor as any} signals={signalsRes.docs as any} />
}
