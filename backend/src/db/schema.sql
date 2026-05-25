-- Showcase Dashboard — PostgreSQL Schema
-- Run against AWS RDS instance

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────
-- Users
-- ─────────────────────────────────────────
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  team        TEXT NOT NULL CHECK (team IN ('tech_ops', 'asset', 'product', 'sales')),
  cognito_sub TEXT UNIQUE,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- Projects
-- ─────────────────────────────────────────
CREATE TABLE projects (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                    TEXT NOT NULL,
  client_name             TEXT NOT NULL,
  state                   TEXT NOT NULL CHECK (state IN ('NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT')),
  lifecycle_stage         INTEGER NOT NULL DEFAULT 1 CHECK (lifecycle_stage BETWEEN 1 AND 15),
  stage_owner_primary     TEXT,
  stage_owner_secondary   TEXT,
  next_action             TEXT,
  contract_status         TEXT CHECK (contract_status IN ('pending', 'signed', 'active', 'expired', 'terminated')),
  payment_status          TEXT CHECK (payment_status IN ('pending', 'invoiced', 'paid', 'overdue')),
  contract_file_url       TEXT,
  -- Active Showcase Parallels (booleans)
  parallel_buyers_portal          BOOLEAN NOT NULL DEFAULT FALSE,
  parallel_analytics_dashboard    BOOLEAN NOT NULL DEFAULT FALSE,
  parallel_showcase_builder       BOOLEAN NOT NULL DEFAULT FALSE,
  parallel_showcase_space         BOOLEAN NOT NULL DEFAULT FALSE,
  parallel_creative_services      BOOLEAN NOT NULL DEFAULT FALSE,
  created_by   UUID REFERENCES users(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at  TIMESTAMPTZ
);

-- ─────────────────────────────────────────
-- NUCs
-- ─────────────────────────────────────────
CREATE TABLE nucs (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nuc_id               TEXT UNIQUE NOT NULL,
  project_id           UUID REFERENCES projects(id),
  state                TEXT CHECK (state IN ('NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT')),
  status               TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('healthy', 'stale', 'offline')),
  last_screenshot_url  TEXT,
  last_seen_at         TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- NUC Screenshot History
-- ─────────────────────────────────────────
CREATE TABLE nuc_screenshots (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nuc_id       UUID NOT NULL REFERENCES nucs(id) ON DELETE CASCADE,
  screenshot_url TEXT NOT NULL,
  captured_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_nuc_screenshots_nuc_id ON nuc_screenshots(nuc_id);
CREATE INDEX idx_nuc_screenshots_captured_at ON nuc_screenshots(captured_at DESC);

-- ─────────────────────────────────────────
-- Incidents
-- ─────────────────────────────────────────
CREATE TABLE incidents (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title        TEXT NOT NULL,
  description  TEXT,
  project_id   UUID REFERENCES projects(id),
  nuc_id       UUID REFERENCES nucs(id),
  priority     TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status       TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  created_by   UUID REFERENCES users(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at  TIMESTAMPTZ
);

CREATE TABLE incident_comments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  body        TEXT NOT NULL,
  author_id   UUID REFERENCES users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- Asset Tickets
-- ─────────────────────────────────────────
CREATE TABLE asset_tickets (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title        TEXT NOT NULL,
  description  TEXT,
  project_id   UUID REFERENCES projects(id),
  priority     TEXT NOT NULL DEFAULT 'standard' CHECK (priority IN ('urgent', 'standard', 'no_rush')),
  status       TEXT NOT NULL DEFAULT 'raised' CHECK (status IN ('raised', 'in_progress', 'awaiting_review', 'done')),
  assignee_id  UUID REFERENCES users(id),
  asset_link   TEXT,
  deadline     DATE,
  created_by   UUID REFERENCES users(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- Onboarding Checklist
-- ─────────────────────────────────────────
CREATE TABLE onboarding_checklist (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id     UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  item_number    INTEGER NOT NULL CHECK (item_number BETWEEN 1 AND 9),
  label          TEXT NOT NULL,
  completed      BOOLEAN NOT NULL DEFAULT FALSE,
  completed_by   UUID REFERENCES users(id),
  completed_at   TIMESTAMPTZ,
  UNIQUE(project_id, item_number)
);

-- ─────────────────────────────────────────
-- Feature Requests
-- ─────────────────────────────────────────
CREATE TABLE feature_requests (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         TEXT NOT NULL,
  description   TEXT,
  project_id    UUID REFERENCES projects(id),
  submitted_by  UUID REFERENCES users(id),
  jira_issue_id TEXT,
  status        TEXT NOT NULL DEFAULT 'under_review' CHECK (status IN ('under_review', 'accepted', 'declined', 'in_progress', 'shipped')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- Files (polymorphic)
-- ─────────────────────────────────────────
CREATE TABLE files (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type  TEXT NOT NULL CHECK (entity_type IN ('project', 'incident', 'ticket', 'feature_request')),
  entity_id    UUID NOT NULL,
  file_name    TEXT NOT NULL,
  file_url     TEXT NOT NULL,
  uploaded_by  UUID REFERENCES users(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_files_entity ON files(entity_type, entity_id);

-- ─────────────────────────────────────────
-- Activity Log
-- ─────────────────────────────────────────
CREATE TABLE activity_log (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type  TEXT NOT NULL,
  entity_id    UUID NOT NULL,
  action       TEXT NOT NULL,
  detail       JSONB,
  actor_id     UUID REFERENCES users(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_log_entity ON activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at DESC);

-- ─────────────────────────────────────────
-- updated_at trigger
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_projects_updated_at   BEFORE UPDATE ON projects   FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_incidents_updated_at  BEFORE UPDATE ON incidents  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_tickets_updated_at    BEFORE UPDATE ON asset_tickets FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_features_updated_at   BEFORE UPDATE ON feature_requests FOR EACH ROW EXECUTE FUNCTION set_updated_at();
