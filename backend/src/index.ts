import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authenticate, devAuth } from './middleware/auth';
import nucRoutes from './routes/nucs';
import incidentRoutes from './routes/incidents';
import projectRoutes from './routes/projects';
import assetRoutes from './routes/assets';
import featureRoutes from './routes/features';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const isDev = process.env.NODE_ENV !== 'production';

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' })); // large enough for base64 screenshots

// NUC webhook is unauthenticated (called by Google Apps Script)
app.use('/api/nucs/webhook', nucRoutes);

// All other routes require auth
const authMiddleware = isDev ? [devAuth] : [authenticate];
app.use('/api/nucs', ...authMiddleware, nucRoutes);
app.use('/api/incidents', ...authMiddleware, incidentRoutes);
app.use('/api/projects', ...authMiddleware, projectRoutes);
app.use('/api/tickets', ...authMiddleware, assetRoutes);
app.use('/api/features', ...authMiddleware, featureRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV, ts: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Showcase Dashboard API listening on port ${PORT} [${process.env.NODE_ENV ?? 'development'}]`);
});

export default app;
