import type { CollectionConfig } from 'payload'

const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  fields: [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
    },
    {
      name: 'role',
      label: 'Role',
      type: 'select',
      options: [
        { label: 'User', value: 'user' },
        { label: 'Admin', value: 'admin' },
      ],
      defaultValue: 'user',
      admin: { position: 'sidebar' },
    },
    {
      name: 'persona',
      label: 'Persona',
      type: 'relationship',
      relationTo: 'personas',
      required: false, // null by default
      admin: { position: 'sidebar' },
    },
  ],
}

export default Users
