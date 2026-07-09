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

  return (
    <div className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:bg-white/8 hover:border-white/15 hover:shadow-lg hover:shadow-cyan-500/5">
      {/* Status indicator */}
      <div className="absolute top-4 right-4">
        <div className="w-2.5 h-2.5 rounded-full bg-slate-600 ring-4 ring-slate-600/20" />
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

      {/* Device info */}
      <h3 className="text-white font-semibold text-lg mb-1 truncate">
        {device.deviceName}
      </h3>

      <div className="space-y-2 mt-3">
        {device.manufacturer && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">Brand</span>
            <span className="text-slate-300 ml-auto">
              {device.manufacturer}
            </span>
          </div>
        )}
        {device.model && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">Model</span>
            <span className="text-slate-300 ml-auto">{device.model}</span>
          </div>
        )}
        {device.androidVersion && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">Android</span>
            <span className="text-slate-300 ml-auto">
              {device.androidVersion}
            </span>
          </div>
        )}
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
