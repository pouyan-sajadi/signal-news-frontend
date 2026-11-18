import { ArrowUpRight, Radio } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { MarketDeepDive, MarketSource } from '@/types/marketDeepDive'

const horizonLabels = {
  near: 'Next 12 months',
  long: 'Next two to three years',
  counter: 'What could change this',
} as const

function SourceLinks({ ids, sources }: { ids: string[]; sources: Map<string, MarketSource> }) {
  return (
    <ul aria-label="Sources" className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
      {ids.map(id => {
        const source = sources.get(id)
        if (!source) return null
        return (
          <li key={id}>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${source.title} · ${source.publisher}`}
              className="inline-flex items-center gap-1 font-medium text-indigo-700 underline-offset-2 hover:underline dark:text-indigo-300"
            >
              {source.publisher}
              <ArrowUpRight className="h-3 w-3 shrink-0" aria-hidden="true" />
            </a>
          </li>
        )
      })}
    </ul>
  )
}

export function MarketDeepDiveCard({ brief }: { brief: MarketDeepDive }) {
  const sources = new Map(brief.sources.map(source => [source.id, source]))
  const sections = [
    { id: 'story', label: 'The story', points: brief.signals },
    { id: 'impact', label: 'Who’s affected', points: brief.impact },
    { id: 'outlook', label: 'What to watch', points: brief.outlook },
  ] as const

  return (
    <Card className="mb-4 overflow-hidden" aria-label="Market deep dive">
      <header className="bg-gradient-to-br from-indigo-100 to-blue-50 px-5 py-5 sm:px-7 sm:py-6 dark:from-indigo-950 dark:to-slate-900">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
          <Radio className="h-4 w-4" aria-hidden="true" />
          Market deep dive
        </p>
        <h2 className="mt-2 max-w-3xl text-2xl font-bold tracking-tight sm:text-3xl">{brief.headline}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-700 sm:text-base dark:text-slate-200">{brief.summary}</p>
        <SourceLinks ids={brief.summary_source_ids} sources={sources} />
      </header>
      <Tabs defaultValue="story" className="px-5 pb-5 pt-3 sm:px-7">
        <TabsList aria-label="Read the market deep dive" className="h-auto max-w-full flex-wrap justify-start">
          {sections.map(section => (
            <TabsTrigger key={section.id} value={section.id}>{section.label}</TabsTrigger>
          ))}
        </TabsList>
        {sections.map(section => (
          <TabsContent key={section.id} value={section.id} className="mt-4">
            <div className="grid gap-4 md:grid-cols-3">
              {section.points.map((point, index) => (
                <section key={index} className="min-w-0 border-t border-border pt-2">
                  {'horizon' in point && (
                    <p className="mb-1 text-xs font-medium text-muted-foreground">
                      {horizonLabels[point.horizon]}
                    </p>
                  )}
                  <h3 className="text-sm font-semibold">{point.label}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{point.text}</p>
                  <SourceLinks ids={point.source_ids} sources={sources} />
                </section>
              ))}
            </div>
          </TabsContent>
        ))}
        <details className="mt-4 border-t border-border pt-3">
          <summary className="text-sm font-medium">Sources and research</summary>
          <ul className="mt-2 space-y-2 text-sm">
            {brief.sources.map(source => (
              <li key={source.id} className="break-words">
                <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-indigo-700 underline underline-offset-2 dark:text-indigo-300">
                  {source.title}
                </a>
                <span className="block text-xs text-muted-foreground">
                  {source.publisher} · {source.kind === 'original' ? 'News coverage' : 'Research finding'}
                </span>
              </li>
            ))}
          </ul>
        </details>
      </Tabs>
    </Card>
  )
}
