import { Radio } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { MarketDeepDive, MarketSource } from '@/types/marketDeepDive'

const horizonLabels = {
  near: 'Next 12 months',
  long: 'Next two to three years',
  counter: 'What could change this',
} as const

type NumberedSource = MarketSource & { number: number }

function InlineCitations({ ids, sources }: { ids: string[]; sources: Map<string, NumberedSource> }) {
  return (
    <sup className="ml-1 inline-flex gap-1 whitespace-nowrap text-xs">
      {[...new Set(ids)].map(id => {
        const source = sources.get(id)
        if (!source) return null
        return (
          <a
            key={id}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Source ${source.number}: ${source.title}`}
            title={source.title}
            className="font-medium text-indigo-700 underline underline-offset-2"
          >
            {source.number}
          </a>
        )
      })}
    </sup>
  )
}

export function MarketDeepDiveCard({ brief }: { brief: MarketDeepDive }) {
  const sources = new Map(brief.sources.map((source, index) => [source.id, { ...source, number: index + 1 }]))
  const sections = [
    { id: 'story', label: 'The story', points: brief.signals },
    { id: 'impact', label: 'Who’s affected', points: brief.impact },
    { id: 'outlook', label: 'What to watch', points: brief.outlook },
  ] as const

  return (
    <Card className="market-card" aria-label="Market deep dive">
      <header className="bg-gradient-to-br from-indigo-100 to-blue-50 px-5 py-5 sm:px-7 sm:py-6">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-700">
          <Radio className="h-4 w-4" aria-hidden="true" />
          Today’s story
        </p>
        <h2 id="market-title" className="mt-2 max-w-3xl text-2xl font-bold tracking-tight sm:text-3xl">{brief.headline}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-700 sm:text-base">
          {brief.summary}
          <InlineCitations ids={brief.summary_source_ids} sources={sources} />
        </p>
      </header>
      <Tabs defaultValue="story" className="market-details">
        <TabsList aria-label="Read the market deep dive" className="market-tabs">
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
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {point.text}
                    <InlineCitations ids={point.source_ids} sources={sources} />
                  </p>
                </section>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </Card>
  )
}
