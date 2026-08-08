import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { PlatformStats, User as UserType, ContentItem } from '../types';
import {
  ShieldAlert,
  Users,
  FileText,
  Bot,
  AlertTriangle,
  Trash2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  Shield,
  Layers,
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [users, setUsers] = useState<UserType[]>([]);
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'content' | 'security'>('users');
  const [searchUser, setSearchUser] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, contentRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/content'),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.platformStats);
      if (usersRes.data.success) setUsers(usersRes.data.users);
      if (contentRes.data.success) setContents(contentRes.data.contents);
    } catch (err) {
      console.error('Failed to load admin console data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
    if (!window.confirm(`Are you sure you want to change user status to '${newStatus}'?`)) return;

    try {
      const res = await api.put(`/admin/users/${userId}/status`, { status: newStatus });
      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId || u.id === userId ? { ...u, status: newStatus as any } : u))
        );
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update user status');
    }
  };

  const handleDeleteContentAdmin = async (id: string) => {
    if (!window.confirm('Admin Action: Permanently delete this post from system database?')) return;

    try {
      const res = await api.delete(`/admin/content/${id}`);
      if (res.data.success) {
        setContents((prev) => prev.filter((c) => c._id !== id));
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete content');
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUser.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
            Platform Admin Console
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor platform metrics, user accounts, content moderation, and prompt injection threat logs
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold flex items-center gap-2 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Admin Data
        </button>
      </div>

      {/* Admin Platform Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Total Users</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">{loading ? '...' : stats?.totalUsers || 0}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Total Posts</span>
            <FileText className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">{loading ? '...' : stats?.totalContent || 0}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>AI Generations</span>
            <Bot className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">{loading ? '...' : stats?.totalAIRequests || 0}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Injection Threats</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-extrabold text-amber-400">{loading ? '...' : stats?.suspiciousAIRequests || 0}</p>
        </div>
      </div>

      {/* Tab Controls */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'users'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          User Accounts Management ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('content')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'content'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          All Content Moderation ({contents.length})
        </button>
      </div>

      {/* TAB 1: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="relative max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              placeholder="Filter users by name or email..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-[10px] uppercase font-bold text-slate-400 bg-slate-950/60 border-b border-slate-800">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Total Posts</th>
                  <th className="p-3">Joined Date</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredUsers.map((u) => {
                  const uId = u._id || u.id;
                  return (
                    <tr key={uId} className="hover:bg-slate-950/40 transition-colors">
                      <td className="p-3 font-semibold text-white">
                        <div>{u.name}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{u.email}</div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            u.role === 'ADMIN'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            u.status === 'disabled'
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {u.status || 'active'}
                        </span>
                      </td>
                      <td className="p-3">{u.contentCount || 0}</td>
                      <td className="p-3 text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-right">
                        {u.role !== 'ADMIN' && (
                          <button
                            onClick={() => handleToggleUserStatus(uId, u.status || 'active')}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors ${
                              u.status === 'disabled'
                                ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                                : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'
                            }`}
                          >
                            {u.status === 'disabled' ? 'Enable Account' : 'Disable Account'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CONTENT MODERATION */}
      {activeTab === 'content' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="space-y-3">
            {contents.map((item) => (
              <div
                key={item._id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-4 text-xs"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="font-semibold text-slate-300">
                      Author: {typeof item.userId === 'object' ? item.userId?.name : 'User'}
                    </span>
                    <span>•</span>
                    <span className="text-slate-400">{item.category}</span>
                    <span>•</span>
                    <span className="text-slate-400">{item.platform}</span>
                  </div>
                  <h4 className="font-bold text-white text-sm">{item.title}</h4>
                  <p className="text-slate-300 line-clamp-2 leading-relaxed">{item.body}</p>
                </div>

                <button
                  onClick={() => handleDeleteContentAdmin(item._id)}
                  className="px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold flex items-center gap-1 transition-colors shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Post
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
