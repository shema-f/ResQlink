import React, { useState } from 'react';
import { Incident, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { emergencyAudio } from '../utils/audio';
import {
  Navigation,
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Shield,
  Ambulance,
  Compass,
  ArrowRight
} from 'lucide-react';

interface ResponderViewProps {
  currentLang: Language;
  activeIncidents: Incident[];
  onUpdateIncidentStatus: (id: string, newStatus: Incident['status']) => void;
  onCallHotline: (number: string, serviceName: string) => void;
}

export const ResponderView: React.FC<ResponderViewProps> = ({
  currentLang,
  activeIncidents,
  onUpdateIncidentStatus,
  onCallHotline
}) => {
  const t = TRANSLATIONS[currentLang];
  const [responderStatus, setResponderStatus] = useState<'AVAILABLE' | 'EN_ROUTE' | 'ON_SCENE' | 'BUSY'>('AVAILABLE');
  const [acceptedIncidentId, setAcceptedIncidentId] = useState<string | null>(
    activeIncidents.find((i) => i.status === 'DISPATCHED' || i.status === 'RESPONDER_EN_ROUTE')?.id || null
  );

  const activeIncident = activeIncidents.find((i) => i.id === acceptedIncidentId) || activeIncidents[0];

  const handleAcceptIncident = (incId: string) => {
    emergencyAudio.playPoliceSiren(1.2);
    setAcceptedIncidentId(incId);
    setResponderStatus('EN_ROUTE');
    onUpdateIncidentStatus(incId, 'RESPONDER_EN_ROUTE');
  };

  const handleArrivedOnScene = () => {
    if (!activeIncident) return;
    setResponderStatus('ON_SCENE');
    onUpdateIncidentStatus(activeIncident.id, 'ON_SCENE');
  };

  const handleResolveIncident = () => {
    if (!activeIncident) return;
    setResponderStatus('AVAILABLE');
    onUpdateIncidentStatus(activeIncident.id, 'RESOLVED');
    setAcceptedIncidentId(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* Responder Identity Card */}
      <div className="bg-[#0b1d3d] border-2 border-cyan-500/40 rounded-3xl p-5 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-cyan-600/30 border-2 border-cyan-400 flex items-center justify-center text-3xl shadow-lg">
            🚔
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-cyan-300">
                Rwanda National Police Mobile Unit
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h2 className="text-xl font-black text-white">
              RNP Traffic Patrol Alpha-4 (Kigali Metro)
            </h2>
            <p className="text-xs text-slate-300">
              Assigned Officers: Cpl. Ndayisaba & Off. Uwase • Vehicle Reg: GR 421-B
            </p>
          </div>
        </div>

        {/* Current Readiness Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-bold uppercase">Status:</span>
          <span
            className={`px-3 py-1.5 rounded-xl font-black text-xs border ${
              responderStatus === 'EN_ROUTE'
                ? 'bg-amber-500 text-slate-950 border-amber-300 animate-pulse'
                : responderStatus === 'ON_SCENE'
                ? 'bg-red-600 text-white border-red-400'
                : 'bg-emerald-600 text-white border-emerald-400'
            }`}
          >
            {responderStatus.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Active Mission Cockpit */}
      {activeIncident ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 text-white">
          <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                  {activeIncident.publicId}
                </span>
                <span className="text-xs font-black px-2 py-0.5 rounded bg-red-600 text-white animate-pulse">
                  {activeIncident.priority} DISPATCH
                </span>
              </div>
              <h3 className="text-xl font-black text-white mt-1">
                {activeIncident.type.replace('_', ' ')}
              </h3>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-amber-300 block">Distance to Scene</span>
              <span className="text-xl font-black text-white">1.8 km</span>
              <span className="text-[11px] text-slate-400 block">~4 min response ETA</span>
            </div>
          </div>

          {/* Location & Navigation target */}
          <div className="bg-[#071328] border border-cyan-900/60 rounded-2xl p-4 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-cyan-400" />
              <span>Target Coordinates & Routing</span>
            </div>
            <div className="text-sm font-bold text-white">
              {activeIncident.location.addressText}
            </div>
            <div className="text-xs text-slate-300 font-mono">
              GPS: {activeIncident.location.latitude}, {activeIncident.location.longitude} ({activeIncident.location.district} - {activeIncident.location.sector})
            </div>
          </div>

          {/* Critical Triage Intel */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                Estimated Injured
              </span>
              <span className="text-lg font-black text-amber-300">
                {activeIncident.peopleAffected} Casualty(ies)
              </span>
            </div>

            <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                Unconscious / Trapped
              </span>
              <span className="text-lg font-black text-red-400">
                {activeIncident.unconsciousCount > 0 ? '⚠️ YES - 1 unconscious' : 'None reported'}
              </span>
            </div>

            <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                Obstruction / Fire
              </span>
              <span className="text-lg font-black text-slate-200">
                {activeIncident.roadBlocked ? 'Road Blocked' : 'Clear'} • {activeIncident.firePresent ? '🔥 Fire' : 'No Fire'}
              </span>
            </div>
          </div>

          {/* Reporter & Contact Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-800/90 p-4 rounded-2xl border border-slate-700">
            <div>
              <span className="text-xs text-slate-400 font-semibold">Caller Contact:</span>
              <div className="text-sm font-black text-white">
                {activeIncident.reporterPhone}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onCallHotline(activeIncident.reporterPhone, 'Caller')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call Victim / Caller</span>
              </button>
            </div>
          </div>

          {/* Action Step Bar */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Responder Mission Control
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => handleAcceptIncident(activeIncident.id)}
                className="py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4 text-slate-950" />
                <span>En Route to Scene</span>
              </button>

              <button
                onClick={handleArrivedOnScene}
                className="py-3 px-4 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs shadow flex items-center justify-center gap-2"
              >
                <Compass className="w-4 h-4" />
                <span>Arrived On Scene</span>
              </button>

              <button
                onClick={handleResolveIncident}
                className="py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Casualties Handled / Resolved</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-3">
          <div className="text-4xl">🟢</div>
          <h3 className="text-base font-bold text-white">Unit Standing By • Sector Clear</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You will receive an instant audio ping and GPS navigation prompt when RNP Central Dispatch assigns an incident.
          </p>
        </div>
      )}
    </div>
  );
};
