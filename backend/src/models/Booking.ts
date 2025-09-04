import mongoose, { Schema } from 'mongoose';
import { IBooking, ITransportMode } from '../types';

const transportModeSchema = new Schema<ITransportMode>({
  type: {
    type: String,
    enum: ['bus', 'flight', 'train', 'car'],
    required: true
  },
  operator: {
    type: String,
    required: true,
    trim: true
  },
  operatorLogo: String,
  price: {
    type: Number,
    required: true,
    min: 0
  },
  duration: {
    type: String,
    required: true,
    trim: true
  },
  availability: {
    type: String,
    enum: ['available', 'limited', 'unavailable'],
    default: 'available'
  },
  departureTime: String,
  arrivalTime: String,
  amenities: [String],
  vehicleInfo: {
    model: String,
    capacity: Number,
    features: [String]
  }
}, { _id: false });

const bookingSchema = new Schema<IBooking>({
  bookingReference: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  route: {
    type: Schema.Types.ObjectId,
    ref: 'Route',
    required: [true, 'Route is required']
  },
  from: {
    type: Schema.Types.ObjectId,
    ref: 'Location',
    required: [true, 'From location is required']
  },
  to: {
    type: Schema.Types.ObjectId,
    ref: 'Location',
    required: [true, 'To location is required']
  },
  departureDate: {
    type: Date,
    required: [true, 'Departure date is required'],
    validate: {
      validator: function(date: Date) {
        return date >= new Date();
      },
      message: 'Departure date cannot be in the past'
    }
  },
  returnDate: {
    type: Date,
    validate: {
      validator: function(this: IBooking, date: Date) {
        if (!date) return true; // Optional field
        return date > this.departureDate;
      },
      message: 'Return date must be after departure date'
    }
  },
  passengers: {
    type: Number,
    required: [true, 'Number of passengers is required'],
    min: [1, 'At least 1 passenger is required'],
    max: [10, 'Maximum 10 passengers allowed']
  },
  tripType: {
    type: String,
    enum: ['one-way', 'round-trip'],
    required: [true, 'Trip type is required']
  },
  selectedTransport: {
    type: transportModeSchema,
    required: [true, 'Selected transport is required']
  },
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required'],
    min: [0, 'Total price cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'refunded'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['paystack', 'stripe', 'flutterwave', 'bank_transfer'],
    required: [true, 'Payment method is required']
  },
  paymentReference: {
    type: String,
    trim: true
  },
  specialRequests: {
    type: String,
    trim: true,
    maxlength: [500, 'Special requests cannot exceed 500 characters']
  },
  contactInfo: {
    email: {
      type: String,
      required: [true, 'Contact email is required'],
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
      type: String,
      required: [true, 'Contact phone is required'],
      trim: true,
      match: [/^(\+234|0)[789][01]\d{8}$/, 'Please enter a valid Nigerian phone number']
    },
    emergencyContact: {
      type: String,
      trim: true,
      match: [/^(\+234|0)[789][01]\d{8}$/, 'Please enter a valid Nigerian phone number']
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
bookingSchema.index({ bookingReference: 1 });
bookingSchema.index({ user: 1 });
bookingSchema.index({ route: 1 });
bookingSchema.index({ from: 1, to: 1 });
bookingSchema.index({ departureDate: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ paymentStatus: 1 });
bookingSchema.index({ createdAt: -1 });

// Compound indexes
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ status: 1, departureDate: 1 });
bookingSchema.index({ paymentStatus: 1, createdAt: -1 });

// Virtual for booking age in days
bookingSchema.virtual('ageInDays').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - this.createdAt.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for days until departure
bookingSchema.virtual('daysUntilDeparture').get(function() {
  const now = new Date();
  const diffTime = this.departureDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for trip duration in days
bookingSchema.virtual('tripDurationDays').get(function() {
  if (!this.returnDate) return 1;
  const diffTime = this.returnDate.getTime() - this.departureDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
});

// Virtual for formatted booking reference
bookingSchema.virtual('formattedReference').get(function() {
  return `STAYA-${this.bookingReference}`;
});

// Pre-save middleware to generate booking reference
bookingSchema.pre('save', function(next) {
  if (this.isNew && !this.bookingReference) {
    // Generate unique booking reference: YYYYMMDD + random 4 chars
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.bookingReference = `${date}${random}`;
  }
  next();
});

// Static method to find user bookings
bookingSchema.statics.findUserBookings = function(userId: string, status?: string) {
  const query: any = { user: userId };
  if (status) query.status = status;
  
  return this.find(query)
    .populate('from to route')
    .sort({ createdAt: -1 });
};

// Static method to find upcoming departures
bookingSchema.statics.findUpcomingDepartures = function(days: number = 7) {
  const now = new Date();
  const futureDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
  
  return this.find({
    departureDate: { $gte: now, $lte: futureDate },
    status: { $in: ['confirmed', 'pending'] }
  })
  .populate('user from to')
  .sort({ departureDate: 1 });
};

// Instance method to check if booking can be cancelled
bookingSchema.methods.canBeCancelled = function(): boolean {
  const now = new Date();
  const hoursUntilDeparture = (this.departureDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  return this.status === 'confirmed' && 
         this.paymentStatus === 'paid' && 
         hoursUntilDeparture >= 24; // Can cancel up to 24 hours before departure
};

// Instance method to calculate refund amount
bookingSchema.methods.calculateRefundAmount = function(): number {
  if (!this.canBeCancelled()) return 0;
  
  const now = new Date();
  const hoursUntilDeparture = (this.departureDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  // Refund policy: 100% if >48h, 75% if 24-48h, 50% if <24h
  if (hoursUntilDeparture >= 48) return this.totalPrice;
  if (hoursUntilDeparture >= 24) return this.totalPrice * 0.75;
  return this.totalPrice * 0.5;
};

export const Booking = mongoose.model<IBooking>('Booking', bookingSchema);
