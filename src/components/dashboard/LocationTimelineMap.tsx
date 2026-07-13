import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocationLog } from '../../types';

interface StayPoint {
  latitude: number;
  longitude: number;
  durationMs: number;
  start: string;
  end: string;
}

interface LocationTimelineMapProps {
  history?: LocationLog[];
  stops?: StayPoint[];
  selectedIndex?: number | null;
  onSelectIndex?: (index: number | null) => void;
}

export default function LocationTimelineMap({
  history = [],
  stops = [],
  selectedIndex = null,
}: LocationTimelineMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const pathLayerRef = useRef<L.LayerGroup | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const activeMarkerRef = useRef<L.Marker | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Use default coordinates (fallback to London/New York or middle of the world)
    const initialCenter: L.LatLngExpression = history.length > 0 ? [history[0].latitude, history[0].longitude] : [20, 0];
    const initialZoom = history.length > 0 ? 15 : 2;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView(initialCenter, initialZoom);

    // Dynamic tiles
    const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 20,
    }).addTo(map);
    tileLayerRef.current = tileLayer;

    // Zoom controls at bottom right
    L.control.zoom({
      position: 'bottomright',
    }).addTo(map);

    mapRef.current = map;
    markersGroupRef.current = L.layerGroup().addTo(map);

    // Ensure map tiles load correctly after CSS layout is applied
    const timer = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Tile Layer URL based on theme preference
  useEffect(() => {
    if (!tileLayerRef.current) return;
    const url = isDarkMode
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    tileLayerRef.current.setUrl(url);
  }, [isDarkMode]);

  // Update Path, Stops, and Center on History Load
  useEffect(() => {
    const map = mapRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    // Force map to recalculate its container bounds
    map.invalidateSize();

    // Clear previous elements
    markersGroup.clearLayers();
    if (pathLayerRef.current) {
      map.removeLayer(pathLayerRef.current);
      pathLayerRef.current = null;
    }
    if (activeMarkerRef.current) {
      map.removeLayer(activeMarkerRef.current);
      activeMarkerRef.current = null;
    }

    if (history.length === 0) return;

    // Draw Polyline path
    const coordinates = history.map((pt) => [pt.latitude, pt.longitude] as L.LatLngExpression);
    const polyline = L.polyline(coordinates, {
      color: '#06b6d4', // Cyan500
      weight: 4,
      opacity: 0.8,
      dashArray: '1, 6', // Dotted trajectory
    }).addTo(map);

    // A secondary glowing border line
    const glowLine = L.polyline(coordinates, {
      color: '#06b6d4',
      weight: 8,
      opacity: 0.2,
    }).addTo(map);

    pathLayerRef.current = L.layerGroup([polyline, glowLine]).addTo(map);

    // Add Start Marker (Green)
    const startPt = history[0];
    const startIcon = L.divIcon({
      className: 'custom-start-marker',
      html: `<div class="w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-[0_0_12px_rgba(16,185,129,0.8)] flex items-center justify-center"><div class="w-1.5 h-1.5 bg-white rounded-full"></div></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
    L.marker([startPt.latitude, startPt.longitude], { icon: startIcon })
      .bindPopup(`<div class="text-xs font-semibold text-slate-800">Start Time: ${new Date(startPt.timestamp).toLocaleTimeString()}</div>`)
      .addTo(markersGroup);

    // Add End Marker (Cyan Pulse) if we have multiple points
    if (history.length > 1) {
      const endPt = history[history.length - 1];
      const endIcon = L.divIcon({
        className: 'custom-end-marker',
        html: `
          <div class="relative flex items-center justify-center w-6 h-6">
            <span class="absolute inline-flex w-full h-full rounded-full bg-cyan-400 opacity-75 animate-ping"></span>
            <span class="relative inline-flex rounded-full h-4.5 w-4.5 bg-cyan-500 border-2 border-white shadow-[0_0_12px_rgba(6,182,212,0.8)]"></span>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
      L.marker([endPt.latitude, endPt.longitude], { icon: endIcon })
        .bindPopup(`<div class="text-xs font-semibold text-slate-800">Current/End Position: ${new Date(endPt.timestamp).toLocaleTimeString()}</div>`)
        .addTo(markersGroup);
    }

    // Add Stop markers (Orange)
    stops.forEach((stop, i) => {
      const stopIcon = L.divIcon({
        className: 'custom-stop-marker',
        html: `
          <div class="w-6 h-6 rounded-full bg-amber-500 border-2 border-white shadow-[0_0_12px_rgba(245,158,11,0.8)] flex items-center justify-center">
            <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const minutes = Math.round(stop.durationMs / 60000);
      L.marker([stop.latitude, stop.longitude], { icon: stopIcon })
        .bindPopup(`
          <div class="p-1 text-slate-800">
            <div class="font-bold text-sm text-amber-600">Stay Point #${i + 1}</div>
            <div class="text-xs mt-1">Duration: <b>${minutes} mins</b></div>
            <div class="text-[10px] text-slate-500">${new Date(stop.start).toLocaleTimeString()} - ${new Date(stop.end).toLocaleTimeString()}</div>
          </div>
        `)
        .addTo(markersGroup);
    });

    // Zoom/Fit bounds
    try {
      const bounds = L.latLngBounds(coordinates);
      map.fitBounds(bounds, { padding: [50, 50] });
    } catch (e) {
      console.warn('[Map] Fit bounds error:', e);
    }
  }, [history, stops]);

  // Handle Scrubbing Selection (Active node representation)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || selectedIndex === null || !history[selectedIndex]) {
      if (activeMarkerRef.current) {
        map.removeLayer(activeMarkerRef.current);
        activeMarkerRef.current = null;
      }
      return;
    }

    const pt = history[selectedIndex];

    // Create or move active marker
    if (!activeMarkerRef.current) {
      const activeIcon = L.divIcon({
        className: 'custom-active-marker',
        html: `
          <div class="relative flex items-center justify-center w-8 h-8">
            <span class="absolute inline-flex w-full h-full rounded-full bg-fuchsia-400 opacity-75 animate-ping"></span>
            <span class="relative inline-flex rounded-full h-5 w-5 bg-fuchsia-500 border-2 border-white shadow-[0_0_16px_rgba(217,70,239,0.9)]"></span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      activeMarkerRef.current = L.marker([pt.latitude, pt.longitude], { icon: activeIcon }).addTo(map);
    } else {
      activeMarkerRef.current.setLatLng([pt.latitude, pt.longitude]);
    }

    // Pan to active node smoothly
    map.panTo([pt.latitude, pt.longitude], { animate: true, duration: 0.3 } as any);
  }, [selectedIndex, history]);

  const recenterMap = () => {
    const map = mapRef.current;
    if (!map || history.length === 0) return;
    try {
      const coordinates = history.map((pt) => [pt.latitude, pt.longitude] as L.LatLngExpression);
      const bounds = L.latLngBounds(coordinates);
      map.fitBounds(bounds, { padding: [50, 50] });
    } catch (e) {
      console.warn('[Map] Fit bounds error:', e);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col flex-1 min-h-0 animate-fade-in">
      <div ref={mapContainerRef} className="flex-1 w-full h-full rounded-2xl overflow-hidden" />
      
      {/* Map Control Buttons Panel */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        {/* Style Switcher */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="bg-neutral-950/90 hover:bg-neutral-900 text-white text-[11px] font-bold px-3 py-2 rounded-xl border border-white/10 shadow-2xl flex items-center gap-1.5 backdrop-blur-md transition-all active:scale-95 cursor-pointer"
        >
          {isDarkMode ? (
            <>
              <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 20l-5.447-2.724A2 2 0 013 15.487V7.512a2 2 0 011.196-1.812L9 3m0 17l6.764-3.382a2 2 0 001.236-1.813V7.512a2 2 0 00-1.236-1.813L9 3m0 17V3" />
              </svg>
              Show Streets (High Contrast)
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5 text-fuchsia-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              Show Sleek Dark Mode
            </>
          )}
        </button>

        {/* Recenter Map */}
        {history.length > 0 && (
          <button
            onClick={recenterMap}
            className="bg-neutral-950/90 hover:bg-neutral-900 text-white text-[11px] font-bold px-3 py-2 rounded-xl border border-white/10 shadow-2xl flex items-center gap-1.5 backdrop-blur-md transition-all active:scale-95 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Recenter View
          </button>
        )}
      </div>

      {/* Background neon grid border */}
      <div className="absolute inset-0 pointer-events-none rounded-2xl border border-white/5 shadow-[inset_0_4px_30px_rgba(0,0,0,0.5)]" />
    </div>
  );
}
