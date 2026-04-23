import 'dotenv/config'
import config from '../payload.config'
import { getPayload } from 'payload'
import { competitorsSeed } from '../seeds/competitors.seed'

async function main() {
  const payload = await getPayload({ config })

  // If your competitors collection requires admin/auth for create/update,
  // login here and keep using payload instance.
  // Comment out if your collection is public writable (not recommended).
  //
  // await payload.login({
  //   email: process.env.PAYLOAD_ADMIN_EMAIL!,
  //   password: process.env.PAYLOAD_ADMIN_PASSWORD!,
  // })

  for (const competitor of competitorsSeed) {
    // Check if it already exists by unique URL
    const existing = await payload.find({
      collection: 'competitors',
      limit: 1,
      where: {
        url: {
          equals: competitor.url,
        },
      },
    })

    if (existing.docs?.length) {
      const id = existing.docs[0].id
      await payload.update({
        collection: 'competitors',
        id,
        data: competitor,
      })
    } else {
      await payload.create({
        collection: 'competitors',
        data: competitor,
      })
    }
  }

  console.log('✅ Seeded competitors:', competitorsSeed.length)
  process.exit(0)
}

main().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
