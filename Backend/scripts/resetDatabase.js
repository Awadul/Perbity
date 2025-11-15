import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from '../models/User.js';
import Payment from '../models/Payment.js';
import Checkout from '../models/Checkout.js';
import AdClick from '../models/AdClick.js';
import History from '../models/History.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

// Admin user data
const adminData = {
  name: 'Admin',
  email: 'admin@perbity.com',
  password: 'admin123',
  role: 'admin',
  phone: '+1234567890',
  balance: 0,
  isVerified: true,
  referralCode: 'ADMIN' + Date.now().toString().slice(-5)
};

// Demo user data
const demoUserData = {
  name: 'Demo User',
  email: 'demo@example.com',
  password: 'demo123',
  role: 'user',
  phone: '+1234567891',
  balance: 500.00,
  totalEarnings: 500.00,
  totalDeposits: 500.00,
  isVerified: true,
  referralCode: 'DEMO' + Date.now().toString().slice(-6)
};

const resetDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected...\n');

    console.log('🗑️  Clearing database collections...');
    
    // Clear all collections
    await User.deleteMany({});
    console.log('   ✓ Users cleared');
    
    await Payment.deleteMany({});
    console.log('   ✓ Payments cleared');
    
    await Checkout.deleteMany({});
    console.log('   ✓ Checkouts cleared');
    
    await AdClick.deleteMany({});
    console.log('   ✓ Ad Clicks cleared');
    
    await History.deleteMany({});
    console.log('   ✓ History cleared');

    console.log('\n👤 Creating new users...');

    // Create admin user
    const admin = await User.create(adminData);
    console.log('   ✓ Admin user created');
    console.log(`      Email: ${admin.email}`);
    console.log(`      Password: admin123`);

    // Create demo user
    const demoUser = await User.create(demoUserData);
    console.log('   ✓ Demo user created');
    console.log(`      Email: ${demoUser.email}`);
    console.log(`      Password: demo123`);
    console.log(`      Balance: $${demoUser.balance.toFixed(2)}`);

    console.log('\n✅ Database reset complete!');
    console.log('\n📋 Login Credentials:');
    console.log('━'.repeat(50));
    console.log('Admin:');
    console.log(`   Email:    admin@perbity.com`);
    console.log(`   Password: admin123`);
    console.log('━'.repeat(50));
    console.log('Demo User:');
    console.log(`   Email:    demo@example.com`);
    console.log(`   Password: demo123`);
    console.log(`   Balance:  $${demoUser.balance.toFixed(2)}`);
    console.log('━'.repeat(50));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  }
};

resetDatabase();
