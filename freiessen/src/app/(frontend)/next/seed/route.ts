import { createLocalReq, getPayload } from 'payload'
import { seed } from '@/endpoints/seed'
import config from '@payload-config'
import { headers } from 'next/headers'
import { seedSignals, seedInsights, seedTrends } from '@/seed/dashboard-seed'

export const maxDuration = 60 // This function can run for a maximum of 60 seconds

export async function POST(): Promise<Response> {
  const payload = await getPayload({ config })
  const requestHeaders = await headers()

  // Authenticate by passing request headers
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    return new Response('Action forbidden.', { status: 403 })
  }

  try {
    // Create a Viega request object to pass to the Local API for transactions
    // At this point you should pass in a user, locale, and any other context you need for the Local API
    const payloadReq = await createLocalReq({ user }, payload)

    await seed({ payload, req: payloadReq })

    // ── Seed dashboard data ──────────────────────────────────────────────────

    // Guard: skip if signals already exist
    const existingSignals = await payload.find({
      collection: 'signals',
      limit: 1,
      depth: 0,
    })

    if (existingSignals.totalDocs === 0) {
      payload.logger.info('— Seeding dashboard signals...')
      for (const signal of seedSignals) {
        await payload.create({ collection: 'signals', data: signal })
      }

      payload.logger.info('— Seeding dashboard insights...')
      for (const insight of seedInsights) {
        await payload.create({ collection: 'insights', data: insight })
      }

      payload.logger.info('— Seeding dashboard trends...')
      for (const trend of seedTrends) {
        await payload.create({ collection: 'trends', data: trend })
      }

      payload.logger.info('Dashboard data seeded successfully!')
    } else {
      payload.logger.info('Dashboard data already exists — skipping dashboard seed.')
    }

    return Response.json({ success: true })
  } catch (e) {
    payload.logger.error({ err: e, message: 'Error seeding data' })
    return new Response('Error seeding data.', { status: 500 })
  }
}
