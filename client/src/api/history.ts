import api from './api';
import { supabase } from '../lib/supabaseClient';
import type { Report } from '../pages/ReportPage';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
// const BACKEND_URL = 'http://localhost:8000'; // Hardcoded for local testing

export const saveHistory = async (report: Report) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    // History keeps the report metadata and Markdown without duplicating full articles.
    const summary: Report = {
      ...report,
      final_report_data: {
        editing: report.final_report_data.editing,
        search: [],
        profiling: [],
        selection: [],
        synthesis: ''
      }
    };

    if (session?.user) {
      // Logged-in user: save to backend
      
      await api.post(`${BACKEND_URL}/api/history`, {
        search_topic: report.topic,
        report_summary: summary,
      }, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      
    } else {
      // Guest user: save to sessionStorage
      
      const guestHistoryString = sessionStorage.getItem('guestReportHistory');
      const guestHistory = guestHistoryString ? JSON.parse(guestHistoryString) : [];
      guestHistory.unshift(summary);
      sessionStorage.setItem('guestReportHistory', JSON.stringify(guestHistory));
    }
  } catch (error) {
    console.error("Failed to save history:", error);
  }
};
