import { Router } from 'express';
import { ComplianceService } from '@/services/complianceService';
import { GraphService } from '@/services/graphService';
import { AuthenticatedRequest } from '@/middleware/auth';
import { logger } from '@/utils/logger';
import { createError } from '@/middleware/errorHandler';

const router = Router();
const complianceService = new ComplianceService();
const graphService = new GraphService();

// Get dashboard overview
router.get('/overview', async (req: AuthenticatedRequest, res) => {
  try {
    logger.info('Fetching dashboard overview', { userId: req.user?.id });

    // Get all available frameworks
    const frameworks = await complianceService.getAvailableFrameworks();
    
    // Get quick compliance summary for key frameworks
    const keyFrameworks = ['nist-sp-800-53', 'iso-27001', 'cis-microsoft-365'];
    const complianceSummaries = await Promise.all(
      keyFrameworks.map(async (frameworkId) => {
        try {
          const report = await complianceService.evaluateFrameworkCompliance(frameworkId);
          return {
            frameworkId: report.frameworkId,
            frameworkName: report.frameworkName,
            overallScore: report.overallScore,
            totalControls: report.totalControls,
            passedControls: report.passedControls,
            failedControls: report.failedControls,
            notConfiguredControls: report.notConfiguredControls
          };
        } catch (error) {
          logger.warn(`Failed to evaluate framework ${frameworkId}:`, error);
          return null;
        }
      })
    );

    // Filter out failed evaluations
    const validSummaries = complianceSummaries.filter(s => s !== null);

    // Calculate overall metrics
    const totalControls = validSummaries.reduce((sum, s) => sum + s!.totalControls, 0);
    const totalPassed = validSummaries.reduce((sum, s) => sum + s!.passedControls, 0);
    const totalFailed = validSummaries.reduce((sum, s) => sum + s!.failedControls, 0);
    const totalNotConfigured = validSummaries.reduce((sum, s) => sum + s!.notConfiguredControls, 0);

    const overallComplianceScore = totalControls > 0 
      ? Math.round((totalPassed / totalControls) * 100)
      : 0;

    // Get recent activity (mock data for now)
    const recentActivity = [
      {
        id: '1',
        type: 'compliance_check',
        message: 'NIST SP 800-53 compliance evaluation completed',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        status: 'completed'
      },
      {
        id: '2',
        type: 'control_confirmation',
        message: 'Control AC-2 manually confirmed for ISO 27001',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        status: 'completed'
      },
      {
        id: '3',
        type: 'policy_update',
        message: 'Conditional Access policy updated',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        status: 'info'
      }
    ];

    // Get security alerts (mock data)
    const securityAlerts = [
      {
        id: '1',
        severity: 'high',
        title: 'MFA not enforced for all users',
        description: 'Some users do not have multi-factor authentication enabled',
        affectedFrameworks: ['nist-sp-800-53', 'cis-microsoft-365'],
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
      },
      {
        id: '2',
        severity: 'medium',
        title: 'Privileged access review overdue',
        description: 'Privileged role assignments have not been reviewed in 90 days',
        affectedFrameworks: ['iso-27001'],
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
      }
    ];

    res.json({
      success: true,
      data: {
        overview: {
          totalFrameworks: frameworks.length,
          overallComplianceScore,
          totalControls,
          passedControls: totalPassed,
          failedControls: totalFailed,
          notConfiguredControls: totalNotConfigured
        },
        frameworkSummaries: validSummaries,
        recentActivity,
        securityAlerts,
        lastUpdated: new Date()
      }
    });
  } catch (error) {
    logger.error('Error fetching dashboard overview:', error);
    throw createError('Failed to fetch dashboard overview', 500);
  }
});

// Get compliance trends (mock data for now)
router.get('/trends', async (req: AuthenticatedRequest, res) => {
  try {
    const { period = '30d' } = req.query;

    // Mock trend data - in a real implementation, this would come from historical data
    const trendData = {
      '7d': [
        { date: '2024-01-01', score: 75 },
        { date: '2024-01-02', score: 76 },
        { date: '2024-01-03', score: 78 },
        { date: '2024-01-04', score: 77 },
        { date: '2024-01-05', score: 79 },
        { date: '2024-01-06', score: 81 },
        { date: '2024-01-07', score: 82 }
      ],
      '30d': Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        score: Math.floor(75 + Math.random() * 15 + (i * 0.3))
      })),
      '90d': Array.from({ length: 90 }, (_, i) => ({
        date: new Date(Date.now() - (89 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        score: Math.floor(70 + Math.random() * 20 + (i * 0.15))
      }))
    };

    const data = trendData[period as keyof typeof trendData] || trendData['30d'];

    res.json({
      success: true,
      data: {
        period,
        trends: data,
        summary: {
          currentScore: data[data.length - 1]?.score || 0,
          previousScore: data[data.length - 2]?.score || 0,
          change: (data[data.length - 1]?.score || 0) - (data[data.length - 2]?.score || 0),
          trend: 'improving' // Could be 'improving', 'declining', or 'stable'
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching compliance trends:', error);
    throw createError('Failed to fetch compliance trends', 500);
  }
});

// Get control distribution by status
router.get('/control-distribution', async (req: AuthenticatedRequest, res) => {
  try {
    const { frameworkIds } = req.query;
    let frameworks = ['nist-sp-800-53', 'iso-27001', 'cis-microsoft-365'];

    if (frameworkIds && typeof frameworkIds === 'string') {
      frameworks = frameworkIds.split(',');
    }

    const distributions = await Promise.all(
      frameworks.map(async (frameworkId) => {
        try {
          const report = await complianceService.evaluateFrameworkCompliance(frameworkId);
          return {
            frameworkId: report.frameworkId,
            frameworkName: report.frameworkName,
            distribution: {
              passed: report.passedControls,
              failed: report.failedControls,
              notConfigured: report.notConfiguredControls,
              manualReview: report.manualReviewControls
            }
          };
        } catch (error) {
          logger.warn(`Failed to get distribution for framework ${frameworkId}:`, error);
          return null;
        }
      })
    );

    const validDistributions = distributions.filter(d => d !== null);

    res.json({
      success: true,
      data: {
        distributions: validDistributions,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    logger.error('Error fetching control distribution:', error);
    throw createError('Failed to fetch control distribution', 500);
  }
});

// Get top recommendations
router.get('/recommendations', async (req: AuthenticatedRequest, res) => {
  try {
    const { limit = 10 } = req.query;

    // Get recommendations from multiple frameworks
    const frameworks = ['nist-sp-800-53', 'iso-27001', 'cis-microsoft-365'];
    const allRecommendations: any[] = [];

    for (const frameworkId of frameworks) {
      try {
        const report = await complianceService.evaluateFrameworkCompliance(frameworkId);
        
        report.controlStatuses.forEach(control => {
          if (control.recommendations && control.recommendations.length > 0) {
            control.recommendations.forEach(recommendation => {
              allRecommendations.push({
                controlId: control.controlId,
                frameworkId: control.frameworkId,
                recommendation,
                priority: control.status === 'failed' ? 'high' : 'medium',
                score: control.score
              });
            });
          }
        });
      } catch (error) {
        logger.warn(`Failed to get recommendations for framework ${frameworkId}:`, error);
      }
    }

    // Sort by priority and score
    const sortedRecommendations = allRecommendations
      .sort((a, b) => {
        if (a.priority === 'high' && b.priority !== 'high') return -1;
        if (b.priority === 'high' && a.priority !== 'high') return 1;
        return a.score - b.score; // Lower scores (worse compliance) first
      })
      .slice(0, Number(limit));

    res.json({
      success: true,
      data: {
        recommendations: sortedRecommendations,
        totalCount: allRecommendations.length,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    logger.error('Error fetching recommendations:', error);
    throw createError('Failed to fetch recommendations', 500);
  }
});

export default router;