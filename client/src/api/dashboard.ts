import api from './api'
import { parseMarketDeepDive } from '@/types/marketDeepDive'

export interface NewsBriefStory {
  title: string
  summary: string
  sources: Array<{ title: string; source: string; url: string }>
}

type CatalogItem = { title: string; url: string; description: string }
type Repository = CatalogItem & { starsToday: number | null }
export type GitHubLanguage = {
  name: string
  count: number
  starsToday: number | null
  repositories: Repository[]
}
export type LaunchCategory = { name: string; products: CatalogItem[] }
export type ProductHuntLeaderboard = {
  date: string
  launches: Array<Pick<CatalogItem, 'title' | 'url'> & { rank: number; points: number | null; tags: string[] }>
}
export type Prediction = {
  question: string
  probability: number
  volume: number
  category: string
  url: string | null
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

const list = (value: unknown): unknown[] => Array.isArray(value) ? value : []
const nonNegative = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null
const label = (value: unknown) => typeof value === 'string' ? value.trim() : ''

function shortDescription(value: unknown) {
  const description = label(value).replace(/\s+/g, ' ')
  if (description.length <= 170) return description

  const excerpt = description.slice(0, 171)
  const sentenceEnd = excerpt.match(/^.*[.!?](?=\s)/)?.[0]
  if (sentenceEnd && sentenceEnd.length >= 45) return sentenceEnd
  const wordEnd = excerpt.lastIndexOf(' ')
  return `${excerpt.slice(0, wordEnd > 0 ? wordEnd : 170)}…`
}

function webUrl(value: unknown) {
  if (typeof value !== 'string') return null
  try {
    const url = new URL(value)
    if (['http:', 'https:'].includes(url.protocol) && !url.username && !url.password) return url.href
  } catch {
    return null
  }
  return null
}

function getNewsBriefSources(value: unknown): NewsBriefStory['sources'] {
  const sources = new Map<string, NewsBriefStory['sources'][number]>()
  for (const entry of list(value)) {
    const article = record(entry)
    const title = label(article.title)
    const url = webUrl(article.url)
    if (title && url && !sources.has(url)) {
      sources.set(url, { title, url, source: label(article.source) })
    }
  }
  return [...sources.values()]
}

function getLanguages(value: unknown): GitHubLanguage[] {
  const distribution = record(value)
  const dataset = record(list(distribution.datasets)[0])
  const counts = list(dataset.data)
  const details = list(dataset.hoverData)
  return list(distribution.labels).flatMap((entry, index) => {
    const name = label(entry)
    const count = nonNegative(counts[index])
    if (!name || count === null || !Number.isInteger(count)) return []

    const detail = record(details[index])
    const repositories = list(detail.repositories).flatMap(item => {
      const repo = record(item)
      const title = label(repo.title)
      const url = webUrl(repo.url)
      if (!title || !url) return []
      return [{ title, url, description: shortDescription(repo.description), starsToday: nonNegative(repo.stars_today) }]
    })
    return [{ name, count, starsToday: nonNegative(detail.stars_today), repositories }]
  })
}

function getLaunchCategories(value: unknown): LaunchCategory[] {
  return list(record(value).nodes).flatMap(entry => {
    const category = record(entry)
    const name = label(category.id)
    if (!name) return []

    const products = new Map<string, CatalogItem>()
    for (const item of list(category.products)) {
      const product = record(item)
      const title = label(product.title)
      const url = webUrl(product.url)
      if (title && url) products.set(url, { title, url, description: shortDescription(product.description) })
    }
    return products.size ? [{ name, products: [...products.values()] }] : []
  })
}

function getProductHuntLeaderboard(value: unknown): ProductHuntLeaderboard | null {
  const leaderboard = record(value)
  const date = label(leaderboard.date)
  const parsedDate = new Date(`${date}T12:00:00Z`)
  if (Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date) return null

  const ranked = new Map<number, ProductHuntLeaderboard['launches'][number]>()
  for (const entry of list(leaderboard.launches)) {
    const launch = record(entry)
    const rank = launch.rank
    const title = label(launch.title)
    const url = webUrl(launch.url)
    if ((rank !== 1 && rank !== 2 && rank !== 3) || !title || !url || ranked.has(rank)) continue

    const points = nonNegative(launch.points)
    const tags = [...new Set(list(launch.tags).map(label).filter(Boolean))]
    ranked.set(rank, { rank, title, url, points: Number.isInteger(points) ? points : null, tags })
  }
  return ranked.size ? { date, launches: [...ranked.values()].sort((a, b) => a.rank - b.rank) } : null
}

function getPredictions(value: unknown): Prediction[] {
  const dataset = record(list(record(value).datasets)[0])
  return list(dataset.data).flatMap(entry => {
    const row = record(entry)
    const question = label(row.label)
    const probability = nonNegative(row.x)
    const volume = nonNegative(row.y)
    if (!question || probability === null || probability > 1 || volume === null) return []

    return [{
      question,
      probability: probability * 100,
      volume,
      category: label(row.category) || 'Other',
      url: webUrl(row.url),
    }]
  })
}

function adaptSnapshot(response: unknown) {
  const root = record(response)
  const pulse = record(root.pulse_data)
  const cloud = record(pulse.news_word_cloud)
  const hotTopics = list(cloud.hot_topics).flatMap((entry): NewsBriefStory[] => {
    const topic = record(entry)
    const title = label(topic.topic)
    const summary = label(topic.summary)
    return title && summary ? [{ title, summary, sources: getNewsBriefSources(topic.sources) }] : []
  })
  const keywords = list(cloud.keywords).flatMap(entry => {
    const keyword = record(entry)
    const word = label(keyword.text)
    const score = nonNegative(keyword.value)
    return word && score !== null && score > 0 && score <= 100
      ? [{ word, score, description: label(keyword.desc) }]
      : []
  })
  const rawDate = label(root.created_at)

  return {
    marketDeepDive: parseMarketDeepDive(pulse.market_deep_dive),
    languages: getLanguages(pulse.github_language_distribution),
    launchCategories: getLaunchCategories(pulse.product_hunt_tag_connections),
    productHuntLeaderboard: getProductHuntLeaderboard(pulse.product_hunt_leaderboard),
    hotTopics,
    keywords,
    predictions: getPredictions(pulse.manifold_predictions_bubble_plot),
    createdAt: rawDate && !Number.isNaN(new Date(rawDate).getTime()) ? rawDate : null,
  }
}

export async function getDashboardData() {
  if (import.meta.env.DEV) {
    const [{ default: fixture }, { default: leaderboard }] = await Promise.all([
      import('@/data/pulse-fixture-2026-11-18.json'),
      import('@/data/product-hunt-leaderboard-fixture-2026-11-18.json'),
    ])
    return adaptSnapshot({
      ...fixture,
      pulse_data: { ...fixture.pulse_data, product_hunt_leaderboard: leaderboard },
    })
  }

  // The shared parser preserves large report IDs, but chart measures are ordinary numbers.
  const { data } = await api.get('/api/tech-pulse/latest', {
    transformResponse: [(body: string) => JSON.parse(body)],
  })
  return adaptSnapshot(data)
}
