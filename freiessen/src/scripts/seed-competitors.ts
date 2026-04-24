import type { Payload } from 'payload'
import { competitorsSeed } from '../seeds/competitors.seed'

export async function seedCompetitors(payload: Payload) {
  payload.logger.info(`Seeding competitors (upsert by url): ${competitorsSeed.length}`)

  for (const competitor of competitorsSeed) {
    const existing = await payload.find({
      collection: 'competitors',
      limit: 1,
      where: {
        url: { equals: competitor.url },
      },
      overrideAccess: true,
    })

    // Make mutable copies (because competitorsSeed is `as const`)
    const data = {
      name: competitor.name,
      url: competitor.url,
      country: competitor.country,
      tags: [...competitor.tags], // remove readonly-ness
    }

    if (existing.docs?.length) {
      await payload.update({
        collection: 'competitors',
        id: existing.docs[0].id,
        data,
        overrideAccess: true,
      })
    } else {
      await payload.create({
        collection: 'competitors',
        data,
        overrideAccess: true,
      })
    }
  }
}
