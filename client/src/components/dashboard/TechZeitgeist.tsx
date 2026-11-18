import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Brain } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

interface Keyword {
  word: string
  score: number
  desc: string
}

interface TechZeitgeistProps {
  data: { keywords: Keyword[] } | null
}

function getWordSize(score: number, maxScore: number) {
  const ratio = score / maxScore
  if (ratio > 0.8) return 'text-xl font-bold'
  if (ratio > 0.6) return 'text-lg font-semibold'
  if (ratio > 0.4) return 'text-base font-medium'
  return 'text-sm font-normal'
}

export function TechZeitgeist({ data }: TechZeitgeistProps) {
  const [selectedKeyword, setSelectedKeyword] = useState<Keyword | null>(null)
  if (!data) return null

  const maxScore = Math.max(1, ...data.keywords.map(keyword => keyword.score))
  const displayKeywords = data.keywords.slice(0, 20)

  return (
    <>
      <Card className="h-full bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardHeader className="pb-1">
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-800">
            <div className="p-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg">
              <Brain className="h-5 w-5 text-white" />
            </div>
            Tech Zeitgeist
          </CardTitle>
          <p className="text-sm text-gray-600">What’s at the center of today’s buzz?</p>
        </CardHeader>
        <CardContent className="pt-1">
          <div className="flex h-52 content-start flex-wrap gap-2 overflow-y-auto pr-1">
            {displayKeywords.map((keyword, index) => (
              <Tooltip key={`${keyword.word}-${index}`}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-haspopup="dialog"
                    className={`rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-gray-800 hover:bg-gray-100 ${getWordSize(keyword.score, maxScore)}`}
                    onClick={() => setSelectedKeyword(keyword)}
                  >
                    {keyword.word}
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs bg-white border border-gray-200 shadow-lg">
                  <p className="p-2 text-sm text-gray-600">{keyword.desc}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </CardContent>
      </Card>
      <Dialog open={!!selectedKeyword} onOpenChange={(open) => { if (!open) setSelectedKeyword(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedKeyword?.word}</DialogTitle>
            <DialogDescription>Brief relevance score {selectedKeyword?.score}/100</DialogDescription>
          </DialogHeader>
          <p className="text-sm leading-relaxed">{selectedKeyword?.desc}</p>
        </DialogContent>
      </Dialog>
    </>
  )
}
