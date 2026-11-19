import { useEffect, useState, type ReactNode } from 'react'
import { ArrowUpRight, ChevronDown } from 'lucide-react'
import { getDashboardData, type NewsBriefStory } from '@/api/dashboard'
import { GitHubTrending } from '@/components/dashboard/GitHubTrending'
import { MarketDeepDiveCard } from '@/components/dashboard/MarketDeepDiveCard'
import { MarketPredictions } from '@/components/dashboard/MarketPredictions'
import { ProductHuntInsights } from '@/components/dashboard/ProductHuntInsights'

type Snapshot = Awaited<ReturnType<typeof getDashboardData>>

function DashboardPanel({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="scan-module">
      <header className="module-head">
        <h3>{title}</h3>
        {hint && <p>{hint}</p>}
      </header>
      {children}
    </section>
  )
}

function StoryList({ stories }: { stories: NewsBriefStory[] }) {
  if (!stories.length) return <p className="module-empty">No headlines in this update.</p>

  return (
    <ul className="news-list">
      {stories.map(story => (
        <li key={story.title} className="news-item">
          <details>
            <summary>{story.title}<ChevronDown size={17} aria-hidden="true" /></summary>
            <p className="news-summary">{story.summary}</p>
            {story.sources.length > 0 && (
              <div className="source-row">
                {story.sources.map(source => (
                  <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer" aria-label={source.title}>
                    {source.source || new URL(source.url).hostname}<ArrowUpRight size={13} aria-hidden="true" />
                  </a>
                ))}
              </div>
            )}
          </details>
        </li>
      ))}
    </ul>
  )
}

function KeywordBars({ keywords }: { keywords: Snapshot['keywords'] }) {
  if (!keywords.length) return <p className="module-empty">No topic scores in this update.</p>

  return (
    <div className="keyword-list">
      {[...keywords].sort((a, b) => b.score - a.score).map(item => (
        <details className="keyword-row" key={item.word}>
          <summary>
            <span>{item.word}</span>
            <span className="bar-track" aria-hidden="true"><span className="bar-fill" style={{ width: `${item.score}%` }} /></span>
            <span className="keyword-score">{item.score}</span>
          </summary>
          {item.description && <p>{item.description}</p>}
        </details>
      ))}
    </div>
  )
}

function DashboardDate({ createdAt }: { createdAt: string | null }) {
  if (!createdAt) return null
  const date = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(createdAt))
  return <time className="scan-updated" dateTime={createdAt}>{import.meta.env.DEV ? 'Preview · ' : ''}{date}</time>
}

export function Dashboard({ onReady }: { onReady: (ready: boolean) => void }) {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)

  useEffect(() => {
    let active = true
    getDashboardData()
      .then(result => { if (active) setSnapshot(result) })
      .catch(() => { if (active) setLoadFailed(true) })
    return () => { active = false }
  }, [])

  const isLoading = !snapshot && !loadFailed

  useEffect(() => {
    if (!isLoading) onReady(true)
  }, [isLoading, onReady])

  return (
    <div className="signal-page">
      <section className="market-section" id="market-story" tabIndex={-1} aria-labelledby="market-title" aria-busy={isLoading}>
        {snapshot?.marketDeepDive ? <MarketDeepDiveCard brief={snapshot.marketDeepDive} /> : (
          <div className="market-missing">
            <h2 id="market-title">Today’s story</h2>
            <p role="status">{isLoading ? 'Loading today’s story…' : 'No market deep dive in this update.'}</p>
          </div>
        )}
      </section>

      <section id="dashboard-section" className="daily-scan" tabIndex={-1} aria-labelledby="scan-title" aria-busy={isLoading}>
        <div className="section-heading">
          <h2 id="scan-title">Tech dashboard</h2>
          <DashboardDate createdAt={snapshot?.createdAt ?? null} />
        </div>
        {isLoading && <p className="module-empty" role="status">Loading the dashboard…</p>}
        {loadFailed && <p className="load-note" role="status">The dashboard couldn’t load. Reload to try again.</p>}
        {snapshot && (
          <div className="scan-grid">
            <DashboardPanel title="GitHub Trending" hint="Activity by language">
              <GitHubTrending languages={snapshot.languages} />
            </DashboardPanel>
            <DashboardPanel title="Product Hunt" hint="Launches by category">
              <ProductHuntInsights categories={snapshot.launchCategories} />
            </DashboardPanel>
            <div className="scan-wide">
              <DashboardPanel title="Prediction markets" hint="Manifold">
                <MarketPredictions predictions={snapshot.predictions} />
              </DashboardPanel>
            </div>
            <DashboardPanel title="Headlines">
              <StoryList stories={snapshot.hotTopics} />
            </DashboardPanel>
            <DashboardPanel title="Topics in the news" hint="Prominence score out of 100">
              <KeywordBars keywords={snapshot.keywords} />
            </DashboardPanel>
          </div>
        )}
      </section>
    </div>
  )
}
