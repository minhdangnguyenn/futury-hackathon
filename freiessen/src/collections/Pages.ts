import type { CollectionConfig } from 'payload'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'updatedAt'],
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'title',
      label: 'Title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      label: 'URL Slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Used for routing / page URLs',
      },
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      defaultValue: 'draft',
      required: true,
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
    },
    {
      name: 'content',
      label: 'Content',
      type: 'richText',
    },
    {
      name: 'meta',
      label: 'SEO Meta',
      type: 'group',
      fields: [
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'image', label: 'Meta Image', type: 'upload', relationTo: 'media' },
      ],
    },
  ],
}
