export interface Location {
  id: string;
  name: string;
  country: string;
  image: string;
  description?: string;
}

export interface BookingData {
  from: Location | null;
  to: Location | null;
  departureDate: string;
  returnDate: string;
  passengers: number;
  tripType: 'one-way' | 'round-trip';
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
}

export interface Booking {
  id: string;
  user: User;
  bookingData: BookingData;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
  totalPrice: number;
}

export interface AppState {
  isLoading: boolean;
  showSplash: boolean;
  user: User | null;
  currentBooking: BookingData;
}