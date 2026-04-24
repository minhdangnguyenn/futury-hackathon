import type { CollectionConfig } from 'payload'

export const Metrics: CollectionConfig = {
  slug: 'metrics',
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['key', 'label', 'enabled', 'updatedAt'],
  },
  access: {
    read: () => true,
    // tighten later if needed
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'key',
      label: 'Key',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Stable identifier used in code, e.g. freshness, evidenceQuality, relevance',
      },
    },
    {
      name: 'label',
      label: 'Label',
      type: 'text',
      required: true,
      defaultValue: '',
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
    },
    {
      name: 'enabled',
      label: 'Enabled',
      type: 'checkbox',
      defaultValue: true,
    },

    // How values map into 0-100
    {
      name: 'scaleMin',
      label: 'Scale Min',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'scaleMax',
      label: 'Scale Max',
      type: 'number',
      defaultValue: 100,
    },

    // UI preferences (optional)
    {
      name: 'color',
      label: 'Color',
      type: 'text',
      admin: {
        description: 'Optional hex color for UI charts (e.g. #111827)',
      },
    },
    {
      name: 'order',
      label: 'Order',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Controls display ordering in UI',
      },
    },

    /**
     * Computation strategy:
     * - "freshness": based on createdAt/publishedAt + bucket rules
     * - "evidenceQuality": based on source + evidence_urls length
     * - "relevance": based on competitors/entities + keywords + use-case match
     *
     * This lets the admin choose which compute function applies.
     */
    {
      name: 'strategy',
      label: 'Strategy',
      type: 'select',
      required: true,
      options: [
        { label: 'Freshness', value: 'freshness' },
        { label: 'Evidence Quality', value: 'evidenceQuality' },
        { label: 'Relevance', value: 'relevance' },
      ],
    },

    // Config payload used by the strategy (optional but useful)
    {
      name: 'config',
      label: 'Config',
      type: 'json',
      admin: {
        description:
          'Optional strategy config (e.g. keyword list, source bases, bucket thresholds).',
      },
    },
  ],
}
