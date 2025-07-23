import jwt from 'jsonwebtoken';
import { config } from '@/config';
import { logger } from './logger';

export interface JWTPayload {
  userId: string;
  email: string;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

export class JWT {
  /**
   * Generate an access token
   */
  static generateAccessToken(payload: { userId: string; email: string }): string {
    try {
      return jwt.sign(
        {
          ...payload,
          type: 'access',
        },
        config.jwt.secret,
        {
          expiresIn: config.jwt.expiresIn,
          issuer: 'timecap-api',
          audience: 'timecap-client',
        }
      );
    } catch (error) {
      logger.error('Failed to generate access token:', error);
      throw new Error('Token generation failed');
    }
  }

  /**
   * Generate a refresh token
   */
  static generateRefreshToken(payload: { userId: string; email: string }): string {
    try {
      return jwt.sign(
        {
          ...payload,
          type: 'refresh',
        },
        config.jwt.refreshSecret,
        {
          expiresIn: config.jwt.refreshExpiresIn,
          issuer: 'timecap-api',
          audience: 'timecap-client',
        }
      );
    } catch (error) {
      logger.error('Failed to generate refresh token:', error);
      throw new Error('Token generation failed');
    }
  }

  /**
   * Generate both access and refresh tokens
   */
  static generateTokenPair(payload: { userId: string; email: string }) {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
      expiresIn: this.getExpirationTime(config.jwt.expiresIn),
    };
  }

  /**
   * Verify an access token
   */
  static verifyAccessToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, config.jwt.secret, {
        issuer: 'timecap-api',
        audience: 'timecap-client',
      }) as JWTPayload;

      if (decoded.type !== 'access') {
        throw new Error('Invalid token type');
      }

      return decoded;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expired');
      }
      throw error;
    }
  }

  /**
   * Verify a refresh token
   */
  static verifyRefreshToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, config.jwt.refreshSecret, {
        issuer: 'timecap-api',
        audience: 'timecap-client',
      }) as JWTPayload;

      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      return decoded;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid refresh token');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token expired');
      }
      throw error;
    }
  }

  /**
   * Decode token without verification (for debugging)
   */
  static decode(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get token expiration time in seconds
   */
  static getExpirationTime(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 3600; // Default 1 hour

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 3600;
      case 'd': return value * 86400;
      default: return 3600;
    }
  }

  /**
   * Check if token is expired
   */
  static isExpired(token: string): boolean {
    try {
      const decoded = this.decode(token);
      if (!decoded || !decoded.exp) return true;
      
      return Date.now() >= decoded.exp * 1000;
    } catch (error) {
      return true;
    }
  }

  /**
   * Get time until token expires (in seconds)
   */
  static getTimeUntilExpiry(token: string): number {
    try {
      const decoded = this.decode(token);
      if (!decoded || !decoded.exp) return 0;
      
      const expiryTime = decoded.exp * 1000;
      const now = Date.now();
      
      return Math.max(0, Math.floor((expiryTime - now) / 1000));
    } catch (error) {
      return 0;
    }
  }

  /**
   * Extract token from Authorization header
   */
  static extractFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) return null;
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
    
    return parts[1];
  }
}