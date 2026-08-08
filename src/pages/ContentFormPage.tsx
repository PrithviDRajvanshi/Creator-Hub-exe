import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { ContentCategory, Platform, ContentStatus } from '../types';
import { PromptInjectionWarning } from '../components/PromptInjectionWarning';
import {
  FileText,
  Sparkles,
  Bot,
  Save,
  ArrowLeft,
  Tag as TagIcon,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Copy,
  RefreshCw,
  Wand2,
} from 'lucide-react';

export const ContentFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  // Form State
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<ContentCategory>('Social Media');
  const [platform, setPlatform] = useState<Platform>('General');
  const [status, setStatus] = useState<ContentStatus>('draft');
  const [tagsInput, setTagsInput] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [aiCaptions, setAiCaptions] = useState<string[]>([]);

  // UI state
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // AI Generation States inside Form
  const [generatingDraft, setGeneratingDraft] = useState(false);
  const [generatingCaptions, setGeneratingCaptions] = useState(false);
  const [rewriting, setRewriting] = useState(false);
  const [captionTone, setCaptionTone] = useState('creative');
  const [rewriteTone, setRewriteTone] = useState('professional');
  const [suspiciousWarning, setSuspiciousWarning] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      const fetchContent = async () => {
        try {
          const res = await api.get(`/content/${id}`);
          if (res.data.success) {
            const item = res.data.content;
            setTitle(item.title);
            setBody(item.body);
            setCategory(item.category);
            setPlatform(item.platform);
            setStatus(item.status);
            setTagsInput(item.tags ? item.tags.join(', ') : '');
            setMediaUrl(item.mediaUrl || '');
            setAiCaptions(item.aiCaptions || []);
          }
        } catch (err: any) {
          setError(err.response?.data?.error || 'Failed to load content item');
        } finally {
          setLoading(false);
        }
      };
      fetchContent();
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const tagsArray = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const payload = {
      title,
      body,
      category,
      platform,
      status,
      tags: tagsArray,
      mediaUrl,
      aiCaptions,
    };

    try {
      if (isEdit && id) {
        await api.put(`/content/${id}`, payload);
      } else {
        await api.post('/content', payload);
      }
      navigate('/content');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save content post');
    } finally {
      setSaving(false);
    }
  };

  // AI Assistant Action 1: Auto-generate Content Draft
  const handleGenerateAIDraft = async () => {
    if (!title.trim()) {
      alert('Please enter a post title or topic first so the AI knows what to write!');
      return;
    }
    setGeneratingDraft(true);
    setSuspiciousWarning(null);
    try {
      const res = await api.post('/ai/generate-content', {
        topic: title,
        category,
        platform,
      });
      if (res.data.success) {
        setBody(res.data.draft);
        if (res.data.isSuspicious) {
          setSuspiciousWarning('Prompt injection guard detected potential directive manipulation in topic string.');
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to generate AI draft');
    } finally {
      setGeneratingDraft(false);
    }
  };

  // AI Assistant Action 2: Generate Captions
  const handleGenerateCaptions = async () => {
    const textToUse = body || title;
    if (!textToUse.trim()) {
      alert('Please enter a title or post body to generate captions.');
      return;
    }
    setGeneratingCaptions(true);
    setSuspiciousWarning(null);
    try {
      const res = await api.post('/ai/generate-captions', {
        topicOrText: textToUse,
        tone: captionTone,
        platform,
        count: 3,
      });
      if (res.data.success) {
        setAiCaptions(res.data.captions);
        if (res.data.isSuspicious) {
          setSuspiciousWarning('Prompt injection guard flagged suspicious prompt structure.');
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to generate captions');
    } finally {
      setGeneratingCaptions(false);
    }
  };

  // AI Assistant Action 3: Rewrite Content
  const handleRewriteBody = async () => {
    if (!body.trim()) {
      alert('Please enter body text before requesting an AI rewrite.');
      return;
    }
    setRewriting(true);
    setSuspiciousWarning(null);
    try {
      const res = await api.post('/ai/rewrite', {
        content: body,
        targetTone: rewriteTone,
        goal: 'change_tone',
      });
      if (res.data.success) {
        setBody(res.data.rewritten);
        if (res.data.isSuspicious) {
          setSuspiciousWarning('Prompt injection guard detected potential prompt injection pattern.');
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to rewrite content');
    } finally {
      setRewriting(false);
    }
  };

  // File upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setMediaUrl(res.data.media.url);
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to upload media file');
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400 text-sm">Loading post editor...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/content')}
          className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Content Library
        </button>
        <span className="text-xs text-slate-400">
          {isEdit ? 'Editing Existing Post' : 'Creating New Creator Post'}
        </span>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {suspiciousWarning && <PromptInjectionWarning reason={suspiciousWarning} />}

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
        {/* Main Content Area (2 Cols) */}
        <div className="lg:col-span-2 space-y-5">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Post Title / Subject Line *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 5 AI Tools Changing Content Creation in 2026"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Content Body *
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleGenerateAIDraft}
                    disabled={generatingDraft}
                    className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
                  >
                    <Wand2 className="w-3 h-3 text-indigo-400" />
                    {generatingDraft ? 'AI Writing...' : 'Generate AI Draft'}
                  </button>
                </div>
              </div>
              <textarea
                required
                rows={10}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your article, video script, social media post, or email newsletter content here..."
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors leading-relaxed font-sans"
              />
            </div>

            {/* AI Rewrite Assistant Toolbar */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="font-semibold text-slate-300">AI Body Tone Rewriter:</span>
                <select
                  value={rewriteTone}
                  onChange={(e) => setRewriteTone(e.target.value)}
                  className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="creative">Creative</option>
                  <option value="urgent">Urgent</option>
                  <option value="witty">Witty</option>
                  <option value="inspirational">Inspirational</option>
                </select>
              </div>
              <button
                type="button"
                onClick={handleRewriteBody}
                disabled={rewriting || !body.trim()}
                className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${rewriting ? 'animate-spin' : ''}`} />
                {rewriting ? 'Rewriting Body...' : 'Rewrite Body Text'}
              </button>
            </div>
          </div>

          {/* AI Generated Captions Box */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Bot className="w-4 h-4 text-indigo-400" />
                  AI Social Media Captions
                </h3>
                <p className="text-[11px] text-slate-400">
                  Generate platform-optimized social media captions for this post
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={captionTone}
                  onChange={(e) => setCaptionTone(e.target.value)}
                  className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="creative">Creative Tone</option>
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="witty">Witty</option>
                  <option value="inspirational">Inspirational</option>
                </select>
                <button
                  type="button"
                  onClick={handleGenerateCaptions}
                  disabled={generatingCaptions}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1 disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {generatingCaptions ? 'Generating...' : 'Generate 3 Captions'}
                </button>
              </div>
            </div>

            {aiCaptions.length > 0 ? (
              <div className="space-y-2.5 pt-1">
                {aiCaptions.map((cap, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3 text-xs"
                  >
                    <p className="text-slate-200 leading-relaxed font-sans">{cap}</p>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(cap);
                        alert('Caption copied to clipboard!');
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors shrink-0"
                      title="Copy Caption"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-3 text-center border border-dashed border-slate-800 rounded-xl">
                No AI captions generated yet. Click 'Generate 3 Captions' above.
              </p>
            )}
          </div>
        </div>

        {/* Sidebar Configuration (1 Col) */}
        <div className="space-y-5">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">
              Post Settings & Publishing
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ContentCategory)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="Social Media">Social Media</option>
                <option value="Blog Post">Blog Post</option>
                <option value="Video Script">Video Script</option>
                <option value="Newsletter">Newsletter</option>
                <option value="Ad Copy">Ad Copy</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Platform)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="General">General Platform</option>
                <option value="Instagram">Instagram</option>
                <option value="YouTube">YouTube</option>
                <option value="X/Twitter">X/Twitter</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="TikTok">TikTok</option>
                <option value="Blog">Blog</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Publish Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ContentStatus)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="draft">Save as Draft</option>
                <option value="published">Publish Now</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Tags (Comma separated)
              </label>
              <div className="relative">
                <TagIcon className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="AI, Tech, WebDev"
                  className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Media Attachment Upload */}
            <div className="pt-2 border-t border-slate-800/80">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Featured Cover Image
              </label>
              {mediaUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
                  <img src={mediaUrl} alt="Featured" className="w-full h-36 object-cover" />
                  <button
                    type="button"
                    onClick={() => setMediaUrl('')}
                    className="absolute top-2 right-2 px-2 py-1 bg-red-600 text-white rounded text-[10px] font-bold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="p-4 border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-950/50">
                  <Upload className="w-5 h-5 text-slate-400 mb-1" />
                  <span className="text-xs text-slate-300 font-medium">
                    {uploadingImage ? 'Uploading image...' : 'Click to upload image file'}
                  </span>
                  <span className="text-[10px] text-slate-500">JPG, PNG, WEBP max 5MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 px-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 pt-3"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving Post...' : isEdit ? 'Update Post' : 'Save Content Post'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
