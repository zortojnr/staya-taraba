#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up STAYA Backend...\n');

// Check Node.js version
const nodeVersion = process.version;
const requiredVersion = 'v18.0.0';
if (nodeVersion < requiredVersion) {
  console.error(`❌ Node.js ${requiredVersion} or higher is required. Current version: ${nodeVersion}`);
  process.exit(1);
}
console.log(`✅ Node.js version: ${nodeVersion}`);

// Check if .env file exists
const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', '.env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Created .env file from .env.example');
    console.log('⚠️  Please edit .env file with your configuration before starting the server');
  } else {
    console.error('❌ .env.example file not found');
    process.exit(1);
  }
} else {
  console.log('✅ .env file already exists');
}

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  console.log('✅ Dependencies installed successfully');
} catch (error) {
  console.error('❌ Failed to install dependencies');
  process.exit(1);
}

// Build TypeScript
console.log('\n🔨 Building TypeScript...');
try {
  execSync('npm run build', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  console.log('✅ TypeScript build successful');
} catch (error) {
  console.error('❌ TypeScript build failed');
  process.exit(1);
}

// Create logs directory
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
  console.log('✅ Created logs directory');
}

// Create uploads directory
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log('✅ Created uploads directory');
}

console.log('\n🎉 Setup completed successfully!\n');

console.log('📋 Next steps:');
console.log('1. Edit .env file with your configuration');
console.log('2. Start MongoDB service');
console.log('3. Run: npm run dev (for development)');
console.log('4. Run: npm start (for production)');
console.log('\n📚 API will be available at: http://localhost:5000/api/v1');
console.log('🏥 Health check: http://localhost:5000/health');

console.log('\n🔧 Required environment variables:');
console.log('- MONGODB_URI: MongoDB connection string');
console.log('- JWT_SECRET: Secret key for JWT tokens');
console.log('- EMAIL_HOST, EMAIL_USER, EMAIL_PASS: Email configuration');
console.log('- PAYSTACK_SECRET_KEY: For Nigerian payments');
console.log('- FRONTEND_URL: Your frontend application URL');

console.log('\n📞 Support: 09115915128 | WhatsApp available');
console.log('🌍 STAYA - Connect Taraba State to Nigeria and the world');
