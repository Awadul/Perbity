import express from 'express';
import {
  getReferrals,
  getReferralStats,
  confirmReferral,
  getAllReferrals
} from '../controllers/referralController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// User routes
router.get('/', protect, getReferrals);
router.get('/stats', protect, getReferralStats);

// Admin routes
router.get('/admin/all', protect, authorize('admin'), getAllReferrals);
router.put('/:id/confirm', protect, authorize('admin'), confirmReferral);

export default router;
