import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

interface Config {
  NODE_ENV: string;
  PORT: number;
  
  // Supabase
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_KEY: string;
  
  // JWT
  JWT_SECRET: string;
  
  // Email
  EMAIL_HOST: string;
  EMAIL_PORT: number;
  EMAIL_USER: string;
  EMAIL_PASS: string;
  EMAIL_FROM: string;
  
  // Paystack
  PAYSTACK_SECRET_KEY: string;
  PAYSTACK_PUBLIC_KEY: string;
  
  // Frontend
  FRONTEND_URL: string;
  
  // WhatsApp
  WHATSAPP_PHONE?: string;
}

const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_KEY',
  'JWT_SECRET',
  'EMAIL_HOST',
  'EMAIL_USER',
  'EMAIL_PASS',
  'PAYSTACK_SECRET_KEY',
  'FRONTEND_URL'
];

// Validate required environment variables
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1);
}

export const config: Config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  
  // Supabase
  SUPABASE_URL: process.env.SUPABASE_URL!,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY!,
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET!,
  
  // Email
  EMAIL_HOST: process.env.EMAIL_HOST!,
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT || '587', 10),
  EMAIL_USER: process.env.EMAIL_USER!,
  EMAIL_PASS: process.env.EMAIL_PASS!,
  EMAIL_FROM: process.env.EMAIL_FROM || 'STAYA Bookings <noreply@staya.com>',
  
  // Paystack
  PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY!,
  PAYSTACK_PUBLIC_KEY: process.env.PAYSTACK_PUBLIC_KEY!,
  
  // Frontend
  FRONTEND_URL: process.env.FRONTEND_URL!,
  
  // WhatsApp
  WHATSAPP_PHONE: process.env.WHATSAPP_PHONE,
};

// Log configuration in development
if (config.NODE_ENV === 'development') {
  console.log('🔧 Configuration loaded:', {
    NODE_ENV: config.NODE_ENV,
    PORT: config.PORT,
    SUPABASE_URL: config.SUPABASE_URL,
    FRONTEND_URL: config.FRONTEND_URL,
  });
}
