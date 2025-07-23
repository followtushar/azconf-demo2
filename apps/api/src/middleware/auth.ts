import { Request, Response, NextFunction } from 'express';
import { JWT, JWTPayload } from '@/utils/jwt';
import { db } from '@/config/database';
import { cache, Cache } from '@/config/redis';
import { logger } from '@/utils/logger';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        username: string;
        firstName: string;
        lastName: string;
        isEmailVerified: boolean;
        isActive: boolean;
      };
    }
  }
}

/**
 * Middleware to authenticate JWT tokens
 */
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = JWT.extractFromHeader(req.headers.authorization);
    
    if (!token) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication token required',
        },
      });
      return;
    }

    // Verify the token
    let decoded: JWTPayload;
    try {
      decoded = JWT.verifyAccessToken(token);
    } catch (error) {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: error.message || 'Invalid authentication token',
        },
      });
      return;
    }

    // Check if user exists in cache first
    const cacheKey = Cache.keys.user(decoded.userId);
    let user = await cache.get(cacheKey);

    if (!user) {
      // Fetch user from database
      user = await db.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          isEmailVerified: true,
          isActive: true,
        },
      });

      if (!user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
        });
        return;
      }

      // Cache user for 5 minutes
      await cache.set(cacheKey, user, 300);
    }

    // Check if user is active
    if (!user.isActive) {
      res.status(401).json({
        success: false,
        error: {
          code: 'ACCOUNT_INACTIVE',
          message: 'Account is inactive',
        },
      });
      return;
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Authentication error',
      },
    });
  }
}

/**
 * Middleware to require email verification
 */
export function requireEmailVerification(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user?.isEmailVerified) {
    res.status(403).json({
      success: false,
      error: {
        code: 'EMAIL_NOT_VERIFIED',
        message: 'Email verification required',
      },
    });
    return;
  }
  next();
}

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = JWT.extractFromHeader(req.headers.authorization);
    
    if (!token) {
      next();
      return;
    }

    try {
      const decoded = JWT.verifyAccessToken(token);
      
      // Check cache first
      const cacheKey = Cache.keys.user(decoded.userId);
      let user = await cache.get(cacheKey);

      if (!user) {
        user = await db.user.findUnique({
          where: { id: decoded.userId },
          select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
            isEmailVerified: true,
            isActive: true,
          },
        });

        if (user) {
          await cache.set(cacheKey, user, 300);
        }
      }

      if (user && user.isActive) {
        req.user = user;
      }
    } catch (error) {
      // Ignore token errors for optional auth
      logger.debug('Optional auth token error:', error);
    }

    next();
  } catch (error) {
    logger.error('Optional auth middleware error:', error);
    next();
  }
}

/**
 * Middleware to check if user owns a resource
 */
export function requireOwnership(resourceKey: string = 'id') {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const resourceId = req.params[resourceKey];
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        });
        return;
      }

      // This would need to be customized based on the resource type
      // For now, we'll assume it's a capsule
      const capsule = await db.capsule.findUnique({
        where: { id: resourceId },
        select: { creatorId: true },
      });

      if (!capsule) {
        res.status(404).json({
          success: false,
          error: {
            code: 'RESOURCE_NOT_FOUND',
            message: 'Resource not found',
          },
        });
        return;
      }

      if (capsule.creatorId !== userId) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied',
          },
        });
        return;
      }

      next();
    } catch (error) {
      logger.error('Ownership middleware error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Authorization error',
        },
      });
    }
  };
}