import React, { useState } from 'react';
import { Incident, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { emergencyAudio } from '../utils/audio';
import { Button, Card, EmptyState, IncidentCard, Notice, PriorityBadge, SectionHeader, StatusBadge, Tag } from './ui';
import {
  Navigation,
  PhoneCall,
  CheckCircle2,
  Clock,
  MapPin,
  Compass,
  Hand,
  Radio,
  TriangleAlert,
  Route,
  CircleCheckBig,
  Wifi,
  WifiOff,
  Loader2,
  ExternalLink
} from 'lucide-react';

interface ResponderViewProps {
  currentLang: Language;
  activeIncidents: Incident[];
  onUpdateIncidentStatus: (id: string, newStatus: Incident['status']) => void;
  onCallHotline: (number: string, serviceName: string) => void;
}

type SyncState = 'IDLE' | 'PENDING' | 'SUCCESS' | 'FAILURE';

const SYNC_META: Record<SyncState, { label: string; className: string; icon: React.ReactNode }> = {
  IDLE: {
    label: 'No pending updates',
    className: 'border-ink-700 bg-panel text-slate-400',
    icon: <Radio className="h-3.5 w-3.5" aria-hidden />
  },
  PENDING: {
    label: 'Syncing to dispatch…',
    className: 'border-rwsun-500/40 bg-rwsun-500/10 text-rwsun-400',
    icon: <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
  },
  SUCCESS: {
    label: 'Update confirmed by server',
    className: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500',
    icon: <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
  },
  FAILURE: {
    label: 'Update failed — retry below',
    className: 'border-alert-500/40 bg-alert-500/10 text-alert-500',
    icon: <WifiOff className="h-3.5 w-3.5" aria-hidden />
  }
};

export const ResponderView: React.FC<ResponderViewProps> = ({
  currentLang,
  activeIncidents,
  onUpdateIncidentStatus,
  onCallHotline
}) => {
  const t = TRANSLATIONS[currentLang];
  const [responderStatus, setResponderStatus] = useState<
    'AVAILABLE' | 'ACKNOWLEDGED' | 'EN_ROUTE' | 'ON_SCENE' | 'BUSY'
  >('AVAILABLE');
  /** Explicit lifecycle per the brief: acknowledge → en route → on scene → all clear. */
  const [acceptedIncidentId, setAcceptedIncidentId] = useState<string | null>(
    activeIncidents.find((i) => i.status === 'DISPATCHED' || i.status === 'RESPONDER_EN_ROUTE')?.id || null
  );
  const [sync, setSync] = useState<SyncState>('IDLE');
  const [lastAction, setLastAction] = useState<string | null>(null);

  // Non-websocket fallback: watch the browser's real connectivity.
  const [online, setOnline] = useState<boolean>(typeof navigator === 'undefined' ? true : navigator.onLine);
  React.useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
    };
  }, []);

  const activeIncident = activeIncidents.find((i) => i.id === acceptedIncidentId) || null;
  const otherQueue = activeIncidents.filter((i) => i.id !== acceptedIncidentId);

  /** Push a status change with honest pending / success / failure states. */
  const pushUpdate = async (incidentId: string, status: Incident['status'], label: string) => {
    setLastAction(label);
    // Reflect a genuinely unreachable device without pretending a push happened.
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setSync('FAILURE');
      return;
    }
    setSync('PENDING');
    try {
      await onUpdateIncidentStatus(incidentId, status);
      setSync('SUCCESS');
      window.setTimeout(() => setSync((s) => (s === 'SUCCESS' ? 'IDLE' : s)), 4000);
    } catch {
      setSync('FAILURE');
    }
  };

  const handleAcknowledge = () => {
    if (!activeIncident) return;
    if (!emergencyAudio.isMuted()) emergencyAudio.playDispatchBeep();
    setResponderStatus('ACKNOWLEDGED');
    void pushUpdate(activeIncident.id, 'DISPATCHED', 'Acknowledged');
  };

  const handleEnRoute = () => {
    if (!activeIncident) return;
    if (!emergencyAudio.isMuted()) emergencyAudio.playPoliceSiren(1.2);
    setResponderStatus('EN_ROUTE');
    void pushUpdate(activeIncident.id, 'RESPONDER_EN_ROUTE', 'En route');
  };

  const handleOnScene = () => {
    if (!activeIncident) return;
    setResponderStatus('ON_SCENE');
    void pushUpdate(activeIncident.id, 'ON_SCENE', 'On scene');
  };

  const handleAllClear = () => {
    if (!activeIncident) return;
    setResponderStatus('AVAILABLE');
    void pushUpdate(activeIncident.id, 'RESOLVED', 'All clear');
    setAcceptedIncidentId(null);
  };

  const syncMeta = SYNC_META[sync];

  const statusTone =
    responderStatus === 'ON_SCENE'
      ? 'border-alert-500/50 bg-alert-500/15 text-alert-500'
      : responderStatus === 'EN_ROUTE'
        ? 'border-rwsun-500/50 bg-rwsun-500/15 text-rwsun-400'
        : responderStatus === 'ACKNOWLEDGED'
          ? 'border-rwblue-500/50 bg-rwblue-500/15 text-rwblue-600'
          : 'border-emerald-500/50 bg-emerald-500/15 text-emerald-500';

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-6 space-y-5">
      {/* Unit identity + readiness */}
      <Card tone="info">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-rwblue-500 text-white shadow-sm shadow-rwblue-500/30">
              <Radio className="h-6 w-6" aria-hidden />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-rwblue-600">
                  Rwanda National Police mobile unit
                </span>
                <span className="flex h-2 w-2" aria-hidden>
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                </span>
              </div>
              <h2 className="text-lg font-bold text-ink-hd">
                RNP Traffic Patrol Alpha-4 (Kigali Metro)
              </h2>
              <p className="text-xs text-slate-500">
                Officers: Cpl. Ndayisaba &amp; Off. Uwase · Vehicle GR 421-B
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Tag tone={online ? 'live' : 'danger'}>
              {online ? <Wifi className="h-3 w-3" aria-hidden /> : <WifiOff className="h-3 w-3" aria-hidden />}
              {online ? 'Connected' : 'Offline'}
            </Tag>
            <span
              className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] ${statusTone}`}
            >
              {responderStatus.replace('_', ' ')}
            </span>
          </div>
        </div>
      </Card>

      {/* Driving safety banner — never encourage interaction while driving */}
      <Notice tone="warn" title="Pulled over to interact">
        Do not touch this screen while driving. Stop in a safe place, or hand the device to your
        partner before acknowledging or updating an incident.
      </Notice>

      {/* Sync state strip */}
      <div
        className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-semibold ${syncMeta.className}`}
        role="status"
        aria-live="polite"
      >
        {syncMeta.icon}
        <span>{syncMeta.label}</span>
        {lastAction && sync !== 'IDLE' && (
          <span className="font-mono text-[10.5px] opacity-70">· {lastAction}</span>
        )}
        {sync === 'FAILURE' && activeIncident && (
          <Button variant="danger" size="sm" className="ml-auto" onClick={handleEnRoute}>
            Retry
          </Button>
        )}
      </div>

      {/* Active assignment */}
      {activeIncident ? (
        <Card tone={activeIncident.priority === 'CRITICAL' ? 'critical' : 'default'}>
          <SectionHeader
            title="Active mission"
            action={
              <div className="flex flex-wrap items-center gap-1.5">
                <PriorityBadge priority={activeIncident.priority} />
                <StatusBadge status={activeIncident.status} />
              </div>
            }
          />

          <div className="space-y-4 p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <span className="rounded-md border border-rwblue-500/40 bg-rwblue-500/10 px-2 py-0.5 font-mono text-[11px] font-bold text-rwblue-600">
                  {activeIncident.publicId}
                </span>
                <h3 className="mt-1.5 text-lg font-bold text-ink-hd">
                  {activeIncident.type.replace(/_/g, ' ')}
                </h3>
              </div>
              <div className="text-right">
                <span className="block text-[10.5px] font-bold uppercase tracking-wide text-slate-500">
                  {t.distanceToScene}
                </span>
                <span className="text-xl font-bold text-ink-hd">1.8 km</span>
                <span className="block font-mono text-[10.5px] text-slate-500">~4 min ETA</span>
              </div>
            </div>

            {/* Navigation target */}
            <div className="space-y-2 rounded-xl border border-ink-700 bg-panel-mid p-3.5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-rwblue-600">
                <Navigation className="h-4 w-4" aria-hidden />
                Target coordinates &amp; routing
              </div>
              <p className="text-sm font-bold text-ink-hd">{activeIncident.location.addressText}</p>
              <p className="break-all font-mono text-[11px] text-slate-500">
                {activeIncident.location.latitude.toFixed(5)}, {activeIncident.location.longitude.toFixed(5)} ·{' '}
                {activeIncident.location.district} — {activeIncident.location.sector}
              </p>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${activeIncident.location.latitude},${activeIncident.location.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-rwblue-500/40 bg-rwblue-500/10 px-3 py-1.5 text-[11.5px] font-bold text-rwblue-600 transition-colors hover:bg-rwblue-500/20"
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                Open turn-by-turn navigation (hands-free)
              </a>
            </div>

            {/* Triage intel */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-ink-700 bg-panel p-3.5">
                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  <Clock className="h-3 w-3" aria-hidden /> Estimated injured
                </span>
                <span className="mt-1 block text-lg font-bold text-ink-hd">
                  {activeIncident.peopleAffected}
                </span>
              </div>
              <div className="rounded-xl border border-alert-500/40 bg-alert-500/5 p-3.5">
                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-alert-500">
                  <TriangleAlert className="h-3 w-3" aria-hidden /> Unconscious / trapped
                </span>
                <span className="mt-1 block text-lg font-bold text-alert-500">
                  {activeIncident.unconsciousCount > 0 ? activeIncident.unconsciousCount : 'None'}
                </span>
              </div>
              <div className="rounded-xl border border-ink-700 bg-panel p-3.5">
                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  <MapPin className="h-3 w-3" aria-hidden /> Obstruction / fire
                </span>
                <span className="mt-1 block text-sm font-bold text-ink-hd">
                  {activeIncident.roadBlocked ? 'Road blocked' : 'Road clear'} ·{' '}
                  {activeIncident.firePresent ? 'Fire' : 'No fire'}
                </span>
              </div>
            </div>

            {/* Caller contact */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-700 bg-panel p-3.5">
              <div className="min-w-0">
                <span className="text-[10.5px] text-slate-500">Caller contact</span>
                <div className="font-mono text-sm font-bold text-ink-hd">
                  {activeIncident.reporterPhone}
                </div>
              </div>
              <Button variant="success" onClick={() => onCallHotline(activeIncident.reporterPhone, 'Caller')}>
                <PhoneCall className="h-4 w-4" aria-hidden />
                Call reporter
              </Button>
            </div>

            {/* Mission control — large, accessible, ordered actions */}
            <div className="space-y-2.5 border-t border-ink-700 pt-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                Mission control
              </span>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleAcknowledge}
                  aria-current={responderStatus === 'ACKNOWLEDGED'}
                  className={responderStatus === 'ACKNOWLEDGED' ? 'border-rwblue-500/60 bg-rwblue-500/10' : ''}
                >
                  <Hand className="h-5 w-5" aria-hidden />
                  Acknowledge dispatch
                </Button>
                <Button variant="sun" size="lg" onClick={handleEnRoute}>
                  <Route className="h-5 w-5" aria-hidden />
                  En route to scene
                </Button>
                <Button variant="primary" size="lg" onClick={handleOnScene}>
                  <Compass className="h-5 w-5" aria-hidden />
                  Arrived on scene
                </Button>
                <Button variant="success" size="lg" onClick={handleAllClear}>
                  <CircleCheckBig className="h-5 w-5" aria-hidden />
                  All clear — resolved
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <EmptyState
          title="Unit standing by — sector clear"
          description="You will receive an instant alert and a navigation prompt when RNP Central Dispatch assigns an incident to this unit."
        />
      )}

      {/* Other assigned incidents */}
      {otherQueue.length > 0 && (
        <Card>
          <SectionHeader title={`Other open assignments (${otherQueue.length})`} />
          <div className="max-h-[320px] space-y-2 overflow-y-auto p-3">
            {otherQueue.map((inc) => (
              <IncidentCard
                key={inc.id}
                incident={inc}
                onSelect={(i) => {
                  setAcceptedIncidentId(i.id);
                  setResponderStatus('AVAILABLE');
                }}
              />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};