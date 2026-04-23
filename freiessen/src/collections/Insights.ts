import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'

export const Insights: CollectionConfig = {
  slug: 'insights',
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
      name: 'summary',
      type: 'textarea',
      required: true,
    },
    {
      name: 'fullText',
      type: 'richText',
    },
    {
      name: 'decisionLabel',
      type: 'select',
      required: true,
      options: ['Build', 'Invest', 'Ignore'],
    },
    {
      name: 'reasoning',
      type: 'textarea',
    },
    {
      name: 'sourceCategory',
      type: 'select',
      options: ['patent', 'forum', 'news', 'research', 'social'],
    },
    {
      name: 'sourceUrls',
      type: 'array',
      fields: [
        {
          name: 'url',
          type: 'text',
        },
      ],
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
    {
      name: 'signals',
      type: 'relationship',
      relationTo: 'signals',
      hasMany: true,
    },
    {
      name: 'detectedAt',
      type: 'date',
      required: true,
    },
  ],
}
