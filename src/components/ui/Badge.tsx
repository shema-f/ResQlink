import React from 'react';
import { IncidentStatus, PriorityLevel, RoadHazard } from '../../types';

/* =========================================================================
   Status badges — one source of truth for severity / lifecycle colour so
   incident state reads identically across /command, /citizen and /responder.
   Colour is always paired with text (never colour-only signalling).
   ========================================================================= */

const PRIORITY_STYLES: Record<PriorityLevel, string> = {
  CRITICAL: 'bg-alert-500 text-white ring-alert-500/40',
  HIGH: 'bg-rwsun-500 text-btn-ink ring-rwsun-500/40',
  MODERATE: 'bg-rwblue-500 text-white ring-rwblue-500/40',
  LOW: 'bg-ink-700 text-slate-200 ring-ink-600/60'
};

export const PriorityBadge: React.FC<{ priority: PriorityLevel; className?: string }> = ({
  priority,
  className = ''
}) => (
  <span
    className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] ring-1 ring-inset ${PRIORITY_STYLES[priority]} ${className}`}
  >
    {priority}
  </span>
);

/** Lifecycle colour: red family = needs attention, blue = work in progress,
 *  green = resolved, gray = cancelled. */
const STATUS_STYLES: Record<IncidentStatus, string> = {
  REPORTED: 'bg-alert-500/15 text-alert-500 ring-alert-500/30',
  LOCATION_CONFIRMED: 'bg-alert-500/10 text-alert-500 ring-alert-500/25',
  TRIAGED: 'bg-amber-950 text-amber-400 ring-amber-400/30',
  DISPATCHED: 'bg-rwblue-500/15 text-rwblue-600 ring-rwblue-500/30',
  RESPONDER_EN_ROUTE: 'bg-rwblue-500/15 text-rwblue-600 ring-rwblue-500/30',
  ON_SCENE: 'bg-rwsun-500/20 text-rwsun-400 ring-rwsun-500/40',
  RESOLVED: 'bg-emerald-950 text-emerald-400 ring-emerald-500/30',
  CANCELLED: 'bg-ink-800 text-slate-400 ring-ink-600/60'
};

export const StatusBadge: React.FC<{ status: IncidentStatus; className?: string }> = ({
  status,
  className = ''
}) => (
  <span
    className={`inline-flex items-center rounded-md px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.08em] ring-1 ring-inset ${STATUS_STYLES[status]} ${className}`}
  >
    {status.replace(/_/g, ' ')}
  </span>
);

const HAZARD_STYLES: Record<RoadHazard['severity'], string> = {
  DANGEROUS: 'bg-alert-500 text-white ring-alert-500/40',
  MODERATE: 'bg-rwsun-500 text-btn-ink ring-rwsun-500/40',
  ATTENTION: 'bg-rwblue-500 text-white ring-rwblue-500/40'
};

export const HazardBadge: React.FC<{
  severity: RoadHazard['severity'];
  className?: string;
}> = ({ severity, className = '' }) => (
  <span
    className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] ring-1 ring-inset ${HAZARD_STYLES[severity]} ${className}`}
  >
    {severity}
  </span>
);

/** Generic pill for connection state, verified flags, ETA chips… */
type Tone = 'live' | 'info' | 'warn' | 'danger' | 'muted' | 'verified';

const TONES: Record<Tone, string> = {
  live: 'bg-emerald-950 text-emerald-400 ring-emerald-500/30',
  info: 'bg-rwblue-500/10 text-rwblue-600 ring-rwblue-500/30',
  warn: 'bg-amber-950 text-amber-400 ring-amber-400/30',
  danger: 'bg-alert-500/15 text-alert-500 ring-alert-500/30',
  muted: 'bg-ink-800 text-slate-400 ring-ink-600/60',
  verified: 'bg-emerald-950 text-emerald-400 ring-emerald-500/30'
};

export const Tag: React.FC<{
  tone?: Tone;
  mono?: boolean;
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLSpanElement>> = ({ tone = 'muted', mono = false, className = '', children, ...rest }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] ring-1 ring-inset ${
      mono ? 'font-mono normal-case tracking-normal' : ''
    } ${TONES[tone]} ${className}`}
    {...rest}
  >
    {children}
  </span>
);

/** Explicit "this number is simulated" flag required by the ops brief. */
export const DemoFlag: React.FC<{ className?: string }> = ({ className = '' }) => (
  <Tag tone="warn" className={className} title="Simulated value — not live backend data">
    Demo data
  </Tag>
);