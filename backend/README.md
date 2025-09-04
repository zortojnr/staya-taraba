# STAYA Backend API

A comprehensive Node.js/Express backend for the STAYA travel booking platform, featuring authentication, booking management, payment processing, and admin capabilities.

## 🚀 Features

### Core Features
- **User Authentication & Authorization** - JWT-based auth with email verification
- **Booking Management** - Complete booking lifecycle with status tracking
- **Payment Processing** - Multiple Nigerian payment gateways (Paystack, Flutterwave)
- **Location & Route Management** - Dynamic route pricing and availability
- **Email Notifications** - Automated emails for bookings, payments, etc.
- **Admin Dashboard** - Comprehensive admin panel with analytics
- **Rate Limiting** - Protection against abuse and spam
- **Data Validation** - Comprehensive input validation with Joi

### Nigerian Travel Focus
- **Taraba State Priority** - Special focus on Taraba State destinations
- **Local Payment Methods** - Paystack and Flutterwave integration
- **Nigerian Phone Validation** - Proper Nigerian phone number formats
- **Local Operators** - Support for Nigerian transport operators
- **Naira Currency** - All pricing in Nigerian Naira (₦)

## 🛠 Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with bcrypt
- **Validation**: Joi
- **Email**: Nodemailer
- **Payments**: Paystack, Stripe, Flutterwave
- **Security**: Helmet, CORS, Rate Limiting
- **Language**: TypeScript

## 📋 Prerequisites

- Node.js 18.0.0 or higher
- MongoDB 5.0 or higher
- npm or yarn package manager

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/staya_booking
   
   # JWT
   JWT_SECRET=your_super_secret_jwt_key_here
   
   # Email
   EMAIL_HOST=smtp.gmail.com
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   
   # Paystack (Nigerian payments)
   PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key
   PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

5. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication Endpoints
```
POST /auth/register          - Register new user
POST /auth/login             - Login user
POST /auth/refresh-token     - Refresh JWT token
GET  /auth/verify-email/:token - Verify email address
POST /auth/forgot-password   - Request password reset
POST /auth/reset-password/:token - Reset password
POST /auth/change-password   - Change password (authenticated)
GET  /auth/me               - Get current user profile
```

### Booking Endpoints
```
GET  /bookings/my-bookings  - Get user's bookings
POST /bookings              - Create new booking
GET  /bookings/:id          - Get booking details
PUT  /bookings/:id          - Update booking
POST /bookings/:id/cancel   - Cancel booking
```

### Payment Endpoints
```
POST /payments/initialize   - Initialize payment
GET  /payments/verify/:ref  - Verify payment
GET  /payments/my-payments  - Get user's payments
POST /payments/webhook/*    - Payment webhooks
```

### Location & Route Endpoints
```
GET  /locations             - Get all locations
GET  /locations/:id         - Get location details
GET  /routes                - Get all routes
GET  /routes/search         - Search routes
POST /routes/calculate-price - Calculate route pricing
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### User Roles
- **user** - Regular users (default)
- **admin** - Full system access
- **operator** - Transport operator access

## 💳 Payment Integration

### Supported Payment Methods
1. **Paystack** - Primary Nigerian payment processor
2. **Flutterwave** - Alternative Nigerian payment processor
3. **Stripe** - International payments
4. **Bank Transfer** - Manual bank transfers

### Payment Flow
1. Initialize payment with booking details
2. Redirect user to payment gateway
3. Handle webhook notifications
4. Update booking and payment status
5. Send confirmation emails

## 📧 Email Templates

The system includes professional email templates for:
- Account verification
- Password reset
- Booking confirmation
- Payment confirmation
- Booking cancellation

## 🛡 Security Features

- **Rate Limiting** - Prevents abuse and spam
- **Input Validation** - Comprehensive data validation
- **Password Hashing** - bcrypt with configurable rounds
- **JWT Security** - Secure token generation and validation
- **CORS Protection** - Configurable cross-origin policies
- **Helmet Security** - Security headers and protection

## 📊 Admin Features

- **Dashboard Analytics** - Booking and revenue statistics
- **User Management** - User roles and status management
- **Booking Management** - Booking approval and cancellation
- **Payment Management** - Payment tracking and refunds
- **Route Management** - Route and pricing management
- **Reports** - Comprehensive reporting system

## 🚀 Deployment

### Environment Variables
Ensure all required environment variables are set:
- Database connection
- JWT secrets
- Email configuration
- Payment gateway keys
- CORS origins

### Production Checklist
- [ ] Set NODE_ENV=production
- [ ] Configure production database
- [ ] Set up email service
- [ ] Configure payment webhooks
- [ ] Set up monitoring and logging
- [ ] Configure reverse proxy (nginx)
- [ ] Set up SSL certificates

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint
```

## 📝 Development

### Project Structure
```
src/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/          # Database models
├── routes/          # API routes
├── services/        # Business logic services
├── types/           # TypeScript type definitions
└── server.ts        # Main server file
```

### Adding New Features
1. Create model in `models/`
2. Add validation in `middleware/validation.ts`
3. Create controller in `controllers/`
4. Add routes in `routes/`
5. Update types in `types/`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions:
- **Phone**: 09115915128
- **WhatsApp**: Available
- **Email**: support@staya.com

---

**STAYA** - Connect Taraba State to Nigeria and the world 🌍
