import { Router } from 'express';
import { protect, restrictTo } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(protect);

// User profile routes
router.get('/profile', (req, res) => {
  res.json({ message: 'Get user profile - TODO' });
});

router.put('/profile', (req, res) => {
  res.json({ message: 'Update user profile - TODO' });
});

// Admin only routes
router.use(restrictTo('admin'));

router.get('/', (req, res) => {
  res.json({ message: 'Get all users - TODO' });
});

router.get('/:id', (req, res) => {
  res.json({ message: 'Get user by ID - TODO' });
});

export default router;
