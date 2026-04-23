import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { signalsSeed } from '../seeds/signals.seed'

async function main() {
  const payload = await getPayload({ config })

  console.log('🌱 Seeding signals...')

  for (const signal of signalsSeed) {
    const result = await payload.create({
      collection: 'signals',
      data: signal as any,
    })
    console.log(`✅ Created: ${result.title}`)
  }

  console.log('🎉 Done seeding signals!')
  process.exit(0)
}

main().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
