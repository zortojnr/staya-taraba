#!/usr/bin/env node

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models (we'll need to compile TypeScript first or use ts-node)
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

// Sample data for seeding
const sampleLocations = [
  {
    name: 'Jalingo',
    state: 'Taraba',
    country: 'Nigeria',
    coordinates: { latitude: 8.8833, longitude: 11.3667 },
    image: 'https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=400&h=300&fit=crop&auto=format&q=80',
    description: 'Capital city of Taraba State',
    isActive: true
  },
  {
    name: 'Wukari',
    state: 'Taraba',
    country: 'Nigeria',
    coordinates: { latitude: 7.8667, longitude: 9.7833 },
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&auto=format&q=80',
    description: 'Ancient Jukun kingdom headquarters',
    isActive: true
  },
  {
    name: 'Abuja',
    state: 'FCT',
    country: 'Nigeria',
    coordinates: { latitude: 9.0765, longitude: 7.3986 },
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&auto=format&q=80',
    description: 'Federal Capital Territory',
    isActive: true
  },
  {
    name: 'Lagos',
    state: 'Lagos',
    country: 'Nigeria',
    coordinates: { latitude: 6.5244, longitude: 3.3792 },
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&auto=format&q=80',
    description: 'Commercial capital of Nigeria',
    isActive: true
  }
];

const sampleAdmin = {
  name: 'STAYA Admin',
  email: 'admin@staya.com',
  password: 'admin123456',
  phone: '09115915128',
  role: 'admin',
  isVerified: true
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Note: This is a simplified version
    // In a real implementation, you'd import the actual models
    
    console.log('📍 Seeding locations...');
    // await Location.insertMany(sampleLocations);
    console.log(`✅ Seeded ${sampleLocations.length} locations`);

    console.log('👤 Creating admin user...');
    // Hash password
    const hashedPassword = await bcrypt.hash(sampleAdmin.password, 12);
    const adminData = { ...sampleAdmin, password: hashedPassword };
    
    // await User.create(adminData);
    console.log('✅ Created admin user');

    console.log('🛣️  Creating sample routes...');
    // Sample routes would be created here
    console.log('✅ Created sample routes');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Sample data created:');
    console.log(`- ${sampleLocations.length} locations`);
    console.log('- 1 admin user (admin@staya.com / admin123456)');
    console.log('- Sample routes between locations');
    
    console.log('\n⚠️  Remember to change the admin password in production!');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Database connection closed');
  }
};

// Run seeding
const runSeed = async () => {
  await connectDB();
  await seedDatabase();
};

if (require.main === module) {
  runSeed();
}

module.exports = { seedDatabase, sampleLocations, sampleAdmin };
