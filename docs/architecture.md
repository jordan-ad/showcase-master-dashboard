# Architecture

## Overview

Monorepo with a Next.js frontend and an Express backend. Database is AWS RDS (PostgreSQL). Currently the backend is written but not connected to a live database — all data is served from in-memory mock data in the frontend.

```
showcase-master-dashboard/
├── frontend/      Next.js 16 (TypeScript, Tailwind, App Router)
├── backend/       Express + TypeScript
└── docs/          This documentation
```

---

## Frontend

**Framework:** Next.js 16 with App Router, TypeScript, Tailwind CSS

**Key directories:**

```
frontend/
├── app/
│   ├── layout.tsx      Root layout — sets title and background
│   └── page.tsx        Tab router — renders the active tab component
├── components/
│   ├── layout/         TopNav
│   ├── ui/             Shared components (Badge, Modal)
│   ├── techops/        Projects tab components
│   ├── operations/     Operations tab (NUC Monitor iframe + Incidents)
│   ├── asset/          Asset tab (Kanban board + sub-tickets)
│   ├── product/        Product tab (stub)
│   └── sales/          Sales tab (stub)
├── lib/
│   ├── mock-data.ts    All dummy data — swap for API calls when backend is wired
│   └── api.ts          axios instance with Bearer token auth interceptor
├── types/
│   └── index.ts        All TypeScript interfaces and type aliases
└── public/
    └── nuc-monitor.html   Existing NUC Monitor v1.9 standalone dashboard
```

**Shared UI components:**

`Badge` — accepts a `variant` prop (healthy/stale/offline/open/in_progress/resolved/urgent/standard/etc.) with a `label` override. Never add inline status colour logic to components — extend the Badge instead.

`Modal` — sizes: sm/md/lg/xl. Closes on ESC and backdrop click. Use for all modal dialogs.

**State management:** Component-level `useState` only. No global state library. When the backend is connected, the top-level tab components (`AssetTab`, etc.) own state and pass handlers down.

---

## Backend

**Framework:** Express 4 + TypeScript

```
backend/src/
├── db/
│   ├── schema.sql      Full PostgreSQL schema
│   └── index.ts        pg Pool — query<T>() and queryOne<T>() helpers
├── middleware/
│   └── auth.ts         JWT authenticate + devAuth mock (bypass for dev)
├── routes/
│   ├── projects.ts     GET/POST /api/projects, checklist, archive
│   ├── nucs.ts         GET/POST /api/nucs, /api/nucs/webhook (Google Apps Script)
│   ├── incidents.ts    GET/POST/PATCH /api/incidents + comments
│   ├── assets.ts       GET/POST/PATCH /api/tickets
│   └── features.ts     GET/POST/PATCH /api/features
└── index.ts            App entry — CORS, auth middleware, route mounting
```

**Auth:** The `/api/nucs/webhook` endpoint is intentionally unauthenticated (receives POSTs from Google Apps Script on each NUC). All other routes require a valid JWT.

---

## Database schema highlights

Full schema: `backend/src/db/schema.sql`

Key tables:
- `projects` — master project list, lifecycle stage, contract/payment status, parallel products flags
- `nucs` — NUC devices, one per display suite, linked to a project
- `nuc_screenshots` — screenshot history (S3 URL, captured_at)
- `incidents` + `incident_comments` — incident log
- `asset_tickets` — asset update tickets
- `onboarding_checklist` — 9-item checklist per project
- `feature_requests` — product feature requests with optional Jira ID
- `files` — polymorphic file attachments (entity_type + entity_id)
- `activity_log` — audit trail for all entities

All tables use UUID primary keys. `updated_at` columns are maintained by DB triggers.

---

## Infrastructure (planned)

| Service | Purpose |
|---|---|
| AWS RDS (PostgreSQL) | Primary database |
| AWS S3 | NUC screenshots, uploaded files |
| AWS Cognito | Auth — user pool + SSO/SAML for AD Group staff |
| Vercel / AWS | Frontend hosting |
| Google Drive API | NUC screenshot storage (existing, via NUC Monitor) |
| Google Sheets API | Live incident data (service account, AD Group restricted) |

---

## Development setup

```bash
# Frontend only (sufficient for current state — backend not connected)
cd frontend
npm install
npm run dev        # http://localhost:3000

# Backend (when wiring up)
cd backend
npm install
cp .env.example .env   # fill in DB credentials etc.
npm run dev
```

**Environment variables needed (backend):**
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — for token signing
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET`
- `COGNITO_USER_POOL_ID`, `COGNITO_CLIENT_ID`
- `GOOGLE_SHEETS_SHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_KEY` — for Incidents live data
