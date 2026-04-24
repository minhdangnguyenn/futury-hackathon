import { NextResponse } from 'next/server'
import config from '@/payload.config'
import { getPayload } from 'payload'

export async function GET() {
  const payload = await getPayload({ config })

  // CHANGE THESE if your slugs are 'oil-prices' / 'gas-prices'
  const OIL_COLLECTION = 'oil-prices'
  const GAS_COLLECTION = 'gas-prices'

  try {
    const [oilRes, gasRes] = await Promise.all([
      payload.find({
        collection: OIL_COLLECTION as any,
        limit: 500,
        sort: 'date',
        overrideAccess: true,
      }),
      payload.find({
        collection: GAS_COLLECTION as any,
        limit: 500,
        sort: 'date',
        overrideAccess: true,
      }),
    ])

    const oil = (oilRes.docs ?? [])
      .map((d: any) => ({ date: String(d.date), price: Number(d.price) }))
      .filter((p: any) => p.date && Number.isFinite(p.price))

    const gas = (gasRes.docs ?? [])
      .map((d: any) => ({ date: String(d.date), price: Number(d.price) }))
      .filter((p: any) => p.date && Number.isFinite(p.price))

    return NextResponse.json({ oil, gas })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to load energy prices'
    return NextResponse.json({ error: message, oil: [], gas: [] }, { status: 500 })
  }
}
