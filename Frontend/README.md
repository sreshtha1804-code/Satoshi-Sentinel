# Satoshi Sentinel — Phase 1: Foundation + UI

"Know what you're signing. Know who you're trusting."

Satoshi Sentinel is an AI-powered Bitcoin + Nostr privacy and scam-defense
platform. This phase delivers the project foundation and a complete,
premium frontend UI. **No backend, no real analysis, no wallet or key
handling is implemented yet.**

## What's here

- React 18 + Vite + JavaScript, plain CSS (design tokens + component CSS,
  no UI framework)
- `lucide-react` for icons, `react-router-dom` for routing
- Six pages, fully routed and responsive:
  - `/` — Dashboard
  - `/analyze` — Analyze (intelligence console)
  - `/analysis/:id` — Analysis result (placeholder layout, ready for API data)
  - `/sign-check` — Explain Before You Sign
  - `/history` — History (mock records, clearly labeled)
  - `/privacy` — Privacy & Settings

## Project structure

```
src/
├── components/
│   ├── layout/     Sidebar, TopBar
│   ├── ui/         RiskBadge, ScoreDial, EmptyPlaceholder
│   └── analysis/   InputTypeTabs, AnalysisInputPanel, RecentAnalyses
├── pages/          Dashboard, Analyze, AnalysisResult, ExplainBeforeSign, History, Privacy
├── services/        api.js — stubbed client for the future FastAPI backend
├── hooks/           useAnalysis.js — stubbed hook, not wired to any page yet
├── utils/           constants.js — shared input-type / risk-level helpers
├── data/            mockHistory.js — explicitly-labeled temporary mock data
└── styles/          tokens.css (design system), global.css (layout utilities)
```

## Design system

- Near-black surfaces (`--bg-base`, `--bg-panel`) with a graphite panel scale
- Bitcoin-orange accent (`--accent-orange`) used deliberately, not everywhere
- Muted green / amber / red-orange for safe / caution / danger states
- `Sora` for headings, `Inter` for body text, `JetBrains Mono` for addresses,
  scores, and other technical values
- Small, deliberate corner radii — not the rounded SaaS-card look
- Motion limited to hover/focus states and one score-dial reveal transition

## Running it

This container has no network access, so dependencies could not be
installed or the dev server test-run here. On a machine with npm access:

```bash
cd satoshi-sentinel
npm install
npm run dev
```

Then open the printed local URL (default `http://localhost:5173`).

To build for production:

```bash
npm run build
npm run preview
```

## What's intentionally NOT implemented (future phases)

- Real Bitcoin address / mempool lookups
- Nostr relay connections
- AI/model API calls
- A database or persistence layer
- Authentication
- Wallet connection or transaction signing

The `services/api.js` client and `hooks/useAnalysis.js` hook exist as
stable integration points for that backend work — both currently throw
a clear "not implemented" error rather than faking a response.
