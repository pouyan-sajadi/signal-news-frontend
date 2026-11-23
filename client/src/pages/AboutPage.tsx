import React from 'react';
import { Link } from 'react-router-dom';

export function AboutPage() {
  return (
    <div className="info-page">
      <h1 className="text-4xl font-bold mb-6 text-gray-900">About Hey Signal</h1>

      <p className="text-lg text-gray-700 leading-relaxed mb-6">
        <strong className="font-semibold">Hey Signal</strong> tackles tech information overload by turning broad, messy sources into concise reports
        and a live trend dashboard. For any topic, the backend spins up a GPT-based, multi-agent workflow that expands queries,
        evaluates sources, synthesizes content, and formats a multi-page Markdown report—then streams progress to the UI in real time.
      </p>

      <h2 className="text-2xl font-semibold mb-3 text-gray-800">Daily Tech Overview</h2>
        <p className="text-lg text-gray-700 leading-relaxed mb-6">
          <strong className="font-semibold">Tech Pulse dashboard</strong> is powered by an automated ETL pipeline (GitHub Actions). Each day it collects data from 
          <em>GitHub Trending</em>, <em>Product Hunt</em>, major tech RSS feeds, and prediction markets (e.g., Manifold). The pipeline combines standard data processing 
          with LLM-powered analysis—summarizing articles, extracting key themes, and mapping them into categories—before turning everything into clean, ready-to-chart datasets. 
          The result is a daily snapshot of emerging technologies, popular tools, and industry shifts, presented through interactive visualizations.
        </p>


      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-3 text-gray-800">Intelligent Search & Multi-Agent Synthesis</h2>
        <p className="text-lg text-gray-700 leading-relaxed">
          At its core, Hey Signal employs a sophisticated <strong className="font-semibold">multi-agent AI system</strong> orchestrated by a FastAPI backend. This system dynamically adapts its workflow based on user input and preferences (focus, depth, tone), leveraging advanced prompt engineering to guide each agent's task. The process unfolds through a series of specialized agents:
          <ul className="list-disc list-inside ml-4 mt-2">
            <li><strong className="font-semibold">Search Agent:</strong> Refines the initial user query and executes targeted searches to gather relevant articles.</li>
            <li><strong className="font-semibold">Source Profiler Agent:</strong> Evaluates and scores retrieved sources based on criteria like relevance, diversity, and depth, aligning with the user's specified focus.</li>
            <li><strong className="font-semibold">Diversity Selector Agent:</strong> Selects a balanced and diverse subset of articles from the profiled sources, ensuring comprehensive coverage based on the desired depth.</li>
            <li><strong className="font-semibold">Debate Synthesizer Agent:</strong> Reads the selected articles and constructs a coherent narrative, synthesizing different perspectives into a structured report.</li>
            <li><strong className="font-semibold">Creative Editor Agent:</strong> Applies a final layer of refinement, adjusting the report's tone and style (e.g., "Grandma Mode," "News with attitude," "Gen Z Mode") to match user preferences.</li>
          </ul>
          This sequential, yet adaptive, workflow ensures a highly customized, nuanced, and accurate news summary.
        </p>
      </div>

      <p className="text-lg text-gray-700 leading-relaxed mb-6">
        Infrastructure is simple and reproducible: frontend on Vercel, backend on Render, CI/CD via GitHub Actions; modular code with logging and version control.
      </p>

      <hr className="border-t border-gray-200 my-8" />

      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-3 text-gray-800">Explore the Code:</h2>
        <ul className="list-disc list-inside ml-4 mt-2 text-lg text-gray-700 leading-relaxed">
          <li>Backend (multi-agent + FastAPI): <Link to="https://github.com/pouyan-sajadi/signal-news-backend" target="_blank" rel="noopener" className="text-blue-600 hover:underline">GitHub – Backend</Link></li>
          <li>Frontend (React/TypeScript): <Link to="https://github.com/pouyan-sajadi/signal-news-frontend" target="_blank" rel="noopener" className="text-blue-600 hover:underline">GitHub – Frontend</Link></li>
          <li>Daily Tech ETL: <Link to="https://github.com/pouyan-sajadi/tech_pulse_fetcher" target="_blank" rel="noopener" className="text-blue-600 hover:underline">GitHub – Tech ETL</Link></li>
        </ul>
      </div>

      <p className="text-lg text-gray-700 leading-relaxed">
        Built end-to-end by <Link to="https://www.linkedin.com/in/pouyan-sajadi/" target="_blank" rel="noopener" className="text-blue-600 hover:underline">Pouyan Sajadi</Link>.
        Feedback and contributions are welcome—open an issue or PR, or connect on LinkedIn.
      </p>
    </div>
  );
}
