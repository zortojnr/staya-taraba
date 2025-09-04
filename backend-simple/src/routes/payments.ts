import { Router, Request, Response } from 'express';
import { paymentService } from '../services/paymentService';
import { protect, restrictTo } from '../middleware/auth';

const router = Router();

interface AuthRequest extends Request {
  user?: any;
}

// Public webhook routes (no auth required)
router.post('/webhook/paystack', async (req: Request, res: Response) => {
  try {
    const event = req.body;
    
    // Verify webhook signature in production
    // const signature = req.headers['x-paystack-signature'];
    
    const handled = await paymentService.handleWebhook(event);
    
    if (handled) {
      res.status(200).json({ success: true });
    } else {
      res.status(400).json({ success: false });
    }
  } catch (error) {
    console.error('Paystack webhook error:', error);
    res.status(500).json({ success: false });
  }
});

// Protected routes
router.use(protect);

// Initialize payment
router.post('/initialize', async (req: AuthRequest, res: Response) => {
  try {
    const { bookingId, amount, metadata } = req.body;

    if (!bookingId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID and amount are required'
      });
    }

    // Convert amount to kobo (Paystack expects amount in kobo)
    const amountInKobo = Math.round(amount * 100);

    const result = await paymentService.initializePayment({
      email: req.user.email,
      amount: amountInKobo,
      bookingId,
      userId: req.user.id,
      metadata
    });

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Initialize payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment initialization failed'
    });
  }
});

// Verify payment
router.get('/verify/:reference', async (req: AuthRequest, res: Response) => {
  try {
    const { reference } = req.params;

    const result = await paymentService.verifyPayment(reference);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed'
    });
  }
});

// Get payment by reference
router.get('/reference/:reference', async (req: AuthRequest, res: Response) => {
  try {
    const { reference } = req.params;

    const payment = await paymentService.getPayment(reference);

    if (payment) {
      // Check if user owns this payment or is admin
      if (payment.user_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Payment retrieved successfully',
        data: { payment }
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment'
    });
  }
});

// Get user's payments
router.get('/my-payments', async (req: AuthRequest, res: Response) => {
  try {
    const payments = await paymentService.getUserPayments(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Payments retrieved successfully',
      data: { payments }
    });
  } catch (error) {
    console.error('Get user payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payments'
    });
  }
});

// Admin routes
router.use(restrictTo('admin'));

// Process refund (admin only)
router.post('/:id/refund', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    const result = await paymentService.processRefund(id, amount);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Refund processing failed'
    });
  }
});

// Get payment statistics (admin only)
router.get('/stats/overview', async (req: Request, res: Response) => {
  try {
    // This would be implemented to get payment statistics
    res.status(200).json({
      success: true,
      message: 'Payment statistics retrieved successfully',
      data: {
        totalPayments: 0,
        totalAmount: 0,
        successfulPayments: 0,
        failedPayments: 0,
        pendingPayments: 0
      }
    });
  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment statistics'
    });
  }
});

export default router;
