import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const updateDemoBalance = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected...');

    // Find demo user
    const demoUser = await User.findOne({ email: 'demo@example.com' });

    if (!demoUser) {
      console.log('❌ Demo user not found!');
      console.log('Please run: node scripts/seedAdmin.js first');
      process.exit(1);
    }

    // Update balance to $500 for testing
    demoUser.balance = 500.00;
    demoUser.totalEarnings = 500.00;
    demoUser.totalDeposits = 500.00;
    await demoUser.save();

    console.log('✅ Demo user balance updated successfully!');
    console.log(`   Email: ${demoUser.email}`);
    console.log(`   New Balance: $${demoUser.balance.toFixed(2)}`);
    console.log(`   Total Earnings: $${demoUser.totalEarnings.toFixed(2)}`);
    console.log(`   Name: ${demoUser.name}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating demo balance:', error);
    process.exit(1);
  }
};

updateDemoBalance();
