import { desc, inArray } from '@payloadcms/db-postgres/drizzle'
import config from '@payload-config'
import { getPayload } from 'payload'

import {
  insightPersonasTable,
  insightsTable,
  insightSourceUrlsTable,
  signalPersonasTable,
  signalsTable,
  trendsTable,
} from '@/db/dashboard-schema'
import { seedInsights, seedSignals, seedTrends } from '@/seed/dashboard-seed'
import type { DecisionLabel, Insight, PersonaKey, Signal, Trend } from '@/types/dashboard'

type DashboardDataSource = 'database' | 'seed'

export interface DashboardData {
  insights: Insight[]
  signals: Signal[]
  trends: Trend[]
  dataSource: DashboardDataSource
}

const fallbackDashboardData: DashboardData = {
  dataSource: 'seed',
  insights: seedInsights.map((insight, index) => ({
    id: `seed-insight-${index + 1}`,
    ...insight,
  })),
  signals: seedSignals.map((signal, index) => ({
    id: `seed-signal-${index + 1}`,
    ...signal,
  })),
  trends: seedTrends.map((trend, index) => ({
    id: `seed-trend-${index + 1}`,
    ...trend,
  })),
}

export async function getDashboardData(): Promise<DashboardData> {
  try {
    const payload = await getPayload({ config })
    const db = payload.db.drizzle

    const [insightRows, signalRows, trendRows] = await Promise.all([
      db.select().from(insightsTable).orderBy(desc(insightsTable.detectedAt)),
      db.select().from(signalsTable).orderBy(desc(signalsTable.detectedAt)),
      db.select().from(trendsTable).orderBy(desc(trendsTable.date)),
    ])

    if (insightRows.length === 0 && signalRows.length === 0 && trendRows.length === 0) {
      return fallbackDashboardData
    }

    const insightIds = insightRows.map(({ id }) => id)
    const signalIds = signalRows.map(({ id }) => id)

    const [insightPersonaRows, insightSourceRows, signalPersonaRows] = await Promise.all([
      insightIds.length > 0
        ? db
            .select()
            .from(insightPersonasTable)
            .where(inArray(insightPersonasTable.parentId, insightIds))
            .orderBy(insightPersonasTable.parentId, insightPersonasTable.order)
        : Promise.resolve([]),
      insightIds.length > 0
        ? db
            .select()
            .from(insightSourceUrlsTable)
            .where(inArray(insightSourceUrlsTable.parentId, insightIds))
            .orderBy(insightSourceUrlsTable.parentId, insightSourceUrlsTable.order)
        : Promise.resolve([]),
      signalIds.length > 0
        ? db
            .select()
            .from(signalPersonasTable)
            .where(inArray(signalPersonasTable.parentId, signalIds))
            .orderBy(signalPersonasTable.parentId, signalPersonasTable.order)
        : Promise.resolve([]),
    ])

    const personasByInsightId = new Map<number, PersonaKey[]>()
    for (const row of insightPersonaRows) {
      const personas = personasByInsightId.get(row.parentId) ?? []
      personas.push(row.value)
      personasByInsightId.set(row.parentId, personas)
    }

    const sourceUrlsByInsightId = new Map<number, Array<{ url: string }>>()
    for (const row of insightSourceRows) {
      if (!row.url) continue

      const sourceUrls = sourceUrlsByInsightId.get(row.parentId) ?? []
      sourceUrls.push({ url: row.url })
      sourceUrlsByInsightId.set(row.parentId, sourceUrls)
    }

    const personasBySignalId = new Map<number, PersonaKey[]>()
    for (const row of signalPersonaRows) {
      const personas = personasBySignalId.get(row.parentId) ?? []
      personas.push(row.value)
      personasBySignalId.set(row.parentId, personas)
    }

    return {
      dataSource: 'database',
      insights: insightRows.map((row) => ({
        id: row.id,
        title: row.title,
        summary: row.summary,
        fullText: row.fullText ?? undefined,
        decisionLabel: row.decisionLabel as DecisionLabel,
        reasoning: row.reasoning ?? undefined,
        sourceCategory: row.sourceCategory ?? 'news',
        sourceUrls: sourceUrlsByInsightId.get(row.id) ?? [],
        personas: personasByInsightId.get(row.id) ?? [],
        useCase: row.useCase ?? undefined,
        detectedAt: row.detectedAt,
      })),
      signals: signalRows.map((row) => ({
        id: row.id,
        title: row.title,
        content: row.content,
        sourceUrl: row.sourceUrl ?? undefined,
        sourceCategory: row.sourceCategory ?? undefined,
        topic: row.topic,
        detectedAt: row.detectedAt,
        personas: personasBySignalId.get(row.id) ?? [],
        useCase: row.useCase ?? undefined,
      })),
      trends: trendRows.map((row) => ({
        id: row.id,
        topic: row.topic,
        date: row.date,
        count: row.count,
        useCase: row.useCase ?? undefined,
      })),
    }
  } catch {
    return fallbackDashboardData
  }
}
