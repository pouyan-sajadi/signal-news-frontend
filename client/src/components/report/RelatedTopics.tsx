import { ArrowRight, TrendingUp } from "lucide-react"
import { Card } from "../ui/card"
import { Button } from "../ui/button"

interface RelatedTopicsProps {
  topics: string[]
  onTopicSelect: (topic: string) => void
}

export function RelatedTopics({ topics, onTopicSelect }: RelatedTopicsProps) {
  return (
    <Card className="p-6 bg-white/50 backdrop-blur-sm border-0 shadow-md">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Related Topics</h3>
        </div>

        <p className="text-sm text-muted-foreground">
          Explore these related topics for deeper insights
        </p>

        <div className="grid md:grid-cols-2 gap-3">
          {topics.map((topic, index) => (
            <Button
              key={index}
              variant="ghost"
              onClick={() => onTopicSelect(topic)}
              className="justify-between h-auto p-4 text-left hover:bg-blue-50 group"
            >
              <span className="flex-1 text-sm">{topic}</span>
              <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
          ))}
        </div>
      </div>
    </Card>
  )
}