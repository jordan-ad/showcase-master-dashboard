import { Router, Request, Response } from 'express';
import { query, queryOne } from '../db';

const router = Router();

// GET /api/nucs
router.get('/', async (req: Request, res: Response) => {
  const { state, status } = req.query;
  let sql = `
    SELECT n.*, p.name AS project_name, p.client_name
    FROM nucs n
    LEFT JOIN projects p ON p.id = n.project_id
    WHERE 1=1
  `;
  const params: unknown[] = [];
  if (state) { params.push(state); sql += ` AND n.state = $${params.length}`; }
  if (status) { params.push(status); sql += ` AND n.status = $${params.length}`; }
  sql += ' ORDER BY n.nuc_id ASC';
  const nucs = await query(sql, params);
  res.json(nucs);
});

// GET /api/nucs/summary
router.get('/summary', async (_req: Request, res: Response) => {
  const rows = await query<{ status: string; count: string }>(
    `SELECT status, COUNT(*) AS count FROM nucs GROUP BY status`
  );
  const summary = { healthy: 0, stale: 0, offline: 0 };
  rows.forEach(r => { summary[r.status as keyof typeof summary] = parseInt(r.count); });
  res.json(summary);
});

// GET /api/nucs/:id
router.get('/:id', async (req: Request, res: Response) => {
  const nuc = await queryOne(
    `SELECT n.*, p.name AS project_name, p.client_name
     FROM nucs n
     LEFT JOIN projects p ON p.id = n.project_id
     WHERE n.id = $1`,
    [req.params.id]
  );
  if (!nuc) return res.status(404).json({ error: 'NUC not found' });

  const screenshots = await query(
    `SELECT * FROM nuc_screenshots WHERE nuc_id = $1 ORDER BY captured_at DESC LIMIT 7`,
    [req.params.id]
  );
  res.json({ ...nuc as object, screenshots });
});

// POST /api/nucs/webhook  — Google Apps Script endpoint
router.post('/webhook', async (req: Request, res: Response) => {
  const { nuc_id, screenshot_base64, timestamp } = req.body as {
    nuc_id: string;
    screenshot_base64: string;
    timestamp?: string;
  };

  if (!nuc_id || !screenshot_base64) {
    return res.status(400).json({ error: 'nuc_id and screenshot_base64 are required' });
  }

  // Find or create NUC record
  let nuc = await queryOne<{ id: string }>(`SELECT id FROM nucs WHERE nuc_id = $1`, [nuc_id]);
  if (!nuc) {
    const [created] = await query<{ id: string }>(
      `INSERT INTO nucs (nuc_id) VALUES ($1) RETURNING id`,
      [nuc_id]
    );
    nuc = created;
  }

  // TODO: Upload base64 to S3 and get URL
  // For now, store as data URL placeholder
  const screenshotUrl = `data:image/png;base64,${screenshot_base64.substring(0, 20)}...`;
  const capturedAt = timestamp ? new Date(timestamp) : new Date();

  // Update NUC record
  const now = new Date();
  const hoursSinceCapture = (now.getTime() - capturedAt.getTime()) / (1000 * 60 * 60);
  const isBusinessHours = now.getHours() >= 8 && now.getHours() < 17;
  const status = !isBusinessHours
    ? 'offline'
    : hoursSinceCapture <= 1 ? 'healthy'
    : hoursSinceCapture <= 2 ? 'stale'
    : 'offline';

  await query(
    `UPDATE nucs SET last_screenshot_url=$1, last_seen_at=$2, status=$3 WHERE id=$4`,
    [screenshotUrl, capturedAt, status, nuc.id]
  );

  // Insert screenshot history
  await query(
    `INSERT INTO nuc_screenshots (nuc_id, screenshot_url, captured_at) VALUES ($1, $2, $3)`,
    [nuc.id, screenshotUrl, capturedAt]
  );

  res.json({ ok: true, nuc_id, status });
});

// PATCH /api/nucs/:id
router.patch('/:id', async (req: Request, res: Response) => {
  const { project_id, state } = req.body as { project_id?: string; state?: string };
  const updated = await queryOne(
    `UPDATE nucs SET project_id=$1, state=$2 WHERE id=$3 RETURNING *`,
    [project_id, state, req.params.id]
  );
  if (!updated) return res.status(404).json({ error: 'NUC not found' });
  res.json(updated);
});

export default router;
