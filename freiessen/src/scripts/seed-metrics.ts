import type { Payload } from 'payload'
import { metricsSeed } from '../seeds/metrics.seed'

export async function seedMetrics(payload: Payload) {
  for (const m of metricsSeed) {
    const existing = await payload.find({
      collection: 'metrics',
      where: { key: { equals: m.key } },
      limit: 1,
      overrideAccess: true,
    })

    // make mutable copies (seed is as const)
    const data = {
      key: m.key,
      label: m.label,
      description: m.description,
      enabled: m.enabled,
      order: m.order,
      color: m.color,
      strategy: m.strategy,
      config: m.config,
      scaleMin: 0,
      scaleMax: 100,
    }

    if (existing.docs.length) {
      await payload.update({
        collection: 'metrics',
        id: existing.docs[0].id,
        data,
        overrideAccess: true,
      })
    } else {
      await payload.create({
        collection: 'metrics',
        data,
        overrideAccess: true,
      })
    }
  }
}
