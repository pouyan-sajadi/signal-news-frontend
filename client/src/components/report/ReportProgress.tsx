import { Check, FileCheck2, FileText, Layers, Newspaper, Search } from "lucide-react"
import { reportSteps, type ReportStep } from "../../api/reports"
import { Button } from "../ui/button"
import "./ReportProgress.css"

const stages = {
  search: { label: "Find", title: "Finding coverage", detail: "Looking for recent articles on your topic.", icon: Search },
  profiling: { label: "Read", title: "Reading the sources", detail: "Looking for relevant facts and perspectives.", icon: Newspaper },
  selection: { label: "Select", title: "Choosing sources", detail: "Picking articles that add something to the story.", icon: Layers },
  synthesis: { label: "Write", title: "Writing the report", detail: "Putting the findings together with source links.", icon: FileText },
  editing: { label: "Edit", title: "Editing the report", detail: "Making the draft clear in the tone you chose.", icon: FileCheck2 },
}

interface ReportProgressProps {
  topic: string
  step: ReportStep | null
  isStarting: boolean
  connectionInterrupted: boolean
  onStopWaiting: () => void
}

export function ReportProgress({
  topic,
  step,
  isStarting,
  connectionInterrupted,
  onStopWaiting,
}: ReportProgressProps) {
  const activeIndex = step === null ? -1 : reportSteps.indexOf(step)
  const status = isStarting
    ? { title: "Starting your report", detail: "" }
    : connectionInterrupted
      ? { title: "Reconnecting", detail: "We’ll check for your report again shortly." }
      : step === null
        ? { title: "Checking report progress", detail: "" }
        : stages[step]

  return (
    <div className="report-progress" aria-labelledby="report-progress-title">
      <div className="report-progress__header">
        <div className="report-progress__heading">
          <h3 id="report-progress-title">Creating your report</h3>
          <p className="report-progress__topic">{topic}</p>
        </div>
        {!isStarting && (
          <Button variant="ghost" size="sm" className="shrink-0" onClick={onStopWaiting}>Back to form</Button>
        )}
      </div>

      <ol className="report-progress__stages" aria-label="Report stages">
        {reportSteps.map((id, index) => {
          const { label, icon: Icon } = stages[id]
          const state = index < activeIndex ? "complete" : index === activeIndex ? "current" : "upcoming"
          return (
            <li
              key={id}
              className="report-progress__stage"
              data-state={state}
              aria-current={state === "current" ? "step" : undefined}
            >
              <span className="report-progress__marker" aria-hidden="true">
                {state === "complete" ? <Check /> : <Icon />}
                {state === "current" && !connectionInterrupted && <span className="report-progress__pulse" />}
              </span>
              <span>{label}{state === "complete" && <span className="sr-only"> completed</span>}</span>
            </li>
          )
        })}
      </ol>

      <div className="report-progress__status" role="status" aria-atomic="true">
        <p>{status.title}</p>
        {status.detail && <p>{status.detail}</p>}
      </div>
      <p className="report-progress__note">This can take several minutes. You can switch tabs and come back to this one.</p>
    </div>
  )
}
