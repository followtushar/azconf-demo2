import { Router } from 'express';
import { ComplianceService } from '@/services/complianceService';
import { AuthenticatedRequest, requireRole } from '@/middleware/auth';
import { logger } from '@/utils/logger';
import { createError } from '@/middleware/errorHandler';

const router = Router();
const complianceService = new ComplianceService();

// Get controls for a specific framework
router.get('/:frameworkId', async (req: AuthenticatedRequest, res) => {
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
    throw createError('Failed to fetch controls', 500);
  }
});

// Confirm a control manually
router.post('/:frameworkId/:controlId/confirm', 
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

export default router;