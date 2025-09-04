import { Router } from 'express';
import { protect, restrictTo, optionalAuth } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', optionalAuth, (req, res) => {
  res.json({ message: 'Get all routes - TODO' });
});

router.get('/search', optionalAuth, (req, res) => {
  res.json({ message: 'Search routes - TODO' });
});

router.get('/popular', optionalAuth, (req, res) => {
  res.json({ message: 'Get popular routes - TODO' });
});

router.get('/:id', optionalAuth, (req, res) => {
  res.json({ message: 'Get route by ID - TODO' });
});

router.get('/from/:locationId', optionalAuth, (req, res) => {
  res.json({ message: 'Get routes from location - TODO' });
});

router.post('/calculate-price', optionalAuth, (req, res) => {
  res.json({ message: 'Calculate route price - TODO' });
});

// Protected routes (admin only)
router.use(protect);
router.use(restrictTo('admin'));

router.post('/', (req, res) => {
  res.json({ message: 'Create route - TODO' });
});

router.put('/:id', (req, res) => {
  res.json({ message: 'Update route - TODO' });
});

router.delete('/:id', (req, res) => {
  res.json({ message: 'Delete route - TODO' });
});

export default router;
