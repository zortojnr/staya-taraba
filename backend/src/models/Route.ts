import mongoose, { Schema } from 'mongoose';
import { IRoute, ITransportMode } from '../types';

const transportModeSchema = new Schema<ITransportMode>({
  type: {
    type: String,
    enum: ['bus', 'flight', 'train', 'car'],
    required: [true, 'Transport type is required']
  },
  operator: {
    type: String,
    required: [true, 'Operator name is required'],
    trim: true,
    maxlength: [100, 'Operator name cannot exceed 100 characters']
  },
  operatorLogo: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  duration: {
    type: String,
    required: [true, 'Duration is required'],
    trim: true
  },
  availability: {
    type: String,
    enum: ['available', 'limited', 'unavailable'],
    default: 'available'
  },
  departureTime: {
    type: String,
    trim: true
  },
  arrivalTime: {
    type: String,
    trim: true
  },
  amenities: [{
    type: String,
    trim: true
  }],
  vehicleInfo: {
    model: {
      type: String,
      trim: true
    },
    capacity: {
      type: Number,
      min: [1, 'Capacity must be at least 1']
    },
    features: [{
      type: String,
      trim: true
    }]
  }
}, { _id: false });

const routeSchema = new Schema<IRoute>({
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
  distance: {
    type: Number,
    required: [true, 'Distance is required'],
    min: [0, 'Distance cannot be negative']
  },
  estimatedDuration: {
    type: String,
    required: [true, 'Estimated duration is required'],
    trim: true
  },
  basePrice: {
    type: Number,
    required: [true, 'Base price is required'],
    min: [0, 'Base price cannot be negative']
  },
  transportModes: {
    type: [transportModeSchema],
    required: [true, 'At least one transport mode is required'],
    validate: {
      validator: function(modes: ITransportMode[]) {
        return modes.length > 0;
      },
      message: 'At least one transport mode must be provided'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  popularityScore: {
    type: Number,
    default: 0,
    min: [0, 'Popularity score cannot be negative']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
routeSchema.index({ from: 1, to: 1 });
routeSchema.index({ from: 1 });
routeSchema.index({ to: 1 });
routeSchema.index({ isActive: 1 });
routeSchema.index({ popularityScore: -1 });
routeSchema.index({ basePrice: 1 });
routeSchema.index({ distance: 1 });

// Compound indexes
routeSchema.index({ from: 1, to: 1, isActive: 1 });
routeSchema.index({ isActive: 1, popularityScore: -1 });

// Ensure unique route combinations
routeSchema.index({ from: 1, to: 1 }, { unique: true });

// Virtual for route identifier
routeSchema.virtual('routeId').get(function() {
  return `${this.from}-${this.to}`;
});

// Virtual for available transport types
routeSchema.virtual('availableTransportTypes').get(function() {
  return this.transportModes
    .filter(mode => mode.availability !== 'unavailable')
    .map(mode => mode.type);
});

// Virtual for cheapest price
routeSchema.virtual('cheapestPrice').get(function() {
  const availableModes = this.transportModes.filter(mode => mode.availability !== 'unavailable');
  if (availableModes.length === 0) return this.basePrice;
  return Math.min(...availableModes.map(mode => mode.price));
});

// Virtual for fastest duration
routeSchema.virtual('fastestDuration').get(function() {
  const availableModes = this.transportModes.filter(mode => mode.availability !== 'unavailable');
  if (availableModes.length === 0) return this.estimatedDuration;
  
  // Convert duration strings to minutes for comparison
  const durationToMinutes = (duration: string): number => {
    const match = duration.match(/(\d+)h?\s*(\d+)?m?/);
    if (!match) return 0;
    const hours = parseInt(match[1]) || 0;
    const minutes = parseInt(match[2]) || 0;
    return hours * 60 + minutes;
  };
  
  const fastestMode = availableModes.reduce((fastest, current) => {
    return durationToMinutes(current.duration) < durationToMinutes(fastest.duration) 
      ? current 
      : fastest;
  });
  
  return fastestMode.duration;
});

// Static method to find routes between locations
routeSchema.statics.findRoute = function(fromId: string, toId: string) {
  return this.findOne({
    $or: [
      { from: fromId, to: toId },
      { from: toId, to: fromId }
    ],
    isActive: true
  }).populate('from to');
};

// Static method to find routes from a location
routeSchema.statics.findRoutesFrom = function(fromId: string) {
  return this.find({
    $or: [
      { from: fromId },
      { to: fromId }
    ],
    isActive: true
  }).populate('from to').sort({ popularityScore: -1 });
};

// Static method to find popular routes
routeSchema.statics.findPopularRoutes = function(limit: number = 10) {
  return this.find({ isActive: true })
    .populate('from to')
    .sort({ popularityScore: -1 })
    .limit(limit);
};

// Instance method to get transport mode by type
routeSchema.methods.getTransportMode = function(type: string) {
  return this.transportModes.find(mode => 
    mode.type === type && mode.availability !== 'unavailable'
  );
};

// Instance method to calculate dynamic price
routeSchema.methods.calculateDynamicPrice = function(
  passengers: number = 1,
  transportType?: string,
  demandMultiplier: number = 1
): number {
  let basePrice = this.basePrice;
  
  if (transportType) {
    const transport = this.getTransportMode(transportType);
    if (transport) {
      basePrice = transport.price;
    }
  }
  
  let totalPrice = basePrice * passengers * demandMultiplier;
  
  // Round to nearest 500 Naira
  return Math.round(totalPrice / 500) * 500;
};

// Pre-save middleware to update popularity score
routeSchema.pre('save', function(next) {
  if (this.isNew) {
    // Set initial popularity based on transport modes and price
    const modeCount = this.transportModes.length;
    const priceScore = Math.max(0, 100 - (this.basePrice / 1000)); // Lower price = higher score
    this.popularityScore = modeCount * 10 + priceScore;
  }
  next();
});

export const Route = mongoose.model<IRoute>('Route', routeSchema);
