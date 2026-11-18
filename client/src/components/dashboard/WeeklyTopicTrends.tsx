import { useEffect, useState } from 'react'
import { ChartLine } from 'lucide-react'
import { getTopicRankHistory, type RankedTopic, type TopicRankDay } from '@/api/dashboard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type HistoryState =
  | { status: 'loading' | 'unavailable' }
  | { status: 'ready'; days: TopicRankDay[] }

const dateFormat = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' })

function formatDay(date: string) {
  return dateFormat.format(new Date(`${date}T00:00:00Z`))
}

function RankChange({ current, previous }: { current?: number; previous?: number }) {
  if (current === undefined && previous === undefined) return <span aria-label="No comparison">—</span>
  if (current === undefined) return <span className="font-medium text-rose-700 dark:text-rose-300">Dropped out</span>
  if (previous === undefined) return <span className="font-medium text-indigo-700 dark:text-indigo-300">New</span>

  const movement = previous - current
  if (movement > 0) return <span className="font-medium text-emerald-700 dark:text-emerald-300">Up {movement}</span>
  if (movement < 0) return <span className="font-medium text-rose-700 dark:text-rose-300">Down {-movement}</span>
  return <span className="text-muted-foreground">Steady</span>
}

function RankHistory({ days }: { days: TopicRankDay[] }) {
  const [showAllTopics, setShowAllTopics] = useState(false)
  const rankedDays = days.filter((day): day is TopicRankDay & { topics: RankedTopic[] } => day.topics !== null)
  const latest = rankedDays[rankedDays.length - 1]
  const previous = rankedDays[rankedDays.length - 2]

  if (!latest) return <p className="text-sm text-muted-foreground">No topic rankings are available for the last seven days.</p>

  const dailyRanks = new Map(days.map(day => [
    day.date,
    new Map(day.topics?.map(topic => [topic.key, topic.rank])),
  ]))
  const latestRanks = dailyRanks.get(latest.date)!
  const previousRanks = previous ? dailyRanks.get(previous.date) : undefined
  const topics = new Map<string, string>()
  for (const day of [...rankedDays].reverse()) {
    for (const topic of day.topics) {
      if (!topics.has(topic.key)) topics.set(topic.key, topic.label)
    }
  }

  const recentTopics = [...topics].filter(([key]) => latestRanks.has(key) || previousRanks?.has(key))
  const earlierTopicCount = topics.size - recentTopics.length
  const visibleTopics = showAllTopics ? [...topics] : recentTopics

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {previous
          ? `Comparing ${formatDay(latest.date)} with ${formatDay(previous.date)}. New means the topic entered the rankings since the previous brief.`
          : `The first available ranking is from ${formatDay(latest.date)}. Changes will appear when there’s another day to compare.`}
      </p>
      <div
        className="overflow-x-auto rounded-lg border border-border"
        role="region"
        aria-label="Scrollable seven-day topic rankings"
        tabIndex={0}
      >
        <table className="w-full min-w-[44rem] border-collapse text-sm">
          <caption className="sr-only">Topic rankings by day, with changes since the previous brief.</caption>
          <thead className="bg-muted/70">
            <tr>
              <th scope="col" className="px-3 py-2 text-left">Topic</th>
              {previous && <th scope="col" className="whitespace-nowrap px-3 py-2 text-left">Change</th>}
              {days.map(day => (
                <th key={day.date} scope="col" className={`whitespace-nowrap px-2 py-2 text-center ${day.date === latest.date ? 'bg-primary/10' : ''}`}>
                  <time dateTime={day.date}>{formatDay(day.date)}</time>
                  {day.topics === null && <span className="block text-xs font-normal text-muted-foreground">No data</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleTopics.map(([key, label]) => (
              <tr key={key} className="border-t border-border">
                <th scope="row" className="px-3 py-2 text-left font-medium">{label}</th>
                {previous && (
                  <td className="whitespace-nowrap px-3 py-2">
                    <RankChange current={latestRanks.get(key)} previous={previousRanks?.get(key)} />
                  </td>
                )}
                {days.map(day => {
                  const rank = dailyRanks.get(day.date)?.get(key)
                  return (
                    <td key={day.date} className={`px-2 py-2 text-center tabular-nums ${day.date === latest.date ? 'bg-primary/5 font-semibold' : ''}`}>
                      {rank !== undefined ? `#${rank}` : day.topics !== null && <span aria-label="Outside the rankings" className="text-muted-foreground">—</span>}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">Daily rankings use scores from the news brief. A dash means the topic was outside that day’s rankings.</p>
      {earlierTopicCount > 0 && (
        <Button variant="outline" size="sm" onClick={() => setShowAllTopics(!showAllTopics)}>
          {showAllTopics ? 'Show latest topics' : `Show earlier topics (${earlierTopicCount})`}
        </Button>
      )}
    </div>
  )
}

export function WeeklyTopicTrends() {
  const [history, setHistory] = useState<HistoryState>({ status: 'loading' })

  useEffect(() => {
    const controller = new AbortController()
    getTopicRankHistory(controller.signal)
      .then(days => {
        if (!controller.signal.aborted) setHistory({ status: 'ready', days })
      })
      .catch(() => {
        if (!controller.signal.aborted) setHistory({ status: 'unavailable' })
      })
    return () => controller.abort()
  }, [])

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ChartLine className="h-5 w-5 text-primary" aria-hidden="true" />
          Topic trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        {history.status === 'ready' ? (
          <RankHistory days={history.days} />
        ) : (
          <p role="status" className="text-sm text-muted-foreground">
            {history.status === 'loading' ? 'Loading topic history…' : 'Topic history is temporarily unavailable.'}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
