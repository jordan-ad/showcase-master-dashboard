# Feature Documentation

## Projects tab

The master list of all Showcase projects across AD Group.

**List view**
- Search by project name or client
- Filter by state (NSW/VIC/QLD/etc.), lifecycle phase, contract status
- Each row: project name, client, state badge, lifecycle stage pill, open incidents count
- Pipeline visualiser at top showing breakdown across phases

**Project detail modal** (click any row)
- **Overview tab:** lifecycle stage tracker, stage owners, parallel products enabled, contract + payment status
- **Checklist tab:** 9-item onboarding checklist (Contract signed → Go-live confirmed)
- **Incidents tab:** open incidents linked to this project
- **Files tab:** uploaded documents (contract, brief, etc.)
- **Activity tab:** audit log of changes

**Lifecycle stages (1–15):**

| # | Stage | Phase |
|---|---|---|
| 1 | Sales | Pre Sign Off |
| 2 | Build Analysis & Quoting | Pre Sign Off |
| 3 | Sign Off | Pre Sign Off |
| 4 | Asset Acquisition | In Progress |
| 5 | Project Build | In Progress |
| 6 | Installation Planning | In Progress |
| 7 | Hardware Procurement | In Progress |
| 8 | Hardware Setup | In Progress |
| 9 | Installation | In Progress |
| 10 | Training | In Progress |
| 11 | Go Live | Live |
| 12 | Support | Live |
| 13 | Quarterly Visits | Live |
| 14 | Updates | Live |
| 15 | End of Life | End of Life |

---

## Operations tab

### NUC Monitor sub-tab
The existing NUC Monitor v1.9 dashboard embedded as an iframe. Built separately as a standalone HTML file (`frontend/public/nuc-monitor.html`) — reads live from Google Drive API, covers 176 real display suites across Australia.

No rebuild needed — any NUC Monitor changes should be made in that HTML file directly.

### Incidents sub-tab
Native incidents dashboard mirroring the live Google Sheets incident report format.

**Columns:** IR #, Date, Issue, Project, State, Category, Severity, Status, Assignee

**Expandable rows show:** Process & Fix, Notes, Developer, Project Marketer, Contact

**Stats bar:** Total, Open/In Progress count, High·Medium count, Top Category

**Filters:** State, Severity, Status, Category + free text search

**Data source:** Currently 10 dummy incidents in `frontend/components/operations/incidents-data.ts`.

**To wire to live Google Sheet:**
1. Create GCP project, enable Google Sheets API
2. Create service account, download JSON key
3. Share the `Showcase Incident Report` sheet with the service account email
4. Add `GOOGLE_SHEETS_SHEET_ID` and `GOOGLE_SERVICE_ACCOUNT_KEY` to `.env`
5. The backend route `GET /api/incidents/sheets` is already written in `backend/src/routes/incidents.ts`
6. Swap `MOCK_INCIDENTS` in `IncidentsTab.tsx` for an API call to that route

Write support (add new incidents) to be added later.

**Incident categories:**
Hardware/Display, Hardware/NUC, Hardware/Audio, Hardware/Remote, Chrome, Internet, Lighting, Showcase/Backend, Showcase/Assets, Showcase/Builder, On-Site Electrical, Miscellaneous, User Error

---

## Asset tab

Tracks Showcase projects through the asset pipeline and manages individual update requests.

### Board sub-tab

5-column Kanban. Each card is a Showcase project. The pipeline is linear left to right.

| Column | Meaning |
|---|---|
| Showcase Build | Initial build of the Showcase in progress |
| Updates Needed | Asset updates have been raised and are being actioned |
| Awaiting Review | All updates done, awaiting client/internal review |
| Live | Reviewed and live |
| Archived | End of life |

**Project card shows:** Project name, tags (state + asset type), count of open sub-tickets, last updated date.

**Project detail modal:**
- Current stage + move backward/forward buttons
- List of all sub-tickets for the project
- Each sub-ticket: status pill (click to advance Open → In Progress → Done), priority badge, assignee, deadline, asset link
- "Raise Update" button — form: title (required), description, priority, assignee, deadline, asset link
- Only project managers raise sub-tickets

**Bali team (assignees):** Jordan, Ayu, Ary, Billy, Dimas, Gusti, Yoga, Andini, Georgie

### All Updates sub-tab

Flat table of every sub-ticket across all projects. Filter by status, priority, assignee, free text search. Useful for seeing the full workload across the team.

**To wire to database:**
The three state handlers in `AssetTab.tsx` are the only swap points:
- `moveProject(itemId, stage)` → `PATCH /api/asset-board/:id`
- `raiseTicket(ticket)` → `POST /api/asset-tickets`
- `advanceTicket(ticketId, status)` → `PATCH /api/asset-tickets/:id`

---

## Product tab (stub)

Planned features:
- **Feature Requests** — linked to Jira (field: `jira_issue_id`)
- **Roadmap** — visual timeline of planned work
- **Releases** — changelog / release notes
- **Wiki** — linked to Confluence

---

## Sales tab (stub)

Planned features:
- **My Clients** — assigned project list with contract + payment status
- **Incidents** — incidents view filtered to Sales-relevant projects
- **Features** — feature requests submitted by Sales
- **Roadmap** — product roadmap from Sales perspective
