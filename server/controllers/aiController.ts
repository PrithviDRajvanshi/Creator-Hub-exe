import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { AIRequest } from '../models/AIRequest.js';
import {
  generateCaptions,
  generateContentDraft,
  rewriteContent,
  summarizeContent,
  generateHashtags,
  runAssistantToolChat,
} from '../services/geminiService.js';
import {
  aiCaptionSchema,
  aiRewriteSchema,
  aiSummarizeSchema,
  aiHashtagSchema,
  aiAssistantChatSchema,
} from '../validators/aiValidator.js';

export async function handleGenerateCaptions(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const validated = aiCaptionSchema.parse(req.body);
    const userId = req.user?._id;

    const result = await generateCaptions(
      validated.topicOrText,
      validated.tone,
      validated.platform,
      validated.count
    );

    await AIRequest.create({
      userId,
      operationType: 'generateCaptions',
      prompt: validated.topicOrText,
      result: JSON.stringify(result.captions),
      isSuspicious: result.isSuspicious,
      suspiciousReason: result.suspiciousReason || '',
      toolCallsCount: 0,
    });

    res.json({
      success: true,
      captions: result.captions,
      isSuspicious: result.isSuspicious,
      warning: result.isSuspicious ? 'Prompt injection guard detected potential instruction manipulation.' : undefined,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleGenerateContent(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { topic, category = 'Social Media', platform = 'General', instructions } = req.body;
    const userId = req.user?._id;

    if (!topic || typeof topic !== 'string' || topic.trim() === '') {
      res.status(400).json({ success: false, error: 'Topic is required' });
      return;
    }

    const result = await generateContentDraft(topic, category, platform, instructions);

    await AIRequest.create({
      userId,
      operationType: 'generateContent',
      prompt: `${topic} (${category} - ${platform})`,
      result: result.draft,
      isSuspicious: result.isSuspicious,
      suspiciousReason: result.suspiciousReason || '',
      toolCallsCount: 0,
    });

    res.json({
      success: true,
      draft: result.draft,
      isSuspicious: result.isSuspicious,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleRewriteContent(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const validated = aiRewriteSchema.parse(req.body);
    const userId = req.user?._id;

    const result = await rewriteContent(validated.content, validated.targetTone, validated.goal);

    await AIRequest.create({
      userId,
      operationType: 'rewriteContent',
      prompt: `Tone: ${validated.targetTone}, Goal: ${validated.goal}`,
      result: result.rewritten,
      isSuspicious: result.isSuspicious,
      suspiciousReason: result.suspiciousReason || '',
      toolCallsCount: 0,
    });

    res.json({
      success: true,
      rewritten: result.rewritten,
      isSuspicious: result.isSuspicious,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleSummarizeContent(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const validated = aiSummarizeSchema.parse(req.body);
    const userId = req.user?._id;

    const result = await summarizeContent(validated.content, validated.format);

    await AIRequest.create({
      userId,
      operationType: 'summarizeContent',
      prompt: `Summarize in ${validated.format}`,
      result: result.summary,
      isSuspicious: result.isSuspicious,
      suspiciousReason: result.suspiciousReason || '',
      toolCallsCount: 0,
    });

    res.json({
      success: true,
      summary: result.summary,
      isSuspicious: result.isSuspicious,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleGenerateHashtags(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const validated = aiHashtagSchema.parse(req.body);
    const userId = req.user?._id;

    const result = await generateHashtags(validated.topic, validated.niche, validated.count);

    await AIRequest.create({
      userId,
      operationType: 'generateHashtags',
      prompt: validated.topic,
      result: result.hashtags.join(' '),
      isSuspicious: result.isSuspicious,
      suspiciousReason: result.suspiciousReason || '',
      toolCallsCount: 0,
    });

    res.json({
      success: true,
      hashtags: result.hashtags,
      isSuspicious: result.isSuspicious,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleAssistantToolChat(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const validated = aiAssistantChatSchema.parse(req.body);
    const userId = req.user?._id?.toString() || '';

    const result = await runAssistantToolChat(userId, validated.message);

    await AIRequest.create({
      userId: req.user?._id,
      operationType: 'assistantToolChat',
      prompt: validated.message,
      result: result.reply,
      isSuspicious: result.isSuspicious,
      suspiciousReason: result.suspiciousReason || '',
      toolCallsCount: result.toolCallsCount,
    });

    res.json({
      success: true,
      reply: result.reply,
      toolCallsCount: result.toolCallsCount,
      isSuspicious: result.isSuspicious,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAIHistory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?._id;
    const history = await AIRequest.find({ userId }).sort({ createdAt: -1 }).limit(20);

    res.json({
      success: true,
      history,
    });
  } catch (error) {
    next(error);
  }
}
