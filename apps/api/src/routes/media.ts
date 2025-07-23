import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth';
import { asyncHandler } from '@/middleware/error';

const router = Router();

// All media routes require authentication
router.use(authMiddleware);

/**
 * POST /api/media/upload
 * Upload media files
 */
router.post('/upload', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Media upload endpoint - coming soon',
  });
}));

/**
 * GET /api/media/:id
 * Get media file
 */
router.get('/:id', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Get media endpoint - coming soon',
  });
}));

/**
 * DELETE /api/media/:id
 * Delete media file
 */
router.delete('/:id', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Delete media endpoint - coming soon',
  });
}));

export default router;