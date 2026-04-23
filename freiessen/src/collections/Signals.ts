import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'

export const Signals: CollectionConfig = {
  slug: 'signals',
  access: {
    read: anyone,
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
    },
    {
      name: 'sourceUrl',
      type: 'text',
    },
    {
      name: 'sourceCategory',
      type: 'select',
      options: ['patent', 'forum', 'news', 'research', 'social'],
    },
    {
      name: 'topic',
      type: 'text',
      required: true,
    },
    {
      name: 'detectedAt',
      type: 'date',
      required: true,
    },
    {
      name: 'personas',
      type: 'select',
      hasMany: true,
      options: ['josef', 'steffen', 'david', 'volkmar', 'nick'],
    },
    {
      name: 'useCase',
      type: 'select',
      options: ['competitor_move', 'market_problem', 'technology_scouting'],
    },
  ],
}
