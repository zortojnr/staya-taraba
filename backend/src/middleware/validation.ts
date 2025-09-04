import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError } from '../types';

// Validation middleware factory
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return next(new AppError(errorMessage, 400));
    }
    
    next();
  };
};

// User validation schemas
export const userSchemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 100 characters',
      'any.required': 'Name is required'
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Password is required'
    }),
    phone: Joi.string().pattern(/^(\+234|0)[789][01]\d{8}$/).messages({
      'string.pattern.base': 'Please provide a valid Nigerian phone number'
    })
  }),

  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required'
    })
  }),

  updateProfile: Joi.object({
    name: Joi.string().min(2).max(100).messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 100 characters'
    }),
    phone: Joi.string().pattern(/^(\+234|0)[789][01]\d{8}$/).messages({
      'string.pattern.base': 'Please provide a valid Nigerian phone number'
    })
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required().messages({
      'any.required': 'Current password is required'
    }),
    newPassword: Joi.string().min(6).required().messages({
      'string.min': 'New password must be at least 6 characters long',
      'any.required': 'New password is required'
    })
  }),

  forgotPassword: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    })
  }),

  resetPassword: Joi.object({
    password: Joi.string().min(6).required().messages({
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Password is required'
    })
  })
};

// Booking validation schemas
export const bookingSchemas = {
  create: Joi.object({
    from: Joi.string().required().messages({
      'any.required': 'From location is required'
    }),
    to: Joi.string().required().messages({
      'any.required': 'To location is required'
    }),
    departureDate: Joi.date().min('now').required().messages({
      'date.min': 'Departure date cannot be in the past',
      'any.required': 'Departure date is required'
    }),
    returnDate: Joi.date().min(Joi.ref('departureDate')).messages({
      'date.min': 'Return date must be after departure date'
    }),
    passengers: Joi.number().integer().min(1).max(10).required().messages({
      'number.min': 'At least 1 passenger is required',
      'number.max': 'Maximum 10 passengers allowed',
      'any.required': 'Number of passengers is required'
    }),
    tripType: Joi.string().valid('one-way', 'round-trip').required().messages({
      'any.only': 'Trip type must be either one-way or round-trip',
      'any.required': 'Trip type is required'
    }),
    transportType: Joi.string().valid('bus', 'flight', 'train', 'car').required().messages({
      'any.only': 'Transport type must be bus, flight, train, or car',
      'any.required': 'Transport type is required'
    }),
    operatorName: Joi.string().required().messages({
      'any.required': 'Operator name is required'
    }),
    contactInfo: Joi.object({
      email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Contact email is required'
      }),
      phone: Joi.string().pattern(/^(\+234|0)[789][01]\d{8}$/).required().messages({
        'string.pattern.base': 'Please provide a valid Nigerian phone number',
        'any.required': 'Contact phone is required'
      }),
      emergencyContact: Joi.string().pattern(/^(\+234|0)[789][01]\d{8}$/).messages({
        'string.pattern.base': 'Please provide a valid Nigerian phone number'
      })
    }).required(),
    specialRequests: Joi.string().max(500).messages({
      'string.max': 'Special requests cannot exceed 500 characters'
    })
  }),

  update: Joi.object({
    specialRequests: Joi.string().max(500).messages({
      'string.max': 'Special requests cannot exceed 500 characters'
    }),
    contactInfo: Joi.object({
      email: Joi.string().email().messages({
        'string.email': 'Please provide a valid email address'
      }),
      phone: Joi.string().pattern(/^(\+234|0)[789][01]\d{8}$/).messages({
        'string.pattern.base': 'Please provide a valid Nigerian phone number'
      }),
      emergencyContact: Joi.string().pattern(/^(\+234|0)[789][01]\d{8}$/).messages({
        'string.pattern.base': 'Please provide a valid Nigerian phone number'
      })
    })
  })
};

// Location validation schemas
export const locationSchemas = {
  create: Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
      'string.min': 'Location name must be at least 2 characters long',
      'string.max': 'Location name cannot exceed 100 characters',
      'any.required': 'Location name is required'
    }),
    state: Joi.string().min(2).max(50).required().messages({
      'string.min': 'State name must be at least 2 characters long',
      'string.max': 'State name cannot exceed 50 characters',
      'any.required': 'State is required'
    }),
    country: Joi.string().min(2).max(50).default('Nigeria').messages({
      'string.min': 'Country name must be at least 2 characters long',
      'string.max': 'Country name cannot exceed 50 characters'
    }),
    coordinates: Joi.object({
      latitude: Joi.number().min(-90).max(90).required().messages({
        'number.min': 'Latitude must be between -90 and 90',
        'number.max': 'Latitude must be between -90 and 90',
        'any.required': 'Latitude is required'
      }),
      longitude: Joi.number().min(-180).max(180).required().messages({
        'number.min': 'Longitude must be between -180 and 180',
        'number.max': 'Longitude must be between -180 and 180',
        'any.required': 'Longitude is required'
      })
    }).required(),
    image: Joi.string().uri().required().messages({
      'string.uri': 'Image must be a valid URL',
      'any.required': 'Image URL is required'
    }),
    description: Joi.string().max(500).messages({
      'string.max': 'Description cannot exceed 500 characters'
    })
  })
};

// Route validation schemas
export const routeSchemas = {
  create: Joi.object({
    from: Joi.string().required().messages({
      'any.required': 'From location is required'
    }),
    to: Joi.string().required().messages({
      'any.required': 'To location is required'
    }),
    distance: Joi.number().min(0).required().messages({
      'number.min': 'Distance cannot be negative',
      'any.required': 'Distance is required'
    }),
    estimatedDuration: Joi.string().required().messages({
      'any.required': 'Estimated duration is required'
    }),
    basePrice: Joi.number().min(0).required().messages({
      'number.min': 'Base price cannot be negative',
      'any.required': 'Base price is required'
    }),
    transportModes: Joi.array().items(
      Joi.object({
        type: Joi.string().valid('bus', 'flight', 'train', 'car').required(),
        operator: Joi.string().required(),
        price: Joi.number().min(0).required(),
        duration: Joi.string().required(),
        availability: Joi.string().valid('available', 'limited', 'unavailable').default('available')
      })
    ).min(1).required().messages({
      'array.min': 'At least one transport mode is required'
    })
  })
};

// Query validation schemas
export const querySchemas = {
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string(),
    search: Joi.string()
  }),

  dateRange: Joi.object({
    startDate: Joi.date(),
    endDate: Joi.date().min(Joi.ref('startDate'))
  })
};
