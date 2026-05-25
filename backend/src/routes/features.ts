import { Router, Request, Response } from 'express';
import { query, queryOne } from '../db';

const router = Router();

// GET /api/features
router.get('/', async (req: Request, res: Response) => {
  const { status, project_id, search } = req.query;
  let sql = `
    SELECT f.*,
      p.name AS project_name,
      u.name AS submitted_by_name
    FROM feature_requests f
    LEFT JOIN projects p ON p.id = f.project_id
    LEFT JOIN users u ON u.id = f.submitted_by
    WHERE 1=1
  `;
  const params: unknown[] = [];
  if (status) { params.push(status); sql += ` AND f.status = $${params.length}`; }
  if (project_id) { params.push(project_id); sql += ` AND f.project_id = $${params.length}`; }
  if (search) {
    params.push(`%${search}%`);
    sql += ` AND (f.title ILIKE $${params.length} OR f.description ILIKE $${params.length})`;
  }
  sql += ' ORDER BY f.created_at DESC';
  res.json(await query(sql, params));
});

// POST /api/features
router.post('/', async (req: Request, res: Response) => {
  const { title, description, project_id } = req.body as {
    title: string; description?: string; project_id?: string;
  };
  if (!title) return res.status(400).json({ error: 'title is required' });
  const feature = await queryOne(
    `INSERT INTO feature_requests (title, description, project_id, submitted_by)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [title, description, project_id || null, req.user?.id]
  );
  res.status(201).json(feature);
});

// PATCH /api/features/:id
router.patch('/:id', async (req: Request, res: Response) => {
  const fields = ['title', 'description', 'status', 'jira_issue_id'];
  const sets: string[] = [];
  const params: unknown[] = [];
  fields.forEach(f => {
    if (req.body[f] !== undefined) { params.push(req.body[f]); sets.push(`${f} = $${params.length}`); }
  });
  if (!sets.length) return res.status(400).json({ error: 'No fields to update' });
  params.push(req.params.id);
  const updated = await queryOne(
    `UPDATE feature_requests SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`,
    params
  );
  if (!updated) return res.status(404).json({ error: 'Feature request not found' });
  res.json(updated);
});

export default router;
