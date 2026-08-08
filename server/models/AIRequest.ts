import mongoose, { Schema, Document } from 'mongoose';

export interface IAIRequest extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  operationType: 'generateCaptions' | 'generateContent' | 'rewriteContent' | 'summarizeContent' | 'generateHashtags' | 'assistantToolChat';
  prompt: string;
  result?: string;
  isSuspicious: boolean;
  suspiciousReason?: string;
  toolCallsCount: number;
  createdAt: Date;
}

const AIRequestSchema = new Schema<IAIRequest>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    operationType: {
      type: String,
      required: true,
      enum: ['generateCaptions', 'generateContent', 'rewriteContent', 'summarizeContent', 'generateHashtags', 'assistantToolChat'],
      index: true,
    },
    prompt: {
      type: String,
      required: true,
    },
    result: {
      type: String,
    },
    isSuspicious: {
      type: Boolean,
      default: false,
      index: true,
    },
    suspiciousReason: {
      type: String,
      default: '',
    },
    toolCallsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const AIRequest = mongoose.model<IAIRequest>('AIRequest', AIRequestSchema);
