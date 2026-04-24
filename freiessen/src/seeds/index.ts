import type { Payload } from 'payload'
import { seedUseCases } from './use-cases'
import { seedCompetitors } from '../scripts/seed-competitors'
import { seedSignals } from '../scripts/seed-signals'
import { seedUsers } from '@/scripts/seed-users'
import { seedMetrics } from '@/scripts/seed-metrics'
import { seedPersonas } from '@/scripts/seed-personas'

export async function seedAll(payload: Payload) {
  payload.logger.info('Seeding: upserting defaults (use-cases, competitors, signals)...')

  await seedUseCases(payload)
  await seedCompetitors(payload)
  await seedSignals(payload)
  await seedMetrics(payload)
  await seedUsers(payload)
  await seedPersonas(payload)

  payload.logger.info('Seeding: done.')
}
