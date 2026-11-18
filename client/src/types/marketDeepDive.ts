import { z } from 'zod'

function stripCitationMarkers(text: string) {
  return text
    .replace(/\[\s*s\d+(?:\s*,\s*s\d+)*\s*\]/gi, '')
    .replace(/\s+([.,!?;:])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

const prose = z.string().transform(stripCitationMarkers).pipe(z.string().min(1))

const summarySchema = z.string().transform(raw => {
  const summary = stripCitationMarkers(raw)
  // Snapshots from the original fetcher can contain the first 360 characters of a longer summary.
  if ([...raw].length !== 360 || /[.!?]["”’)]*$/.test(summary)) return summary

  const completeSentences = summary.match(/^.*[.!?]["”’)]*(?=\s+[A-Z])/)?.[0]
  return completeSentences ?? `${summary.replace(/\s+\S+$/, '')}…`
}).pipe(z.string().min(1))

const sourceSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  url: z.string().url().refine(url => /^https?:\/\//i.test(url)),
  publisher: z.string().min(1),
  kind: z.enum(['original', 'research']),
  published_at: z.string().optional(),
})

const pointSchema = z.object({
  label: prose,
  text: prose,
  source_ids: z.array(z.string()).min(1).max(3),
})

const horizonSchema = z.enum(['near', 'long', 'counter'])
const marketDeepDiveSchema = z.object({
  headline: prose,
  summary: summarySchema,
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
