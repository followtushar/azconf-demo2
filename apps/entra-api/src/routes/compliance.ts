import { Router } from 'express';
import { ComplianceService } from '@/services/complianceService';
import { AuthenticatedRequest, requireRole } from '@/middleware/auth';
import { logger } from '@/utils/logger';
import { createError } from '@/middleware/errorHandler';

const router = Router();
const complianceService = new ComplianceService();

// Get all available frameworks
router.get('/frameworks', async (req: AuthenticatedRequest, res) => {
  try {
    const frameworks = await complianceService.getAvailableFrameworks();
    res.json({
      success: true,
      data: frameworks
    });
  } catch (error) {
    logger.error('Error fetching frameworks:', error);
    throw createError('Failed to fetch compliance frameworks', 500);
  }
});

// Get framework controls
router.get('/frameworks/:frameworkId/controls', async (req: AuthenticatedRequest, res) => {
  try {
    const { frameworkId } = req.params;
    const controls = await complianceService.getFrameworkControls(frameworkId);
    
    res.json({
      success: true,
      data: {
        frameworkId,
        controls
      }
    });
  } catch (error) {
    logger.error(`Error fetching controls for framework ${req.params.frameworkId}:`, error);
    throw createError('Failed to fetch framework controls', 500);
  }
});

// Evaluate framework compliance
router.post('/evaluate/:frameworkId', async (req: AuthenticatedRequest, res) => {
  try {
    const { frameworkId } = req.params;
    logger.info(`Starting compliance evaluation for framework: ${frameworkId}`, {
      userId: req.user?.id,
      tenantId: req.user?.tenantId
    });

    const report = await complianceService.evaluateFrameworkCompliance(frameworkId);
    
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    logger.error(`Error evaluating framework ${req.params.frameworkId}:`, error);
    throw createError('Failed to evaluate framework compliance', 500);
  }
});

// Confirm control status manually
router.post('/controls/:frameworkId/:controlId/confirm', 
  requireRole(['Admin', 'Compliance Officer']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { frameworkId, controlId } = req.params;
      const { confirmed, justification } = req.body;

      if (typeof confirmed !== 'boolean') {
        throw createError('Confirmed status must be a boolean', 400);
      }

      const controlStatus = await complianceService.confirmControl(
        frameworkId,
        controlId,
        confirmed,
        req.user!.email,
        justification
      );

      logger.info(`Control ${controlId} manually confirmed`, {
        frameworkId,
        controlId,
        confirmed,
        confirmedBy: req.user?.email
      });

      res.json({
        success: true,
        data: controlStatus
      });
    } catch (error) {
      logger.error(`Error confirming control ${req.params.controlId}:`, error);
      throw error;
    }
  }
);

// Get compliance summary for multiple frameworks
router.post('/summary', async (req: AuthenticatedRequest, res) => {
  try {
    const { frameworkIds } = req.body;

    if (!Array.isArray(frameworkIds) || frameworkIds.length === 0) {
      throw createError('Framework IDs must be a non-empty array', 400);
    }

    const summaries = await Promise.all(
      frameworkIds.map(async (frameworkId: string) => {
        try {
          const report = await complianceService.evaluateFrameworkCompliance(frameworkId);
          return {
            frameworkId: report.frameworkId,
            frameworkName: report.frameworkName,
            overallScore: report.overallScore,
            totalControls: report.totalControls,
            passedControls: report.passedControls,
            failedControls: report.failedControls,
            notConfiguredControls: report.notConfiguredControls,
            manualReviewControls: report.manualReviewControls
          };
        } catch (error) {
          logger.error(`Error evaluating framework ${frameworkId}:`, error);
          return {
            frameworkId,
            error: 'Failed to evaluate framework'
          };
        }
      })
    );

    res.json({
      success: true,
      data: {
        summaries,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    logger.error('Error generating compliance summary:', error);
    throw error;
  }
});

// Get control recommendations
router.get('/controls/:frameworkId/:controlId/recommendations', 
  async (req: AuthenticatedRequest, res) => {
    try {
      const { frameworkId, controlId } = req.params;
      
      // Get the full evaluation to extract recommendations
      const report = await complianceService.evaluateFrameworkCompliance(frameworkId);
      const controlStatus = report.controlStatuses.find(c => c.controlId === controlId);

      if (!controlStatus) {
        throw createError('Control not found', 404);
      }

      res.json({
        success: true,
        data: {
          controlId,
          frameworkId,
          status: controlStatus.status,
          score: controlStatus.score,
          recommendations: controlStatus.recommendations || [],
          evidence: controlStatus.evidence
        }
      });
    } catch (error) {
      logger.error(`Error fetching recommendations for control ${req.params.controlId}:`, error);
      throw error;
    }
  }
);

export default router;