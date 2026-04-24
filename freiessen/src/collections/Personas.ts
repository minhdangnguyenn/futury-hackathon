import type { CollectionConfig } from 'payload'

export const Personas: CollectionConfig = {
  slug: 'personas',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'key',
      label: 'Key',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'name',
      label: 'Name',
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
