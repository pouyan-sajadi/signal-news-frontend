import { useState } from 'react'
import { ArrowUpRight, ChevronDown } from 'lucide-react'
import type { LaunchCategory, ProductHuntLeaderboard } from '@/api/dashboard'

type Rect = { left: number; top: number; width: number; height: number }
type Tile = Rect & { category: LaunchCategory }

const shortLabels: Record<string, string> = {
  'Developer Tools': 'Dev tools',
  'Marketing & Sales': 'Marketing',
  'Health & Fitness': 'Health',
  'Data & Analytics': 'Analytics',
}
const colors = ['#cbd9ff', '#dbe7ff', '#bcd4ea', '#d4d7f2', '#d5e8e8', '#e0e8f8']
const leaderboardDate = new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeZone: 'America/Los_Angeles' })
const pointCount = new Intl.NumberFormat('en')

export function ProductHuntTopLaunches({ leaderboard }: { leaderboard: ProductHuntLeaderboard }) {
  const date = leaderboardDate.format(new Date(`${leaderboard.date}T12:00:00Z`))
  return (
    <section className="product-hunt-top" aria-labelledby="product-hunt-top-title">
      <h4 id="product-hunt-top-title">{date === leaderboardDate.format() ? 'Top 3 today' : `Top 3 on ${date}`}</h4>
      <ol className="product-hunt-ranks" role="list">
        {leaderboard.launches.map(({ rank, title, url, points, tags }) => (
          <li key={rank}>
            <span className="product-hunt-rank"><span className="sr-only">Rank </span>#{rank}</span>
            <div className="product-hunt-launch">
              <a href={url} target="_blank" rel="noopener noreferrer">{title}<ArrowUpRight size={14} aria-hidden="true" /></a>
              {tags.length > 0 && (
                <ul className="product-hunt-tags" aria-label="Product Hunt tags">
                  {tags.map(tag => <li key={tag}>{tag}</li>)}
                </ul>
              )}
            </div>
            {points !== null && <span className="product-hunt-points">{pointCount.format(points)} {points === 1 ? 'point' : 'points'}</span>}
          </li>
        ))}
      </ol>
    </section>
  )
}

function packTiles(items: LaunchCategory[], rect: Rect): Tile[] {
  if (items.length <= 1) return items.map(category => ({ ...rect, category }))

  const size = items.reduce((total, category) => total + category.products.length, 0)
  let split = 1
  let weight = items[0].products.length
  while (split < items.length - 1) {
    const next = weight + items[split].products.length
    if (Math.abs(next - size / 2) >= Math.abs(weight - size / 2)) break
    weight = next
    split += 1
  }

  // Split the longer edge of the treemap in proportion to category membership.
  const horizontal = rect.width * 1.7 >= rect.height
  const first = { ...rect }
  const second = { ...rect }
  if (horizontal) {
    first.width *= weight / size
    second.width -= first.width
    second.left += first.width
  } else {
    first.height *= weight / size
    second.height -= first.height
    second.top += first.height
  }
  return [...packTiles(items.slice(0, split), first), ...packTiles(items.slice(split), second)]
}

export function ProductHuntInsights({ categories }: { categories: LaunchCategory[] }) {
  const [selectedName, setSelectedName] = useState<string>()
  const sorted = [...categories].sort((a, b) => b.products.length - a.products.length)
  const selected = sorted.find(category => category.name === selectedName) ?? sorted[0]
  const tiles = packTiles(sorted, { left: 0, top: 0, width: 100, height: 100 })
  const uniqueProducts = new Set(sorted.flatMap(category => category.products.map(product => product.url))).size

  if (!selected) return <p className="module-empty">No launch categories in this update.</p>

  return (
    <div className="chart-body">
      <div className="treemap-summary"><strong>{uniqueProducts}</strong> {uniqueProducts === 1 ? 'product' : 'products'} across {sorted.length} {sorted.length === 1 ? 'category' : 'categories'}</div>
      <div className="treemap" role="group" aria-label="Products by category, sized by count">
        {tiles.map(({ category, left, top, width, height }, index) => {
          const amount = category.products.length
          return (
            <div key={category.name} className="treemap-region" style={{
              left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%`,
            }}>
              <button type="button" className="treemap-tile"
                aria-label={`${category.name}, ${amount} ${amount === 1 ? 'product' : 'products'}`}
                aria-pressed={selected.name === category.name} title={category.name}
                style={{ backgroundColor: colors[index % colors.length] }}
                onClick={() => setSelectedName(category.name)}>
                <span className="treemap-label">{shortLabels[category.name] || category.name}</span>
                <strong>{amount}</strong>
              </button>
            </div>
          )
        })}
      </div>
      <div className="chart-selection" aria-live="polite">
        <strong>{selected.name}</strong>
        <span>{selected.products.length} {selected.products.length === 1 ? 'product' : 'products'}</span>
      </div>
      <details key={selected.name} className="chart-links">
        <summary>View products <ChevronDown size={15} aria-hidden="true" /></summary>
        <ul>{selected.products.map(product => (
          <li key={product.url}>
            <a href={product.url} target="_blank" rel="noopener noreferrer">{product.title}<ArrowUpRight size={14} aria-hidden="true" /></a>
            {product.description && <p className="chart-item-description">{product.description}</p>}
          </li>
        ))}</ul>
      </details>
      <p className="chart-note">A product can appear in two categories.</p>
    </div>
  )
}
