import { Router } from 'express';
import { protect, restrictTo } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(protect);

// User booking routes
router.get('/my-bookings', (req, res) => {
  res.json({ message: 'Get user bookings - TODO' });
});

router.post('/', (req, res) => {
  res.json({ message: 'Create booking - TODO' });
});

router.get('/:id', (req, res) => {
  res.json({ message: 'Get booking by ID - TODO' });
});

router.put('/:id', (req, res) => {
  res.json({ message: 'Update booking - TODO' });
});

router.post('/:id/cancel', (req, res) => {
  res.json({ message: 'Cancel booking - TODO' });
});

// Admin routes
router.use(restrictTo('admin'));

router.get('/', (req, res) => {
  res.json({ message: 'Get all bookings - TODO' });
});

router.put('/:id/status', (req, res) => {
  res.json({ message: 'Update booking status - TODO' });
});

router.get('/stats/overview', (req, res) => {
  res.json({ message: 'Get booking statistics - TODO' });
});

export default router;
