import { useEffect, useState } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { ArrowLeft, Link2, Download } from "lucide-react"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { ReportContent } from "../components/report/ReportContent"
import { useToast } from "../hooks/useToast"

import { getReport } from "../api/reports";
import html2pdf from 'html2pdf.js';

export interface Report {
  job_id: string;
  topic: string;
  refined_topic?: string; // Make it optional for backward compatibility
  selected_source_count?: number;
  user_preferences: {
    focus: string;
    depth: number;
    tone: string;
  };
  timestamp: string;
  final_report_data: {
    search: any[];
    profiling: any[];
    selection: any[];
    synthesis: string;
    editing: string;
  };
}

export function ReportPage() {
  const { id } = useParams<{ id: string }>(); // `id` is now the job_id
  const navigate = useNavigate();
  const location = useLocation(); // Use useLocation hook
  const { toast } = useToast();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      if (!id) {
        toast({
          title: "Report Not Found",
          description: "No report ID provided.",
          variant: "destructive",
        });
        navigate("/");
        setLoading(false);
        return;
      }

      // Priority 1: Report data passed via navigation state
      if (location.state?.report) {
        setReport(location.state.report);
        setLoading(false);
        return;
      }

      // Priority 2: Fetch from API (for logged-in users)
      try {
        const fetchedReport = await getReport(id);
        setReport(fetchedReport);
        setLoading(false);
        return;
      } catch (apiError) {
        // This is expected to fail for guest users, so we continue
        console.warn(`API fetch failed for report ${id}. This is expected for guest users. Checking session storage next.`);
      }

      // Priority 3: Check session storage (for guest users on page reload)
      const guestHistoryString = sessionStorage.getItem('guestReportHistory');
      if (guestHistoryString) {
        try {
          const guestHistory: Report[] = JSON.parse(guestHistoryString);
          const reportFromSession = guestHistory.find(r => r.job_id === id);
          if (reportFromSession) {
            setReport(reportFromSession);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error("Failed to parse guest history from session storage", e);
        }
      }

      // If all methods fail, the report is not found
      toast({
        title: "Report Not Found",
        description: "Could not find the specified report.",
        variant: "destructive",
      });
      navigate("/");
      setLoading(false);
    };

    fetchReport();
  }, [id, navigate, toast, location.state]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast({ title: "Report link copied" })
    } catch {
      toast({
        title: "Couldn’t copy the link",
        description: "Copy the address from your browser.",
        variant: "destructive",
      })
    }
  }

  const handleExportPdf = async () => {
    if (!report) {
      toast({
        title: "Export Failed",
        description: "No report data to export.",
        variant: "destructive",
      });
      return;
    }

    const reportContentElement = document.getElementById("report-content");
    if (!reportContentElement) {
      toast({
        title: "Export Failed",
        description: "Could not find report content to export.",
        variant: "destructive",
      });
      return;
    }

    // Create a new container for the PDF content
    const pdfContainer = document.createElement("div");
    pdfContainer.style.padding = "20px";
    pdfContainer.style.fontFamily = "Arial, sans-serif";

    // 1. Add Title
    const title = document.createElement("h1");
    title.textContent = `The Signal Report: ${report.topic}`;
    title.style.color = "#333";
    title.style.borderBottom = "2px solid #eee";
    title.style.paddingBottom = "10px";
    title.style.marginBottom = "10px";
    pdfContainer.appendChild(title);

    // 2. Add Generation Timestamp
    const timestamp = document.createElement("p");
    timestamp.textContent = `Generated on: ${new Date(report.timestamp).toLocaleString()}`;
    timestamp.style.fontSize = "12px";
    timestamp.style.color = "#666";
    timestamp.style.marginBottom = "20px";
    pdfContainer.appendChild(timestamp);

    // 3. Add Preference Tags
    const tagsContainer = document.createElement("div");
    tagsContainer.style.marginBottom = "20px";
    
    const createTag = (text: string) => {
      const tag = document.createElement("span");
      tag.textContent = text;
      tag.style.backgroundColor = "#e0e0e0";
      tag.style.color = "#333";
      tag.style.padding = "5px 10px";
      tag.style.marginRight = "10px";
      tag.style.borderRadius = "15px";
      tag.style.fontSize = "12px";
      return tag;
    };

    tagsContainer.appendChild(createTag(report.user_preferences.focus));
    tagsContainer.appendChild(createTag(`Depth: ${report.user_preferences.depth}/3`));
    tagsContainer.appendChild(createTag(report.user_preferences.tone));
    pdfContainer.appendChild(tagsContainer);

    pdfContainer.appendChild(reportContentElement.cloneNode(true));

    // Generate PDF from the new container
    try {
      await html2pdf().from(pdfContainer).set({
        margin: [15, 15, 15, 15],
        filename: report.topic.replace(/\s+/g, "_").toLowerCase() + "_report.pdf",
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }).save();
    } catch {
      toast({
        title: "Couldn’t export the report",
        description: "Try exporting the PDF again.",
        variant: "destructive",
      })
    }
  };

  if (loading) {
    return (
      <div className="report-page">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="report-page">
        <h1 className="text-2xl font-bold text-muted-foreground">Report not found</h1>
      </div>
    )
  }

  // Older history entries discarded the selection, so an empty legacy array is ambiguous.
  const sourceCount = report.selected_source_count ?? (report.final_report_data.selection?.length || undefined);

  return (
    <article className="report-page">
      <div className="report-actions">
        <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Button>
        <div className="report-tools">
          <Button variant="ghost" size="sm" onClick={handleCopyLink} className="gap-2">
            <Link2 className="h-4 w-4" />
            Copy link
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPdf} className="gap-2">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <header className="report-heading">
        <h1>{report.refined_topic || report.topic}</h1>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{report.user_preferences.focus}</Badge>
          <Badge variant="secondary">Depth: {report.user_preferences.depth}/3</Badge>
          <Badge variant="secondary">{report.user_preferences.tone}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Generated on {new Date(report.timestamp).toLocaleDateString()}
          {sourceCount !== undefined && ` • ${sourceCount} ${sourceCount === 1 ? "source" : "sources"} selected`}
        </p>
      </header>

      <div id="report-content">
        <ReportContent content={report.final_report_data.editing} />
      </div>
    </article>
  )
}
