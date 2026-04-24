import type { Payload } from 'payload'

function isoDay(d: Date) {
  return d.toISOString()
}

function round2(n: number) {
  return Math.round(n * 100) / 100
}

export async function seedEnergy(payload: Payload) {
  payload.logger.info('Seeding: energy prices (oil-prices, gas-prices)...')

  // Demo trend: 24 weeks of weekly datapoints
  const weeks = 24
  const start = new Date()
  start.setDate(start.getDate() - weeks * 7)

  const oilBase = 78
  const gasBase = 3.1

  for (let i = 0; i < weeks; i++) {
    const date = new Date(start)
    date.setDate(start.getDate() + i * 7)

    const oil = oilBase + i * 0.25 + Math.sin(i / 2) * 3
    const gas = gasBase + i * 0.03 + Math.cos(i / 2) * 0.35

    await payload.create({
      collection: 'oil-prices',
      data: {
        date: isoDay(date),
        price: round2(oil),
        currency: 'USD',
        benchmark: 'Brent',
        unit: 'USD/bbl',
        source: 'seed-demo',
      },
    })

    await payload.create({
      collection: 'gas-prices',
      data: {
        date: isoDay(date),
        price: round2(gas),
        currency: 'USD',
        benchmark: 'Henry Hub',
        unit: 'USD/MMBtu',
        source: 'seed-demo',
      },
    })
  }

  payload.logger.info('Seeding: energy prices done.')
}
