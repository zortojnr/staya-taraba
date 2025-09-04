import { Router } from 'express';
import { protect, restrictTo } from '../middleware/auth';

const router = Router();

// Public webhook routes (no auth required)
router.post('/webhook/paystack', (req, res) => {
  res.json({ message: 'Paystack webhook - TODO' });
});

router.post('/webhook/stripe', (req, res) => {
  res.json({ message: 'Stripe webhook - TODO' });
});

router.post('/webhook/flutterwave', (req, res) => {
  res.json({ message: 'Flutterwave webhook - TODO' });
});

// Protected routes
router.use(protect);

// User payment routes
router.post('/initialize', (req, res) => {
  res.json({ message: 'Initialize payment - TODO' });
});

router.get('/verify/:reference', (req, res) => {
  res.json({ message: 'Verify payment - TODO' });
});

router.get('/my-payments', (req, res) => {
  res.json({ message: 'Get user payments - TODO' });
});

router.get('/:id', (req, res) => {
  res.json({ message: 'Get payment by ID - TODO' });
});

// Admin routes
router.use(restrictTo('admin'));

router.get('/', (req, res) => {
  res.json({ message: 'Get all payments - TODO' });
});

router.get('/stats/overview', (req, res) => {
  res.json({ message: 'Get payment statistics - TODO' });
});

router.post('/:id/refund', (req, res) => {
  res.json({ message: 'Process refund - TODO' });
});

export default router;
