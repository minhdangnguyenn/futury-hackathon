import type { CollectionConfig } from 'payload'

const Signals: CollectionConfig = {
  slug: 'signals',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'signal_type', 'source', 'createdAt'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'signal_type',
      label: 'Signal Type',
      type: 'select',
      required: true,
      options: [
        { label: 'Trend', value: 'trend' },
        { label: 'Weak Signal', value: 'weak_signal' },
        { label: 'Disruption', value: 'disruption' },
        { label: 'Emerging Tech', value: 'emerging_tech' },
        { label: 'Regulatory', value: 'regulatory' },
        { label: 'Market Shift', value: 'market_shift' },
      ],
    },
    {
      name: 'source',
      label: 'Source',
      type: 'text',
      required: true,
    },
    {
      name: 'title',
      label: 'Title',
      type: 'text',
      required: true,
    },
    {
      name: 'summary',
      label: 'Summary',
      type: 'textarea',
      required: true,
    },
    {
      name: 'entities',
      label: 'Entities',
      type: 'array',
      fields: [
        {
          name: 'name',
          label: 'Entity Name',
          type: 'text',
          required: true,
        },
        {
          name: 'type',
          label: 'Entity Type',
          type: 'select',
          options: [
            { label: 'Company', value: 'company' },
            { label: 'Person', value: 'person' },
            { label: 'Technology', value: 'technology' },
            { label: 'Location', value: 'location' },
            { label: 'Topic', value: 'topic' },
          ],
        },
      ],
    },
    {
      name: 'evidence_urls',
      label: 'Evidence URLs',
      type: 'array',
      fields: [
        {
          name: 'url',
          label: 'URL',
          type: 'text',
          required: true,
        },
        {
          name: 'label',
          label: 'Label',
          type: 'text',
        },
      ],
    },
    {
      name: 'trend_metrics',
      label: 'Trend Metrics',
      type: 'group',
      fields: [
        {
          name: 'momentum',
          label: 'Momentum (0–100)',
          type: 'number',
          min: 0,
          max: 100,
        },
        {
          name: 'novelty',
          label: 'Novelty (0–100)',
          type: 'number',
          min: 0,
          max: 100,
        },
        {
          name: 'impact',
          label: 'Impact (0–100)',
          type: 'number',
          min: 0,
          max: 100,
        },
        {
          name: 'confidence',
          label: 'Confidence (0–100)',
          type: 'number',
          min: 0,
          max: 100,
        },
      ],
    },
  ],
  timestamps: true,
}

export default Signals
