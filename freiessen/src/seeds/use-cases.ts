import type { Payload } from 'payload'
import type { UseCase } from '../payload-types'

const DEFAULT_USE_CASES = [
  {
    key: 'uc1',
    label: 'Competitor Moves',
    icon: '⚔️',
    description: 'Track what competitors are building and launching',
    types: [{ type: 'market_shift' }, { type: 'disruption' }],
  },
  {
    key: 'uc2',
    label: 'Market Problems',
    icon: '📉',
    description: 'Identify unmet needs and pain points in the market',
    types: [{ type: 'trend' }, { type: 'regulatory' }, { type: 'weak_signal' }],
  },
  {
    key: 'uc3',
    label: 'Tech Scouting',
    icon: '🔬',
    description: 'Discover emerging technologies and innovations',
    types: [{ type: 'emerging_tech' }],
  },
] as const

// Helper: convert readonly default into the mutable shape Payload expects
function toUseCaseData(
  uc: (typeof DEFAULT_USE_CASES)[number],
): Omit<UseCase, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    key: uc.key,
    label: uc.label,
    icon: uc.icon,
    description: uc.description,
    // make a NEW mutable array
    types: uc.types.map((t) => ({ type: t.type })),
  }
}

export async function seedUseCases(payload: Payload) {
  for (const uc of DEFAULT_USE_CASES) {
    const existing = await payload.find({
      collection: 'use-cases',
      where: { key: { equals: uc.key } },
      limit: 1,
    })

    const data = toUseCaseData(uc)

    if (existing.docs.length) {
      await payload.update({
        collection: 'use-cases',
        id: existing.docs[0].id,
        data,
      })
    } else {
      await payload.create({
        collection: 'use-cases',
        data,
      })
    }
  }
}
