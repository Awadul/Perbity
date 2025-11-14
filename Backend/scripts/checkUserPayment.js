import mongoose from 'mongoose';
import Payment from '../models/Payment.js';
import User from '../models/User.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const checkUserPayment = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...\n');
    
    // Find user by email (change this to the test user's email)
    const user = await User.findOne({ email: 'demo@example.com' });
    
    if (!user) {
      console.log('❌ User not found!');
      console.log('Available users:');
      const users = await User.find({}, 'name email').limit(5);
      users.forEach(u => console.log(`  - ${u.name} (${u.email})`));
      process.exit(1);
    }
    
    console.log(`✅ Found user: ${user.name} (${user.email})\n`);
    
    // Check for active payment
    const activePayment = await Payment.findOne({
      user: user._id,
      isActive: true,
      status: 'approved'
    }).populate('paymentPlan');
    
    if (activePayment) {
      console.log('✅ User HAS an active payment:');
      console.log(`   Plan: ${activePayment.paymentPlan.name}`);
      console.log(`   Price: $${activePayment.paymentPlan.price}`);
      console.log(`   Daily Ads Limit: ${activePayment.paymentPlan.dailyAdsLimit}`);
      console.log(`   Status: ${activePayment.status}`);
      console.log(`   Active: ${activePayment.isActive}`);
      console.log(`   Expires: ${activePayment.expiresAt}`);
    } else {
      console.log('❌ User has NO active payment');
      
      // Check for any payments
      const anyPayments = await Payment.find({ user: user._id }).populate('paymentPlan');
      console.log(`\nFound ${anyPayments.length} total payments for this user:`);
      anyPayments.forEach((p, i) => {
        console.log(`\n  Payment ${i + 1}:`);
        console.log(`    Plan: ${p.paymentPlan?.name || 'Unknown'}`);
        console.log(`    Status: ${p.status}`);
        console.log(`    Active: ${p.isActive}`);
        console.log(`    Created: ${p.createdAt}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

checkUserPayment();
