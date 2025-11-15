import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  paymentPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PaymentPlan',
    required: false,
    default: null
  },
  amount: {
    type: Number,
    required: [true, 'Please provide payment amount'],
    min: [0, 'Amount must be positive']
  },
  paymentMethod: {
    type: String,
    enum: ['binance', 'paypal', 'bank', 'crypto', 'other'],
    default: 'binance'
  },
  accountName: {
    type: String,
    trim: true,
    default: null
  },
  proofImage: {
    type: String, // Path to uploaded image
    required: function() {
      // Only required if status is pending (user payment)
      // Not required if approved by admin (admin assignment)
      return this.status === 'pending';
    },
    default: null
  },
  transactionId: {
    type: String,
    trim: true,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'expired'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    default: null
  },
  rejectionReason: {
    type: String,
    default: null
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  expiresAt: {
    type: Date,
    default: null
  },
  activatedAt: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for faster queries
paymentSchema.index({ user: 1, status: 1 });
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ isActive: 1, expiresAt: 1 });

// Check if payment has expired
paymentSchema.methods.checkExpiration = function() {
  if (this.isActive && this.expiresAt && new Date() > this.expiresAt) {
    this.isActive = false;
    this.status = 'expired';
    return true;
  }
  return false;
};

// Approve payment and activate plan
paymentSchema.methods.approve = async function(adminId) {
  this.status = 'approved';
  this.approvedBy = adminId;
  this.approvedAt = new Date();
  this.isActive = true;
  this.activatedAt = new Date();
  
  // Set expiration date based on plan duration
  const plan = await mongoose.model('PaymentPlan').findById(this.paymentPlan);
  if (plan) {
    this.expiresAt = new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000);
  }
  
  return await this.save();
};

// Reject payment
paymentSchema.methods.reject = function(adminId, reason) {
  this.status = 'rejected';
  this.approvedBy = adminId;
  this.approvedAt = new Date();
  this.rejectionReason = reason;
  this.isActive = false;
  
  return this.save();
};

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
