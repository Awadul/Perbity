import Referral from '../models/Referral.js';
import User from '../models/User.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Get user's referrals
// @route   GET /api/referrals
// @access  Private
export const getReferrals = async (req, res, next) => {
  try {
    const referrals = await Referral.find({ referrer: req.user.id })
      .populate('referred', 'name email createdAt')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: referrals.length,
      data: referrals
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get referral stats
// @route   GET /api/referrals/stats
// @access  Private
export const getReferralStats = async (req, res, next) => {
  try {
    const referrals = await Referral.find({ referrer: req.user.id });

    const totalEarnings = referrals.reduce((sum, ref) => sum + ref.earning, 0);
    const confirmedCount = referrals.filter(ref => ref.status === 'confirmed').length;
    const paidCount = referrals.filter(ref => ref.status === 'paid').length;

    const user = await User.findById(req.user.id);
    const teamMembers = await User.find({ referredBy: req.user.id }).select('name email createdAt isActive balance totalEarnings');

    res.status(200).json({
      success: true,
      data: {
        totalReferrals: referrals.length,
        confirmedReferrals: confirmedCount,
        paidReferrals: paidCount,
        totalEarnings,
        referralCode: user.referralCode,
        referralLink: `${process.env.CLIENT_URL}/signup?ref=${user.referralCode}`,
        teamMembers: teamMembers.length,
        team: teamMembers,
        bonusEligible: teamMembers.length >= 15,
        progressToBonus: Math.min(teamMembers.length, 15),
        bonusAmount: 50
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm referral and pay earnings
// @route   PUT /api/referrals/:id/confirm
// @access  Private/Admin
export const confirmReferral = async (req, res, next) => {
  try {
    const referral = await Referral.findById(req.params.id);

    if (!referral) {
      return next(new ErrorResponse('Referral not found', 404));
    }

    if (referral.status === 'paid') {
      return next(new ErrorResponse('Referral already paid', 400));
    }

    // Update referrer's balance
    const referrer = await User.findById(referral.referrer);
    referrer.balance += referral.earning;
    referrer.referralEarnings += referral.earning;
    await referrer.save();

    // Update referral status
    referral.status = 'paid';
    referral.paidAt = Date.now();
    await referral.save();

    res.status(200).json({
      success: true,
      data: referral
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all referrals (Admin)
// @route   GET /api/referrals/admin/all
// @access  Private/Admin
export const getAllReferrals = async (req, res, next) => {
  try {
    const referrals = await Referral.find()
      .populate('referrer', 'name email')
      .populate('referred', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: referrals.length,
      data: referrals
    });
  } catch (error) {
    next(error);
  }
};
