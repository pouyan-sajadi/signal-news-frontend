import { useEffect, useState } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { ArrowLeft, Share2, Download, Bookmark, MoreHorizontal } from "lucide-react"
import { Button } from "../components/ui/button"
import { Card } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { ReportContent } from "../components/report/ReportContent"
import { NerdStats } from "../components/report/NerdStats"
import { RelatedTopics } from "../components/report/RelatedTopics"
import { FinalReportData } from "../api/reports"
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
  const [showStats, setShowStats] = useState(false);

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

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast({
      title: "Link Copied",
      description: "Report link copied to clipboard"
    })
  }

  const handleExportPdf = () => {
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

    // 4. Clone the report content and remove the progress bar
    const clonedContent = reportContentElement.cloneNode(true) as HTMLElement;
    const progressBar = clonedContent.querySelector(".p-4.border-b");
    if (progressBar) {
      progressBar.remove();
    }
    pdfContainer.appendChild(clonedContent);

    // Generate PDF from the new container
    html2pdf().from(pdfContainer).set({
      margin: [15, 15, 15, 15],
      filename: `${report.topic.replace(/\s+/g, "_").toLowerCase()}_report.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, logging: true, dpi: 192, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).save();

    toast({
      title: "Export Started",
      description: "Your report is being generated as a PDF.",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
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
      <div className="container mx-auto px-4 py-8 max-w-4xl text-center">
        <h1 className="text-2xl font-bold text-muted-foreground">Report not found</h1>
      </div>
    )
  }

  // Older history entries discarded the selection, so an empty legacy array is ambiguous.
  const sourceCount = report.selected_source_count ?? (report.final_report_data.selection?.length || undefined);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPdf} className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          {/* <Button variant="outline" size="sm" className="gap-2">
            <Bookmark className="h-4 w-4" />
            Save
          </Button> */}
          {/* <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowStats(!showStats)}
            className="gap-2"
          >
            <MoreHorizontal className="h-4 w-4" />
            Stats
          </Button> */}
        </div>
      </div>

      {/* Report Header */}
      <Card className="p-6 mb-8 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            The gist of what was found on "{report.refined_topic || report.topic}"
          </h1>
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{report.user_preferences.focus}</Badge>
            <Badge variant="secondary">Depth: {report.user_preferences.depth}/3</Badge>
            <Badge variant="secondary">{report.user_preferences.tone}</Badge>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Generated on {new Date(report.timestamp).toLocaleDateString()}
            {sourceCount !== undefined && ` • ${sourceCount} ${sourceCount === 1 ? "source" : "sources"} selected`}
          </p>
        </div>
      </Card>

      {/* Nerd Stats */}
      {showStats && sourceCount !== undefined && (
        <div className="mb-8">
          <NerdStats 
            searchQueries={report.final_report_data.search.map((item: any) => item.query || item.title || JSON.stringify(item))}
            sourcesAnalyzed={report.final_report_data.search.length}
            sourcesSelected={sourceCount}
            processingTime={0} // Placeholder, as this is not available in the current backend response
            generatedAt={report.timestamp}
            sources={report.final_report_data.selection.map((item: any) => ({ title: item.title, url: item.link, domain: new URL(item.link).hostname }))}
          />
        </div>
      )}

      {/* Report Content */}
      <div id="report-content" className="mb-8">
        <ReportContent content={report.final_report_data.editing} />
      </div>

      {/* Related Topics */}
      <RelatedTopics 
        topics={[]} // Related topics are not available in the current backend response
        onTopicSelect={(topic) => {
          
          navigate("/", { state: { selectedTopic: topic } })
        }}
      />
    </div>
  )
}
