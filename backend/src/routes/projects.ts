import { Router, Request, Response } from 'express';
import { query, queryOne } from '../db';

const router = Router();

const CHECKLIST_ITEMS = [
  'Contract signed',
  'Asset brief received',
  'Project created in Showcase Builder',
  'Floor plans uploaded',
  'Listings configured',
  'NUC assigned and configured',
  'Training completed',
  'Client sign-off obtained',
  'Go-live confirmed',
];

// GET /api/projects
router.get('/', async (req: Request, res: Response) => {
  const { state, lifecycle_stage, search, archived } = req.query;
  let sql = `
    SELECT p.*,
      u.name AS created_by_name,
      (SELECT COUNT(*) FROM nucs n WHERE n.project_id = p.id) AS nuc_count,
      (SELECT COUNT(*) FROM incidents i WHERE i.project_id = p.id AND i.status IN ('open','in_progress')) AS open_incidents
    FROM projects p
    LEFT JOIN users u ON u.id = p.created_by
    WHERE 1=1
  `;
  const params: unknown[] = [];
  if (archived === 'true') { sql += ` AND p.archived_at IS NOT NULL`; }
  else { sql += ` AND p.archived_at IS NULL`; }
  if (state) { params.push(state); sql += ` AND p.state = $${params.length}`; }
  if (lifecycle_stage) { params.push(lifecycle_stage); sql += ` AND p.lifecycle_stage = $${params.length}`; }
  if (search) {
    params.push(`%${search}%`);
    sql += ` AND (p.name ILIKE $${params.length} OR p.client_name ILIKE $${params.length})`;
  }
  sql += ' ORDER BY p.updated_at DESC';
  res.json(await query(sql, params));
});

// GET /api/projects/:id
router.get('/:id', async (req: Request, res: Response) => {
  const project = await queryOne(`SELECT * FROM projects WHERE id = $1`, [req.params.id]);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const [nucs, checklist, incidents, tickets, features, files, activity] = await Promise.all([
    query(`SELECT * FROM nucs WHERE project_id = $1`, [req.params.id]),
    query(`SELECT * FROM onboarding_checklist WHERE project_id = $1 ORDER BY item_number`, [req.params.id]),
    query(
      `SELECT i.*, u.name AS created_by_name FROM incidents i LEFT JOIN users u ON u.id = i.created_by WHERE i.project_id = $1 ORDER BY i.created_at DESC LIMIT 20`,
      [req.params.id]
    ),
    query(
      `SELECT t.*, u.name AS assignee_name FROM asset_tickets t LEFT JOIN users u ON u.id = t.assignee_id WHERE t.project_id = $1 ORDER BY t.created_at DESC`,
      [req.params.id]
    ),
    query(`SELECT * FROM feature_requests WHERE project_id = $1 ORDER BY created_at DESC`, [req.params.id]),
    query(`SELECT * FROM files WHERE entity_type = 'project' AND entity_id = $1 ORDER BY created_at DESC`, [req.params.id]),
    query(
      `SELECT a.*, u.name AS actor_name FROM activity_log a LEFT JOIN users u ON u.id = a.actor_id WHERE a.entity_type = 'project' AND a.entity_id = $1 ORDER BY a.created_at DESC LIMIT 50`,
      [req.params.id]
    ),
  ]);

  res.json({ ...project as object, nucs, checklist, incidents, tickets, features, files, activity });
});

// POST /api/projects
router.post('/', async (req: Request, res: Response) => {
  const {
    name, client_name, state, lifecycle_stage = 1,
    stage_owner_primary, stage_owner_secondary, next_action,
    contract_status, payment_status,
  } = req.body as {
    name: string; client_name: string; state: string; lifecycle_stage?: number;
    stage_owner_primary?: string; stage_owner_secondary?: string; next_action?: string;
    contract_status?: string; payment_status?: string;
  };

  if (!name || !client_name || !state) {
    return res.status(400).json({ error: 'name, client_name, and state are required' });
  }

  const project = await queryOne<{ id: string }>(
    `INSERT INTO projects (name, client_name, state, lifecycle_stage, stage_owner_primary, stage_owner_secondary, next_action, contract_status, payment_status, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
    [name, client_name, state, lifecycle_stage, stage_owner_primary, stage_owner_secondary, next_action, contract_status, payment_status, req.user?.id]
  );

  if (project?.id) {
    const checklistInserts = CHECKLIST_ITEMS.map((label, i) =>
      query(
        `INSERT INTO onboarding_checklist (project_id, item_number, label) VALUES ($1, $2, $3)`,
        [project.id, i + 1, label]
      )
    );
    await Promise.all(checklistInserts);
  }

  res.status(201).json(project);
});

// PATCH /api/projects/:id
router.patch('/:id', async (req: Request, res: Response) => {
  const fields = [
    'name', 'client_name', 'state', 'lifecycle_stage',
    'stage_owner_primary', 'stage_owner_secondary', 'next_action',
    'contract_status', 'payment_status',
    'parallel_buyers_portal', 'parallel_analytics_dashboard',
    'parallel_showcase_builder', 'parallel_showcase_space', 'parallel_creative_services',
  ];
  const sets: string[] = [];
  const params: unknown[] = [];

  fields.forEach(f => {
    if (req.body[f] !== undefined) {
      params.push(req.body[f]);
      sets.push(`${f} = $${params.length}`);
    }
  });

  if (!sets.length) return res.status(400).json({ error: 'No fields to update' });
  params.push(req.params.id);
  const updated = await queryOne(
    `UPDATE projects SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`,
    params
  );
  if (!updated) return res.status(404).json({ error: 'Project not found' });
  res.json(updated);
});

// PATCH /api/projects/:id/checklist/:item
router.patch('/:id/checklist/:item', async (req: Request, res: Response) => {
  const { completed } = req.body as { completed: boolean };
  const updated = await queryOne(
    `UPDATE onboarding_checklist
     SET completed=$1, completed_by=$2, completed_at=$3
     WHERE project_id=$4 AND item_number=$5
     RETURNING *`,
    [completed, completed ? req.user?.id : null, completed ? new Date() : null, req.params.id, req.params.item]
  );
  if (!updated) return res.status(404).json({ error: 'Checklist item not found' });
  res.json(updated);
});

// DELETE /api/projects/:id  (archive)
router.delete('/:id', async (req: Request, res: Response) => {
  const updated = await queryOne(
    `UPDATE projects SET archived_at = NOW() WHERE id = $1 AND archived_at IS NULL RETURNING id`,
    [req.params.id]
  );
  if (!updated) return res.status(404).json({ error: 'Project not found or already archived' });
  res.json({ ok: true });
});

export default router;
