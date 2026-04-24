import type { CollectionConfig } from 'payload'

const Personas: CollectionConfig = {
  slug: 'personas',
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      label: 'Title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
    },
  ],
}

export default Personas
