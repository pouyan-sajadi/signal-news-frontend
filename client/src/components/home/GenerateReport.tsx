
import { ReportPreferences } from "../../pages/HomePage";
import { TopicInput } from "./TopicInput";

import { Card } from "../ui/card";
import { Progress } from "../ui/progress";
import { Button } from "../ui/button";
import { X, Search, BarChart3, Target, Brain, Edit3 } from "lucide-react";

interface GenerateReportProps {
    topic: string;
    setTopic: (topic: string) => void;
    preferences: ReportPreferences;
    setPreferences: (preferences: ReportPreferences) => void;
    isGenerating: boolean;
    handleGenerateReport: () => void;
    progress: number;
    currentStepIndex: number;
    refinedTopic: string;
    processingStep: string;
    handleCancelGeneration: () => void;
}

export function GenerateReport({
    topic,
    setTopic,
    preferences,
    setPreferences,
    isGenerating,
    handleGenerateReport,
    progress,
    currentStepIndex,
    refinedTopic,
    processingStep,
    handleCancelGeneration
}: GenerateReportProps) {
    const steps = [
        {
          id: "search",
          icon: <Search className="h-4 w-4" />,
          title: "Search Phase",
          description: "Refining search query and finding relevant articles",
          color: "text-blue-500"
        },
        {
          id: "profiling",
          icon: <BarChart3 className="h-4 w-4" />,
          title: "Profiling Phase",
          description: "Analyzing article relevance and quality",
          color: "text-green-500"
        },
        {
          id: "selection",
          icon: <Target className="h-4 w-4" />,
          title: "Selection Phase",
          description: "Selecting the best sources for analysis",
          color: "text-orange-500"
        },
        {
          id: "synthesis",
          icon: <Brain className="h-4 w-4" />,
          title: "Synthesis Phase",
          description: "Generating comprehensive analysis",
          color: "text-purple-500"
        },
        {
          id: "editing",
          icon: <Edit3 className="h-4 w-4" />,
          title: "Editing Phase",
          description: "Polishing final report",
          color: "text-pink-500"
        }
      ]

    return (
        <div className="mt-12 pt-8 border-t border-gray-200 max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                    Generate News Report
                </h2>
                <p className="text-lg text-muted-foreground mx-auto">
                    Enter any topic to get a comprehensive, AI-generated news analysis with real-time processing updates.
                </p>
            </div>

            {!isGenerating ? (
                <>
                    <TopicInput
                        value={topic}
                        onChange={setTopic}
                        onGenerate={handleGenerateReport}
                        disabled={isGenerating}
                        preferences={preferences}
                        onPreferencesChange={setPreferences}
                    />
                </>
            ) : (
                <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg mx-auto">
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold">Generating Report</h3>
                                <p className="text-muted-foreground mt-1">
                                    Topic: <span className="font-medium">{refinedTopic || topic}</span>
                                </p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={handleCancelGeneration}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Progress</span>
                                <span>{Math.round(progress)}%</span>
                            </div>
                            <Progress value={progress} className="h-2 bg-white" indicatorClassName="bg-purple-600" />
                        </div>

                        {/* Steps */}
                        <div className="space-y-3">
                            {steps.map((step, index) => (
                                <div
                                    key={step.id}
                                    className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${index === currentStepIndex
                                            ? 'bg-blue-50 border border-blue-200'
                                            : index < currentStepIndex
                                                ? 'bg-green-50 border border-green-200'
                                                : 'bg-muted/30'
                                        }`}
                                >
                                    <div className={`p-2 rounded-full ${index === currentStepIndex
                                            ? 'bg-blue-100 text-blue-600'
                                            : index < currentStepIndex
                                                ? 'bg-green-100 text-green-600'
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
                            <p className="text-sm text-muted-foreground">
                                {processingStep || "Initializing..."}
                            </p>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    )
}
