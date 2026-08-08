import 'dotenv/config';
import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import { createServer as createViteServer } from 'vite';
import { connectDB } from './server/config/db.js';
import { seedInitialData } from './server/utils/seed.js';
import { errorHandler } from './server/middleware/errorHandler.js';
import { apiLimiter } from './server/middleware/rateLimiter.js';

// Route Imports
import authRoutes from './server/routes/authRoutes.js';
import contentRoutes from './server/routes/contentRoutes.js';
import mediaRoutes from './server/routes/mediaRoutes.js';
import aiRoutes from './server/routes/aiRoutes.js';
import adminRoutes from './server/routes/adminRoutes.js';

async function startServer() {
  const app = express();
  app.set('trust proxy', 1);
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Connect Database & Seed Initial Data
  await connectDB();
  await seedInitialData();

  // Security Middlewares
  app.use(
    helmet({
      contentSecurityPolicy: false, // Disabled for Vite dev server compatibility inside preview iframe
      crossOriginEmbedderPolicy: false,
    })
  );

  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );

  // Body Parser
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // General API Rate Limiter
  app.use('/api', apiLimiter);

  // Static uploads serving
  const uploadDir = path.join(process.cwd(), 'uploads');
  app.use('/uploads', express.static(uploadDir));

  // Health Check Endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Mount API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/content', contentRoutes);
  app.use('/api/media', mediaRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/admin', adminRoutes);

  // Global Error Handler for API
  app.use(errorHandler);

  // Vite Integration for Development / Static Production Serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI CreatorHub server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
