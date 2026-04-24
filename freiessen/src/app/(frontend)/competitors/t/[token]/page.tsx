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

function normalizeName(value: unknown) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}

function getRelationId(value: unknown) {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id
    if (typeof id === 'string' || typeof id === 'number') return String(id)
  }
  return null
}

function getRelationName(value: unknown) {
  if (value && typeof value === 'object' && 'name' in value) {
    return normalizeName((value as { name?: unknown }).name)
  }
  return ''
}

function buildSignalText(signal: any) {
  const parts = [signal.title, signal.summary]

  if (Array.isArray(signal.evidence_urls)) {
    signal.evidence_urls.forEach((item: any) => {
      if (item?.label) parts.push(item.label)
      if (item?.url) parts.push(item.url)
    })
  }

  if (Array.isArray(signal.entities)) {
    signal.entities.forEach((entity: any) => {
      if (entity?.name) parts.push(entity.name)
    })
  }

  return normalizeName(parts.filter(Boolean).join(' '))
}

function signalReferencesCompetitor(signal: any, normalizedCompetitorName: string, competitorId: string) {
  if (getRelationId(signal.company) === competitorId) return true
  if (getRelationName(signal.company) === normalizedCompetitorName) return true

  if (Array.isArray(signal.competitors)) {
    for (const related of signal.competitors) {
      if (getRelationId(related) === competitorId) return true
      if (getRelationName(related) === normalizedCompetitorName) return true
    }
  }

  if (Array.isArray(signal.entities)) {
    for (const entity of signal.entities) {
      if (normalizeName(entity?.name) === normalizedCompetitorName) return true
    }
  }

  const searchableText = buildSignalText(signal)
  return searchableText.includes(normalizedCompetitorName)
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

  const signalsRes = await payload.find({
    collection: 'signals',
    limit: 500,
    overrideAccess: true,
  })

  const allSignals = signalsRes.docs ?? []
  const normalizedCompetitorName = normalizeName(competitor.name)
  const competitorId = String(competitor.id)

  const signals = allSignals.filter((signal) =>
    signalReferencesCompetitor(signal, normalizedCompetitorName, competitorId),
  )

  return <CompetitorDetailClient competitor={competitor as any} signals={signals as any} />
}