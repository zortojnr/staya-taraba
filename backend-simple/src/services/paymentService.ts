import axios from 'axios';
import { config } from '../config/config';
import { supabase } from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';

export interface PaymentInitRequest {
  email: string;
  amount: number; // in kobo (multiply by 100)
  bookingId: string;
  userId: string;
  metadata?: any;
}

export interface PaymentResponse {
  success: boolean;
  message: string;
  data?: {
    authorization_url?: string;
    access_code?: string;
    reference?: string;
    payment?: any;
  };
  error?: string;
}

class PaymentService {
  private paystackBaseUrl = 'https://api.paystack.co';

  // Initialize payment with Paystack
  async initializePayment(paymentData: PaymentInitRequest): Promise<PaymentResponse> {
    try {
      const reference = `STAYA_${Date.now()}_${uuidv4().substring(0, 8)}`;

      // Create payment record in database
      const { data: payment, error: dbError } = await supabase
        .from('payments')
        .insert({
          booking_id: paymentData.bookingId,
          user_id: paymentData.userId,
          amount: paymentData.amount / 100, // Store in Naira
          currency: 'NGN',
          payment_method: 'paystack',
          payment_reference: reference,
          status: 'pending',
          metadata: paymentData.metadata || {}
        })
        .select()
        .single();

      if (dbError) {
        return {
          success: false,
          message: 'Failed to create payment record',
          error: 'DB_ERROR'
        };
      }

      // Initialize payment with Paystack
      const paystackData = {
        email: paymentData.email,
        amount: paymentData.amount, // Paystack expects amount in kobo
        reference: reference,
        callback_url: `${config.FRONTEND_URL}/payment/callback`,
        metadata: {
          booking_id: paymentData.bookingId,
          user_id: paymentData.userId,
          ...paymentData.metadata
        }
      };

      const response = await axios.post(
        `${this.paystackBaseUrl}/transaction/initialize`,
        paystackData,
        {
          headers: {
            Authorization: `Bearer ${config.PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status) {
        // Update payment with external reference
        await supabase
          .from('payments')
          .update({
            external_reference: response.data.data.reference,
            metadata: {
              ...payment.metadata,
              paystack_data: response.data.data
            }
          })
          .eq('id', payment.id);

        return {
          success: true,
          message: 'Payment initialized successfully',
          data: {
            authorization_url: response.data.data.authorization_url,
            access_code: response.data.data.access_code,
            reference: reference,
            payment: payment
          }
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Payment initialization failed',
          error: 'PAYSTACK_ERROR'
        };
      }
    } catch (error: any) {
      console.error('Payment initialization error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Payment initialization failed',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  // Verify payment with Paystack
  async verifyPayment(reference: string): Promise<PaymentResponse> {
    try {
      // Get payment from database
      const { data: payment, error: dbError } = await supabase
        .from('payments')
        .select('*')
        .eq('payment_reference', reference)
        .single();

      if (dbError || !payment) {
        return {
          success: false,
          message: 'Payment not found',
          error: 'PAYMENT_NOT_FOUND'
        };
      }

      // Verify with Paystack
      const response = await axios.get(
        `${this.paystackBaseUrl}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${config.PAYSTACK_SECRET_KEY}`
          }
        }
      );

      if (response.data.status && response.data.data.status === 'success') {
        // Update payment status
        const { data: updatedPayment, error: updateError } = await supabase
          .from('payments')
          .update({
            status: 'success',
            external_reference: response.data.data.reference,
            metadata: {
              ...payment.metadata,
              verification_data: response.data.data
            },
            updated_at: new Date().toISOString()
          })
          .eq('id', payment.id)
          .select()
          .single();

        if (updateError) {
          console.error('Failed to update payment status:', updateError);
        }

        // Update booking payment status
        await supabase
          .from('bookings')
          .update({
            payment_status: 'paid',
            status: 'confirmed',
            payment_reference: reference,
            updated_at: new Date().toISOString()
          })
          .eq('id', payment.booking_id);

        return {
          success: true,
          message: 'Payment verified successfully',
          data: {
            payment: updatedPayment || payment
          }
        };
      } else {
        // Update payment status to failed
        await supabase
          .from('payments')
          .update({
            status: 'failed',
            metadata: {
              ...payment.metadata,
              verification_data: response.data.data
            },
            updated_at: new Date().toISOString()
          })
          .eq('id', payment.id);

        return {
          success: false,
          message: 'Payment verification failed',
          error: 'PAYMENT_FAILED'
        };
      }
    } catch (error: any) {
      console.error('Payment verification error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Payment verification failed',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  // Handle Paystack webhook
  async handleWebhook(event: any): Promise<boolean> {
    try {
      if (event.event === 'charge.success') {
        const reference = event.data.reference;
        await this.verifyPayment(reference);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Webhook handling error:', error);
      return false;
    }
  }

  // Get payment by reference
  async getPayment(reference: string) {
    try {
      const { data: payment, error } = await supabase
        .from('payments')
        .select(`
          *,
          bookings (
            booking_reference,
            from_location_id,
            to_location_id,
            departure_date,
            passengers
          )
        `)
        .eq('payment_reference', reference)
        .single();

      if (error) {
        return null;
      }

      return payment;
    } catch (error) {
      console.error('Get payment error:', error);
      return null;
    }
  }

  // Get user payments
  async getUserPayments(userId: string) {
    try {
      const { data: payments, error } = await supabase
        .from('payments')
        .select(`
          *,
          bookings (
            booking_reference,
            from_location_id,
            to_location_id,
            departure_date,
            passengers,
            status
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return [];
      }

      return payments;
    } catch (error) {
      console.error('Get user payments error:', error);
      return [];
    }
  }

  // Process refund (simplified)
  async processRefund(paymentId: string, amount?: number): Promise<PaymentResponse> {
    try {
      // Get payment details
      const { data: payment, error } = await supabase
        .from('payments')
        .select('*')
        .eq('id', paymentId)
        .single();

      if (error || !payment) {
        return {
          success: false,
          message: 'Payment not found',
          error: 'PAYMENT_NOT_FOUND'
        };
      }

      // For now, just mark as refunded in our database
      // In production, you'd call Paystack's refund API
      const refundAmount = amount || payment.amount;

      await supabase
        .from('payments')
        .update({
          status: 'refunded',
          metadata: {
            ...payment.metadata,
            refund_amount: refundAmount,
            refund_date: new Date().toISOString()
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentId);

      // Update booking status
      await supabase
        .from('bookings')
        .update({
          payment_status: 'refunded',
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', payment.booking_id);

      return {
        success: true,
        message: 'Refund processed successfully'
      };
    } catch (error) {
      console.error('Refund processing error:', error);
      return {
        success: false,
        message: 'Refund processing failed',
        error: 'INTERNAL_ERROR'
      };
    }
  }
}

export const paymentService = new PaymentService();
