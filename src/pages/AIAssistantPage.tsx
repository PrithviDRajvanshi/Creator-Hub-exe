import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { PromptInjectionWarning } from '../components/PromptInjectionWarning';
import { AIRequestItem } from '../types';
import {
  Bot,
  Sparkles,
  Send,
  Wand2,
  ListFilter,
  FileText,
  Hash,
  RefreshCcw,
  Copy,
  ShieldCheck,
  AlertTriangle,
  History,
  Terminal,
} from 'lucide-react';

export const AIAssistantPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'captions' | 'rewrite' | 'summarize' | 'hashtags' | 'history'>('chat');

  // Interactive AI Assistant Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string; toolCallsCount?: number; isSuspicious?: boolean }>>([
    {
      sender: 'assistant',
      text: "Hello! I am your AI CreatorHub Assistant powered by Gemini 2.5 Flash. I can query your real post database using function calling! Try asking me:\n• 'How many published vs draft posts do I have?'\n• 'Search my posts about AI'\n• 'What is my top content category?'",
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Standalone AI Tool States
  // 1. Captions
  const [captionTopic, setCaptionTopic] = useState('');
  const [captionTone, setCaptionTone] = useState('creative');
  const [captionPlatform, setCaptionPlatform] = useState('Instagram');
  const [captionResults, setCaptionResults] = useState<string[]>([]);
  const [captionLoading, setCaptionLoading] = useState(false);

  // 2. Rewrite
  const [rewriteInput, setRewriteInput] = useState('');
  const [rewriteTone, setRewriteTone] = useState('professional');
  const [rewriteResult, setRewriteResult] = useState('');
  const [rewriteLoading, setRewriteLoading] = useState(false);

  // 3. Summarize
  const [summarizeInput, setSummarizeInput] = useState('');
  const [summarizeFormat, setSummarizeFormat] = useState<'bullet_points' | 'paragraph' | 'one_liner'>('bullet_points');
  const [summarizeResult, setSummarizeResult] = useState('');
  const [summarizeLoading, setSummarizeLoading] = useState(false);

  // 4. Hashtags
  const [hashtagTopic, setHashtagTopic] = useState('');
  const [hashtagNiche, setHashtagNiche] = useState('Tech');
  const [hashtagResults, setHashtagResults] = useState<string[]>([]);
  const [hashtagLoading, setHashtagLoading] = useState(false);

  // 5. History / Audit Log
  const [aiHistory, setAiHistory] = useState<AIRequestItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [activeSuspicious, setActiveSuspicious] = useState<string | null>(null);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await api.get('/ai/history');
      if (res.data.success) {
        setAiHistory(res.data.history);
      }
    } catch (err) {
      console.error('Failed to load AI history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab]);

  // Handle Assistant Function Calling Chat
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userText = chatInput.trim();
    setChatInput('');
    setChatMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setChatLoading(true);
    setActiveSuspicious(null);

    try {
      const res = await api.post('/ai/assistant', { message: userText });
      if (res.data.success) {
        setChatMessages((prev) => [
          ...prev,
          {
            sender: 'assistant',
            text: res.data.reply,
            toolCallsCount: res.data.toolCallsCount,
            isSuspicious: res.data.isSuspicious,
          },
        ]);
        if (res.data.isSuspicious) {
          setActiveSuspicious('Prompt injection defense engine detected suspicious input pattern.');
        }
      }
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: err.response?.data?.error || 'Failed to communicate with AI Assistant.',
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Standalone Tool Handlers
  const handleGenerateCaptions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captionTopic.trim()) return;
    setCaptionLoading(true);
    setActiveSuspicious(null);
    try {
      const res = await api.post('/ai/generate-captions', {
        topicOrText: captionTopic,
        tone: captionTone,
        platform: captionPlatform,
        count: 3,
      });
      if (res.data.success) {
        setCaptionResults(res.data.captions);
        if (res.data.isSuspicious) {
          setActiveSuspicious('Prompt injection guard flagged suspicious prompt.');
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to generate captions');
    } finally {
      setCaptionLoading(false);
    }
  };

  const handleRewrite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rewriteInput.trim()) return;
    setRewriteLoading(true);
    setActiveSuspicious(null);
    try {
      const res = await api.post('/ai/rewrite', {
        content: rewriteInput,
        targetTone: rewriteTone,
      });
      if (res.data.success) {
        setRewriteResult(res.data.rewritten);
        if (res.data.isSuspicious) {
          setActiveSuspicious('Prompt injection guard flagged suspicious prompt.');
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to rewrite content');
    } finally {
      setRewriteLoading(false);
    }
  };

  const handleSummarize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summarizeInput.trim()) return;
    setSummarizeLoading(true);
    setActiveSuspicious(null);
    try {
      const res = await api.post('/ai/summarize', {
        content: summarizeInput,
        format: summarizeFormat,
      });
      if (res.data.success) {
        setSummarizeResult(res.data.summary);
        if (res.data.isSuspicious) {
          setActiveSuspicious('Prompt injection guard flagged suspicious prompt.');
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to summarize content');
    } finally {
      setSummarizeLoading(false);
    }
  };

  const handleHashtags = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hashtagTopic.trim()) return;
    setHashtagLoading(true);
    setActiveSuspicious(null);
    try {
      const res = await api.post('/ai/generate-hashtags', {
        topic: hashtagTopic,
        niche: hashtagNiche,
        count: 15,
      });
      if (res.data.success) {
        setHashtagResults(res.data.hashtags);
        if (res.data.isSuspicious) {
          setActiveSuspicious('Prompt injection guard flagged suspicious prompt.');
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to generate hashtags');
    } finally {
      setHashtagLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bot className="w-6 h-6 text-indigo-400" />
            AI Creator Studio & Assistant
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Server-side Gemini 2.5 Flash with Function Calling & Prompt Injection Defense
          </p>
        </div>
      </div>

      {activeSuspicious && <PromptInjectionWarning reason={activeSuspicious} />}

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'chat'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Bot className="w-4 h-4" /> Database Tool Assistant
        </button>

        <button
          onClick={() => setActiveTab('captions')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'captions'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" /> Caption Studio
        </button>

        <button
          onClick={() => setActiveTab('rewrite')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'rewrite'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <RefreshCcw className="w-4 h-4" /> Content Rewriter
        </button>

        <button
          onClick={() => setActiveTab('summarize')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'summarize'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" /> Summarizer
        </button>

        <button
          onClick={() => setActiveTab('hashtags')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'hashtags'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Hash className="w-4 h-4" /> Hashtag Generator
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'history'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <History className="w-4 h-4" /> Audit Log
        </button>
      </div>

      {/* TAB 1: Database Tool Assistant Chat */}
      {activeTab === 'chat' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col h-[550px]">
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-2">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 text-xs leading-relaxed ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`p-3.5 rounded-2xl max-w-xl whitespace-pre-wrap font-sans ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-xs'
                      : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-xs'
                  }`}
                >
                  {msg.text}
                  {msg.toolCallsCount && msg.toolCallsCount > 0 ? (
                    <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-emerald-400 flex items-center gap-1">
                      <Terminal className="w-3 h-3" />
                      Gemini executed {msg.toolCallsCount} MongoDB tool function call(s)
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex gap-3 text-xs justify-start">
                <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-400 animate-pulse">
                  Gemini is querying database tools and synthesizing response...
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleChatSubmit} className="flex gap-2 pt-2 border-t border-slate-800">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask assistant to search content, give stats, or check recent posts..."
              className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <button
              type="submit"
              disabled={chatLoading || !chatInput.trim()}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/25 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: Caption Studio */}
      {activeTab === 'captions' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <form onSubmit={handleGenerateCaptions} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Topic or Content Text *
              </label>
              <textarea
                required
                rows={3}
                value={captionTopic}
                onChange={(e) => setCaptionTopic(e.target.value)}
                placeholder="e.g. Announcing our new AI-powered creator workspace dashboard for video creators..."
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tone</label>
                <select
                  value={captionTone}
                  onChange={(e) => setCaptionTone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="creative">Creative</option>
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="witty">Witty</option>
                  <option value="inspirational">Inspirational</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Platform</label>
                <select
                  value={captionPlatform}
                  onChange={(e) => setCaptionPlatform(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Instagram">Instagram</option>
                  <option value="YouTube">YouTube</option>
                  <option value="X/Twitter">X/Twitter</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="TikTok">TikTok</option>
                  <option value="Blog">Blog</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={captionLoading}
              className="px-5 py-2.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/25 flex items-center gap-2 text-xs transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {captionLoading ? 'Generating Captions...' : 'Generate AI Captions'}
            </button>
          </form>

          {captionResults.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h3 className="text-sm font-bold text-white">Generated Captions:</h3>
              {captionResults.map((cap, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3 text-xs"
                >
                  <p className="text-slate-200 leading-relaxed font-sans">{cap}</p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(cap);
                      alert('Copied to clipboard!');
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors shrink-0"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Content Rewriter */}
      {activeTab === 'rewrite' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <form onSubmit={handleRewrite} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Original Content *</label>
              <textarea
                required
                rows={5}
                value={rewriteInput}
                onChange={(e) => setRewriteInput(e.target.value)}
                placeholder="Paste the paragraph or draft text you want to rewrite..."
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="w-full sm:w-1/2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Tone</label>
              <select
                value={rewriteTone}
                onChange={(e) => setRewriteTone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="creative">Creative</option>
                <option value="witty">Witty</option>
                <option value="inspirational">Inspirational</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={rewriteLoading}
              className="px-5 py-2.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/25 flex items-center gap-2 text-xs transition-all disabled:opacity-50"
            >
              <RefreshCcw className="w-4 h-4" />
              {rewriteLoading ? 'Rewriting Content...' : 'Rewrite Text'}
            </button>
          </form>

          {rewriteResult && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-indigo-400">Rewritten Text Result:</h4>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(rewriteResult);
                    alert('Copied to clipboard!');
                  }}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy
                </button>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">{rewriteResult}</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Summarizer */}
      {activeTab === 'summarize' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <form onSubmit={handleSummarize} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Article or Content to Summarize *</label>
              <textarea
                required
                rows={6}
                value={summarizeInput}
                onChange={(e) => setSummarizeInput(e.target.value)}
                placeholder="Paste long-form article or notes here..."
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="w-full sm:w-1/2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Summary Format</label>
              <select
                value={summarizeFormat}
                onChange={(e) => setSummarizeFormat(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="bullet_points">Bullet Points</option>
                <option value="paragraph">Concise Paragraph</option>
                <option value="one_liner">One-Liner Executive Summary</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={summarizeLoading}
              className="px-5 py-2.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/25 flex items-center gap-2 text-xs transition-all disabled:opacity-50"
            >
              <FileText className="w-4 h-4" />
              {summarizeLoading ? 'Summarizing...' : 'Summarize Text'}
            </button>
          </form>

          {summarizeResult && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-indigo-400">AI Summary:</h4>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(summarizeResult);
                    alert('Copied to clipboard!');
                  }}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy
                </button>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">{summarizeResult}</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: Hashtag Generator */}
      {activeTab === 'hashtags' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <form onSubmit={handleHashtags} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Topic / Keywords *</label>
                <input
                  type="text"
                  required
                  value={hashtagTopic}
                  onChange={(e) => setHashtagTopic(e.target.value)}
                  placeholder="e.g. React 19, Web Development, AI Tools"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Niche</label>
                <input
                  type="text"
                  value={hashtagNiche}
                  onChange={(e) => setHashtagNiche(e.target.value)}
                  placeholder="e.g. Tech, Marketing, Fitness"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={hashtagLoading}
              className="px-5 py-2.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/25 flex items-center gap-2 text-xs transition-all disabled:opacity-50"
            >
              <Hash className="w-4 h-4" />
              {hashtagLoading ? 'Generating Hashtags...' : 'Generate Hashtags'}
            </button>
          </form>

          {hashtagResults.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Generated Hashtags ({hashtagResults.length}):</h3>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(hashtagResults.join(' '));
                    alert('All hashtags copied to clipboard!');
                  }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy All
                </button>
              </div>

              <div className="flex flex-wrap gap-2 p-4 bg-slate-950 rounded-xl border border-slate-800">
                {hashtagResults.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-mono"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: Security Audit Log / History */}
      {activeTab === 'history' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                AI Security & Request Audit Log
              </h3>
              <p className="text-[11px] text-slate-400">
                Logs of all server-side Gemini AI executions and prompt injection defense evaluations
              </p>
            </div>
            <button
              onClick={fetchHistory}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1"
            >
              <RefreshCcw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>

          {historyLoading ? (
            <div className="text-xs text-slate-400 py-8 text-center">Loading AI audit log...</div>
          ) : aiHistory.length > 0 ? (
            <div className="space-y-3">
              {aiHistory.map((item) => (
                <div
                  key={item._id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-indigo-300 uppercase tracking-wider text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                      {item.operationType}
                    </span>
                    <div className="flex items-center gap-2">
                      {item.isSuspicious ? (
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Suspicious Prompt Guarded
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Safe
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500">
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-slate-300 font-mono text-[11px] bg-slate-900/60 p-2 rounded">
                    Prompt: {item.prompt}
                  </p>
                  {item.suspiciousReason && (
                    <p className="text-[10px] text-amber-400 font-mono bg-amber-950/30 p-1.5 rounded border border-amber-500/20">
                      Reason: {item.suspiciousReason}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-8">No AI requests logged yet.</p>
          )}
        </div>
      )}
    </div>
  );
};
