import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import { createServer } from 'http';

import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';
import { auditMiddleware } from './middleware/audit';

// Import routes
import authRoutes from './routes/auth';
import dashboardRoutes from './routes/dashboard';
import controlsRoutes from './routes/controls';
import complianceRoutes from './routes/compliance';
import remediationRoutes from './routes/remediation';
import reportsRoutes from './routes/reports';
import settingsRoutes from './routes/settings';
import integrationsRoutes from './routes/integrations';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3001',
    credentials: true,
  },
});

const PORT = process.env.PORT || 3002;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3001',
  credentials: true,
}));
app.use(compression());
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(limiter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API routes
app.use('/api/auth', authRoutes);

// Protected routes (require authentication)
app.use('/api/dashboard', authMiddleware, auditMiddleware, dashboardRoutes);
app.use('/api/controls', authMiddleware, auditMiddleware, controlsRoutes);
app.use('/api/compliance', authMiddleware, auditMiddleware, complianceRoutes);
app.use('/api/remediation', authMiddleware, auditMiddleware, remediationRoutes);
app.use('/api/reports', authMiddleware, auditMiddleware, reportsRoutes);
app.use('/api/settings', authMiddleware, auditMiddleware, settingsRoutes);
app.use('/api/integrations', authMiddleware, auditMiddleware, integrationsRoutes);

// Socket.IO for real-time updates
io.use((socket, next) => {
  // Add authentication middleware for socket connections
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  // Verify token and attach user to socket
  // Implementation would go here
  next();
});

io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  socket.on('join-compliance-room', (data) => {
    socket.join(`compliance-${data.userId}`);
  });

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Make io available to routes
app.set('io', io);

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

// Start server
server.listen(PORT, () => {
  logger.info(`Entra Management API server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export { app, io };