import React, { useMemo, useState } from 'react';
import { RoadHazard, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { INITIAL_HAZARDS } from '../data/rwandaData';
import { Button, Card, EmptyState, HazardBadge, SectionHeader, Tag } from './ui';
import { GerayoAmahoro } from './GerayoAmahoro';
import {
  AlertTriangle,
  MapPin,
  Send,
  CheckCircle2,
  ShieldCheck,
  UserRound,
  Clock,
  Filter,
  Construction
} from 'lucide-react';

interface RoadHazardReportProps {
  currentLang: Language;
}

const fmtWhen = (iso: string) => {
  const then = new Date(iso);
  const diffMs = Date.now() - then.getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  return then.toLocaleDateString([], { day: '2-digit', month: 'short' });
};

const STATUS_LABEL: Record<RoadHazard['status'], string> = {
  PENDING_INVESTIGATION: 'Awaiting verification',
  CREW_ASSIGNED: 'Crew assigned',
  FIXED: 'Fixed'
};

export const RoadHazardReport: React.FC<RoadHazardReportProps> = ({ currentLang }) => {
  const t = TRANSLATIONS[currentLang];
  const [hazards, setHazards] = useState<RoadHazard[]>(INITIAL_HAZARDS);
  const [hazardType, setHazardType] = useState<RoadHazard['hazardType']>('POTHOLE');
  const [district, setDistrict] = useState<string>('Gasabo');
  const [locationText, setLocationText] = useState<string>('');
  const [severity, setSeverity] = useState<RoadHazard['severity']>('DANGEROUS');
  const [submitted, setSubmitted] = useState<boolean>(false);

  // Feed filters
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterDistrict, setFilterDistrict] = useState<string>('ALL');
  const [filterSource, setFilterSource] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

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
      status: 'PENDING_INVESTIGATION',
      source: 'CITIZEN'
    };

    setHazards([newH, ...hazards]);
    setLocationText('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3500);
  };

  const feedDistricts = useMemo(
    () => Array.from(new Set(hazards.map((h) => h.district))).sort(),
    [hazards]
  );

  const filteredHazards = hazards.filter((h) => {
    if (filterSeverity !== 'ALL' && h.severity !== filterSeverity) return false;
    if (filterDistrict !== 'ALL' && h.district !== filterDistrict) return false;
    if (filterStatus !== 'ALL' && h.status !== filterStatus) return false;
    if (filterSource !== 'ALL' && (h.source ?? 'VERIFIED') !== filterSource) return false;
    return true;
  });

  const hasFilters =
    filterSeverity !== 'ALL' ||
    filterDistrict !== 'ALL' ||
    filterSource !== 'ALL' ||
    filterStatus !== 'ALL';

  const clearFilters = () => {
    setFilterSeverity('ALL');
    setFilterDistrict('ALL');
    setFilterSource('ALL');
    setFilterStatus('ALL');
  };

  const selectCls = (active: boolean) =>
    `min-h-8 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition-colors ${
      active
        ? 'border-rwblue-500/50 bg-rwblue-500 text-white'
        : 'border-ink-700 bg-panel text-slate-400 hover:border-rwblue-500/40 hover:text-ink-hd'
    }`;

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* Campaign header */}
      <Card tone="warning">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="space-y-2">
            <Tag tone="warn">Gerayo Amahoro · Road safety intelligence</Tag>
            <h2 className="text-xl sm:text-2xl font-bold text-ink-hd">
              Report road infrastructure danger
            </h2>
            <p className="max-w-xl text-sm text-slate-400">
              Help the Rwanda National Police and RTDA locate road defects, fallen trees, landslides
              or traffic-light failures before an accident happens. Public submissions are marked{' '}
              <strong className="font-semibold text-slate-300">CITIZEN</strong> until an RNP/RTDA
              reviewer marks them <strong className="font-semibold text-emerald-400">VERIFIED</strong>.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3 rounded-xl border border-ink-700 bg-panel px-4 py-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-rwsun-500/15 text-rwsun-400 ring-1 ring-inset ring-rwsun-500/30">
              <Construction className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <div className="text-lg font-bold leading-none text-ink-hd">{hazards.length}</div>
              <div className="text-[11px] text-slate-400">open hazard records</div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Submission form (5 cols) */}
        <Card className="lg:col-span-5 h-fit">
          <SectionHeader
            title="Submit hazard notice"
            icon={<AlertTriangle className="h-3.5 w-3.5 text-rwsun-400" aria-hidden />}
            action={<Tag tone="muted">Public intake</Tag>}
          />

          <form onSubmit={handleSubmit} className="space-y-3 p-4 text-xs sm:p-5">
            <div>
              <label className="block pb-1 text-[11px] font-bold text-slate-400" htmlFor="haz-type">
                Hazard type
              </label>
              <select
                id="haz-type"
                value={hazardType}
                onChange={(e) => setHazardType(e.target.value as RoadHazard['hazardType'])}
                className="w-full rounded-xl border border-ink-700 bg-panel px-3 py-2.5 text-slate-100 focus:border-rwblue-500 focus:outline-none"
              >
                <option value="POTHOLE">Dangerous pothole</option>
                <option value="BROKEN_LIGHT">Defective traffic light</option>
                <option value="LANDSLIDE">Landslide / rocks on road</option>
                <option value="FALLEN_TREE">Fallen tree / power line</option>
                <option value="FLOODING">Severe road flooding</option>
                <option value="OIL_SPILL">Oil / fuel spill on asphalt</option>
                <option value="DAMAGED_BRIDGE">Bridge or guardrail damage</option>
              </select>
            </div>

            <div>
              <label className="block pb-1 text-[11px] font-bold text-slate-400" htmlFor="haz-district">
                District in Rwanda
              </label>
              <select
                id="haz-district"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full rounded-xl border border-ink-700 bg-panel px-3 py-2.5 text-slate-100 focus:border-rwblue-500 focus:outline-none"
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
              <label className="block pb-1 text-[11px] font-bold text-slate-400" htmlFor="haz-loc">
                Exact road / landmark
              </label>
              <input
                id="haz-loc"
                type="text"
                required
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
                placeholder="e.g. KG 11 Ave near Airtel Rwanda head office"
                className="w-full rounded-xl border border-ink-700 bg-panel px-3 py-2.5 text-slate-100 placeholder:text-slate-500 focus:border-rwblue-500 focus:outline-none"
              />
            </div>

            <fieldset>
              <legend className="pb-1 text-[11px] font-bold text-slate-400">Urgency level</legend>
              <div className="grid grid-cols-3 gap-2">
                {(['DANGEROUS', 'MODERATE', 'ATTENTION'] as RoadHazard['severity'][]).map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setSeverity(sev)}
                    aria-pressed={severity === sev}
                    className={`rounded-xl border py-2.5 text-[11px] font-bold transition-colors ${
                      severity === sev
                        ? 'border-rwsun-500/60 bg-rwsun-500 text-btn-ink shadow-sm'
                        : 'border-ink-700 bg-panel text-slate-400 hover:border-rwsun-500/40'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </fieldset>

            <Button type="submit" variant="sun" block size="md">
              <Send className="h-3.5 w-3.5" aria-hidden />
              Transmit road safety notice
            </Button>

            {submitted && (
              <div
                role="status"
                className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2.5 text-center text-xs font-bold text-emerald-500"
              >
                <CheckCircle2 className="h-4 w-4" aria-hidden />
                Notice logged — marked CITIZEN until RNP verification
              </div>
            )}
          </form>
        </Card>

        {/* Feed (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card>
            <SectionHeader
              title={`Hazard feed (${filteredHazards.length}/${hazards.length})`}
              icon={<Filter className="h-3.5 w-3.5" aria-hidden />}
              action={
                hasFilters ? (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-[10.5px] font-bold text-rwblue-600 underline-offset-2 hover:underline"
                  >
                    Clear
                  </button>
                ) : (
                  <Tag tone="info">Live feed</Tag>
                )
              }
            />

            <div className="flex flex-wrap items-center gap-1.5 p-3">
              {['ALL', 'DANGEROUS', 'MODERATE', 'ATTENTION'].map((f) => (
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
              {['ALL', 'VERIFIED', 'CITIZEN'].map((f) => (
                <button
                  key={`src-${f}`}
                  type="button"
                  onClick={() => setFilterSource(f)}
                  aria-pressed={filterSource === f}
                  className={selectCls(filterSource === f)}
                >
                  {f === 'ALL' ? 'Any source' : f === 'VERIFIED' ? 'Verified' : 'Citizen'}
                </button>
              ))}
              <select
                value={filterDistrict}
                onChange={(e) => setFilterDistrict(e.target.value)}
                aria-label="Filter hazards by district"
                className={selectCls(filterDistrict !== 'ALL')}
              >
                <option value="ALL">All districts</option>
                {feedDistricts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                aria-label="Filter hazards by status"
                className={selectCls(filterStatus !== 'ALL')}
              >
                <option value="ALL">Any status</option>
                <option value="PENDING_INVESTIGATION">Awaiting verification</option>
                <option value="CREW_ASSIGNED">Crew assigned</option>
                <option value="FIXED">Fixed</option>
              </select>
            </div>

            <div className="space-y-2.5 px-3 pb-3">
              {filteredHazards.length === 0 ? (
                <EmptyState
                  title="No hazards match these filters"
                  description="Clear the filters, or submit the first hazard notice for this district."
                />
              ) : (
                filteredHazards.map((h) => {
                  const source = h.source ?? 'VERIFIED';
                  return (
                    <article
                      key={h.id}
                      className="rounded-xl border border-ink-700 bg-panel p-4 transition-colors hover:border-rwsun-500/40"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`grid h-8 w-8 place-items-center rounded-lg ring-1 ring-inset ${
                              h.severity === 'DANGEROUS'
                                ? 'bg-alert-500/12 text-alert-500 ring-alert-500/30'
                                : 'bg-rwsun-500/15 text-rwsun-400 ring-rwsun-500/30'
                            }`}
                            aria-hidden
                          >
                            <AlertTriangle className="h-4 w-4" />
                          </span>
                          <span className="text-xs font-bold uppercase tracking-wide text-ink-hd">
                            {h.hazardType.replace(/_/g, ' ')}
                          </span>
                          <HazardBadge severity={h.severity} />
                        </div>

                        <Tag tone={source === 'VERIFIED' ? 'verified' : 'muted'}>
                          {source === 'VERIFIED' ? (
                            <ShieldCheck className="h-3 w-3" aria-hidden />
                          ) : (
                            <UserRound className="h-3 w-3" aria-hidden />
                          )}
                          {source === 'VERIFIED' ? 'Verified report' : 'Citizen submission'}
                        </Tag>
                      </div>

                      <div className="mt-2 flex items-start gap-1.5 text-xs text-slate-300">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rwsun-400" aria-hidden />
                        <span>
                          {h.locationText} <span className="text-slate-500">({h.district} District)</span>
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-ink-700 pt-2 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="h-3 w-3" aria-hidden />
                          Reported {fmtWhen(h.reportedAt)}
                        </span>
                        <span className="font-semibold text-slate-400">
                          Status: <strong className="text-rwblue-600">{STATUS_LABEL[h.status]}</strong>
                        </span>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </Card>

          {/* Gerayo Amahoro education (EN / RW / FR via global switch) */}
          <GerayoAmahoro currentLang={currentLang} />
        </div>
      </div>
    </div>
  );
};