import mongoose from 'mongoose';

const investmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  packageName: {
    type: String,
    enum: ['Basic', 'Standard', 'Premium'],
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Please provide investment amount'],
    enum: [20, 40, 80]
  },
  dailyEarning: {
    type: Number,
    required: true
  },
  totalEarned: {
    type: Number,
    default: 0
  },
  totalDuration: {
    type: Number,
    default: 30 // 30 days
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled', 'paused'],
    default: 'active'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    default: null
  },
  lastEarningDate: {
    type: Date,
    default: null
  },
  nextEarningDate: {
    type: Date,
    default: null
  },
  daysCompleted: {
    type: Number,
    default: 0
  },
  daysRemaining: {
    type: Number,
    default: 30
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  earningHistory: [{
    amount: Number,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  notes: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Virtual for progress percentage
investmentSchema.virtual('progressPercentage').get(function() {
  return Math.floor((this.daysCompleted / this.totalDuration) * 100);
});

// Virtual for expected total return
investmentSchema.virtual('expectedReturn').get(function() {
  return this.dailyEarning * this.totalDuration;
});

// Virtual for ROI percentage
investmentSchema.virtual('roiPercentage').get(function() {
  return ((this.expectedReturn / this.amount) * 100).toFixed(2);
});

// Calculate daily earnings and set package name before saving
investmentSchema.pre('save', function(next) {
  if (this.isNew) {
    // Set daily earning and package name based on amount
    if (this.amount === 20) {
      this.dailyEarning = 2.5;
      this.packageName = 'Basic';
    }
    if (this.amount === 40) {
      this.dailyEarning = 5;
      this.packageName = 'Standard';
      this.isPopular = true;
    }
    if (this.amount === 80) {
      this.dailyEarning = 10;
      this.packageName = 'Premium';
    }
    
    // Set end date (30 days from now)
    this.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    // Set next earning date (tomorrow)
    this.nextEarningDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
  }
  next();
});

// Method to process daily earning
investmentSchema.methods.processDailyEarning = function() {
  if (this.status !== 'active') {
    return false;
  }
  
  const now = new Date();
  if (this.nextEarningDate && now >= this.nextEarningDate) {
    this.totalEarned += this.dailyEarning;
    this.lastEarningDate = now;
    this.nextEarningDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    this.daysCompleted += 1;
    this.daysRemaining -= 1;
    
    // Add to earning history
    this.earningHistory.push({
      amount: this.dailyEarning,
      date: now
    });
    
    // Check if completed
    if (this.daysRemaining <= 0) {
      this.status = 'completed';
    }
    
    return true;
  }
  
  return false;
};

// Static method to get investment packages info
investmentSchema.statics.getPackages = function() {
  return [
    {
      name: 'Basic',
      amount: 20,
      dailyEarning: 2.5,
      duration: 30,
      totalReturn: 75,
      roi: 275
    },
    {
      name: 'Standard',
      amount: 40,
      dailyEarning: 5,
      duration: 30,
      totalReturn: 150,
      roi: 275,
      isPopular: true
    },
    {
      name: 'Premium',
      amount: 80,
      dailyEarning: 10,
      duration: 30,
      totalReturn: 300,
      roi: 275
    }
  ];
};

// Index for faster queries
investmentSchema.index({ user: 1, status: 1 });
investmentSchema.index({ status: 1, nextEarningDate: 1 });
investmentSchema.index({ createdAt: -1 });

const Investment = mongoose.model('Investment', investmentSchema);

export default Investment;
