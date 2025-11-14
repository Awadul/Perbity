import mongoose from 'mongoose';

const historySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['ad_earning', 'referral_bonus', 'daily_profit', 'withdrawal', 'deposit', 'bonus', 'refund'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['completed', 'pending', 'failed'],
    default: 'completed'
  },
  reference: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'referenceModel'
  },
  referenceModel: {
    type: String,
    enum: ['Ad', 'Payment', 'Checkout', 'User']
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
historySchema.index({ user: 1, createdAt: -1 });
historySchema.index({ user: 1, type: 1 });
historySchema.index({ createdAt: -1 });

// Static method to add history record
historySchema.statics.addRecord = async function(userId, type, amount, description, options = {}) {
  return await this.create({
    user: userId,
    type,
    amount,
    description,
    status: options.status || 'completed',
    reference: options.reference || null,
    referenceModel: options.referenceModel || null,
    metadata: options.metadata || {}
  });
};

// Static method to get user history
historySchema.statics.getUserHistory = async function(userId, options = {}) {
  const query = { user: userId };
  
  if (options.type) {
    query.type = options.type;
  }
  
  if (options.startDate || options.endDate) {
    query.createdAt = {};
    if (options.startDate) query.createdAt.$gte = new Date(options.startDate);
    if (options.endDate) query.createdAt.$lte = new Date(options.endDate);
  }
  
  return await this.find(query)
    .sort({ createdAt: -1 })
    .limit(options.limit || 100)
    .skip(options.skip || 0);
};

// Static method to get user stats from history
historySchema.statics.getUserStats = async function(userId, options = {}) {
  const matchQuery = { user: new mongoose.Types.ObjectId(userId) };
  
  if (options.startDate || options.endDate) {
    matchQuery.createdAt = {};
    if (options.startDate) matchQuery.createdAt.$gte = new Date(options.startDate);
    if (options.endDate) matchQuery.createdAt.$lte = new Date(options.endDate);
  }
  
  const stats = await this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$type',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);
  
  const result = {
    totalEarnings: 0,
    totalWithdrawals: 0,
    totalDeposits: 0,
    adEarnings: 0,
    referralBonus: 0,
    dailyProfit: 0,
    transactions: {}
  };
  
  stats.forEach(stat => {
    result.transactions[stat._id] = {
      amount: stat.totalAmount,
      count: stat.count
    };
    
    if (stat._id === 'ad_earning') result.adEarnings = stat.totalAmount;
    if (stat._id === 'referral_bonus') result.referralBonus = stat.totalAmount;
    if (stat._id === 'daily_profit') result.dailyProfit = stat.totalAmount;
    if (stat._id === 'withdrawal') result.totalWithdrawals = Math.abs(stat.totalAmount);
    if (stat._id === 'deposit') result.totalDeposits = stat.totalAmount;
    
    if (['ad_earning', 'referral_bonus', 'daily_profit', 'bonus'].includes(stat._id)) {
      result.totalEarnings += stat.totalAmount;
    }
  });
  
  return result;
};

const History = mongoose.model('History', historySchema);

export default History;
