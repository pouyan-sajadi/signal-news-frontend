import api from './api';
import type { ReportPreferences } from '../pages/HomePage';
import { supabase } from '../lib/supabaseClient';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
// const BACKEND_URL = 'http://localhost:8000'; // Hardcoded for local testing

// Define the structure of the final report data from the backend
export interface FinalReportData {
  topic: string;
  refined_topic?: string;
  agent_details: {
    search: any[]; // Adjust types as per actual data
    profiling: any[];
    selection: any[];
    synthesis: string;
    editing: string; // This is the Markdown content
  };
}

export const reportSteps = ['search', 'profiling', 'selection', 'synthesis', 'editing'] as const;
export type ReportStep = typeof reportSteps[number];

type ReportProgress = {
  status: 'running';
  step: ReportStep;
  refined_topic?: string | null;
};

type ReportStatus = ReportProgress | {
  status: 'completed';
  data: FinalReportData;
} | {
  status: 'error';
  code: keyof typeof failureMessages;
};

const failureMessages = {
  invalid_topic: "We couldn’t identify a news topic. Try a different topic.",
  no_articles: "We couldn’t find recent coverage for that topic. Try a broader search.",
  timed_out: "Your report took too long to finish. Try a narrower topic or try again.",
  unavailable: "We couldn’t finish your report. Try again in a moment.",
};

export class ReportSearchError extends Error {}

export async function startReport(topic: string, preferences: ReportPreferences) {
  const { data } = await api.post(`${BACKEND_URL}/process_news`, {
    topic,
    user_preferences: preferences,
  }, { timeout: 60_000 });
  if (typeof data?.job_id !== 'string' || !data.job_id) {
    throw new ReportSearchError("We couldn’t start your report. Try again in a moment.");
  }
  return data.job_id as string;
}

function waitForNextCheck(delay: number, signal: AbortSignal) {
  return new Promise<void>(resolve => {
    if (signal.aborted) {
      resolve();
      return;
    }

    const finish = () => {
      clearTimeout(timer);
      signal.removeEventListener('abort', finish);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('online', finish);
      resolve();
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') finish();
    };
    const timer = window.setTimeout(finish, delay);
    signal.addEventListener('abort', finish, { once: true });
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('online', finish);
  });
}

export async function waitForReport(
  jobId: string,
  signal: AbortSignal,
  onProgress: (update: ReportProgress | null) => void,
): Promise<FinalReportData> {
  const url = `${BACKEND_URL}/report-jobs/${encodeURIComponent(jobId)}`;
  let retryDelay = 3_000;

  while (!signal.aborted) {
    let update: ReportStatus;
    try {
      const response = await api.get(url, { signal, timeout: 10_000 });
      update = response.data;
    } catch (error) {
      if (signal.aborted) break;
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        throw new ReportSearchError("This report is no longer available. Start a new search to try again.");
      }
      if (status && status < 500 && status !== 408 && status !== 429) {
        throw new ReportSearchError("We couldn’t check your report. Start a new search to try again.");
      }
      onProgress(null);
      await waitForNextCheck(retryDelay, signal);
      retryDelay = Math.min(retryDelay * 2, 15_000);
      continue;
    }

    if (signal.aborted) break;
    if (update?.status === 'completed' && update.data?.agent_details?.editing?.trim()) {
      return update.data;
    }
    if (update?.status === 'error') {
      const message = Object.prototype.hasOwnProperty.call(failureMessages, update.code)
        ? failureMessages[update.code]
        : failureMessages.unavailable;
      throw new ReportSearchError(message);
    }
    if (update?.status !== 'running') {
      throw new ReportSearchError(failureMessages.unavailable);
    }

    onProgress(update);
    retryDelay = 3_000;
    await waitForNextCheck(document.visibilityState === 'hidden' ? 15_000 : 3_000, signal);
  }
  throw new DOMException('Stopped checking for the report.', 'AbortError');
}

import { Report } from '../pages/ReportPage';

export const getReport = async (jobId: string): Promise<Report> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      // This case should ideally not be hit for logged-in users' reports,
      // but as a fallback, we can throw an error. Guests can't reload reports anyway.
      throw new Error("User not authenticated.");
    }

    const response = await api.get(`${BACKEND_URL}/reports/${jobId}`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    });
    return response.data as Report;
  } catch (error: any) {
    console.error(`Error fetching report ${jobId}:`, error);
    throw new Error(error?.response?.data?.detail || error.message || `Failed to fetch report ${jobId}.`);
  }
};

// Description: Get user's report history
// Endpoint: GET /api/reports/history
// Request: {}
// Response: { reports: Array<{ id: string, topic: string, createdAt: string, preferences: ReportPreferences }> }
export const getReportHistory = async (): Promise<Report[]> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      // Guest user: fetch from sessionStorage
      const guestHistory = sessionStorage.getItem('guestReportHistory');
      return guestHistory ? JSON.parse(guestHistory) : [];
    }

    // Logged-in user: fetch from backend
    const response = await api.get(`${BACKEND_URL}/api/history`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    });
    // The backend now returns the correct array of report objects, so we just need to type it correctly.
    
    return response.data as Report[];
  } catch (error: any) {
    console.error("Error fetching report history:", error);
    throw new Error(error?.response?.data?.detail || error.message || "Failed to fetch report history.");
  }
};

// Description: Delete a report
// Endpoint: DELETE /api/reports/:id
// Request: {}
// Response: { success: boolean, message: string }
export const deleteReport = async (jobId: string) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("User not authenticated.");
    }

    const response = await api.delete(`${BACKEND_URL}/api/history/${jobId}`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error(`Error deleting report ${jobId}:`, error);
    throw new Error(error?.response?.data?.detail || error.message || `Failed to delete report ${jobId}.`);
  }
};

