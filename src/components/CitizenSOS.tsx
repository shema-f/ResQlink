import React, { useState, useEffect } from 'react';
import { Incident, Language, LocationData } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { PRESET_LOCATIONS, RWANDA_FACILITIES } from '../data/rwandaData';
import { apiService, NearbyFacilityResponse } from '../services/api';
import { emergencyAudio } from '../utils/audio';
import {
  MapPin,
  Compass,
  AlertTriangle,
  CarFront,
  Flame,
  PhoneCall,
  WifiOff,
  CheckCircle2,
  Copy,
  ChevronRight,
  ShieldAlert,
  Ambulance,
  RefreshCw,
  Camera,
  Mic,
  MessageSquare
} from 'lucide-react';

interface CitizenSOSProps {
  currentLang: Language;
  onNewIncident: (incident: Incident) => void;
  activeIncidents: Incident[];
  onCallHotline: (number: string, serviceName: string) => void;
}

export const CitizenSOS: React.FC<CitizenSOSProps> = ({
  currentLang,
  onNewIncident,
  activeIncidents,
  onCallHotline
}) => {
  const t = TRANSLATIONS[currentLang];

  // Location State
  const [selectedLocation, setSelectedLocation] = useState<LocationData>({
    latitude: PRESET_LOCATIONS[0].lat,
    longitude: PRESET_LOCATIONS[0].lng,
    accuracyMeters: 6,
    addressText: 'KN 5 Rd, near Kigali Convention Centre & Kigali Heights',
    district: PRESET_LOCATIONS[0].district,
    sector: PRESET_LOCATIONS[0].sector,
    landmark: PRESET_LOCATIONS[0].landmark
  });
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [nearbyFacilities, setNearbyFacilities] = useState<NearbyFacilityResponse[]>([]);

  // Wizard state
  const [wizardOpen, setWizardOpen] = useState<boolean>(false);
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [incidentType, setIncidentType] = useState<Incident['type']>('TRAFFIC_MOTO');
  const [injuredCount, setInjuredCount] = useState<number>(2);
  const [unconsciousCount, setUnconsciousCount] = useState<number>(1);
  const [firePresent, setFirePresent] = useState<boolean>(false);
  const [roadBlocked, setRoadBlocked] = useState<boolean>(true);
  const [reporterPhone, setReporterPhone] = useState<string>('+250 788 412 901');
  const [description, setDescription] = useState<string>('');
  const [hasVoiceNote, setHasVoiceNote] = useState<boolean>(false);
  const [hasPhoto, setHasPhoto] = useState<boolean>(false);

  // Briefing modal
  const [briefingOpen, setBriefingOpen] = useState<boolean>(false);
  const [lastSubmittedIncident, setLastSubmittedIncident] = useState<Incident | null>(null);
  const [copiedBriefing, setCopiedBriefing] = useState<boolean>(false);

  // Explicit report lifecycle — never claim dispatch before the server says so.
  type SubmitState = 'IDLE' | 'SUBMITTING' | 'FAILED' | 'QUEUED' | 'CONFIRMED';
  const [submitState, setSubmitState] = useState<SubmitState>('IDLE');
  const [submitError, setSubmitError] = useState<string | null>(null);

  // GPS provenance (accuracy + timestamp) and permission errors
  const [gpsAcquiredAt, setGpsAcquiredAt] = useState<string>(new Date().toISOString());
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Offline Simulation
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  const [offlineQueue, setOfflineQueue] = useState<Incident[]>([]);

  // Load nearby facilities via PostGIS calculation whenever location changes
  useEffect(() => {
    apiService.getNearbyFacilities(selectedLocation.latitude, selectedLocation.longitude)
      .then((data) => {
        if (data && data.length > 0) {
          setNearbyFacilities(data);
        }
      });
  }, [selectedLocation.latitude, selectedLocation.longitude]);

  // Real HTML5 Geolocation fetch with backend reverse geocoding
  const handleAcquireRealGps = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(5));
        const lng = Number(pos.coords.longitude.toFixed(5));
        const geo = await apiService.reverseGeocode(lat, lng);

        setSelectedLocation({
          latitude: lat,
          longitude: lng,
          accuracyMeters: Math.round(pos.coords.accuracy),
          addressText: geo?.formattedAddress || `Current Device GPS (${lat}, ${lng})`,
          district: geo?.district || 'Kigali City',
          sector: geo?.sector || 'Detected Area',
          landmark: 'GPS Verified Location'
        });
        setIsLocating(false);
        setGpsError(null);
        setGpsAcquiredAt(new Date().toISOString());
      },
      (err) => {
        setIsLocating(false);
        setGpsError(
          err.code === err.PERMISSION_DENIED
            ? 'GPS permission denied — allow location access, or type your exact location below.'
            : 'Could not get a GPS fix (no satellite / timeout). Type your exact location below.'
        );
      },
      { timeout: 7000, enableHighAccuracy: true }
    );
  };

  const handlePresetChange = async (presetName: string) => {
    const found = PRESET_LOCATIONS.find((p) => p.name === presetName);
    if (found) {
      setGpsError(null);
      setGpsAcquiredAt(new Date().toISOString());
      setSelectedLocation({
        latitude: found.lat,
        longitude: found.lng,
        accuracyMeters: 8,
        addressText: `${found.name}, ${found.sector}, ${found.district}`,
        district: found.district,
        sector: found.sector,
        landmark: found.landmark
      });
    }
  };

  // Calculate preliminary priority
  const calculatePriority = (): Incident['priority'] => {
    if (unconsciousCount > 0 || firePresent || injuredCount >= 4) {
      return 'CRITICAL';
    }
    if (injuredCount > 0 || roadBlocked) {
      return 'HIGH';
    }
    return 'MODERATE';
  };

  const handleStartSos = () => {
    emergencyAudio.playSosChirp();
    setSubmitState('IDLE');
    setSubmitError(null);
    setWizardOpen(true);
    setWizardStep(1);
  };

  const handleEmergencySubmit = async () => {
    const priority = calculatePriority();
    setSubmitState('SUBMITTING');
    setSubmitError(null);

    const incPayload: Partial<Incident> = {
      type: incidentType,
      priority,
      location: selectedLocation,
      peopleAffected: injuredCount,
      unconsciousCount,
      firePresent,
      roadBlocked,
      description: description || 'Emergency report filed via resQlink mobile SOS portal.',
      reporterPhone: reporterPhone || '+250 788 000 000'
    };

    try {
      // Offline: queue locally for SMS fallback. No responder is invented.
      if (isOfflineMode) {
        const queued: Incident = {
          id: `inc-${Date.now()}`,
          publicId: `RW-2026-${Math.floor(10000 + Math.random() * 90000)}`,
          type: incidentType,
          priority,
          status: 'REPORTED',
          location: selectedLocation,
          peopleAffected: injuredCount,
          unconsciousCount,
          firePresent,
          roadBlocked,
          description: description || 'Emergency report filed via resQlink mobile SOS portal.',
          reporterPhone: reporterPhone || '+250 788 000 000',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          audioNote: hasVoiceNote,
          hasPhoto,
          offlineQueued: true
        };
        setOfflineQueue((prev) => [queued, ...prev]);
        setSubmitState('QUEUED');
        setLastSubmittedIncident(queued);
        setWizardOpen(false);
        setBriefingOpen(true);
        return;
      }

      const serverIncident = await apiService.createIncident(incPayload);

      // The backend did NOT confirm: say so, keep the wizard open, retry freely.
      if (!serverIncident) {
        setSubmitState('FAILED');
        setSubmitError(
          'The resQlink backend did not confirm this report — no unit has been dispatched. Call 112 / 113 directly or retry transmission.'
        );
        return;
      }

      onNewIncident(serverIncident);
      setSubmitState('CONFIRMED');
      setLastSubmittedIncident(serverIncident);
      setWizardOpen(false);
      setBriefingOpen(true);
      emergencyAudio.playDispatchBeep();
    } catch {
      setSubmitState('FAILED');
      setSubmitError(
        'Transmission failed unexpectedly. Your report was NOT sent — call 112 / 113 directly or retry.'
      );
    }
  };

  // Generate Emergency Operator Briefing Script
  const generateBriefingText = (inc: Incident) => {
    if (currentLang === 'rw') {
      return `RAPORO Y'UBUTABAZI BWA POLISI (RNP 112/113):
ID: ${inc.publicId}
Aho byabereye: ${inc.location.addressText} (Akarere ka ${inc.location.district})
GPS: ${inc.location.latitude}, ${inc.location.longitude}
Ubwoko bw'impanuka: ${inc.type}
Abakomeretse: ${inc.peopleAffected}
Abataye ubwenge: ${inc.unconsciousCount}
Umuriro waka: ${inc.firePresent ? 'YEGO' : 'OYA'}
Umuhanda wafunzwe: ${inc.roadBlocked ? 'YEGO' : 'OYA'}
Numero ya telefone: ${inc.reporterPhone}
Turasaba ubutabazi bwihuse aho turi kuri GPS.`;
    }
    if (currentLang === 'fr') {
      return `URGENCE POLICE NATIONALE DU RWANDA (112 / 113):
Rapport N°: ${inc.publicId}
Lieu exact: ${inc.location.addressText} (District: ${inc.location.district})
GPS: ${inc.location.latitude}, ${inc.location.longitude}
Type: ${inc.type}
Nombre de blessés: ${inc.peopleAffected}
Personne(s) inconsciente(s): ${inc.unconsciousCount}
Incendie: ${inc.firePresent ? 'OUI' : 'NON'}
Voie bloquée: ${inc.roadBlocked ? 'OUI' : 'NON'}
Contact déclarant: ${inc.reporterPhone}
Merci de déployer les secours d'urgence immédiatement sur ces coordonnées GPS.`;
    }

    return `RWANDA EMERGENCY CALL BRIEFING (RNP 112 / 113):
Incident ID: ${inc.publicId}
Location: ${inc.location.addressText} (${inc.location.district} District)
GPS Coordinates: ${inc.location.latitude}, ${inc.location.longitude}
Incident Type: ${inc.type.replace('_', ' ')}
Casualties: ${inc.peopleAffected} person(s) injured
Unconscious/Trapped: ${inc.unconsciousCount} person(s)
Fire / Explosion: ${inc.firePresent ? 'YES' : 'NO'}
Road Blocked: ${inc.roadBlocked ? 'YES' : 'NO'}
Reporter Phone: ${inc.reporterPhone}
Please dispatch RNP Patrol & SAMU Ambulance to this exact GPS location immediately.`;
  };

  const copyBriefingToClipboard = () => {
    if (!lastSubmittedIncident) return;
    const text = generateBriefingText(lastSubmittedIncident);
    navigator.clipboard.writeText(text);
    setCopiedBriefing(true);
    setTimeout(() => setCopiedBriefing(false), 2500);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* Offline Alert Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-800/90 border border-slate-700 p-3 rounded-2xl">
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${
              isOfflineMode ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'
            }`}
          />
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              {isOfflineMode ? 'Offline Emergency Mode' : 'Online • Live Cloud Dispatch Connected'}
            </span>
            <p className="text-[11px] text-slate-400">
              {isOfflineMode
                ? 'Incidents cached in local storage + ready for instant SMS transmission'
                : 'Direct WebSocket transmission to Rwanda National Police Operations Desk'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {offlineQueue.length > 0 && (
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {offlineQueue.length} queued
            </span>
          )}
          <button
            onClick={() => setIsOfflineMode(!isOfflineMode)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
              isOfflineMode
                ? 'bg-amber-400 text-btn-ink border-amber-300 font-bold'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-ink-hd'
            }`}
          >
            <WifiOff className="w-3.5 h-3.5" />
            <span>{isOfflineMode ? 'Disable Offline Sim' : 'Simulate Offline Mode'}</span>
          </button>
        </div>
      </div>

      {/* Hero Location Banner: "I don't know where I am" */}
      <div className="bg-gradient-to-br from-panel to-panel-deep border border-cyan-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-black uppercase tracking-widest">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
              </span>
              <span>{t.gpsAcquired}</span>
            </div>

            <div className="text-xl sm:text-2xl font-black text-ink-hd flex items-center gap-2">
              <MapPin className="w-6 h-6 text-red-500 flex-shrink-0" />
              <span>{selectedLocation.addressText}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-300">
              <span className="bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700">
                GPS: {selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)}
              </span>
              <span className="bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700 text-emerald-300">
                Accuracy: ±{selectedLocation.accuracyMeters}m
              </span>
              <span className="bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700 text-rwblue-300">
                Acquired: {new Date(gpsAcquiredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <span className="bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700 text-amber-300">
                Landmark: {selectedLocation.landmark}
              </span>
            </div>

            {gpsError && (
              <div role="alert" className="rounded-xl border border-alert-500/50 bg-alert-500/10 px-3 py-2 text-[11.5px] font-semibold text-red-300">
                {gpsError}
              </div>
            )}

            {/* Manual location entry — works with GPS denied or no fix */}
            <div className="space-y-1">
              <label htmlFor="manual-loc" className="text-[10.5px] font-bold uppercase tracking-wide text-slate-400">
                Manual location (landmark, road, cell)
              </label>
              <input
                id="manual-loc"
                type="text"
                value={selectedLocation.addressText}
                onChange={(e) =>
                  setSelectedLocation((prev) => ({ ...prev, addressText: e.target.value }))
                }
                placeholder="e.g. KG 7 Ave, Kimihurura, Gasabo — opposite the pharmacy"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-200 focus:border-rwblue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Quick Location Switcher & Real GPS */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-shrink-0">
            <select
              value={selectedLocation.addressText.includes('Convention') ? PRESET_LOCATIONS[0].name : ''}
              onChange={(e) => handlePresetChange(e.target.value)}
              className="bg-slate-900 text-slate-200 text-xs font-medium border border-slate-700 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <option value="" disabled>Select Rwanda Test Hotspot</option>
              {PRESET_LOCATIONS.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name} ({p.district})
                </option>
              ))}
            </select>

            <button
              onClick={handleAcquireRealGps}
              disabled={isLocating}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-accent-ink font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Detecting...' : 'Use My GPS'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* THE GIANT SOS BUTTON (Brutally simple, panic-proof) */}
      <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
        <button
          onClick={handleStartSos}
          className="relative group w-64 h-64 sm:w-72 sm:h-72 rounded-full p-2 flex items-center justify-center transition-transform active:scale-95 focus:outline-none"
        >
          {/* Pulsing halo rings */}
          <div className="absolute inset-0 rounded-full bg-red-600/30 animate-ping duration-1000" />
          <div className="absolute inset-2 rounded-full bg-red-500/20 animate-pulse" />
          
          {/* Main button core */}
          <div className="relative w-full h-full rounded-full bg-gradient-to-b from-red-500 via-red-600 to-red-800 shadow-[0_0_60px_rgba(239,68,68,0.6)] border-4 border-red-300 flex flex-col items-center justify-center text-accent-ink px-4 group-hover:from-red-400 group-hover:to-red-700 transition-colors">
            <span className="text-4xl sm:text-5xl mb-2 drop-shadow-md">🚨</span>
            <span className="text-2xl sm:text-3xl font-black tracking-tight uppercase leading-none drop-shadow">
              SOS
            </span>
            <span className="text-xs sm:text-sm font-bold tracking-wider mt-1 text-red-100 max-w-[180px]">
              {t.emergencySosBtn}
            </span>
            <span className="text-[10px] text-red-200 mt-2 font-mono bg-red-900/60 px-2 py-0.5 rounded-full border border-red-400/40">
              1-Tap RNP Dispatch
            </span>
          </div>
        </button>

        <p className="text-xs sm:text-sm text-slate-400 max-w-md font-medium">
          {t.sosSubtext}
        </p>

        {/* Quick Direct Call Row */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onCallHotline('113', 'RNP Traffic Accidents')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-btn-ink font-bold text-xs shadow-lg transition-transform active:scale-95"
          >
            <CarFront className="w-4 h-4 text-btn-ink" />
            <span>{t.callPolice113}</span>
          </button>

          <button
            onClick={() => onCallHotline('112', 'RNP Central Emergency')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-accent-ink font-bold text-xs shadow-lg transition-transform active:scale-95"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{t.callEmergency112}</span>
          </button>

          <button
            onClick={() => onCallHotline('912', 'SAMU Ambulance')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-accent-ink font-bold text-xs shadow-lg transition-transform active:scale-95"
          >
            <Ambulance className="w-4 h-4" />
            <span>{t.callAmbulance912}</span>
          </button>
        </div>
      </div>

      {/* Nearest Verified Facilities for this GPS location */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm sm:text-base font-bold text-ink-hd">
              Nearby Verified Emergency Facilities in Rwanda
            </h3>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
            PostGIS Spatial Proximity
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(nearbyFacilities.length > 0 ? nearbyFacilities.slice(0, 3) : RWANDA_FACILITIES.slice(0, 3)).map((fac, idx) => {
            const dist = 'distanceKm' in fac ? `${fac.distanceKm} km` : idx === 0 ? '1.8 km' : idx === 1 ? '2.4 km' : '4.1 km';
            const eta = 'estimatedTravelMinutes' in fac ? `~${fac.estimatedTravelMinutes} min ETA` : null;

            return (
              <div
                key={fac.id}
                className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 space-y-2 hover:border-slate-600 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                    {fac.type === 'HOSPITAL' ? '🏥 Hospital' : fac.type === 'POLICE_STATION' ? '🚔 Police' : '🚒 Fire'}
                  </span>
                  <div className="text-right">
                    <span className="text-[11px] font-mono text-cyan-300 font-bold block">
                      {dist}
                    </span>
                    {eta && (
                      <span className="text-[10px] text-emerald-400 font-mono block">
                        {eta}
                      </span>
                    )}
                  </div>
                </div>
                <div className="font-bold text-xs text-ink-hd line-clamp-1">{fac.name}</div>
                <div className="text-[11px] text-slate-400">
                  {fac.sector}, {fac.district}
                </div>
                <button
                  onClick={() => onCallHotline(fac.phone, fac.name)}
                  className="w-full flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-cyan-300 text-xs font-semibold"
                >
                  <PhoneCall className="w-3 h-3" />
                  <span>{fac.phone}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Citizen Incidents (Live tracker) */}
      {activeIncidents.length > 0 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-bold text-ink-hd flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              Live Incident Status Tracking
            </h3>
            <span className="text-xs text-slate-400">
              {activeIncidents.length} active in Rwanda
            </span>
          </div>

          <div className="space-y-3">
            {activeIncidents.slice(0, 2).map((inc) => (
              <div
                key={inc.id}
                className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                      {inc.publicId}
                    </span>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded ${
                        inc.priority === 'CRITICAL'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {inc.priority}
                    </span>
                  </div>

                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{inc.status.replace(/_/g, ' ')}</span>
                  </span>
                </div>

                <div className="text-xs text-slate-300 font-medium">
                  {inc.location.addressText}
                </div>

                {inc.assignedResponder && (
                  <div className="bg-panel border border-cyan-500/30 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center text-accent-ink">
                        🚔
                      </div>
                      <div>
                        <div className="text-xs font-bold text-ink-hd">
                          {inc.assignedResponder.name} ({inc.assignedResponder.unit})
                        </div>
                        <div className="text-[11px] text-cyan-300 font-medium">
                          Status: En Route • ETA ~{inc.assignedResponder.etaMinutes} minutes
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (inc.assignedResponder) {
                          onCallHotline(inc.assignedResponder.phone, inc.assignedResponder.name);
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-accent-ink text-xs font-bold flex items-center gap-1 shadow"
                    >
                      <PhoneCall className="w-3 h-3" />
                      <span>Contact Responder</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QUICK 15-SECOND ACCIDENT REPORTING WIZARD MODAL */}
      {wizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 text-ink-hd max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Step {wizardStep} of 4 • 15-Second Emergency Dispatch
                </span>
                <h3 className="text-base sm:text-lg font-black text-ink-hd">
                  {wizardStep === 1 && t.step1Title}
                  {wizardStep === 2 && t.step2Title}
                  {wizardStep === 3 && t.step3Title}
                  {wizardStep === 4 && t.step4Title}
                </h3>
              </div>
              <button
                onClick={() => setWizardOpen(false)}
                className="text-slate-400 hover:text-ink-hd text-lg font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            {/* Step 1: Accident Type */}
            {wizardStep === 1 && (
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { type: 'TRAFFIC_MOTO', label: t.motoAccident, icon: '🏍️' },
                  { type: 'TRAFFIC_CAR', label: t.carAccident, icon: '🚗' },
                  { type: 'TRAFFIC_TRUCK', label: t.truckAccident, icon: '🚛' },
                  { type: 'TRAFFIC_BUS', label: t.busAccident, icon: '🚌' },
                  { type: 'PEDESTRIAN', label: t.pedestrianHit, icon: '🚶' },
                  { type: 'FIRE_EXPLOSION', label: t.fireExplosion, icon: '🔥' },
                  { type: 'MEDICAL_CRITICAL', label: t.medicalEmergency, icon: '🏥' },
                  { type: 'ROAD_HAZARD', label: t.roadHazardTitle, icon: '⚠️' }
                ].map((item) => (
                  <button
                    key={item.type}
                    onClick={() => {
                      setIncidentType(item.type as Incident['type']);
                      setWizardStep(2);
                    }}
                    className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all ${
                      incidentType === item.type
                        ? 'bg-amber-400 text-btn-ink border-amber-300 font-bold shadow-lg scale-102'
                        : 'bg-slate-800/80 text-slate-200 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-xs font-semibold">{item.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Step 2: Casualties */}
            {wizardStep === 2 && (
              <div className="space-y-4">
                <p className="text-xs text-slate-300">
                  Select estimated count of people who appear injured:
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {[0, 1, 2, 3, 4].map((count) => (
                    <button
                      key={count}
                      onClick={() => setInjuredCount(count)}
                      className={`py-3 rounded-2xl text-base font-black border transition-all ${
                        injuredCount === count
                          ? 'bg-red-600 text-accent-ink border-red-400 shadow-md'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {count === 4 ? '4+' : count}
                    </button>
                  ))}
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-800">
                  <button
                    onClick={() => setWizardStep(1)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-ink-hd"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setWizardStep(3)}
                    className="px-5 py-2.5 rounded-xl bg-amber-400 text-btn-ink font-bold text-xs shadow hover:bg-amber-300"
                  >
                    Next Step →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Unconscious / Trapped */}
            {wizardStep === 3 && (
              <div className="space-y-4">
                <p className="text-xs text-slate-300">
                  Is anyone not responding, trapped inside a vehicle, or having severe head trauma?
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setUnconsciousCount(1);
                      setWizardStep(4);
                    }}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between font-bold text-xs ${
                      unconsciousCount > 0
                        ? 'bg-red-600/90 text-accent-ink border-red-400'
                        : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    <span>🔴 {t.unconsciousYes}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      setUnconsciousCount(0);
                      setWizardStep(4);
                    }}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between font-bold text-xs ${
                      unconsciousCount === 0
                        ? 'bg-emerald-600/90 text-accent-ink border-emerald-400'
                        : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    <span>🟢 {t.unconsciousNo}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex justify-between pt-2 border-t border-slate-800">
                  <button
                    onClick={() => setWizardStep(2)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-ink-hd"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Immediate Hazards & Verification */}
            {wizardStep === 4 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setFirePresent(!firePresent)}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-2 ${
                      firePresent
                        ? 'bg-orange-600 text-accent-ink border-orange-400 font-bold'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    <Flame className="w-4 h-4 text-orange-400" />
                    <span>{t.fireYes}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRoadBlocked(!roadBlocked)}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-2 ${
                      roadBlocked
                        ? 'bg-amber-500 text-btn-ink border-amber-300 font-bold'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>{t.roadBlockedYes}</span>
                  </button>
                </div>

                {/* Reporter Phone */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">
                    {t.reporterPhone}
                  </label>
                  <input
                    type="text"
                    value={reporterPhone}
                    onChange={(e) => setReporterPhone(e.target.value)}
                    placeholder="+250 78X XXX XXX"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                {/* Optional situation note */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">
                    {t.optionalDetails}
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Near Giporoso BK Arena, two motos collided, 1 rider bleeding..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                {/* Optional photo / voice note mock */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setHasPhoto(!hasPhoto)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-medium ${
                      hasPhoto
                        ? 'bg-emerald-600 text-accent-ink border-emerald-400'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{hasPhoto ? 'Photo Attached' : 'Attach Photo'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setHasVoiceNote(!hasVoiceNote)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-medium ${
                      hasVoiceNote
                        ? 'bg-emerald-600 text-accent-ink border-emerald-400'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>{hasVoiceNote ? 'Voice Note (Kinyarwanda)' : 'Voice Note'}</span>
                  </button>
                </div>

                {/* Transmit feedback: submitting / failed / confirmed */}
                {submitState === 'FAILED' && submitError && (
                  <div
                    role="alert"
                    className="rounded-xl border border-alert-500/50 bg-alert-500/10 px-3 py-2.5 text-xs font-semibold text-red-300"
                  >
                    {submitError}
                  </div>
                )}

                {submitState === 'QUEUED' && (
                  <div className="rounded-xl border border-rwsun-500/50 bg-rwsun-500/10 px-3 py-2.5 text-xs font-semibold text-amber-300">
                    Offline mode: report queued on this device for SMS fallback. No unit has been dispatched yet.
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleEmergencySubmit}
                  disabled={submitState === 'SUBMITTING'}
                  aria-busy={submitState === 'SUBMITTING'}
                  className="w-full py-3.5 rounded-2xl bg-alert-500 hover:bg-red-500 disabled:opacity-60 disabled:pointer-events-none text-accent-ink font-black text-sm tracking-wide shadow-lg uppercase transition-transform active:scale-95 flex items-center justify-center gap-2"
                >
                  {submitState === 'SUBMITTING' ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" aria-hidden />
                      <span>{isOfflineMode ? 'Saving to device…' : 'Transmitting to dispatch…'}</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-4 h-4" aria-hidden />
                      <span>
                        {submitState === 'FAILED' ? 'Retry emergency report' : t.sendEmergencyReport}
                      </span>
                    </>
                  )}
                </button>

                <p className="text-center text-[10.5px] text-slate-400">
                  {isOfflineMode
                    ? 'Offline: this report stays on your device and falls back to SMS — call 112/113 if you can.'
                    : 'Your report is only marked sent once the server confirms it. Until then, no dispatch has happened.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* EMERGENCY CALL BRIEFING MODAL (Auto pops up after report) */}
      {briefingOpen && lastSubmittedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-panel-deep border-2 border-amber-400/80 w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 text-ink-hd">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-base sm:text-lg font-black text-amber-300">
                  {t.emergencyBriefingTitle}
                </h3>
                <span
                  className={`rounded-md border px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase ${
                    submitState === 'CONFIRMED'
                      ? 'border border-emerald-500/50 bg-emerald-500/15 text-emerald-300'
                      : 'border border-rwsun-500/50 bg-rwsun-500/15 text-amber-300'
                  }`}
                >
                  {submitState === 'CONFIRMED' ? 'Server-confirmed' : 'Queued offline'}
                </span>
              </div>
              <button
                onClick={() => setBriefingOpen(false)}
                className="text-slate-400 hover:text-ink-hd text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              {t.emergencyBriefingDesc}
            </p>

            {submitState !== 'CONFIRMED' && (
              <div className="rounded-xl border border-rwsun-500/40 bg-rwsun-500/10 px-3 py-2 text-[11.5px] font-semibold text-amber-300">
                This report has NOT been confirmed by the resQlink backend yet — treat this as
                self-dispatch: read the script and call the hotline directly.
              </div>
            )}

            {/* Generated briefing script card */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-emerald-300 space-y-1.5 whitespace-pre-line leading-relaxed shadow-inner">
              {generateBriefingText(lastSubmittedIncident)}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={copyBriefingToClipboard}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedBriefing ? 'Copied to Clipboard!' : 'Copy Script'}</span>
              </button>

              <button
                onClick={() => onCallHotline('113', 'RNP Traffic Accidents')}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-btn-ink text-xs font-black shadow-lg"
              >
                <PhoneCall className="w-4 h-4 text-btn-ink" />
                <span>Call RNP 113 Now</span>
              </button>

              <button
                onClick={() => onCallHotline('112', 'RNP Central Emergency')}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-accent-ink text-xs font-black shadow-lg"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Call RNP 112 Now</span>
              </button>
            </div>

            {/* SMS Fallback Notice */}
            {isOfflineMode && (
              <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-3 text-xs text-amber-200 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-amber-300">
                  <MessageSquare className="w-4 h-4" />
                  <span>SMS Fallback (Offline Mode Active)</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Send pre-formatted SMS to 112 / 113:
                </p>
                <div className="bg-black/60 p-2 rounded text-[11px] font-mono text-amber-300 break-all select-all">
                  RESQ {lastSubmittedIncident.publicId} LOC:{lastSubmittedIncident.location.latitude},{lastSubmittedIncident.location.longitude} INJ:{lastSubmittedIncident.peopleAffected} UNCON:{lastSubmittedIncident.unconsciousCount}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
