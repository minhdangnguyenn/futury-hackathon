import type { CollectionConfig } from 'payload'

export const Metrics: CollectionConfig = {
  slug: 'metrics',
  admin: { useAsTitle: 'label' },
  fields: [
    { name: 'key', type: 'text', required: true, unique: true },
    { name: 'label', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    { name: 'enabled', type: 'checkbox', defaultValue: true },
    { name: 'order', type: 'number' },
    { name: 'color', type: 'text' },
    { name: 'strategy', type: 'text' },
    { name: 'config', type: 'json' },
    { name: 'scaleMin', type: 'number', defaultValue: 0 },
    { name: 'scaleMax', type: 'number', defaultValue: 100 },
  ],
}
