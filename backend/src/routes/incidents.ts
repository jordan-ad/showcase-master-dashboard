import { Router, Request, Response } from 'express';
import { query, queryOne } from '../db';

const router = Router();

// GET /api/incidents
router.get('/', async (req: Request, res: Response) => {
  const { status, priority, project_id } = req.query;
  let sql = `
    SELECT i.*,
      p.name AS project_name,
      n.nuc_id AS nuc_identifier,
      u.name AS created_by_name
    FROM incidents i
    LEFT JOIN projects p ON p.id = i.project_id
    LEFT JOIN nucs n ON n.id = i.nuc_id
    LEFT JOIN users u ON u.id = i.created_by
    WHERE 1=1
  `;
  const params: unknown[] = [];
  if (status) { params.push(status); sql += ` AND i.status = $${params.length}`; }
  if (priority) { params.push(priority); sql += ` AND i.priority = $${params.length}`; }
  if (project_id) { params.push(project_id); sql += ` AND i.project_id = $${params.length}`; }
  sql += ' ORDER BY CASE i.priority WHEN \'critical\' THEN 1 WHEN \'high\' THEN 2 WHEN \'medium\' THEN 3 ELSE 4 END, i.created_at DESC';
  res.json(await query(sql, params));
});

// GET /api/incidents/open-count
router.get('/open-count', async (_req, res) => {
  const [row] = await query<{ count: string }>(
    `SELECT COUNT(*) AS count FROM incidents WHERE status IN ('open', 'in_progress')`
  );
  res.json({ count: parseInt(row?.count ?? '0') });
});

// GET /api/incidents/:id
router.get('/:id', async (req: Request, res: Response) => {
  const incident = await queryOne(
    `SELECT i.*,
      p.name AS project_name,
      n.nuc_id AS nuc_identifier,
      u.name AS created_by_name
     FROM incidents i
     LEFT JOIN projects p ON p.id = i.project_id
     LEFT JOIN nucs n ON n.id = i.nuc_id
     LEFT JOIN users u ON u.id = i.created_by
     WHERE i.id = $1`,
    [req.params.id]
  );
  if (!incident) return res.status(404).json({ error: 'Incident not found' });

  const comments = await query(
    `SELECT ic.*, u.name AS author_name, u.avatar_url AS author_avatar
     FROM incident_comments ic
     LEFT JOIN users u ON u.id = ic.author_id
     WHERE ic.incident_id = $1
     ORDER BY ic.created_at ASC`,
    [req.params.id]
  );
  res.json({ ...incident as object, comments });
});

// POST /api/incidents
router.post('/', async (req: Request, res: Response) => {
  const { title, description, project_id, nuc_id, priority } = req.body as {
    title: string; description?: string; project_id?: string;
    nuc_id?: string; priority: string;
  };
  if (!title || !priority) return res.status(400).json({ error: 'title and priority are required' });

  const incident = await queryOne(
    `INSERT INTO incidents (title, description, project_id, nuc_id, priority, created_by)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [title, description, project_id || null, nuc_id || null, priority, req.user?.id]
  );
  res.status(201).json(incident);
});

// PATCH /api/incidents/:id
router.patch('/:id', async (req: Request, res: Response) => {
  const { status, priority, title, description } = req.body as {
    status?: string; priority?: string; title?: string; description?: string;
  };
  const sets: string[] = [];
  const params: unknown[] = [];

  if (status) { params.push(status); sets.push(`status = $${params.length}`); }
  if (priority) { params.push(priority); sets.push(`priority = $${params.length}`); }
  if (title) { params.push(title); sets.push(`title = $${params.length}`); }
  if (description !== undefined) { params.push(description); sets.push(`description = $${params.length}`); }
  if (status === 'resolved') { sets.push(`resolved_at = NOW()`); }

  if (!sets.length) return res.status(400).json({ error: 'No fields to update' });

  params.push(req.params.id);
  const updated = await queryOne(
    `UPDATE incidents SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`,
    params
  );
  if (!updated) return res.status(404).json({ error: 'Incident not found' });
  res.json(updated);
});

// POST /api/incidents/:id/comments
router.post('/:id/comments', async (req: Request, res: Response) => {
  const { body } = req.body as { body: string };
  if (!body) return res.status(400).json({ error: 'body is required' });
  const comment = await queryOne(
    `INSERT INTO incident_comments (incident_id, body, author_id) VALUES ($1, $2, $3) RETURNING *`,
    [req.params.id, body, req.user?.id]
  );
  res.status(201).json(comment);
});

export default router;
