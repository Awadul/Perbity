import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const checkUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...\n');
    
    // Find admin and demo users
    const users = await User.find({ 
      email: { $in: ['admin@perbity.com', 'demo@example.com'] }
    }).select('name email role isActive isEmailVerified phone createdAt');
    
    if (users.length === 0) {
      console.log('❌ No users found in database!');
      console.log('Run: node scripts/seedAdmin.js to create them.\n');
    } else {
      console.log('📋 Users in Database:\n');
      users.forEach(user => {
        console.log(`👤 ${user.role.toUpperCase()}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Phone: ${user.phone}`);
        console.log(`   Active: ${user.isActive}`);
        console.log(`   Verified: ${user.isEmailVerified}`);
        console.log(`   Created: ${user.createdAt.toLocaleDateString()}`);
        console.log('');
      });
      
      console.log('🔑 Login Credentials:');
      const admin = users.find(u => u.role === 'admin');
      const demo = users.find(u => u.role === 'user');
      
      if (admin) {
        console.log(`   Admin: ${admin.email} / admin123456`);
      }
      if (demo) {
        console.log(`   Demo:  ${demo.email} / demo123`);
      }
      console.log('');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkUsers();
