import { useState, useEffect } from 'react';
import { getAdminUsers, blockAdminUser, getAdminSupportMessages, replyToSupportMessage } from '../services/api';
import Navbar from '../components/layout/Navbar';
import Loader from '../components/ui/Loader';
import Button from '../components/ui/Button';

interface AdminUser {
  id: string;
  firebaseUid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: string;
  isBlocked: boolean;
  blockedUntil: string | null;
  createdAt: string;
  deviceCount: number;
}

interface AdminSupportMessage {
  _id: string;
  sender: {
    _id: string;
    email: string;
    displayName: string | null;
    photoURL: string | null;
  } | null;
  message: string;
  adminReply: string | null;
  repliedAt: string | null;
  createdAt: string;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'support'>('users');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [supportMessages, setSupportMessages] = useState<AdminSupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [replyLoading, setReplyLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  
  // Support replying states
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [supportFilter, setSupportFilter] = useState<'all' | 'pending' | 'replied'>('all');

  // Ban Modal States
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [banDuration, setBanDuration] = useState<string>('60'); // default 60 minutes
  const [customMinutes, setCustomMinutes] = useState<string>('');
  const [showBanModal, setShowBanModal] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await getAdminUsers();
      if (res.data?.success) {
        setUsers(res.data.users);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch users list');
    } finally {
      setLoading(false);
    }
  };

  const fetchSupport = async () => {
    try {
      const res = await getAdminSupportMessages();
      if (res.data?.success) {
        setSupportMessages(res.data.messages);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch support tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setError('');
    if (activeTab === 'users') {
      fetchUsers();
    } else {
      fetchSupport();
    }
  }, [activeTab]);

  const handleBlockPermanently = async (user: AdminUser) => {
    if (!window.confirm(`Are you absolutely sure you want to permanently block ${user.email}? This will revoke all API access.`)) {
      return;
    }
    setError('');
    setActionLoading(user.id);
    try {
      await blockAdminUser(user.id, { isBlocked: true });
      await fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to block user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleLiftBlockOrBan = async (user: AdminUser) => {
    setError('');
    setActionLoading(user.id);
    try {
      await blockAdminUser(user.id, { isBlocked: false, durationMinutes: null });
      await fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to lift block/ban');
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenBanModal = (user: AdminUser) => {
    setSelectedUser(user);
    setBanDuration('60');
    setCustomMinutes('');
    setShowBanModal(true);
  };

  const handleApplyBan = async () => {
    if (!selectedUser) return;
    setError('');
    
    let minutes = parseInt(banDuration, 10);
    if (banDuration === 'custom') {
      minutes = parseInt(customMinutes, 10);
    }

    if (isNaN(minutes) || minutes <= 0) {
      alert('Please specify a valid positive number of minutes.');
      return;
    }

    setActionLoading(selectedUser.id);
    setShowBanModal(false);
    try {
      await blockAdminUser(selectedUser.id, { isBlocked: false, durationMinutes: minutes });
      await fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to temporarily ban user');
    } finally {
      setActionLoading(null);
      setSelectedUser(null);
    }
  };

  const handleReplySubmit = async (messageId: string) => {
    const text = replyText[messageId];
    if (!text || !text.trim()) return;

    setError('');
    setReplyLoading(messageId);
    try {
      await replyToSupportMessage(messageId, text.trim());
      setReplyText(prev => ({ ...prev, [messageId]: '' }));
      await fetchSupport();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reply to support ticket');
    } finally {
      setReplyLoading(null);
    }
  };

  const getStatusBadge = (user: AdminUser) => {
    if (user.isBlocked) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
          Blocked
        </span>
      );
    }

    if (user.blockedUntil && new Date(user.blockedUntil) > new Date()) {
      const remainingTime = Math.ceil((new Date(user.blockedUntil).getTime() - Date.now()) / 60000);
      return (
        <span className="inline-flex flex-col items-start gap-0.5">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Banned Temporarily
          </span>
          <span className="text-[10px] text-slate-400 ml-1">
            Expires in {remainingTime}m ({new Date(user.blockedUntil).toLocaleTimeString()})
          </span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        Active
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredSupport = supportMessages.filter((msg) => {
    if (supportFilter === 'pending') return !msg.adminReply;
    if (supportFilter === 'replied') return !!msg.adminReply;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#050912] text-white pb-32">
      {/* Background gradients */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-red-500/[0.03] blur-3xl animate-float-slow" />
        <div className="absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full bg-blue-600/[0.03] blur-3xl animate-float-slow" style={{ animationDelay: "-4s" }} />
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-12">
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-red-400 via-amber-400 to-cyan-400 bg-clip-text text-transparent">
              Admin Shield Dashboard
            </h1>
            <p className="mt-1 text-slate-400 text-sm">
              Manage user moderation access, bans, and answer support or bug report tickets.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={activeTab === 'users' ? fetchUsers : fetchSupport}
              disabled={loading}
              className="bg-white/[0.03] border-white/10 hover:bg-white/10 cursor-pointer"
            >
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-6 mb-8 border-b border-white/5 pb-px">
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 text-sm font-bold tracking-wider uppercase transition-all relative cursor-pointer ${
              activeTab === 'users'
                ? 'text-cyan-400 font-extrabold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Users Shield
            {activeTab === 'users' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('support')}
            className={`pb-3 text-sm font-bold tracking-wider uppercase transition-all relative cursor-pointer ${
              activeTab === 'support'
                ? 'text-cyan-400 font-extrabold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Support Tickets
            {activeTab === 'support' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
            )}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-fade-in flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-300 ml-4 font-bold text-xs uppercase cursor-pointer">
              Dismiss
            </button>
          </div>
        )}

        {/* TAB 1: USERS SHIELD */}
        {activeTab === 'users' && (
          <div className="bg-white/[0.01] backdrop-blur-xl border border-white/5 rounded-2xl shadow-2xl overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <Loader size="lg" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-slate-500 text-sm">No registered users found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02] text-slate-400 text-xs font-bold uppercase tracking-wider">
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Devices</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Joined</th>
                      <th className="px-6 py-4 text-right">Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-white/[0.01] transition-colors">
                        {/* User Info */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 flex items-center justify-center bg-gradient-to-br from-cyan-500/20 to-blue-600/20">
                              {user.photoURL ? (
                                <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-xs font-bold text-cyan-400 uppercase">
                                  {(user.displayName || user.email || '?')[0]}
                                </span>
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-white">
                                {user.displayName || 'Unnamed User'}
                              </div>
                              <div className="text-xs text-slate-400 font-mono">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                            user.role === 'admin' 
                              ? 'bg-red-500/10 text-red-400 border border-red-500/10' 
                              : 'bg-white/5 text-slate-300'
                          }`}>
                            {user.role}
                          </span>
                        </td>

                        {/* Device count */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                            </svg>
                            <span className="font-semibold text-slate-200">{user.deviceCount}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          {getStatusBadge(user)}
                        </td>

                        {/* Registered Date */}
                        <td className="px-6 py-4 text-slate-400 text-xs">
                          {new Date(user.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {user.role === 'admin' ? (
                              <span className="text-xs text-slate-500 italic">Self/Admin System Protected</span>
                            ) : (
                              <>
                                {/* If banned or blocked, show lift action */}
                                {(user.isBlocked || (user.blockedUntil && new Date(user.blockedUntil) > new Date())) ? (
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    className="border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
                                    onClick={() => handleLiftBlockOrBan(user)}
                                    disabled={actionLoading !== null}
                                    loading={actionLoading === user.id}
                                  >
                                    Lift Ban
                                  </Button>
                                ) : (
                                  <>
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      className="border-amber-500/20 text-amber-400 hover:bg-amber-500/10 cursor-pointer"
                                      onClick={() => handleOpenBanModal(user)}
                                      disabled={actionLoading !== null}
                                    >
                                      Ban Temp
                                    </Button>
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      className="border-red-500/20 text-red-400 hover:bg-red-500/10 cursor-pointer"
                                      onClick={() => handleBlockPermanently(user)}
                                      disabled={actionLoading !== null}
                                    >
                                      Block Perm
                                    </Button>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SUPPORT TICKETS */}
        {activeTab === 'support' && (
          <div className="space-y-6">
            {/* Filter buttons */}
            <div className="flex gap-2 bg-white/[0.02] p-1 rounded-xl border border-white/5 w-fit">
              {[
                { label: 'All Messages', value: 'all' },
                { label: 'Pending Reply', value: 'pending' },
                { label: 'Answered', value: 'replied' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSupportFilter(opt.value as any)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    supportFilter === opt.value
                      ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-300'
                      : 'text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-24 bg-white/[0.01] border border-white/5 rounded-2xl">
                <Loader size="lg" />
              </div>
            ) : filteredSupport.length === 0 ? (
              <div className="text-center py-24 bg-white/[0.01] border border-white/5 rounded-2xl">
                <p className="text-slate-500 text-sm">No support messages match this filter.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSupport.map((msg) => (
                  <div
                    key={msg._id}
                    className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 backdrop-blur-xl space-y-4 animate-fade-in hover:border-white/10 transition-colors"
                  >
                    {/* User Sender details */}
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden border border-white/10 flex items-center justify-center bg-gradient-to-br from-cyan-500/15 to-blue-600/15">
                          {msg.sender?.photoURL ? (
                            <img src={msg.sender.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-cyan-300 uppercase">
                              {(msg.sender?.displayName || msg.sender?.email || '?')[0]}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-white text-sm">
                            {msg.sender?.displayName || 'Unknown User'}
                          </div>
                          <div className="text-xs text-slate-400 font-mono">
                            {msg.sender?.email || 'No email associated'}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] text-slate-500 font-mono">
                          {formatDate(msg.createdAt)}
                        </span>
                        {msg.adminReply ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Replied
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
                            Pending Reply
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Support Message */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Message Content
                      </label>
                      <p className="text-slate-200 text-sm whitespace-pre-wrap leading-relaxed break-words">
                        {msg.message}
                      </p>
                    </div>

                    {/* Replies Panel */}
                    {msg.adminReply ? (
                      <div className="p-4 rounded-xl bg-red-500/[0.02] border border-red-500/10 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-red-400">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622" />
                          </svg>
                          <span className="text-xs font-bold uppercase tracking-wider">
                            Your Active Reply
                          </span>
                          {msg.repliedAt && (
                            <span className="text-[10px] text-slate-500 font-mono ml-auto">
                              {formatDate(msg.repliedAt)}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed break-words">
                          {msg.adminReply}
                        </p>
                      </div>
                    ) : (
                      <div className="pt-2">
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleReplySubmit(msg._id);
                          }}
                          className="space-y-3"
                        >
                          <textarea
                            placeholder="Type admin response to solve user issue..."
                            value={replyText[msg._id] || ''}
                            onChange={(e) => setReplyText(prev => ({ ...prev, [msg._id]: e.target.value }))}
                            className="w-full h-20 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-red-400 text-sm resize-none focus:ring-1 focus:ring-red-500/20"
                            maxLength={1000}
                            required
                          />
                          <div className="flex justify-end">
                            <Button
                              type="submit"
                              loading={replyLoading === msg._id}
                              disabled={!(replyText[msg._id]?.trim())}
                              size="sm"
                              className="bg-red-500 hover:bg-red-600 border-none text-white font-bold cursor-pointer"
                            >
                              Post Answer
                            </Button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ban Duration Selection Modal */}
      {showBanModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl animate-scale-up">
            <h3 className="text-lg font-bold text-white mb-2">
              Ban User Temporarily
            </h3>
            <p className="text-sm text-slate-400 mb-4">
              Select how long <span className="font-mono text-cyan-300 font-semibold">{selectedUser.email}</span> should be banned. Their access will restore automatically.
            </p>

            <div className="space-y-3 mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Ban Duration
              </label>
              
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: '5 Minutes', value: '5' },
                  { label: '1 Hour', value: '60' },
                  { label: '24 Hours', value: '1440' },
                  { label: '7 Days', value: '10080' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setBanDuration(opt.value)}
                    className={`px-3 py-2 text-sm rounded-lg border text-left transition-all cursor-pointer ${
                      banDuration === opt.value
                        ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300'
                        : 'bg-white/[0.02] border-white/5 text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setBanDuration('custom')}
                  className={`col-span-2 px-3 py-2 text-sm rounded-lg border text-left transition-all cursor-pointer ${
                    banDuration === 'custom'
                      ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300'
                      : 'bg-white/[0.02] border-white/5 text-slate-300 hover:bg-white/5'
                  }`}
                >
                  Custom Minutes...
                </button>
              </div>

              {banDuration === 'custom' && (
                <div className="mt-3 animate-fade-in">
                  <input
                    type="number"
                    placeholder="Enter minutes (e.g. 30)"
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 text-sm"
                    min="1"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/[0.02] border-white/5 text-slate-300 hover:bg-white/5 cursor-pointer"
                onClick={() => {
                  setShowBanModal(false);
                  setSelectedUser(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-amber-500 hover:bg-amber-600 border-none text-slate-950 font-bold cursor-pointer"
                onClick={handleApplyBan}
              >
                Apply Ban
              </Button>
            </div>
          </div>
        </div>
      )}

      <Navbar />
    </div>
  );
}
