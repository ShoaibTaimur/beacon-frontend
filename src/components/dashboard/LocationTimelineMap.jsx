import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function LocationTimelineMap({
  history = [],
  stops = [],
  selectedIndex = null,
  onSelectIndex = () => {},
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const pathLayerRef = useRef(null);
  const markersGroupRef = useRef(null);
  const activeMarkerRef = useRef(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Use default coordinates (fallback to London/New York or middle of the world)
    const initialCenter = history.length > 0 ? [history[0].latitude, history[0].longitude] : [20, 0];
    const initialZoom = history.length > 0 ? 15 : 2;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView(initialCenter, initialZoom);

    // Dark tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 20,
    }).addTo(map);

    // Zoom controls at bottom right
    L.control.zoom({
      position: 'bottomright',
    }).addTo(map);

    mapRef.current = map;
    markersGroupRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Path, Stops, and Center on History Load
  useEffect(() => {
    const map = mapRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

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
    const coordinates = history.map((pt) => [pt.latitude, pt.longitude]);
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
    map.panTo([pt.latitude, pt.longitude], { animate: true, duration: 0.3 });
  }, [selectedIndex, history]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="h-full w-full rounded-2xl overflow-hidden" />
      {/* Background neon grid border */}
      <div className="absolute inset-0 pointer-events-none rounded-2xl border border-white/5 shadow-[inset_0_4px_30px_rgba(0,0,0,0.5)]" />
    </div>
  );
}
