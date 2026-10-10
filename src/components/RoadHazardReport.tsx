import React, { useState } from 'react';
import { RoadHazard, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { INITIAL_HAZARDS } from '../data/rwandaData';
import { AlertTriangle, MapPin, Send, CheckCircle2, ShieldCheck } from 'lucide-react';

interface RoadHazardReportProps {
  currentLang: Language;
}

export const RoadHazardReport: React.FC<RoadHazardReportProps> = ({ currentLang }) => {
  const t = TRANSLATIONS[currentLang];
  const [hazards, setHazards] = useState<RoadHazard[]>(INITIAL_HAZARDS);
  const [hazardType, setHazardType] = useState<RoadHazard['hazardType']>('POTHOLE');
  const [district, setDistrict] = useState<string>('Gasabo');
  const [locationText, setLocationText] = useState<string>('');
  const [severity, setSeverity] = useState<RoadHazard['severity']>('DANGEROUS');
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationText.trim()) return;

    const newH: RoadHazard = {
      id: `haz-${Date.now()}`,
      hazardType,
      district,
      locationText,
      severity,
      reportedAt: new Date().toISOString(),
      status: 'PENDING_INVESTIGATION'
    };

    setHazards([newH, ...hazards]);
    setLocationText('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3500);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* Campaign Banner Header */}
      <div className="bg-gradient-to-r from-[#0c224a] via-[#102d61] to-[#0c224a] border border-amber-400/40 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 text-white">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40">
              Gerayo Amahoro • Road Safety Intelligence
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Report Road Infrastructure Danger
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Help the Rwanda National Police & RTDA (Rwanda Transport Development Agency) locate road defects, fallen trees, landslides, or traffic light failures before accidents happen.
          </p>
        </div>

        <div className="flex-shrink-0 bg-slate-900/80 p-3 rounded-2xl border border-slate-700 text-center">
          <span className="text-2xl">⚠️</span>
          <div className="text-xs font-bold text-amber-300 mt-1">Prevent Accidents</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Column (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl text-white space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Submit Hazard Notice</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                Hazard Type
              </label>
              <select
                value={hazardType}
                onChange={(e) => setHazardType(e.target.value as RoadHazard['hazardType'])}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
              >
                <option value="POTHOLE">Dangerous Pothole</option>
                <option value="BROKEN_LIGHT">Defective Traffic Light</option>
                <option value="LANDSLIDE">Landslide / Rocks on Road</option>
                <option value="FALLEN_TREE">Fallen Tree / Power Line</option>
                <option value="FLOODING">Severe Road Flooding</option>
                <option value="OIL_SPILL">Oil / Fuel Spill on Asphalt</option>
                <option value="DAMAGED_BRIDGE">Bridge or Guardrail Damage</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                District in Rwanda
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
              >
                <option value="Gasabo">Gasabo (Kigali)</option>
                <option value="Nyarugenge">Nyarugenge (Kigali)</option>
                <option value="Kicukiro">Kicukiro (Kigali)</option>
                <option value="Musanze">Musanze (Northern)</option>
                <option value="Rubavu">Rubavu (Western)</option>
                <option value="Huye">Huye (Southern)</option>
                <option value="Rwamagana">Rwamagana (Eastern)</option>
                <option value="Bugesera">Bugesera (Eastern)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                Exact Road / Landmark
              </label>
              <input
                type="text"
                required
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
                placeholder="e.g. KG 11 Ave near Airtel Rwanda head office"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                Urgency Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['DANGEROUS', 'MODERATE', 'ATTENTION'] as RoadHazard['severity'][]).map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setSeverity(sev)}
                    className={`py-2 rounded-xl text-[11px] font-bold border transition-all ${
                      severity === sev
                        ? 'bg-amber-400 text-slate-950 border-amber-300 shadow'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5 text-slate-950" />
              <span>Transmit Road Safety Notice</span>
            </button>

            {submitted && (
              <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-center text-xs font-bold flex items-center justify-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Notice Logged into RNP Traffic Operations!</span>
              </div>
            )}
          </form>
        </div>

        {/* Existing Hazards Feed (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl text-white space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-300">
              Community Hazards Under Resolution ({hazards.length})
            </h3>
            <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
              Verified by RNP Road Safety
            </span>
          </div>

          <div className="space-y-3">
            {hazards.map((h) => (
              <div
                key={h.id}
                className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 space-y-2 hover:border-slate-600 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {h.hazardType === 'POTHOLE' ? '🕳️' : h.hazardType === 'BROKEN_LIGHT' ? '🚦' : '⚠️'}
                    </span>
                    <span className="font-bold text-xs text-white">
                      {h.hazardType.replace('_', ' ')}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded ${
                      h.severity === 'DANGEROUS'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {h.severity}
                  </span>
                </div>

                <div className="text-xs text-slate-300 flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span>
                    {h.locationText} ({h.district} District)
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-700/60 text-slate-400">
                  <span>Status: <strong className="text-emerald-400">{h.status.replace(/_/g, ' ')}</strong></span>
                  <span className="flex items-center gap-1 text-cyan-300">
                    <ShieldCheck className="w-3 h-3 text-cyan-400" />
                    <span>Dispatched to RTDA crew</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
