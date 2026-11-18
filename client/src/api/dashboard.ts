import api from './api';

interface NewsBriefSource {
  title: string;
  source: string;
  url: string;
}

export interface NewsBriefStory {
  title: string;
  summary: string;
  sources: NewsBriefSource[];
}

function getNewsBriefSources(value: unknown): NewsBriefSource[] {
  if (!Array.isArray(value)) return [];

  const sources = new Map<string, NewsBriefSource>();
  for (const article of value) {
    if (typeof article?.title !== 'string' || !article.title.trim() || typeof article?.url !== 'string') continue;

    try {
      const url = new URL(article.url);
      if (url.protocol !== 'https:' && url.protocol !== 'http:') continue;
      if (url.username || url.password || sources.has(url.href)) continue;
      sources.set(url.href, {
        title: article.title.trim(),
        source: typeof article.source === 'string' ? article.source.trim() : '',
        url: url.href,
      });
    } catch {
      // Skip malformed links without hiding the story.
    }
  }

  return [...sources.values()];
}

export const getDashboardData = async () => {
  try {
    const response = await api.get('/api/tech-pulse/latest');
    const pulseData = response.data.pulse_data;

    const rawCreatedAt = response.data.created_at;

    // The backend sends a timestamp like "2025-08-04 07:29:31.201333+00".
    // We must convert it to a valid ISO 8601 format that JS `new Date()` can parse.
    // 1. Replace the space with a 'T'.
    // 2. Remove the microseconds, as they can cause parsing issues.
    const formattedTimestamp = rawCreatedAt
      ? rawCreatedAt.replace(' ', 'T').replace(/\.\d{6}/, '')
      : null;

    const isValidDate = formattedTimestamp && !isNaN(new Date(formattedTimestamp).getTime());

    // This is the adapter logic. It transforms the single backend response
    // into the five separate data structures the frontend components expect.
    const transformedData = {
      github: {
        languages: pulseData.github_language_distribution.labels.map((label: string, index: number) => ({
          name: label,
          count: pulseData.github_language_distribution.datasets[0].data[index],
          color: pulseData.github_language_distribution.datasets[0].backgroundColor[index],
          repositories: pulseData.github_language_distribution.datasets[0].hoverData[index].repositories,
        })),
      },
      productHunt: {
        product_hunt_tag_connections: pulseData.product_hunt_tag_connections,
      },
      news: {
        hot_topics: pulseData.news_word_cloud.hot_topics.map((topic: {
          topic: string;
          summary: string;
          sources?: unknown;
        }): NewsBriefStory => ({
          title: topic.topic,
          summary: topic.summary,
          sources: getNewsBriefSources(topic.sources),
        })),
        created_at: isValidDate ? formattedTimestamp : new Date().toISOString(),
      },
      keywords: {
        keywords: pulseData.news_word_cloud.keywords.map((keyword: any) => ({
          word: keyword.text,
          frequency: keyword.value,
          trend: 'up', // Mocked data
          desc: keyword.desc,
        })),
      },
      predictions: {
        predictions: pulseData.manifold_predictions_bubble_plot.datasets[0].data.map((prediction: any) => ({
          question: prediction.label,
          probability: Math.round(prediction.x * 100),
          traderInterest: prediction.y,
          category: prediction.category,
        })),
      },
    };

    return transformedData;
  } catch (error: any) {
    console.error("Error fetching or transforming dashboard data:", error);
    throw new Error(error?.response?.data?.message || error.message);
  }
};
