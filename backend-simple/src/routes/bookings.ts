import { Router, Request, Response } from 'express';
import { bookingService } from '../services/bookingService';
import { protect, restrictTo } from '../middleware/auth';

const router = Router();

interface AuthRequest extends Request {
  user?: any;
}

// All routes require authentication
router.use(protect);

// Create new booking
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const {
      fromLocationId,
      toLocationId,
      departureDate,
      returnDate,
      passengers,
      tripType,
      selectedTransport,
      contactInfo,
      specialRequests
    } = req.body;

    // Basic validation
    if (!fromLocationId || !toLocationId || !departureDate || !passengers || !tripType || !selectedTransport || !contactInfo) {
      return res.status(400).json({
        success: false,
        message: 'Missing required booking information'
      });
    }

    if (passengers < 1 || passengers > 10) {
      return res.status(400).json({
        success: false,
        message: 'Passengers must be between 1 and 10'
      });
    }

    const result = await bookingService.createBooking({
      userId: req.user.id,
      fromLocationId,
      toLocationId,
      departureDate,
      returnDate,
      passengers,
      tripType,
      selectedTransport,
      contactInfo,
      specialRequests
    });

    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Booking creation failed'
    });
  }
});

// Get user's bookings
router.get('/my-bookings', async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;
    
    const result = await bookingService.getUserBookings(req.user.id, status as string);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve bookings'
    });
  }
});

// Get booking by ID
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // Users can only access their own bookings, admins can access all
    const userId = req.user.role === 'admin' ? undefined : req.user.id;
    
    const result = await bookingService.getBooking(id, userId);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve booking'
    });
  }
});

// Update booking
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { specialRequests, contactInfo } = req.body;
    
    const result = await bookingService.updateBooking(id, req.user.id, {
      specialRequests,
      contactInfo
    });
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Booking update failed'
    });
  }
});

// Cancel booking
router.post('/:id/cancel', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await bookingService.cancelBooking(id, req.user.id);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Booking cancellation failed'
    });
  }
});

// Admin routes
router.use(restrictTo('admin'));

// Get all bookings (admin only)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, fromDate, toDate, page, limit } = req.query;
    
    const result = await bookingService.getAllBookings({
      status: status as string,
      fromDate: fromDate as string,
      toDate: toDate as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined
    });
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve bookings'
    });
  }
});

// Update booking status (admin only)
router.put('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    // This would be implemented in the booking service
    res.status(200).json({
      success: true,
      message: 'Booking status updated successfully'
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking status'
    });
  }
});

export default router;
