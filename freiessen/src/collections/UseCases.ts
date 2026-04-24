import type { CollectionConfig } from 'payload'

export const UseCases: CollectionConfig = {
  slug: 'use-cases',
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['key', 'label', 'types', 'updatedAt'],
  },
  access: {
    read: () => true,
    // tighten these later if needed:
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'key',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Stable identifier used by the UI (e.g. "uc1")',
      },
    },
    {
      name: 'label',
      type: 'text',
      required: true,
    },
    {
      name: 'icon',
      type: 'text',
      required: true,
      admin: {
        description: 'Emoji or short icon string (e.g. ⚔️)',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
    },

    /**
     * types: array of strings
     * (Payload supports arrays via "type: array" + "fields")
     */
    {
      name: 'types',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'type',
          type: 'text',
          required: true,
        },
      ],
      admin: {
        description: 'Signal types included in this use case (e.g. market_shift, disruption)',
      },
    },
  ],
}
