import { useState } from "react"
import { ChevronDown, ChevronUp, Settings2, HelpCircle } from "lucide-react"
import { Button } from "../ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Slider } from "../ui/slider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"
import { ReportPreferences } from "../../pages/HomePage"

interface PreferencesPanelProps {
  preferences: ReportPreferences
  onChange: (preferences: ReportPreferences) => void
}

export function PreferencesPanel({ preferences, onChange }: PreferencesPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const focusOptions = [
    { value: "Just the Facts", tooltip: "Focus on verifiable information and concrete data" },
    { value: "Human Impact", tooltip: "Focus on personal stories and community effects" },
    { value: "The Clash", tooltip: "Focus on the central dispute and each side's core arguments" },
    { value: "Hidden Angles", tooltip: "Focus on underreported context and overlooked details" },
    { value: "The Money Trail", tooltip: "Focus on financial data and economic stakeholders" }
  ]

  const toneOptions = [
    { value: "Grandma Mode", tooltip: "Warm, wise, and easy-to-understand" },
    { value: "Gen Z Mode", tooltip: "Real, relevant, and actually interesting" },
    { value: "Express Mode", tooltip: "Maximum information density, zero fluff" },
    { value: "Commentary Mode", tooltip: "Sharp, insightful, and conversational" }
  ]

  const depthLabels = {
    1: "Quick Summary",
    2: "Balanced Report",
    3: "Deep Dive"
  }

  const depthTooltips = {
    1: "A brief overview with only the key points.",
    2: "A balanced report with essential information.",
    3: "A comprehensive deep-dive with all available insights."
  }

  return (
    <TooltipProvider>
      <div className="bg-white/50 backdrop-blur-sm border border-border/50 rounded-lg">
        <div className="px-3">
          <Button
            type="button"
            variant="ghost"
            aria-expanded={isExpanded}
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full justify-between h-auto p-0"
          >
            <div className="flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              <span className="font-medium">Report preferences</span>
            </div>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>

          {isExpanded && (
            <div className="mt-3 pb-4 space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                {/* Focus */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Focus</label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Choose the main perspective for your report</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Select
                    value={preferences.focus}
                    onValueChange={(value) => onChange({ ...preferences, focus: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {focusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center justify-between w-full">
                            <span>{option.value}</span>
                            <Tooltip>
                              <TooltipTrigger>
                                <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help ml-2" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">{option.tooltip}</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Depth */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">
                      Depth: {depthLabels[preferences.depth as keyof typeof depthLabels]}
                    </label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">{depthTooltips[preferences.depth as keyof typeof depthTooltips]}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="px-2">
                    <Slider
                      value={[preferences.depth]}
                      onValueChange={(value) => onChange({ ...preferences, depth: value[0] })}
                      min={1}
                      max={3}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Quick</span>
                      <span>Deep</span>
                    </div>
                  </div>
                </div>

                {/* Tone */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Tone</label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Select the writing style for your report</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Select
                    value={preferences.tone}
                    onValueChange={(value) => onChange({ ...preferences, tone: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {toneOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center justify-between w-full">
                            <span>{option.value}</span>
                            <Tooltip>
                              <TooltipTrigger>
                                <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help ml-2" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">{option.tooltip}</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}
