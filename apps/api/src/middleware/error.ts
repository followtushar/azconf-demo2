import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';
import { config } from '@/config';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

/**
 * Custom error class for API errors
 */
export class AppError extends Error implements ApiError {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = 'AppError';

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Create common error types
 */
export const createError = {
  badRequest: (message: string, details?: any) =>
    new AppError(message, 400, 'BAD_REQUEST', details),
  
  unauthorized: (message: string = 'Unauthorized') =>
    new AppError(message, 401, 'UNAUTHORIZED'),
  
  forbidden: (message: string = 'Forbidden') =>
    new AppError(message, 403, 'FORBIDDEN'),
  
  notFound: (message: string = 'Resource not found') =>
    new AppError(message, 404, 'NOT_FOUND'),
  
  conflict: (message: string, details?: any) =>
    new AppError(message, 409, 'CONFLICT', details),
  
  unprocessableEntity: (message: string, details?: any) =>
    new AppError(message, 422, 'UNPROCESSABLE_ENTITY', details),
  
  tooManyRequests: (message: string = 'Too many requests') =>
    new AppError(message, 429, 'TOO_MANY_REQUESTS'),
  
  internal: (message: string = 'Internal server error', details?: any) =>
    new AppError(message, 500, 'INTERNAL_ERROR', details),
  
  serviceUnavailable: (message: string = 'Service unavailable') =>
    new AppError(message, 503, 'SERVICE_UNAVAILABLE'),
};

/**
 * Error handler middleware
 */
export function errorHandler(
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  let statusCode = error.statusCode || 500;
  let code = error.code || 'INTERNAL_ERROR';
  let message = error.message || 'Internal server error';
  let details = error.details;

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 422;
    code = 'VALIDATION_ERROR';
  } else if (error.name === 'CastError') {
    statusCode = 400;
    code = 'INVALID_ID';
    message = 'Invalid ID format';
  } else if (error.name === 'MongoError' && error.code === 11000) {
    statusCode = 409;
    code = 'DUPLICATE_ENTRY';
    message = 'Duplicate entry';
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'INVALID_TOKEN';
    message = 'Invalid token';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Token expired';
  }

  // Log error
  const logLevel = statusCode >= 500 ? 'error' : 'warn';
  logger[logLevel]('API Error:', {
    statusCode,
    code,
    message,
    details,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
  });

  // Send error response
  const response: any = {
    success: false,
    error: {
      code,
      message,
    },
  };

  // Include details in development or for client errors
  if (config.isDevelopment || statusCode < 500) {
    if (details) {
      response.error.details = details;
    }
  }

  // Include stack trace in development
  if (config.isDevelopment && error.stack) {
    response.error.stack = error.stack;
  }

  res.status(statusCode).json(response);
}

/**
 * 404 handler for undefined routes
 */
export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const error = createError.notFound(`Route ${req.method} ${req.path} not found`);
  next(error);
}

/**
 * Async error wrapper for route handlers
 */
export function asyncHandler<T extends Request, U extends Response>(
  fn: (req: T, res: U, next: NextFunction) => Promise<any>
) {
  return (req: T, res: U, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Validation error formatter
 */
export function formatValidationError(errors: any[]): any {
  const formatted: any = {};
  
  errors.forEach((error) => {
    const field = error.path || error.param || 'unknown';
    if (!formatted[field]) {
      formatted[field] = [];
    }
    formatted[field].push(error.msg || error.message || 'Invalid value');
  });
  
  return formatted;
}