import React, { useRef, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { ReportHistory } from './home/ReportHistory';
import { Button } from './ui/button';
import { PanelLeftOpen, PanelLeftClose, History } from 'lucide-react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

interface LayoutWithSidebarProps {
  children?: React.ReactNode;
  reportCount: number;
  setReportCount: React.Dispatch<React.SetStateAction<number>>;
}

export function LayoutWithSidebar({ children, reportCount, setReportCount }: LayoutWithSidebarProps) {
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const openFormAfterClose = useRef(false);
  const navigate = useNavigate();
  const openReportForm = () => navigate('/#top-search-section', { state: { focusReportTopic: true } });

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside
        className={`history-rail relative flex-col h-screen bg-card border-r border-border transition-all duration-300 ease-in-out w-64 p-4 ${isDesktopSidebarOpen ? 'is-open' : ''}`}
      >
        <div className="flex items-center justify-between mb-4">
          {isDesktopSidebarOpen && (
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <History className="h-5 w-5" />
              Report History
            </h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
            className="ml-auto"
          >
            {isDesktopSidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <ReportHistory
            isSidebar
            isSidebarOpen={isDesktopSidebarOpen}
            reportCount={reportCount}
            onOpenReportForm={openReportForm}
          />
        </div>
      </aside>

      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <SheetContent
          side="left"
          className="w-64 p-4"
          aria-describedby={undefined}
          onCloseAutoFocus={event => {
            if (!openFormAfterClose.current) return;
            event.preventDefault();
            openFormAfterClose.current = false;
            openReportForm();
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <SheetTitle className="display-type">Report history</SheetTitle>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ReportHistory
              isSidebar
              reportCount={reportCount}
              onOpenReportForm={() => {
                openFormAfterClose.current = true;
                setIsMobileSidebarOpen(false);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="min-w-0 flex-1 flex flex-col">
        <Header 
          isDesktopSidebarOpen={isDesktopSidebarOpen}
          setIsDesktopSidebarOpen={setIsDesktopSidebarOpen}
          setIsMobileSidebarOpen={setIsMobileSidebarOpen}
        />
        <div className="flex-grow">
          {children || <Outlet context={{ setReportCount }} />}
        </div>
        <Footer />
      </main>
    </div>
  );
}
