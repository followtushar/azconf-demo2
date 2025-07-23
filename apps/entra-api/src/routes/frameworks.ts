import { Router } from 'express';
import { ComplianceService } from '@/services/complianceService';
import { AuthenticatedRequest } from '@/middleware/auth';
import { logger } from '@/utils/logger';

const router = Router();
const complianceService = new ComplianceService();

// Get all frameworks - this is a duplicate of the compliance route, but kept for clarity
router.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    const frameworks = await complianceService.getAvailableFrameworks();
    res.json({
      success: true,
      data: frameworks
    });
  } catch (error) {
    logger.error('Error fetching frameworks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch frameworks'
    });
  }
});

export default router;