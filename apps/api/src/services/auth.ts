import { User } from '@prisma/client';
import { db } from '@/config/database';
import { cache, Cache } from '@/config/redis';
import { JWT } from '@/utils/jwt';
import { Encryption } from '@/utils/encryption';
import { logger } from '@/utils/logger';
import { EmailService } from './email';
import { createError } from '@/middleware/error';
import type {
  RegisterRequest,
  LoginRequest,
  AuthTokens,
  User as UserType,
} from '@timecap/types';

export class AuthService {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<{ user: Partial<UserType>; message: string }> {
    const { email, password, firstName, lastName, username } = data;

    // Check if user already exists
    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { email },
          { username },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new Error('User with this email already exists');
      }
      if (existingUser.username === username) {
        throw new Error('Username already taken');
      }
    }

    // Hash password
    const hashedPassword = await Encryption.hashPassword(password);

    // Create user
    const user = await db.user.create({
      data: {
        email,
        username,
        firstName,
        lastName,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });

    // Send verification email
    await this.sendVerificationEmail(user.email);

    logger.info(`User registered: ${user.email}`);

    return {
      user,
      message: 'Registration successful. Please check your email for verification.',
    };
  }

  /**
   * Login user with email and password
   */
  async login(data: LoginRequest): Promise<{ user: Partial<UserType>; tokens: AuthTokens }> {
    const { email, password } = data;

    // Find user
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await Encryption.verifyPassword(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Account is inactive');
    }

    // Generate tokens
    const tokens = JWT.generateTokenPair({
      userId: user.id,
      email: user.email,
    });

    // Save session
    await db.session.create({
      data: {
        userId: user.id,
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: new Date(Date.now() + tokens.expiresIn * 1000),
      },
    });

    // Update last login
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Cache user
    const cacheKey = Cache.keys.user(user.id);
    await cache.set(cacheKey, {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      isEmailVerified: user.isEmailVerified,
      isActive: user.isActive,
    }, 300);

    logger.info(`User logged in: ${user.email}`);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        isEmailVerified: user.isEmailVerified,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt,
      },
      tokens,
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      // Verify refresh token
      const decoded = JWT.verifyRefreshToken(refreshToken);

      // Check if session exists
      const session = await db.session.findUnique({
        where: { refreshToken },
        include: { user: true },
      });

      if (!session || !session.user.isActive) {
        throw new Error('Invalid refresh token');
      }

      // Generate new tokens
      const tokens = JWT.generateTokenPair({
        userId: session.user.id,
        email: session.user.email,
      });

      // Update session
      await db.session.update({
        where: { id: session.id },
        data: {
          token: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: new Date(Date.now() + tokens.expiresIn * 1000),
          lastUsedAt: new Date(),
        },
      });

      return tokens;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Logout user and invalidate tokens
   */
  async logout(token: string): Promise<void> {
    try {
      // Find and delete session
      await db.session.deleteMany({
        where: { token },
      });

      // Remove from cache if exists
      const decoded = JWT.decode(token);
      if (decoded) {
        const cacheKey = Cache.keys.user(decoded.userId);
        await cache.del(cacheKey);
      }
    } catch (error) {
      logger.error('Logout error:', error);
    }
  }

  /**
   * Send email verification
   */
  async sendVerificationEmail(email: string): Promise<void> {
    const token = Encryption.generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Save verification token
    await db.emailVerification.create({
      data: {
        email,
        token,
        expiresAt,
      },
    });

    // Send email
    await this.emailService.sendVerificationEmail(email, token);
  }

  /**
   * Verify email address
   */
  async verifyEmail(token: string): Promise<void> {
    const verification = await db.emailVerification.findUnique({
      where: { token },
    });

    if (!verification) {
      throw new Error('Invalid verification token');
    }

    if (verification.expiresAt < new Date()) {
      throw new Error('Verification token expired');
    }

    // Update user
    await db.user.update({
      where: { email: verification.email },
      data: {
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    // Delete verification token
    await db.emailVerification.delete({
      where: { token },
    });
  }

  /**
   * Resend verification email
   */
  async resendVerification(email: string): Promise<void> {
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists
      return;
    }

    if (user.isEmailVerified) {
      throw new Error('Email already verified');
    }

    // Delete existing verification tokens
    await db.emailVerification.deleteMany({
      where: { email },
    });

    // Send new verification email
    await this.sendVerificationEmail(email);
  }

  /**
   * Send password reset email
   */
  async forgotPassword(email: string): Promise<void> {
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists
      return;
    }

    const token = Encryption.generateToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save reset token
    await db.passwordReset.create({
      data: {
        email,
        token,
        expiresAt,
      },
    });

    // Send email
    await this.emailService.sendPasswordResetEmail(email, token);
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const reset = await db.passwordReset.findUnique({
      where: { token },
    });

    if (!reset || reset.usedAt) {
      throw new Error('Invalid reset token');
    }

    if (reset.expiresAt < new Date()) {
      throw new Error('Reset token expired');
    }

    // Hash new password
    const hashedPassword = await Encryption.hashPassword(newPassword);

    // Update user password
    await db.user.update({
      where: { email: reset.email },
      data: { password: hashedPassword },
    });

    // Mark token as used
    await db.passwordReset.update({
      where: { token },
      data: { usedAt: new Date() },
    });

    // Invalidate all sessions for this user
    const user = await db.user.findUnique({
      where: { email: reset.email },
    });

    if (user) {
      await db.session.deleteMany({
        where: { userId: user.id },
      });

      // Clear cache
      const cacheKey = Cache.keys.user(user.id);
      await cache.del(cacheKey);
    }
  }

  /**
   * Change password for authenticated user
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.password) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValidPassword = await Encryption.verifyPassword(currentPassword, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid current password');
    }

    // Hash new password
    const hashedPassword = await Encryption.hashPassword(newPassword);

    // Update password
    await db.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Invalidate all sessions except current one
    await db.session.deleteMany({
      where: { userId },
    });

    // Clear cache
    const cacheKey = Cache.keys.user(userId);
    await cache.del(cacheKey);
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(userId: string): Promise<Partial<UserType>> {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        profilePicture: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
        timezone: true,
        theme: true,
        language: true,
        emailNotifications: true,
        smsNotifications: true,
        pushNotifications: true,
        reminderDays: true,
        defaultVisibility: true,
        allowDiscovery: true,
        showActivity: true,
      },
    });

    if (!user) {
      throw createError.notFound('User not found');
    }

    return user;
  }
}