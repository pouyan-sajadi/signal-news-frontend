import { z } from 'zod'

const sourceSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  url: z.string().url().refine(url => /^https?:\/\//i.test(url)),
  publisher: z.string().min(1),
  kind: z.enum(['original', 'research']),
  published_at: z.string().optional(),
})

const pointSchema = z.object({
  label: z.string().min(1),
  text: z.string().min(1),
  source_ids: z.array(z.string()).min(1).max(3),
})

const horizonSchema = z.enum(['near', 'long', 'counter'])
const marketDeepDiveSchema = z.object({
  headline: z.string().min(1),
  summary: z.string().min(1),
  summary_source_ids: z.array(z.string()).min(1).max(3),
  signals: z.array(pointSchema).min(2).max(3),
  impact: z.array(pointSchema).min(1).max(3),
  outlook: z.array(pointSchema.extend({ horizon: horizonSchema })).length(3),
  sources: z.array(sourceSchema).min(2).max(21),
}).refine(brief => {
  const sources = new Set(brief.sources.map(source => source.id))
  const points = [...brief.signals, ...brief.impact, ...brief.outlook]
  return sources.size === brief.sources.length &&
    new Set(brief.outlook.map(point => point.horizon)).size === 3 &&
    [...brief.summary_source_ids, ...points.flatMap(point => point.source_ids)].every(id => sources.has(id))
})

export type MarketDeepDive = z.infer<typeof marketDeepDiveSchema>
export type MarketSource = z.infer<typeof sourceSchema>

export function parseMarketDeepDive(value: unknown): MarketDeepDive | null {
  const result = marketDeepDiveSchema.safeParse(value)
  return result.success ? result.data : null
}
