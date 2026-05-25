# Setting Up on a New Computer

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- [Git](https://git-scm.com/)
- Access to the AD Group GitHub organisation

---

## 1. Clone the repo

```bash
git clone https://github.com/jordan-ad/showcase-master-dashboard.git
cd showcase-master-dashboard
```

---

## 2. Install frontend dependencies

```bash
cd frontend
npm install
```

---

## 3. Configure the NUC Monitor

The NUC Monitor needs a Google API key to read screenshots from Google Drive. This key is **never stored in the repo** — you create the config file manually.

```bash
# From the repo root:
cp frontend/public/nuc-config.example.js frontend/public/nuc-config.js
```

Then open `frontend/public/nuc-config.js` and fill in the real values:

```js
window.NUC_CONFIG = {
  API_KEY:           'your-google-api-key',
  FOLDER_ID:         'your-google-drive-folder-id',
  NOTIFICATIONS_URL: 'your-google-apps-script-url',
};
```

> Get these values from the AD Group 1Password vault or ask Jordan.  
> `nuc-config.js` is gitignored — it will never be committed.

---

## 4. Start the dev server

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 5. (Optional) Run the backend

The backend is written but not yet connected to a live database. You only need it if you're working on the API layer.

```bash
cd backend
npm install
cp .env.example .env   # fill in DB credentials, AWS keys, etc.
npm run dev            # starts on port 4000
```

Environment variables needed in `.env`:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (AWS RDS) |
| `JWT_SECRET` | Secret for signing JWTs |
| `AWS_ACCESS_KEY_ID` | AWS credentials |
| `AWS_SECRET_ACCESS_KEY` | AWS credentials |
| `AWS_REGION` | e.g. `ap-southeast-2` |
| `S3_BUCKET` | S3 bucket name for screenshots/files |
| `COGNITO_USER_POOL_ID` | AWS Cognito user pool |
| `COGNITO_CLIENT_ID` | AWS Cognito app client |
| `GOOGLE_SHEETS_SHEET_ID` | The Incidents Google Sheet ID |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | Service account JSON key (base64 encoded) |

---

## Picking up where development left off

Read [`docs/CLAUDE.md`](CLAUDE.md) — it has the full project context, what's built, what's stubbed, and what's next. When starting a new Claude Code session:

```
Read docs/CLAUDE.md and pick up where we left off.
```
