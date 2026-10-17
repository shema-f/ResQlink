import React, { useState, useEffect } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap
} from '@vis.gl/react-google-maps';
import { Incident } from '../types';
import { RWANDA_FACILITIES } from '../data/rwandaData';
import { Shield, Flame, AlertTriangle, Phone, Radio, MapPin } from 'lucide-react';

interface GoogleMapsCommandViewProps {
  incidents: Incident[];
  selectedIncident: Incident | null;
  onSelectIncident: (inc: Incident) => void;
  responders: any[];
  onQuickDispatch: (incidentId: string, responderName: string) => void;
}

// Sub-component to control map viewport smoothly when selectedIncident changes
const MapController: React.FC<{ selectedIncident: Incident | null }> = ({ selectedIncident }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !selectedIncident) return;
    map.panTo({
      lat: selectedIncident.location.latitude,
      lng: selectedIncident.location.longitude
    });
    map.setZoom(15);
  }, [map, selectedIncident]);

  return null;
};

export const GoogleMapsCommandView: React.FC<GoogleMapsCommandViewProps> = ({
  incidents,
  selectedIncident,
  onSelectIncident,
  responders,
  onQuickDispatch
}) => {
  const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';
  const [activeInfoWindowId, setActiveInfoWindowId] = useState<string | null>(null);

  // If no API key is configured, render warning
  if (!apiKey) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 p-6 text-center text-slate-400">
        <MapPin className="w-10 h-10 text-amber-400 mb-2 animate-bounce" />
        <p className="text-sm font-bold text-ink-hd">Google Maps API Key Missing</p>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Please provide <code className="text-amber-400">VITE_GOOGLE_MAPS_API_KEY</code> to enable high-resolution satellite, vector, and Street View maps.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <APIProvider apiKey={apiKey} libraries={['marker', 'geometry']}>
        <Map
          mapId="resqlink_rnp_command_map"
          defaultCenter={{ lat: -1.9536, lng: 30.0984 }}
          defaultZoom={13}
          gestureHandling="greedy"
          disableDefaultUI={false}
          mapTypeControl={true}
          streetViewControl={true}
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          className="w-full h-full"
        >
          <MapController selectedIncident={selectedIncident} />

          {/* 1. Permanent Rwanda Emergency Facilities (Hospitals, Police, Fire) */}
          {RWANDA_FACILITIES.map((fac) => {
            const isHospital = fac.type === 'HOSPITAL';
            const isPolice = fac.type === 'POLICE_STATION';
            const bgClass = isHospital
              ? 'bg-emerald-600 border-emerald-300'
              : isPolice
              ? 'bg-blue-600 border-blue-300'
              : 'bg-orange-600 border-orange-300';

            return (
              <AdvancedMarker
                key={fac.id}
                position={{ lat: fac.latitude, lng: fac.longitude }}
                title={`${fac.name} (${fac.type})`}
              >
                <div
                  className={`w-7 h-7 rounded-full ${bgClass} border-2 text-ink-hd flex items-center justify-center text-xs shadow-lg transform hover:scale-125 transition-transform cursor-pointer`}
                >
                  {isHospital ? '🏥' : isPolice ? '🚔' : '🚒'}
                </div>
              </AdvancedMarker>
            );
          })}

          {/* 2. Active Responders (RNP Patrol Cars, SAMU Ambulances) */}
          {responders.map((resp) => {
            if (!resp.location && !resp.current_location) return null;
            const lat = resp.location?.latitude || resp.current_location?.latitude || -1.95;
            const lng = resp.location?.longitude || resp.current_location?.longitude || 30.09;
            const isBusy = resp.status === 'ON_SCENE' || resp.current_status === 'ON_SCENE';

            return (
              <AdvancedMarker
                key={resp.id || resp.unit_name}
                position={{ lat, lng }}
                title={`${resp.unit_name || resp.unitName} (${resp.status || resp.current_status})`}
              >
                <div className="flex flex-col items-center cursor-pointer group">
                  <div
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-ink-hd shadow-md border ${
                      isBusy ? 'bg-amber-600 border-amber-400' : 'bg-cyan-600 border-cyan-400'
                    }`}
                  >
                    {resp.vehiclePlate || resp.vehicle_plate || 'RNP'}
                  </div>
                  <div className="w-6 h-6 rounded-full bg-slate-900 border-2 border-cyan-400 flex items-center justify-center text-[11px] shadow-lg animate-pulse">
                    🚔
                  </div>
                </div>
              </AdvancedMarker>
            );
          })}

          {/* 3. Incidents */}
          {incidents.map((inc) => {
            const isSelected = selectedIncident?.id === inc.id;
            const isCrit = inc.priority === 'CRITICAL';
            const isResolved = inc.status === 'RESOLVED';

            return (
              <AdvancedMarker
                key={inc.id}
                position={{ lat: inc.location.latitude, lng: inc.location.longitude }}
                onClick={() => {
                  onSelectIncident(inc);
                  setActiveInfoWindowId(inc.id);
                }}
              >
                <div className="relative cursor-pointer flex flex-col items-center">
                  {/* Pulse wave for critical unresolved emergencies */}
                  {isCrit && !isResolved && (
                    <span className="absolute -top-1 -left-1 w-9 h-9 rounded-full bg-red-500 opacity-60 animate-ping" />
                  )}

                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-ink-hd shadow-xl border-2 transition-all ${
                      isSelected
                        ? 'ring-4 ring-amber-400 scale-125 z-50'
                        : 'scale-100 hover:scale-110'
                    } ${
                      isResolved
                        ? 'bg-slate-600 border-slate-400'
                        : isCrit
                        ? 'bg-red-600 border-red-300'
                        : inc.priority === 'HIGH'
                        ? 'bg-amber-600 border-amber-300'
                        : 'bg-blue-600 border-blue-300'
                    }`}
                  >
                    {inc.firePresent ? '🔥' : isCrit ? '🚨' : '⚠️'}
                  </div>

                  <span className="mt-1 px-1.5 py-0.5 rounded bg-slate-950/90 text-[9px] font-mono font-bold text-ink-hd border border-slate-700 shadow whitespace-nowrap">
                    {inc.publicId}
                  </span>
                </div>
              </AdvancedMarker>
            );
          })}

          {/* 4. InfoWindow for currently active / selected incident */}
          {activeInfoWindowId && selectedIncident && selectedIncident.id === activeInfoWindowId && (
            <InfoWindow
              position={{
                lat: selectedIncident.location.latitude,
                lng: selectedIncident.location.longitude
              }}
              onCloseClick={() => setActiveInfoWindowId(null)}
              headerContent={
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-red-600 text-[10px] font-black text-accent-ink">
                    {selectedIncident.priority}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-800">
                    {selectedIncident.publicId}
                  </span>
                </div>
              }
            >
              <div className="map-popup-paper p-1 max-w-xs text-slate-800 space-y-2">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{selectedIncident.type}</h4>
                  <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{selectedIncident.location.addressText}</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-100 p-2 rounded-lg">
                  <div>
                    <span className="text-slate-500 block">Sector / District</span>
                    <span className="font-semibold text-slate-800">
                      {selectedIncident.location.sector}, {selectedIncident.location.district}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Casualties</span>
                    <span className="font-semibold text-slate-800">
                      {selectedIncident.peopleAffected} affected ({selectedIncident.unconsciousCount} unconscious)
                    </span>
                  </div>
                </div>

                {selectedIncident.status !== 'RESOLVED' && (
                  <div className="pt-1 flex items-center gap-2">
                    <button
                      onClick={() => {
                        onQuickDispatch(selectedIncident.id, 'RNP Traffic Unit Alpha-4');
                        setActiveInfoWindowId(null);
                      }}
                      className="w-full py-1.5 px-3 bg-red-600 hover:bg-red-700 text-accent-ink rounded-lg text-xs font-bold shadow flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Radio className="w-3 h-3" />
                      <span>Dispatch Patrol Unit</span>
                    </button>
                  </div>
                )}
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>
    </div>
  );
};
