import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { DashboardStats } from '../types';
import {
  FileText,
  CheckCircle2,
  Clock,
  Sparkles,
  PlusCircle,
  Bot,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/content/dashboard/stats');
        if (res.data.success) {
          setStats(res.data.stats);
        }
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900 border border-indigo-500/20 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase mb-2">
            <Sparkles className="w-4 h-4" /> Creator Workspace
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Manage your content library, generate AI captions, and monitor post analytics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/content/new"
            className="px-4 py-2.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/25 flex items-center gap-2 transition-all text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            New Content Post
          </Link>
          <Link
            to="/ai-assistant"
            className="px-4 py-2.5 rounded-xl font-semibold text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 flex items-center gap-2 transition-all text-sm"
          >
            <Bot className="w-4 h-4" />
            AI Assistant
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Total Creator Posts</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white">{loading ? '...' : stats?.totalContent || 0}</p>
          <p className="text-[11px] text-slate-400">Total posts in your library</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Published Posts</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white">{loading ? '...' : stats?.publishedContent || 0}</p>
          <p className="text-[11px] text-slate-400">Live & active content items</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Draft Content</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white">{loading ? '...' : stats?.draftContent || 0}</p>
          <p className="text-[11px] text-slate-400">Posts currently in progress</p>
        </div>
      </div>

      {/* Content Breakdown & Recent Posts */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Category breakdown */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            Category Distribution
          </h3>
          {loading ? (
            <div className="text-xs text-slate-400">Loading breakdown...</div>
          ) : stats?.categoryBreakdown && stats.categoryBreakdown.length > 0 ? (
            <div className="space-y-3 pt-2">
              {stats.categoryBreakdown.map((cat) => (
                <div key={cat._id} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-300">{cat._id}</span>
                    <span className="text-slate-400">{cat.count} items</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{
                        width: `${Math.min(100, (cat.count / (stats.totalContent || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-4">No content categorized yet.</p>
          )}
        </div>

        {/* Recent Content */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              Recent Content Items
            </h3>
            <Link to="/content" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1">
              View All Library <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="text-xs text-slate-400 py-4">Loading recent content...</div>
          ) : stats?.recentContent && stats.recentContent.length > 0 ? (
            <div className="space-y-3">
              {stats.recentContent.map((item) => (
                <div
                  key={item._id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 flex items-center justify-between transition-colors"
                >
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-slate-200 line-clamp-1">{item.title}</h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">{item.category}</span>
                      <span>•</span>
                      <span>{item.platform}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                        item.status === 'published'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {item.status}
                    </span>
                    <Link
                      to={`/content/edit/${item._id}`}
                      className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 px-2 py-1 bg-indigo-500/10 rounded-lg"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border border-dashed border-slate-800 rounded-xl space-y-2">
              <p className="text-xs text-slate-400">No content posts created yet.</p>
              <Link
                to="/content/new"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Create your first post
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
