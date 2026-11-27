import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';

import authRoutes from './routes/auth';
import calendarRoutes from './routes/calendar';
import orderRoutes from './routes/orders';
import statsRoutes from './routes/stats';
import expenseRoutes from './routes/expenses';
import packageRoutes from './routes/packages';
import clientRoutes from './routes/clients';
import publicRoutes from './routes/public';
import uploadRoutes from './routes/upload';

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(
  morgan('dev', {
    skip: (req) =>
      req.originalUrl.includes('/auth/ping') || req.originalUrl.includes('/auth/session-stream'),
  })
);

// Static uploaded images (supports persistent volume via UPLOADS_DIR in Docker/ClawCloud)
const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Health check
app.get('/api/v1/health', (_req: Request, res: Response) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// API v1 routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/calendar', calendarRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/stats', statsRoutes);
app.use('/api/v1/expenses', expenseRoutes);
app.use('/api/v1/packages', packageRoutes);
app.use('/api/v1/clients', clientRoutes);
app.use('/api/v1/public', publicRoutes);
app.use('/api/v1/upload', uploadRoutes);

// Unified Production Static SPA Hosting (serves compiled Vue frontend on same origin)
const staticDir = process.env.STATIC_DIR || path.join(__dirname, '../../frontend/dist');
const indexHtml = path.join(staticDir, 'index.html');
if (fs.existsSync(indexHtml)) {
  app.use(express.static(staticDir, { maxAge: '7d', index: false }));
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) {
      next();
      return;
    }
    res.sendFile(indexHtml);
  });
}

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: err.message || '服务器内部错误',
  });
});

app.listen(PORT, () => {
  console.log(`✨ Makeup Studio API running at http://localhost:${PORT}`);
});
