import { useState } from "react"
import { ChevronDown, ChevronUp, Clock, Search, FileText, CheckCircle } from "lucide-react"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"

interface NerdStatsProps {
  searchQueries: string[];
  sourcesAnalyzed: number;
  sourcesSelected: number;
  processingTime: number;
  generatedAt: string;
  sources: Array<{
    title: string;
    url: string;
    domain: string;
  }>;
}

export function NerdStats({
  searchQueries,
  sourcesAnalyzed,
  sourcesSelected,
  processingTime,
  generatedAt,
  sources,
}: NerdStatsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className="bg-white/50 backdrop-blur-sm border-0 shadow-md">
      <div className="p-4">
        <Button
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full justify-between h-auto p-0"
        >
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10">
              <FileText className="h-4 w-4 text-purple-600" />
            </div>
            <span className="font-medium">Nerd Stats</span>
            <Badge variant="outline" className="text-xs">
              {sourcesSelected} sources
            </Badge>
          </div>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>

        {isExpanded && (
          <div className="mt-6 space-y-6">
            {/* Processing Metrics */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Search className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">{searchQueries.length}</div>
                <div className="text-xs text-muted-foreground">Search Queries</div>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <FileText className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">{sourcesAnalyzed}</div>
                <div className="text-xs text-muted-foreground">Sources Analyzed</div>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <CheckCircle className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600">{sourcesSelected}</div>
                <div className="text-xs text-muted-foreground">Sources Selected</div>
              </div>

              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-600">{processingTime}s</div>
                <div className="text-xs text-muted-foreground">Processing Time</div>
              </div>
            </div>

            {/* Search Queries */}
            <div className="space-y-2">
              <h4 className="font-medium">Search Queries Used</h4>
              <div className="flex flex-wrap gap-2">
                {searchQueries.map((query, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {query}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Sources */}
            <div className="space-y-2">
              <h4 className="font-medium">Selected Sources</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {sources.map((source, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{source.title}</div>
                      <div className="text-xs text-muted-foreground">{source.domain}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(source.url, '_blank')}
                      className="text-xs"
                    >
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Generation Info */}
            <div className="text-xs text-muted-foreground text-center p-3 bg-muted/20 rounded-lg">
              Report generated on {new Date(stats.generatedAt).toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}