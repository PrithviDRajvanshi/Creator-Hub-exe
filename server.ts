import 'dotenv/config';
import path from 'path';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { connectDB } from './server/config/db.js';
import { seedInitialData } from './server/utils/seed.js';
import { app } from './server/app.js';
import { validateEnv, PORT, NODE_ENV } from './server/config/env.js';

async function startServer() {
  // Validate Environment Variables on Startup
  validateEnv();

  // Connect Database & Seed Initial Data
  await connectDB();
  await seedInitialData();

  // Vite Integration for Development / Static Production Serving
  if (NODE_ENV !== 'production') {
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
