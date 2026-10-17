import React, { useState, useEffect, useMemo } from 'react';
import { Incident, IncidentStatus, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { INITIAL_INCIDENTS } from '../data/rwandaData';
import { apiService, getSocket } from '../services/api';
import type { Socket } from 'socket.io-client';
import { emergencyAudio } from '../utils/audio';
import { GoogleMapsCommandView } from './GoogleMapsCommandView';
import { OpenStreetMapCommandView } from './OpenStreetMapCommandView';
import {
  Button,
  Card,
  DemoFlag,
  EmptyState,
  IncidentCard,
  PriorityBadge,
  SectionHeader,
  StatCard,
  StatusBadge,
  Tag
} from './ui';
import {
  ShieldAlert,
  CarFront,
  Flame,
  Ambulance,
  MapPin,
  PhoneCall,
  CheckCircle2,
  Filter,
  Users,
  Radio,
  Send,
  Volume2,
  VolumeX,
  Building2,
  Activity,
  ArrowUpRight
} from 'lucide-react';

interface CommandDashboardProps {
  currentLang: Language;
  incidents: Incident[];
  onUpdateIncidentStatus: (id: string, newStatus: Incident['status']) => void;
  onAssignResponder: (incidentId: string, responderType: 'POLICE' | 'AMBULANCE' | 'FIRE') => void;
  onCallHotline: (number: string, serviceName: string) => void;
}

/** Seeded records shipped with the repo — always labelled as demo data. */
const SEED_INCIDENT_IDS = new Set(INITIAL_INCIDENTS.map((i) => i.id));

const LIFECYCLE_FILTERS: Array<{ value: string; label: string }> = [
  { value: 'ALL', label: 'All states' },
  { value: 'OPEN', label: 'Awaiting dispatch' },
  { value: 'DISPATCHED', label: 'Dispatched' },
  { value: 'RESPONDER_EN_ROUTE', label: 'En route' },
  { value: 'ON_SCENE', label: 'On scene' },
  { value: 'RESOLVED', label: 'Resolved' }
];

const OPEN_STATES: IncidentStatus[] = ['REPORTED', 'LOCATION_CONFIRMED', 'TRIAGED'];

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

export const CommandDashboard: React.FC<CommandDashboardProps> = ({
  currentLang,
  incidents,
  onUpdateIncidentStatus,
  onAssignResponder,
  onCallHotline
}) => {
  const t = TRANSLATIONS[currentLang];
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(incidents[0]?.id || '');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterDistrict, setFilterDistrict] = useState<string>('ALL');
  const [filterState, setFilterState] = useState<string>('ALL');
  const [responders, setResponders] = useState<any[]>([]);
  const [liveBanner, setLiveBanner] = useState<string | null>(null);
  const [audioMuted, setAudioMuted] = useState<boolean>(false);

  // Real connectivity — never faked. 'connecting' → 'online' → 'offline'.
  const [conn, setConn] = useState<'connecting' | 'online' | 'offline'>('connecting');
  const [lastUpdate, setLastUpdate] = useState<string>(new Date().toISOString());

  const hasGoogleMapsKey = Boolean(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
  const [mapEngine, setMapEngine] = useState<'GOOGLE_MAPS' | 'LEAFLET'>(
    hasGoogleMapsKey ? 'GOOGLE_MAPS' : 'LEAFLET'
  );

  useEffect(() => {
    emergencyAudio.setMuted(audioMuted);
  }, [audioMuted]);

  const selectedIncident = incidents.find((inc) => inc.id === selectedIncidentId) || incidents[0];

  const districts = useMemo(() => {
    const set = new Set<string>();
    incidents.forEach((i) => i.location.district && set.add(i.location.district));
    return Array.from(set).sort();
  }, [incidents]);

  // Socket.IO realtime listener + honest connection state
  useEffect(() => {
    let socket: Socket | null = null;
    let cancelled = false;
    apiService.getResponders().then((r) => !cancelled && setResponders(r));

    const touch = () => setLastUpdate(new Date().toISOString());

    const handleNewInc = (newInc: Incident) => {
      if (!audioMuted) emergencyAudio.playPoliceSiren(2.0);
      setLiveBanner(`NEW INCOMING EMERGENCY [${newInc.publicId}]: ${newInc.type} at ${newInc.location.addressText}`);
      setLastUpdate(new Date().toISOString());
      window.setTimeout(() => setLiveBanner(null), 8000);
    };

    const handleResponderMoved = (resp: any) => {
      touch();
      setResponders((prev) => prev.map((r) => (r.id === resp.responderId ? { ...r, ...resp } : r)));
    };

    getSocket()
      .then((s) => {
        if (cancelled) return;
        socket = s;
        setConn(s.connected ? 'online' : 'connecting');
        s.on('connect', () => setConn('online'));
        s.on('disconnect', () => setConn('offline'));
        s.on('incident:new', handleNewInc);
        s.on('responder:moved', handleResponderMoved);
        s.io.on('reconnect', () => setConn('online'));
      })
      .catch(() => !cancelled && setConn('offline'));

    return () => {
      cancelled = true;
      socket?.off('incident:new', handleNewInc);
      socket?.off('responder:moved', handleResponderMoved);
      setConn((prev) => (prev === 'online' ? 'offline' : prev));
    };
  }, [audioMuted]);

  // Track the freshest record timestamp from the API poll
  useEffect(() => {
    const newest = incidents.reduce<string | null>(
      (acc, i) => (!acc || i.updatedAt > acc ? i.updatedAt : acc),
      null
    );
    if (newest) setLastUpdate(newest);
  }, [incidents]);

  const filteredIncidents = incidents.filter((inc) => {
    if (filterSeverity !== 'ALL' && inc.priority !== filterSeverity) return false;
    if (filterType === 'TRAFFIC') {
      if (!(inc.type.startsWith('TRAFFIC') || inc.type === 'PEDESTRIAN')) return false;
    } else if (filterType === 'FIRE' && inc.type !== 'FIRE_EXPLOSION') return false;
    else if (filterType === 'MEDICAL' && inc.type !== 'MEDICAL_CRITICAL') return false;
    else if (filterType === 'HAZARD' && inc.type !== 'ROAD_HAZARD') return false;
    if (filterDistrict !== 'ALL' && inc.location.district !== filterDistrict) return false;
    if (filterState !== 'ALL') {
      if (filterState === 'OPEN' && !OPEN_STATES.includes(inc.status)) return false;
      if (filterState !== 'OPEN' && inc.status !== filterState) return false;
    }
    return true;
  });

  // Statistics (computed, not hard-coded)
  const activeCount = incidents.filter((i) => i.status !== 'RESOLVED').length;
  const criticalCount = incidents.filter((i) => i.priority === 'CRITICAL' && i.status !== 'RESOLVED').length;
  const pendingDispatchCount = incidents.filter((i) => OPEN_STATES.includes(i.status)).length;
  const respondingCount = incidents.filter(
    (i) => i.status === 'RESPONDER_EN_ROUTE' || i.status === 'DISPATCHED' || i.status === 'ON_SCENE'
  ).length;
  const resolvedCount = incidents.filter((i) => i.status === 'RESOLVED').length;

  const connTone =
    conn === 'online'
      ? 'text-emerald-500 ring-emerald-500/30 bg-emerald-500/10'
      : conn === 'offline'
        ? 'bg-alert-500/10 text-alert-500 ring-alert-500/30'
        : 'bg-amber-500/10 text-amber-400 ring-amber-500/30';

  /* Timeline built strictly from timestamps we actually have. */
  const timeline = selectedIncident
    ? [
        {
          at: selectedIncident.createdAt,
          label: 'Report received from citizen device',
          icon: ShieldAlert,
          tone: 'text-alert-500'
        },
        ...(selectedIncident.assignedResponder
          ? [
              {
                at: selectedIncident.updatedAt,
                label: `${selectedIncident.assignedResponder.type} unit assigned — ${selectedIncident.assignedResponder.name} (${selectedIncident.assignedResponder.unit})`,
                icon: Send,
                tone: 'text-rwblue-600'
              }
            ]
          : []),
        {
          at: selectedIncident.updatedAt,
          label: `Current state: ${selectedIncident.status.replace(/_/g, ' ')}`,
          icon: Activity,
          tone: 'text-rwsun-400'
        },
        ...(selectedIncident.resolvedAt
          ? [
              {
                at: selectedIncident.resolvedAt,
                label: 'Incident resolved & archived',
                icon: CheckCircle2,
                tone: 'text-emerald-500'
              }
            ]
          : [])
      ].sort((a, b) => a.at.localeCompare(b.at))
    : [];

  const hasActiveFilters =
    filterSeverity !== 'ALL' ||
    filterType !== 'ALL' ||
    filterDistrict !== 'ALL' ||
    filterState !== 'ALL';

  const clearFilters = () => {
    setFilterSeverity('ALL');
    setFilterType('ALL');
    setFilterDistrict('ALL');
    setFilterState('ALL');
  };

  const selectCls = (active: boolean) =>
    `shrink-0 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition-colors ${
      active
        ? 'border-rwblue-500/50 bg-rwblue-500 text-white'
        : 'border-ink-700 bg-panel text-slate-400 hover:border-rwblue-500/40 hover:text-ink-hd'
    }`;

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 space-y-4">
      {/* Live banner: severity-aware, screen-reader announced */}
      <div aria-live="polite">
        {liveBanner && (
          <div
            role="alert"
            className="mb-3 flex items-center gap-2 rounded-xl border border-alert-500/50 bg-alert-500/10 px-4 py-3 text-xs font-bold text-alert-500"
          >
            <Radio className="h-4 w-4 shrink-0 animate-pulse" aria-hidden />
            <span className="font-mono">{liveBanner}</span>
          </div>
        )}
      </div>

      {/* Telemetry header: real connectivity + last update + audio mute */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.12em] ring-1 ring-inset ${connTone}`}
            role="status"
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                conn === 'online' ? 'bg-emerald-500' : conn === 'offline' ? 'bg-alert-500' : 'bg-amber-400'
              }`}
              aria-hidden
            />
            {conn === 'online'
              ? 'Socket connected'
              : conn === 'offline'
                ? 'Socket disconnected'
                : 'Connecting…'}
          </span>
          <span className="font-mono text-[10.5px] text-slate-500">
            Last update {fmtTime(lastUpdate)}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setAudioMuted((m) => !m)}
          aria-pressed={audioMuted}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10.5px] font-bold ring-1 ring-inset transition-colors ${
            audioMuted
              ? 'border-ink-700 bg-panel text-slate-400 ring-ink-600'
              : 'border-rwsun-500/40 bg-rwsun-500/10 text-rwsun-400 ring-rwsun-500/30'
          }`}
        >
          {audioMuted ? <VolumeX className="h-3.5 w-3.5" aria-hidden /> : <Volume2 className="h-3.5 w-3.5" aria-hidden />}
          {audioMuted ? 'Alerts muted' : 'Alerts audible'}
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={ShieldAlert} value={criticalCount} label={t.criticalIncidents} tone="critical" />
        <StatCard icon={Send} value={pendingDispatchCount} label="Pending dispatch" tone="warning" />
        <StatCard icon={Radio} value={respondingCount} label={t.respondingUnits} tone="info" hint={`${responders.length} units on roster`} />
        <StatCard
          icon={CheckCircle2}
          value={resolvedCount}
          label={t.resolvedToday}
          tone="success"
          demo={incidents.some((i) => SEED_INCIDENT_IDS.has(i.id))}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Live map (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-ink-700 bg-panel p-4 shadow-sm flex flex-col space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-rwblue-500" aria-hidden />
              <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Rwanda Live Situational Map
              </h2>
              {hasGoogleMapsKey && (
                <Tag tone="verified">Google Maps active</Tag>
              )}
            </div>

            {/* Map Engine Selector */}
            <div className="flex items-center gap-1 rounded-lg border border-ink-700 bg-panel-mid p-1 text-[11px]">
              <button
                type="button"
                onClick={() => setMapEngine('GOOGLE_MAPS')}
                disabled={!hasGoogleMapsKey}
                aria-pressed={mapEngine === 'GOOGLE_MAPS'}
                className={`rounded-md px-2.5 py-1 font-bold transition-colors disabled:opacity-40 ${
                  mapEngine === 'GOOGLE_MAPS'
                    ? 'bg-rwblue-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-ink-hd'
                }`}
              >
                Google Maps
              </button>
              <button
                type="button"
                onClick={() => setMapEngine('LEAFLET')}
                aria-pressed={mapEngine === 'LEAFLET'}
                className={`rounded-md px-2.5 py-1 font-bold transition-colors ${
                  mapEngine === 'LEAFLET'
                    ? 'bg-rwblue-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-ink-hd'
                }`}
              >
                OpenStreetMap
              </button>
            </div>
          </div>

          {/* Exactly one map instance mounts at a time */}
          <div className="relative w-full h-[460px] rounded-xl overflow-hidden border border-ink-700 bg-slate-950 theme-island-dark">
            {mapEngine === 'GOOGLE_MAPS' && hasGoogleMapsKey ? (
              <GoogleMapsCommandView
                incidents={incidents}
                selectedIncident={selectedIncident}
                onSelectIncident={(inc) => setSelectedIncidentId(inc.id)}
                responders={responders}
                onQuickDispatch={(incId, responderName) => onAssignResponder(incId, 'POLICE')}
              />
            ) : (
              <OpenStreetMapCommandView
                incidents={incidents}
                selectedIncident={selectedIncident}
                onSelectIncident={(inc) => setSelectedIncidentId(inc.id)}
                responders={responders}
                onQuickDispatch={(incId, responderName) => onAssignResponder(incId, 'POLICE')}
              />
            )}
          </div>
        </div>

        {/* Queue + dispatch (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Filters: severity · type · district · lifecycle */}
          <Card>
            <SectionHeader
              title="Priority queue filters"
              icon={<Filter className="h-3.5 w-3.5" aria-hidden />}
              action={
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10.5px] text-slate-500">
                    {filteredIncidents.length}/{incidents.length}
                  </span>
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="text-[10.5px] font-bold text-rwblue-600 underline-offset-2 hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
              }
            />
            <div className="flex flex-wrap items-center gap-1.5 p-3">
              {/* Severity */}
              {['ALL', 'CRITICAL', 'HIGH', 'MODERATE'].map((f) => (
                <button
                  key={`sev-${f}`}
                  type="button"
                  onClick={() => setFilterSeverity(f)}
                  aria-pressed={filterSeverity === f}
                  className={selectCls(filterSeverity === f)}
                >
                  {f === 'ALL' ? 'Any severity' : f}
                </button>
              ))}

              {/* Incident type */}
              <div className="flex items-center gap-1.5">
                {['ALL', 'TRAFFIC', 'FIRE', 'MEDICAL', 'HAZARD'].map((f) => (
                  <button
                    key={`type-${f}`}
                    type="button"
                    onClick={() => setFilterType(f)}
                    aria-pressed={filterType === f}
                    className={selectCls(filterType === f)}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* District + lifecycle */}
              <div className="flex w-full flex-wrap items-center gap-1.5 sm:w-auto">
                <select
                  value={filterDistrict}
                  onChange={(e) => setFilterDistrict(e.target.value)}
                  aria-label="Filter by district"
                  className="min-h-8 shrink-none rounded-lg border border-ink-700 bg-panel px-2 py-1.5 text-[11px] font-bold text-slate-400 focus:border-rwblue-500"
                >
                  <option value="ALL">All districts</option>
                  {districts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <select
                  value={filterState}
                  onChange={(e) => setFilterState(e.target.value)}
                  aria-label="Filter by lifecycle state"
                  className="min-h-8 shrink-none rounded-lg border border-ink-700 bg-panel px-2 py-1.5 text-[11px] font-bold text-slate-400 focus:border-rwblue-500"
                >
                  {LIFECYCLE_FILTERS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Selected incident: detail, dispatch, timeline */}
          {selectedIncident ? (
            <Card tone={selectedIncident.priority === 'CRITICAL' ? 'critical' : 'info'}>
              <SectionHeader
                title="Incident detail"
                action={
                  <div className="flex items-center gap-1.5">
                    <PriorityBadge priority={selectedIncident.priority} />
                    {SEED_INCIDENT_IDS.has(selectedIncident.id) && <DemoFlag />}
                  </div>
                }
              />

              <div className="space-y-4 p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md border border-rwblue-500/40 bg-rwblue-500/10 px-2 py-0.5 font-mono text-xs font-bold text-rwblue-600">
                        {selectedIncident.publicId}
                      </span>
                      <StatusBadge status={selectedIncident.status} />
                    </div>
                    <h3 className="mt-1.5 text-base font-bold text-ink-hd">
                      {selectedIncident.type.replace(/_/g, ' ')}
                    </h3>
                  </div>
                </div>

                {/* Facts */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2 text-slate-300">
                    <MapPin className="h-4 w-4 text-alert-500 shrink-0 mt-0.5" aria-hidden />
                    <div className="min-w-0">
                      <span className="font-semibold text-ink-hd">
                        {selectedIncident.location.addressText}
                      </span>
                      <div className="font-mono text-[11px] text-slate-500">
                        {selectedIncident.location.district} · {selectedIncident.location.sector} ·{' '}
                        {selectedIncident.location.latitude.toFixed(4)},{' '}
                        {selectedIncident.location.longitude.toFixed(4)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                    <div className="rounded-xl border border-ink-700 bg-panel-mid p-2">
                      <span className="block text-[10px] uppercase tracking-wide text-slate-500">
                        Casualties
                      </span>
                      <span className="font-bold text-rwsun-400">
                        {selectedIncident.peopleAffected} injured ({selectedIncident.unconsciousCount} unconscious)
                      </span>
                    </div>
                    <div className="rounded-xl border border-ink-700 bg-panel-mid p-2">
                      <span className="block text-[10px] uppercase tracking-wide text-slate-500">
                        Hazards
                      </span>
                      <span className="font-bold text-slate-200">
                        {selectedIncident.firePresent ? 'Fire active' : 'No fire'} ·{' '}
                        {selectedIncident.roadBlocked ? 'Road blocked' : 'Road open'}
                      </span>
                    </div>
                  </div>

                  {/* Reporter */}
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-ink-700 bg-panel-mid p-3">
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                        Reporter
                      </span>
                      <div className="truncate font-semibold text-ink-hd">
                        {selectedIncident.reporterName || 'Citizen reporter'} ({selectedIncident.reporterPhone})
                      </div>
                    </div>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => onCallHotline(selectedIncident.reporterPhone, 'Citizen Reporter')}
                    >
                      <PhoneCall className="h-3.5 w-3.5" aria-hidden />
                      Call
                    </Button>
                  </div>
                </div>

                {/* Assignment controls */}
                <div className="space-y-2 border-t border-ink-700 pt-3">
                  <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    <Send className="h-3.5 w-3.5" aria-hidden />
                    Dispatch units
                  </span>

                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="primary"
                      onClick={() => {
                        if (!audioMuted) emergencyAudio.playPoliceSiren(1.5);
                        onAssignResponder(selectedIncident.id, 'POLICE');
                      }}
                      className="flex-col gap-0.5 min-h-16!"
                    >
                      <CarFront className="h-5 w-5" aria-hidden />
                      <span className="text-[10.5px]">RNP Patrol</span>
                    </Button>
                    <Button
                      variant="success"
                      onClick={() => {
                        if (!audioMuted) emergencyAudio.playDispatchBeep();
                        onAssignResponder(selectedIncident.id, 'AMBULANCE');
                      }}
                      className="flex-col gap-0.5 min-h-16!"
                    >
                      <Ambulance className="h-5 w-5" aria-hidden />
                      <span className="text-[10.5px]">SAMU Medic</span>
                    </Button>
                    <Button
                      variant="sun"
                      onClick={() => {
                        if (!audioMuted) emergencyAudio.playPoliceSiren(1.5);
                        onAssignResponder(selectedIncident.id, 'FIRE');
                      }}
                      className="flex-col gap-0.5 min-h-16!"
                    >
                      <Flame className="h-5 w-5" aria-hidden />
                      <span className="text-[10.5px]">Fire Brigade</span>
                    </Button>
                  </div>

                  {selectedIncident.status !== 'RESOLVED' ? (
                    <Button
                      variant="success"
                      block
                      size="md"
                      onClick={() => onUpdateIncidentStatus(selectedIncident.id, 'RESOLVED')}
                    >
                      <CheckCircle2 className="h-4 w-4" aria-hidden />
                      Mark resolved & archive
                    </Button>
                  ) : (
                    <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-center text-xs font-bold text-emerald-500">
                      Resolved — status confirmed by server
                    </div>
                  )}
                </div>

                {/* Event timeline (only real timestamps) */}
                <div className="space-y-2 border-t border-ink-700 pt-3">
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    {t.incidentTimeline}
                  </span>
                  <ol className="space-y-2">
                    {timeline.map((ev, idx) => (
                      <li key={`${ev.at}-${idx}`} className="flex items-start gap-2.5 text-xs">
                        <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg border border-ink-700 bg-panel-mid">
                          <ev.icon className={`h-3.5 w-3.5 ${ev.tone}`} aria-hidden />
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold text-ink-hd">{ev.label}</p>
                          <time className="font-mono text-[10.5px] text-slate-500" dateTime={ev.at}>
                            {fmtTime(ev.at)}
                          </time>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Assigned responder */}
                {selectedIncident.assignedResponder ? (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rwblue-500/35 bg-rwblue-500/[0.06] p-3">
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-rwblue-600">
                        Assigned unit
                      </span>
                      <div className="text-xs font-bold text-ink-hd">
                        {selectedIncident.assignedResponder.name} ({selectedIncident.assignedResponder.unit})
                      </div>
                      <div className="font-mono text-[11px] text-slate-500">
                        ETA ~{selectedIncident.assignedResponder.etaMinutes} min ·{' '}
                        {selectedIncident.assignedResponder.phone}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        onCallHotline(
                          selectedIncident.assignedResponder!.phone,
                          selectedIncident.assignedResponder!.name
                        )
                      }
                    >
                      <PhoneCall className="h-3.5 w-3.5" aria-hidden />
                      Contact unit
                    </Button>
                  </div>
                ) : (
                  <p className="rounded-xl border border-dashed border-ink-600 bg-panel-mid px-3 py-2.5 text-[11.5px] text-slate-500">
                    No unit assigned yet — dispatch has not been confirmed for this incident.
                  </p>
                )}
              </div>
            </Card>
          ) : (
            <EmptyState
              title="No incident selected"
              description="Pick a record from the feed below to open dispatch controls."
            />
          )}

          {/* Incident feed */}
          <Card>
            <SectionHeader
              title={`Active incident feed (${filteredIncidents.length})`}
              icon={<Users className="h-3.5 w-3.5" aria-hidden />}
              action={<Tag tone="info">Live</Tag>}
            />
            <div className="max-h-[340px] space-y-2 overflow-y-auto p-3 pr-1">
              {filteredIncidents.length === 0 ? (
                <EmptyState
                  title="Queue is clear"
                  description={
                    hasActiveFilters
                      ? 'No incidents match the current filters.'
                      : 'No active incidents right now. New reports stream in over the WebSocket in real time.'
                  }
                  action={
                    hasActiveFilters ? (
                      <Button variant="outline" size="sm" onClick={clearFilters}>
                        Clear filters
                      </Button>
                    ) : undefined
                  }
                />
              ) : (
                filteredIncidents.map((inc) => (
                  <IncidentCard
                    key={inc.id}
                    incident={inc}
                    selected={selectedIncident?.id === inc.id}
                    onSelect={(i) => setSelectedIncidentId(i.id)}
                  />
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Honest data provenance note */}
      <p className="flex flex-wrap items-center gap-2 text-[10.5px] text-slate-500">
        <Building2 className="h-3.5 w-3.5" aria-hidden />
        Records seeded with the app are marked
        <DemoFlag />
        — live records arrive from the resQlink API over Socket.IO.
        <ArrowUpRight className="h-3 w-3" aria-hidden />
      </p>
    </div>
  );
};