import type { CollectionConfig } from 'payload'

export const Competitors: CollectionConfig = {
  slug: 'competitors',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'url', 'industry', 'status', 'createdAt'],
  },

  fields: [
    {
      name: 'name',
      label: 'Competitor Name',
      type: 'text',
      required: true,
    },
    {
      name: 'url',
      label: 'Competitor URL',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Company website (used to associate incoming signals).',
      },
    },
    {
      name: 'industry',
      label: 'Industry / Category',
      type: 'select',
      options: [
        { label: 'Plumbing / Fittings', value: 'plumbing' },
        { label: 'Cooling / Data Centers', value: 'cooling' },
        { label: 'Water Infrastructure', value: 'water' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Paused', value: 'paused' },
      ],
    },
    {
      name: 'notes',
      label: 'Notes',
      type: 'textarea',
    },
  ],
}
