import { useState, useEffect } from 'react';
import {
  sendTrustInvite,
  getTrustedUsers,
  getOutgoingInvites,
  revokeTrustLink,
  revokeInvite,
  updateTrustLink,
} from '../../services/api';

const ROLES = [
  { value: 'viewer', label: 'Viewer', desc: 'View device info only' },
  { value: 'finder', label: 'Finder', desc: 'Locate + view' },
  { value: 'manager', label: 'Manager', desc: 'Ring + locate + view' },
];

const FIELD_OPTIONS = [
  { value: 'battery', label: 'Battery' },
  { value: 'location', label: 'Location' },
  { value: 'storage', label: 'Storage' },
  { value: 'ram', label: 'RAM' },
  { value: 'soundMode', label: 'Sound Mode' },
  { value: 'online', label: 'Online Status' },
  { value: 'lastSeen', label: 'Last Seen' },
  { value: 'androidVersion', label: 'Android Version' },
];

export default function TrustPanel({ deviceId, deviceName, isOpen, onClose }) {
  const [tab, setTab] = useState('invite');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const [fields, setFields] = useState(['battery', 'online', 'lastSeen']);
  const [trustedUsers, setTrustedUsers] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && deviceId) {
      loadTrustedUsers();
      loadPendingInvites();
    }
  }, [isOpen, deviceId]);

  const loadTrustedUsers = async () => {
    try {
      const res = await getTrustedUsers(deviceId);
      setTrustedUsers(res.data.trustedUsers || []);
    } catch (err) {
      console.error('[TrustPanel] Load trusted users:', err.message);
    }
  };

  const loadPendingInvites = async () => {
    try {
      const res = await getOutgoingInvites();
      setPendingInvites(
        (res.data.invites || []).filter(
          (i) => i.deviceId === deviceId && i.status === 'pending'
        )
      );
    } catch (err) {
      console.error('[TrustPanel] Load invites:', err.message);
    }
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await sendTrustInvite({
        email,
        deviceId,
        role,
        permittedFields: fields,
      });
      setMessage('Invite sent');
      setEmail('');
      loadPendingInvites();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send invite');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeAccess = async (linkId) => {
    try {
      await revokeTrustLink(linkId);
      setTrustedUsers((prev) => prev.filter((u) => u.linkId !== linkId));
      setMessage('Access revoked');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to revoke');
    }
  };

  const handleCancelInvite = async (inviteId) => {
    try {
      await revokeInvite(inviteId);
      setPendingInvites((prev) => prev.filter((i) => i.id !== inviteId));
      setMessage('Invite cancelled');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to cancel');
    }
  };

  const toggleField = (field) => {
    setFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg mx-4 bg-slate-900/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div>
            <h3 className="text-lg font-bold text-white">Share Device</h3>
            <p className="text-xs text-slate-400 mt-0.5">{deviceName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5">
          {['invite', 'users', 'pending'].map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(''); setMessage(''); }}
              className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors ${
                tab === t
                  ? 'text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {t === 'invite' && 'Invite'}
              {t === 'users' && `Trusted (${trustedUsers.length})`}
              {t === 'pending' && `Pending (${pendingInvites.length})`}
            </button>
          ))}
        </div>

        {/* Feedback */}
        {message && (
          <div className="mx-6 mt-4 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
            {message}
          </div>
        )}
        {error && (
          <div className="mx-6 mt-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {error}
          </div>
        )}

        {/* Content */}
        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
          {/* Invite Tab */}
          {tab === 'invite' && (
            <form onSubmit={handleSendInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="companion@example.com"
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/25 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {ROLES.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                        role === r.value
                          ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400'
                          : 'bg-white/3 border-white/5 text-slate-400 hover:border-white/15'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  {ROLES.find((r) => r.value === role)?.desc}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Visible Data
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {FIELD_OPTIONS.map((f) => (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() => toggleField(f.value)}
                      className={`px-2.5 py-1 rounded-full text-xs transition-all border ${
                        fields.includes(f.value)
                          ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400'
                          : 'bg-white/3 border-white/5 text-slate-500 hover:border-white/15'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg text-white text-sm font-semibold hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Sending...' : 'Send Invite'}
              </button>
            </form>
          )}

          {/* Trusted Users Tab */}
          {tab === 'users' && (
            <div className="space-y-3">
              {trustedUsers.length === 0 ? (
                <p className="text-center text-slate-600 text-sm py-8">
                  No trusted users yet
                </p>
              ) : (
                trustedUsers.map((user) => (
                  <div
                    key={user.linkId}
                    className="flex items-center justify-between p-3 bg-white/3 rounded-xl border border-white/5"
                  >
                    <div>
                      <p className="text-sm text-white font-medium">
                        {user.email}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-cyan-500/15 text-cyan-400 border border-cyan-500/20">
                          {user.role}
                        </span>
                        <span className="text-[10px] text-slate-600">
                          {user.permittedFields?.join(', ')}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRevokeAccess(user.linkId)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                    >
                      Revoke
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Pending Invites Tab */}
          {tab === 'pending' && (
            <div className="space-y-3">
              {pendingInvites.length === 0 ? (
                <p className="text-center text-slate-600 text-sm py-8">
                  No pending invites
                </p>
              ) : (
                pendingInvites.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between p-3 bg-white/3 rounded-xl border border-white/5"
                  >
                    <div>
                      <p className="text-sm text-white font-medium">
                        {inv.toEmail}
                      </p>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-amber-500/15 text-amber-400 border border-amber-500/20">
                        {inv.role} · pending
                      </span>
                    </div>
                    <button
                      onClick={() => handleCancelInvite(inv.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
