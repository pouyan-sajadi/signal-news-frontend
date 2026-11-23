import { useState, useEffect } from "react"
import { Newspaper, TrendingUp, Clock, ExternalLink } from "lucide-react"
import { Card } from "../ui/card"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { ScrollArea } from "../ui/scroll-area"
import { getDailyNews } from "../../api/news"
import { useToast } from "../../hooks/useToast"

interface NewsItem {
  id: string
  title: string
  summary: string
  source: string
  publishedAt: string
  category: string
  url: string
}

export function DailyNewsDashboard() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const newsData = await getDailyNews()
        setNews(newsData)
      } catch (error) {
        console.error("Error fetching daily news:", error)
        toast({
          title: "Error Loading News",
          description: error instanceof Error ? error.message : "Failed to load daily news",
          variant: "destructive"
        })
        
        // Fallback to mock data if API fails
        const mockNews: News[] = [
          {
            id: "1",
            title: "AI Breakthrough in Medical Diagnosis",
            summary: "New machine learning model achieves 95% accuracy in early cancer detection, potentially revolutionizing healthcare screening.",
            source: "TechHealth Today",
            publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            category: "Technology",
            url: "#"
          },
          {
            id: "2",
            title: "Climate Summit Reaches Historic Agreement",
            summary: "World leaders commit to ambitious carbon reduction targets, marking a significant step in global climate action.",
            source: "Global News Network",
            publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            category: "Environment",
            url: "#"
          },
          {
            id: "3",
            title: "Cryptocurrency Market Sees Major Shift",
            summary: "Bitcoin and Ethereum experience significant volatility as new regulations are announced across major economies.",
            source: "Financial Times",
            publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            category: "Finance",
            url: "#"
          }
        ]
        setNews(mockNews)
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [toast])

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const published = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - published.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return "Just now"
    if (diffInHours === 1) return "1 hour ago"
    return `${diffInHours} hours ago`
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      Technology: "bg-blue-100 text-blue-800",
      Environment: "bg-green-100 text-green-800",
      Finance: "bg-yellow-100 text-yellow-800",
      Science: "bg-purple-100 text-purple-800",
      Energy: "bg-orange-100 text-orange-800"
    }
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  if (loading) {
    return (
      <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 bg-muted rounded"></div>
            <div className="h-6 w-32 bg-muted rounded"></div>
          </div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-full"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10">
              <Newspaper className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold">Today's Top Stories</h3>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span>Live Updates</span>
          </div>
        </div>

        <ScrollArea className="h-80">
          <div className="space-y-4 pr-4">
            {news.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-lg bg-white/50 border border-border/50 hover:bg-white/70 transition-colors group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="font-medium text-sm leading-tight group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                      onClick={() => window.open(item.url, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.summary}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={`text-xs ${getCategoryColor(item.category)}`}>
                        {item.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{item.source}</span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatTimeAgo(item.publishedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="text-center">
          <Button variant="outline" size="sm" className="text-xs">
            View All News
          </Button>
        </div>
      </div>
    </Card>
  )
}