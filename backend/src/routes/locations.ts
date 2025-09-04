import { Router } from 'express';
import { protect, restrictTo, optionalAuth } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', optionalAuth, (req, res) => {
  res.json({ message: 'Get all locations - TODO' });
});

router.get('/:id', optionalAuth, (req, res) => {
  res.json({ message: 'Get location by ID - TODO' });
});

router.get('/state/:state', optionalAuth, (req, res) => {
  res.json({ message: 'Get locations by state - TODO' });
});

router.get('/nearby/:lat/:lng', optionalAuth, (req, res) => {
  res.json({ message: 'Get nearby locations - TODO' });
});

// Protected routes (admin only)
router.use(protect);
router.use(restrictTo('admin'));

router.post('/', (req, res) => {
  res.json({ message: 'Create location - TODO' });
});

router.put('/:id', (req, res) => {
  res.json({ message: 'Update location - TODO' });
});

router.delete('/:id', (req, res) => {
  res.json({ message: 'Delete location - TODO' });
});

export default router;
