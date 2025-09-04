import { Router } from 'express';
import {
  register,
  login,
  refreshToken,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  changePassword,
  getMe,
  logout
} from '../controllers/authController';
import { protect, sensitiveOperation } from '../middleware/auth';
import { validate, userSchemas } from '../middleware/validation';

const router = Router();

// Public routes
router.post('/register', validate(userSchemas.register), register);
router.post('/login', validate(userSchemas.login), login);
router.post('/refresh-token', refreshToken);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', validate(userSchemas.forgotPassword), resendVerification);
router.post('/forgot-password', validate(userSchemas.forgotPassword), forgotPassword);
router.post('/reset-password/:token', validate(userSchemas.resetPassword), resetPassword);

// Protected routes
router.use(protect); // All routes below require authentication

router.get('/me', getMe);
router.post('/logout', logout);
router.post('/change-password', 
  sensitiveOperation,
  validate(userSchemas.changePassword), 
  changePassword
);

export default router;
