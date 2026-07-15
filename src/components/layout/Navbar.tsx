import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { getIncomingInvites } from '../../services/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [inviteCount, setInviteCount] = useState<number>(0);

  useEffect(() => {
    if (user) {
      const loadInviteCount = async () => {
        try {
          const res = await getIncomingInvites();
          setInviteCount(res.data?.length || 0);
        } catch (err: any) {
          console.error('[Navbar] Get invites count:', err.message);
        }
      };
      loadInviteCount();
      const interval = setInterval(loadInviteCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-auto px-4">
      {/* Glassmorphic Capsule */}
      <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-[#050912]/80 backdrop-blur-xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(6,182,212,0.15)] transition-all duration-300 hover:border-cyan-500/30">
        
        {/* Branding Capsule */}
        <button
          onClick={() => navigate('/')}
          className="group flex items-center gap-0 hover:gap-2 px-2.5 py-1.5 bg-cyan-500/5 rounded-full border border-cyan-500/10 hover:border-cyan-500/30 transition-all duration-500 ease-out hover:scale-105 active:scale-95 cursor-pointer overflow-hidden"
        >
          <div className="relative flex items-center justify-center w-5 h-5 shrink-0 text-cyan-400">
            {/* Glowing background */}
            <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-[2px] animate-pulse" />
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5 relative z-10">
              <path d="M9.348 14.652a3.75 3.75 0 010-5.304m5.304 0a3.75 3.75 0 010 5.304m-7.425 2.121a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.808-3.808-9.98 0-13.788m13.788 0c3.808 3.808 3.808 9.98 0 13.788M12 12h.008v.008H12V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
          <span className="max-w-0 group-hover:max-w-[100px] opacity-0 group-hover:opacity-100 text-[10px] font-extrabold tracking-wider text-cyan-300 transition-all duration-500 ease-out overflow-hidden whitespace-nowrap">
            BEACON
          </span>
        </button>

        <div className="h-5 w-[1px] bg-white/10" />

        {/* Navigation Actions */}
        <div className="flex items-center gap-2">
          
          {/* My Devices */}
          <div className="group relative">
            <button
              onClick={() => navigate('/dashboard')}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ease-out hover:scale-125 hover:-translate-y-1 active:scale-95 cursor-pointer ${
                location.pathname === '/dashboard'
                  ? 'bg-cyan-500/20 border border-cyan-400/40 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                  : 'bg-white/[0.03] border border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
              </svg>
            </button>
            <span className="absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 opacity-0 pointer-events-none group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 bg-slate-950/95 border border-white/10 px-2 py-1 rounded text-[9px] font-bold text-white whitespace-nowrap shadow-xl z-50">
              My Devices
            </span>
          </div>

          {/* Shared Devices */}
          <div className="group relative">
            <button
              onClick={() => navigate('/shared')}
              className={`w-9 h-9 rounded-full flex items-center justify-center relative transition-all duration-300 ease-out hover:scale-125 hover:-translate-y-1 active:scale-95 cursor-pointer ${
                location.pathname === '/shared'
                  ? 'bg-cyan-500/20 border border-cyan-400/40 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                  : 'bg-white/[0.03] border border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
              {inviteCount > 0 && (
                <span className="absolute top-0 right-0 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
              )}
            </button>
            <span className="absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 opacity-0 pointer-events-none group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 bg-slate-950/95 border border-white/10 px-2 py-1 rounded text-[9px] font-bold text-white whitespace-nowrap shadow-xl z-50">
              Shared with me
            </span>
          </div>

          <div className="h-4 w-[1px] bg-white/10" />

          {/* User Profile */}
          <div className="group relative">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-white/10 flex items-center justify-center bg-gradient-to-br from-cyan-500/20 to-blue-600/20 shadow-[0_0_8px_rgba(6,182,212,0.1)] transition-all duration-300 ease-out hover:scale-125 hover:-translate-y-1 active:scale-95">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[11px] font-bold text-cyan-400 uppercase">
                  {(user.displayName || user.email || '?')[0]}
                </span>
              )}
            </div>
            <span className="absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 opacity-0 pointer-events-none group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 bg-slate-950/95 border border-white/10 px-2.5 py-1 rounded text-[9px] font-bold text-white whitespace-nowrap shadow-xl z-50">
              {user.displayName || user.email}
            </span>
          </div>

          {/* Logout */}
          <div className="group relative">
            <button
              onClick={handleLogout}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-white/[0.03] border border-white/5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-all duration-300 ease-out hover:scale-125 hover:-translate-y-1 active:scale-95 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l-2.25 2.25M19.5 12H8.25m11.25 0V9m0 6v3c0 .621-.504 1.125-1.125 1.125H3.375c-.621 0-1.125-.504-1.125-1.125V5.25c0-.621.504-1.125 1.125-1.125h14.25c.621 0 1.125.504 1.125 1.125v3.5" />
              </svg>
            </button>
            <span className="absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 opacity-0 pointer-events-none group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 bg-slate-950/95 border border-white/10 px-2 py-1 rounded text-[9px] font-bold text-white whitespace-nowrap shadow-xl z-50">
              Logout
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
