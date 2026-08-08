import { Router } from 'express';
import {
  createContent,
  getContents,
  getContentById,
  updateContent,
  deleteContent,
  getDashboardStats,
} from '../controllers/contentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

router.get('/dashboard/stats', getDashboardStats);
router.post('/', createContent);
router.get('/', getContents);
router.get('/:id', getContentById);
router.put('/:id', updateContent);
router.delete('/:id', deleteContent);

export default router;
