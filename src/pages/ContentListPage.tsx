import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { ContentItem } from '../types';
import {
  FileText,
  PlusCircle,
  Search,
  Filter,
  Trash2,
  Edit,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Clock,
  Tag,
} from 'lucide-react';

export const ContentListPage: React.FC = () => {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Search and Filter states
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /**
   * CLOSURE EXAMPLE:
   * fetchContents is a closure created inside the ContentListPage component scope.
   * It retains lexical access to component state variables (search, category, status).
   */
  const fetchContents = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (category) params.category = category;
      if (status) params.status = status;

      const res = await api.get('/content', { params });
      if (res.data.success) {
        setContents(res.data.contents);
      }
    } catch (err) {
      console.error('Failed to load content list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, [category, status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchContents();
  };

  /**
   * CLOSURE & STALE STATE PREVENTION DEMONSTRATION:
   * 
   * 1. CLOSURE CONCEPT:
   * `handleDelete` is a closure defined within ContentListPage. When triggered by a click,
   * it captures and retains access to its lexical environment, specifically the `id` argument.
   * The `id` remains in scope and available after `await api.delete(...)` pauses and resumes.
   * 
   * 2. STALE-STATE PREVENTION:
   * The functional state updater `setContents((prev) => prev.filter(item => item._id !== id))`
   * is what prevents stale state. Rather than relying on a potentially stale `contents` array
   * captured when this render occurred, React passes the latest, up-to-date state as `prev`.
   * 
   * Note: The closure retains `id` across the async boundary, while the functional updater
   * (`prev => ...`) ensures state operations always execute against React's latest state.
   */
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this content item?')) return;

    setDeletingId(id);
    try {
      const res = await api.delete(`/content/${id}`);
      if (res.data.success) {
        // Functional state update passes latest state (`prev`) to avoid stale state reference
        setContents((prev) => prev.filter((item) => item._id !== id));
      }
    } catch (err) {
      alert('Failed to delete content.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-400" />
            Content Library
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manage, search, and edit your creator posts and drafts</p>
        </div>

        <Link
          to="/content/new"
          className="px-4 py-2.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/25 flex items-center gap-2 transition-all text-sm"
        >
          <PlusCircle className="w-4 h-4" />
          Create New Post
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search content by title, body, or tags..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Categories</option>
            <option value="Social Media">Social Media</option>
            <option value="Blog Post">Blog Post</option>
            <option value="Video Script">Video Script</option>
            <option value="Newsletter">Newsletter</option>
            <option value="Ad Copy">Ad Copy</option>
            <option value="Other">Other</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Content List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">Loading content library...</div>
      ) : contents.length > 0 ? (
        <div className="grid gap-4">
          {contents.map((item) => (
            <div
              key={item._id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                      item.status === 'published'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {item.status}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 text-xs font-medium">
                    {item.category}
                  </span>
                  <span className="text-xs text-slate-400">• {item.platform}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/content/edit/${item._id}`}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1 text-xs font-semibold"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(item._id)}
                    disabled={deletingId === item._id}
                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors flex items-center gap-1 text-xs font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">{item.title}</h3>
                <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">{item.body}</p>
              </div>

              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <Tag className="w-3 h-3 text-indigo-400" />
                  {item.tags.map((tag, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <p className="text-sm text-slate-400">No content posts match your search filters.</p>
          <Link
            to="/content/new"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
          >
            <PlusCircle className="w-4 h-4" /> Create a new post now
          </Link>
        </div>
      )}
    </div>
  );
};
