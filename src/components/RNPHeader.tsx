import React from 'react';
import { ResQlinkLogo, RNPDoveBadge } from './Logo';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { GooglePlayGlyph, AppleGlyph } from './StoreBadges';
import { prefetchView } from '../routes/lazyViews';
import { emergencyAudio } from '../utils/audio';
import type { Theme } from '../hooks/useTheme';
import {
  Ambulance,
  CarFront,
  Flame,
  Globe,
  Home,
  Moon,
  Newspaper,
  PhoneCall,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Sun,
  UserCheck,
  Users,
  Volume2
} from 'lucide-react';

interface RNPHeaderProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onCallHotline: (number: string, serviceName: string) => void;
  currentUser?: { phoneNumber: string; verified: boolean } | null;
  onOpenAuth?: () => void;
  onOpenAi?: () => void;
  theme?: Theme;
  onToggleTheme?: () => void;
}

const HOTLINES = [
  { number: '112', label: 'Emergency', icon: ShieldAlert, className: 'bg-alert-500/90 hover:bg-alert-400 shadow-glow-red' },
  { number: '113', label: 'Traffic', icon: CarFront, className: 'bg-rwsun-500 hover:bg-rwsun-400 text-btn-ink' },
  { number: '912', label: 'Ambulance', icon: Ambulance, className: 'bg-emerald-600/90 hover:bg-emerald-500' },
  { number: '111', label: 'Fire', icon: Flame, className: 'bg-orange-600/90 hover:bg-orange-500' }
];

export const RNPHeader: React.FC<RNPHeaderProps> = ({
  currentLang,
  onLanguageChange,
  activeTab,
  onTabChange,
  onCallHotline,
  currentUser,
  onOpenAuth,
  onOpenAi,
  theme = 'dark',
  onToggleTheme
}) => {
  const t = TRANSLATIONS[currentLang];

  const tabs = [
    { id: 'home', label: t.home, icon: Home, dot: 'bg-rwblue-300' },
    { id: 'citizen', label: t.citizenSos, icon: ShieldAlert, dot: 'bg-alert-400' },
    { id: 'command', label: t.commandDashboard, icon: Globe, dot: 'bg-rwblue-300' },
    { id: 'responder', label: t.responderPortal, icon: Ambulance, dot: 'bg-rwsun-400' },
    { id: 'hazards', label: t.roadSafetyHazards, icon: CarFront, dot: 'bg-orange-400' },
    { id: 'campaigns', label: t.campaigns, icon: ShieldCheck, dot: 'bg-emerald-400' },
    { id: 'invite', label: t.invite, icon: Users, dot: 'bg-rwsun-400' },
    { id: 'press', label: t.pressKit, icon: Newspaper, dot: 'bg-rwblue-300' }
  ];

  const goToDownload = () => {
    onTabChange('home');
    window.setTimeout(() => {
      document.getElementById('download')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/8 bg-ink-900/80 backdrop-blur-2xl">
      {/* ------------------------------------- honest prototype disclosure */}
      <div
        role="note"
        className="border-b border-amber-400/45 bg-amber-500/15 px-3 py-1.5 text-center sm:px-6"
      >
        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-amber-200 sm:text-[10.5px]">
          Prototype · simulated dispatch data — not connected to real emergency services
          <span className="hidden sm:inline"> · in danger, call </span>
          <span className="sm:hidden"> · call </span>
          <span className="font-mono text-amber-100">112 / 113 / 912 / 111</span>
        </p>
      </div>
      {/* ----------------------------------------------- top utility belt */}
      <div className="border-b border-white/6 bg-ink-950/70 px-3 py-1.5 sm:px-6">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 animate-pulse-ring" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-emerald-300">
                Simulated dispatch feed · demo data
              </span>
            </div>
            <span className="hidden text-[10.5px] font-medium text-slate-500 lg:inline">
              Ferrivox engineering prototype · not affiliated with RNP
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenAuth && (
              <button
                onClick={onOpenAuth}
                className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[10.5px] font-bold transition-colors ${
                  currentUser?.verified
                    ? 'border-emerald-500/40 bg-emerald-950/60 text-emerald-300'
                    : 'border-rwblue-400/30 bg-white/[0.04] text-rwblue-300 hover:bg-white/[0.08]'
                }`}
              >
                {currentUser?.verified ? (
                  <>
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>{currentUser.phoneNumber}</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="h-3.5 w-3.5" />
                    <span>Verify +250</span>
                  </>
                )}
              </button>
            )}

            {onOpenAi && (
              <button
                onClick={onOpenAi}
                className="flex items-center gap-1.5 rounded-lg border border-rwblue-400/30 bg-rwblue-500/10 px-2.5 py-1 text-[10.5px] font-bold text-rwblue-300 transition-colors hover:bg-rwblue-500/20"
              >
                <Sparkles className="h-3 w-3" />
                <span className="hidden sm:inline">{t.askUwera}</span>
                <span className="sm:hidden">AI</span>
              </button>
            )}

            <button
              onClick={() => emergencyAudio.playPoliceSiren(2.0)}
              title="Test dispatch siren"
              className="flex items-center gap-1 rounded-lg border border-rwsun-400/30 bg-white/[0.04] px-2 py-1 text-[10.5px] font-bold text-rwsun-300 transition-colors hover:bg-white/[0.08]"
            >
              <Volume2 className="h-3 w-3" />
              <span className="hidden sm:inline">Siren</span>
            </button>

            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                className="flex items-center gap-1 rounded-lg border border-rwblue-400/30 bg-white/[0.04] px-2 py-1 text-[10.5px] font-bold text-rwblue-300 transition-colors hover:bg-white/[0.08]"
              >
                {theme === 'dark' ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
                <span className="hidden md:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
              </button>
            )}

            <div className="flex items-center gap-0.5 rounded-lg border border-white/10 bg-ink-900/80 p-0.5">
              <Globe className="ml-1.5 h-3 w-3 text-rwblue-400" />
              {(['en', 'rw', 'fr'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => onLanguageChange(lang)}
                  className={`rounded-md px-2 py-0.5 text-[10.5px] font-bold uppercase transition-all ${
                    currentLang === lang
                      ? 'bg-rwsun-500 text-btn-ink'
                      : 'text-slate-400 hover:text-ink-hd'
                  }`}
                >
                  {lang === 'en' ? 'EN' : lang === 'rw' ? 'RW' : 'FR'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------- main banner */}
      <div className="mx-auto flex max-w-[1500px] flex-col items-center justify-between gap-4 px-3 py-3.5 sm:px-6 md:flex-row">
        <div className="flex w-full items-center justify-between gap-3 md:w-auto md:justify-start md:gap-4">
          <button onClick={() => onTabChange('home')} className="shrink-0">
            <ResQlinkLogo size="md" showSubtitle={true} />
          </button>

          <div className="hidden h-10 w-px bg-white/10 sm:block" />

          <div className="hidden items-center gap-2.5 rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-1.5 sm:flex">
            <RNPDoveBadge className="w-8 h-8" />
            <div className="text-left">
              <div className="text-[11px] font-black uppercase tracking-[0.12em] text-rwsun-400">
                {t.policeTitle}
              </div>
              <div className="text-[10px] font-medium tracking-wide text-slate-400">{t.motto}</div>
            </div>
          </div>
        </div>

        <div className="flex w-full items-center gap-2 overflow-x-auto pb-1 no-scrollbar md:w-auto md:pb-0">
          {HOTLINES.map((h) => (
            <button
              key={h.number}
              onClick={() => onCallHotline(h.number, h.label)}
              className={`flex shrink-0 items-center gap-1.5 rounded-xl border border-white/12 px-3 py-2 text-xs font-black text-ink-hd shadow-lg transition-transform active:scale-95 ${h.className}`}
            >
              <h.icon className="h-4 w-4" />
              <span>{h.number}</span>
              <span className="hidden text-[10.5px] font-semibold opacity-85 lg:inline">{h.label}</span>
            </button>
          ))}

          <button
            onClick={() => onCallHotline('3511', 'Abuse by Police Officer')}
            className="hidden shrink-0 items-center gap-1 rounded-xl border border-white/10 bg-white/[0.04] px-2.5 py-2 text-xs font-semibold text-slate-300 transition-colors hover:text-ink-hd sm:flex"
          >
            <PhoneCall className="h-3.5 w-3.5 text-rwblue-300" />
            <span>3511</span>
          </button>

          {/* Get the app CTA */}
          <button
            onClick={goToDownload}
            className="group flex shrink-0 items-center gap-2 rounded-xl border border-rwblue-400/40 bg-gradient-to-r from-rwblue-500/20 to-rwsun-500/15 px-3 py-2 text-xs font-black text-ink-hd transition-transform hover:-translate-y-0.5"
          >
            <GooglePlayGlyph className="h-4 w-4" />
            <AppleGlyph className="h-3.5 w-3.5 text-ink-hd" />
            <span className="hidden sm:inline">{t.getTheApp}</span>
            <span className="sm:hidden">App</span>
          </button>
        </div>
      </div>

      {/* --------------------------------------------- battenburg accent */}
      <div className="flex h-1 w-full overflow-hidden opacity-70 select-none">
        {Array.from({ length: 48 }).map((_, i) => (
          <div
            key={i}
            className={`h-full flex-1 ${i % 2 === 0 ? 'bg-rwsun-500' : 'bg-rwblue-700'}`}
          />
        ))}
      </div>

      {/* ------------------------------------------------------ navigation */}
      <nav className="border-t border-white/6 bg-ink-950/50">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3 px-3 sm:px-6">
          <div className="flex items-center gap-1 overflow-x-auto py-2 no-scrollbar">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  onMouseEnter={() => prefetchView(tab.id)}
                  onFocus={() => prefetchView(tab.id)}
                  className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all sm:text-[13px] ${
                    active
                      ? 'bg-surface-paper text-btn-ink shadow-lg'
                      : 'text-slate-400 hover:bg-white/[0.06] hover:text-ink-hd'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${tab.dot} ${
                      active ? 'opacity-100' : 'opacity-60'
                    }`}
                  />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => onTabChange('blueprint')}
            className={`my-2 hidden shrink-0 items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-bold transition-colors lg:flex ${
              activeTab === 'blueprint'
                ? 'border-rwsun-400/50 bg-rwsun-500 text-btn-ink'
                : 'border-white/10 bg-white/[0.04] text-slate-300 hover:text-ink-hd'
            }`}
          >
            <span className="rounded bg-ink-950/50 px-1 py-0.5 font-mono text-[10px] text-rwsun-300">
              SQL + API
            </span>
            <span>{t.backendBlueprint}</span>
          </button>
        </div>
      </nav>
    </header>
  );
};
