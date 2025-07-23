import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { asyncHandler, createError, formatValidationError } from '@/middleware/error';
import { authMiddleware } from '@/middleware/auth';
import { AuthService } from '@/services/auth';
import { logger } from '@/utils/logger';

const router = Router();
const authService = new AuthService();

// Validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
  body('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required'),
  body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const refreshTokenValidation = [
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
];

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', registerValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError.unprocessableEntity('Validation failed', formatValidationError(errors.array()));
  }

  const { email, password, firstName, lastName, username } = req.body;

  try {
    const result = await authService.register({
      email,
      password,
      firstName,
      lastName,
      username,
    });

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email for verification.',
      data: result,
    });
  } catch (error) {
    if (error.message.includes('already exists')) {
      throw createError.conflict(error.message);
    }
    throw error;
  }
}));

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/login', loginValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError.unprocessableEntity('Validation failed', formatValidationError(errors.array()));
  }

  const { email, password, rememberMe } = req.body;

  try {
    const result = await authService.login({ email, password, rememberMe });

    logger.info(`User logged in: ${email}`);

    res.json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (error) {
    if (error.message.includes('Invalid credentials')) {
      throw createError.unauthorized('Invalid email or password');
    }
    throw error;
  }
}));

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', refreshTokenValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError.unprocessableEntity('Validation failed', formatValidationError(errors.array()));
  }

  const { refreshToken } = req.body;

  try {
    const result = await authService.refreshToken(refreshToken);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: result,
    });
  } catch (error) {
    throw createError.unauthorized(error.message);
  }
}));

/**
 * POST /api/auth/logout
 * Logout and invalidate tokens
 */
router.post('/logout', authMiddleware, asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (token) {
    await authService.logout(token);
  }

  logger.info(`User logged out: ${req.user?.email}`);

  res.json({
    success: true,
    message: 'Logout successful',
  });
}));

/**
 * POST /api/auth/verify-email
 * Verify email address with token
 */
router.post('/verify-email', asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    throw createError.badRequest('Verification token is required');
  }

  try {
    await authService.verifyEmail(token);

    res.json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    throw createError.badRequest(error.message);
  }
}));

/**
 * POST /api/auth/resend-verification
 * Resend email verification
 */
router.post('/resend-verification', asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw createError.badRequest('Email is required');
  }

  await authService.resendVerification(email);

  res.json({
    success: true,
    message: 'Verification email sent',
  });
}));

/**
 * POST /api/auth/forgot-password
 * Send password reset email
 */
router.post('/forgot-password', asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw createError.badRequest('Email is required');
  }

  await authService.forgotPassword(email);

  res.json({
    success: true,
    message: 'Password reset email sent if account exists',
  });
}));

/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
router.post('/reset-password', asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    throw createError.badRequest('Token and password are required');
  }

  if (password.length < 8) {
    throw createError.badRequest('Password must be at least 8 characters');
  }

  try {
    await authService.resetPassword(token, password);

    res.json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (error) {
    throw createError.badRequest(error.message);
  }
}));

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', authMiddleware, asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user!.id);

  res.json({
    success: true,
    data: user,
  });
}));

/**
 * PUT /api/auth/change-password
 * Change password for authenticated user
 */
router.put('/change-password', authMiddleware, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw createError.badRequest('Current password and new password are required');
  }

  if (newPassword.length < 8) {
    throw createError.badRequest('New password must be at least 8 characters');
  }

  try {
    await authService.changePassword(req.user!.id, currentPassword, newPassword);

    logger.info(`Password changed for user: ${req.user?.email}`);

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    if (error.message.includes('Invalid current password')) {
      throw createError.badRequest('Invalid current password');
    }
    throw error;
  }
}));

export default router;