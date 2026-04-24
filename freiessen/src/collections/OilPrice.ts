import type { CollectionConfig } from 'payload'

export const OilPrices: CollectionConfig = {
  slug: 'oil-prices',
  admin: {
    useAsTitle: 'date',
    defaultColumns: ['date', 'price', 'currency', 'benchmark'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'date',
      type: 'date',
      required: true,
      index: true,
      admin: { date: { pickerAppearance: 'dayOnly' } },
    },
    {
      name: 'price',
      type: 'number',
      required: true,
    },
    {
      name: 'currency',
      type: 'select',
      required: true,
      defaultValue: 'USD',
      options: ['USD', 'EUR'],
    },
    {
      name: 'benchmark',
      type: 'select',
      required: true,
      defaultValue: 'Brent',
      options: ['Brent', 'WTI'],
    },
    {
      name: 'unit',
      type: 'select',
      required: true,
      defaultValue: 'USD/bbl',
      options: ['USD/bbl'],
    },
    {
      name: 'source',
      type: 'text',
      required: false,
    },
    {
      name: 'notes',
      type: 'textarea',
      required: false,
    },
  ],
}
