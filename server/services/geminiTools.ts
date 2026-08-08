import { Type, FunctionDeclaration } from '@google/genai';
import { Content } from '../models/Content.js';
import mongoose from 'mongoose';

export const creatorToolDeclarations: FunctionDeclaration[] = [
  {
    name: 'getUserContentStats',
    description: "Fetch real-time statistics about the user's content (total posts, published vs draft count, category breakdown, top tags).",
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: 'searchUserContent',
    description: "Search the user's content posts by keyword, category, or status.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: { type: Type.STRING, description: 'Keyword to search in title, body, or tags' },
        category: { type: Type.STRING, description: 'Filter by category (e.g. Social Media, Blog Post)' },
        status: { type: Type.STRING, description: 'Filter by status (draft or published)' },
      },
    },
  },
  {
    name: 'getRecentContent',
    description: "Retrieve the user's most recently created content items.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        limit: { type: Type.NUMBER, description: 'Number of recent posts to fetch (default 5, max 10)' },
      },
    },
  },
  {
    name: 'getContentById',
    description: 'Retrieve full details of a specific content post by its unique ID.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        contentId: { type: Type.STRING, description: 'The unique MongoDB content ID' },
      },
      required: ['contentId'],
    },
  },
];

export async function executeToolCall(
  userId: string,
  toolName: string,
  args: any
): Promise<any> {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  switch (toolName) {
    case 'getUserContentStats': {
      const stats = await Content.aggregate([
        { $match: { userId: userObjectId } },
        {
          $group: {
            _id: null,
            totalContent: { $sum: 1 },
            publishedCount: {
              $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] },
            },
            draftCount: {
              $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] },
            },
            categories: { $push: '$category' },
            tags: { $push: '$tags' },
          },
        },
      ]);

      if (!stats || stats.length === 0) {
        return {
          totalContent: 0,
          publishedCount: 0,
          draftCount: 0,
          topCategory: 'None',
          message: 'No content found for this user.',
        };
      }

      const raw = stats[0];
      // Compute top category
      const categoryCounts: Record<string, number> = {};
      raw.categories.forEach((cat: string) => {
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });
      const topCategory = Object.keys(categoryCounts).reduce(
        (a, b) => (categoryCounts[a] > categoryCounts[b] ? a : b),
        'Social Media'
      );

      return {
        totalContent: raw.totalContent,
        publishedCount: raw.publishedCount,
        draftCount: raw.draftCount,
        topCategory,
        categoryBreakdown: categoryCounts,
      };
    }

    case 'searchUserContent': {
      const { query, category, status } = args || {};
      const filter: any = { userId: userObjectId };

      if (category) filter.category = category;
      if (status) filter.status = status;
      if (query) {
        filter.$or = [
          { title: { $regex: query, $options: 'i' } },
          { body: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } },
        ];
      }

      const results = await Content.find(filter)
        .sort({ updatedAt: -1 })
        .limit(10)
        .select('title category status platform tags createdAt');

      return {
        count: results.length,
        results: results.map((r) => ({
          id: r._id.toString(),
          title: r.title,
          category: r.category,
          status: r.status,
          platform: r.platform,
          tags: r.tags,
          createdAt: r.createdAt,
        })),
      };
    }

    case 'getRecentContent': {
      const limit = Math.min(args?.limit || 5, 10);
      const recent = await Content.find({ userId: userObjectId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('title category status platform createdAt');

      return {
        count: recent.length,
        items: recent.map((r) => ({
          id: r._id.toString(),
          title: r.title,
          category: r.category,
          status: r.status,
          platform: r.platform,
          createdAt: r.createdAt,
        })),
      };
    }

    case 'getContentById': {
      const { contentId } = args || {};
      if (!contentId || !mongoose.Types.ObjectId.isValid(contentId)) {
        return { error: 'Invalid or missing content ID' };
      }
      const item = await Content.findOne({ _id: contentId, userId: userObjectId });
      if (!item) {
        return { error: 'Content item not found or unauthorized' };
      }
      return {
        id: item._id.toString(),
        title: item.title,
        body: item.body,
        category: item.category,
        tags: item.tags,
        status: item.status,
        platform: item.platform,
        aiCaptions: item.aiCaptions,
        createdAt: item.createdAt,
      };
    }

    default:
      return { error: `Unknown tool name: ${toolName}` };
  }
}
