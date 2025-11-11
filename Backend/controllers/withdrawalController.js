import Withdrawal from '../models/Withdrawal.js';
import User from '../models/User.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Get user's withdrawals
// @route   GET /api/withdrawals
// @access  Private
export const getWithdrawals = async (req, res, next) => {
  try {
    const withdrawals = await Withdrawal.find({ user: req.user.id })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: withdrawals.length,
      data: withdrawals
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single withdrawal
// @route   GET /api/withdrawals/:id
// @access  Private
export const getWithdrawal = async (req, res, next) => {
  try {
    const withdrawal = await Withdrawal.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!withdrawal) {
      return next(new ErrorResponse('Withdrawal not found', 404));
    }

    res.status(200).json({
      success: true,
      data: withdrawal
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create withdrawal request
// @route   POST /api/withdrawals
// @access  Private
export const createWithdrawal = async (req, res, next) => {
  try {
    const { amount, paymentMethod, paymentDetails } = req.body;

    // Get user
    const user = await User.findById(req.user.id);

    // Check if user has sufficient balance
    if (user.balance < amount) {
      return next(new ErrorResponse('Insufficient balance', 400));
    }

    // Check for pending withdrawals
    const pendingWithdrawals = await Withdrawal.find({
      user: req.user.id,
      status: 'pending'
    });

    if (pendingWithdrawals.length > 0) {
      return next(new ErrorResponse('You already have a pending withdrawal request', 400));
    }

    // Deduct amount from user's balance
    user.balance -= amount;
    await user.save();

    // Create withdrawal request
    const withdrawal = await Withdrawal.create({
      user: req.user.id,
      amount,
      paymentMethod,
      paymentDetails
    });

    res.status(201).json({
      success: true,
      data: withdrawal
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all withdrawals (Admin)
// @route   GET /api/withdrawals/admin/all
// @access  Private/Admin
export const getAllWithdrawals = async (req, res, next) => {
  try {
    const { status } = req.query;

    const query = status ? { status } : {};

    const withdrawals = await Withdrawal.find(query)
      .populate('user', 'name email phone')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: withdrawals.length,
      data: withdrawals
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update withdrawal status (Admin)
// @route   PUT /api/withdrawals/:id/status
// @access  Private/Admin
export const updateWithdrawalStatus = async (req, res, next) => {
  try {
    const { status, transactionId, rejectionReason, notes } = req.body;

    const withdrawal = await Withdrawal.findById(req.params.id);

    if (!withdrawal) {
      return next(new ErrorResponse('Withdrawal not found', 404));
    }

    withdrawal.status = status;
    if (transactionId) withdrawal.transactionId = transactionId;
    if (rejectionReason) withdrawal.rejectionReason = rejectionReason;
    if (notes) withdrawal.notes = notes;

    if (status === 'completed' || status === 'processing') {
      withdrawal.processedAt = Date.now();
    }

    // If rejected, refund the amount to user
    if (status === 'rejected') {
      const user = await User.findById(withdrawal.user);
      user.balance += withdrawal.amount;
      await user.save();
    }

    await withdrawal.save();

    res.status(200).json({
      success: true,
      data: withdrawal
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete withdrawal (Admin)
// @route   DELETE /api/withdrawals/:id
// @access  Private/Admin
export const deleteWithdrawal = async (req, res, next) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.id);

    if (!withdrawal) {
      return next(new ErrorResponse('Withdrawal not found', 404));
    }

    // If withdrawal is pending, refund amount to user
    if (withdrawal.status === 'pending') {
      const user = await User.findById(withdrawal.user);
      user.balance += withdrawal.amount;
      await user.save();
    }

    await withdrawal.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Withdrawal deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
