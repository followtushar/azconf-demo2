import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { CustomError } from './errorHandler';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: string;
        tenantId: string;
      };
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new CustomError('No token provided', 401);
    }

    const token = authHeader.substring(7);
    
    if (!process.env.JWT_SECRET) {
      throw new CustomError('JWT secret not configured', 500);
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
    
    if (!decoded.userId) {
      throw new CustomError('Invalid token format', 401);
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tenantId: true,
      },
    });

    if (!user) {
      throw new CustomError('User not found', 401);
    }

    // Attach user to request
    req.user = user;
    
    logger.debug('User authenticated', {
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new CustomError('Invalid token', 401));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new CustomError('Token expired', 401));
    } else {
      next(error);
    }
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new CustomError('Authentication required', 401);
    }

    if (!roles.includes(req.user.role)) {
      throw new CustomError('Insufficient permissions', 403);
    }

    next();
  };
};

export const requireAdmin = authorize('ADMIN');
export const requireComplianceOfficer = authorize('ADMIN', 'COMPLIANCE_OFFICER');
export const requireViewer = authorize('ADMIN', 'COMPLIANCE_OFFICER', 'VIEWER');