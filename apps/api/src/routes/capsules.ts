import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth';
import { asyncHandler } from '@/middleware/error';

const router = Router();

// All capsule routes require authentication
router.use(authMiddleware);

/**
 * GET /api/capsules
 * Get user's capsules
 */
router.get('/', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Capsules endpoint - coming soon',
    data: [],
  });
}));

/**
 * POST /api/capsules
 * Create a new capsule
 */
router.post('/', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Create capsule endpoint - coming soon',
  });
}));

/**
 * GET /api/capsules/:id
 * Get specific capsule
 */
router.get('/:id', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Get capsule endpoint - coming soon',
  });
}));

/**
 * PUT /api/capsules/:id
 * Update capsule
 */
router.put('/:id', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Update capsule endpoint - coming soon',
  });
}));

/**
 * DELETE /api/capsules/:id
 * Delete capsule
 */
router.delete('/:id', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Delete capsule endpoint - coming soon',
  });
}));

export default router;