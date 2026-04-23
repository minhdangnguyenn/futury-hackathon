import {
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  timestamp,
  varchar,
} from '@payloadcms/db-postgres/drizzle/pg-core'

const insightDecisionLabelEnum = pgEnum('enum_insights_decision_label', ['Build', 'Invest', 'Ignore'])
const insightSourceCategoryEnum = pgEnum('enum_insights_source_category', [
  'patent',
  'forum',
  'news',
  'research',
  'social',
])
const insightUseCaseEnum = pgEnum('enum_insights_use_case', [
  'competitor_move',
  'market_problem',
  'technology_scouting',
])
const insightPersonaEnum = pgEnum('enum_insights_personas', [
  'josef',
  'steffen',
  'david',
  'volkmar',
  'nick',
])
const signalSourceCategoryEnum = pgEnum('enum_signals_source_category', [
  'patent',
  'forum',
  'news',
  'research',
  'social',
])
const signalUseCaseEnum = pgEnum('enum_signals_use_case', [
  'competitor_move',
  'market_problem',
  'technology_scouting',
])
const signalPersonaEnum = pgEnum('enum_signals_personas', [
  'josef',
  'steffen',
  'david',
  'volkmar',
  'nick',
])
const trendUseCaseEnum = pgEnum('enum_trends_use_case', [
  'competitor_move',
  'market_problem',
  'technology_scouting',
])

export const insightsTable = pgTable('insights', {
  id: integer('id').primaryKey(),
  title: varchar('title').notNull(),
  summary: varchar('summary').notNull(),
  fullText: jsonb('full_text'),
  decisionLabel: insightDecisionLabelEnum('decision_label').notNull(),
  reasoning: varchar('reasoning'),
  sourceCategory: insightSourceCategoryEnum('source_category'),
  useCase: insightUseCaseEnum('use_case'),
  detectedAt: timestamp('detected_at', { mode: 'string', withTimezone: true }).notNull(),
})

export const insightPersonasTable = pgTable('insights_personas', {
  id: integer('id').primaryKey(),
  order: integer('order').notNull(),
  parentId: integer('parent_id').notNull(),
  value: insightPersonaEnum('value').notNull(),
})

export const insightSourceUrlsTable = pgTable('insights_source_urls', {
  id: varchar('id').primaryKey(),
  order: integer('_order').notNull(),
  parentId: integer('_parent_id').notNull(),
  url: varchar('url'),
})

export const signalsTable = pgTable('signals', {
  id: integer('id').primaryKey(),
  title: varchar('title').notNull(),
  content: varchar('content').notNull(),
  sourceUrl: varchar('source_url'),
  sourceCategory: signalSourceCategoryEnum('source_category'),
  topic: varchar('topic').notNull(),
  detectedAt: timestamp('detected_at', { mode: 'string', withTimezone: true }).notNull(),
  useCase: signalUseCaseEnum('use_case'),
})

export const signalPersonasTable = pgTable('signals_personas', {
  id: integer('id').primaryKey(),
  order: integer('order').notNull(),
  parentId: integer('parent_id').notNull(),
  value: signalPersonaEnum('value').notNull(),
})

export const trendsTable = pgTable('trends', {
  id: integer('id').primaryKey(),
  topic: varchar('topic').notNull(),
  date: timestamp('date', { mode: 'string', withTimezone: true }).notNull(),
  count: numeric('count', { mode: 'number' }).notNull(),
  useCase: trendUseCaseEnum('use_case'),
})
