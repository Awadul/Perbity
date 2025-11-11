import express from 'express';
import {
  getDashboardStats,
  getAllUsers,
  getUserDetails,
  togglePaymentStatus,
  updateUserStatus,
  getPaymentPlans,
  createPaymentPlan,
  updatePaymentPlan,
  deletePaymentPlan
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes are admin only
router.use(protect, authorize('admin'));

// Dashboard
router.get('/dashboard', getDashboardStats);

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserDetails);
router.put('/users/:id/status', updateUserStatus);

// Payment management
router.put('/payments/:id/toggle', togglePaymentStatus);

// Payment plan management
router.get('/payment-plans', getPaymentPlans);
router.post('/payment-plans', createPaymentPlan);
router.put('/payment-plans/:id', updatePaymentPlan);
router.delete('/payment-plans/:id', deletePaymentPlan);

export default router;
