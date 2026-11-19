import { TopicInput } from "./TopicInput";
import { ReportPreferences } from "../../pages/HomePage";
import { Card } from "../ui/card";
import { Progress } from "../ui/progress";
import { Button } from "../ui/button";
import { Search, BarChart3, Target, Brain, Edit3 } from "lucide-react";

interface TopSearchSectionProps {
  topic: string;
  setTopic: (topic: string) => void;
  preferences: ReportPreferences;
  setPreferences: (preferences: ReportPreferences) => void;
  isGenerating: boolean;
  isStarting: boolean;
  handleGenerateReport: () => void;
  searchError: string;
  connectionInterrupted: boolean;
  progress: number;
  currentStepIndex: number;
  refinedTopic: string;
  onStopWaiting: () => void;
}

export function TopSearchSection({
  topic,
  setTopic,
  preferences,
  setPreferences,
  isGenerating,
  isStarting,
  handleGenerateReport,
  searchError,
  connectionInterrupted,
  progress,
  currentStepIndex,
  refinedTopic,
  onStopWaiting,
}: TopSearchSectionProps) {
  const steps = [
    {
      id: "search",
      icon: <Search className="h-4 w-4" />,
      title: "Find coverage",
      description: "Look for recent articles on your topic",
      color: "text-blue-500"
    },
    {
      id: "profiling",
      icon: <BarChart3 className="h-4 w-4" />,
      title: "Review sources",
      description: "Check which articles are relevant",
      color: "text-green-500"
    },
    {
      id: "selection",
      icon: <Target className="h-4 w-4" />,
      title: "Choose evidence",
      description: "Select sources with useful perspectives",
      color: "text-orange-500"
    },
    {
      id: "synthesis",
      icon: <Brain className="h-4 w-4" />,
      title: "Connect the findings",
      description: "Compare what the sources say",
      color: "text-purple-500"
    },
    {
      id: "editing",
      icon: <Edit3 className="h-4 w-4" />,
      title: "Write your report",
      description: "Pull the findings into a clear report",
      color: "text-pink-500"
    }
  ]

  return (
    <section id="top-search-section" className="search-section" tabIndex={-1} aria-labelledby="report-entry-title">
      <div className="search-intro"><h2 id="report-entry-title">Create a report</h2></div>
      <div className="search-form-wrap">
        {searchError && (
          <p role="alert" className="mb-3 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-foreground">
            {searchError}
          </p>
        )}
        {!isGenerating ? (
          <TopicInput
            value={topic}
            onChange={setTopic}
            onGenerate={handleGenerateReport}
            disabled={isGenerating}
            preferences={preferences}
            onPreferencesChange={setPreferences}
          />
        ) : (
          <Card className="p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg mx-auto">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Creating your report</h3>
                  <p className="text-muted-foreground mt-1">
                    Topic: <span className="font-medium">{refinedTopic || topic}</span>
                  </p>
                </div>
                {!isStarting && (
                  <Button variant="ghost" size="sm" onClick={onStopWaiting}>Stop waiting</Button>
                )}
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2 bg-white dark:bg-slate-700" indicatorClassName="bg-purple-600" />
              </div>

              {/* Steps */}
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${index === currentStepIndex
                        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                        : index < currentStepIndex
                          ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                          : 'bg-muted/30'
                      }`}
                  >
                    <div className={`p-2 rounded-full ${index === currentStepIndex
                        ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600'
                        : index < currentStepIndex
                          ? 'bg-green-100 dark:bg-green-900/40 text-green-600'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                      {step.icon}
                    </div>

                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{step.title}</h4>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </div>

                    {index === currentStepIndex && (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-600 border-t-transparent"></div>
                        <span className="text-xs text-blue-600">Processing...</span>
                      </div>
                    )}

                    {index < currentStepIndex && (
                      <div className="text-green-600 animate-scale-in">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Current Status */}
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <p role="status" className="text-sm text-muted-foreground">
                  {isStarting
                    ? "Starting your report…"
                    : connectionInterrupted
                      ? "Connection interrupted. We’ll check for your report again shortly."
                      : "You can switch tabs while your report runs."}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </section>
  );
}
