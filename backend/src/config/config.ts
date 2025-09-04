import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

interface Config {
  // Server
  NODE_ENV: string;
  PORT: number;
  API_VERSION: string;

  // Database
  MONGODB_URI: string;
  MONGODB_TEST_URI: string;

  // JWT
  JWT_SECRET: string;
  JWT_EXPIRE: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRE: string;

  // Email
  EMAIL_HOST: string;
  EMAIL_PORT: number;
  EMAIL_USER: string;
  EMAIL_PASS: string;
  EMAIL_FROM: string;

  // SMS
  SMS_API_KEY?: string;
  SMS_SENDER_ID?: string;

  // Payment Gateways
  PAYSTACK_SECRET_KEY?: string;
  PAYSTACK_PUBLIC_KEY?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_PUBLIC_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  FLUTTERWAVE_SECRET_KEY?: string;
  FLUTTERWAVE_PUBLIC_KEY?: string;

  // File Upload
  CLOUDINARY_CLOUD_NAME?: string;
  CLOUDINARY_API_KEY?: string;
  CLOUDINARY_API_SECRET?: string;

  // External APIs
  GOOGLE_MAPS_API_KEY?: string;
  WEATHER_API_KEY?: string;

  // Security
  BCRYPT_ROUNDS: number;
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;

  // CORS
  FRONTEND_URL: string;
  ADMIN_URL?: string;

  // Logging
  LOG_LEVEL: string;
  LOG_FILE: string;

  // Nigerian Transport APIs
  ABC_TRANSPORT_API_KEY?: string;
  PEACE_MASS_API_KEY?: string;
  AIRPEACE_API_KEY?: string;

  // WhatsApp
  WHATSAPP_TOKEN?: string;
  WHATSAPP_PHONE_ID?: string;
}

const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'MONGODB_URI',
  'JWT_SECRET',
  'EMAIL_HOST',
  'EMAIL_USER',
  'EMAIL_PASS',
  'FRONTEND_URL'
];

// Validate required environment variables
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1);
}

export const config: Config = {
  // Server
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  API_VERSION: process.env.API_VERSION || 'v1',

  // Database
  MONGODB_URI: process.env.MONGODB_URI!,
  MONGODB_TEST_URI: process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/staya_booking_test',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET!,
  JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE || '30d',

  // Email
  EMAIL_HOST: process.env.EMAIL_HOST!,
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT || '587', 10),
  EMAIL_USER: process.env.EMAIL_USER!,
  EMAIL_PASS: process.env.EMAIL_PASS!,
  EMAIL_FROM: process.env.EMAIL_FROM || 'STAYA Bookings <noreply@staya.com>',

  // SMS
  SMS_API_KEY: process.env.SMS_API_KEY,
  SMS_SENDER_ID: process.env.SMS_SENDER_ID || 'STAYA',

  // Payment Gateways
  PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY,
  PAYSTACK_PUBLIC_KEY: process.env.PAYSTACK_PUBLIC_KEY,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  FLUTTERWAVE_SECRET_KEY: process.env.FLUTTERWAVE_SECRET_KEY,
  FLUTTERWAVE_PUBLIC_KEY: process.env.FLUTTERWAVE_PUBLIC_KEY,

  // File Upload
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

  // External APIs
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
  WEATHER_API_KEY: process.env.WEATHER_API_KEY,

  // Security
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),

  // CORS
  FRONTEND_URL: process.env.FRONTEND_URL!,
  ADMIN_URL: process.env.ADMIN_URL,

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  LOG_FILE: process.env.LOG_FILE || 'logs/app.log',

  // Nigerian Transport APIs
  ABC_TRANSPORT_API_KEY: process.env.ABC_TRANSPORT_API_KEY,
  PEACE_MASS_API_KEY: process.env.PEACE_MASS_API_KEY,
  AIRPEACE_API_KEY: process.env.AIRPEACE_API_KEY,

  // WhatsApp
  WHATSAPP_TOKEN: process.env.WHATSAPP_TOKEN,
  WHATSAPP_PHONE_ID: process.env.WHATSAPP_PHONE_ID,
};

// Log configuration in development
if (config.NODE_ENV === 'development') {
  console.log('🔧 Configuration loaded:', {
    NODE_ENV: config.NODE_ENV,
    PORT: config.PORT,
    API_VERSION: config.API_VERSION,
    MONGODB_URI: config.MONGODB_URI.replace(/\/\/.*@/, '//***:***@'), // Hide credentials
    FRONTEND_URL: config.FRONTEND_URL,
  });
}
