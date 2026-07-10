import { useState } from 'react';
import { removeDevice } from '../../services/api';
import Button from '../ui/Button';

export default function DeviceCard({ device, onRemoved }) {
  const [removing, setRemoving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleRemove = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }

    setRemoving(true);
    try {
      await removeDevice(device.id);
      onRemoved(device.id);
    } catch (err) {
      console.error('[DeviceCard] Remove failed:', err.message);
    } finally {
      setRemoving(false);
      setConfirmDelete(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const formatBytes = (bytes) => {
    if (bytes == null) return '—';
    const gb = bytes / 1073741824;
    if (gb >= 1) return `${gb.toFixed(1)} GB`;
    return `${(bytes / 1048576).toFixed(0)} MB`;
  };

  const batteryColor = (level) => {
    if (level == null) return 'bg-slate-600';
    if (level <= 15) return 'bg-red-500';
    if (level <= 40) return 'bg-amber-400';
    return 'bg-emerald-500';
  };

  const batteryTextColor = (level) => {
    if (level == null) return 'text-slate-500';
    if (level <= 15) return 'text-red-400';
    if (level <= 40) return 'text-amber-400';
    return 'text-emerald-400';
  };

  const soundModeIcon = (mode) => {
    switch (mode) {
      case 'silent':
        return (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-3.15a.75.75 0 011.28.53v13.74a.75.75 0 01-1.28.53L8.25 15H5.25A2.25 2.25 0 013 12.75v-1.5A2.25 2.25 0 015.25 9h3z" />
          </svg>
        );
      case 'vibrate':
        return (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
          </svg>
        );
      default:
        return (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-3.15a.75.75 0 011.28.53v12.74a.75.75 0 01-1.28.53L6.75 15.75H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
          </svg>
        );
    }
  };

  const usageBarPercent = (used, total) => {
    if (used == null || total == null || total === 0) return 0;
    return Math.min((used / total) * 100, 100);
  };

  return (
    <div className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:bg-white/8 hover:border-white/15 hover:shadow-lg hover:shadow-cyan-500/5">
      {/* Status indicator — pulse for online */}
      <div className="absolute top-4 right-4">
        {device.isOnline ? (
          <div className="relative">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 animate-pulse" />
          </div>
        ) : (
          <div className="w-2.5 h-2.5 rounded-full bg-slate-600 ring-4 ring-slate-600/20" />
        )}
      </div>

      {/* Device icon */}
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/10 flex items-center justify-center mb-4">
        <svg
          className="w-6 h-6 text-cyan-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
          />
        </svg>
      </div>

      {/* Device name */}
      <h3 className="text-white font-semibold text-lg mb-1 truncate">
        {device.deviceName}
      </h3>

      <div className="space-y-3 mt-3">
        {/* Battery */}
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-slate-500 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 10.5h.375c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125H21M3.75 18h15A2.25 2.25 0 0021 15.75v-6a2.25 2.25 0 00-2.25-2.25h-15A2.25 2.25 0 001.5 9.75v6A2.25 2.25 0 003.75 18z" />
              </svg>
              Battery
              {device.isCharging && (
                <span className="text-amber-400 text-xs">⚡</span>
              )}
            </span>
            <span className={`font-semibold ${batteryTextColor(device.batteryLevel)}`}>
              {device.batteryLevel != null ? `${device.batteryLevel}%` : '—'}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${batteryColor(device.batteryLevel)}`}
              style={{ width: `${device.batteryLevel ?? 0}%` }}
            />
          </div>
        </div>

        {/* Storage */}
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-slate-500">Storage</span>
            <span className="text-slate-300 text-xs">
              {formatBytes(device.storageUsed)} / {formatBytes(device.storageTotal)}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${usageBarPercent(device.storageUsed, device.storageTotal) > 90 ? 'bg-red-500' : 'bg-cyan-400'}`}
              style={{ width: `${usageBarPercent(device.storageUsed, device.storageTotal)}%` }}
            />
          </div>
        </div>

        {/* RAM */}
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-slate-500">RAM</span>
            <span className="text-slate-300 text-xs">
              {formatBytes(device.ramUsed)} / {formatBytes(device.ramTotal)}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 bg-blue-500"
              style={{ width: `${usageBarPercent(device.ramUsed, device.ramTotal)}%` }}
            />
          </div>
        </div>

        {/* Info row: Sound, Android, Brand */}
        <div className="flex items-center gap-3 flex-wrap pt-1">
          {device.soundMode && (
            <span className="flex items-center gap-1 text-xs text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">
              {soundModeIcon(device.soundMode)}
              {device.soundMode.charAt(0).toUpperCase() + device.soundMode.slice(1)}
            </span>
          )}
          {device.androidVersion && (
            <span className="text-xs text-cyan-400/80 bg-cyan-400/5 px-2 py-0.5 rounded-full font-medium">
              Android {device.androidVersion}
            </span>
          )}
          {device.manufacturer && (
            <span className="text-xs text-slate-500">
              {device.manufacturer}
            </span>
          )}
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-xs">
          <svg className={`w-3.5 h-3.5 ${device.latitude != null ? 'text-emerald-400' : 'text-slate-700'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          <span className={device.latitude != null ? 'text-slate-400' : 'text-slate-700'}>
            {device.latitude != null
              ? `${device.latitude.toFixed(4)}, ${device.longitude.toFixed(4)}`
              : 'No location data'}
          </span>
        </div>

        {/* Last seen */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-500">Last seen</span>
          <span className="text-slate-300 ml-auto">
            {formatDate(device.lastSeen)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-5 pt-4 border-t border-white/5">
        <Button
          variant={confirmDelete ? 'danger' : 'ghost'}
          size="sm"
          onClick={handleRemove}
          loading={removing}
          className="w-full"
          id={`remove-device-${device.id}`}
        >
          {confirmDelete ? 'Confirm Remove' : 'Remove Device'}
        </Button>
      </div>
    </div>
  );
}
