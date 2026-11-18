import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Newspaper, ChevronDown, ChevronUp } from 'lucide-react'
import { format } from 'date-fns'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { NewsBriefStory } from '@/api/dashboard'

interface DailyNewsBriefProps {
  data: {
    hot_topics: NewsBriefStory[]
    created_at: string
  } | null
}

function NewsBriefStoryCard({ story, onOpen }: { story: NewsBriefStory; onOpen: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const isTruncated = story.summary.length > 80
  const displayedSummary = isExpanded || !isTruncated
    ? story.summary
    : story.summary.substring(0, 80) + '...'

  return (
    <div className="group p-4 rounded-lg bg-white/50 hover:bg-white/80 transition-all duration-200 border border-gray-100 hover:border-gray-200">
      <h3 className="mb-2 font-semibold text-gray-900 text-sm leading-tight">
        <button type="button" aria-haspopup="dialog" className="text-left hover:underline" onClick={onOpen}>
          {story.title}
        </button>
      </h3>
      <p className="text-xs text-gray-600 mb-2 leading-relaxed">{displayedSummary}</p>
      {isTruncated && (
        <button
          type="button"
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center text-blue-600 hover:text-blue-800 text-xs font-medium"
        >
          {isExpanded ? 'Show Less' : 'Read More'}
          {isExpanded ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
        </button>
      )}
    </div>
  )
}

export function DailyNewsBrief({ data }: DailyNewsBriefProps) {
  const [selectedStory, setSelectedStory] = useState<NewsBriefStory | null>(null)
  if (!data) return null

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp); // This is now correctly parsed as UTC
    const now = new Date(); // Get current local time
    const nowUtc = new Date(now.toUTCString()); // Convert current local time to UTC Date object

    const diffMs = nowUtc.getTime() - date.getTime(); // Calculate difference using UTC times
    const diffMinutes = Math.round(Math.abs(diffMs) / (1000 * 60));
    const diffHours = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60));

    // To check if 'date' is "today" in UTC:
    const isSameUtcCalendarDay = date.getUTCFullYear() === nowUtc.getUTCFullYear() &&
                                 date.getUTCMonth() === nowUtc.getUTCMonth() &&
                                 date.getUTCDate() === nowUtc.getUTCDate();

    // Case 1: Less than 60 minutes ago
    if (diffMinutes < 60) {
      return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
    } 
    // Case 2: Over 60 minutes but within the same calendar day (UTC)
    else if (isSameUtcCalendarDay) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } 
    // Case 3: Not within the same calendar day (UTC)
    else {
      return format(date, "MMM dd, yyyy"); // This will still format in local time for display
    }
  };

  return (
    <>
      <Card className="h-full bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-800">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
              <Newspaper className="h-5 w-5 text-white" />
            </div>
            Intelligent News Brief
          </CardTitle>
          <p className="text-sm text-gray-600">What’s happening in tech today? - Generated {formatTimestamp(data.created_at)}</p>
        </CardHeader>
        <CardContent className="pt-1 h-[calc(100%-120px)]">
          <ScrollArea className="h-full pr-2">
            <div className="space-y-4">
              {data.hot_topics.length === 0 && (
                <p className="text-sm text-muted-foreground">No stories available for this brief.</p>
              )}
              {data.hot_topics.map((story, index) => (
                <NewsBriefStoryCard
                  key={`${story.title}-${index}`}
                  story={story}
                  onOpen={() => setSelectedStory(story)}
                />
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      <Dialog open={!!selectedStory} onOpenChange={(open) => !open && setSelectedStory(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedStory?.title}</DialogTitle>
            <DialogDescription>
              Brief generated {formatTimestamp(data.created_at)}
            </DialogDescription>
          </DialogHeader>
          {selectedStory && (
            <div className="space-y-4">
              <p className="text-sm leading-relaxed">{selectedStory.summary}</p>
              {selectedStory.sources.length > 0 ? (
                <section>
                  <h3 className="text-sm font-semibold">Original articles</h3>
                  <ul className="mt-2 space-y-2">
                    {selectedStory.sources.map((article) => (
                      <li key={article.url} className="text-sm">
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline underline-offset-4"
                        >
                          {article.title}
                        </a>
                        {article.source && <p className="text-xs text-muted-foreground">{article.source}</p>}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : (
                <p className="text-sm text-muted-foreground">Source links are unavailable for this story.</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
