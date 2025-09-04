import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { config } from '../config/config';
import { AppError } from '../types';

interface AuthRequest extends Request {
  user?: any;
}

// Protect routes - require authentication
export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Access denied. No token provided.', 401));
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, config.JWT_SECRET) as any;
      
      // Get user from database
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return next(new AppError('User not found. Token invalid.', 401));
      }

      // Check if user is verified
      if (!user.isVerified) {
        return next(new AppError('Please verify your email to access this resource.', 401));
      }

      // Add user to request object
      req.user = user;
      next();
    } catch (error) {
      return next(new AppError('Invalid token.', 401));
    }
  } catch (error) {
    next(error);
  }
};

// Optional authentication - don't require token but add user if present
export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, config.JWT_SECRET) as any;
        const user = await User.findById(decoded.id).select('-password');
        if (user && user.isVerified) {
          req.user = user;
        }
      } catch (error) {
        // Invalid token, but continue without user
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Restrict to specific roles
export const restrictTo = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Access denied. Authentication required.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Access denied. Insufficient permissions.', 403));
    }

    next();
  };
};

// Verify email token
export const verifyEmailToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params;

    if (!token) {
      return next(new AppError('Verification token is required.', 400));
    }

    // Find user with verification token
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return next(new AppError('Invalid or expired verification token.', 400));
    }

    // Verify user
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully. You can now log in.'
    });
  } catch (error) {
    next(error);
  }
};

// Verify reset password token
export const verifyResetToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params;

    if (!token) {
      return next(new AppError('Reset token is required.', 400));
    }

    // Find user with reset token and check expiry
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return next(new AppError('Invalid or expired reset token.', 400));
    }

    // Add user to request for next middleware
    (req as any).user = user;
    next();
  } catch (error) {
    next(error);
  }
};

// Check if user owns resource
export const checkOwnership = (resourceField: string = 'user') => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new AppError('Authentication required.', 401));
      }

      // Admin can access all resources
      if (req.user.role === 'admin') {
        return next();
      }

      // Get resource ID from params or body
      const resourceId = req.params.id || req.body.id;
      if (!resourceId) {
        return next(new AppError('Resource ID is required.', 400));
      }

      // For user resources, check if user owns the resource
      if (resourceField === 'user') {
        if (req.user._id.toString() !== resourceId) {
          return next(new AppError('Access denied. You can only access your own resources.', 403));
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Rate limiting for sensitive operations
export const sensitiveOperation = (req: AuthRequest, res: Response, next: NextFunction) => {
  // This would typically integrate with Redis for distributed rate limiting
  // For now, we'll use a simple in-memory approach
  const userOperations = (global as any).userOperations || {};
  const userId = req.user?._id?.toString();
  
  if (!userId) {
    return next(new AppError('Authentication required.', 401));
  }

  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxOperations = 5;

  if (!userOperations[userId]) {
    userOperations[userId] = [];
  }

  // Clean old operations
  userOperations[userId] = userOperations[userId].filter(
    (timestamp: number) => now - timestamp < windowMs
  );

  if (userOperations[userId].length >= maxOperations) {
    return next(new AppError('Too many sensitive operations. Please try again later.', 429));
  }

  userOperations[userId].push(now);
  (global as any).userOperations = userOperations;

  next();
};
