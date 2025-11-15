import express from 'express';
import {
  createCheckout,
  getMyCheckouts,
  getAllCheckouts,
  markCheckoutProcessing,
  completeCheckout,
  rejectCheckout,
  cancelCheckout,
  getCheckoutStats,
  getCheckoutQrCode
} from '../controllers/checkoutController.js';
import { protect, authorize } from '../middleware/auth.js';
import upload, { handleUploadError } from '../middleware/upload.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Protected routes (user)
router.post('/', protect, authLimiter, upload.single('qrCodeImage'), handleUploadError, createCheckout);
router.get('/my-checkouts', protect, getMyCheckouts);
router.put('/:id/cancel', protect, cancelCheckout);

// Admin routes
router.get('/admin/all', protect, authorize('admin'), getAllCheckouts);
router.get('/admin/stats', protect, authorize('admin'), getCheckoutStats);
router.get('/:id/qr-code', protect, authorize('admin'), getCheckoutQrCode);
router.put('/:id/processing', protect, authorize('admin'), markCheckoutProcessing);
router.put('/:id/complete', protect, authorize('admin'), upload.single('proofImage'), handleUploadError, completeCheckout);
router.put('/:id/reject', protect, authorize('admin'), rejectCheckout);

export default router;
