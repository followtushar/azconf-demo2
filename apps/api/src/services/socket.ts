import { Server } from 'socket.io';
import { JWT } from '@/utils/jwt';
import { logger } from '@/utils/logger';

export function setupSocket(io: Server): void {
  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = JWT.verifyAccessToken(token);
      socket.data.userId = decoded.userId;
      socket.data.email = decoded.email;
      
      next();
    } catch (error) {
      next(new Error('Invalid authentication token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    logger.info(`User connected via WebSocket: ${socket.data.email}`);

    // Join user-specific room
    socket.join(`user:${userId}`);

    // Handle disconnect
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.data.email}`);
    });

    // Handle capsule status updates
    socket.on('subscribe_capsule', (capsuleId: string) => {
      socket.join(`capsule:${capsuleId}`);
    });

    socket.on('unsubscribe_capsule', (capsuleId: string) => {
      socket.leave(`capsule:${capsuleId}`);
    });
  });
}

// Helper functions to emit events
export class SocketService {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  /**
   * Send notification to a specific user
   */
  notifyUser(userId: string, type: string, data: any): void {
    this.io.to(`user:${userId}`).emit('notification', {
      type,
      data,
      timestamp: new Date(),
    });
  }

  /**
   * Send capsule delivery notification
   */
  notifyCapsuleDelivered(userId: string, capsule: any): void {
    this.notifyUser(userId, 'capsule_delivered', capsule);
  }

  /**
   * Send capsule status update
   */
  notifyCapsuleStatus(capsuleId: string, status: string, data?: any): void {
    this.io.to(`capsule:${capsuleId}`).emit('capsule_status', {
      capsuleId,
      status,
      data,
      timestamp: new Date(),
    });
  }

  /**
   * Broadcast system announcement
   */
  broadcastAnnouncement(message: string, type: 'info' | 'warning' | 'success' = 'info'): void {
    this.io.emit('announcement', {
      type,
      message,
      timestamp: new Date(),
    });
  }
}