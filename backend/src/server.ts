import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config/config';
import { database } from './config/database';
import { globalErrorHandler, notFound } from './middleware/errorHandler';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import locationRoutes from './routes/locations';
import routeRoutes from './routes/routes';
import bookingRoutes from './routes/bookings';
import paymentRoutes from './routes/payments';
import adminRoutes from './routes/admin';

const app = express();

// Trust proxy (important for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
const corsOptions = {
  origin: [
    config.FRONTEND_URL,
    config.ADMIN_URL,
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173'
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Compression middleware
app.use(compression());

// Logging middleware
if (config.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  skipSuccessfulRequests: true,
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'STAYA API is running',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    version: config.API_VERSION
  });
});

// API routes
const apiRouter = express.Router();

// Apply auth rate limiting to auth routes
apiRouter.use('/auth', authLimiter, authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/locations', locationRoutes);
apiRouter.use('/routes', routeRoutes);
apiRouter.use('/bookings', bookingRoutes);
apiRouter.use('/payments', paymentRoutes);
apiRouter.use('/admin', adminRoutes);

// Mount API routes
app.use(`/api/${config.API_VERSION}`, apiRouter);

// Welcome route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to STAYA Travel Booking API',
    version: config.API_VERSION,
    documentation: `/api/${config.API_VERSION}/docs`,
    endpoints: {
      auth: `/api/${config.API_VERSION}/auth`,
      users: `/api/${config.API_VERSION}/users`,
      locations: `/api/${config.API_VERSION}/locations`,
      routes: `/api/${config.API_VERSION}/routes`,
      bookings: `/api/${config.API_VERSION}/bookings`,
      payments: `/api/${config.API_VERSION}/payments`,
      admin: `/api/${config.API_VERSION}/admin`
    }
  });
});

// Handle 404 for unmatched routes
app.use(notFound);

// Global error handling middleware
app.use(globalErrorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await database.connect();
    
    // Start listening
    const server = app.listen(config.PORT, () => {
      console.log(`
🚀 STAYA API Server Started Successfully!
📍 Environment: ${config.NODE_ENV}
🌐 Server: http://localhost:${config.PORT}
📚 API: http://localhost:${config.PORT}/api/${config.API_VERSION}
🏥 Health: http://localhost:${config.PORT}/health
      `);
    });

    // Graceful shutdown
    const gracefulShutdown = (signal: string) => {
      console.log(`\n🛑 ${signal} received. Starting graceful shutdown...`);
      
      server.close(async () => {
        console.log('✅ HTTP server closed.');
        
        try {
          await database.disconnect();
          console.log('✅ Database connection closed.');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error during database shutdown:', error);
          process.exit(1);
        }
      });

      // Force close after 30 seconds
      setTimeout(() => {
        console.error('❌ Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 30000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;
