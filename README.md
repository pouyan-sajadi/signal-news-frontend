# HeySignal

HeySignal is a daily briefing on the business of tech with an interactive dashboard and on-demand research reports. The frontend uses React, TypeScript, Vite, React Router, and Tailwind CSS. It connects to a FastAPI backend and uses Supabase for authentication.

[Open HeySignal](https://www.heysignal.app/)

## Today’s story

The home page opens with a short introduction and a daily market deep dive when one is available. **The story** gives the sequence of events, **Who’s affected** explains the business impact, and **What to watch** covers the next 12 months, the next two to three years, and a development that could change the outlook.

The [market story component](client/src/components/dashboard/MarketDeepDiveCard.tsx) turns source IDs into numbered links beside the claims they support. The [brief schema](client/src/types/marketDeepDive.ts) validates the optional story and cleans up citation markers in older snapshots. The dashboard remains available when a story is missing or invalid.

## Tech dashboard

| Panel | What you can explore |
| --- | --- |
| GitHub Trending | A donut showing the language breakdown of trending repositories or stars earned today. Select a slice or its legend entry to see repository links and short descriptions. |
| Product Hunt | A treemap sized by the number of products in each category. Select a category to see launch links and short descriptions. A product can appear in two categories. |
| Prediction markets | Manifold Yes probabilities plotted against trading volume. Category filters update the volume breakdown, market ranks, and shortcuts to the highest volume market and the market closest to 50%. The plot keeps the same scale while you filter. |
| Headlines and topics | Expand headlines to read summaries and open the original reporting. Topic bars show editorial prominence scores out of 100. |

The [Tech Pulse fetcher](https://github.com/pouyan-sajadi/tech_pulse_fetcher) produces the daily snapshot. Production builds load it from `GET /api/tech-pulse/latest`. The [dashboard adapter](client/src/api/dashboard.ts) validates each feed and uses native JSON parsing for probability and volume. Report requests use the shared parser that preserves large IDs.

The Vite development server uses the [Nov 18, 2026 fixture](client/src/data/pulse-fixture-2026-11-18.json) and labels it as a preview. The build served by `npm run preview` uses the live endpoint configured at build time.

## Create a report

Enter a topic and optionally choose a focus, depth, and tone. The [report client](client/src/api/reports.ts) starts a job with `POST /process_news`, subscribes to progress at `/ws/status/:job_id`, and opens the finished report at `/report/:id`. The report page renders the result from Markdown and lets you copy the report link or export a PDF.

Signed-in users authenticate with Google through Supabase. The [history client](client/src/api/history.ts) saves their reports through the backend. Guests can generate reports and reopen them from history in the same browser session. Opening a copied link still requires access through the signed-in account or the original guest session.

## Run locally

Install Node.js and npm, then run these commands from the repository root.

```sh
cd client
npm install
```

Create `client/.env` with the following values. Use your Supabase project URL and its public anon key.

```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_BACKEND_URL=http://127.0.0.1:8000
```

`VITE_API_BASE_URL` is the base for relative requests such as the live dashboard endpoint. `VITE_BACKEND_URL` is used for report and history requests and the report progress WebSocket. Set both to your [backend](https://github.com/pouyan-sajadi/signal-news-backend) when running the full flow. The local dashboard fixture works without a running FastAPI server.

```sh
npm run dev
```

Open [localhost:5173](http://localhost:5173/). Run `npm run build` to write the production bundle to `client/dist`, then `npm run preview` to serve that bundle locally.

## Routes and deployment

| Route | Destination |
| --- | --- |
| `/` | Home and daily briefing |
| `/#market-story` | Today’s story |
| `/#dashboard-section` | Tech dashboard |
| `/#top-search-section` | Create a report |
| `/report/:id` | Report by job ID |
| `/about`, `/privacy-policy`, `/terms-of-service` | Site information and policies |

Vercel deploys the frontend from `main`. [Vercel rewrites](client/vercel.json) let React Router handle direct links. The [blue H SVG](client/public/favicon.svg) is shared by the header and the browser tab.
