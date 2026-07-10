import { useState } from 'react';
import { removeDevice } from '../../services/api';
import Button from '../ui/Button';
import TrustPanel from './TrustPanel';
import HistoryPanel from './HistoryPanel';

export default function DeviceCard({ device, onRemoved }) {
  const [removing, setRemoving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showTrust, setShowTrust] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

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
    <div className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 transition-all duration-500 hover:bg-white/10 hover:border-cyan-500/30 hover:shadow-2xl hover:shadow-cyan-500/10 animate-slide-up">
      {/* Background radial highlight */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        {/* Device Icon w/ dynamic color based on status */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/20 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
          <svg
            className="w-6 h-6 text-cyan-400 group-hover:animate-pulse"
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

        {/* Share + History + Status */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistory(true)}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-cyan-500/15 border border-white/5 hover:border-cyan-500/30 text-slate-500 hover:text-cyan-400 transition-all cursor-pointer"
            title="Device history logs"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button
            onClick={() => setShowTrust(true)}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-cyan-500/15 border border-white/5 hover:border-cyan-500/30 text-slate-500 hover:text-cyan-400 transition-all cursor-pointer"
            title="Share device"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
            </svg>
          </button>
          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
            {device.isOnline ? 'Active' : 'Offline'}
          </span>
          {device.isOnline ? (
            <div className="relative flex h-2.5 w-2.5">
              <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-md shadow-emerald-500/50" />
            </div>
          ) : (
            <div className="h-2.5 w-2.5 rounded-full bg-slate-600 ring-2 ring-slate-600/20" />
          )}
        </div>
      </div>

      {/* Name and Model */}
      <div className="mb-4">
        <h3 className="text-white font-bold text-lg leading-tight truncate group-hover:text-cyan-300 transition-colors duration-300">
          {device.deviceName}
        </h3>
        <p className="text-xs text-slate-400 mt-0.5 truncate">
          {device.manufacturer || 'Unknown Manufacturer'} • {device.model || 'Android Device'}
        </p>
      </div>

      {/* Visual System Metrics */}
      <div className="space-y-4">
        {/* Battery Container */}
        <div className="bg-slate-900/40 border border-white/5 rounded-xl p-3 hover:bg-slate-900/60 transition-colors duration-300">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-400 flex items-center gap-2 font-medium">
              <div className="w-5 h-3 border border-slate-500 rounded-[3px] p-[1px] relative flex items-center">
                <div 
                  className={`h-full rounded-[1px] transition-all duration-500 ${
                    device.batteryLevel == null ? 'bg-slate-500' :
                    device.batteryLevel <= 15 ? 'bg-red-500' :
                    device.batteryLevel <= 40 ? 'bg-amber-400' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${device.batteryLevel ?? 0}%` }}
                />
                <div className="w-[1.5px] h-1.5 bg-slate-500 absolute -right-[2.5px] rounded-r-[1px]" />
              </div>
              Battery
              {device.isCharging && (
                <span className="text-amber-400 text-xs animate-bounce">⚡</span>
              )}
            </span>
            <span className={`font-bold ${batteryTextColor(device.batteryLevel)}`}>
              {device.batteryLevel != null ? `${device.batteryLevel}%` : '—'}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${batteryColor(device.batteryLevel)}`}
              style={{ width: `${device.batteryLevel ?? 0}%` }}
            />
          </div>
        </div>

        {/* RAM & Storage Dual Progress Bar layout */}
        <div className="grid grid-cols-2 gap-3">
          {/* Storage */}
          <div className="bg-slate-900/40 border border-white/5 rounded-xl p-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-400 font-medium">Storage</span>
              <span className="text-slate-400 font-semibold">
                {formatBytes(device.storageUsed)}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  usageBarPercent(device.storageUsed, device.storageTotal) > 90 ? 'bg-red-500' : 'bg-cyan-400'
                }`}
                style={{ width: `${usageBarPercent(device.storageUsed, device.storageTotal)}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-500 mt-1 text-right">
              of {formatBytes(device.storageTotal)}
            </div>
          </div>

          {/* RAM */}
          <div className="bg-slate-900/40 border border-white/5 rounded-xl p-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-400 font-medium">RAM</span>
              <span className="text-slate-400 font-semibold">
                {formatBytes(device.ramUsed)}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 bg-blue-500"
                style={{ width: `${usageBarPercent(device.ramUsed, device.ramTotal)}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-500 mt-1 text-right">
              of {formatBytes(device.ramTotal)}
            </div>
          </div>
        </div>

        {/* GPS Radar Sweep Section */}
        <div className="relative h-28 bg-slate-950/60 rounded-xl border border-white/5 overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:14px_14px] bg-center" />
          
          <div className="absolute w-20 h-20 rounded-full border border-cyan-500/10" />
          <div className="absolute w-12 h-12 rounded-full border border-cyan-500/15" />
          <div className="absolute w-4 h-4 rounded-full border border-cyan-500/20" />
          
          <div className="absolute w-full h-[1px] bg-white/[0.02]" />
          <div className="absolute h-full w-[1px] bg-white/[0.02]" />
          
          <div 
            className="absolute w-[200%] h-[200%] origin-center animate-radar-sweep pointer-events-none"
            style={{
              background: 'conic-gradient(from 0deg, rgba(34,211,238,0.15) 0deg, transparent 90deg, transparent 360deg)'
            }}
          />
          
          {device.latitude != null && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${device.latitude},${device.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute flex items-center justify-center group/map z-10 cursor-pointer"
              style={{ transform: 'translate(10px, -15px)' }}
            >
              <span className="absolute w-4 h-4 rounded-full bg-cyan-400/40 animate-ping" />
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 ring-2 ring-white shadow-lg shadow-cyan-400/50" />
              
              <span className="absolute bottom-6 bg-slate-900 border border-white/10 text-[10px] text-cyan-300 px-1.5 py-0.5 rounded opacity-0 group-hover/map:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-xl">
                Open in Maps
              </span>
            </a>
          )}
          
          <div className="absolute bottom-2 left-3 flex items-center gap-1.5 text-[9px] text-slate-500 font-mono tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/70 animate-pulse" />
            <span>GPS BEACON</span>
          </div>
          
          <div className="absolute bottom-2 right-3 text-[9px] text-slate-400 font-mono">
            {device.latitude != null
              ? `${device.latitude.toFixed(5)}°N, ${device.longitude.toFixed(5)}°E`
              : 'NO SIGNAL'}
          </div>
        </div>

        {/* Collapsable details toggle */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-white transition-colors py-1 cursor-pointer font-semibold"
        >
          <span>System Parameters</span>
          <svg
            className={`w-4 h-4 transition-transform duration-300 ${showDetails ? 'rotate-180 text-cyan-400' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        {showDetails && (
          <div className="space-y-2 bg-slate-900/60 border border-white/5 rounded-xl p-3.5 text-xs animate-fade-in">
            {device.soundMode && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500 flex items-center gap-1.5">
                  {soundModeIcon(device.soundMode)}
                  Sound Profile
                </span>
                <span className="text-slate-300 font-semibold uppercase tracking-wider text-[10px]">
                  {device.soundMode}
                </span>
              </div>
            )}
            
            {device.androidVersion && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Android OS</span>
                <span className="text-slate-300 font-medium">
                  Version {device.androidVersion}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Last Telemetry</span>
              <span className="text-slate-300">
                {formatDate(device.lastSeen)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Remove device button */}
      <div className="mt-5 pt-4 border-t border-white/5">
        <Button
          variant={confirmDelete ? 'danger' : 'ghost'}
          size="sm"
          onClick={handleRemove}
          loading={removing}
          className="w-full text-xs font-semibold cursor-pointer"
          id={`remove-device-${device.id}`}
        >
          {confirmDelete ? 'Confirm Remove' : 'Remove Device'}
        </Button>
      </div>

      {/* Trust Panel Modal */}
      <TrustPanel
        deviceId={device.id}
        deviceName={device.deviceName}
        isOpen={showTrust}
        onClose={() => setShowTrust(false)}
      />

      {/* History Panel Modal */}
      <HistoryPanel
        deviceId={device.id}
        deviceName={device.deviceName}
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
      />
    </div>
  );
}
