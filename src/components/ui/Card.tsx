import React from 'react';
import { AlertTriangle, Inbox, Loader2, RefreshCw, ShieldAlert } from 'lucide-react';
import { Button } from './Button';

/* =========================================================================
   Surfaces + state blocks: crisp card geometry (12–16px radii, hairline
   borders) plus the shared loading / empty / error treatments every view
   reuses so failure states never look like an afterthought.
   ========================================================================= */

/** Crisp elevated card. Use `tone` for semantic accents. */
type Tone = 'default' | 'critical' | 'info' | 'warning' | 'success';

const TONES: Record<Tone, string> = {
  default: 'border-ink-700 bg-panel',
  critical: 'border-alert-500/40 bg-panel',
  info: 'border-rwblue-500/35 bg-panel',
  warning: 'border-rwsun-500/40 bg-panel',
  success: 'border-emerald-500/35 bg-panel'
};

export const Card: React.FC<{
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}> = ({ tone = 'default', className = '', children }) => (
  <section className={`rounded-2xl border shadow-sm shadow-ink-950/5 ${TONES[tone]} ${className}`}>
    {children}
  </section>
);

/** Section heading with optional right-side slot (filters, flags, counts). */
export const SectionHeader: React.FC<{
  title: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}> = ({ title, icon, action, className = '' }) => (
  <header
    className={`flex flex-wrap items-center justify-between gap-2 border-b border-ink-700 px-4 py-3 sm:px-5 ${className}`}
  >
    <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
      {icon}
      {title}
    </h3>
    {action}
  </header>
);

/** Spinner sized for inline / block loading. */
export const Spinner: React.FC<{ className?: string; label?: string }> = ({
  className = 'h-4 w-4',
  label
}) => (
  <span className="inline-flex items-center gap-2" role="status" aria-live="polite">
    <Loader2 className={`animate-spin text-rwblue-500 ${className}`} aria-hidden />
    {label && <span className="text-xs font-semibold text-slate-400">{label}</span>}
  </span>
);

/** Suspense / async loading block. */
export const LoadingBlock: React.FC<{ label?: string; className?: string }> = ({
  label = 'Loading',
  className = ''
}) => (
  <div
    className={`flex flex-col items-center justify-center gap-3 rounded-2xl border border-ink-700 bg-panel px-6 py-12 ${className}`}
    role="status"
    aria-live="polite"
  >
    <Spinner className="h-6 w-6" />
    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">{label}</p>
  </div>
);

/** Empty queue / no results state. */
export const EmptyState: React.FC<{
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}> = ({ title, description, action, className = '' }) => (
  <div
    className={`flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-ink-600 bg-panel-mid px-6 py-10 text-center ${className}`}
  >
    <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink-800 text-slate-400">
      <Inbox className="h-5 w-5" aria-hidden />
    </span>
    <p className="text-sm font-bold text-ink-hd">{title}</p>
    {description && (
      <p className="max-w-sm text-xs leading-relaxed text-slate-500">{description}</p>
    )}
    {action && <div className="mt-2">{action}</div>}
  </div>
);

/** Failure state with optional retry — never swallows the cause silently. */
export const ErrorState: React.FC<{
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}> = ({
  title = 'Connection failed',
  description = 'The request could not reach the resQlink backend. Check your network and retry.',
  onRetry,
  className = ''
}) => (
  <div
    className={`flex flex-col items-start gap-3 rounded-2xl border border-alert-500/40 bg-alert-500/5 px-4 py-4 sm:px-5 ${className}`}
    role="alert"
  >
    <div className="flex items-start gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-alert-500/15 text-alert-500">
        <AlertTriangle className="h-4.5 w-4.5" aria-hidden />
      </span>
      <div>
        <p className="text-sm font-bold text-ink-hd">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-slate-400">{description}</p>
      </div>
    </div>
    {onRetry && (
      <Button variant="danger" size="sm" onClick={onRetry} className="self-end">
        <RefreshCw className="h-3.5 w-3.5" aria-hidden />
        Retry
      </Button>
    )}
  </div>
);

/** Permission / hazard warning strip. */
export const Notice: React.FC<{
  tone?: 'warn' | 'info' | 'danger' | 'success';
  title?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}> = ({ tone = 'info', title, children, className = '' }) => {
  const tones = {
    warn: 'border-rwsun-500/40 bg-rwsun-500/10 text-rwsun-400',
    info: 'border-rwblue-500/35 bg-rwblue-500/10 text-rwblue-600',
    danger: 'border-alert-500/40 bg-alert-500/10 text-alert-500',
    success: 'border-emerald-500/35 bg-emerald-500/10 text-emerald-400'
  } as const;

  return (
    <div
      className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-xs leading-relaxed ${tones[tone]} ${className}`}
      role={tone === 'danger' ? 'alert' : 'note'}
    >
      <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <div className="min-w-0">
        {title && <p className="font-bold">{title}</p>}
        {children && (
          <div className={title ? 'mt-0.5 opacity-90' : ''}>{children}</div>
        )}
      </div>
    </div>
  );
};