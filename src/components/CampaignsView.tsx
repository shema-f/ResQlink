import React from 'react';
import { Language } from '../types';
import { EMERGENCY_CONTACTS } from '../data/rwandaData';
import { RNPDoveBadge } from './Logo';
import { ShieldCheck, PhoneCall, HeartHandshake, AlertCircle, Award, CheckCircle } from 'lucide-react';

interface CampaignsViewProps {
  currentLang: Language;
  onCallHotline: (number: string, serviceName: string) => void;
}

export const CampaignsView: React.FC<CampaignsViewProps> = ({ currentLang, onCallHotline }) => {
  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 py-6 space-y-8">
      {/* Hero Banner: TURINDANE Tugereyo Amahoro */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0a1f44] via-[#0d2757] to-[#0a1f44] border-2 border-amber-400/50 shadow-2xl p-6 sm:p-10 text-white">
        {/* Glow */}
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <RNPDoveBadge className="w-9 h-9" />
              <span className="text-xs font-black tracking-widest text-amber-300 uppercase bg-amber-950/80 px-2.5 py-1 rounded-full border border-amber-500/40">
                Official Rwanda National Police Campaign
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
              TURINDANE — Tugereyo Amahoro
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              &quot;Let us protect each other so we all arrive safely.&quot; Rwanda&apos;s premier national road safety movement uniting drivers, motorcyclists, cyclists, and pedestrians.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-500/30">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Zero Fatalities Vision</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 bg-amber-950/60 px-3 py-1.5 rounded-xl border border-amber-500/30">
                <CheckCircle className="w-4 h-4 text-amber-400" />
                <span>Helmets & Seatbelts Compulsory</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-300 bg-cyan-950/60 px-3 py-1.5 rounded-xl border border-cyan-500/30">
                <CheckCircle className="w-4 h-4 text-cyan-400" />
                <span>Pedestrian Zebra Priority</span>
              </div>
            </div>
          </div>

          {/* Graphical Emblem Ribbon */}
          <div className="bg-[#061226] border border-amber-400/40 p-5 rounded-3xl text-center space-y-2 shadow-xl flex-shrink-0 w-full sm:w-auto">
            <div className="text-4xl">🇷🇼</div>
            <div className="text-sm font-black text-amber-300 uppercase tracking-wider">
              Tugereyo Amahoro
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Hotline Impanuka: 113
            </div>
            <button
              onClick={() => onCallHotline('113', 'Traffic Accidents (RNP)')}
              className="w-full py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow"
            >
              Call 113 Traffic Hotline
            </button>
          </div>
        </div>
      </div>

      {/* Campaign 2: Inzoga si iz'abato (From RNP Screenshot) */}
      <div className="bg-gradient-to-r from-red-950/80 via-slate-900 to-slate-900 border border-red-500/40 rounded-3xl p-6 sm:p-8 shadow-xl text-white flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 bg-red-900/60 border border-red-500/50 px-3 py-1 rounded-full text-xs font-black text-red-300 uppercase tracking-wider">
            <span>🔞 Inzoga si iz&apos;abato</span>
            <span className="text-slate-400">•</span>
            <span>Underage Drinking Prevention</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white">
            Zirikana: Guha inzoga abari munsi y&apos;imyaka 18 bihanwa n&apos;itegeko
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 italic max-w-2xl leading-relaxed">
            &quot;Niba urengeje imyaka 18 ukaba unywa inzoga, nywa mu rugero. Ntukanywe ngo utware ikinyabiziga (Don&apos;t drink and drive).&quot;
          </p>

          <div className="text-xs text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Rwanda National Police Enforcement • Road Safety Law No. 55/2011</span>
          </div>
        </div>

        <div className="flex-shrink-0 bg-red-950/40 border border-red-700/60 p-4 rounded-2xl text-center space-y-1">
          <span className="text-3xl font-black text-red-400">18+</span>
          <div className="text-xs font-bold text-slate-200">Legal Drinking Age</div>
          <div className="text-[10px] text-red-300">Violations strictly penalized</div>
        </div>
      </div>

      {/* Official Toll-Free Emergency Directory (From RNP screenshot 4) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-amber-400" />
            <span>Official RNP Emergency Toll-Free Hotline Numbers</span>
          </h2>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
            24/7 Toll-Free Tolls
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {EMERGENCY_CONTACTS.map((c) => (
            <div
              key={c.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 space-y-3 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-amber-300 font-mono">
                    {c.number}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                    {c.category}
                  </span>
                </div>
                <div className="font-bold text-sm text-white mt-1">
                  {currentLang === 'rw' ? c.nameRw : currentLang === 'fr' ? c.nameFr : c.name}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  {c.description}
                </div>
              </div>

              <button
                onClick={() => onCallHotline(c.number, c.name)}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-slate-200 text-xs font-bold transition-all"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call {c.number}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* RNP Headquarters & Public Service Desk (From RNP Screenshot 3) */}
      <div className="bg-[#0a1835] border border-slate-800 rounded-3xl p-6 shadow-2xl text-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <RNPDoveBadge className="w-8 h-8" />
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-wider">
                Rwanda National Police Central Headquarters
              </h3>
              <p className="text-xs text-slate-400">
                Kacyiru, Gasabo District, City of Kigali - Rwanda
              </p>
            </div>
          </div>

          <span className="text-xs font-bold text-slate-300 bg-slate-800 px-3 py-1 rounded-xl">
            P.O. Box 6304 KIGALI - RWANDA
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-slate-400 font-bold block text-[10px] uppercase">
              General Inquiries & HQ
            </span>
            <div className="font-bold text-white text-sm">+250 788 311 155</div>
            <div className="text-[11px] text-cyan-300">info@police.gov.rw</div>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-slate-400 font-bold block text-[10px] uppercase">
              Motor Vehicle Technical Inspection
            </span>
            <div className="font-bold text-amber-300 text-sm">+250 788 311 533</div>
            <div className="text-[11px] text-slate-400">Remera Control Station</div>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-slate-400 font-bold block text-[10px] uppercase">
              Customer Care & Traffic Desk
            </span>
            <div className="font-bold text-white text-sm">+250 788 311 113</div>
            <div className="text-[11px] text-emerald-400">24/7 Operations Desk</div>
          </div>
        </div>
      </div>
    </div>
  );
};
