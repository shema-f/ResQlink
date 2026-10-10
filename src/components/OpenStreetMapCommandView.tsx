import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Incident } from '../types';
import { RWANDA_FACILITIES } from '../data/rwandaData';
import { Layers } from 'lucide-react';

interface OpenStreetMapCommandViewProps {
  incidents: Incident[];
  selectedIncident: Incident | null;
  onSelectIncident: (inc: Incident) => void;
  responders: any[];
  onQuickDispatch: (incidentId: string, responderName: string) => void;
}

export const OpenStreetMapCommandView: React.FC<OpenStreetMapCommandViewProps> = ({
  incidents,
  selectedIncident,
  onSelectIncident,
  responders,
  onQuickDispatch
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const incidentsLayerRef = useRef<L.LayerGroup | null>(null);
  const respondersLayerRef = useRef<L.LayerGroup | null>(null);
  const facilitiesLayerRef = useRef<L.LayerGroup | null>(null);

  const [tileStyle, setTileStyle] = useState<'STANDARD' | 'VOYAGER'>('STANDARD');

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!containerRef.current) return;

    // Safety check: if an instance already exists, remove it cleanly
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map(containerRef.current, {
      center: [-1.9536, 30.0984], // Kigali center
      zoom: 13,
      zoomControl: true,
      attributionControl: true
    });

    // Set initial tile layer
    const tileUrl =
      tileStyle === 'STANDARD'
        ? 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    const tileLayer = L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Initialize layer groups for clean updates
    facilitiesLayerRef.current = L.layerGroup().addTo(map);
    respondersLayerRef.current = L.layerGroup().addTo(map);
    incidentsLayerRef.current = L.layerGroup().addTo(map);

    mapRef.current = map;

    // Force map size invalidation to avoid gray tile glitch
    const timer = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [tileStyle]);

  // 2. Plot Facilities (permanent hospitals, police stations, fire stations)
  useEffect(() => {
    if (!mapRef.current || !facilitiesLayerRef.current) return;

    const layer = facilitiesLayerRef.current;
    layer.clearLayers();

    RWANDA_FACILITIES.forEach((fac) => {
      const isHospital = fac.type === 'HOSPITAL';
      const isPolice = fac.type === 'POLICE_STATION';
      const bgColor = isHospital ? '#10b981' : isPolice ? '#0284c7' : '#ea580c';
      const iconEmoji = isHospital ? '🏥' : isPolice ? '🚔' : '🚒';

      const customIcon = L.divIcon({
        className: 'osm-facility-marker',
        html: `
          <div style="background-color: ${bgColor}; color: white; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; border: 2px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.4); cursor: pointer;">
            ${iconEmoji}
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });

      L.marker([fac.latitude, fac.longitude], { icon: customIcon })
        .bindTooltip(
          `<div style="font-family: inherit; font-size: 11px;">
            <b>${fac.name}</b><br/>
            <span style="color:#64748b;">${fac.type} • ${fac.sector}, ${fac.district}</span><br/>
            <span style="color:#0284c7;">📞 ${fac.phone}</span>
          </div>`,
          { direction: 'top', offset: [0, -10] }
        )
        .addTo(layer);
    });
  }, []);

  // 3. Plot Responders (patrol cars, ambulances)
  useEffect(() => {
    if (!mapRef.current || !respondersLayerRef.current) return;

    const layer = respondersLayerRef.current;
    layer.clearLayers();

    responders.forEach((resp) => {
      const lat = resp.location?.latitude || resp.current_location?.latitude;
      const lng = resp.location?.longitude || resp.current_location?.longitude;
      if (!lat || !lng) return;

      const isBusy = resp.status === 'ON_SCENE' || resp.current_status === 'ON_SCENE';
      const unitName = resp.unitName || resp.unit_name || 'RNP Unit';
      const plate = resp.vehiclePlate || resp.vehicle_plate || 'GR 421-B';

      const responderIcon = L.divIcon({
        className: 'osm-responder-marker',
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            <span style="background: ${isBusy ? '#b45309' : '#0891b2'}; color: white; font-size: 9px; font-weight: 800; padding: 1px 4px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.7); box-shadow: 0 2px 4px rgba(0,0,0,0.4); white-space: nowrap;">
              ${plate}
            </span>
            <div style="width: 24px; height: 24px; border-radius: 50%; background: #0f172a; border: 2px solid #38bdf8; display: flex; align-items: center; justify-content: center; font-size: 11px; margin-top: 2px; box-shadow: 0 2px 6px rgba(0,0,0,0.5);">
              🚔
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 36]
      });

      L.marker([lat, lng], { icon: responderIcon })
        .bindTooltip(
          `<div style="font-family: inherit; font-size: 11px;">
            <b>${unitName} (${plate})</b><br/>
            <span style="color:${isBusy ? '#d97706' : '#06b6d4'}; font-weight: bold;">Status: ${resp.status || resp.current_status || 'AVAILABLE'}</span>
          </div>`,
          { direction: 'top' }
        )
        .addTo(layer);
    });
  }, [responders]);

  // 4. Plot Incidents
  useEffect(() => {
    if (!mapRef.current || !incidentsLayerRef.current) return;

    const layer = incidentsLayerRef.current;
    layer.clearLayers();

    incidents.forEach((inc) => {
      const isSelected = selectedIncident?.id === inc.id;
      const isCrit = inc.priority === 'CRITICAL';
      const isResolved = inc.status === 'RESOLVED';

      const markerColor = isResolved ? '#64748b' : isCrit ? '#dc2626' : inc.priority === 'HIGH' ? '#ea580c' : '#0284c7';
      const iconEmoji = inc.firePresent ? '🔥' : inc.type.includes('MOTO') ? '🏍️' : inc.type.includes('TRUCK') ? '🚛' : isCrit ? '🚨' : '🚗';

      const customIcon = L.divIcon({
        className: 'osm-incident-marker',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            ${isCrit && !isResolved ? '<div style="position: absolute; top: 0; width: 34px; height: 34px; border-radius: 50%; background-color: rgba(239, 68, 68, 0.5); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>' : ''}
            <div style="position: relative; width: 32px; height: 32px; border-radius: 50%; background-color: ${markerColor}; color: white; display: flex; align-items: center; justify-content: center; font-size: 14px; border: 2.5px solid ${isSelected ? '#38bdf8' : '#ffffff'}; box-shadow: 0 4px 10px rgba(0,0,0,0.5); transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'}; transition: transform 0.2s;">
              ${iconEmoji}
            </div>
            <span style="margin-top: 2px; background: rgba(15, 23, 42, 0.95); color: #f8fafc; font-size: 9px; font-family: monospace; font-weight: bold; padding: 1px 4px; border-radius: 4px; border: 1px solid #475569; white-space: nowrap;">
              ${inc.publicId}
            </span>
          </div>
        `,
        iconSize: [44, 48],
        iconAnchor: [22, 32]
      });

      const marker = L.marker([inc.location.latitude, inc.location.longitude], {
        icon: customIcon,
        zIndexOffset: isSelected ? 1000 : isCrit ? 500 : 100
      }).addTo(layer);

      marker.on('click', () => {
        onSelectIncident(inc);
      });

      // Interactive popup
      const popupHtml = document.createElement('div');
      popupHtml.className = 'osm-incident-popup p-1 text-slate-900';
      popupHtml.innerHTML = `
        <div style="font-family: inherit; min-width: 200px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-family: monospace; font-weight: 800; font-size: 11px; color: #0284c7;">${inc.publicId}</span>
            <span style="background: ${isCrit ? '#dc2626' : '#ea580c'}; color: white; font-size: 9px; font-weight: bold; padding: 1px 5px; border-radius: 4px;">${inc.priority}</span>
          </div>
          <div style="font-weight: bold; font-size: 13px; color: #0f172a; margin-bottom: 2px;">${inc.type}</div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 6px;">📍 ${inc.location.addressText} (${inc.location.sector}, ${inc.location.district})</div>
          <div style="font-size: 10px; color: #334155; background: #f1f5f9; padding: 4px 6px; border-radius: 6px; margin-bottom: 8px;">
            👥 Affected: <b>${inc.peopleAffected}</b> | Unconscious: <b>${inc.unconsciousCount}</b>
          </div>
          ${inc.status !== 'RESOLVED' ? `
            <button id="dispatch-btn-${inc.id}" style="width: 100%; background: #dc2626; color: white; font-weight: bold; font-size: 11px; padding: 6px 10px; border-radius: 6px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;">
              🚨 Dispatch RNP Patrol Unit
            </button>
          ` : '<span style="color:#10b981; font-weight:bold; font-size:11px;">✓ RESOLVED</span>'}
        </div>
      `;

      marker.bindPopup(popupHtml);

      // Handle dispatch button click inside Leaflet popup
      marker.on('popupopen', () => {
        const btn = document.getElementById(`dispatch-btn-${inc.id}`);
        if (btn) {
          btn.onclick = () => {
            onQuickDispatch(inc.id, 'RNP Traffic Unit Alpha-4');
            marker.closePopup();
          };
        }
      });
    });
  }, [incidents, selectedIncident, onSelectIncident, onQuickDispatch]);

  // 5. Smoothly pan to selected incident when it changes
  useEffect(() => {
    if (!mapRef.current || !selectedIncident) return;

    mapRef.current.setView(
      [selectedIncident.location.latitude, selectedIncident.location.longitude],
      14,
      { animate: true }
    );
  }, [selectedIncident]);

  return (
    <div className="relative w-full h-full">
      {/* Actual DOM element for Leaflet */}
      <div ref={containerRef} className="w-full h-full bg-slate-950 z-0" />

      {/* Tile Style Selector (OpenStreetMap Standard vs Voyager) */}
      <div className="absolute top-3 right-3 z-[400] bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-xl p-1 flex items-center gap-1 shadow-lg text-[10px]">
        <Layers className="w-3.5 h-3.5 text-cyan-400 ml-1.5 mr-0.5" />
        <button
          onClick={() => setTileStyle('STANDARD')}
          className={`px-2 py-0.5 rounded-lg font-bold transition-all ${
            tileStyle === 'STANDARD'
              ? 'bg-cyan-600 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          OSM Standard
        </button>
        <button
          onClick={() => setTileStyle('VOYAGER')}
          className={`px-2 py-0.5 rounded-lg font-bold transition-all ${
            tileStyle === 'VOYAGER'
              ? 'bg-cyan-600 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          OSM Voyager
        </button>
      </div>

      {/* Legend Overlay */}
      <div className="absolute bottom-3 left-3 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl p-2.5 text-[10px] text-slate-300 space-y-1 shadow-xl z-[400]">
        <div className="font-bold text-white mb-1 flex items-center justify-between gap-4">
          <span>OpenStreetMap Legend:</span>
          <span className="text-[9px] font-mono text-cyan-400">EPSG:3857/4326</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
          <span>Critical Emergency / Trauma</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
          <span>Moderate Accident / Fire</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-600" />
          <span>Active RNP Patrol Cars</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Kigali Hospitals & Stations</span>
        </div>
      </div>
    </div>
  );
};
