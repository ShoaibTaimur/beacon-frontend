import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { getSharedDevices, revokeTrustLink } from '../services/api';
import Loader from '../components/ui/Loader';

function formatBytes(bytes) {
  if (!bytes) return '—';
  const gb = bytes / 1_073_741_824;
  return gb >= 1 ? `${gb.toFixed(1)} GB` : `${(bytes / 1_048_576).toFixed(0)} MB`;
}

function batteryColorClass(level) {
  if (level == null) return 'text-slate-400';
  if (level <= 15) return 'text-red-400';
  if (level <= 40) return 'text-amber-400';
  return 'text-emerald-400';
}

function batteryBarColor(level) {
  if (level == null) return 'bg-slate-600';
  if (level <= 15) return 'bg-red-500';
  if (level <= 40) return 'bg-amber-500';
  return 'bg-emerald-500';
}

function formatLocationTime(dateStr) {
  if (!dateStr) return 'Never';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(diff / 60000);

  if (seconds < 5) return 'Just now';
  if (seconds < 60) return `${seconds}s ago`;
  if (minutes < 60) return `${minutes}m ago`;
  return date.toLocaleDateString();
}

export default function SharedDevicesPage() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSharedDevices(true);

    const interval = setInterval(() => {
      loadSharedDevices(false);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const loadSharedDevices = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const res = await getSharedDevices();
      setDevices(res.data.devices || []);
    } catch (err) {
      setError('Failed to load shared devices');
      console.error('[SharedDevices]', err.message);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  const handleRemove = async (linkId) => {
    if (!window.confirm('Are you sure you want to stop monitoring this device?')) return;
    try {
      await revokeTrustLink(linkId);
      setDevices((prev) => prev.filter((d) => d.linkId !== linkId));
    } catch (err) {
      console.error('[SharedDevices] Failed to remove shared device:', err.message);
      alert('Failed to remove shared device');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Shared With Me
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Devices other users have shared with you
          </p>
        </div>

        {loading && <Loader size="lg" className="py-20" />}

        {error && (
          <div className="text-center py-20">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => { setLoading(true); setError(''); loadSharedDevices(); }}
              className="text-cyan-400 hover:text-cyan-300 underline text-sm"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && devices.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/5 flex items-center justify-center">
              <svg className="w-10 h-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-400 mb-2">
              No shared devices
            </h3>
            <p className="text-sm text-slate-600 max-w-sm mx-auto">
              When someone shares a device with you, it will appear here.
            </p>
          </div>
        )}

        {!loading && !error && devices.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {devices.map((device) => (
              <SharedDeviceCard
                key={device.id || device.linkId}
                device={device}
                onRemove={handleRemove}
              />
            ))}
          </div>
        )}
      </main>

      {/* Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/3 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-600/3 rounded-full blur-3xl" />
      </div>
    </div>
  );
}

function SharedDeviceCard({ device, onRemove }) {
  const hasLocation = device.latitude != null && device.longitude != null;

  return (
    <div className="group relative bg-white/[0.03] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{device.deviceName}</h3>
            <p className="text-[10px] text-slate-500">
              shared by {device.ownerEmail}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-purple-500/15 text-purple-400 border border-purple-500/20">
            {device.role}
          </span>
          <button
            onClick={() => onRemove(device.linkId)}
            className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
            title="Remove this shared device"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-3">
        {device.batteryLevel != null && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-medium">Battery</span>
              <span className={`text-xs font-bold ${batteryColorClass(device.batteryLevel)}`}>
                {device.batteryLevel}%
              </span>
            </div>
            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${batteryBarColor(device.batteryLevel)} ${device.isCharging ? 'animate-battery-charging' : ''}`}
                style={{ width: `${device.batteryLevel}%` }}
              />
            </div>
          </div>
        )}

        {(device.storageUsed != null || device.ramUsed != null) && (
          <div className="grid grid-cols-2 gap-3">
            {device.storageUsed != null && (
              <div className="p-2 bg-white/[0.02] rounded-lg border border-white/5">
                <p className="text-[9px] text-slate-500 font-medium mb-0.5">Storage</p>
                <p className="text-xs text-white font-semibold">{formatBytes(device.storageUsed)}</p>
                {device.storageTotal && (
                  <p className="text-[8px] text-slate-600">of {formatBytes(device.storageTotal)}</p>
                )}
              </div>
            )}
            {device.ramUsed != null && (
              <div className="p-2 bg-white/[0.02] rounded-lg border border-white/5">
                <p className="text-[9px] text-slate-500 font-medium mb-0.5">RAM</p>
                <p className="text-xs text-white font-semibold">{formatBytes(device.ramUsed)}</p>
                {device.ramTotal && (
                  <p className="text-[8px] text-slate-600">of {formatBytes(device.ramTotal)}</p>
                )}
              </div>
            )}
          </div>
        )}

        {hasLocation && (
          <Link
            to={`/devices/${device.id}/map`}
            className="flex items-center justify-between p-2 bg-white/[0.02] rounded-lg border border-white/5 hover:border-cyan-500/20 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
              </svg>
              <span className="text-[10px] text-slate-400 font-mono">
                {device.latitude?.toFixed(5)}°N, {device.longitude?.toFixed(5)}°E
              </span>
            </div>
            {device.locationTimestamp && (
              <span className="text-[8px] text-cyan-400/80 font-mono font-semibold uppercase">
                {formatLocationTime(device.locationTimestamp)}
              </span>
            )}
          </Link>
        )}

        {device.soundMode && (
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500">Sound</span>
            <span className="text-[10px] text-slate-300 font-medium capitalize">{device.soundMode}</span>
          </div>
        )}

        {device.lastSeen && (
          <p className="text-[9px] text-slate-600 text-right">
            Last seen: {new Date(device.lastSeen).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}
