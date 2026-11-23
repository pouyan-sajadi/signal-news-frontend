import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface ReportContentProps {
  content: string
}

export function ReportContent({ content }: ReportContentProps) {
  return (
    <div className="report-markdown">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  )
}
