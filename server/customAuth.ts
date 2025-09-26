import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { mongoStorage } from './mongoStorage';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';

// Middleware to authenticate JWT token
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      // Also check for token in cookies
      const cookieToken = req.cookies?.token;
      if (!cookieToken) {
        return res.status(401).json({ message: 'Access token required' });
      }
      req.user = await verifyToken(cookieToken);
    } else {
      req.user = await verifyToken(token);
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Helper function to verify JWT token
async function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Verify user still exists and is approved
    const user = await mongoStorage.getUser(decoded.userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    if (user.approvalStatus !== 'approved') {
      throw new Error('User not approved');
    }

    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };
  } catch (error) {
    throw new Error('Invalid token');
  }
}

// Middleware to check if user is admin
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  next();
};

// Middleware to check if user is super admin
export const requireSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ message: 'Super admin access required' });
  }

  next();
};

// Middleware to check if user has any of the specified roles
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Access denied. Required roles: ${roles.join(', ')}` });
    }

    next();
  };
};

// Generate JWT token
export function generateToken(userId: string, email: string, role: string): string {
  return jwt.sign(
    { userId, email, role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Optional middleware for routes that work with or without authentication
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      req.user = await verifyToken(token);
    } else {
      const cookieToken = req.cookies?.token;
      if (cookieToken) {
        req.user = await verifyToken(cookieToken);
      }
    }
  } catch (error) {
    // Continue without authentication for optional auth
  }
  
  next();
};