export type Team = 'tech_ops' | 'asset' | 'product' | 'sales';
export type AssetBoardStage = 'showcase_build' | 'updates_needed' | 'awaiting_review' | 'live' | 'archived';
export type UpdateTicketStatus = 'open' | 'in_progress' | 'done';
export type NucStatus = 'healthy' | 'stale' | 'offline';
export type IncidentPriority = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'urgent' | 'standard' | 'no_rush';
export type TicketStatus = 'raised' | 'in_progress' | 'awaiting_review' | 'done';
export type FeatureStatus = 'under_review' | 'accepted' | 'declined' | 'in_progress' | 'shipped';
export type ContractStatus = 'pending' | 'signed' | 'active' | 'expired' | 'terminated';
export type PaymentStatus = 'pending' | 'invoiced' | 'paid' | 'overdue';
export type AustralianState = 'NSW' | 'VIC' | 'QLD' | 'SA' | 'WA' | 'TAS' | 'NT' | 'ACT';

export interface User {
  id: string;
  name: string;
  email: string;
  team: Team;
  avatar_url?: string;
  created_at: string;
}

export interface Nuc {
  id: string;
  nuc_id: string;
  project_id?: string;
  project_name?: string;
  client_name?: string;
  state?: AustralianState;
  status: NucStatus;
  last_screenshot_url?: string;
  last_seen_at?: string;
  created_at: string;
}

export interface NucDetail extends Nuc {
  screenshots: NucScreenshot[];
}

export interface NucScreenshot {
  id: string;
  nuc_id: string;
  screenshot_url: string;
  captured_at: string;
}

export interface NucSummary {
  healthy: number;
  stale: number;
  offline: number;
}

export interface Incident {
  id: string;
  title: string;
  description?: string;
  project_id?: string;
  project_name?: string;
  nuc_id?: string;
  nuc_identifier?: string;
  priority: IncidentPriority;
  status: IncidentStatus;
  created_by?: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface IncidentComment {
  id: string;
  incident_id: string;
  body: string;
  author_id?: string;
  author_name?: string;
  author_avatar?: string;
  created_at: string;
}

export interface IncidentDetail extends Incident {
  comments: IncidentComment[];
}

export interface OnboardingItem {
  id: string;
  project_id: string;
  item_number: number;
  label: string;
  completed: boolean;
  completed_by?: string;
  completed_at?: string;
}

export interface Project {
  id: string;
  name: string;
  client_name: string;
  state: AustralianState;
  lifecycle_stage: number;
  stage_owner_primary?: string;
  stage_owner_secondary?: string;
  next_action?: string;
  contract_status?: ContractStatus;
  payment_status?: PaymentStatus;
  contract_file_url?: string;
  parallel_buyers_portal: boolean;
  parallel_analytics_dashboard: boolean;
  parallel_showcase_builder: boolean;
  parallel_showcase_space: boolean;
  parallel_creative_services: boolean;
  created_by?: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
  archived_at?: string;
  // Aggregates
  nuc_count?: number;
  open_incidents?: number;
}

export interface ProjectDetail extends Project {
  nucs: Nuc[];
  checklist: OnboardingItem[];
  incidents: Incident[];
  tickets: AssetTicket[];
  features: FeatureRequest[];
  files: FileRecord[];
  activity: ActivityEntry[];
}

export interface AssetTicket {
  id: string;
  title: string;
  description?: string;
  project_id?: string;
  project_name?: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignee_id?: string;
  assignee_name?: string;
  asset_link?: string;
  deadline?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface FeatureRequest {
  id: string;
  title: string;
  description?: string;
  project_id?: string;
  project_name?: string;
  submitted_by?: string;
  submitted_by_name?: string;
  jira_issue_id?: string;
  status: FeatureStatus;
  created_at: string;
  updated_at: string;
}

export interface FileRecord {
  id: string;
  entity_type: string;
  entity_id: string;
  file_name: string;
  file_url: string;
  uploaded_by?: string;
  created_at: string;
}

export interface ActivityEntry {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  detail?: Record<string, unknown>;
  actor_id?: string;
  actor_name?: string;
  created_at: string;
}

export const LIFECYCLE_STAGES: { stage: number; label: string; phase: string }[] = [
  { stage: 1,  label: 'Sales',                        phase: 'Pre Sign Off' },
  { stage: 2,  label: 'Build Analysis & Quoting',     phase: 'Pre Sign Off' },
  { stage: 3,  label: 'Sign Off',                     phase: 'Pre Sign Off' },
  { stage: 4,  label: 'Asset Acquisition',            phase: 'In Progress' },
  { stage: 5,  label: 'Project Build',                phase: 'In Progress' },
  { stage: 6,  label: 'Installation Planning',        phase: 'In Progress' },
  { stage: 7,  label: 'Hardware Procurement',         phase: 'In Progress' },
  { stage: 8,  label: 'Hardware Setup',               phase: 'In Progress' },
  { stage: 9,  label: 'Installation',                 phase: 'In Progress' },
  { stage: 10, label: 'Training',                     phase: 'In Progress' },
  { stage: 11, label: 'Go Live',                      phase: 'Live' },
  { stage: 12, label: 'Support',                      phase: 'Live' },
  { stage: 13, label: 'Quarterly Visits',             phase: 'Live' },
  { stage: 14, label: 'Updates',                      phase: 'Live' },
  { stage: 15, label: 'End of Life',                  phase: 'End of Life' },
];

export function getLifecyclePhase(stage: number): string {
  return LIFECYCLE_STAGES.find(s => s.stage === stage)?.phase ?? 'Unknown';
}

export interface AssetBoardItem {
  id: string;
  project_id: string;
  project_name: string;
  state: AustralianState;
  stage: AssetBoardStage;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface UpdateTicket {
  id: string;
  asset_item_id: string;
  project_id: string;
  title: string;
  description?: string;
  priority: TicketPriority;
  status: UpdateTicketStatus;
  assignee_name?: string;
  deadline?: string;
  asset_link?: string;
  raised_by: string;
  created_at: string;
  updated_at: string;
}
