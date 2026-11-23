import { useEffect, useState } from "react";
import { getReportHistory } from "../../api/reports";
import { Report } from "../../pages/ReportPage";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { format, formatDistanceToNow, isToday } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { History, FileText, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { deleteReport } from "../../api/reports"; // Will create this function next
import { useToast } from "../../hooks/useToast";

interface ReportHistoryProps {
  isSidebar?: boolean;
  isSidebarOpen?: boolean;
  reportCount: number;
  onOpenReportForm: () => void;
}

export function ReportHistory({ isSidebar = false, isSidebarOpen = true, reportCount, onOpenReportForm }: ReportHistoryProps) {
  const [history, setHistory] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const data = await getReportHistory();
        const sortedData = data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        if (sortedData && sortedData.length > 0) {
          
        }
        setHistory(sortedData);
      } catch (err) {
        setError("Failed to load report history.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [reportCount]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const handleViewReport = (report: Report) => {
    navigate(`/report/${report.job_id}`, { state: { report: report } });
  };

  const handleDeleteReport = async (jobId: string) => {
    if (!window.confirm("Are you sure you want to delete this report?")) {
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        await deleteReport(jobId);
        toast({
          title: "Report Deleted",
          description: "Report successfully removed from your history.",
        });
      } else {
        const guestHistoryString = sessionStorage.getItem('guestReportHistory');
        let guestHistory = guestHistoryString ? JSON.parse(guestHistoryString) : [];
        guestHistory = guestHistory.filter(report => report.job_id !== jobId);
        sessionStorage.setItem('guestReportHistory', JSON.stringify(guestHistory));
        toast({
          title: "Report Deleted",
          description: "Report successfully removed from session history.",
        });
      }

      setHistory(prevHistory => prevHistory.filter(report => report.job_id !== jobId));

    } catch (error) {
      console.error("Error deleting report:", error);
      toast({
        title: "Deletion Failed",
        description: "Could not delete the report. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return isSidebarOpen ? (
      <div className="p-4 text-center">Loading history...</div>
    ) : (
      <div className="flex justify-center items-center h-full"><History className="w-6 h-6 animate-pulse" /></div>
    );
  }

  if (error) {
    return isSidebarOpen ? (
      <div className="p-4 text-center text-red-500">Error loading history.</div>
    ) : (
      <div className="flex justify-center items-center h-full"><History className="w-6 h-6 text-red-500" /></div>
    );
  }

  if (isSidebar && !isSidebarOpen) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-2">
        <History className="w-6 h-6 text-muted-foreground" />
        {history.length > 0 && (
          <span className="text-xs font-medium">{history.length}</span>
        )}
      </div>
    );
  }

  return (
    <div id="report-history-section" className={isSidebar ? "" : "card"}>
      {!isSidebar && ( // Only show header if not in sidebar
        <CardHeader className="cursor-pointer" onClick={() => { /* No longer collapsible here */ }}>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" /> Report History
            </CardTitle>
          </div>
        </CardHeader>
      )}
      <div className={isSidebar ? "" : "card-content"}> {/* Adjust class based on sidebar */}
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-4 text-center space-y-4">
            <History className="w-12 h-12 text-muted-foreground" />
            <p className="text-lg font-semibold">No reports yet!</p>
            <p className="text-sm text-muted-foreground">
              Generate your first comprehensive news report and it will appear here.
            </p>
            {isSidebar && (
              <Button onClick={onOpenReportForm} className="mt-4">
                Generate Report
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((report) => (
              <div
                key={report.job_id}
                className="flex items-center justify-between p-2 border rounded-md hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0 mr-2">
                  <p className="font-medium">News report on: {report.refined_topic || report.topic}</p>
                  <p className="text-xs text-muted-foreground">
                    Generated {formatTimestamp(report.timestamp)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleViewReport(report)} className="h-8 w-8">
                    <FileText className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteReport(report.job_id)} className="h-8 w-8">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
