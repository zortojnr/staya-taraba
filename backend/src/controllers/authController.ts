import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { User } from '../models/User';
import { AppError, ApiResponse } from '../types';
import { catchAsync } from '../middleware/errorHandler';
import { sendEmail } from '../services/emailService';
import { config } from '../config/config';

interface AuthRequest extends Request {
  user?: any;
}

// Register new user
export const register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, phone } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('User with this email already exists', 400));
  }

  // Generate verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    phone,
    verificationToken
  });

  // Send verification email
  try {
    await sendEmail({
      to: email,
      subject: 'Verify Your STAYA Account',
      template: 'verification',
      data: {
        name,
        verificationUrl: `${config.FRONTEND_URL}/verify-email/${verificationToken}`
      }
    });
  } catch (error) {
    console.error('Failed to send verification email:', error);
    // Don't fail registration if email fails
  }

  const response: ApiResponse = {
    success: true,
    message: 'Registration successful. Please check your email to verify your account.',
    data: {
      user: user.profile
    }
  };

  res.status(201).json(response);
});

// Login user
export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  // Find user and include password
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Invalid email or password', 401));
  }

  // Check if user is verified
  if (!user.isVerified) {
    return next(new AppError('Please verify your email before logging in', 401));
  }

  // Generate tokens
  const token = user.generateAuthToken();
  const refreshToken = user.generateRefreshToken();

  const response: ApiResponse = {
    success: true,
    message: 'Login successful',
    data: {
      user: user.profile,
      token,
      refreshToken
    }
  };

  res.status(200).json(response);
});

// Refresh token
export const refreshToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new AppError('Refresh token is required', 400));
  }

  try {
    const decoded = require('jsonwebtoken').verify(refreshToken, config.JWT_REFRESH_SECRET) as any;
    
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    const newToken = user.generateAuthToken();
    const newRefreshToken = user.generateRefreshToken();

    const response: ApiResponse = {
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    };

    res.status(200).json(response);
  } catch (error) {
    return next(new AppError('Invalid refresh token', 401));
  }
});

// Verify email
export const verifyEmail = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.params;

  const user = await User.findOne({ verificationToken: token });
  if (!user) {
    return next(new AppError('Invalid or expired verification token', 400));
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  await user.save();

  const response: ApiResponse = {
    success: true,
    message: 'Email verified successfully. You can now log in.'
  };

  res.status(200).json(response);
});

// Resend verification email
export const resendVerification = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (user.isVerified) {
    return next(new AppError('User is already verified', 400));
  }

  // Generate new verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  user.verificationToken = verificationToken;
  await user.save();

  // Send verification email
  try {
    await sendEmail({
      to: email,
      subject: 'Verify Your STAYA Account',
      template: 'verification',
      data: {
        name: user.name,
        verificationUrl: `${config.FRONTEND_URL}/verify-email/${verificationToken}`
      }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Verification email sent successfully'
    };

    res.status(200).json(response);
  } catch (error) {
    return next(new AppError('Failed to send verification email', 500));
  }
});

// Forgot password
export const forgotPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  await user.save();

  // Send reset email
  try {
    await sendEmail({
      to: email,
      subject: 'Reset Your STAYA Password',
      template: 'passwordReset',
      data: {
        name: user.name,
        resetUrl: `${config.FRONTEND_URL}/reset-password/${resetToken}`
      }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Password reset email sent successfully'
    };

    res.status(200).json(response);
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    
    return next(new AppError('Failed to send password reset email', 500));
  }
});

// Reset password
export const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.params;
  const { password } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError('Invalid or expired reset token', 400));
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  const response: ApiResponse = {
    success: true,
    message: 'Password reset successfully'
  };

  res.status(200).json(response);
});

// Change password (authenticated user)
export const changePassword = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Check current password
  if (!(await user.comparePassword(currentPassword))) {
    return next(new AppError('Current password is incorrect', 400));
  }

  user.password = newPassword;
  await user.save();

  const response: ApiResponse = {
    success: true,
    message: 'Password changed successfully'
  };

  res.status(200).json(response);
});

// Get current user
export const getMe = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const response: ApiResponse = {
    success: true,
    message: 'User profile retrieved successfully',
    data: {
      user: req.user.profile
    }
  };

  res.status(200).json(response);
});

// Logout (client-side token removal)
export const logout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const response: ApiResponse = {
    success: true,
    message: 'Logged out successfully'
  };

  res.status(200).json(response);
});
