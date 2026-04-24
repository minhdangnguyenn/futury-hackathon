import type { Payload } from 'payload'
import { signalsSeed } from '../seeds/signals.seed'

export async function seedSignals(payload: Payload) {
  payload.logger.info(`Seeding signals (upsert by title): ${signalsSeed.length}`)

  for (const s of signalsSeed) {
    const existing = await payload.find({
      collection: 'signals',
      limit: 1,
      where: {
        title: { equals: s.title },
      },
      overrideAccess: true,
    })

    // Make mutable copies (signalsSeed is `as const`)
    const data: any = {
      signal_type: s.signal_type,
      source: s.source,
      title: s.title,
      summary: s.summary,
      entities: s.entities.map((e) => ({ name: e.name, type: e.type })),
      evidence_urls: s.evidence_urls.map((u) => ({ url: u.url, label: u.label })),
      trend_metrics: { ...s.trend_metrics },
    }

    if (existing.docs?.length) {
      await payload.update({
        collection: 'signals',
        id: existing.docs[0].id,
        data,
        overrideAccess: true,
      })
    } else {
      await payload.create({
        collection: 'signals',
        data,
        overrideAccess: true,
      })
    }
  }
}
