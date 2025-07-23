import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

interface AuditChange {
  property: string;
  oldValue: any;
  newValue: any;
}

export const auditMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Store original response methods
  const originalSend = res.send;
  const originalJson = res.json;

  // Track request start time
  const startTime = Date.now();

  // Capture request body for audit
  const originalBody = req.body ? JSON.parse(JSON.stringify(req.body)) : null;

  // Override response methods to capture response data
  res.send = function(body: any) {
    res.locals.responseBody = body;
    return originalSend.call(this, body);
  };

  res.json = function(body: any) {
    res.locals.responseBody = body;
    return originalJson.call(this, body);
  };

  // Log audit trail after response is sent
  res.on('finish', async () => {
    try {
      const duration = Date.now() - startTime;
      const statusCode = res.statusCode;
      const result = statusCode >= 200 && statusCode < 400 ? 'SUCCESS' : 'FAILURE';

      // Skip audit for certain routes
      const skipRoutes = ['/health', '/api/auth/refresh'];
      const shouldSkip = skipRoutes.some(route => req.path.startsWith(route));
      
      if (shouldSkip || !req.user) {
        return;
      }

      // Determine action type based on method and path
      const action = getActionFromRequest(req);
      const resourceType = getResourceTypeFromPath(req.path);
      const resourceId = getResourceIdFromPath(req.path) || 'unknown';

      // Extract changes for audit
      const changes = extractChanges(req.method, originalBody, res.locals.responseBody);

      // Create audit log entry
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          userName: req.user.name,
          action,
          resourceType,
          resourceId,
          changes: changes,
          ipAddress: getClientIp(req),
          userAgent: req.get('User-Agent') || 'unknown',
          result: result as 'SUCCESS' | 'FAILURE',
        },
      });

      logger.info('Audit log created', {
        userId: req.user.id,
        action,
        resourceType,
        resourceId,
        result,
        duration,
        statusCode,
      });
    } catch (error) {
      logger.error('Failed to create audit log', {
        error: error.message,
        userId: req.user?.id,
        path: req.path,
        method: req.method,
      });
    }
  });

  next();
};

function getActionFromRequest(req: Request): string {
  const method = req.method.toUpperCase();
  const path = req.path.toLowerCase();

  // Specific action mappings
  if (path.includes('/compliance/check')) return 'COMPLIANCE_CHECK';
  if (path.includes('/remediation/execute')) return 'REMEDIATION_EXECUTE';
  if (path.includes('/controls') && path.includes('/confirm')) return 'MANUAL_CONFIRMATION';
  if (path.includes('/reports/generate')) return 'REPORT_GENERATE';
  if (path.includes('/settings')) return 'SETTINGS_UPDATE';
  if (path.includes('/integrations')) return 'INTEGRATION_CONFIGURE';

  // Generic action mappings
  switch (method) {
    case 'GET':
      return 'READ';
    case 'POST':
      return 'CREATE';
    case 'PUT':
    case 'PATCH':
      return 'UPDATE';
    case 'DELETE':
      return 'DELETE';
    default:
      return 'UNKNOWN';
  }
}

function getResourceTypeFromPath(path: string): string {
  if (path.includes('/controls')) return 'COMPLIANCE_CONTROL';
  if (path.includes('/compliance')) return 'COMPLIANCE_CHECK';
  if (path.includes('/remediation')) return 'REMEDIATION';
  if (path.includes('/reports')) return 'REPORT';
  if (path.includes('/settings')) return 'SETTINGS';
  if (path.includes('/integrations')) return 'INTEGRATION';
  if (path.includes('/dashboard')) return 'DASHBOARD';
  if (path.includes('/users')) return 'USER';
  return 'UNKNOWN';
}

function getResourceIdFromPath(path: string): string | null {
  // Extract ID from paths like /api/controls/123 or /api/reports/abc-def
  const segments = path.split('/');
  const lastSegment = segments[segments.length - 1];
  
  // Check if last segment looks like an ID (UUID, alphanumeric, etc.)
  if (lastSegment && lastSegment.length > 3 && !['generate', 'execute', 'check', 'confirm'].includes(lastSegment)) {
    return lastSegment;
  }
  
  return null;
}

function extractChanges(method: string, requestBody: any, responseBody: any): AuditChange[] {
  const changes: AuditChange[] = [];

  if (method === 'PUT' || method === 'PATCH') {
    // For updates, try to extract changes from request body
    if (requestBody && typeof requestBody === 'object') {
      Object.keys(requestBody).forEach(key => {
        if (key !== 'id' && key !== 'createdAt' && key !== 'updatedAt') {
          changes.push({
            property: key,
            oldValue: null, // We don't have the old value in this context
            newValue: requestBody[key],
          });
        }
      });
    }
  } else if (method === 'POST') {
    // For creates, capture the created data
    if (requestBody && typeof requestBody === 'object') {
      Object.keys(requestBody).forEach(key => {
        changes.push({
          property: key,
          oldValue: null,
          newValue: requestBody[key],
        });
      });
    }
  }

  return changes;
}

function getClientIp(req: Request): string {
  return (
    req.headers['x-forwarded-for'] as string ||
    req.headers['x-real-ip'] as string ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    'unknown'
  );
}