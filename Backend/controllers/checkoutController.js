import Checkout from '../models/Checkout.js';
import User from '../models/User.js';
import ErrorResponse from '../utils/errorResponse.js';
import fs from 'fs';

// @desc    Create checkout request
// @route   POST /api/checkouts
// @access  Private
export const createCheckout = async (req, res, next) => {
  try {
    const { amount, paymentMethod, paymentDetails, requestNote } = req.body;
    
    // Validation
    if (!amount || !paymentMethod || !paymentDetails) {
      return next(new ErrorResponse('Please provide all required fields', 400));
    }
    
    // Check minimum balance
    if (req.user.pendingBalance < amount) {
      return next(new ErrorResponse(`Insufficient balance. Available: $${req.user.pendingBalance}`, 400));
    }
    
    // Check if user has pending checkout
    const hasPending = await Checkout.hasPendingCheckout(req.user._id);
    if (hasPending) {
      return next(new ErrorResponse('You already have a pending checkout request', 400));
    }
    
    // Create checkout
    const checkout = await Checkout.create({
      user: req.user._id,
      amount,
      paymentMethod,
      paymentDetails,
      requestNote
    });
    
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
      .populate('user', 'name email phone pendingBalance')
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
    
    // Update user balance
    const user = await User.findById(checkout.user._id);
    if (user.pendingBalance < checkout.amount) {
      if (req.file) fs.unlinkSync(req.file.path);
      return next(new ErrorResponse('User has insufficient balance', 400));
    }
    
    user.pendingBalance -= checkout.amount;
    user.totalWithdrawn += checkout.amount;
    await user.save();
    
    // Complete checkout
    await checkout.complete(req.user._id, transactionId, proofImage);
    if (adminNotes) {
      checkout.adminNotes = adminNotes;
      await checkout.save();
    }
    
    await checkout.populate('user', 'name email phone pendingBalance');
    
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
    
    await checkout.reject(req.user._id, reason);
    await checkout.populate('user', 'name email phone');
    
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
    
    checkout.status = 'cancelled';
    await checkout.save();
    
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
