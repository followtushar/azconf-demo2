import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';

import { config } from '@/config';
import { logger } from '@/utils/logger';
import { connectDatabase } from '@/config/database';
import { connectRedis } from '@/config/redis';
import { errorHandler, notFoundHandler } from '@/middleware/error';
import { authMiddleware } from '@/middleware/auth';
import { routes } from '@/routes';
import { setupSocket } from '@/services/socket';
import { startScheduler } from '@/services/scheduler';

async function bootstrap() {
  try {
    // Initialize database connections
    await connectDatabase();
    await connectRedis();
    
    // Create Express app
    const app = express();
    const server = createServer(app);
    
    // Initialize Socket.IO
    const io = new Server(server, {
      cors: {
        origin: config.web.url,
        credentials: true,
      },
    });
    
    // Setup Socket.IO handlers
    setupSocket(io);
    
    // Security middleware
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "ws:", "wss:"],
        },
      },
    }));
    
    // CORS configuration
    app.use(cors({
      origin: config.cors.origin.split(','),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }));
    
    // Rate limiting
    const limiter = rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.maxRequests,
      message: {
        error: 'Too many requests from this IP, please try again later.',
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    app.use(limiter);
    
    // Body parsing middleware
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // Compression
    app.use(compression());
    
    // Logging
    app.use(morgan('combined', {
      stream: {
        write: (message: string) => logger.info(message.trim()),
      },
    }));
    
    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
      });
    });
    
    // API routes
    app.use('/api', routes);
    
    // Serve uploaded files
    app.use('/uploads', express.static(config.storage.path));
    
    // Error handling
    app.use(notFoundHandler);
    app.use(errorHandler);
    
    // Start the server
    const port = config.api.port;
    server.listen(port, () => {
      logger.info(`🚀 TimeCap API server running on port ${port}`);
      logger.info(`📊 Health check available at http://localhost:${port}/health`);
      logger.info(`🌐 Environment: ${config.env}`);
    });
    
    // Start background scheduler
    await startScheduler();
    logger.info('📅 Background scheduler started');
    
    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, shutting down gracefully');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });
    
    process.on('SIGINT', async () => {
      logger.info('SIGINT received, shutting down gracefully');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the application
bootstrap();