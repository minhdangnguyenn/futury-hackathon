import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import Users from './collections/Users'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Competitors } from './collections/Competitors'
import Signals from './collections/Signals'
import { UseCases } from './collections/UseCases'
import { Metrics } from './collections/Metrics'
import { seedAll } from './seeds'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Pages, Competitors, Signals, UseCases, Metrics],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [],

  onInit: async (payload) => {
    payload.logger.info(
      `DB: ${(process.env.DATABASE_URL || '').replace(/:\/\/.*@/, '://***:***@').slice(0, 120)}`,
    )

    try {
      await seedAll(payload)
    } catch (err) {
      payload.logger.error({ err }, 'Seeding failed')
    }
  },
})
