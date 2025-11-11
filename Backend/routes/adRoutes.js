import express from 'express';
import {
  getAds,
  getTodayClicks,
  clickAd,
  getAdEarnings,
  createAd,
  updateAd,
  deleteAd
} from '../controllers/adController.js';
import { protect, authorize } from '../middleware/auth.js';
import { adClickLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// User routes
router.get('/', protect, getAds);
router.get('/clicks/today', protect, getTodayClicks);
router.post('/:id/click', protect, adClickLimiter, clickAd);
router.get('/earnings', protect, getAdEarnings);

// Admin routes
router.post('/', protect, authorize('admin'), createAd);
router.put('/:id', protect, authorize('admin'), updateAd);
router.delete('/:id', protect, authorize('admin'), deleteAd);

export default router;
