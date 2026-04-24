import { notFound } from 'next/navigation'
import { verifyId } from '@/lib/id-token'
import { getPayload } from 'payload'
import config from '@/payload.config'
import CompetitorDetailClient from './CompetitosDetailClient'

type CompetitorTokenPageProps = {
  params: Promise<{
    token?: string
  }>
}

export default async function CompetitorTokenPage({ params }: CompetitorTokenPageProps) {
  const { token } = await params
  if (!token) return notFound()

  const decoded = verifyId(token)
  if (!decoded) return notFound()

  if (decoded.col && decoded.col !== 'competitors') return notFound()

  const payload = await getPayload({ config })

  const competitor = await payload
    .findByID({
      collection: 'competitors',
      id: decoded.id,
      overrideAccess: true,
    })
    .catch(() => null)

  if (!competitor) return notFound()

  const signals: any[] = []

  return <CompetitorDetailClient competitor={competitor as any} signals={signals as any} />
}
