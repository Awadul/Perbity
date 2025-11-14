import mongoose from 'mongoose';

const checkoutSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Please provide checkout amount'],
    min: [15, 'Minimum checkout amount is $15'],
    max: [10000, 'Maximum checkout amount is $10,000']
  },
  paymentMethod: {
    type: String,
    required: [true, 'Please provide payment method'],
    enum: ['binance', 'paypal', 'bank', 'crypto', 'wise', 'skrill', 'easypaisa']
  },
  paymentDetails: {
    email: String,
    accountNumber: String,
    accountName: String,
    accountHolderName: String,
    bankName: String,
    walletAddress: String,
    phoneNumber: String,
    binanceId: String
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'rejected', 'cancelled'],
    default: 'pending'
  },
  requestNote: {
    type: String,
    default: null
  },
  adminNotes: {
    type: String,
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
  proofImage: {
    type: String, // Payment proof uploaded by admin
    default: null
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
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
  }
}, {
  timestamps: true
});

// Index for faster queries
checkoutSchema.index({ user: 1, status: 1 });
checkoutSchema.index({ status: 1, requestedAt: -1 });

// Static method to check if user has pending checkout
checkoutSchema.statics.hasPendingCheckout = async function(userId) {
  const pending = await this.findOne({
    user: userId,
    status: { $in: ['pending', 'processing'] }
  });
  return !!pending;
};

// Method to approve and complete checkout
checkoutSchema.methods.complete = function(adminId, transactionId, proofImage) {
  this.status = 'completed';
  this.processedBy = adminId;
  this.processedAt = new Date();
  this.completedAt = new Date();
  this.transactionId = transactionId;
  if (proofImage) {
    this.proofImage = proofImage;
  }
  
  return this.save();
};

// Method to reject checkout
checkoutSchema.methods.reject = function(adminId, reason) {
  this.status = 'rejected';
  this.processedBy = adminId;
  this.processedAt = new Date();
  this.rejectionReason = reason;
  
  return this.save();
};

// Method to mark as processing
checkoutSchema.methods.markProcessing = function(adminId) {
  this.status = 'processing';
  this.processedBy = adminId;
  this.processedAt = new Date();
  
  return this.save();
};

const Checkout = mongoose.model('Checkout', checkoutSchema);

export default Checkout;
