import { Router } from 'express';
import { ComplianceService } from '@/services/complianceService';
import { AuthenticatedRequest } from '@/middleware/auth';
import { logger } from '@/utils/logger';
import { createError } from '@/middleware/errorHandler';

const router = Router();
const complianceService = new ComplianceService();

// Generate compliance report for a framework
router.post('/generate/:frameworkId', async (req: AuthenticatedRequest, res) => {
  try {
    const { frameworkId } = req.params;
    const { format = 'json' } = req.body;

    logger.info(`Generating ${format} report for framework: ${frameworkId}`, {
      userId: req.user?.id
    });

    const report = await complianceService.evaluateFrameworkCompliance(frameworkId);

    if (format === 'json') {
      res.json({
        success: true,
        data: report
      });
    } else {
      // For other formats, we would implement PDF/Excel generation here
      throw createError(`Report format ${format} not yet implemented`, 400);
    }
  } catch (error) {
    logger.error(`Error generating report for framework ${req.params.frameworkId}:`, error);
    throw error;
  }
});

// Generate summary report for multiple frameworks
router.post('/summary', async (req: AuthenticatedRequest, res) => {
  try {
    const { frameworkIds, format = 'json' } = req.body;

    if (!Array.isArray(frameworkIds) || frameworkIds.length === 0) {
      throw createError('Framework IDs must be a non-empty array', 400);
    }

    logger.info(`Generating summary report for frameworks: ${frameworkIds.join(', ')}`, {
      userId: req.user?.id
    });

    const reports = await Promise.all(
      frameworkIds.map(async (frameworkId: string) => {
        try {
          return await complianceService.evaluateFrameworkCompliance(frameworkId);
        } catch (error) {
          logger.error(`Error evaluating framework ${frameworkId}:`, error);
          return null;
        }
      })
    );

    const validReports = reports.filter(r => r !== null);

    if (format === 'json') {
      res.json({
        success: true,
        data: {
          reports: validReports,
          summary: {
            totalFrameworks: validReports.length,
            averageScore: Math.round(
              validReports.reduce((sum, r) => sum + r!.overallScore, 0) / validReports.length
            ),
            totalControls: validReports.reduce((sum, r) => sum + r!.totalControls, 0),
            totalPassed: validReports.reduce((sum, r) => sum + r!.passedControls, 0),
            totalFailed: validReports.reduce((sum, r) => sum + r!.failedControls, 0)
          },
          generatedAt: new Date(),
          generatedBy: req.user?.email
        }
      });
    } else {
      throw createError(`Report format ${format} not yet implemented`, 400);
    }
  } catch (error) {
    logger.error('Error generating summary report:', error);
    throw error;
  }
});

export default router;