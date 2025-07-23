import { Router } from 'express';
import authRoutes from './auth';
import capsuleRoutes from './capsules';
import userRoutes from './users';
import mediaRoutes from './media';
import notificationRoutes from './notifications';

const router = Router();

// Health check for API routes
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'TimeCap API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/capsules', capsuleRoutes);
router.use('/users', userRoutes);
router.use('/media', mediaRoutes);
router.use('/notifications', notificationRoutes);

export { router as routes };