import mongoose from 'mongoose';

const withdrawalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Please provide withdrawal amount'],
    min: [15, 'Minimum withdrawal amount is $15'],
    max: [1000, 'Maximum withdrawal amount is $1000']
  },
  fee: {
    type: Number,
    default: 0
  },
  netAmount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    required: [true, 'Please provide payment method'],
    enum: ['paypal', 'bank', 'crypto', 'wise', 'skrill', 'other']
  },
  paymentDetails: {
    email: String,
    accountNumber: String,
    accountName: String,
    bankName: String,
    walletAddress: String,
    phoneNumber: String
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'rejected', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['normal', 'instant'],
    default: 'normal'
  },
  processingTime: {
    type: String,
    default: '12 hours'
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  processedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    default: null
  },
  transactionId: {
    type: String,
    default: null
  },
  screenshot: {
    type: String,
    default: null
  },
  notes: {
    type: String,
    default: null
  },
  adminNotes: {
    type: String,
    default: null
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Virtual for processing duration
withdrawalSchema.virtual('processingDuration').get(function() {
  if (this.completedAt && this.requestedAt) {
    const duration = this.completedAt - this.requestedAt;
    const hours = Math.floor(duration / (1000 * 60 * 60));
    return `${hours} hours`;
  }
  return null;
});

// Calculate net amount before saving
withdrawalSchema.pre('save', function(next) {
  if (this.isNew) {
    // Calculate fee (e.g., 2% for normal, 5% for instant)
    if (this.priority === 'instant') {
      this.fee = this.amount * 0.05;
      this.processingTime = 'Few seconds';
    } else {
      this.fee = this.amount * 0.02;
      this.processingTime = '12 hours';
    }
    
    this.netAmount = this.amount - this.fee;
  }
  next();
});

// Static method to get withdrawal limits
withdrawalSchema.statics.getLimits = function() {
  return {
    min: 15,
    max: 1000,
    processingTime: '12 hours',
    instantFee: 5, // percentage
    normalFee: 2 // percentage
  };
};

// Static method to check if user has pending withdrawals
withdrawalSchema.statics.hasPendingWithdrawal = async function(userId) {
  const pending = await this.findOne({
    user: userId,
    status: { $in: ['pending', 'processing'] }
  });
  return !!pending;
};

// Index for faster queries
withdrawalSchema.index({ user: 1, status: 1 });
withdrawalSchema.index({ status: 1, requestedAt: -1 });
withdrawalSchema.index({ createdAt: -1 });

const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema);

export default Withdrawal;
