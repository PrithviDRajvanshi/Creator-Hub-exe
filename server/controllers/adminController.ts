import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { User } from '../models/User.js';
import { Content } from '../models/Content.js';
import { AIRequest } from '../models/AIRequest.js';

export async function getUsers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    // Fetch user content counts
    const userContentCounts = await Content.aggregate([
      {
        $group: {
          _id: '$userId',
          contentCount: { $sum: 1 },
        },
      },
    ]);

    const countMap: Record<string, number> = {};
    userContentCounts.forEach((item) => {
      countMap[item._id.toString()] = item.contentCount;
    });

    const usersWithCounts = users.map((u) => ({
      ...u.toObject(),
      contentCount: countMap[u._id.toString()] || 0,
    }));

    res.json({
      success: true,
      users: usersWithCounts,
    });
  } catch (error) {
    next(error);
  }
}

export async function toggleUserStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'disabled'].includes(status)) {
      res.status(400).json({ success: false, error: 'Status must be active or disabled' });
      return;
    }

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    if (user.role === 'ADMIN' && status === 'disabled') {
      res.status(400).json({ success: false, error: 'Cannot disable an admin user' });
      return;
    }

    user.status = status;
    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllContentAdmin(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const contents = await Content.find()
      .populate('userId', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      contents,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteContentAdmin(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const content = await Content.findByIdAndDelete(id);

    if (!content) {
      res.status(404).json({ success: false, error: 'Content not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Content deleted by admin successfully',
    });
  } catch (error) {
    next(error);
  }
}

export async function getPlatformStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const [
      totalUsers,
      totalContent,
      publishedContent,
      totalAIRequests,
      suspiciousAIRequests,
      aiOperationStats,
    ] = await Promise.all([
      User.countDocuments(),
      Content.countDocuments(),
      Content.countDocuments({ status: 'published' }),
      AIRequest.countDocuments(),
      AIRequest.countDocuments({ isSuspicious: true }),
      AIRequest.aggregate([
        {
          $group: {
            _id: '$operationType',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    res.json({
      success: true,
      platformStats: {
        totalUsers,
        totalContent,
        publishedContent,
        draftContent: totalContent - publishedContent,
        totalAIRequests,
        suspiciousAIRequests,
        aiOperationStats,
      },
    });
  } catch (error) {
    next(error);
  }
}
