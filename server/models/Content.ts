import mongoose, { Schema, Document } from 'mongoose';

export interface IContent extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  body: string;
  category: 'Social Media' | 'Blog Post' | 'Video Script' | 'Newsletter' | 'Ad Copy' | 'Other';
  tags: string[];
  status: 'draft' | 'published';
  platform: 'Instagram' | 'YouTube' | 'X/Twitter' | 'LinkedIn' | 'TikTok' | 'Blog' | 'General';
  mediaUrl?: string;
  aiCaptions: string[];
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ContentSchema = new Schema<IContent>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    body: {
      type: String,
      required: [true, 'Content body is required'],
    },
    category: {
      type: String,
      enum: ['Social Media', 'Blog Post', 'Video Script', 'Newsletter', 'Ad Copy', 'Other'],
      default: 'Social Media',
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
      index: true,
    },
    platform: {
      type: String,
      enum: ['Instagram', 'YouTube', 'X/Twitter', 'LinkedIn', 'TikTok', 'Blog', 'General'],
      default: 'General',
    },
    mediaUrl: {
      type: String,
      default: '',
    },
    aiCaptions: {
      type: [String],
      default: [],
    },
    publishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

ContentSchema.index({ title: 'text', body: 'text', tags: 'text' });

export const Content = mongoose.model<IContent>('Content', ContentSchema);
