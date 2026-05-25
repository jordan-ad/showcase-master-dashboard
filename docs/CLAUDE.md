# Claude Context — Showcase Master Dashboard

> Load this file at the start of a new session to get full project context.
> Last updated: 2026-05-25

---

## What this project is

Internal dashboard for AD Group's **Showcase** product, deployed at `dashboard.showcase.space`. Four teams use it — Tech Ops, Asset, Product, Sales — but the nav is organised by feature area, not team. The goal is to centralise NUC fleet monitoring, incident tracking, project lifecycle management, asset update ticketing, and product roadmap in one internal tool.

**AD Group context:**
- Showcase = digital display suite platform (show.space)
- A&D = Apartments & Developments listings portal (a-d.com.au)
- Development ID = inventory management platform (developmentid.com.au)

---

## Running locally

```bash
cd frontend
npm run dev        # Next.js dev server on port 3000
```

Backend is written but not yet connected to a live DB — all data is mock/in-memory. See `backend/` when wiring up.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, TypeScript, Tailwind CSS, App Router |
| Backend | Express + TypeScript (written, not yet live) |
| Database | PostgreSQL / AWS RDS — schema written at `backend/src/db/schema.sql`, not connected |
| Auth | AWS Cognito + SSO planned — `devAuth` middleware bypass active for dev |
| Storage | AWS S3 planned for screenshots and files |
| Dev server config | `.claude/launch.json` at repo root — `npm run dev --prefix frontend` on port 3000 |

---

## Directory structure

```
showcase-master-dashboard/
├── frontend/
│   ├── app/
│   │   ├── layout.tsx          ← "Showcase Dashboard — AD Group" title, slate-50 bg
│   │   └── page.tsx            ← 5-tab router
│   ├── components/
│   │   ├── layout/
│   │   │   └── TopNav.tsx      ← 5-tab nav (Projects, Operations, Asset, Product, Sales)
│   │   ├── ui/
│   │   │   ├── Badge.tsx       ← variant-based badge for all status/severity types
│   │   │   └── Modal.tsx       ← size-configurable modal (sm/md/lg/xl), ESC + backdrop
│   │   ├── techops/
│   │   │   ├── ProjectList.tsx       ← Projects tab (main)
│   │   │   ├── NucFleet.tsx          ← NUC fleet grid (used inside ProjectList or standalone)
│   │   │   └── IncidentLog.tsx       ← Legacy incident log (not currently used in nav)
│   │   ├── operations/
│   │   │   ├── OperationsTab.tsx     ← Sub-tab switcher: NUC Monitor | Incidents
│   │   │   ├── IncidentsTab.tsx      ← Native incidents table UI
│   │   │   └── incidents-data.ts     ← Types + 10 dummy incidents (mirrors live Google Sheet)
│   │   ├── asset/
│   │   │   ├── AssetTab.tsx          ← State owner, sub-tab switcher: Board | All Updates
│   │   │   ├── AssetBoard.tsx        ← 5-column Kanban board
│   │   │   ├── ProjectDetailModal.tsx ← Project detail with sub-tickets + raise form
│   │   │   ├── AllUpdatesView.tsx    ← Flat filterable table of all sub-tickets
│   │   │   └── asset-constants.ts   ← BALI_TEAM, STAGES, STAGE_LABELS, STAGE_COLUMN_STYLE
│   │   ├── product/
│   │   │   └── ProductTab.tsx        ← Stub
│   │   └── sales/
│   │       └── SalesTab.tsx          ← Stub
│   ├── lib/
│   │   ├── mock-data.ts        ← All dummy data (NUCs, incidents, projects, asset board)
│   │   └── api.ts              ← axios instance with Bearer token interceptor
│   ├── types/
│   │   └── index.ts            ← All TypeScript types + LIFECYCLE_STAGES + getLifecyclePhase()
│   └── public/
│       └── nuc-monitor.html    ← Existing NUC Monitor v1.9 (standalone HTML, embedded as iframe)
├── backend/
│   └── src/
│       ├── db/schema.sql       ← Full PostgreSQL schema (not yet connected to live DB)
│       ├── db/index.ts         ← pg Pool with query<T>() helpers
│       ├── middleware/auth.ts  ← JWT authenticate + devAuth mock user
│       └── routes/             ← nucs, incidents, projects, assets, features (all mock/DB)
└── docs/
    ├── CLAUDE.md               ← This file
    ├── features.md             ← Per-tab feature documentation
    └── architecture.md        ← Detailed architecture notes
```

---

## Nav structure — what's built vs stubbed

### 1. Projects tab ✅ Built
- Searchable/filterable project list with lifecycle stages 1–15
- Pipeline visualiser (Pre Sign Off → In Progress → Live → End of Life)
- Click row → full detail modal with tabs: Overview, Checklist, Incidents, Files, Activity
- 7 mock projects in `frontend/lib/mock-data.ts`

### 2. Operations tab ✅ Built
**Sub-tab: NUC Monitor**
- Existing `dashboard.html` (NUC Monitor v1.9) embedded as iframe at `/public/nuc-monitor.html`
- Reads live from Google Drive API — 176 real display suites — no rebuild needed

**Sub-tab: Incidents**
- Full incidents dashboard: 4 stat cards, search + 4 filters, expandable table rows
- Data shape mirrors the live Google Sheet (`Showcase Incident Report.xlsx`)
- Currently on 10 dummy incidents in `incidents-data.ts`
- **Next step:** Wire to `GET /api/incidents/sheets` via Google service account
  - Sheet is AD Group restricted (not public)
  - Need: GCP project, Sheets API enabled, service account, sheet shared with SA email, Sheet ID + key in `.env`

### 3. Asset tab ✅ Built
**Sub-tab: Board**
- 5-column Kanban: Showcase Build → Updates Needed → Awaiting Review → Live → Archived
- Project cards pulled from master project list (currently mock data)
- Click card → detail modal with sub-tickets, stage move buttons
- Sub-ticket flow: Open → In Progress → Done (click status pill to advance)
- "Raise Update" form: title, description, priority, assignee, deadline, asset link
- Bali team members: Jordan, Ayu, Ary, Billy, Dimas, Gusti, Yoga, Andini, Georgie

**Sub-tab: All Updates**
- Flat table of every sub-ticket across all projects
- Filter by status, priority, assignee

**Data model:**
- `AssetBoardItem` — project card on the board (id, project_id, project_name, state, stage, tags)
- `UpdateTicket` — sub-ticket within a project (id, asset_item_id, title, priority, status, assignee_name, deadline, asset_link)
- State held in `AssetTab.tsx` useState — swap `mockAssetBoardItems`/`mockUpdateTickets` for API calls when DB is ready
- **Next step:** Wire board projects from the master Projects API rather than separate mock data

### 4. Product tab 🔲 Stub
- Planned: Feature Requests (Jira sync), Roadmap, Releases, Wiki (Confluence)

### 5. Sales tab 🔲 Stub
- Planned: My Clients, Incidents, Features, Roadmap

---

## Key data models

### Project lifecycle stages
Stages 1–15 defined in `frontend/types/index.ts` → `LIFECYCLE_STAGES`:
- 1–3: Pre Sign Off (Sales, Build Analysis & Quoting, Sign Off)
- 4–10: In Progress (Asset Acquisition → Installation → Training)
- 11–14: Live (Go Live, Support, Quarterly Visits, Updates)
- 15: End of Life

### Incident shape (mirrors Google Sheet)
```typescript
interface Incident {
  ir_id: number; date: string; issue: string; assignee: string;
  severity: 'Low' | 'Medium' | 'High'; project: string;
  developer: string; project_marketer: string; state: 'NSW' | 'VIC' | 'QLD';
  category: string; process_and_fix: string; notes: string;
  contact: string; status: 'Resolved' | 'In Progress' | 'Unresolved';
}
```

### Asset board pipeline
```typescript
type AssetBoardStage = 'showcase_build' | 'updates_needed' | 'awaiting_review' | 'live' | 'archived';
type UpdateTicketStatus = 'open' | 'in_progress' | 'done';
```

---

## NUC monitoring system (background)

- Each NUC runs a .NET 4 exe that takes a screenshot every 30 min (8:30am–5pm)
- Screenshot POSTed as base64 to a Google Apps Script webhook → stored in Google Drive
- `backend/src/routes/nucs.ts` has the `/api/nucs/webhook` endpoint for this
- The existing `nuc-monitor.html` reads directly from Google Drive API (Google service account)
- 176 real display suites across NSW, VIC, QLD

---

## What's pending / next priorities

1. **Incidents → Google Sheets live data** — highest priority, backend route written, needs service account wiring
2. **Asset board → pull projects from master Projects API** — currently separate mock data
3. **Product tab** — Feature Requests, Roadmap, Releases, Wiki
4. **Sales tab** — My Clients, Incidents, Features, Roadmap
5. **Backend + DB** — connect Express to AWS RDS (schema written at `backend/src/db/schema.sql`)
6. **Auth** — replace `devAuth` bypass with AWS Cognito + SSO
7. **S3** — wire screenshot uploads in NUC webhook handler

---

## Mock data location

Everything is in `frontend/lib/mock-data.ts`:
- `mockNucs` (8 NUCs), `mockProjects` (7 projects), `mockIncidents` (5 incidents)
- `mockAssetBoardItems` (7 board items), `mockUpdateTickets` (9 tickets)
- `BALI_TEAM` array (9 team members)
- `mockProjectDetail` (fully hydrated project for The Daintree Residences)
