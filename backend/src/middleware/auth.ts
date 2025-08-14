import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    user_type: string;
  };
}

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (secret && secret.length > 0) {
    return secret;
  }
  // Provide a safe fallback only for non-production environments
  if ((process.env.NODE_ENV || 'development') !== 'production') {
    return 'dev-fallback-secret-change-me';
  }
  throw new Error('JWT_SECRET is not configured');
};

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required'
    });
  }

  try {
    const secret = getJwtSecret();

    const decoded = jwt.verify(token, secret) as any;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      user_type: decoded.user_type
    };
    next();
    return;
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
};

export const authorize = (allowedUserTypes: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    if (!allowedUserTypes.includes(req.user.user_type)) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
      });
      return;
    }

    next();
  };
};

export const requireConsultant = authorize(['consultant']);
export const requireClient = authorize(['client']);
export const requireAnyUser = authorize(['consultant', 'client']);

// Token generation function
export const generateToken = (user: any): string => {
  const secret = getJwtSecret();

  const payload = {
    id: user.id,
    email: user.email,
    user_type: user.user_type || 'client'
  };

  return jwt.sign(payload, secret, { expiresIn: '7d' });
}; 