import mongoose, { Schema } from 'mongoose';
import { IPayment } from '../types';

const paymentSchema = new Schema<IPayment>({
  booking: {
    type: Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Booking is required']
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    uppercase: true,
    default: 'NGN'
  },
  paymentMethod: {
    type: String,
    enum: ['paystack', 'stripe', 'flutterwave', 'bank_transfer'],
    required: [true, 'Payment method is required']
  },
  paymentReference: {
    type: String,
    required: [true, 'Payment reference is required'],
    unique: true,
    trim: true
  },
  externalReference: {
    type: String,
    trim: true,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
paymentSchema.index({ paymentReference: 1 });
paymentSchema.index({ externalReference: 1 });
paymentSchema.index({ booking: 1 });
paymentSchema.index({ user: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ paymentMethod: 1 });
paymentSchema.index({ createdAt: -1 });

// Compound indexes
paymentSchema.index({ user: 1, status: 1 });
paymentSchema.index({ booking: 1, status: 1 });
paymentSchema.index({ status: 1, createdAt: -1 });

// Virtual for formatted amount
paymentSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: this.currency
  }).format(this.amount);
});

// Virtual for payment age in hours
paymentSchema.virtual('ageInHours').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - this.createdAt.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60));
});

// Pre-save middleware to generate payment reference
paymentSchema.pre('save', function(next) {
  if (this.isNew && !this.paymentReference) {
    // Generate unique payment reference
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.paymentReference = `PAY_${timestamp}_${random}`;
  }
  next();
});

// Static method to find payments by status
paymentSchema.statics.findByStatus = function(status: string) {
  return this.find({ status })
    .populate('booking user')
    .sort({ createdAt: -1 });
};

// Static method to find user payments
paymentSchema.statics.findUserPayments = function(userId: string) {
  return this.find({ user: userId })
    .populate('booking')
    .sort({ createdAt: -1 });
};

// Static method to find payments by date range
paymentSchema.statics.findByDateRange = function(startDate: Date, endDate: Date) {
  return this.find({
    createdAt: { $gte: startDate, $lte: endDate }
  })
  .populate('booking user')
  .sort({ createdAt: -1 });
};

// Static method to get payment statistics
paymentSchema.statics.getStatistics = async function(startDate?: Date, endDate?: Date) {
  const matchStage: any = {};
  if (startDate && endDate) {
    matchStage.createdAt = { $gte: startDate, $lte: endDate };
  }

  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        avgAmount: { $avg: '$amount' }
      }
    }
  ]);

  const methodStats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$paymentMethod',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);

  return { statusStats: stats, methodStats };
};

// Instance method to check if payment is expired
paymentSchema.methods.isExpired = function(): boolean {
  if (this.status !== 'pending') return false;
  
  const now = new Date();
  const expiryTime = new Date(this.createdAt.getTime() + (30 * 60 * 1000)); // 30 minutes
  return now > expiryTime;
};

// Instance method to mark as expired
paymentSchema.methods.markAsExpired = function() {
  if (this.isExpired() && this.status === 'pending') {
    this.status = 'cancelled';
    this.metadata = { ...this.metadata, expiredAt: new Date() };
    return this.save();
  }
  return Promise.resolve(this);
};

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);
