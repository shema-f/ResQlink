import React from 'react';
import { ResQlinkLogo, RNPDoveBadge } from './Logo';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { PhoneCall, ShieldAlert, CarFront, Flame, Ambulance, Globe, Volume2, ShieldCheck, UserCheck } from 'lucide-react';
import { emergencyAudio } from '../utils/audio';

interface RNPHeaderProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onCallHotline: (number: string, serviceName: string) => void;
  currentUser?: { phoneNumber: string; verified: boolean } | null;
  onOpenAuth?: () => void;
}

export const RNPHeader: React.FC<RNPHeaderProps> = ({
  currentLang,
  onLanguageChange,
  activeTab,
  onTabChange,
  onCallHotline,
  currentUser,
  onOpenAuth
}) => {
  const t = TRANSLATIONS[currentLang];

  return (
    <header className="w-full bg-[#0a1b38] border-b border-slate-800 text-white shadow-xl relative z-30">
      {/* Top Utility Belt */}
      <div className="bg-[#061124] text-xs py-1.5 px-3 sm:px-6 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-4 text-slate-300">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] tracking-wide text-emerald-300">
              RNP Central Dispatch Active • 24/7 National Operations
            </span>
          </div>
          <span className="hidden md:inline text-slate-500">•</span>
          <span className="hidden md:inline text-slate-400 text-[11px]">
            info@police.gov.rw | HQ: +250 788 311 155
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* User Phone / OTP Auth Badge */}
          {onOpenAuth && (
            <button
              onClick={onOpenAuth}
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold border transition-colors ${
                currentUser?.verified
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800 text-cyan-300 border-cyan-500/30 hover:bg-slate-700'
              }`}
            >
              {currentUser?.verified ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{currentUser.phoneNumber} (Verified)</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Verify Phone (+250)</span>
                </>
              )}
            </button>
          )}

          {/* Audio Siren Tester */}
          <button
            onClick={() => emergencyAudio.playPoliceSiren(2.0)}
            title="Test Dispatch Siren Sound"
            className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-400/30 transition-colors"
          >
            <Volume2 className="w-3 h-3" />
            <span className="hidden sm:inline">Siren</span>
          </button>

          {/* Language Switcher */}
          <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-700 rounded-lg p-0.5 text-[11px]">
            <Globe className="w-3 h-3 text-cyan-400 ml-1.5" />
            {(['en', 'rw', 'fr'] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => onLanguageChange(lang)}
                className={`px-2 py-0.5 rounded font-semibold uppercase transition-all ${
                  currentLang === lang
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang === 'en' ? 'EN' : lang === 'rw' ? 'RW' : 'FR'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main RNP Header Banner */}
      <div className="px-3 sm:px-6 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: App Logo + National Presence */}
        <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto justify-between md:justify-start">
          <ResQlinkLogo size="md" showSubtitle={true} />
          
          <div className="h-9 w-px bg-slate-700/60 hidden sm:block" />

          {/* RNP Official Authority Badge */}
          <div className="flex items-center gap-2.5 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800">
            <RNPDoveBadge className="w-8 h-8" />
            <div className="text-left">
              <div className="text-xs font-black tracking-wider text-amber-300 uppercase">
                {t.policeTitle}
              </div>
              <div className="text-[10px] text-slate-300 font-medium tracking-wide">
                {t.motto}
              </div>
            </div>
          </div>
        </div>

        {/* Rapid Toll-Free Quick Dial Bar */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => onCallHotline('112', 'General Emergency (RNP)')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/90 hover:bg-red-500 text-white font-bold text-xs shadow-md shadow-red-900/40 border border-red-400/50 transition-transform active:scale-95 group"
          >
            <ShieldAlert className="w-4 h-4 text-white group-hover:animate-bounce" />
            <span>112</span>
            <span className="hidden lg:inline text-[11px] font-normal opacity-90">Emergency</span>
          </button>

          <button
            onClick={() => onCallHotline('113', 'Traffic Accidents (RNP)')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-900/30 border border-amber-300 transition-transform active:scale-95"
          >
            <CarFront className="w-4 h-4 text-slate-950" />
            <span>113</span>
            <span className="hidden lg:inline text-[11px] font-medium">Traffic</span>
          </button>

          <button
            onClick={() => onCallHotline('912', 'SAMU Ambulance')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-900/30 border border-emerald-400/40 transition-transform active:scale-95"
          >
            <Ambulance className="w-4 h-4 text-white" />
            <span>912</span>
            <span className="hidden lg:inline text-[11px] font-normal opacity-90">Ambulance</span>
          </button>

          <button
            onClick={() => onCallHotline('111', 'Fire & Rescue Brigade')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600/90 hover:bg-orange-500 text-white font-bold text-xs shadow-md shadow-orange-900/30 border border-orange-400/40 transition-transform active:scale-95"
          >
            <Flame className="w-4 h-4 text-white" />
            <span>111</span>
            <span className="hidden lg:inline text-[11px] font-normal opacity-90">Fire</span>
          </button>

          <button
            onClick={() => onCallHotline('3511', 'Abuse by Police Officer')}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700"
          >
            <PhoneCall className="w-3.5 h-3.5 text-cyan-400" />
            <span>3511</span>
          </button>

          <button
            onClick={() => onCallHotline('997', 'Anti Corruption')}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700"
          >
            <PhoneCall className="w-3.5 h-3.5 text-cyan-400" />
            <span>997</span>
          </button>
        </div>
      </div>

      {/* Police Checkerboard (Battenburg) Accent Bar */}
      <div className="w-full h-2.5 flex overflow-hidden opacity-90 select-none">
        {Array.from({ length: 48 }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-full ${i % 2 === 0 ? 'bg-amber-400' : 'bg-[#0f2756]'}`}
          />
        ))}
      </div>

      {/* Navigation Bar */}
      <nav className="bg-[#0b1b36] border-t border-slate-800 px-3 sm:px-6 flex items-center justify-between overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1 py-1.5">
          <button
            onClick={() => onTabChange('citizen')}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'citizen'
                ? 'bg-red-600 text-white shadow-md shadow-red-950/60 ring-2 ring-red-400/50'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-300 animate-ping" />
            {t.citizenSos}
          </button>

          <button
            onClick={() => onTabChange('command')}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'command'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950/60 ring-2 ring-cyan-400/50'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-300" />
            {t.commandDashboard}
          </button>

          <button
            onClick={() => onTabChange('responder')}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'responder'
                ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-300'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            {t.responderPortal}
          </button>

          <button
            onClick={() => onTabChange('hazards')}
            className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'hazards'
                ? 'bg-slate-700 text-amber-300'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            {t.roadSafetyHazards}
          </button>

          <button
            onClick={() => onTabChange('campaigns')}
            className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'campaigns'
                ? 'bg-slate-700 text-amber-300'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            {t.campaigns}
          </button>
        </div>

        {/* Blueprint & Architecture Guide Button */}
        <button
          onClick={() => onTabChange('blueprint')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors my-1 ${
            activeTab === 'blueprint'
              ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md'
              : 'bg-slate-800/90 text-amber-400 border-amber-500/30 hover:bg-slate-700'
          }`}
        >
          <span className="font-mono text-[10px] bg-slate-900/60 px-1 py-0.5 rounded text-amber-300">
            SQL + API
          </span>
          <span className="hidden sm:inline">{t.backendBlueprint}</span>
        </button>
      </nav>
    </header>
  );
};
