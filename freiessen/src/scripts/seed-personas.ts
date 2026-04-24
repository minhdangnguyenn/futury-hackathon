import type { Payload } from 'payload'
import { personasSeed } from '../seeds/personas.seed'

export async function seedPersonas(payload: Payload) {
  for (const p of personasSeed) {
    const existing = await payload.find({
      collection: 'personas',
      where: { key: { equals: p.key } },
      limit: 1,
      overrideAccess: true,
    })

    if (existing.docs.length) {
      await payload.update({
        collection: 'personas',
        id: existing.docs[0].id,
        data: p,
        overrideAccess: true,
      })
    } else {
      await payload.create({
        collection: 'personas',
        data: p,
        overrideAccess: true,
      })
    }
  }
}
