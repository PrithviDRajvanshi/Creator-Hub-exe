import { Router } from 'express';
import { uploadMedia, getUserMedia, uploadMiddleware } from '../controllers/mediaController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

router.post('/upload', uploadMiddleware.single('file'), uploadMedia);
router.get('/', getUserMedia);

export default router;
