import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { signalsSeed } from '../seeds/signals.seed'

async function main() {
  const payload = await getPayload({ config })

  // Load competitors once so we can map names -> numeric IDs
  const competitorsRes = await payload.find({
    collection: 'competitors',
    limit: 500,
  })

  const competitorIdByName = new Map<string, number>()
  for (const c of competitorsRes.docs as any[]) {
    competitorIdByName.set(String(c.name).toLowerCase(), Number(c.id))
  }

  function idsFromNames(names: string[]) {
    return names
      .map((n) => competitorIdByName.get(n.toLowerCase()))
      .filter((x): x is number => typeof x === 'number' && Number.isFinite(x))
  }

  console.log('🌱 Seeding signals...')

  for (const raw of signalsSeed) {
    const r = raw as any

    const competitorNames: string[] = Array.isArray(r?.competitor_names) ? r.competitor_names : []
    const { competitor_names, ...signal } = r

    await payload.create({
      collection: 'signals',
      data: {
        ...signal,
        competitors: competitorNames.length
          ? idsFromNames(competitorNames)
          : idsFromNames(['Geberit', 'Aliaxis']),
      },
    })
  }

  console.log('🎉 Done seeding signals!')
  process.exit(0)
}

main().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
