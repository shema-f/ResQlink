import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { APP_CONFIG } from '../config/appStore';

/** Store badge kicker labels are localised; the stores' names are brand marks. */
const kicker = (lang: Language | undefined, key: 'getItOn' | 'downloadOn', fallback: string) =>
  lang ? (TRANSLATIONS[lang]?.[key] ?? fallback) : fallback;

/* ------------------------------------------------------------------ glyphs */

export const GooglePlayGlyph: React.FC<{ className?: string; gradient?: boolean }> = ({
  className = 'w-6 h-6',
  gradient = true
}) => (
  <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="rq-play-a" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#7fd8f5" />
        <stop offset="100%" stopColor="#00a1de" />
      </linearGradient>
      <linearGradient id="rq-play-b" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#00a1de" />
        <stop offset="100%" stopColor="#6fd39c" />
      </linearGradient>
      <linearGradient id="rq-play-c" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fbd63f" />
        <stop offset="100%" stopColor="#c9a801" />
      </linearGradient>
      <linearGradient id="rq-play-d" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6fd39c" />
        <stop offset="100%" stopColor="#20603d" />
      </linearGradient>
    </defs>
    <path
      d="M1.03 1.27l6.553 6.05 3.044-2.81L3.333.215C2.39-.341 1.231.24 1.03 1.27"
      fill={gradient ? 'url(#rq-play-a)' : 'currentColor'}
    />
    <path
      d="M1 13.396V2.603L6.846 8z"
      fill={gradient ? 'url(#rq-play-b)' : 'currentColor'}
    />
    <path
      d="M14.222 9.374c1.037-.61 1.037-2.137 0-2.748L11.528 5.04 8.32 8l3.207 2.96z"
      fill={gradient ? 'url(#rq-play-c)' : 'currentColor'}
    />
    <path
      d="M10.627 11.49L7.583 8.68 1.03 14.73c.201 1.029 1.36 1.61 2.303 1.055z"
      fill={gradient ? 'url(#rq-play-d)' : 'currentColor'}
    />
  </svg>
);

export const AppleGlyph: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 384 512" className={className} aria-hidden="true" fill="currentColor">
    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
  </svg>
);

/* ------------------------------------------------------------------ badges */

type Size = 'sm' | 'md' | 'lg';

const SIZES: Record<Size, { pill: string; label: string; title: string; glyph: string }> = {
  sm: {
    pill: 'px-3 py-2 gap-2 rounded-xl',
    label: 'text-[8px] tracking-[0.16em]',
    title: 'text-[11px]',
    glyph: 'w-4 h-4'
  },
  md: {
    pill: 'px-4 py-2.5 gap-3 rounded-2xl',
    label: 'text-[9px] tracking-[0.18em]',
    title: 'text-sm',
    glyph: 'w-6 h-6'
  },
  lg: {
    pill: 'px-5 py-3.5 gap-3.5 rounded-2xl',
    label: 'text-[10px] tracking-[0.2em]',
    title: 'text-base',
    glyph: 'w-7 h-7'
  }
};

interface BadgeProps {
  size?: Size;
  className?: string;
  /** Full-width block button instead of auto width. */
  block?: boolean;
  /** Localises the "Get it on" / "Download on" kicker. Defaults to English. */
  lang?: Language;
}

const badgeShell =
  'group relative inline-flex items-center overflow-hidden border border-white/12 ' +
  'bg-ink-900/80 backdrop-blur-xl text-ink-hd transition-all duration-300 ' +
  'hover:-translate-y-0.5 hover:border-white/25 hover:bg-ink-800/90 ' +
  'hover:shadow-[0_24px_50px_-24px_rgba(0,161,222,0.75)] active:translate-y-0';

const badgeSheen =
  'pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r ' +
  'from-transparent via-white/12 to-transparent transition-transform duration-700 ' +
  'group-hover:translate-x-full';

export const GooglePlayBadge: React.FC<BadgeProps> = ({
  size = 'md',
  className = '',
  block,
  lang
}) => {
  const s = SIZES[size];
  return (
    <a
      href={APP_CONFIG.playStoreUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Get resQlink on Google Play"
      className={`${badgeShell} ${s.pill} ${block ? 'w-full justify-center' : ''} ${className}`}
    >
      <span className={badgeSheen} />
      <GooglePlayGlyph className={`${s.glyph} shrink-0 relative`} />
      <span className="flex flex-col items-start leading-none relative">
        <span className={`${s.label} font-semibold uppercase text-slate-400`}>
          {kicker(lang, 'getItOn', 'Get it on')}
        </span>
        <span className={`${s.title} font-extrabold tracking-tight mt-0.5`}>Google Play</span>
      </span>
    </a>
  );
};

export const AppStoreBadge: React.FC<BadgeProps> = ({
  size = 'md',
  className = '',
  block,
  lang
}) => {
  const s = SIZES[size];
  return (
    <a
      href={APP_CONFIG.appStoreUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Download resQlink on the App Store"
      className={`${badgeShell} ${s.pill} ${block ? 'w-full justify-center' : ''} ${className}`}
    >
      <span className={badgeSheen} />
      <AppleGlyph className={`${s.glyph} shrink-0 relative text-ink-hd`} />
      <span className="flex flex-col items-start leading-none relative">
        <span className={`${s.label} font-semibold uppercase text-slate-400`}>
          {kicker(lang, 'downloadOn', 'Download on')}
        </span>
        <span className={`${s.title} font-extrabold tracking-tight mt-0.5`}>App Store</span>
      </span>
    </a>
  );
};

/** Both badges side by side — the standard marketing pairing. */
export const StoreBadgeRow: React.FC<{
  size?: Size;
  className?: string;
  block?: boolean;
  lang?: Language;
}> = ({ size = 'md', className = '', block, lang }) => (
  <div className={`flex flex-wrap items-center gap-3 ${className}`}>
    <GooglePlayBadge size={size} block={block} lang={lang} />
    <AppStoreBadge size={size} block={block} lang={lang} />
  </div>
);
