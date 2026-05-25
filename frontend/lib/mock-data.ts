import type {
  Nuc, NucSummary, Incident, Project, AssetTicket,
  FeatureRequest, NucDetail, IncidentDetail, ProjectDetail,
  AssetBoardItem, UpdateTicket,
} from '../types';

// ─── NUCs ───────────────────────────────────────────────────────────────────

export const mockNucs: Nuc[] = [
  { id: 'nuc-1', nuc_id: 'NUC-SYD-001', project_id: 'proj-1', project_name: 'The Daintree Residences', client_name: 'Mirvac', state: 'NSW', status: 'healthy', last_screenshot_url: 'https://placehold.co/320x180/1a2744/white?text=NUC-SYD-001', last_seen_at: new Date(Date.now() - 8 * 60000).toISOString(), created_at: '2024-01-15T00:00:00Z' },
  { id: 'nuc-2', nuc_id: 'NUC-SYD-002', project_id: 'proj-2', project_name: 'Elmwood Park', client_name: 'Stockland', state: 'NSW', status: 'healthy', last_screenshot_url: 'https://placehold.co/320x180/1a2744/white?text=NUC-SYD-002', last_seen_at: new Date(Date.now() - 22 * 60000).toISOString(), created_at: '2024-02-01T00:00:00Z' },
  { id: 'nuc-3', nuc_id: 'NUC-MEL-001', project_id: 'proj-3', project_name: 'Skyhaus Tower', client_name: 'Central Equity', state: 'VIC', status: 'stale', last_screenshot_url: 'https://placehold.co/320x180/92400e/white?text=NUC-MEL-001', last_seen_at: new Date(Date.now() - 85 * 60000).toISOString(), created_at: '2024-01-20T00:00:00Z' },
  { id: 'nuc-4', nuc_id: 'NUC-MEL-002', project_id: 'proj-4', project_name: 'Brunswick Quarter', client_name: 'Pace Development Group', state: 'VIC', status: 'offline', last_screenshot_url: 'https://placehold.co/320x180/7f1d1d/white?text=NUC-MEL-002', last_seen_at: new Date(Date.now() - 200 * 60000).toISOString(), created_at: '2024-03-01T00:00:00Z' },
  { id: 'nuc-5', nuc_id: 'NUC-BNE-001', project_id: 'proj-5', project_name: 'River Quarter', client_name: 'Lendlease', state: 'QLD', status: 'healthy', last_screenshot_url: 'https://placehold.co/320x180/1a2744/white?text=NUC-BNE-001', last_seen_at: new Date(Date.now() - 5 * 60000).toISOString(), created_at: '2024-02-15T00:00:00Z' },
  { id: 'nuc-6', nuc_id: 'NUC-BNE-002', project_id: 'proj-6', project_name: 'Newstead Green', client_name: 'Consolidated Properties', state: 'QLD', status: 'healthy', last_screenshot_url: 'https://placehold.co/320x180/1a2744/white?text=NUC-BNE-002', last_seen_at: new Date(Date.now() - 14 * 60000).toISOString(), created_at: '2024-03-10T00:00:00Z' },
  { id: 'nuc-7', nuc_id: 'NUC-SYD-003', project_id: 'proj-1', project_name: 'The Daintree Residences', client_name: 'Mirvac', state: 'NSW', status: 'offline', last_screenshot_url: 'https://placehold.co/320x180/7f1d1d/white?text=NUC-SYD-003', last_seen_at: new Date(Date.now() - 300 * 60000).toISOString(), created_at: '2024-01-15T00:00:00Z' },
  { id: 'nuc-8', nuc_id: 'NUC-MEL-003', project_id: 'proj-3', project_name: 'Skyhaus Tower', client_name: 'Central Equity', state: 'VIC', status: 'healthy', last_screenshot_url: 'https://placehold.co/320x180/1a2744/white?text=NUC-MEL-003', last_seen_at: new Date(Date.now() - 30 * 60000).toISOString(), created_at: '2024-01-20T00:00:00Z' },
];

export const mockNucSummary: NucSummary = {
  healthy: mockNucs.filter(n => n.status === 'healthy').length,
  stale: mockNucs.filter(n => n.status === 'stale').length,
  offline: mockNucs.filter(n => n.status === 'offline').length,
};

export const mockNucDetail: NucDetail = {
  ...mockNucs[0],
  screenshots: Array.from({ length: 7 }, (_, i) => ({
    id: `ss-${i}`,
    nuc_id: 'nuc-1',
    screenshot_url: `https://placehold.co/320x180/1a2744/white?text=Day-${7 - i}`,
    captured_at: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString(),
  })),
};

// ─── Incidents ───────────────────────────────────────────────────────────────

export const mockIncidents: Incident[] = [
  { id: 'inc-1', title: 'NUC-MEL-002 unresponsive — display frozen', description: 'NUC has not pinged in 3+ hours. Remote restart attempted, no response.', project_id: 'proj-4', project_name: 'Brunswick Quarter', nuc_id: 'nuc-4', nuc_identifier: 'NUC-MEL-002', priority: 'critical', status: 'open', created_by_name: 'Jordan Smith', created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
  { id: 'inc-2', title: 'NUC-SYD-003 offline during sales event', project_id: 'proj-1', project_name: 'The Daintree Residences', nuc_id: 'nuc-7', nuc_identifier: 'NUC-SYD-003', priority: 'high', status: 'in_progress', created_by_name: 'Alex Chen', created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
  { id: 'inc-3', title: 'NUC-MEL-001 stale — slow screenshot response', project_id: 'proj-3', project_name: 'Skyhaus Tower', nuc_id: 'nuc-3', nuc_identifier: 'NUC-MEL-001', priority: 'medium', status: 'open', created_by_name: 'Sam Williams', created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), updated_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() },
  { id: 'inc-4', title: 'Showcase Builder login issue at River Quarter', project_id: 'proj-5', project_name: 'River Quarter', priority: 'low', status: 'resolved', created_by_name: 'Jordan Smith', created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), resolved_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'inc-5', title: 'Internet outage affecting NUC-BNE-002', project_id: 'proj-6', project_name: 'Newstead Green', nuc_id: 'nuc-6', nuc_identifier: 'NUC-BNE-002', priority: 'high', status: 'closed', created_by_name: 'Alex Chen', created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), resolved_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
];

export const mockIncidentDetail: IncidentDetail = {
  ...mockIncidents[0],
  comments: [
    { id: 'ic-1', incident_id: 'inc-1', body: 'Attempted remote restart via BIOS. No response. Will escalate to on-site visit.', author_name: 'Jordan Smith', created_at: new Date(Date.now() - 90 * 60000).toISOString() },
    { id: 'ic-2', incident_id: 'inc-1', body: 'On-site visit scheduled for tomorrow 9am. Client (Pace) has been notified.', author_name: 'Alex Chen', created_at: new Date(Date.now() - 30 * 60000).toISOString() },
  ],
};

// ─── Projects ────────────────────────────────────────────────────────────────

export const mockProjects: Project[] = [
  { id: 'proj-1', name: 'The Daintree Residences', client_name: 'Mirvac', state: 'NSW', lifecycle_stage: 12, stage_owner_primary: 'Tech Ops', next_action: 'Q2 scheduled visit', contract_status: 'active', payment_status: 'paid', parallel_buyers_portal: true, parallel_analytics_dashboard: true, parallel_showcase_builder: true, parallel_showcase_space: true, parallel_creative_services: false, created_by_name: 'Jordan Smith', created_at: '2024-01-15T00:00:00Z', updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), nuc_count: 2, open_incidents: 1 },
  { id: 'proj-2', name: 'Elmwood Park', client_name: 'Stockland', state: 'NSW', lifecycle_stage: 8, stage_owner_primary: 'Tech Ops', stage_owner_secondary: 'Asset', next_action: 'Complete hardware setup', contract_status: 'signed', payment_status: 'invoiced', parallel_buyers_portal: false, parallel_analytics_dashboard: false, parallel_showcase_builder: true, parallel_showcase_space: false, parallel_creative_services: true, created_by_name: 'Alex Chen', created_at: '2024-02-01T00:00:00Z', updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), nuc_count: 1, open_incidents: 0 },
  { id: 'proj-3', name: 'Skyhaus Tower', client_name: 'Central Equity', state: 'VIC', lifecycle_stage: 11, stage_owner_primary: 'Tech Ops', next_action: 'Monitor go-live', contract_status: 'active', payment_status: 'paid', parallel_buyers_portal: true, parallel_analytics_dashboard: false, parallel_showcase_builder: true, parallel_showcase_space: true, parallel_creative_services: true, created_by_name: 'Sam Williams', created_at: '2024-01-20T00:00:00Z', updated_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), nuc_count: 2, open_incidents: 1 },
  { id: 'proj-4', name: 'Brunswick Quarter', client_name: 'Pace Development Group', state: 'VIC', lifecycle_stage: 13, stage_owner_primary: 'Tech Ops', next_action: 'Quarterly visit overdue', contract_status: 'active', payment_status: 'paid', parallel_buyers_portal: true, parallel_analytics_dashboard: true, parallel_showcase_builder: true, parallel_showcase_space: true, parallel_creative_services: false, created_by_name: 'Jordan Smith', created_at: '2024-03-01T00:00:00Z', updated_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), nuc_count: 1, open_incidents: 1 },
  { id: 'proj-5', name: 'River Quarter', client_name: 'Lendlease', state: 'QLD', lifecycle_stage: 5, stage_owner_primary: 'Product Owner', stage_owner_secondary: 'Asset', next_action: 'Complete project build', contract_status: 'signed', payment_status: 'invoiced', parallel_buyers_portal: false, parallel_analytics_dashboard: false, parallel_showcase_builder: false, parallel_showcase_space: false, parallel_creative_services: true, created_by_name: 'Alex Chen', created_at: '2024-02-15T00:00:00Z', updated_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), nuc_count: 1, open_incidents: 0 },
  { id: 'proj-6', name: 'Newstead Green', client_name: 'Consolidated Properties', state: 'QLD', lifecycle_stage: 14, stage_owner_primary: 'Product Owner', stage_owner_secondary: 'Asset', next_action: 'Content update batch 3', contract_status: 'active', payment_status: 'paid', parallel_buyers_portal: true, parallel_analytics_dashboard: true, parallel_showcase_builder: true, parallel_showcase_space: true, parallel_creative_services: true, created_by_name: 'Sam Williams', created_at: '2024-03-10T00:00:00Z', updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), nuc_count: 1, open_incidents: 0 },
  { id: 'proj-7', name: 'Harbour Edge', client_name: 'Aqualand', state: 'NSW', lifecycle_stage: 2, stage_owner_primary: 'Sales', next_action: 'Build analysis in progress', contract_status: 'pending', payment_status: 'pending', parallel_buyers_portal: false, parallel_analytics_dashboard: false, parallel_showcase_builder: false, parallel_showcase_space: false, parallel_creative_services: false, created_by_name: 'Jordan Smith', created_at: '2024-04-01T00:00:00Z', updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), nuc_count: 0, open_incidents: 0 },
];

// ─── Asset Tickets ────────────────────────────────────────────────────────────

export const mockTickets: AssetTicket[] = [
  { id: 'tick-1', title: 'Update floor plans — Building B revision 3', project_id: 'proj-1', project_name: 'The Daintree Residences', priority: 'urgent', status: 'in_progress', assignee_name: 'Sarah Kim', deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'tick-2', title: 'Add new hero images for Skyhaus lobby render', project_id: 'proj-3', project_name: 'Skyhaus Tower', priority: 'standard', status: 'raised', asset_link: 'https://drive.google.com/example', deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'tick-3', title: 'River Quarter — initial content build', project_id: 'proj-5', project_name: 'River Quarter', priority: 'standard', status: 'awaiting_review', created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
];

// ─── Asset Board ─────────────────────────────────────────────────────────────

export const BALI_TEAM = ['Jordan', 'Ayu', 'Ary', 'Billy', 'Dimas', 'Gusti', 'Yoga', 'Andini', 'Georgie'];

export const mockAssetBoardItems: AssetBoardItem[] = [
  { id: 'ab-1', project_id: 'proj-2', project_name: 'Elmwood Park',              state: 'NSW', stage: 'showcase_build',  tags: ['NSW'],                  created_at: '2024-02-01T00:00:00Z', updated_at: new Date(Date.now() - 2  * 86400000).toISOString() },
  { id: 'ab-2', project_id: 'proj-5', project_name: 'River Quarter',             state: 'QLD', stage: 'showcase_build',  tags: ['QLD'],                  created_at: '2024-02-15T00:00:00Z', updated_at: new Date(Date.now() - 5  * 86400000).toISOString() },
  { id: 'ab-3', project_id: 'proj-3', project_name: 'Skyhaus Tower',             state: 'VIC', stage: 'updates_needed',  tags: ['VIC', 'Gallery'],       created_at: '2024-01-20T00:00:00Z', updated_at: new Date(Date.now() - 1  * 86400000).toISOString() },
  { id: 'ab-4', project_id: 'proj-7', project_name: 'Harbour Edge',              state: 'NSW', stage: 'updates_needed',  tags: ['NSW', 'Floor Plan'],    created_at: '2024-04-01T00:00:00Z', updated_at: new Date(Date.now() - 3  * 86400000).toISOString() },
  { id: 'ab-5', project_id: 'proj-4', project_name: 'Brunswick Quarter',         state: 'VIC', stage: 'awaiting_review', tags: ['VIC'],                  created_at: '2024-03-01T00:00:00Z', updated_at: new Date(Date.now() - 6  * 3600000).toISOString()  },
  { id: 'ab-6', project_id: 'proj-1', project_name: 'The Daintree Residences',   state: 'NSW', stage: 'live',            tags: ['NSW'],                  created_at: '2024-01-15T00:00:00Z', updated_at: new Date(Date.now() - 12 * 3600000).toISOString()  },
  { id: 'ab-7', project_id: 'proj-6', project_name: 'Newstead Green',            state: 'QLD', stage: 'live',            tags: ['QLD', 'Video'],         created_at: '2024-03-10T00:00:00Z', updated_at: new Date(Date.now() - 30 * 3600000).toISOString()  },
];

export const mockUpdateTickets: UpdateTicket[] = [
  // Elmwood Park (showcase_build) — initial build tasks
  { id: 'ut-1', asset_item_id: 'ab-1', project_id: 'proj-2', title: 'Upload floor plans — Building A all levels',    priority: 'standard', status: 'in_progress', assignee_name: 'Ayu',    deadline: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0], asset_link: 'https://drive.google.com/example',  raised_by: 'Jordan', created_at: new Date(Date.now() - 3 * 86400000).toISOString(), updated_at: new Date(Date.now() - 1 * 86400000).toISOString() },
  { id: 'ut-2', asset_item_id: 'ab-1', project_id: 'proj-2', title: 'Add hero renders — lobby and rooftop',          priority: 'standard', status: 'open',        assignee_name: 'Ary',    raised_by: 'Jordan', created_at: new Date(Date.now() - 2 * 86400000).toISOString(), updated_at: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: 'ut-3', asset_item_id: 'ab-1', project_id: 'proj-2', title: 'Configure listing data — all 48 apartments',    priority: 'urgent',   status: 'open',        assignee_name: 'Jordan', deadline: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0], raised_by: 'Jordan', created_at: new Date(Date.now() - 1 * 86400000).toISOString(), updated_at: new Date(Date.now() - 1 * 86400000).toISOString() },
  // Skyhaus Tower (updates_needed)
  { id: 'ut-4', asset_item_id: 'ab-3', project_id: 'proj-3', title: 'Replace gallery hero — updated lobby CGI',       priority: 'standard', status: 'open',        assignee_name: 'Dimas',  asset_link: 'https://drive.google.com/example2', description: 'Client has provided updated CGI from their render team. Replace the existing lobby hero with the new version.', raised_by: 'Jordan', created_at: new Date(Date.now() - 4 * 86400000).toISOString(), updated_at: new Date(Date.now() - 4 * 86400000).toISOString() },
  { id: 'ut-5', asset_item_id: 'ab-3', project_id: 'proj-3', title: 'Update pricing — levels 15–20',                  priority: 'urgent',   status: 'in_progress', assignee_name: 'Ayu',    deadline: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0], raised_by: 'Jordan', created_at: new Date(Date.now() - 2 * 86400000).toISOString(), updated_at: new Date(Date.now() - 6 * 3600000).toISOString() },
  // Harbour Edge (updates_needed)
  { id: 'ut-6', asset_item_id: 'ab-4', project_id: 'proj-7', title: 'Swap floor plan PDFs — revised after DA approval', priority: 'standard', status: 'in_progress', assignee_name: 'Billy', asset_link: 'https://drive.google.com/example3', raised_by: 'Jordan', created_at: new Date(Date.now() - 5 * 86400000).toISOString(), updated_at: new Date(Date.now() - 2 * 86400000).toISOString() },
  // Brunswick Quarter (awaiting_review) — all done
  { id: 'ut-7', asset_item_id: 'ab-5', project_id: 'proj-4', title: 'Add new video walkthrough — updated cut',        priority: 'standard', status: 'done',        assignee_name: 'Yoga',   raised_by: 'Jordan', created_at: new Date(Date.now() - 10 * 86400000).toISOString(), updated_at: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: 'ut-8', asset_item_id: 'ab-5', project_id: 'proj-4', title: 'Update brochure PDF to v3',                      priority: 'no_rush',  status: 'done',        assignee_name: 'Andini', raised_by: 'Jordan', created_at: new Date(Date.now() - 8 * 86400000).toISOString(),  updated_at: new Date(Date.now() - 3 * 86400000).toISOString() },
  // The Daintree Residences (live) — completed
  { id: 'ut-9', asset_item_id: 'ab-6', project_id: 'proj-1', title: 'Initial build complete',                         priority: 'standard', status: 'done',        assignee_name: 'Ayu',    raised_by: 'Jordan', created_at: new Date(Date.now() - 60 * 86400000).toISOString(), updated_at: new Date(Date.now() - 45 * 86400000).toISOString() },
];

// ─── Feature Requests ─────────────────────────────────────────────────────────

export const mockFeatures: FeatureRequest[] = [
  { id: 'feat-1', title: 'Side-by-side apartment comparison view', description: 'Allow buyers to compare two apartments side by side in the display suite.', project_id: 'proj-1', project_name: 'The Daintree Residences', submitted_by_name: 'Jordan Smith', jira_issue_id: 'SHOW-142', status: 'in_progress', created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'feat-2', title: 'QR code shortlisting for buyers', description: 'Buyers can scan QR to save shortlist to phone.', submitted_by_name: 'Alex Chen', jira_issue_id: 'SHOW-158', status: 'accepted', created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'feat-3', title: 'Analytics dashboard — export to CSV', description: 'Export buyer session data as CSV for reporting.', jira_issue_id: 'SHOW-163', status: 'shipped', created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), updated_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
];

// ─── Project Detail (full hydrated) ──────────────────────────────────────────

export const mockProjectDetail: ProjectDetail = {
  ...mockProjects[0],
  nucs: mockNucs.filter(n => n.project_id === 'proj-1'),
  checklist: Array.from({ length: 9 }, (_, i) => ({
    id: `cl-${i + 1}`,
    project_id: 'proj-1',
    item_number: i + 1,
    label: [
      'Contract signed',
      'Asset brief received',
      'Project created in Showcase Builder',
      'Floor plans uploaded',
      'Listings configured',
      'NUC assigned and configured',
      'Training completed',
      'Client sign-off obtained',
      'Go-live confirmed',
    ][i],
    completed: i < 7,
    completed_at: i < 7 ? new Date(Date.now() - (9 - i) * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
  })),
  incidents: mockIncidents.filter(i => i.project_id === 'proj-1'),
  tickets: mockTickets.filter(t => t.project_id === 'proj-1'),
  features: mockFeatures.filter(f => f.project_id === 'proj-1'),
  files: [
    { id: 'f-1', entity_type: 'project', entity_id: 'proj-1', file_name: 'Daintree_Contract_Signed.pdf', file_url: '#', created_at: '2024-01-16T00:00:00Z' },
    { id: 'f-2', entity_type: 'project', entity_id: 'proj-1', file_name: 'Asset_Brief_v2.pdf', file_url: '#', created_at: '2024-01-20T00:00:00Z' },
  ],
  activity: [
    { id: 'a-1', entity_type: 'project', entity_id: 'proj-1', action: 'lifecycle_stage_updated', detail: { from: 11, to: 12 }, actor_name: 'Jordan Smith', created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    { id: 'a-2', entity_type: 'project', entity_id: 'proj-1', action: 'incident_created', detail: { incident_title: 'NUC-SYD-003 offline during sales event' }, actor_name: 'Alex Chen', created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
    { id: 'a-3', entity_type: 'project', entity_id: 'proj-1', action: 'checklist_item_completed', detail: { item: 'Training completed' }, actor_name: 'Jordan Smith', created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
  ],
};
