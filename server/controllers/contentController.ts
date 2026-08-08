import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { Content } from '../models/Content.js';
import { createContentSchema, updateContentSchema } from '../validators/contentValidator.js';
import mongoose from 'mongoose';

export async function createContent(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const validated = createContentSchema.parse(req.body);
    const userId = req.user?._id;

    const content = await Content.create({
      ...validated,
      userId,
      publishedAt: validated.status === 'published' ? new Date() : undefined,
    });

    res.status(201).json({
      success: true,
      content,
    });
  } catch (error) {
    next(error);
  }
}

export async function getContents(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?._id;
    const { search, category, status, platform, tag, page = '1', limit = '10' } = req.query;

    const filter: any = { userId };

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (platform) filter.platform = platform;
    if (tag) filter.tags = tag;

    if (search && typeof search === 'string' && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { title: regex },
        { body: regex },
        { tags: { $in: [regex] } },
      ];
    }

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [contents, total] = await Promise.all([
      Content.find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Content.countDocuments(filter),
    ]);

    res.json({
      success: true,
      contents,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getContentById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: 'Invalid content ID' });
      return;
    }

    const content = await Content.findOne({ _id: id, userId });
    if (!content) {
      res.status(404).json({ success: false, error: 'Content item not found' });
      return;
    }

    res.json({
      success: true,
      content,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateContent(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: 'Invalid content ID' });
      return;
    }

    const validated = updateContentSchema.parse(req.body);

    const content = await Content.findOne({ _id: id, userId });
    if (!content) {
      res.status(404).json({ success: false, error: 'Content item not found' });
      return;
    }

    Object.assign(content, validated);

    if (validated.status === 'published' && !content.publishedAt) {
      content.publishedAt = new Date();
    }

    await content.save();

    res.json({
      success: true,
      content,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteContent(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: 'Invalid content ID' });
      return;
    }

    const content = await Content.findOneAndDelete({ _id: id, userId });
    if (!content) {
      res.status(404).json({ success: false, error: 'Content item not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Content deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

export async function getDashboardStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?._id;
    const userObjectId = new mongoose.Types.ObjectId(userId?.toString());

    // MongoDB Aggregation Pipeline for Creator Dashboard Statistics
    const [counts, categoryAgg, recentContent] = await Promise.all([
      Content.aggregate([
        { $match: { userId: userObjectId } },
        {
          $group: {
            _id: null,
            totalContent: { $sum: 1 },
            publishedContent: {
              $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] },
            },
            draftContent: {
              $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] },
            },
          },
        },
      ]),
      Content.aggregate([
        { $match: { userId: userObjectId } },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
          },
        },
      ]),
      Content.find({ userId }).sort({ updatedAt: -1 }).limit(5),
    ]);

    const stats = counts[0] || { totalContent: 0, publishedContent: 0, draftContent: 0 };

    res.json({
      success: true,
      stats: {
        totalContent: stats.totalContent,
        publishedContent: stats.publishedContent,
        draftContent: stats.draftContent,
        categoryBreakdown: categoryAgg,
        recentContent,
      },
    });
  } catch (error) {
    next(error);
  }
}
