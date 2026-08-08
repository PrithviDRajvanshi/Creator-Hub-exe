import { Router } from 'express';
import {
  getUsers,
  toggleUserStatus,
  getAllContentAdmin,
  deleteContentAdmin,
  getPlatformStats,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);
router.use(authorize('ADMIN'));

router.get('/users', getUsers);
router.put('/users/:id/status', toggleUserStatus);
router.get('/content', getAllContentAdmin);
router.delete('/content/:id', deleteContentAdmin);
router.get('/stats', getPlatformStats);

export default router;
