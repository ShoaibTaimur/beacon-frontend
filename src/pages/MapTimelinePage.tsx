import { useState, useEffect, useMemo, ChangeEvent } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { getDeviceLocationHistory, getDevice, getSharedDevice } from '../services/api';
import LocationTimelineMap from '../components/dashboard/LocationTimelineMap';
import { useAuth } from '../contexts/AuthContext';
import { LocationLog, Device } from '../types';

interface StayPoint {
  latitude: number;
  longitude: number;
  durationMs: number;
  start: string;
  end: string;
  pointsCount?: number;
}

export default function MapTimelinePage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const isApp = searchParams.get('app') === 'true';

  // Date defaults to local YYYY-MM-DD
  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [history, setHistory] = useState<LocationLog[]>([]);
  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const { user, loading: authLoading } = useAuth();

  // Fetch Device details and History
  useEffect(() => {
    if (!id) return;
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    const storedToken = sessionStorage.getItem('temp_auth_token');
    const hasToken = !!(urlToken || storedToken);

    if (authLoading && !hasToken) {
      return;
    }

    if (!authLoading && !user && !hasToken) {
      navigate('/login');
      return;
    }

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        let deviceData: Device | null = null;
        try {
          const deviceRes = await getDevice(id!);
          deviceData = deviceRes.data.device;
        } catch {
          try {
            const sharedRes = await getSharedDevice(id!);
            deviceData = sharedRes.data.device;
          } catch (sharedErr) {
            console.error('[MapTimeline] Failed to get device details:', sharedErr);
          }
        }

        const historyRes = await getDeviceLocationHistory(id!, selectedDate);
        setHistory(historyRes.data.history || []);
        if (deviceData) {
          setDevice(deviceData);
        }
        setSelectedIndex(null);
      } catch (err: any) {
        console.error('[MapTimeline] Failed to load data:', err);
        setError(err.response?.data?.error || 'Failed to load location history');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, selectedDate, user, authLoading, navigate]);

  // Compute Stays/Stops (>15 min within 50m)
  const stops = useMemo<StayPoint[]>(() => {
    const computed: StayPoint[] = [];
    if (history.length === 0) return computed;

    let currentGroup = [history[0]];

    for (let i = 1; i < history.length; i++) {
      const pt = history[i];
      const prev = currentGroup[0];

      // Haversine distance
      const R = 6371000; // meters
      const lat1 = (prev.latitude * Math.PI) / 180;
      const lat2 = (pt.latitude * Math.PI) / 180;
      const dLat = ((pt.latitude - prev.latitude) * Math.PI) / 180;
      const dLon = ((pt.longitude - prev.longitude) * Math.PI) / 180;

      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const dist = R * c;

      if (dist <= 50) {
        currentGroup.push(pt);
      } else {
        const durationMs = new Date(currentGroup[currentGroup.length - 1].timestamp).getTime() - new Date(currentGroup[0].timestamp).getTime();
        if (durationMs >= 15 * 60 * 1000) {
          computed.push({
            start: currentGroup[0].timestamp,
            end: currentGroup[currentGroup.length - 1].timestamp,
            durationMs,
            latitude: currentGroup.reduce((acc, curr) => acc + curr.latitude, 0) / currentGroup.length,
            longitude: currentGroup.reduce((acc, curr) => acc + curr.longitude, 0) / currentGroup.length,
            pointsCount: currentGroup.length,
          });
        }
        currentGroup = [pt];
      }
    }

    if (currentGroup.length > 0) {
      const durationMs = new Date(currentGroup[currentGroup.length - 1].timestamp).getTime() - new Date(currentGroup[0].timestamp).getTime();
      if (durationMs >= 15 * 60 * 1000) {
        computed.push({
          start: currentGroup[0].timestamp,
          end: currentGroup[currentGroup.length - 1].timestamp,
          durationMs,
          latitude: currentGroup.reduce((acc, curr) => acc + curr.latitude, 0) / currentGroup.length,
          longitude: currentGroup.reduce((acc, curr) => acc + curr.longitude, 0) / currentGroup.length,
          pointsCount: currentGroup.length,
        });
      }
    }

    return computed;
  }, [history]);

  // Format Duration helper
  const formatDuration = (ms: number) => {
    const mins = Math.round(ms / 60000);
    if (mins < 60) return `${mins} mins`;
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return remMins > 0 ? `${hrs} hrs ${remMins} mins` : `${hrs} hrs`;
  };

  const handleSliderChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSelectedIndex(parseInt(e.target.value));
  };

  const activePoint = selectedIndex !== null ? history[selectedIndex] : null;

  return (
    <div className={`min-h-screen bg-[#050912] text-white flex flex-col font-sans ${isApp ? 'h-screen overflow-hidden' : ''}`}>
      {/* Conditionally render header based on isApp flag */}
      {!isApp && (
        <header className="border-b border-white/5 bg-[#050912]/70 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-3 sm:py-0 min-h-[4rem] flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-neutral-900 rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Location Timeline
                </h1>
                <p className="text-xs text-neutral-400">
                  {device ? `${device.deviceName} (${device.model})` : 'Device History'}
                </p>
              </div>
            </div>

            {/* Datepicker inside header */}
            <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
              <span className="text-xs text-neutral-400">Select Date:</span>
              <div className="relative flex items-center gap-2 bg-neutral-900/60 border border-neutral-800 hover:border-cyan-500/50 rounded-xl px-3 py-1.5 transition-all duration-200 cursor-pointer">
                <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs font-semibold text-neutral-200">
                  {new Date(selectedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                />
              </div>
            </div>
          </div>
        </header>
      )}

      <main className={`flex-1 flex min-h-0 animate-beacon-slide-up ${isApp ? 'flex-col p-2 h-full' : 'flex-col md:flex-row p-6 max-w-7xl mx-auto w-full gap-6'}`}>
        {/* Left Side: Map with Bottom Timeline Slider */}
        <div className={`flex-1 flex flex-col min-h-0 relative ${isApp ? 'h-[55%]' : 'min-h-[400px] md:min-h-0'}`}>
          {/* Header overlay for App WebView mode */}
          {isApp && (
            <div className="absolute top-4 left-4 z-[1010] flex items-center gap-2 bg-neutral-950/90 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/10 shadow-2xl hover:border-cyan-500/50 transition-all duration-200 cursor-pointer">
              <svg className="w-4 h-4 text-cyan-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs font-bold text-neutral-100">
                {new Date(selectedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
              />
            </div>
          )}

          {/* Map Viewer */}
          <div className={`flex-1 min-h-0 relative bg-slate-900/60 rounded-2xl border border-white/5 overflow-hidden shadow-2xl flex flex-col w-full ${isApp ? 'h-full' : 'h-[400px] md:h-full'}`}>
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-[#050912]/80 z-20">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
                  <p className="text-sm text-neutral-400">Loading timeline...</p>
                </div>
              </div>
            ) : error ? (
              <div className="absolute inset-0 flex items-center justify-center bg-[#050912]/80 z-20 p-6 text-center">
                <div className="max-w-md">
                  <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-lg font-bold text-white">Access Denied</p>
                  <p className="text-sm text-neutral-400 mt-2">{error}</p>
                </div>
              </div>
            ) : history.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center bg-[#050912]/80 z-20 p-6 text-center">
                <div className="max-w-sm">
                  <svg className="w-16 h-16 text-neutral-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 20l-5.447-2.724A2 2 0 013 15.487V7.512a2 2 0 011.196-1.812L9 3m0 17l6.764-3.382a2 2 0 001.236-1.813V7.512a2 2 0 00-1.236-1.813L9 3m0 17V3" />
                  </svg>
                  <p className="text-base font-semibold text-neutral-200">No Location Logs</p>
                  <p className="text-xs text-neutral-400 mt-2">
                    No trajectory points were recorded for this device on {new Date(selectedDate).toLocaleDateString()}.
                  </p>
                </div>
              </div>
            ) : (
              <LocationTimelineMap
                history={history}
                stops={stops}
                selectedIndex={selectedIndex}
                onSelectIndex={setSelectedIndex}
              />
            )}
          </div>

          {/* Timeline Scrubbing Control Bar */}
          {history.length > 0 && !loading && (
            <div className="mt-4 bg-white/[0.02] border border-white/5 rounded-2xl p-4 shadow-xl backdrop-blur-md z-30">
              <div className="flex items-center justify-between mb-3 text-xs text-neutral-400">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="font-bold text-neutral-200">Scrub Trajectory</span>
                </div>
                <div className="font-mono text-neutral-300">
                  {activePoint
                    ? new Date(activePoint.timestamp).toLocaleTimeString()
                    : 'Select a point on the slider'}
                </div>
              </div>

              <input
                type="range"
                min="0"
                max={history.length - 1}
                value={selectedIndex ?? 0}
                onChange={handleSliderChange}
                className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />

              {activePoint && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3 pt-3 border-t border-neutral-800/60 text-xs">
                  <div>
                    <div className="text-neutral-500">Latitude</div>
                    <div className="font-mono font-semibold text-neutral-200">{activePoint.latitude.toFixed(6)}</div>
                  </div>
                  <div>
                    <div className="text-neutral-500">Longitude</div>
                    <div className="font-mono font-semibold text-neutral-200">{activePoint.longitude.toFixed(6)}</div>
                  </div>
                  {activePoint.accuracy !== undefined && activePoint.accuracy !== null && (
                    <div>
                      <div className="text-neutral-500">Accuracy</div>
                      <div className="font-semibold text-cyan-400">± {activePoint.accuracy.toFixed(1)} m</div>
                    </div>
                  )}
                  <div>
                    <div className="text-neutral-500">Status</div>
                    <div className="font-semibold text-emerald-400">Logged Point</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Stay Points / Stops Timeline List */}
        <div className={`w-full flex flex-col ${isApp ? 'h-[45%] mt-2 min-h-0' : 'md:w-80 mt-4 md:mt-0'}`}>
          <div className={`bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex-1 flex flex-col overflow-hidden shadow-2xl backdrop-blur-md ${isApp ? 'min-h-0' : 'min-h-[300px] max-h-[500px] md:max-h-none'}`}>
            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
              <h2 className="font-bold text-sm tracking-tight text-neutral-100 flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Stay Locations
              </h2>
              <span className="bg-amber-500/10 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/20">
                {stops.length} found
              </span>
            </div>

            {/* Scrollable Stay Nodes list */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {stops.length === 0 ? (
                <div className="text-center py-12 text-neutral-500 text-xs">
                  <svg className="w-8 h-8 mx-auto mb-2 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  No stationary points recorded today (staying &gt; 15 mins).
                </div>
              ) : (
                stops.map((stop, i) => (
                  <div
                    key={i}
                    className="p-3 bg-neutral-950/60 border border-neutral-900 hover:border-amber-500/30 rounded-xl transition-all cursor-pointer group"
                    onClick={() => {
                      // Find first coordinate index that matches or is closest to this stop
                      const idx = history.findIndex((h) => h.timestamp === stop.start);
                      if (idx !== -1) setSelectedIndex(idx);
                    }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">Stay Point #{i + 1}</span>
                      <span className="text-[10px] font-mono text-neutral-400">
                        {new Date(stop.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-neutral-200 group-hover:text-amber-400 transition-colors">
                      Stopped for {formatDuration(stop.durationMs)}
                    </div>
                    <div className="text-[10px] text-neutral-500 mt-1">
                      From {new Date(stop.start).toLocaleTimeString()} to {new Date(stop.end).toLocaleTimeString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 h-[500px] w-[500px] animate-float-slow rounded-full bg-blue-600/[0.04] blur-3xl" />
        <div className="absolute top-1/3 left-0 h-[400px] w-[400px] animate-float-slow rounded-full bg-cyan-500/[0.04] blur-3xl" style={{ animationDelay: "-3s" }} />
      </div>
    </div>
  );
}
