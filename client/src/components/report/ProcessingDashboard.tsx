import { useState, useEffect } from "react"
import { X, Search, BarChart3, Target, Brain, Edit3 } from "lucide-react"
import { Button } from "../ui/button"
import { Card } from "../ui/card"
import { Progress } from "../ui/progress"

interface ProcessingDashboardProps {
  topic: string
  currentStep: string
  onCancel: () => void
}

export function ProcessingDashboard({ topic, currentStep, onCancel }: ProcessingDashboardProps) {
  const [progress, setProgress] = useState(0)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  const steps = [
    {
      id: "search",
      icon: <Search className="h-5 w-5" />,
      title: "Search Phase",
      description: "Refining search query and finding relevant articles",
      color: "text-blue-500"
    },
    {
      id: "profile",
      icon: <BarChart3 className="h-5 w-5" />,
      title: "Profiling Phase",
      description: "Analyzing article relevance and quality",
      color: "text-green-500"
    },
    {
      id: "select",
      icon: <Target className="h-5 w-5" />,
      title: "Selection Phase",
      description: "Selecting the best sources for analysis",
      color: "text-orange-500"
    },
    {
      id: "synthesize",
      icon: <Brain className="h-5 w-5" />,
      title: "Synthesis Phase",
      description: "Generating comprehensive analysis",
      color: "text-purple-500"
    },
    {
      id: "edit",
      icon: <Edit3 className="h-5 w-5" />,
      title: "Editing Phase",
      description: "Polishing final report",
      color: "text-pink-500"
    }
  ]

  useEffect(() => {
    const stepIndex = steps.findIndex(step => currentStep.toLowerCase().includes(step.id))
    if (stepIndex !== -1) {
      setCurrentStepIndex(stepIndex)
      setProgress((stepIndex + 1) / steps.length * 100)
    }
  }, [currentStep])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8 bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Generating Report</h2>
              <p className="text-muted-foreground mt-1">
                Topic: <span className="font-medium">{topic}</span>
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Steps */}
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-300 ${
                  index === currentStepIndex
                    ? 'bg-blue-50 border border-blue-200'
                    : index < currentStepIndex
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-muted/30'
                }`}
              >
                <div className={`p-2 rounded-full ${
                  index === currentStepIndex
                    ? 'bg-blue-100 text-blue-600'
                    : index < currentStepIndex
                    ? 'bg-green-100 text-green-600'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {step.icon}
                </div>

                <div className="flex-1">
                  <h3 className="font-medium">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>

                {index === currentStepIndex && (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                    <span className="text-sm text-blue-600">Processing...</span>
                  </div>
                )}

                {index < currentStepIndex && (
                  <div className="text-green-600">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Current Status */}
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              {currentStep || "Initializing..."}
            </p>
          </div>

          {/* Cancel Button */}
          <div className="text-center">
            <Button variant="outline" onClick={onCancel}>
              Cancel Generation
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}