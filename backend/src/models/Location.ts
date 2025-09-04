import mongoose, { Schema } from 'mongoose';
import { ILocation } from '../types';

const locationSchema = new Schema<ILocation>({
  name: {
    type: String,
    required: [true, 'Location name is required'],
    trim: true,
    maxlength: [100, 'Location name cannot exceed 100 characters']
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true,
    maxlength: [50, 'State name cannot exceed 50 characters']
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true,
    default: 'Nigeria'
  },
  coordinates: {
    latitude: {
      type: Number,
      required: [true, 'Latitude is required'],
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90']
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required'],
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180']
    }
  },
  image: {
    type: String,
    required: [true, 'Location image is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
locationSchema.index({ name: 1, state: 1 });
locationSchema.index({ state: 1 });
locationSchema.index({ country: 1 });
locationSchema.index({ 'coordinates.latitude': 1, 'coordinates.longitude': 1 });
locationSchema.index({ isActive: 1 });

// Compound index for geospatial queries
locationSchema.index({ 
  'coordinates.latitude': 1, 
  'coordinates.longitude': 1 
}, { 
  name: 'coordinates_2d' 
});

// Virtual for formatted location
locationSchema.virtual('fullName').get(function() {
  return `${this.name}, ${this.state}`;
});

// Virtual for coordinate array (useful for mapping)
locationSchema.virtual('coordinatesArray').get(function() {
  return [this.coordinates.longitude, this.coordinates.latitude];
});

// Static method to find nearby locations
locationSchema.statics.findNearby = function(
  latitude: number, 
  longitude: number, 
  maxDistance: number = 100000 // 100km in meters
) {
  return this.find({
    isActive: true,
    'coordinates.latitude': {
      $gte: latitude - (maxDistance / 111000), // Rough conversion to degrees
      $lte: latitude + (maxDistance / 111000)
    },
    'coordinates.longitude': {
      $gte: longitude - (maxDistance / (111000 * Math.cos(latitude * Math.PI / 180))),
      $lte: longitude + (maxDistance / (111000 * Math.cos(latitude * Math.PI / 180)))
    }
  });
};

// Static method to find by state
locationSchema.statics.findByState = function(state: string) {
  return this.find({
    state: new RegExp(state, 'i'),
    isActive: true
  }).sort({ name: 1 });
};

// Instance method to calculate distance to another location
locationSchema.methods.distanceTo = function(otherLocation: ILocation): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (otherLocation.coordinates.latitude - this.coordinates.latitude) * Math.PI / 180;
  const dLon = (otherLocation.coordinates.longitude - this.coordinates.longitude) * Math.PI / 180;
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(this.coordinates.latitude * Math.PI / 180) * 
    Math.cos(otherLocation.coordinates.latitude * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
};

export const Location = mongoose.model<ILocation>('Location', locationSchema);
