import { useState, type CSSProperties } from 'react'
import { ArrowUpRight, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Prediction } from '@/api/dashboard'
import { chartScale, compactCount, count } from './chartScale'

const probabilityTicks = [0, 25, 50, 75, 100]
const percentage = new Intl.NumberFormat('en', { style: 'percent', maximumFractionDigits: 1 })
const percent = (value: number) => percentage.format(value / 100)

const categoryStyles: Record<string, { name: string; color: string }> = {
  AI: { name: 'AI', color: '#325ac7' },
  'Technology (General)': { name: 'Tech', color: '#007b68' },
  'Blockchain/Crypto': { name: 'Crypto', color: '#b54816' },
  'Economics/Finance': { name: 'Finance', color: '#8a419c' },
  'Science/Research': { name: 'Science', color: '#36718b' },
  'Politics/Society': { name: 'Politics', color: '#a13961' },
  Health: { name: 'Health', color: '#61762e' },
  Other: { name: 'Other', color: '#65718a' },
}
const fallbackColors = ['#996516', '#4b799e', '#a54670', '#6c6c3b']

function marketAccent(color: string): CSSProperties {
  return { '--market-accent': color } as CSSProperties
}

function getCategories(markets: Prediction[]) {
  const groups = new Map<string, { category: string; size: number; volume: number }>()
  for (const market of markets) {
    const group = groups.get(market.category) ?? { category: market.category, size: 0, volume: 0 }
    group.size += 1
    group.volume += market.volume
    groups.set(market.category, group)
  }
  return [...groups.values()]
    .sort((a, b) => b.volume - a.volume || a.category.localeCompare(b.category))
    .map((group, index) => ({
      ...group,
      color: categoryStyles[group.category]?.color ?? fallbackColors[index % fallbackColors.length],
      name: categoryStyles[group.category]?.name ?? group.category,
    }))
}

export function MarketPredictions({ predictions }: { predictions: Prediction[] }) {
  const [excluded, setExcluded] = useState<Set<string>>(() => new Set())
  const [selectedMarket, setSelectedMarket] = useState<Prediction>()
  const ranked = [...predictions].sort((a, b) => b.volume - a.volume)
  const categories = getCategories(ranked)
  const shownCategories = categories.filter(group => !excluded.has(group.category))
  const shown = ranked.filter(market => !excluded.has(market.category))
  const highestVolume = shown[0]
  const selected = selectedMarket && shown.includes(selectedMarket) ? selectedMarket : highestVolume
  const scale = chartScale(ranked[0]?.volume ?? 0)
  const marketDetails = new Map(categories.map(category => [category.category, category]))
  const totalVolume = shownCategories.reduce((sum, group) => sum + group.volume, 0)
  const closestToEven = shown.reduce<Prediction | undefined>((closest, market) => {
    if (!closest || Math.abs(market.probability - 50) < Math.abs(closest.probability - 50)) return market
    return closest
  }, undefined)

  if (!ranked.length) return <p className="module-empty">No prediction markets in this update.</p>

  function toggleCategory(category: string) {
    setExcluded(current => {
      const next = new Set(current)
      if (next.has(category)) next.delete(category)
      else next.add(category)
      return next
    })
  }

  return (
    <div className="prediction-card">
      <div className="market-filters">
        <div className="market-categories" role="group" aria-label="Filter by market category">
          {categories.map(group => {
            const enabled = !excluded.has(group.category)
            return (
              <button key={group.category} type="button" style={marketAccent(group.color)}
                aria-label={group.category} aria-pressed={enabled}
                onClick={() => toggleCategory(group.category)}>
                <span className="category-key" aria-hidden="true">{enabled && <Check size={10} strokeWidth={3} />}</span>
                {group.name}<span className="category-count" aria-hidden="true">{group.size}</span>
              </button>
            )
          })}
        </div>
        <div className="market-filter-status">
          <span role="status">{shown.length} of {ranked.length} markets</span>
          {excluded.size > 0 && <button type="button" onClick={() => setExcluded(new Set())}>Show all</button>}
        </div>
      </div>

      {selected && closestToEven ? (
        <>
          <div className="predictions-layout">
            <div className="prediction-figure">
              <p className="axis-title">Trading volume</p>
              <div className="market-plot" role="group" aria-label="Manifold markets by Yes probability and trading volume">
                {scale.ticks.map(tick => (
                  <div className="y-gridline" key={tick} aria-hidden="true" style={{ bottom: `${tick / scale.max * 100}%` }}>
                    <span>{compactCount(tick)}</span>
                  </div>
                ))}
                {probabilityTicks.map(value => (
                  <div key={value} className={`x-gridline ${value === 50 ? 'midpoint' : ''}`} aria-hidden="true" style={{ left: `${value}%` }}>
                    <span>{value}%</span>
                  </div>
                ))}
                {shown.map(market => (
                  <button type="button" key={market.url ?? market.question} className="market-dot"
                    style={{
                      ...marketAccent(marketDetails.get(market.category)!.color),
                      left: `${market.probability}%`,
                      bottom: `${market.volume / scale.max * 100}%`,
                    }}
                    onClick={() => setSelectedMarket(market)} aria-pressed={selected === market}
                    aria-label={`${market.question} ${market.category}, ${percent(market.probability)} Yes, ${count.format(Math.round(market.volume))} trading volume`}
                    title={market.question}>
                    <span aria-hidden="true" />
                  </button>
                ))}
              </div>
              <p className="axis-title probability-axis">Chance of Yes</p>
            </div>

            <div className="market-detail">
              <div className="market-detail-head">
                <p className="market-category">
                  <span className="chart-swatch" style={{ backgroundColor: marketDetails.get(selected.category)!.color }} aria-hidden="true" />
                  {selected.category}
                </p>
                {shown.length > 1 && (
                  <div className="market-browse" role="group" aria-label="Browse shown markets">
                    <button type="button" aria-label="Previous market"
                      onClick={() => setSelectedMarket(shown[(shown.indexOf(selected) - 1 + shown.length) % shown.length])}>
                      <ChevronLeft size={17} aria-hidden="true" />
                    </button>
                    <button type="button" aria-label="Next market"
                      onClick={() => setSelectedMarket(shown[(shown.indexOf(selected) + 1) % shown.length])}>
                      <ChevronRight size={17} aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>
              <div aria-live="polite" className="market-readout">
                <h4>{selected.question}</h4>
                <dl>
                  <div><dt>Chance of Yes</dt><dd>{percent(selected.probability)}</dd></div>
                  <div><dt>Trading volume</dt><dd>{count.format(Math.round(selected.volume))}</dd></div>
                </dl>
                <div className="market-odds-track" aria-hidden="true">
                  <span style={{ width: `${selected.probability}%`, background: marketDetails.get(selected.category)!.color }} />
                </div>
                {totalVolume > 0 && (
                  <p className="market-rank">
                    Rank {shown.indexOf(selected) + 1} of {shown.length} by volume
                    <span aria-hidden="true"> · </span>{percentage.format(selected.volume / totalVolume)} of shown volume
                  </p>
                )}
              </div>
              {selected.url && <a href={selected.url} target="_blank" rel="noopener noreferrer">View on Manifold <ArrowUpRight size={15} aria-hidden="true" /></a>}
            </div>
          </div>

          <div className="market-insights">
            <div className="market-volume"><h4>Volume by category</h4>
              {totalVolume > 0 ? (
                <>
                  <div className="market-volume-bar" role="img" aria-label={shownCategories.map(group =>
                    `${group.category}: ${percentage.format(group.volume / totalVolume)} of shown trading volume`
                  ).join(', ')}>
                    {shownCategories.filter(group => group.volume > 0).map(group => (
                      <span key={group.category} style={{ flexGrow: group.volume / totalVolume, backgroundColor: group.color }} />
                    ))}
                  </div>
                  <p><strong>{shownCategories[0].name} {percentage.format(shownCategories[0].volume / totalVolume)}</strong> of shown volume</p>
                </>
              ) : <p>No trading volume for the shown markets.</p>}
            </div>
            <div className="market-highlights" role="group" aria-label="Explore notable markets">
              <button type="button" onClick={() => setSelectedMarket(highestVolume)} aria-pressed={selected === highestVolume}>
                <span>Highest volume</span><strong>{compactCount(highestVolume.volume)}</strong>
              </button>
              <button type="button" onClick={() => setSelectedMarket(closestToEven)} aria-pressed={selected === closestToEven}>
                <span>Closest to 50%</span><strong>{percent(closestToEven.probability)} Yes</strong>
              </button>
            </div>
          </div>
        </>
      ) : <p className="module-empty market-filter-empty">Select a category to see its markets.</p>}
    </div>
  )
}
