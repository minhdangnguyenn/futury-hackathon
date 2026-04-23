import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'

export const Trends: CollectionConfig = {
  slug: 'trends',
  access: {
    read: anyone,
  },
  admin: {
    useAsTitle: 'topic',
  },
  fields: [
    {
      name: 'topic',
      type: 'text',
      required: true,
    },
    {
      name: 'date',
      type: 'date',
      required: true,
    },
    {
      name: 'count',
      type: 'number',
      required: true,
    },
    {
      name: 'useCase',
      type: 'select',
      options: ['competitor_move', 'market_problem', 'technology_scouting'],
    },
  ],
}
