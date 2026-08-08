import { z } from 'zod';

export const createContentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title cannot exceed 200 characters'),
  body: z.string().min(1, 'Content body is required'),
  category: z.enum(['Social Media', 'Blog Post', 'Video Script', 'Newsletter', 'Ad Copy', 'Other']).optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published']).optional(),
  platform: z.enum(['Instagram', 'YouTube', 'X/Twitter', 'LinkedIn', 'TikTok', 'Blog', 'General']).optional(),
  mediaUrl: z.string().optional(),
  aiCaptions: z.array(z.string()).optional(),
});

export const updateContentSchema = createContentSchema.partial();
