import { supabase } from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';

export interface CreateBookingRequest {
  userId: string;
  fromLocationId: string;
  toLocationId: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  tripType: 'one-way' | 'round-trip';
  selectedTransport: {
    type: string;
    operator: string;
    price: number;
    duration: string;
  };
  contactInfo: {
    email: string;
    phone: string;
    emergencyContact?: string;
  };
  specialRequests?: string;
}

export interface BookingResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

class BookingService {
  // Create new booking
  async createBooking(bookingData: CreateBookingRequest): Promise<BookingResponse> {
    try {
      // Generate booking reference
      const bookingReference = this.generateBookingReference();

      // Get route information
      const { data: route, error: routeError } = await supabase
        .from('routes')
        .select('*')
        .eq('from_location_id', bookingData.fromLocationId)
        .eq('to_location_id', bookingData.toLocationId)
        .eq('is_active', true)
        .single();

      if (routeError || !route) {
        return {
          success: false,
          message: 'Route not found or not available',
          error: 'ROUTE_NOT_FOUND'
        };
      }

      // Calculate total price
      const basePrice = bookingData.selectedTransport.price;
      const totalPrice = basePrice * bookingData.passengers;

      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          booking_reference: bookingReference,
          user_id: bookingData.userId,
          route_id: route.id,
          from_location_id: bookingData.fromLocationId,
          to_location_id: bookingData.toLocationId,
          departure_date: bookingData.departureDate,
          return_date: bookingData.returnDate,
          passengers: bookingData.passengers,
          trip_type: bookingData.tripType,
          selected_transport: bookingData.selectedTransport,
          total_price: totalPrice,
          status: 'pending',
          payment_status: 'pending',
          contact_info: bookingData.contactInfo,
          special_requests: bookingData.specialRequests
        })
        .select(`
          *,
          from_location:locations!from_location_id(name, state),
          to_location:locations!to_location_id(name, state)
        `)
        .single();

      if (bookingError) {
        return {
          success: false,
          message: 'Failed to create booking',
          error: 'BOOKING_CREATE_ERROR'
        };
      }

      return {
        success: true,
        message: 'Booking created successfully',
        data: { booking }
      };
    } catch (error) {
      console.error('Create booking error:', error);
      return {
        success: false,
        message: 'Booking creation failed',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  // Get booking by ID
  async getBooking(bookingId: string, userId?: string): Promise<BookingResponse> {
    try {
      let query = supabase
        .from('bookings')
        .select(`
          *,
          from_location:locations!from_location_id(name, state, country),
          to_location:locations!to_location_id(name, state, country),
          user:users(name, email, phone)
        `)
        .eq('id', bookingId);

      // If userId provided, ensure user can only access their own bookings
      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data: booking, error } = await query.single();

      if (error || !booking) {
        return {
          success: false,
          message: 'Booking not found',
          error: 'BOOKING_NOT_FOUND'
        };
      }

      return {
        success: true,
        message: 'Booking retrieved successfully',
        data: { booking }
      };
    } catch (error) {
      console.error('Get booking error:', error);
      return {
        success: false,
        message: 'Failed to retrieve booking',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  // Get user bookings
  async getUserBookings(userId: string, status?: string): Promise<BookingResponse> {
    try {
      let query = supabase
        .from('bookings')
        .select(`
          *,
          from_location:locations!from_location_id(name, state, country),
          to_location:locations!to_location_id(name, state, country)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data: bookings, error } = await query;

      if (error) {
        return {
          success: false,
          message: 'Failed to retrieve bookings',
          error: 'BOOKINGS_FETCH_ERROR'
        };
      }

      return {
        success: true,
        message: 'Bookings retrieved successfully',
        data: { bookings }
      };
    } catch (error) {
      console.error('Get user bookings error:', error);
      return {
        success: false,
        message: 'Failed to retrieve bookings',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  // Update booking
  async updateBooking(bookingId: string, userId: string, updates: {
    specialRequests?: string;
    contactInfo?: any;
  }): Promise<BookingResponse> {
    try {
      const { data: booking, error } = await supabase
        .from('bookings')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId)
        .eq('user_id', userId)
        .eq('status', 'pending') // Only allow updates for pending bookings
        .select()
        .single();

      if (error) {
        return {
          success: false,
          message: 'Failed to update booking or booking not found',
          error: 'BOOKING_UPDATE_ERROR'
        };
      }

      return {
        success: true,
        message: 'Booking updated successfully',
        data: { booking }
      };
    } catch (error) {
      console.error('Update booking error:', error);
      return {
        success: false,
        message: 'Booking update failed',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  // Cancel booking
  async cancelBooking(bookingId: string, userId: string): Promise<BookingResponse> {
    try {
      // Get booking details
      const { data: booking, error: fetchError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .eq('user_id', userId)
        .single();

      if (fetchError || !booking) {
        return {
          success: false,
          message: 'Booking not found',
          error: 'BOOKING_NOT_FOUND'
        };
      }

      // Check if booking can be cancelled
      const departureDate = new Date(booking.departure_date);
      const now = new Date();
      const hoursUntilDeparture = (departureDate.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (hoursUntilDeparture < 24) {
        return {
          success: false,
          message: 'Booking cannot be cancelled less than 24 hours before departure',
          error: 'CANCELLATION_NOT_ALLOWED'
        };
      }

      // Update booking status
      const { data: updatedBooking, error: updateError } = await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId)
        .select()
        .single();

      if (updateError) {
        return {
          success: false,
          message: 'Failed to cancel booking',
          error: 'CANCELLATION_ERROR'
        };
      }

      // Calculate refund amount
      let refundAmount = booking.total_price;
      if (hoursUntilDeparture >= 48) {
        refundAmount = booking.total_price; // 100% refund
      } else if (hoursUntilDeparture >= 24) {
        refundAmount = booking.total_price * 0.75; // 75% refund
      }

      return {
        success: true,
        message: 'Booking cancelled successfully',
        data: {
          booking: updatedBooking,
          refundAmount
        }
      };
    } catch (error) {
      console.error('Cancel booking error:', error);
      return {
        success: false,
        message: 'Booking cancellation failed',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  // Get all bookings (admin)
  async getAllBookings(filters?: {
    status?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
  }): Promise<BookingResponse> {
    try {
      let query = supabase
        .from('bookings')
        .select(`
          *,
          from_location:locations!from_location_id(name, state, country),
          to_location:locations!to_location_id(name, state, country),
          user:users(name, email, phone)
        `)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.fromDate) {
        query = query.gte('created_at', filters.fromDate);
      }

      if (filters?.toDate) {
        query = query.lte('created_at', filters.toDate);
      }

      const page = filters?.page || 1;
      const limit = filters?.limit || 20;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      query = query.range(from, to);

      const { data: bookings, error, count } = await query;

      if (error) {
        return {
          success: false,
          message: 'Failed to retrieve bookings',
          error: 'BOOKINGS_FETCH_ERROR'
        };
      }

      return {
        success: true,
        message: 'Bookings retrieved successfully',
        data: {
          bookings,
          pagination: {
            page,
            limit,
            total: count || 0,
            pages: Math.ceil((count || 0) / limit)
          }
        }
      };
    } catch (error) {
      console.error('Get all bookings error:', error);
      return {
        success: false,
        message: 'Failed to retrieve bookings',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  // Generate booking reference
  private generateBookingReference(): string {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${date}${random}`;
  }
}

export const bookingService = new BookingService();
