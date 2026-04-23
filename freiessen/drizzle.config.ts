import 'dotenv/config'

import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
  },
  dialect: 'postgresql',
  out: './src/db/migrations',
  schema: './src/db/dashboard-schema.ts',
  strict: true,
  tablesFilter: [
    'insights',
    'insights_personas',
    'insights_source_urls',
    'signals',
    'signals_personas',
    'trends',
  ],
  verbose: true,
})
