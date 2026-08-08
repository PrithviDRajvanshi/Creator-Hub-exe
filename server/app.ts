import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import mediaRoutes from './routes/mediaRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();
app.set('trust proxy', 1);

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

export { app };
