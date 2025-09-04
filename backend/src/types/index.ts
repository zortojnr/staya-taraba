import { Document, Types } from 'mongoose';

// User Types
export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: 'user' | 'admin' | 'operator';
  isVerified: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
  generateRefreshToken(): string;
}

// Location Types
export interface ILocation extends Document {
  _id: Types.ObjectId;
  name: string;
  state: string;
  country: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  image: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Transport Types
export interface ITransportMode {
  type: 'bus' | 'flight' | 'train' | 'car';
  operator: string;
  operatorLogo?: string;
  price: number;
  duration: string;
  availability: 'available' | 'limited' | 'unavailable';
  departureTime?: string;
  arrivalTime?: string;
  amenities?: string[];
  vehicleInfo?: {
    model?: string;
    capacity?: number;
    features?: string[];
  };
}

// Route Types
export interface IRoute extends Document {
  _id: Types.ObjectId;
  from: Types.ObjectId;
  to: Types.ObjectId;
  distance: number;
  estimatedDuration: string;
  basePrice: number;
  transportModes: ITransportMode[];
  isActive: boolean;
  popularityScore: number;
  createdAt: Date;
  updatedAt: Date;
}

// Booking Types
export interface IBooking extends Document {
  _id: Types.ObjectId;
  bookingReference: string;
  user: Types.ObjectId;
  route: Types.ObjectId;
  from: Types.ObjectId;
  to: Types.ObjectId;
  departureDate: Date;
  returnDate?: Date;
  passengers: number;
  tripType: 'one-way' | 'round-trip';
  selectedTransport: ITransportMode;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: 'paystack' | 'stripe' | 'flutterwave' | 'bank_transfer';
  paymentReference?: string;
  specialRequests?: string;
  contactInfo: {
    email: string;
    phone: string;
    emergencyContact?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Payment Types
export interface IPayment extends Document {
  _id: Types.ObjectId;
  booking: Types.ObjectId;
  user: Types.ObjectId;
  amount: number;
  currency: string;
  paymentMethod: 'paystack' | 'stripe' | 'flutterwave' | 'bank_transfer';
  paymentReference: string;
  externalReference?: string;
  status: 'pending' | 'success' | 'failed' | 'cancelled' | 'refunded';
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Request Types
export interface AuthRequest extends Request {
  user?: IUser;
}

// Query Types
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
}

export interface BookingQuery extends PaginationQuery {
  status?: string;
  from?: string;
  to?: string;
  dateFrom?: string;
  dateTo?: string;
  userId?: string;
}

export interface RouteQuery extends PaginationQuery {
  from?: string;
  to?: string;
  isActive?: boolean;
}

// Validation Types
export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface CreateBookingInput {
  from: string;
  to: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  tripType: 'one-way' | 'round-trip';
  transportType: 'bus' | 'flight' | 'train' | 'car';
  operatorName: string;
  contactInfo: {
    email: string;
    phone: string;
    emergencyContact?: string;
  };
  specialRequests?: string;
}

// Service Types
export interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  data: any;
}

export interface SMSOptions {
  to: string;
  message: string;
}

// Error Types
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
