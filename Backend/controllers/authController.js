import User from '../models/User.js';
import Referral from '../models/Referral.js';
import ErrorResponse from '../utils/errorResponse.js';
import { sendTokenResponse } from '../utils/tokenResponse.js';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, referralCode } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ErrorResponse('User already exists with this email', 400));
    }

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password
    });

    // Handle referral if provided
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer) {
        user.referredBy = referrer._id;
        await user.save();

        // Create referral record
        await Referral.create({
          referrer: referrer._id,
          referred: user._id,
          earning: 1.5,
          status: 'confirmed'
        });

        // Add to team members
        await referrer.addTeamMember(user._id);
        referrer.referralCount += 1;
        
        // Give $20 bonus for new team member registration
        referrer.balance = (referrer.balance || 0) + 20;
        
        // Ensure earnings object exists
        if (!referrer.earnings) {
          referrer.earnings = {
            ads: 0,
            referrals: 0,
            emails: 0,
            reviews: 0,
            investments: 0
          };
        }
        
        referrer.earnings.referrals = (referrer.earnings.referrals || 0) + 20;
        referrer.totalEarnings = (referrer.totalEarnings || 0) + 20;
        referrer.referralEarningsTotal = (referrer.referralEarningsTotal || 0) + 20;
        
        console.log(`\n💰 New Member Registration Bonus!`);
        console.log(`   New Member: ${user.name} (${user.email})`);
        console.log(`   Referrer: ${referrer.name} (${referrer.email})`);
        console.log(`   Bonus: $20`);
        console.log(`   Referrer New Balance: $${referrer.balance.toFixed(2)}`);
        
        await referrer.save();
      }
    }

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return next(new ErrorResponse('Please provide email and password', 400));
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res, next) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Public
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(new ErrorResponse('Refresh token is required', 400));
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Get user
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    return next(new ErrorResponse('Invalid refresh token', 401));
  }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
export const updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return next(new ErrorResponse('Current password is incorrect', 401));
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};
