import { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import DeviceList from '../components/dashboard/DeviceList';
import IncomingInvites from '../components/dashboard/IncomingInvites';
import { useAuth } from '../contexts/AuthContext';
import { getConfig, getAdminConfig, updateConfig, getMe } from '../services/api';

// Helper function to hash password in SHA-256
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function AdminApkSettings({ currentAdminEmail }: { currentAdminEmail: string }) {
  const [password, setPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  useEffect(() => {
    setNewAdminEmail(currentAdminEmail);
    const fetchCurrentPassword = async () => {
      try {
        const res = await getAdminConfig('apk_download');
        if (res.data && res.data.success && res.data.value && res.data.value.password) {
          setCurrentPassword(res.data.value.password);
        }
      } catch (err) {
        console.error('Failed to load current password:', err);
      }
    };
    fetchCurrentPassword();
  }, [currentAdminEmail]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMsg('Password cannot be empty');
      return;
    }
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const hash = await sha256(password);
      await updateConfig('apk_download', { 
        password: password.trim(),
        passwordHash: hash 
      });
      setCurrentPassword(password.trim());
      setSuccessMsg('Download password updated and saved successfully!');
      setPassword('');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || err.message || 'Failed to save password');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAdminEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim() || !newAdminEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address');
      return;
    }
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await updateConfig('admin_config', { adminEmail: newAdminEmail.toLowerCase().trim() });
      setSuccessMsg(`Admin email updated to "${newAdminEmail}" successfully!`);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || err.message || 'Failed to save admin email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-10 rounded-3xl border border-cyan-500/10 bg-slate-950/40 p-6 backdrop-blur-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 h-[200px] w-[200px] rounded-full bg-cyan-500/[0.02] blur-3xl pointer-events-none" />
      
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Admin Portal Settings</h2>
          <p className="text-xs text-slate-400">Manage security settings for Companion APK download</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Passwords Settings Form */}
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">APK Download Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Set new download password"
                className="w-full bg-[#050912] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer text-xs"
              >
                {showPassword ? "HIDE" : "SHOW"}
              </button>
            </div>
            <p className="mt-1 text-[10px] text-slate-500 mb-2">
              Only users entering this password on the landing page will be allowed to download the APK.
            </p>
            {currentPassword && (
              <div className="mt-2 text-xs text-cyan-400/80 flex items-center gap-2">
                <span>Current Password:</span>
                <span className="font-mono bg-[#050912] border border-white/5 px-2 py-0.5 rounded text-white tracking-wider">
                  {showCurrentPassword ? currentPassword : '••••••••'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="text-slate-400 hover:text-white cursor-pointer text-[10px] underline underline-offset-2"
                >
                  {showCurrentPassword ? "Hide" : "Show"}
                </button>
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm px-6 py-2.5 transition-all duration-300 disabled:opacity-50 cursor-pointer shadow-lg shadow-cyan-500/20"
          >
            Update Password
          </button>
        </form>

        {/* Admin Email Settings Form */}
        <form onSubmit={handleUpdateAdminEmail} className="space-y-4 border-t md:border-t-0 md:border-l border-white/5 md:pl-8 pt-6 md:pt-0">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Admin Gmail Address</label>
            <input
              type="email"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              placeholder="e.g. mitashoaib@gmail.com"
              className="w-full bg-[#050912] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />
            <p className="mt-1 text-[10px] text-slate-500">
              Change this email to delegate admin access to another account. You can also edit this value directly in DB.
            </p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-800 text-white font-semibold text-sm px-6 py-2.5 transition-all duration-300 disabled:opacity-50 cursor-pointer"
          >
            Update Admin Gmail
          </button>
        </form>
      </div>

      {(successMsg || errorMsg) && (
        <div className="mt-6 pt-4 border-t border-white/5">
          {successMsg && (
            <p className="text-xs text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {successMsg}
            </p>
          )}
          {errorMsg && (
            <p className="text-xs text-red-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              {errorMsg}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [adminEmail, setAdminEmail] = useState('mitashoaib@gmail.com');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchAdminStatus = async () => {
      try {
        const meRes = await getMe();
        if (meRes.data && meRes.data.success && meRes.data.user) {
          const profile = meRes.data.user;
          if (profile.role === 'admin' || profile.isAdmin === true) {
            setIsAdmin(true);
            try {
              const res = await getConfig('admin_config');
              if (res.data && res.data.success && res.data.value && res.data.value.adminEmail) {
                setAdminEmail(res.data.value.adminEmail);
              }
            } catch (err) {
              // Ignore config load error
            }
            return;
          }
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      }

      try {
        const res = await getConfig('admin_config');
        if (res.data && res.data.success && res.data.value && res.data.value.adminEmail) {
          const email = res.data.value.adminEmail;
          setAdminEmail(email);
          if (user?.email?.toLowerCase().trim() === email.toLowerCase().trim()) {
            setIsAdmin(true);
          }
        } else {
          if (user?.email?.toLowerCase().trim() === 'mitashoaib@gmail.com') {
            setIsAdmin(true);
          }
        }
      } catch (err) {
        console.error('Error fetching admin config:', err);
        if (user?.email?.toLowerCase().trim() === 'mitashoaib@gmail.com') {
          setIsAdmin(true);
        }
      }
    };

    if (user) {
      fetchAdminStatus();
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-[#050912] text-white antialiased">
      <Navbar />

      {/* Main content */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-beacon-slide-up">
        {/* Pending Invites Alert Area */}
        <IncomingInvites />

        {/* Admin Settings Panel */}
        {isAdmin && <AdminApkSettings currentAdminEmail={adminEmail} />}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            My Devices
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage and monitor your registered devices
          </p>
        </div>

        {/* Device grid */}
        <DeviceList />
      </main>

      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 h-[500px] w-[500px] animate-float-slow rounded-full bg-blue-600/[0.04] blur-3xl" />
        <div className="absolute top-1/3 left-0 h-[400px] w-[400px] animate-float-slow rounded-full bg-cyan-500/[0.04] blur-3xl" style={{ animationDelay: "-3s" }} />
      </div>
    </div>
  );
}
