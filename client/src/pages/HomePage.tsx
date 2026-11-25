import { useEffect, useRef, useState } from "react"
import { useNavigate, useOutletContext, useLocation, useNavigationType } from "react-router-dom"
import { Dashboard } from "./Dashboard"
import { HeroSection } from "../components/home/HeroSection"
import { TopSearchSection } from "../components/home/TopSearchSection";

import { reportSteps, ReportSearchError, startReport, waitForReport } from "../api/reports"
import type { ReportStep } from "../api/reports"
import { saveHistory } from "../api/history"
import type { Report } from "./ReportPage"

interface OutletContext {
  setReportCount: React.Dispatch<React.SetStateAction<number>>;
}

export interface ReportPreferences {
  focus: string
  depth: number
  tone: string
}

interface PendingReport {
  jobId: string
  topic: string
  preferences: ReportPreferences
}

const pendingReportKey = "heysignal.pendingReport"

function readPendingReport(): PendingReport | null {
  try {
    const job = JSON.parse(sessionStorage.getItem(pendingReportKey) ?? "null")
    if (typeof job?.jobId === "string" && typeof job.topic === "string" &&
        typeof job.preferences?.focus === "string" && typeof job.preferences.depth === "number" &&
        typeof job.preferences.tone === "string") {
      return job
    }
  } catch {
    // The report can still be tracked in memory when browser storage is unavailable.
  }
  return null
}

function storePendingReport(job: PendingReport | null) {
  try {
    if (job) sessionStorage.setItem(pendingReportKey, JSON.stringify(job))
    else sessionStorage.removeItem(pendingReportKey)
  } catch {
    // Storage is optional for the currently open page.
  }
}

export function HomePage() {
  const [pendingReport, setPendingReport] = useState(readPendingReport)
  const [topic, setTopic] = useState(pendingReport?.topic ?? "")
  const [preferences, setPreferences] = useState<ReportPreferences>(pendingReport?.preferences ?? {
    focus: "Just the Facts",
    depth: 1,
    tone: "Express Mode"
  })
  const [isStarting, setIsStarting] = useState(false)
  const [connectionInterrupted, setConnectionInterrupted] = useState(false)
  const [searchError, setSearchError] = useState("")
  const [refinedTopic, setRefinedTopic] = useState("")
  const [currentStep, setCurrentStep] = useState<ReportStep | null>(null)
  const trackingController = useRef<AbortController | null>(null)
  const navigate = useNavigate()
  const { setReportCount } = useOutletContext<OutletContext>();
  const location = useLocation()
  const navigationType = useNavigationType()
  const [dashboardReady, setDashboardReady] = useState(false)
  const anchor = location.hash.slice(1)
  const focusReportTopic = anchor === 'top-search-section' && location.state?.focusReportTopic === true
  const contentAboveAnchorCanShift = anchor === 'dashboard-section' || anchor === 'top-search-section'
  const canScrollToAnchor = focusReportTopic || dashboardReady || !contentAboveAnchorCanShift

  useEffect(() => {
    if (!canScrollToAnchor) return

    const frame = requestAnimationFrame(() => {
      const target = document.getElementById(anchor)
      if (target) {
        const focusTarget = focusReportTopic ? document.getElementById('report-topic') ?? target : target
        focusTarget.focus({ preventScroll: true })
        target.scrollIntoView({ behavior: navigationType === 'POP' ? 'instant' : 'auto' })
      } else {
        window.scrollTo({ top: 0, behavior: 'instant' })
      }
    })
    return () => cancelAnimationFrame(frame)
  }, [anchor, canScrollToAnchor, focusReportTopic, location.key, navigationType])

  useEffect(() => {
    if (!pendingReport) return
    const { jobId, topic, preferences } = pendingReport
    const controller = new AbortController()
    trackingController.current = controller

    waitForReport(jobId, controller.signal, update => {
      setConnectionInterrupted(update === null)
      if (!update) return
      if (reportSteps.includes(update.step)) setCurrentStep(update.step)
      if (update.refined_topic) setRefinedTopic(update.refined_topic)
    })
      .then(finalReport => {
        if (controller.signal.aborted) return
        storePendingReport(null)
        setPendingReport(null)
        const report: Report = {
          job_id: jobId,
          user_preferences: preferences,
          final_report_data: finalReport.agent_details,
          selected_source_count: finalReport.agent_details.selection?.length,
          topic,
          refined_topic: finalReport.refined_topic || topic,
          timestamp: new Date().toISOString(),
        }
        void saveHistory(report).then(() => setReportCount(count => count + 1))
        navigate(`/report/${jobId}`, { state: { report } })
      })
      .catch(error => {
        if (controller.signal.aborted) return
        console.error("Search report could not be completed:", error)
        storePendingReport(null)
        setPendingReport(null)
        setSearchError(error instanceof ReportSearchError
          ? error.message
          : "We couldn’t finish your report. Try again in a moment.")
      })

    return () => {
      controller.abort()
      trackingController.current = null
    }
  }, [pendingReport, navigate, setReportCount])

  const handleGenerateReport = async () => {
    if (isStarting || pendingReport) return
    const searchTopic = topic.trim()
    if (!searchTopic) {
      setSearchError("Enter a topic to start a report.")
      return
    }

    setSearchError("")
    setIsStarting(true)
    setConnectionInterrupted(false)
    setRefinedTopic("")
    setCurrentStep(null)

    try {
      const jobId = await startReport(searchTopic, preferences)
      const job = { jobId, topic: searchTopic, preferences }
      storePendingReport(job)
      setPendingReport(job)
    } catch (error) {
      console.error("Could not start search report:", error)
      setSearchError(navigator.onLine
        ? "We couldn’t start your report. Try again in a moment."
        : "You’re offline. Reconnect to start a report.")
    } finally {
      setIsStarting(false)
    }
  }

  const handleStopWaiting = () => {
    trackingController.current?.abort()
    storePendingReport(null)
    setPendingReport(null)
  }

  return (
    <div className="home-flow">
      <HeroSection />
      <Dashboard onReady={setDashboardReady} />
      <TopSearchSection
        topic={topic}
        setTopic={setTopic}
        preferences={preferences}
        setPreferences={setPreferences}
        isGenerating={isStarting || pendingReport !== null}
        isStarting={isStarting}
        handleGenerateReport={handleGenerateReport}
        searchError={searchError}
        connectionInterrupted={connectionInterrupted}
        currentStep={currentStep}
        refinedTopic={refinedTopic}
        onStopWaiting={handleStopWaiting}
      />
    </div>
  )
}
