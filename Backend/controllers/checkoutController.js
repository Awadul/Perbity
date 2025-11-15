import Checkout from '../models/Checkout.js';
import User from '../models/User.js';
import History from '../models/History.js';
import ErrorResponse from '../utils/errorResponse.js';
import fs from 'fs';

// @desc    Create checkout request
// @route   POST /api/checkouts
// @access  Private
export const createCheckout = async (req, res, next) => {
  try {
    const { amount, paymentMethod, paymentDetails, requestNote } = req.body;
    
    // Validation
    if (!amount || !paymentMethod) {
      return next(new ErrorResponse('Please provide amount and payment method', 400));
    }
    
    // Convert amount to number
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      // Delete uploaded file if exists
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return next(new ErrorResponse('Invalid amount', 400));
    }
    
    // Check if QR code image was uploaded (required for Binance)
    if (paymentMethod === 'binance' && !req.file) {
      return next(new ErrorResponse('Please upload your Binance QR code', 400));
    }
    
    // Check minimum balance
    if (req.user.balance < numAmount) {
      // Delete uploaded file if exists
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return next(new ErrorResponse(`Insufficient balance. Available: $${req.user.balance}`, 400));
    }
    
    // Check if user has pending checkout
    const hasPending = await Checkout.hasPendingCheckout(req.user._id);
    if (hasPending) {
      // Delete uploaded file if exists
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return next(new ErrorResponse('You already have a pending checkout request', 400));
    }
    
    // Deduct amount from user balance immediately
    req.user.balance -= numAmount;
    await req.user.save();

    // Create checkout data
    const checkoutData = {
      user: req.user._id,
      amount: numAmount,
      paymentMethod,
      paymentDetails: paymentDetails ? JSON.parse(paymentDetails) : {},
      requestNote
    };

    // Add QR code image if uploaded
    if (req.file) {
      checkoutData.qrCodeImage = req.file.path;
    }

    // Create checkout
    const checkout = await Checkout.create(checkoutData);

    // Add to history
    await History.addRecord(
      req.user._id,
      'withdrawal',
      -numAmount,
      `Withdrawal request of $${numAmount.toFixed(2)} via ${paymentMethod}`,
      {
        status: 'pending',
        reference: checkout._id,
        referenceModel: 'Checkout',
        metadata: {
          paymentMethod,
          checkoutId: checkout._id
        }
      }
    );
    
    res.status(201).json({
      success: true,
      message: 'Checkout request submitted successfully',
      data: checkout
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user checkout requests
// @route   GET /api/checkouts/my-checkouts
// @access  Private
export const getMyCheckouts = async (req, res, next) => {
  try {
    const { status } = req.query;
    
    const query = { user: req.user._id };
    if (status) {
      query.status = status;
    }
    
    const checkouts = await Checkout.find(query)
      .populate('processedBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: checkouts.length,
      data: checkouts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all checkout requests (Admin)
// @route   GET /api/checkouts/admin/all
// @access  Private/Admin
export const getAllCheckouts = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (status) {
      query.status = status;
    }
    
    const checkouts = await Checkout.find(query)
      .populate('user', 'name email phone balance')
      .populate('processedBy', 'name email')
      .sort({ requestedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await Checkout.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: checkouts.length,
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: page,
      data: checkouts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark checkout as processing (Admin)
// @route   PUT /api/checkouts/:id/processing
// @access  Private/Admin
export const markCheckoutProcessing = async (req, res, next) => {
  try {
    const checkout = await Checkout.findById(req.params.id);
    
    if (!checkout) {
      return next(new ErrorResponse('Checkout request not found', 404));
    }
    
    if (checkout.status !== 'pending') {
      return next(new ErrorResponse(`Cannot process checkout with status: ${checkout.status}`, 400));
    }
    
    await checkout.markProcessing(req.user._id);
    await checkout.populate('user', 'name email phone');
    
    res.status(200).json({
      success: true,
      message: 'Checkout marked as processing',
      data: checkout
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete checkout (Admin)
// @route   PUT /api/checkouts/:id/complete
// @access  Private/Admin
export const completeCheckout = async (req, res, next) => {
  try {
    const { transactionId, adminNotes } = req.body;
    
    if (!transactionId) {
      return next(new ErrorResponse('Please provide transaction ID', 400));
    }
    
    const checkout = await Checkout.findById(req.params.id).populate('user');
    
    if (!checkout) {
      return next(new ErrorResponse('Checkout request not found', 404));
    }
    
    if (checkout.status === 'completed') {
      return next(new ErrorResponse('Checkout already completed', 400));
    }
    
    if (checkout.status === 'rejected' || checkout.status === 'cancelled') {
      return next(new ErrorResponse(`Cannot complete checkout with status: ${checkout.status}`, 400));
    }
    
    // Get proof image if uploaded
    let proofImage = null;
    if (req.file) {
      proofImage = req.file.path;
    }
    
    // Update user totalWithdrawn (balance already deducted when request was created)
    const user = await User.findById(checkout.user._id);
    user.totalWithdrawn = (user.totalWithdrawn || 0) + checkout.amount;
    await user.save();
    
    // Complete checkout
    await checkout.complete(req.user._id, transactionId, proofImage);
    if (adminNotes) {
      checkout.adminNotes = adminNotes;
      await checkout.save();
    }
    
    // Update history record status to completed
    await History.findOneAndUpdate(
      { 
        reference: checkout._id,
        referenceModel: 'Checkout',
        type: 'withdrawal'
      },
      { 
        status: 'completed',
        $set: {
          'metadata.completedAt': new Date(),
          'metadata.transactionId': transactionId,
          'metadata.processedBy': req.user._id
        }
      }
    );
    
    await checkout.populate('user', 'name email phone balance');
    
    res.status(200).json({
      success: true,
      message: 'Checkout completed successfully',
      data: checkout
    });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    next(error);
  }
};

// @desc    Reject checkout (Admin)
// @route   PUT /api/checkouts/:id/reject
// @access  Private/Admin
export const rejectCheckout = async (req, res, next) => {
  try {
    const { reason } = req.body;
    
    if (!reason) {
      return next(new ErrorResponse('Please provide rejection reason', 400));
    }
    
    const checkout = await Checkout.findById(req.params.id);
    
    if (!checkout) {
      return next(new ErrorResponse('Checkout request not found', 404));
    }
    
    if (checkout.status === 'completed') {
      return next(new ErrorResponse('Cannot reject completed checkout', 400));
    }
    
    // Refund the amount back to user balance
    const user = await User.findById(checkout.user._id);
    user.balance += checkout.amount;
    await user.save();
    
    await checkout.reject(req.user._id, reason);
    await checkout.populate('user', 'name email phone');
    
    // Update history record status to rejected
    await History.findOneAndUpdate(
      { 
        reference: checkout._id,
        referenceModel: 'Checkout',
        type: 'withdrawal'
      },
      { 
        status: 'rejected',
        description: `Withdrawal rejected: ${reason}`,
        $set: {
          'metadata.rejectedAt': new Date(),
          'metadata.rejectionReason': reason,
          'metadata.processedBy': req.user._id
        }
      }
    );
    
    res.status(200).json({
      success: true,
      message: 'Checkout rejected',
      data: checkout
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel checkout (User)
// @route   PUT /api/checkouts/:id/cancel
// @access  Private
export const cancelCheckout = async (req, res, next) => {
  try {
    const checkout = await Checkout.findById(req.params.id);
    
    if (!checkout) {
      return next(new ErrorResponse('Checkout request not found', 404));
    }
    
    // Check ownership
    if (checkout.user.toString() !== req.user._id.toString()) {
      return next(new ErrorResponse('Not authorized to cancel this checkout', 403));
    }
    
    if (checkout.status !== 'pending') {
      return next(new ErrorResponse(`Cannot cancel checkout with status: ${checkout.status}`, 400));
    }
    
    // Refund the amount back to user balance
    const user = await User.findById(checkout.user._id);
    user.balance += checkout.amount;
    await user.save();
    
    checkout.status = 'cancelled';
    await checkout.save();
    
    // Update history record status to cancelled
    await History.findOneAndUpdate(
      { 
        reference: checkout._id,
        referenceModel: 'Checkout',
        type: 'withdrawal'
      },
      { 
        status: 'cancelled',
        description: `Withdrawal cancelled by user`,
        $set: {
          'metadata.cancelledAt': new Date()
        }
      }
    );
    
    res.status(200).json({
      success: true,
      message: 'Checkout cancelled',
      data: checkout
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get checkout statistics (Admin)
// @route   GET /api/checkouts/admin/stats
// @access  Private/Admin
export const getCheckoutStats = async (req, res, next) => {
  try {
    const stats = await Checkout.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);
    
    const total = await Checkout.countDocuments();
    const totalAmount = await Checkout.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        stats,
        total,
        totalAmount: totalAmount[0]?.total || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get checkout QR code image (Admin)
// @route   GET /api/checkouts/:id/qr-code
// @access  Private/Admin
export const getCheckoutQrCode = async (req, res, next) => {
  try {
    const checkout = await Checkout.findById(req.params.id);
    
    if (!checkout) {
      return next(new ErrorResponse('Checkout not found', 404));
    }
    
    if (!checkout.qrCodeImage) {
      return next(new ErrorResponse('QR code not found for this checkout', 404));
    }
    
    // Check if file exists (path is already absolute)
    if (!fs.existsSync(checkout.qrCodeImage)) {
      return next(new ErrorResponse('QR code file not found', 404));
    }
    
    // Send file directly (path is already absolute)
    res.sendFile(checkout.qrCodeImage);
  } catch (error) {
    next(error);
  }
};
