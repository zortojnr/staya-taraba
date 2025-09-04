import { createClient } from '@supabase/supabase-js';
import { config } from './config';

// Create Supabase client
export const supabase = createClient(
  config.SUPABASE_URL,
  config.SUPABASE_ANON_KEY
);

// Create admin client for server-side operations
export const supabaseAdmin = createClient(
  config.SUPABASE_URL,
  config.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Database types (auto-generated from Supabase)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          phone: string | null;
          role: 'user' | 'admin' | 'operator';
          is_verified: boolean;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          phone?: string | null;
          role?: 'user' | 'admin' | 'operator';
          is_verified?: boolean;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          phone?: string | null;
          role?: 'user' | 'admin' | 'operator';
          is_verified?: boolean;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      locations: {
        Row: {
          id: string;
          name: string;
          state: string;
          country: string;
          latitude: number;
          longitude: number;
          image_url: string;
          description: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          state: string;
          country?: string;
          latitude: number;
          longitude: number;
          image_url: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          state?: string;
          country?: string;
          latitude?: number;
          longitude?: number;
          image_url?: string;
          description?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      routes: {
        Row: {
          id: string;
          from_location_id: string;
          to_location_id: string;
          distance_km: number;
          estimated_duration: string;
          base_price: number;
          transport_modes: any; // JSON
          is_active: boolean;
          popularity_score: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          from_location_id: string;
          to_location_id: string;
          distance_km: number;
          estimated_duration: string;
          base_price: number;
          transport_modes: any;
          is_active?: boolean;
          popularity_score?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          from_location_id?: string;
          to_location_id?: string;
          distance_km?: number;
          estimated_duration?: string;
          base_price?: number;
          transport_modes?: any;
          is_active?: boolean;
          popularity_score?: number;
          updated_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          booking_reference: string;
          user_id: string;
          route_id: string;
          from_location_id: string;
          to_location_id: string;
          departure_date: string;
          return_date: string | null;
          passengers: number;
          trip_type: 'one-way' | 'round-trip';
          selected_transport: any; // JSON
          total_price: number;
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
          payment_reference: string | null;
          contact_info: any; // JSON
          special_requests: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          booking_reference: string;
          user_id: string;
          route_id: string;
          from_location_id: string;
          to_location_id: string;
          departure_date: string;
          return_date?: string | null;
          passengers: number;
          trip_type: 'one-way' | 'round-trip';
          selected_transport: any;
          total_price: number;
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
          payment_reference?: string | null;
          contact_info: any;
          special_requests?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          booking_reference?: string;
          user_id?: string;
          route_id?: string;
          from_location_id?: string;
          to_location_id?: string;
          departure_date?: string;
          return_date?: string | null;
          passengers?: number;
          trip_type?: 'one-way' | 'round-trip';
          selected_transport?: any;
          total_price?: number;
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
          payment_reference?: string | null;
          contact_info?: any;
          special_requests?: string | null;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          booking_id: string;
          user_id: string;
          amount: number;
          currency: string;
          payment_method: string;
          payment_reference: string;
          external_reference: string | null;
          status: 'pending' | 'success' | 'failed' | 'cancelled';
          metadata: any; // JSON
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          user_id: string;
          amount: number;
          currency?: string;
          payment_method: string;
          payment_reference: string;
          external_reference?: string | null;
          status?: 'pending' | 'success' | 'failed' | 'cancelled';
          metadata?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          user_id?: string;
          amount?: number;
          currency?: string;
          payment_method?: string;
          payment_reference?: string;
          external_reference?: string | null;
          status?: 'pending' | 'success' | 'failed' | 'cancelled';
          metadata?: any;
          updated_at?: string;
        };
      };
    };
  };
}
