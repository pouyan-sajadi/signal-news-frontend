import { useState, type MouseEvent } from 'react'
import { ArrowUpRight, ChevronDown } from 'lucide-react'
import type { GitHubLanguage } from '@/api/dashboard'
import { count } from './chartScale'

const metrics = [
  { id: 'count', title: 'Repositories' },
  { id: 'starsToday', title: 'Stars today' },
] as const

const colors = ['#2456d8', '#078171', '#8757b3', '#bd581b', '#b24371', '#567a37', '#63728e']
const ringHole = 0.64
const share = new Intl.NumberFormat('en', { style: 'percent', maximumFractionDigits: 1 })

export function GitHubTrending({ languages }: { languages: GitHubLanguage[] }) {
  const [metric, setMetric] = useState<(typeof metrics)[number]>(metrics[0])
  const [selectedName, setSelectedName] = useState<string>()
  const ranked = [...languages].sort((a, b) => (b[metric.id] ?? 0) - (a[metric.id] ?? 0))
  const languageColors = new Map(languages.map((language, index) => [language.name, colors[index % colors.length]]))
  const total = ranked.reduce((sum, language) => sum + (language[metric.id] ?? 0), 0)
  let angle = 0
  const segments = ranked.flatMap(language => {
    const value = language[metric.id]
    if (!value || total <= 0) return []

    const start = angle
    angle += value / total * 360
    return [{ language, value, start, end: angle, color: languageColors.get(language.name)! }]
  })
  const selected = segments.find(segment => segment.language.name === selectedName) ?? segments[0]

  if (!languages.some(language => language.count > 0)) {
    return <p className="module-empty">No repository activity in this update.</p>
  }

  const ring = segments.map(({ color, start, end }) => {
    const gap = segments.length > 1 ? Math.min(.65, (end - start) / 3) : 0
    return `white ${start}deg ${start + gap}deg, ${color} ${start + gap}deg ${end - gap}deg, white ${end - gap}deg ${end}deg`
  }).join(', ')

  function selectSlice(event: MouseEvent<HTMLDivElement>) {
    const { left, top, width, height } = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - left - width / 2
    const y = event.clientY - top - height / 2
    const radius = width / 2
    const distance = Math.hypot(x, y)
    if (distance < radius * ringHole || distance > radius) return

    const bearing = (Math.atan2(x, -y) * 180 / Math.PI + 360) % 360
    const slice = segments.find(segment => bearing >= segment.start && bearing < segment.end)
    if (slice) setSelectedName(slice.language.name)
  }

  return (
    <div className="chart-body">
      <div className="metric-switch" role="group" aria-label="Breakdown by">
        {metrics.map(option => (
          <button key={option.id} type="button" aria-pressed={metric.id === option.id}
            disabled={languages.every(language => !language[option.id])}
            onClick={() => { setMetric(option); setSelectedName(undefined) }}>
            {option.title}
          </button>
        ))}
      </div>

      {selected && (
        <>
          <div className="github-breakdown">
            <div className="github-donut" aria-hidden="true" onClick={selectSlice}>
              <div className="github-ring" style={{ backgroundImage: `conic-gradient(${ring})` }} />
              <div className="github-ring-selection" style={{
                backgroundImage: `conic-gradient(transparent 0deg ${selected.start}deg, ${selected.color} ${selected.start}deg ${selected.end}deg, transparent ${selected.end}deg 360deg)`,
              }} />
              <div className="github-donut-total">
                <strong>{count.format(total)}</strong>
                <span>{metric.title}</span>
              </div>
            </div>
            <div className="github-legend" role="group" aria-label={`Language breakdown across ${count.format(total)} ${metric.title.toLowerCase()}`}>
              {segments.map(segment => (
                <button key={segment.language.name} type="button"
                  aria-label={`${segment.language.name}, ${count.format(segment.value)} ${metric.id === 'count' && segment.value === 1 ? 'repository' : metric.title.toLowerCase()}, ${share.format(segment.value / total)}`}
                  aria-pressed={selected === segment} onClick={() => setSelectedName(segment.language.name)}>
                  <span className="chart-swatch" style={{ backgroundColor: segment.color }} aria-hidden="true" />
                  <span className="github-language">{segment.language.name}</span>
                  <span className="github-share">{share.format(segment.value / total)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="chart-selection" aria-live="polite">
            <strong>{selected.language.name}</strong>
            <span>
              {count.format(selected.language.count)} {selected.language.count === 1 ? 'repo' : 'repos'}
              {selected.language.starsToday !== null && ` · ${count.format(selected.language.starsToday)} stars today`}
            </span>
          </div>
          {selected.language.repositories.length > 0 && (
            <details key={selected.language.name} className="chart-links">
              <summary>View repositories <ChevronDown size={15} aria-hidden="true" /></summary>
              <ul>{selected.language.repositories.map(repo => (
                <li key={repo.url}>
                  <div className="chart-item-title">
                    <a href={repo.url} target="_blank" rel="noopener noreferrer">{repo.title}<ArrowUpRight size={14} aria-hidden="true" /></a>
                    {repo.starsToday !== null && <span title="Stars today">+{count.format(repo.starsToday)} stars</span>}
                  </div>
                  {repo.description && <p className="chart-item-description">{repo.description}</p>}
                </li>
              ))}</ul>
            </details>
          )}
        </>
      )}
    </div>
  )
}
