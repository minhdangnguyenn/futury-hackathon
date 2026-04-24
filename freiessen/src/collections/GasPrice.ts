import type { CollectionConfig } from 'payload'

export const GasPrices: CollectionConfig = {
  slug: 'gas-prices',
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
      // You can choose one or more benchmarks; here are common ones.
      name: 'benchmark',
      type: 'select',
      required: true,
      defaultValue: 'TTF',
      options: ['TTF', 'Henry Hub', 'NBP', 'JKM'],
    },
    {
      name: 'unit',
      type: 'select',
      required: true,
      defaultValue: 'USD/MMBtu',
      options: ['USD/MMBtu', 'EUR/MWh'],
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
