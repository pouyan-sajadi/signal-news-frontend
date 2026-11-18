import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { GitHubTrending } from '@/components/dashboard/GitHubTrending'
import { ProductHuntInsights } from '@/components/dashboard/ProductHuntInsights'
import { DailyNewsBrief } from '@/components/dashboard/DailyNewsBrief'
import { TechZeitgeist } from '@/components/dashboard/TechZeitgeist'
import { WeeklyTopicTrends } from '@/components/dashboard/WeeklyTopicTrends'
import { MarketPredictions } from '@/components/dashboard/MarketPredictions'
import { getDashboardData } from '@/api/dashboard'
import { useToast } from '@/hooks/useToast'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { Clock, Info } from 'lucide-react';

import { TooltipProvider } from '@/components/ui/tooltip';

export function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>({
    github: null,
    productHunt: null,
    news: null,
    keywords: null,
    predictions: null
  })
  const { toast } = useToast()

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)

      try {
        const dashboardData = await getDashboardData();
        setData(dashboardData);

        
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [toast])

  const getFormattedTimestamp = () => {
    if (!data?.news?.created_at) return null;

    const date = new Date(data.news.created_at);
    return date.toLocaleString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      timeZoneName: 'short',
    });
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4">
        <div className="w-full">
          <div className="mb-8">
            <Skeleton className="h-12 w-96 mb-4" />
            <Skeleton className="h-6 w-[600px]" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
            <div className="lg:row-span-1">
              <Skeleton className="h-full w-full rounded-xl" />
            </div>
            <div className="lg:row-span-1">
              <Skeleton className="h-full w-full rounded-xl" />
            </div>
            <div className="lg:row-span-2">
              <Skeleton className="h-full w-full rounded-xl" />
            </div>
            <div className="lg:row-span-1">
              <Skeleton className="h-full w-full rounded-xl" />
            </div>
            <div className="lg:row-span-1">
              <Skeleton className="h-full w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div id="dashboard-section" className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 mb-32">
      <div className="w-full">
        {/* Header */}
        <div className="mb-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
               Daily Tech Overview
            </h1>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <Info className="h-4 w-4 mr-1" />
                  What's this?
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>About the Dashboard</DialogTitle>
                </DialogHeader>
                <p>
                  This dashboard provides a daily overview of the tech landscape. It combines data from various sources to help you spot emerging trends, understand market sentiment, and stay informed about the latest developments. To get more details on each, simply click on them.
                </p>
              </DialogContent>
            </Dialog>
          </div>

          {data?.news?.created_at && (
            <div className="mt-3 flex items-center justify-center text-xs text-gray-500 bg-gray-100 p-1 rounded-md">
              <Clock className="h-3 w-3 mr-1" />
              <span>Last updated: {getFormattedTimestamp()}</span>
            </div>
          )}
        </div>

        {/* Dashboard Grid */}
        <TooltipProvider delayDuration={100}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* GitHub Trending - Top Left */}
            <div className="lg:row-span-1">
              <GitHubTrending data={data.github} />
            </div>

            {/* Product Hunt Insights - Top Center */}
            <div className="lg:row-span-1">
              <ProductHuntInsights data={data.productHunt} />
            </div>

            {/* Daily News Brief - Right Side (spans full height) */}
            <div className="lg:row-span-2">
              <DailyNewsBrief data={data.news} />
            </div>

            {/* Tech Zeitgeist - Bottom Left */}
            <div className="lg:row-span-1">
              <TechZeitgeist data={data.keywords} />
            </div>

            {/* Market Predictions - Bottom Center */}
            <div className="lg:row-span-1">
              <MarketPredictions data={data.predictions} />
            </div>
          </div>
        </TooltipProvider>
        <WeeklyTopicTrends />
      </div>
    </div>
  )
}
