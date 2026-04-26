# Serving A Nation — Agentic Healthcare Maps (Hackathon 2026)

Hack-Nation × World Bank Youth Summit Global AI Hackathon 2026 · **Challenge 03**  
“Serving A Nation — Building Agentic Healthcare Maps for 1.4 Billion Lives” · **Powered by Databricks**

This repository contains a **production-grade Next.js 14** application that **consumes** a Databricks notebook’s autonomous Agentic Healthcare Intelligence outputs (facilities, trust scores, medical deserts, and MLflow traces) and turns them into a transparent, map-first experience for discovery, verification, and social impact.

## Core promise (non-negotiable)

- **Backend notebook is a black box**: this frontend **never** re-implements extraction, validation, scoring, vector search, or reasoning.
- **Frontend only displays what the agent returns**: trust scores and reasoning steps are treated as a fixed contract.
- **All Databricks calls are server-side** via Next.js Route Handlers under `app/api/*` so `DATABRICKS_TOKEN` never reaches the browser.

## Architecture (high-level)

```
User (Browser)
  |
  | 1) UI actions (filters, query, trace)
  v
Next.js App (App Router)
  |
  | 2) Calls ONLY /app/api/* routes (proxy / caching / error formatting)
  v
Next.js API Route Handlers  ---------------------------+
  |                                                   |
  | 3) Server-side Databricks REST calls              |
  v                                                   |
Databricks Workspace                                  |
  - Jobs API: run-now / runs-get / runs-get-output     |
  - SQL Warehouse API: statements                      |
  - MLflow API: runs/get                               |
  |
  v
Agentic Notebook Output (Facilities, Trust, Deserts, Traces)
```

## Tech stack

- **Next.js 14** (App Router) + TypeScript
- Tailwind CSS + Framer Motion
- Maps: `react-leaflet` + OpenStreetMap tiles + marker clustering
- Charts: Recharts (+ D3 available for advanced overlays)
- State: Zustand
- Validation: Zod

## Project structure (key)

```
app/
  page.tsx
  dashboard/page.tsx
  query/page.tsx
  analytics/page.tsx
  trace/[run_id]/page.tsx
  api/...
components/
  dashboard/...
  map/...
  agent/...
  analytics/...
  ui/...
lib/
  types.ts
  mock-data.ts
  databricks.ts
  utils.ts
  store.ts
hooks/
  useAgentQuery.ts
  useFacilities.ts
  useMapState.ts
```

## Prerequisites

- Node.js **18+** (works on Node 20+)
- A Databricks workspace (including Free Edition where supported)
- A Databricks **Personal Access Token**
- A Databricks **Job ID** pointing to your autonomous notebook
- A Databricks **SQL Warehouse ID**

## Setup (local)

1. Install dependencies

```bash
npm install
```

2. Create `.env.local`

- Copy `.env.example` → `.env.local`
- Fill in the Databricks values

3. Run dev server

```bash
npm run dev
```

Open `http://localhost:3000`.

## Connecting your Databricks notebook

### Find `DATABRICKS_HOST`

- Your workspace URL, for example: `https://<workspace>.azuredatabricks.net`

### Create `DATABRICKS_TOKEN`

- In Databricks: **User Settings → Access tokens → Generate new token**

### Find `DATABRICKS_JOB_ID`

- Jobs UI → open the Job that runs the notebook → copy the numeric Job ID.

### Find `DATABRICKS_WAREHOUSE_ID`

- SQL → Warehouses → open your warehouse → copy the Warehouse ID.

## How the notebook output maps to TypeScript

All data contracts live in `lib/types.ts`:

- `Facility`: the canonical facility object displayed on the map and panels
- `TrustScore`: breakdown + red flags (display-only)
- `ReasoningStep` + `MLflowTrace`: shown in `/trace/[run_id]` timeline
- `Desert`: medical desert overlays and analytics

The frontend:

- **Never recalculates** `trust_score` or `trust_label`
- **Never invents** reasoning steps
- **Only renders** the agent’s returned fields

## Mock mode (UI development without Databricks)

Set:

```
IS_MOCK_MODE=true
```

This activates realistic synthetic outputs in `lib/mock-data.ts`:

- 50 facilities across 10 states
- mixed trust labels + red flags
- 10 desert zones
- 3 reasoning traces
- summary KPIs

Mock mode is intended for **local UI development only**.

## Deployment (Vercel)

1. Push this repo to GitHub
2. Create a Vercel project
3. Add the same env vars from `.env.example` in Vercel Project Settings
4. Deploy

Security note: Databricks token remains server-side because all external calls go through `app/api/*`.

## Judging criteria alignment

- **Discovery & Verification (35%)**
  - Map-first facility discovery + trust badges + contradiction flags
  - Evidence/trace viewer for auditability (MLflow-derived)
- **IDP Innovation (30%)**
  - Transparent agent-run orchestration through Job API
  - Reasoning timeline UX that makes multi-agent steps legible
- **Social Impact & Utility (25%)**
  - Medical desert overlays highlight capability gaps and risk
  - Analytics dashboard supports policy-level prioritization
- **UX & Transparency (10%)**
  - Reduced-motion support, focus rings, icon+color trust encoding
  - Fast loading via caching headers + skeletons + map clustering

## Notes

- This repo intentionally avoids any client-side LLM calls.
- The Databricks notebook is treated as the single AI “brain.”

