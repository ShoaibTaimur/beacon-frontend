import { useState, useEffect } from 'react';
import { getDeviceHistory } from '../../services/api';

const ACTION_METADATA = {
  ring: {
    label: 'Rung Device',
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  stop_ring: {
    label: 'Stopped Ring',
    color: 'text-slate-400 bg-white/5 border-white/10',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  locate: {
    label: 'Located Device',
    color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25g3 3 0 1115 0z" />
      </svg>
    ),
  },
  refresh: {
    label: 'Refreshed Telemetry',
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    ),
  },
  permission_granted: {
    label: 'Companion Added',
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    ),
  },
  permission_revoked: {
    label: 'Companion Revoked',
    color: 'text-red-400 bg-red-500/10 border-red-500/20',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
      </svg>
    ),
  },
  permission_changed: {
    label: 'Permissions Changed',
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
      </svg>
    ),
  },
  device_registered: {
    label: 'Device Registered',
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-13.32 9-11.622 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  device_removed: {
    label: 'Device Removed',
    color: 'text-red-400 bg-red-500/10 border-red-500/20',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    ),
  },
};

export default function HistoryPanel({ deviceId, deviceName, isOpen, onClose }) {
  const [events, setEvents] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && deviceId) {
      setEvents([]);
      setPage(1);
      loadHistory(1, true);
    }
  }, [isOpen, deviceId]);

  const loadHistory = async (targetPage, replace = false) => {
    setLoading(true);
    setError('');
    try {
      const res = await getDeviceHistory(deviceId, targetPage);
      const newEvents = res.data.events || [];
      const pagination = res.data.pagination || { page: 1, pages: 1 };
      
      setEvents((prev) => (replace ? newEvents : [...prev, ...newEvents]));
      setHasMore(pagination.page < pagination.pages);
      setPage(pagination.page);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load device event history');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadHistory(page + 1);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
            <h3 className="text-lg font-bold text-white">Device History</h3>
            <p className="text-xs text-slate-400 mt-0.5">{deviceName} (Last 30 Days)</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Error Feedback */}
        {error && (
          <div className="mx-6 mt-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {error}
          </div>
        )}

        {/* Events Timeline */}
        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
          {events.length === 0 && !loading ? (
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-slate-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
              <p className="text-slate-500 text-sm">No events logged for this device yet</p>
            </div>
          ) : (
            <div className="relative border-l border-white/10 pl-6 space-y-6">
              {events.map((event) => {
                const meta = ACTION_METADATA[event.action] || {
                  label: event.action,
                  color: 'text-slate-400 bg-white/5 border-white/10',
                  icon: (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                };

                return (
                  <div key={event.id} className="relative">
                    {/* Circle timeline indicator */}
                    <div className={`absolute -left-[35px] top-0 w-7 h-7 rounded-full flex items-center justify-center border ${meta.color} shadow-lg backdrop-blur-md`}>
                      {meta.icon}
                    </div>

                    {/* Event details */}
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-white">
                          {meta.label}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {formatDate(event.createdAt)}
                        </span>
                      </div>
                      
                      <p className="text-xs text-slate-400 mt-1">
                        Triggered by <span className="text-slate-300 font-medium">{event.actorEmail || 'Owner'}</span>
                      </p>

                      {/* Extra details (optional parameters/metadata) */}
                      {event.details && (
                        <div className="mt-2 p-2 bg-white/3 border border-white/5 rounded-lg text-[11px] text-slate-400 font-mono overflow-x-auto whitespace-pre-wrap">
                          {Object.entries(event.details).map(([key, val]) => (
                            <div key={key}>
                              <span className="text-cyan-400">{key}:</span> {Array.isArray(val) ? `[${val.join(', ')}]` : String(val)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Load More Button */}
          {hasMore && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-xs font-semibold text-slate-300 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Loading...' : 'Load More Events'}
              </button>
            </div>
          )}

          {loading && events.length === 0 && (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
