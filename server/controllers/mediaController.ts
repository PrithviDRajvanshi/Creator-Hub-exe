import { Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { Media } from '../models/Media.js';

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, safeName);
  },
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, WEBP, and GIF images are allowed.'));
  }
};

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

export async function uploadMedia(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: 'No media file provided' });
      return;
    }

    const userId = req.user?._id;
    const url = `/uploads/${req.file.filename}`;

    const media = await Media.create({
      userId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      url,
    });

    res.status(201).json({
      success: true,
      media: {
        id: media._id,
        filename: media.filename,
        originalName: media.originalName,
        url: media.url,
        mimeType: media.mimeType,
        size: media.size,
        createdAt: media.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getUserMedia(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?._id;
    const mediaItems = await Media.find({ userId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      media: mediaItems,
    });
  } catch (error) {
    next(error);
  }
}
