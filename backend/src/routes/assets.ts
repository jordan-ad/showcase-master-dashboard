import { Router, Request, Response } from 'express';
import { query, queryOne } from '../db';

const router = Router();

// GET /api/tickets
router.get('/', async (req: Request, res: Response) => {
  const { status, priority, project_id, assignee_id } = req.query;
  let sql = `
    SELECT t.*,
      p.name AS project_name,
      a.name AS assignee_name,
      u.name AS created_by_name
    FROM asset_tickets t
    LEFT JOIN projects p ON p.id = t.project_id
    LEFT JOIN users a ON a.id = t.assignee_id
    LEFT JOIN users u ON u.id = t.created_by
    WHERE 1=1
  `;
  const params: unknown[] = [];
  if (status) { params.push(status); sql += ` AND t.status = $${params.length}`; }
  if (priority) { params.push(priority); sql += ` AND t.priority = $${params.length}`; }
  if (project_id) { params.push(project_id); sql += ` AND t.project_id = $${params.length}`; }
  if (assignee_id) { params.push(assignee_id); sql += ` AND t.assignee_id = $${params.length}`; }
  sql += ` ORDER BY CASE t.priority WHEN 'urgent' THEN 1 WHEN 'standard' THEN 2 ELSE 3 END, t.deadline ASC NULLS LAST`;
  res.json(await query(sql, params));
});

// GET /api/tickets/:id
router.get('/:id', async (req: Request, res: Response) => {
  const ticket = await queryOne(
    `SELECT t.*,
      p.name AS project_name,
      a.name AS assignee_name
     FROM asset_tickets t
     LEFT JOIN projects p ON p.id = t.project_id
     LEFT JOIN users a ON a.id = t.assignee_id
     WHERE t.id = $1`,
    [req.params.id]
  );
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  const files = await query(
    `SELECT * FROM files WHERE entity_type = 'ticket' AND entity_id = $1`,
    [req.params.id]
  );
  res.json({ ...ticket as object, files });
});

// POST /api/tickets
router.post('/', async (req: Request, res: Response) => {
  const { title, description, project_id, priority = 'standard', assignee_id, asset_link, deadline } = req.body as {
    title: string; description?: string; project_id?: string; priority?: string;
    assignee_id?: string; asset_link?: string; deadline?: string;
  };
  if (!title) return res.status(400).json({ error: 'title is required' });
  const ticket = await queryOne(
    `INSERT INTO asset_tickets (title, description, project_id, priority, assignee_id, asset_link, deadline, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [title, description, project_id || null, priority, assignee_id || null, asset_link, deadline || null, req.user?.id]
  );
  res.status(201).json(ticket);
});

// PATCH /api/tickets/:id
router.patch('/:id', async (req: Request, res: Response) => {
  const fields = ['title', 'description', 'priority', 'status', 'assignee_id', 'asset_link', 'deadline'];
  const sets: string[] = [];
  const params: unknown[] = [];
  fields.forEach(f => {
    if (req.body[f] !== undefined) { params.push(req.body[f]); sets.push(`${f} = $${params.length}`); }
  });
  if (!sets.length) return res.status(400).json({ error: 'No fields to update' });
  params.push(req.params.id);
  const updated = await queryOne(
    `UPDATE asset_tickets SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`,
    params
  );
  if (!updated) return res.status(404).json({ error: 'Ticket not found' });
  res.json(updated);
});

export default router;
