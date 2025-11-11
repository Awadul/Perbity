import express from 'express';
import {
  getPaymentPlans,
  submitPayment,
  getMyPayments,
  getActivePayment,
  getAllPayments,
  approvePayment,
  rejectPayment,
  getPaymentImage
} from '../controllers/paymentController.js';
import { protect, authorize } from '../middleware/auth.js';
import upload, { handleUploadError } from '../middleware/upload.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes
router.get('/plans', getPaymentPlans);

// Protected routes (user)
router.post('/', protect, authLimiter, upload.single('proofImage'), handleUploadError, submitPayment);
router.get('/my-payments', protect, getMyPayments);
router.get('/active', protect, getActivePayment);
router.get('/:id/image', protect, getPaymentImage);

// Admin routes
router.get('/admin/all', protect, authorize('admin'), getAllPayments);
router.put('/:id/approve', protect, authorize('admin'), approvePayment);
router.put('/:id/reject', protect, authorize('admin'), rejectPayment);

export default router;
