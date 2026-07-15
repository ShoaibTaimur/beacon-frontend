import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import {
  getSharedDevices,
  revokeTrustLink,
  ringDevice,
  stopRingDevice,
  locateDevice,
  refreshDevice,
} from "../services/api";
import Loader from "../components/ui/Loader";

interface SharedDeviceListItem {
  id: string;
  _id: string;
  linkId: string;
  deviceName: string;
  ownerEmail: string;
  role: "owner" | "manager" | "finder" | "viewer";
  permittedFields: string[];
  batteryLevel?: number;
  isCharging?: boolean;
  storageUsed?: number;
  storageTotal?: number;
  ramUsed?: number;
  ramTotal?: number;
  latitude?: number;
  longitude?: number;
  locationTimestamp?: string;
  soundMode?: string;
  lastSeen?: string;
  isOnline?: boolean;
  isRinging?: boolean;
}

function formatBytes(bytes?: number) {
  if (!bytes) return "—";
  const gb = bytes / 1_073_741_824;
  return gb >= 1
    ? `${gb.toFixed(1)} GB`
    : `${(bytes / 1_048_576).toFixed(0)} MB`;
}

function batteryColorClass(level?: number) {
  if (level == null) return "text-slate-400";
  if (level <= 15) return "text-red-400";
  if (level <= 40) return "text-amber-400";
  return "text-emerald-400";
}

function batteryBarColor(level?: number) {
  if (level == null) return "bg-slate-600";
  if (level <= 15) return "bg-red-500";
  if (level <= 40) return "bg-amber-500";
  return "bg-emerald-500";
}

function formatLocationTime(dateStr?: string) {
  if (!dateStr) return "Never";
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(diff / 60000);

  if (seconds < 5) return "Just now";
  if (seconds < 60) return `${seconds}s ago`;
  if (minutes < 60) return `${minutes}m ago`;
  return date.toLocaleDateString();
}

export default function SharedDevicesPage() {
  const [devices, setDevices] = useState<SharedDeviceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadSharedDevices(true);

    const interval = setInterval(() => {
      loadSharedDevices(false);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const loadSharedDevices = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const res = await getSharedDevices();
      const mapped = (res.data.devices || []).map((d: any) => ({
        ...d,
        id: d.id || d._id,
      }));
      setDevices(mapped);
    } catch (err: any) {
      setError("Failed to load shared devices");
      console.error("[SharedDevices]", err.message);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  const handleRemove = async (linkId: string) => {
    if (
      !window.confirm("Are you sure you want to stop monitoring this device?")
    )
      return;
    try {
      await revokeTrustLink(linkId);
      setDevices((prev) => prev.filter((d) => d.linkId !== linkId));
    } catch (err: any) {
      console.error(
        "[SharedDevices] Failed to remove shared device:",
        err.message,
      );
      alert("Failed to remove shared device");
    }
  };

  return (
    <div className="min-h-screen bg-[#050912] text-white antialiased">
      <Navbar />

      <main className="pt-6 pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-beacon-slide-up">
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
              onClick={() => {
                setLoading(true);
                setError("");
                loadSharedDevices(true);
              }}
              className="text-cyan-400 hover:text-cyan-300 underline text-sm cursor-pointer"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && devices.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/5 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-slate-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                />
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
                onRefreshed={() => loadSharedDevices(false)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 h-[500px] w-[500px] animate-float-slow rounded-full bg-blue-600/[0.04] blur-3xl" />
        <div
          className="absolute top-1/3 left-0 h-[400px] w-[400px] animate-float-slow rounded-full bg-cyan-500/[0.04] blur-3xl"
          style={{ animationDelay: "-3s" }}
        />
      </div>
    </div>
  );
}

interface SharedDeviceCardProps {
  device: SharedDeviceListItem;
  onRemove: (linkId: string) => void;
  onRefreshed?: () => void;
}

function SharedDeviceCard({ device, onRemove, onRefreshed }: SharedDeviceCardProps) {
  const [ringing, setRinging] = useState(false);
  const [locating, setLocating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [commandError, setCommandError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [_timeTicker, setTimeTicker] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeTicker(t => t + 1);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const deviceId = device.id || device._id;
  const canExecuteCommands = ['manager', 'finder'].includes(device.role);
  const hasLocation = device.latitude != null && device.longitude != null;

  const handleRefresh = async () => {
    setCommandError(null);
    setRefreshing(true);
    const initialLastSeen = device.lastSeen;
    try {
      await refreshDevice(deviceId);

      // Start high-frequency status polling
      const startTime = Date.now();
      const intervalId = setInterval(async () => {
        try {
          const res = await getSharedDevices();
          const updatedDevices = res.data.devices || [];
          const updatedDevice = updatedDevices.find((d: any) => (d.id || d._id) === deviceId);
          if (updatedDevice) {
            const initialTime = initialLastSeen ? new Date(initialLastSeen).getTime() : 0;
            const updatedTime = updatedDevice.lastSeen ? new Date(updatedDevice.lastSeen).getTime() : 0;

            if (updatedTime > initialTime) {
              clearInterval(intervalId);
              setRefreshing(false);
              onRefreshed?.();
              return;
            }
          }
        } catch (err) {
          console.error('[SharedDeviceCard] Polling error:', err);
        }

        if (Date.now() - startTime > 30000) {
          clearInterval(intervalId);
          setRefreshing(false);
          onRefreshed?.();
        }
      }, 2000);
    } catch (err: any) {
      setCommandError(err.response?.data?.error || 'Refresh failed');
      setRefreshing(false);
    }
  };

  const usageBarPercent = (used?: number, total?: number) => {
    if (!used || !total) return 0;
    return Math.min(100, Math.round((used / total) * 100));
  };

  return (
    <div className="group relative bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-2xl p-6 hover:bg-white/[0.04] hover:border-cyan-500/30 hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-500 animate-beacon-fade-in">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-cyan-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        {/* Device Info (Icon + Name/Model + Status) */}
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Icon */}
          <div className="w-9 h-9 rounded-lg border border-purple-400/40 bg-purple-500/10 flex flex-shrink-0 items-center justify-center">
            <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
            </svg>
          </div>
          {/* Name & Owner & Status indicator */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-white truncate">{device.deviceName}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[8px] font-bold uppercase bg-purple-500/15 text-purple-400 border border-purple-500/20">
                {device.role}
              </span>
              {/* Pulsing online/offline dot next to name */}
              {device.isOnline ? (
                <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping-slow" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-slate-600 flex-shrink-0" />
              )}
            </div>
            <p className="text-[10px] text-slate-500 truncate leading-tight mt-0.5">
              shared by {device.ownerEmail}
            </p>
          </div>
        </div>

        {/* Top Right Header Action Row */}
        <div className="flex items-center gap-1.5">
          {/* History Button */}
          {canExecuteCommands && (
            <button
              onClick={() => setShowHistory(true)}
              className="h-6 w-6 flex items-center justify-center rounded-md border border-white/10 bg-white/[0.03] text-slate-400 hover:text-cyan-400 hover:border-cyan-400/40 hover:bg-cyan-500/5 transition-all cursor-pointer"
              title="Location history logs"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          )}
          {/* Refresh Button */}
          {canExecuteCommands && (
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="h-6 w-6 flex items-center justify-center rounded-md border border-white/10 bg-white/[0.03] text-slate-400 hover:text-cyan-400 hover:border-cyan-400/40 hover:bg-cyan-500/5 transition-all cursor-pointer disabled:opacity-50"
              title="Request real-time update"
            >
              {refreshing ? (
                <svg className="h-3.5 w-3.5 animate-spin text-cyan-400" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
              ) : (
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                </svg>
              )}
            </button>
          )}
          {/* Stop Monitoring / Delete Button */}
          <button
            onClick={() => onRemove(device.linkId)}
            className="h-6 w-6 flex items-center justify-center rounded-md border border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:border-red-500 transition-all cursor-pointer"
            title="Stop monitoring this device"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </button>
        </div>
      </div>

      {device.fcmError && (
        <div className="mt-2 mb-4 flex items-start gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-400 font-medium">
          <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="leading-tight" title={device.fcmError}>
            Delayed commands: {device.fcmError}. Try disabling VPN/AdBlocker or whitelisting Firebase.
          </span>
        </div>
      )}

      {/* Visual System Metrics */}
      <div className="space-y-3.5">
        {/* Battery Container */}
        {device.batteryLevel != null && (
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5 hover:bg-white/[0.04] transition-colors duration-300">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <div className="w-4 h-2.5 border border-slate-500 rounded-[2px] p-[1px] relative flex items-center">
                  <div 
                    className={`h-full rounded-[0.5px] transition-all duration-500 ${
                      device.batteryLevel <= 15 ? 'bg-red-500' :
                      device.batteryLevel <= 40 ? 'bg-amber-400' : 'bg-emerald-400'
                    } ${device.isCharging ? 'animate-battery-charging' : ''}`}
                    style={{ width: `${device.batteryLevel}%` }}
                  />
                  <div className="w-[1px] h-1 bg-slate-500 absolute -right-[2px] rounded-r-[0.5px]" />
                </div>
                Battery
              </span>
              <span className={`font-bold ${
                device.batteryLevel <= 15 ? 'text-red-400' :
                device.batteryLevel <= 40 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {device.batteryLevel}%
              </span>
            </div>
            <div className="w-full h-1 overflow-hidden rounded-full bg-white/5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  device.batteryLevel <= 15 ? 'bg-red-500' :
                  device.batteryLevel <= 40 ? 'bg-amber-500' : 'bg-emerald-500'
                } ${device.isCharging ? 'animate-battery-charging' : ''}`}
                style={{ width: `${device.batteryLevel}%` }}
              />
            </div>
          </div>
        )}

        {/* RAM & Storage Dual Progress Bar layout */}
        {(device.storageUsed != null || device.ramUsed != null) && (
          <div className="grid grid-cols-2 gap-2">
            {/* Storage */}
            {device.storageUsed != null && (
              <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2">
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span className="text-slate-400 font-medium">Storage</span>
                  <span className="text-slate-400 font-semibold">
                    {formatBytes(device.storageUsed)}
                  </span>
                </div>
                <div className="w-full h-0.5 overflow-hidden rounded-full bg-white/5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      usageBarPercent(device.storageUsed, device.storageTotal) > 90 ? 'bg-red-500' : 'bg-cyan-400'
                    }`}
                    style={{ width: `${usageBarPercent(device.storageUsed, device.storageTotal)}%` }}
                  />
                </div>
                <div className="text-[8px] text-slate-500 mt-0.5 text-right">
                  of {formatBytes(device.storageTotal)}
                </div>
              </div>
            )}

            {/* RAM */}
            {device.ramUsed != null && (
              <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2">
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span className="text-slate-400 font-medium">RAM</span>
                  <span className="text-slate-400 font-semibold">
                    {formatBytes(device.ramUsed)}
                  </span>
                </div>
                <div className="w-full h-0.5 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full transition-all duration-500 bg-blue-500"
                    style={{ width: `${usageBarPercent(device.ramUsed, device.ramTotal)}%` }}
                  />
                </div>
                <div className="text-[8px] text-slate-500 mt-0.5 text-right">
                  of {formatBytes(device.ramTotal)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* GPS Radar Sweep Section */}
        {hasLocation && (
          <div className="relative h-24 bg-slate-950/60 rounded-lg border border-white/5 overflow-hidden flex items-center justify-center">
            {device.locationTimestamp && (
              <div className="absolute top-1.5 left-1.5 z-20 flex items-center gap-1 px-1.5 py-0.5 rounded border border-cyan-400/40 bg-cyan-500/10 text-[8px] font-medium text-cyan-400 tracking-wide">
                <span>SYNCED: {formatLocationTime(device.locationTimestamp).toUpperCase()}</span>
              </div>
            )}

            <Link
              to={`/devices/${device.id}/map`}
              className="absolute top-1.5 right-1.5 z-20 rounded border border-cyan-400/40 bg-cyan-500/5 px-1.5 py-0.5 text-[8px] font-bold text-cyan-400 cursor-pointer hover:bg-cyan-500/10 transition-colors"
            >
              TIMELINE
            </Link>
            
            <div className="relative flex h-14 w-14 items-center justify-center">
              <span className="absolute h-full w-full rounded-full border border-cyan-400/20" />
              <span className="absolute h-9 w-9 rounded-full border border-cyan-400/30" />
              
              <div className="absolute h-full w-full animate-radar-sweep">
                <div className="absolute top-1/2 left-1/2 h-1/2 w-1/2 origin-top-left bg-gradient-to-br from-cyan-400/50 via-cyan-400/10 to-transparent" style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }} />
              </div>
              
              <Link
                to={`/devices/${device.id}/map`}
                className="absolute flex items-center justify-center group/map z-10 cursor-pointer"
              >
                <span className="absolute w-3.5 h-3.5 rounded-full bg-cyan-300/40 animate-ping" />
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-300 shadow-lg shadow-cyan-400/70" />
                
                <span className="absolute bottom-6 bg-slate-900 border border-white/10 text-[10px] text-cyan-300 px-1.5 py-0.5 rounded opacity-0 group-hover/map:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-xl">
                  View Timeline Map
                </span>
              </Link>
            </div>
            
            <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 text-[8px] text-cyan-400 font-semibold tracking-wider">
              <span>● GPS BEACON</span>
            </div>
            
            <div className="absolute bottom-1.5 right-1.5 text-[8px] text-slate-400 font-mono">
              {device.latitude != null && device.longitude != null
                ? `${device.latitude.toFixed(5)}°N, ${device.longitude.toFixed(5)}°E`
                : 'NO SIGNAL'}
            </div>
          </div>
        )}

        {/* View Location Timeline Button */}
        {hasLocation && (
          <Link
            to={`/devices/${device.id}/map`}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-cyan-400/40 bg-cyan-500/5 text-cyan-400 hover:bg-cyan-500/10 text-[10px] font-bold transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A2 2 0 013 15.487V7.512a2 2 0 011.196-1.812L9 3m0 17l6.764-3.382a2 2 0 001.236-1.813V7.512a2 2 0 00-1.236-1.813L9 3m0 17V3" />
            </svg>
            View Location Timeline
          </Link>
        )}

        {device.soundMode && (
          <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
            <span>Sound Mode</span>
            <span className="font-semibold text-slate-300 capitalize">{device.soundMode}</span>
          </div>
        )}

        {device.lastSeen && (
          <div className="text-[9px] text-slate-500 text-right px-1">
            Last seen: {new Date(device.lastSeen).toLocaleString()}
          </div>
        )}

        {/* Command Error */}
        {commandError && (
          <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-semibold flex items-center gap-1.5 animate-pulse">
            <svg className="w-3.5 h-3.5 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{commandError}</span>
          </div>
        )}

        {/* Remote Command Actions */}
        {canExecuteCommands && (
          <div className="pt-3 border-t border-white/5">
            <p className="text-[8px] text-slate-500 uppercase tracking-widest font-bold mb-2">Remote Commands</p>
            <div className="grid grid-cols-3 gap-2">
              {/* Ring / Stop Ring */}
              <button
                onClick={async () => {
                  setCommandError(null);
                  setRinging(true);
                  try {
                    if (device.isRinging) {
                      await stopRingDevice(deviceId);
                    } else {
                      await ringDevice(deviceId);
                    }
                    setRinging(false);
                    onRefreshed?.();
                  } catch (err: any) {
                    setCommandError(err.response?.data?.error || 'Ring failed');
                    setRinging(false);
                  }
                }}
                disabled={ringing}
                className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg border transition-all cursor-pointer text-center ${
                  device.isRinging
                    ? 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20 text-red-400'
                    : 'bg-white/[0.03] border-white/5 hover:bg-cyan-500/10 hover:border-cyan-500/20 text-slate-400 hover:text-cyan-400'
                } disabled:opacity-50`}
              >
                {ringing ? (
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                  </svg>
                )}
                <span className="text-[8px] font-bold uppercase">{device.isRinging ? 'Stop' : 'Ring'}</span>
              </button>

              {/* Locate */}
              <button
                onClick={async () => {
                  setCommandError(null);
                  setLocating(true);
                  const initialLastSeen = device.lastSeen;
                  try {
                    await locateDevice(deviceId);

                    // Start high-frequency status polling
                    const startTime = Date.now();
                    const intervalId = setInterval(async () => {
                      try {
                        const res = await getSharedDevices();
                        const updatedDevices = res.data.devices || [];
                        const updatedDevice = updatedDevices.find((d: any) => (d.id || d._id) === deviceId);
                        if (updatedDevice) {
                          const initialTime = initialLastSeen ? new Date(initialLastSeen).getTime() : 0;
                          const updatedTime = updatedDevice.lastSeen ? new Date(updatedDevice.lastSeen).getTime() : 0;

                          if (updatedTime > initialTime) {
                            clearInterval(intervalId);
                            setLocating(false);
                            onRefreshed?.();
                            return;
                          }
                        }
                      } catch (err) {
                        console.error('[SharedDeviceCard] Polling error:', err);
                      }

                      if (Date.now() - startTime > 30000) {
                        clearInterval(intervalId);
                        setLocating(false);
                        onRefreshed?.();
                      }
                    }, 2000);
                  } catch (err: any) {
                    setCommandError(err.response?.data?.error || 'Locate failed');
                    setLocating(false);
                  }
                }}
                disabled={locating}
                className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg bg-white/[0.03] border border-white/5 hover:bg-cyan-500/10 hover:border-cyan-500/20 text-slate-400 hover:text-cyan-400 transition-all cursor-pointer text-center disabled:opacity-50"
              >
                {locating ? (
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
                  </svg>
                )}
                <span className="text-[8px] font-bold uppercase">Locate</span>
              </button>

              {/* Refresh */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg bg-white/[0.03] border border-white/5 hover:bg-cyan-500/10 hover:border-cyan-500/20 text-slate-400 hover:text-cyan-400 transition-all cursor-pointer text-center disabled:opacity-50"
              >
                {refreshing ? (
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                  </svg>
                )}
                <span className="text-[8px] font-bold uppercase">Refresh</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* History Panel Modal */}
      <HistoryPanel
        deviceId={deviceId}
        deviceName={device.deviceName || ''}
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
      />
    </div>
  );
}
