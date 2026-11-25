import type { ReportStep } from "../../api/reports"
import type { ReportPreferences } from "../../pages/HomePage"
import { ReportProgress } from "../report/ReportProgress"
import { TopicInput } from "./TopicInput"

interface TopSearchSectionProps {
  topic: string
  setTopic: (topic: string) => void
  preferences: ReportPreferences
  setPreferences: (preferences: ReportPreferences) => void
  isGenerating: boolean
  isStarting: boolean
  handleGenerateReport: () => void
  searchError: string
  connectionInterrupted: boolean
  currentStep: ReportStep | null
  refinedTopic: string
  onStopWaiting: () => void
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
  currentStep,
  refinedTopic,
  onStopWaiting,
}: TopSearchSectionProps) {
  return (
    <section id="top-search-section" className="search-section" tabIndex={-1} aria-labelledby="report-entry-title">
      <div className="search-intro">
        <h2 id="report-entry-title">Create a report</h2>
        <p className="section-subheading">Ask a question and get a report with sources.</p>
      </div>
      <div className="search-form-wrap">
        {searchError && (
          <p role="alert" className="mb-3 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-foreground">
            {searchError}
          </p>
        )}
        {isGenerating ? (
          <ReportProgress
            topic={refinedTopic || topic}
            step={currentStep}
            isStarting={isStarting}
            connectionInterrupted={connectionInterrupted}
            onStopWaiting={onStopWaiting}
          />
        ) : (
          <TopicInput
            value={topic}
            onChange={setTopic}
            onGenerate={handleGenerateReport}
            preferences={preferences}
            onPreferencesChange={setPreferences}
          />
        )}
      </div>
    </section>
  )
}
