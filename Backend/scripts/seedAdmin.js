import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

// Admin user data
const adminData = {
  name: 'Admin User',
  email: 'admin@perbity.com',
  password: 'admin123456',
  role: 'admin',
  phone: '+1234567890',
  country: 'United States',
  isEmailVerified: true,
  isActive: true
};

// Demo user data
const demoUserData = {
  name: 'Demo User',
  email: 'demo@example.com',
  password: 'demo123',
  role: 'user',
  phone: '+1234567891',
  country: 'United States',
  isEmailVerified: true,
  isActive: true,
  earnings: {
    ads: 15.5,
    referrals: 7.5,
    emails: 5.0,
    reviews: 3.0,
    investments: 25.0
  },
  todayEarnings: {
    ads: 2.1,
    referrals: 1.5
  },
  totalEarnings: 56.0,
  totalWithdrawn: 20.0,
  pendingBalance: 36.0,
  lifetimeEarnings: 76.0,
  level: 3,
  experience: 250,
  team: {
    totalMembers: 5,
    activeMembers: 3,
    teamEarnings: 15.5
  },
  unlockedFeatures: {
    emails: true,
    reviews: false,
    premiumAds: false,
    instantWithdrawal: false
  }
};

const seedAdmin = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Check if admin already exists
    let admin = await User.findOne({ email: adminData.email });
    if (admin) {
      console.log('✅ Admin user already exists');
      console.log(`   Email: ${admin.email}`);
    } else {
      admin = await User.create(adminData);
      console.log(`✅ Admin user created: ${admin.email}`);
    }
    
    // Check if demo user already exists
    let demoUser = await User.findOne({ email: demoUserData.email });
    if (demoUser) {
      console.log('✅ Demo user already exists');
      console.log(`   Email: ${demoUser.email}`);
      console.log(`   Referral Code: ${demoUser.referralCode}`);
    } else {
      demoUser = await User.create(demoUserData);
      console.log(`✅ Demo user created: ${demoUser.email}`);
      console.log(`   Referral Code: ${demoUser.referralCode}`);
      console.log(`   Referral Link: ${demoUser.referralLink}`);
    }
    
    console.log('\n📋 Login Credentials:');
    console.log('Admin - Email: admin@perbity.com, Password: admin123456');
    console.log('Demo  - Email: demo@example.com, Password: demo123');
    
    console.log('\n✅ User seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding users:', error.message);
    process.exit(1);
  }
};

// Run the seed function
seedAdmin();
