import React, { useState, useEffect, useRef } from 'react';
import { Incident, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { RWANDA_FACILITIES } from '../data/rwandaData';
import { apiService, getSocket } from '../services/api';
import { emergencyAudio } from '../utils/audio';
import { GoogleMapsCommandView } from './GoogleMapsCommandView';
import { OpenStreetMapCommandView } from './OpenStreetMapCommandView';
import {
  ShieldAlert,
  CarFront,
  Flame,
  Ambulance,
  MapPin,
  Clock,
  PhoneCall,
  CheckCircle2,
  ChevronRight,
  Filter,
  Users,
  AlertOctagon,
  Radio,
  Send,
  Zap
} from 'lucide-react';

interface CommandDashboardProps {
  currentLang: Language;
  incidents: Incident[];
  onUpdateIncidentStatus: (id: string, newStatus: Incident['status']) => void;
  onAssignResponder: (incidentId: string, responderType: 'POLICE' | 'AMBULANCE' | 'FIRE') => void;
  onCallHotline: (number: string, serviceName: string) => void;
}

export const CommandDashboard: React.FC<CommandDashboardProps> = ({
  currentLang,
  incidents,
  onUpdateIncidentStatus,
  onAssignResponder,
  onCallHotline
}) => {
  const t = TRANSLATIONS[currentLang];
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(incidents[0]?.id || '');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [responders, setResponders] = useState<any[]>([]);
  const [liveBanner, setLiveBanner] = useState<string | null>(null);

  const hasGoogleMapsKey = Boolean(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
  const [mapEngine, setMapEngine] = useState<'GOOGLE_MAPS' | 'LEAFLET'>(
    hasGoogleMapsKey ? 'GOOGLE_MAPS' : 'LEAFLET'
  );

  const selectedIncident = incidents.find((inc) => inc.id === selectedIncidentId) || incidents[0];

  // Socket.IO real-time listener for command center
  useEffect(() => {
    const socket = getSocket();
    apiService.getResponders().then(setResponders);

    const handleNewInc = (newInc: Incident) => {
      emergencyAudio.playPoliceSiren(2.0);
      setLiveBanner(`🚨 NEW INCOMING EMERGENCY [${newInc.publicId}]: ${newInc.type} at ${newInc.location.addressText}`);
      setTimeout(() => setLiveBanner(null), 8000);
    };

    const handleResponderMoved = (resp: any) => {
      setResponders((prev) =>
        prev.map((r) => (r.id === resp.responderId ? { ...r, ...resp } : r))
      );
    };

    socket.on('incident:new', handleNewInc);
    socket.on('responder:moved', handleResponderMoved);

    return () => {
      socket.off('incident:new', handleNewInc);
      socket.off('responder:moved', handleResponderMoved);
    };
  }, []);

  const handleSelectIncident = (inc: Incident) => {
    setSelectedIncidentId(inc.id);
  };

  const filteredIncidents = incidents.filter((inc) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'CRITICAL') return inc.priority === 'CRITICAL';
    if (filterType === 'TRAFFIC') return inc.type.startsWith('TRAFFIC') || inc.type === 'PEDESTRIAN';
    if (filterType === 'FIRE') return inc.type === 'FIRE_EXPLOSION';
    return true;
  });

  // Calculate statistics
  const activeCount = incidents.filter((i) => i.status !== 'RESOLVED').length;
  const criticalCount = incidents.filter((i) => i.priority === 'CRITICAL' && i.status !== 'RESOLVED').length;
  const respondingCount = incidents.filter((i) => i.status === 'RESPONDER_EN_ROUTE' || i.status === 'DISPATCHED').length;

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 space-y-4">
      {/* Top Operations Telemetry Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#0c1f40] border border-cyan-500/30 rounded-2xl p-4 shadow-lg flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 font-bold text-xl">
            🚨
          </div>
          <div>
            <div className="text-2xl font-black text-white">{activeCount}</div>
            <div className="text-xs font-semibold text-slate-300">{t.activeIncidents}</div>
          </div>
        </div>

        <div className="bg-[#0c1f40] border border-cyan-500/30 rounded-2xl p-4 shadow-lg flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-xl">
            ⚠️
          </div>
          <div>
            <div className="text-2xl font-black text-amber-300">{criticalCount}</div>
            <div className="text-xs font-semibold text-slate-300">{t.criticalIncidents}</div>
          </div>
        </div>

        <div className="bg-[#0c1f40] border border-cyan-500/30 rounded-2xl p-4 shadow-lg flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold text-xl">
            🚔
          </div>
          <div>
            <div className="text-2xl font-black text-cyan-300">{respondingCount}</div>
            <div className="text-xs font-semibold text-slate-300">{t.respondingUnits}</div>
          </div>
        </div>

        <div className="bg-[#0c1f40] border border-cyan-500/30 rounded-2xl p-4 shadow-lg flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-xl">
            ✅
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-300">42</div>
            <div className="text-xs font-semibold text-slate-300">{t.resolvedToday}</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Incident Queue & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Live Rwanda Map (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-2xl flex flex-col space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Rwanda Live Situational Map
              </h2>
              {hasGoogleMapsKey && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Google Maps Platform Active</span>
                </span>
              )}
            </div>

            {/* Map Engine Selector */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
              <button
                onClick={() => setMapEngine('GOOGLE_MAPS')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  mapEngine === 'GOOGLE_MAPS'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🗺️ Google Maps
              </button>
              <button
                onClick={() => setMapEngine('LEAFLET')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  mapEngine === 'LEAFLET'
                    ? 'bg-slate-700 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                OpenStreetMap
              </button>
            </div>
          </div>

          {/* Map Display Container */}
          <div className="relative w-full h-[460px] rounded-2xl overflow-hidden border border-slate-700 shadow-inner bg-slate-950">
            {mapEngine === 'GOOGLE_MAPS' && hasGoogleMapsKey ? (
              <GoogleMapsCommandView
                incidents={incidents}
                selectedIncident={selectedIncident}
                onSelectIncident={(inc) => setSelectedIncidentId(inc.id)}
                responders={responders}
                onQuickDispatch={(incId, responderName) =>
                  onAssignResponder(incId, 'POLICE')
                }
              />
            ) : (
              <OpenStreetMapCommandView
                incidents={incidents}
                selectedIncident={selectedIncident}
                onSelectIncident={(inc) => setSelectedIncidentId(inc.id)}
                responders={responders}
                onQuickDispatch={(incId, responderName) =>
                  onAssignResponder(incId, 'POLICE')
                }
              />
            )}
          </div>
        </div>

        {/* Right Column: Incident Queue & Dispatch Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {['ALL', 'CRITICAL', 'TRAFFIC', 'FIRE'].map((f) => (
              <button
                key={f}
                onClick={() => setFilterType(f)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  filterType === f
                    ? 'bg-amber-400 text-slate-950 shadow'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Selected Incident Action Card */}
          {selectedIncident && (
            <div className="bg-[#0b1c3d] border-2 border-cyan-500/40 rounded-3xl p-5 shadow-2xl space-y-4 text-white">
              <div className="flex items-start justify-between gap-2 border-b border-slate-700/80 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-black text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-700">
                      {selectedIncident.publicId}
                    </span>
                    <span
                      className={`text-xs font-black px-2 py-0.5 rounded ${
                        selectedIncident.priority === 'CRITICAL'
                          ? 'bg-red-600 text-white animate-pulse'
                          : 'bg-amber-500 text-slate-950'
                      }`}
                    >
                      {selectedIncident.priority}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-white mt-1">
                    {selectedIncident.type.replace('_', ' ')}
                  </h3>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Status
                  </span>
                  <div className="text-xs font-bold text-emerald-400">
                    {selectedIncident.status.replace(/_/g, ' ')}
                  </div>
                </div>
              </div>

              {/* Location & Facts */}
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2 text-slate-200">
                  <MapPin className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">{selectedIncident.location.addressText}</span>
                    <div className="text-slate-400 text-[11px]">
                      District: {selectedIncident.location.district} • Sector: {selectedIncident.location.sector}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                  <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-700">
                    <span className="text-slate-400 block text-[10px]">CASUALTIES</span>
                    <span className="font-bold text-amber-300">
                      {selectedIncident.peopleAffected} injured ({selectedIncident.unconsciousCount} unconscious)
                    </span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-700">
                    <span className="text-slate-400 block text-[10px]">HAZARDS</span>
                    <span className="font-bold text-slate-200">
                      {selectedIncident.firePresent ? '🔥 Fire active' : 'No fire'} • {selectedIncident.roadBlocked ? '🚧 Blocked' : 'Open'}
                    </span>
                  </div>
                </div>

                {/* Reporter Contact */}
                <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">Reporter</span>
                    <div className="font-bold text-white text-xs">
                      {selectedIncident.reporterName || 'Citizen Reporter'} ({selectedIncident.reporterPhone})
                    </div>
                  </div>
                  <button
                    onClick={() => onCallHotline(selectedIncident.reporterPhone, 'Citizen Reporter')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </button>
                </div>
              </div>

              {/* Dispatch Action Panel */}
              <div className="pt-2 border-t border-slate-700 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5" />
                  <span>RNP Rapid Dispatch Operations</span>
                </span>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      emergencyAudio.playPoliceSiren(1.5);
                      onAssignResponder(selectedIncident.id, 'POLICE');
                    }}
                    className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-bold border border-cyan-400/50 shadow transition-transform active:scale-95"
                  >
                    <span className="text-lg">🚔</span>
                    <span className="text-[10px] mt-1 text-center">RNP Patrol</span>
                  </button>

                  <button
                    onClick={() => {
                      emergencyAudio.playDispatchBeep();
                      onAssignResponder(selectedIncident.id, 'AMBULANCE');
                    }}
                    className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold border border-emerald-400/50 shadow transition-transform active:scale-95"
                  >
                    <span className="text-lg">🚑</span>
                    <span className="text-[10px] mt-1 text-center">SAMU Medic</span>
                  </button>

                  <button
                    onClick={() => {
                      emergencyAudio.playPoliceSiren(1.5);
                      onAssignResponder(selectedIncident.id, 'FIRE');
                    }}
                    className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-orange-700 hover:bg-orange-600 text-white text-xs font-bold border border-orange-400/50 shadow transition-transform active:scale-95"
                  >
                    <span className="text-lg">🚒</span>
                    <span className="text-[10px] mt-1 text-center">Fire Brigade</span>
                  </button>
                </div>

                {/* Status Advancement */}
                <div className="flex items-center gap-2 pt-2">
                  {selectedIncident.status !== 'RESOLVED' ? (
                    <button
                      onClick={() => onUpdateIncidentStatus(selectedIncident.id, 'RESOLVED')}
                      className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark Incident Resolved & Archive</span>
                    </button>
                  ) : (
                    <div className="w-full py-2 text-center text-xs font-bold text-emerald-400 bg-emerald-950/60 rounded-xl border border-emerald-800">
                      Incident Successfully Resolved & Audited
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Incident Feed List */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Incident Feed ({filteredIncidents.length})
            </h4>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {filteredIncidents.map((inc) => (
                <div
                  key={inc.id}
                  onClick={() => handleSelectIncident(inc)}
                  className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                    selectedIncidentId === inc.id
                      ? 'bg-[#0f2552] border-cyan-400 shadow-md text-white'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-cyan-300">{inc.publicId}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        inc.priority === 'CRITICAL'
                          ? 'bg-red-600 text-white'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {inc.priority}
                    </span>
                  </div>
                  <div className="font-bold text-white mt-1 line-clamp-1">
                    {inc.location.addressText}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 flex items-center justify-between">
                    <span>{inc.type.replace('_', ' ')}</span>
                    <span className="text-emerald-400">{inc.status.replace(/_/g, ' ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
