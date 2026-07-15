import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../ui/Button';
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
      const interval = setInterval(loadInviteCount, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050912]/70 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Navigation Links */}
          <div className="flex items-center gap-8">
            <div
              className="group flex items-center gap-3 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <span className="text-xl font-extrabold tracking-[0.22em] text-cyan-400 transition-all duration-300 group-hover:text-cyan-300 group-hover:tracking-[0.28em]">
                BEACON
              </span>
            </div>

            {user && (
              <div className="hidden md:flex items-center gap-1">
                <button
                  onClick={() => navigate('/dashboard')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                    location.pathname === '/dashboard'
                      ? 'text-cyan-400 bg-cyan-500/5'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  My Devices
                </button>
                <button
                  onClick={() => navigate('/shared')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    location.pathname === '/shared'
                      ? 'text-cyan-400 bg-cyan-500/5'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Shared with me
                  {inviteCount > 0 && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* User section */}
          {user && (
            <div className="flex items-center gap-4">
              {/* Mobile Invite indicator */}
              <button
                onClick={() => navigate('/shared')}
                className="md:hidden relative p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
                {inviteCount > 0 && (
                  <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-slate-900" />
                )}
              </button>

              <div className="hidden sm:flex items-center gap-3">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full ring-2 ring-cyan-500/30"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold animate-pulse">
                    {(user.displayName || user.email || '?')[0].toUpperCase()}
                  </div>
                )}
                <span className="text-sm text-slate-300 max-w-[150px] truncate">
                  {user.displayName || user.email}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                id="logout-button"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                  />
                </svg>
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
