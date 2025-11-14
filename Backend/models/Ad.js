import mongoose from 'mongoose';

const adSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide ad title'],
    trim: true
  },
  icon: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: true
  },
  earning: {
    type: Number,
    required: true,
    default: 0.3
  },
  description: {
    type: String,
    default: 'Click and earn'
  },
  url: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  requiredLevel: {
    type: Number,
    default: 1
  },
  dailyLimit: {
    type: Number,
    default: 1 // Each ad can be clicked once per day
  },
  totalClicks: {
    type: Number,
    default: 0
  },
  totalEarningsPaid: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for faster queries
adSchema.index({ isActive: 1, displayOrder: 1 });
adSchema.index({ isPremium: 1 });

const Ad = mongoose.model('Ad', adSchema);

export default Ad;
