import { Router } from 'express';
import { getAvailablePlans, getUserBillingHistory, subscribe } from '../controllers/billingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/plans', getAvailablePlans);
router.get('/history', protect, getUserBillingHistory);
router.post('/subscribe', protect, subscribe);

export default router;
