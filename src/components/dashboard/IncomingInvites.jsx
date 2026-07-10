import { useState, useEffect } from 'react';
import { getIncomingInvites, acceptInvite, declineInvite } from '../../services/api';

export default function IncomingInvites() {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvites();
  }, []);

  const loadInvites = async () => {
    try {
      const res = await getIncomingInvites();
      setInvites(res.data.invites || []);
    } catch (err) {
      console.error('[IncomingInvites]', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      await acceptInvite(id);
      setInvites((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      console.error('[Accept]', err.response?.data?.error || err.message);
    }
  };

  const handleDecline = async (id) => {
    try {
      await declineInvite(id);
      setInvites((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      console.error('[Decline]', err.response?.data?.error || err.message);
    }
  };

  if (loading || invites.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400" />
        </span>
        Pending Invites ({invites.length})
      </h2>
      <div className="space-y-3">
        {invites.map((inv) => (
          <div
            key={inv.id}
            className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-xl backdrop-blur-sm"
          >
            <div>
              <p className="text-sm text-white font-medium">
                {inv.fromEmail} wants to share{' '}
                <span className="text-cyan-400">{inv.deviceName}</span>
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-cyan-500/15 text-cyan-400 border border-cyan-500/20">
                  {inv.role}
                </span>
                <span className="text-[10px] text-slate-600">
                  {inv.permittedFields?.join(', ')}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleAccept(inv.id)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all"
              >
                Accept
              </button>
              <button
                onClick={() => handleDecline(inv.id)}
                className="px-4 py-1.5 rounded-lg text-xs font-medium text-slate-400 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                Decline
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
