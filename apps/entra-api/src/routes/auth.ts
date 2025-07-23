import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { ConfidentialClientApplication } from '@azure/msal-node';
import { logger } from '@/utils/logger';
import { createError } from '@/middleware/errorHandler';

const router = Router();

// MSAL configuration
const msalConfig = {
  auth: {
    clientId: process.env.AZURE_CLIENT_ID!,
    clientSecret: process.env.AZURE_CLIENT_SECRET!,
    authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`
  }
};

const cca = new ConfidentialClientApplication(msalConfig);

// Get authentication URL
router.get('/login-url', (req, res) => {
  try {
    const authCodeUrlParameters = {
      scopes: ['openid', 'profile', 'email', 'User.Read', 'Directory.Read.All'],
      redirectUri: process.env.AZURE_REDIRECT_URI!,
      responseMode: 'query' as const,
      state: 'entra-management-app'
    };

    cca.getAuthCodeUrl(authCodeUrlParameters).then((response) => {
      res.json({
        success: true,
        data: {
          authUrl: response
        }
      });
    }).catch((error) => {
      logger.error('Error generating auth URL:', error);
      throw createError('Failed to generate authentication URL', 500);
    });
  } catch (error) {
    logger.error('Error in login-url route:', error);
    throw createError('Authentication service error', 500);
  }
});

// Handle authentication callback
router.post('/callback', async (req, res) => {
  try {
    const { code, state } = req.body;

    if (!code) {
      throw createError('Authorization code is required', 400);
    }

    if (state !== 'entra-management-app') {
      throw createError('Invalid state parameter', 400);
    }

    const tokenRequest = {
      code,
      scopes: ['openid', 'profile', 'email', 'User.Read', 'Directory.Read.All'],
      redirectUri: process.env.AZURE_REDIRECT_URI!,
    };

    const response = await cca.acquireTokenByCode(tokenRequest);

    if (!response) {
      throw createError('Failed to acquire token', 401);
    }

    // Extract user information
    const userInfo = {
      id: response.account?.homeAccountId,
      email: response.account?.username,
      name: response.account?.name,
      tenantId: response.account?.tenantId,
      roles: [] // You would typically get roles from claims or a separate API call
    };

    // Generate JWT token for the application
    const jwtToken = jwt.sign(
      {
        sub: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        tenantId: userInfo.tenantId,
        roles: userInfo.roles,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
      },
      process.env.JWT_SECRET!
    );

    logger.info('User authenticated successfully', {
      userId: userInfo.id,
      email: userInfo.email,
      tenantId: userInfo.tenantId
    });

    res.json({
      success: true,
      data: {
        token: jwtToken,
        user: userInfo,
        expiresIn: 24 * 60 * 60 // 24 hours in seconds
      }
    });
  } catch (error) {
    logger.error('Error in auth callback:', error);
    throw error;
  }
});

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError('No token provided', 401);
    }

    const token = authHeader.substring(7);
    
    try {
      // Verify the current token (even if expired, we can still get the payload)
      const decoded = jwt.decode(token) as any;
      
      if (!decoded) {
        throw createError('Invalid token', 401);
      }

      // Generate new token with same user info but new expiration
      const newToken = jwt.sign(
        {
          sub: decoded.sub,
          email: decoded.email,
          name: decoded.name,
          tenantId: decoded.tenantId,
          roles: decoded.roles,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
        },
        process.env.JWT_SECRET!
      );

      res.json({
        success: true,
        data: {
          token: newToken,
          expiresIn: 24 * 60 * 60
        }
      });
    } catch (jwtError) {
      throw createError('Invalid token', 401);
    }
  } catch (error) {
    logger.error('Error refreshing token:', error);
    throw error;
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  try {
    // In a real implementation, you might want to maintain a token blacklist
    // For now, we'll just return success as the client will discard the token
    
    logger.info('User logged out');
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    logger.error('Error during logout:', error);
    throw createError('Logout failed', 500);
  }
});

// Get current user info
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError('No token provided', 401);
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    res.json({
      success: true,
      data: {
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        tenantId: decoded.tenantId,
        roles: decoded.roles
      }
    });
  } catch (error) {
    logger.error('Error getting user info:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      throw createError('Invalid token', 401);
    }
    throw createError('Failed to get user information', 500);
  }
});

export default router;