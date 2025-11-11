import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const countUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...\n');
    
    const total = await User.countDocuments();
    const users = await User.countDocuments({ role: 'user' });
    const admins = await User.countDocuments({ role: 'admin' });
    const active = await User.countDocuments({ isActive: true });
    
    console.log('📊 User Statistics:');
    console.log(`Total users in DB: ${total}`);
    console.log(`Regular users: ${users}`);
    console.log(`Admins: ${admins}`);
    console.log(`Active users: ${active}\n`);
    
    const allUsers = await User.find({}, 'name email role isActive createdAt').lean();
    console.log('👥 All Users:');
    allUsers.forEach(u => {
      console.log(`- ${u.name} (${u.email})`);
      console.log(`  Role: ${u.role}, Active: ${u.isActive}, Created: ${new Date(u.createdAt).toLocaleDateString()}\n`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

countUsers();
