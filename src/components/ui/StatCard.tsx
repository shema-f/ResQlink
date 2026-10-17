import React from 'react';
import { MapPin, Clock, LucideIcon } from 'lucide-react';
import { Incident } from '../../types';
import { Card } from './Card';
import { PriorityBadge, StatusBadge, Tag } from './Badge';

/* =========================================================================
   Metric + incident cards shared by /command, /responder and /citizen.
   ========================================================================= */

type Tone = 'critical' | 'warning' | 'info' | 'success';

const TONES: Record<Tone, { chip: string; value: string }> = {
  critical: {
    chip: 'bg-alert-500/12 text-alert-500 ring-alert-500/25',
    value: 'text-alert-500'
  },
  warning: {
    chip: 'bg-rwsun-500/18 text-rwsun-400 ring-rwsun-500/30',
    value: 'text-rwsun-400'
  },
  info: {
    chip: 'bg-rwblue-500/12 text-rwblue-600 ring-rwblue-500/25',
    value: 'text-rwblue-600'
  },
  success: {
    chip: 'bg-emerald-500/12 text-emerald-500 ring-emerald-500/25',
    value: 'text-emerald-500'
  }
};

/** Summary metric used across the dashboards. */
export const StatCard: React.FC<{
  icon: LucideIcon;
  value: React.ReactNode;
  label: string;
  hint?: string;
  tone?: Tone;
  /** Marks numbers that are simulated rather than backend-confirmed. */
  demo?: boolean;
  className?: string;
}> = ({ icon: Icon, value, label, hint, tone = 'info', demo = false, className = '' }) => (
  <Card className={`flex items-center gap-3 px-4 py-3.5 ${className}`}>
    <span
      className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1 ring-inset ${TONES[tone].chip}`}
      aria-hidden
    >
      <Icon className="h-5 w-5" />
    </span>
    <div className="min-w-0">
      <div className="flex items-baseline gap-2">
        <span className={`text-2xl font-bold leading-none tracking-tight ${TONES[tone].value}`}>
          {value}
        </span>
        {demo && <Tag tone="warn">Demo</Tag>}
      </div>
      <p className="mt-1 truncate text-[11.5px] font-semibold text-slate-400">{label}</p>
      {hint && <p className="truncate font-mono text-[10px] text-slate-500">{hint}</p>}
    </div>
  </Card>
);

/** Compact incident row for priority queues / feed lists. */
export const IncidentCard: React.FC<{
  incident: Incident;
  selected?: boolean;
  onSelect?: (incident: Incident) => void;
  className?: string;
}> = ({ incident: inc, selected = false, onSelect, className = '' }) => {
  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] font-bold text-rwblue-600">{inc.publicId}</span>
        <div className="flex items-center gap-1.5">
          <PriorityBadge priority={inc.priority} />
        </div>
      </div>

      <p className="mt-1.5 line-clamp-1 text-xs font-semibold text-ink-hd">
        {inc.location.addressText}
      </p>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-1.5">
        <span className="font-mono text-[10.5px] uppercase tracking-wide text-slate-500">
          {inc.type.replace(/_/g, ' ')}
        </span>
        <StatusBadge status={inc.status} />
      </div>

      <div className="mt-2 flex items-center gap-3 border-t border-ink-700 pt-2 text-[10.5px] text-slate-500">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" aria-hidden />
          {new Date(inc.updatedAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
        <span className="flex min-w-0 items-center gap-1">
          <MapPin className="h-3 w-3 shrink-0" aria-hidden />
          <span className="truncate">{inc.location.district}</span>
        </span>
        {inc.assignedResponder && (
          <span className="ml-auto flex items-center gap-1 text-rwblue-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
            Unit assigned
          </span>
        )}
      </div>
    </>
  );

  const base = `w-full rounded-xl border p-3 text-left transition-colors ${
    selected
      ? 'border-rwblue-500/60 bg-rwblue-500/[0.06] shadow-sm'
      : 'border-ink-700 bg-panel hover:border-rwblue-500/40 hover:bg-panel-mid'
  } ${className}`;

  return onSelect ? (
    <button
      type="button"
      onClick={() => onSelect(inc)}
      aria-pressed={selected}
      className={`${base} focus-visible:outline-2`}
    >
      {body}
    </button>
  ) : (
    <div className={base}>{body}</div>
  );
};