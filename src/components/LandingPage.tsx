import React, { useState } from 'react';
import { Language } from '../types';
import { Reveal } from './Reveal';
import { StoreBadgeRow, GooglePlayBadge, AppStoreBadge } from './StoreBadges';
import { UweraChat } from './UweraChat';
import { InviteShare } from './InviteShare';
import { APP_CONFIG, APP_STATS } from '../config/appStore';
import { LandingCopy, landingCopy } from '../data/landingContent';
import {
  Ambulance,
  ArrowRight,
  Award,
  BadgeCheck,
  Bell,
  Building2,
  Camera,
  CarFront,
  ChevronDown,
  Compass,
  Flame,
  Gauge,
  Languages,
  MapPin,
  MessageSquare,
  Mic,
  PhoneCall,
  Quote,
  Radio,
  Route,
  ShieldAlert,
  ShieldCheck,
  Share2,
  Smartphone,
  Sparkles,
  Star,
  Timer,
  TrafficCone,
  Users,
  WifiOff,
  Zap
} from 'lucide-react';

interface LandingPageProps {
  currentLang: Language;
  onNavigate: (tab: string) => void;
  onCallHotline: (number: string, serviceName: string) => void;
  onOpenAi: () => void;
}

/* --------------------------------------------------------------------------
   Icons, accents, IDs and names stay here — everything a translator should
   touch lives in `src/data/landingContent.ts`. Arrays are index-aligned with
   the copy arrays and all have identical lengths in every language.
   -------------------------------------------------------------------------- */

const FEATURE_ICONS = [Zap, Sparkles, Compass, WifiOff, Languages, ShieldCheck];
const FEATURE_ACCENTS = [
  'from-alert-500/25 to-alert-500/0 text-alert-400',
  'from-rwblue-500/25 to-rwblue-500/0 text-rwblue-300',
  'from-rwsun-500/25 to-rwsun-500/0 text-rwsun-400',
  'from-emerald-500/25 to-emerald-500/0 text-emerald-400',
  'from-rwgreen-400/25 to-rwgreen-400/0 text-rwgreen-300',
  'from-indigo-500/25 to-indigo-500/0 text-indigo-300'
];

const STEP_ICONS = [Smartphone, ShieldAlert, Ambulance];
const AI_BULLET_ICONS = [MessageSquare, Gauge, Route, Mic];
const AGENCY_BADGE_ICONS = [Bell, TrafficCone, MapPin, Camera];
const INVITE_BULLET_ICONS = [Share2, Award, ShieldCheck];
const COMPLIANCE_ICONS = [ShieldCheck, BadgeCheck, CarFront, Flame, Ambulance];

/** Console rows carry fixed identifiers; only the copy is localised. */
const CONSOLE_IDS = ['RW-2026-00184', 'RW-2026-00183', 'RW-2026-00182'];
const CONSOLE_TONES = [
  'text-alert-400 border-alert-500/40 bg-alert-500/10',
  'text-rwsun-400 border-rwsun-500/40 bg-rwsun-500/10',
  'text-emerald-400 border-emerald-500/40 bg-emerald-500/10'
];

/** Names and avatars are proper nouns — not translated. */
const TESTIMONIAL_PEOPLE = [
  { name: 'Eric M.', avatar: 'EM' },
  { name: 'Insp. Claudine U.', avatar: 'CU' },
  { name: 'Diane I.', avatar: 'DI' }
];

/* ------------------------------------------------------------ phone mockup */

const PhoneMock: React.FC<{ copy: LandingCopy }> = ({ copy }) => {
  const p = copy.phone;
  return (
    <div className="theme-island-dark relative mx-auto w-[272px] sm:w-[300px]">
      {/* device shell */}
      <div className="relative rounded-[2.6rem] border border-white/14 bg-gradient-to-b from-ink-700 to-ink-950 p-[10px] shadow-lift">
        <div className="absolute left-1/2 top-3.5 z-20 h-5 w-24 -translate-x-1/2 rounded-full bg-ink-950/95" />
        <div className="relative overflow-hidden rounded-[2.1rem] border border-white/8 bg-[#040a14]">
          {/* app bar */}
          <div className="flex items-center justify-between border-b border-white/6 bg-ink-900/80 px-4 pb-3 pt-8">
            <div className="flex items-center gap-1.5">
              <span className="grid h-6 w-6 place-items-center rounded-lg bg-gradient-to-br from-rwblue-400 to-rwblue-600 text-[10px] font-black text-btn-ink">
                RQ
              </span>
              <span className="text-[11px] font-extrabold tracking-tight text-ink-hd">resQlink</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-[3px] text-[8px] font-bold uppercase tracking-wider text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ticker" />
                {p.live}
              </span>
            </div>
          </div>

          {/* body */}
          <div className="space-y-4 px-4 py-5">
            <div className="text-center">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
                {p.locationLocked}
              </p>
              <p className="mt-1.5 flex items-center justify-center gap-1 text-[11px] font-bold text-ink-hd">
                <MapPin className="h-3 w-3 shrink-0 text-alert-400" />
                <span className="truncate">{p.locationName}</span>
              </p>
            </div>

            {/* SOS ring */}
            <div className="relative mx-auto grid h-32 w-32 place-items-center">
              <span className="absolute inset-0 rounded-full bg-alert-500/25 animate-pulse-ring" />
              <span className="absolute inset-3 rounded-full border border-alert-400/40" />
              <span className="absolute inset-6 rounded-full bg-gradient-to-b from-alert-400 via-alert-500 to-alert-600 shadow-glow-red" />
              <span className="relative flex flex-col items-center px-2 text-center text-ink-hd">
                <span className="text-lg font-black leading-none tracking-tight">{p.sos}</span>
                <span className="mt-1 text-[7px] font-bold uppercase leading-tight tracking-[0.12em] text-red-100">
                  {p.tapToDispatch}
                </span>
              </span>
            </div>

            {/* dispatch card */}
            <div className="rounded-2xl border border-rwblue-400/25 bg-rwblue-500/10 p-3">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-rwblue-500 text-[11px]">
                  🚔
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[10px] font-bold text-ink-hd">{p.unitName}</p>
                  <p className="truncate text-[9px] font-medium text-rwblue-300">{p.unitStatus}</p>
                </div>
              </div>
              <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-ink-950">
                <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-rwblue-400 to-rwsun-400" />
              </div>
            </div>

            {/* ai hint */}
            <div className="flex items-start gap-2 rounded-2xl border border-rwsun-500/25 bg-rwsun-500/10 p-2.5">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rwsun-400" />
              <p className="text-[9.5px] leading-relaxed text-rwsun-100">{p.aiHint}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------- page */

export const LandingPage: React.FC<LandingPageProps> = ({
  currentLang,
  onNavigate,
  onCallHotline,
  onOpenAi
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const copy = landingCopy(currentLang);

  return (
    <div className="relative overflow-hidden">
      {/* ambient aurora */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[760px]">
        <div className="absolute left-[-10%] top-[-160px] h-[520px] w-[520px] rounded-full bg-rwblue-500/18 blur-[130px]" />
        <div className="absolute right-[-8%] top-[40px] h-[460px] w-[460px] rounded-full bg-rwsun-500/12 blur-[130px]" />
        <div className="absolute left-1/3 top-[280px] h-[380px] w-[380px] rounded-full bg-rwgreen-400/12 blur-[130px]" />
        <div className="absolute inset-0 bg-grid opacity-[0.35]" />
      </div>

      {/* ---------------------------------------------------- announcement */}
      <div className="relative border-b border-white/6 bg-ink-900/60 backdrop-blur-xl">
        <div className="flex overflow-hidden py-2">
          <div className="flex w-max animate-marquee items-center gap-8 pr-8">
            {[...copy.ticker, ...copy.ticker].map((item, i) => (
              <span
                key={`${item}-${i}`}
                className="flex items-center gap-2 whitespace-nowrap text-[10.5px] font-bold uppercase tracking-[0.18em] text-slate-400"
              >
                <span className="h-1 w-1 rounded-full bg-rwsun-400" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------- hero */}
      <section className="relative mx-auto max-w-7xl px-4 pb-16 pt-14 sm:px-6 sm:pt-20">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <Reveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] py-1.5 pl-2 pr-3.5 backdrop-blur-xl">
                <span className="flex shrink-0 items-center gap-1 rounded-full bg-rwsun-500 px-2 py-[3px] text-[9px] font-black uppercase tracking-wider text-btn-ink">
                  <BadgeCheck className="h-3 w-3" /> {copy.hero.badgeNew}
                </span>
                <span className="text-[11px] font-bold tracking-tight text-slate-300">
                  resQlink {APP_CONFIG.version} · {copy.hero.badgeTail}
                </span>
              </div>
            </Reveal>

            <Reveal delay={80}>
              {/* No hard-coded line breaks — longer French and Kinyarwanda
                  headlines must be free to wrap where they need to. */}
              <h1 className="mt-6 text-[2.4rem] font-black leading-[1.06] tracking-tight text-ink-hd sm:text-5xl lg:text-[3.6rem] xl:text-[4.2rem]">
                {copy.hero.titleLead}{' '}
                <span className="text-gradient">{copy.hero.titleAccent}</span>
                <span className="block">{copy.hero.titleTail}</span>
              </h1>
            </Reveal>

            <Reveal delay={140}>
              <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-slate-400 sm:text-base">
                {copy.hero.body}
              </p>
            </Reveal>

            <Reveal delay={200}>
              <div className="mt-8 flex flex-col gap-4">
                <StoreBadgeRow size="lg" lang={currentLang} />
                <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-medium text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Star className="h-3.5 w-3.5 fill-rwsun-400 text-rwsun-400" />
                    <span className="font-bold text-slate-300">{APP_CONFIG.rating}</span> ·{' '}
                    {APP_CONFIG.reviewCount} {copy.hero.ratingsSuffix}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-rwblue-400" />
                    {APP_CONFIG.downloads} {copy.hero.downloadsSuffix}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> {copy.hero.freeForever}
                  </span>
                </p>
              </div>
            </Reveal>

            <Reveal delay={260}>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('citizen')}
                  className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-alert-500 to-alert-600 px-5 py-3 text-sm font-black text-accent-ink shadow-glow-red transition-transform hover:-translate-y-0.5"
                >
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  {copy.hero.ctaDemo}
                  <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                </button>
                <button
                  type="button"
                  onClick={onOpenAi}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/[0.04] px-5 py-3 text-sm font-bold text-slate-200 backdrop-blur-xl transition-colors hover:border-rwblue-400/40 hover:text-ink-hd"
                >
                  <Sparkles className="h-4 w-4 shrink-0 text-rwblue-300" />
                  {copy.hero.ctaAi}
                </button>
              </div>
            </Reveal>
          </div>

          {/* device */}
          <Reveal delay={180}>
            <div className="relative">
              <PhoneMock copy={copy} />

              {/* floating chips */}
              <div className="absolute -left-2 top-16 hidden max-w-[190px] animate-float-slow rounded-2xl border border-white/12 bg-ink-900/85 px-3 py-2.5 backdrop-blur-xl sm:block">
                <p className="flex items-center gap-1.5 text-[10px] font-bold leading-tight text-ink-hd">
                  <Timer className="h-3.5 w-3.5 shrink-0 text-rwblue-300" /> {copy.hero.chipDispatch}
                </p>
                <p className="mt-0.5 text-[9px] font-medium leading-tight text-slate-500">
                  {copy.hero.chipDispatchSub}
                </p>
              </div>

              <div className="absolute -right-2 bottom-20 hidden max-w-[190px] animate-float rounded-2xl border border-white/12 bg-ink-900/85 px-3 py-2.5 backdrop-blur-xl sm:block">
                <p className="flex items-center gap-1.5 text-[10px] font-bold leading-tight text-ink-hd">
                  <Radio className="h-3.5 w-3.5 shrink-0 text-emerald-400" /> {copy.hero.chipSms}
                </p>
                <p className="mt-0.5 font-mono text-[9px] font-medium leading-tight text-rwsun-300">
                  {copy.hero.chipSmsSub}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* --------------------------------------------------------- stats */}
      <section className="relative border-y border-white/6 bg-ink-900/40">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-white/6 px-4 sm:px-6 lg:grid-cols-4 lg:divide-x">
          {APP_STATS.map((s, i) => (
            <Reveal key={s.value} delay={i * 70}>
              <div className="px-2 py-7 lg:px-8">
                <p
                  className={`text-3xl font-black tracking-tight sm:text-4xl ${
                    s.accent === 'cyan'
                      ? 'text-rwblue-300'
                      : s.accent === 'amber'
                        ? 'text-rwsun-400'
                        : 'text-rwgreen-300'
                  }`}
                >
                  {s.value}
                </p>
                <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {copy.stats[i]?.label ?? s.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------ features */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <Reveal>
          <div className="max-w-2xl">
            <span className="text-[11px] font-black uppercase tracking-[0.24em] text-rwblue-300">
              {copy.features.eyebrow}
            </span>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-ink-hd sm:text-4xl">
              {copy.features.title}
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-slate-400">{copy.features.body}</p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {copy.features.items.map((f, i) => {
            const Icon = FEATURE_ICONS[i] ?? Zap;
            const accent = FEATURE_ACCENTS[i] ?? FEATURE_ACCENTS[0];
            return (
              <Reveal key={f.title} delay={i * 60}>
                <div className="aurora-border group h-full rounded-3xl">
                  <div className="relative h-full overflow-hidden rounded-3xl border border-white/8 bg-ink-900/70 p-6 backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1">
                    <div
                      className={`pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br ${accent.split(' ')[0]} ${accent.split(' ')[1]} blur-3xl`}
                    />
                    <div
                      className={`relative grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.05] ${accent.split(' ')[2]}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="relative mt-5 text-base font-extrabold tracking-tight text-ink-hd">
                      {f.title}
                    </h3>
                    <p className="relative mt-2 text-[13px] leading-relaxed text-slate-400">
                      {f.body}
                    </p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------------------ AI */}
      <section className="relative overflow-hidden border-y border-white/6 bg-ink-900/40 py-20">
        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-rwblue-500/10 to-transparent" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
          <Reveal>
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-rwblue-400/30 bg-rwblue-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-rwblue-300">
                <Sparkles className="h-3.5 w-3.5" /> {copy.ai.eyebrow}
              </span>
              <h2 className="mt-5 text-3xl font-black tracking-tight text-ink-hd sm:text-4xl">
                {copy.ai.titleLead}{' '}
                <span className="text-gradient">{copy.ai.titleAccent}</span>
                {copy.ai.titleTail}
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-slate-400">{copy.ai.body}</p>

              <ul className="mt-7 space-y-3.5">
                {copy.ai.bullets.map((text, i) => {
                  const Icon = AI_BULLET_ICONS[i] ?? MessageSquare;
                  return (
                    <li key={text} className="flex items-start gap-3">
                      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-xl border border-rwblue-400/25 bg-rwblue-500/10 text-rwblue-300">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-[13.5px] font-medium leading-relaxed text-slate-300">
                        {text}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={onOpenAi}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rwblue-400 to-rwblue-600 px-5 py-3 text-sm font-black text-btn-ink shadow-glow-cyan transition-transform hover:-translate-y-0.5"
                >
                  <Sparkles className="h-4 w-4 shrink-0" /> {copy.ai.ctaPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('blueprint')}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/12 px-5 py-3 text-sm font-bold text-slate-300 transition-colors hover:text-ink-hd"
                >
                  <ShieldCheck className="h-4 w-4 shrink-0" /> {copy.ai.ctaSecondary}
                </button>
              </div>

              <p className="mt-4 text-[11px] leading-relaxed text-slate-500">{copy.ai.note}</p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="relative">
              <UweraChat
                currentLang={currentLang}
                onCallHotline={onCallHotline}
                compact
                className="shadow-lift"
              />
              <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.5rem] bg-rwblue-500/10 blur-3xl" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* --------------------------------------------------- how it works */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <Reveal>
          <div className="text-center">
            <span className="text-[11px] font-black uppercase tracking-[0.24em] text-rwsun-400">
              {copy.steps.eyebrow}
            </span>
            <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-black tracking-tight text-ink-hd sm:text-4xl">
              {copy.steps.title}
            </h2>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {copy.steps.items.map((s, i) => {
            const Icon = STEP_ICONS[i] ?? Smartphone;
            return (
              <Reveal key={s.title} delay={i * 100}>
                <div className="relative h-full rounded-3xl border border-white/8 bg-ink-900/60 p-7 backdrop-blur-xl">
                  <span className="absolute right-6 top-5 text-4xl font-black tracking-tighter text-ink-hd/6">
                    {`0${i + 1}`}
                  </span>
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-rwblue-400/20 to-rwsun-400/10 text-rwblue-300 ring-1 ring-white/10">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-extrabold tracking-tight text-ink-hd">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-slate-400">{s.body}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------- for agencies */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-ink-800 via-ink-900 to-ink-950 p-7 sm:p-12">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-rwblue-500/15 blur-3xl" />
            <div className="pointer-events-none absolute inset-0 bg-hair opacity-60" />

            <div className="relative grid items-center gap-10 lg:grid-cols-2">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
                  <Building2 className="h-3.5 w-3.5 text-rwblue-300" /> {copy.agencies.eyebrow}
                </span>
                <h2 className="mt-5 text-3xl font-black tracking-tight text-ink-hd sm:text-4xl">
                  {copy.agencies.title}
                </h2>
                <p className="mt-4 text-[15px] leading-relaxed text-slate-400">
                  {copy.agencies.body}
                </p>

                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  {copy.agencies.badges.map((label, i) => {
                    const Icon = AGENCY_BADGE_ICONS[i] ?? Bell;
                    return (
                      <span
                        key={label}
                        className="flex items-center gap-2.5 rounded-2xl border border-white/8 bg-white/[0.03] px-3.5 py-3 text-[12.5px] font-semibold text-slate-300"
                      >
                        <Icon className="h-4 w-4 shrink-0 text-rwsun-400" />
                        {label}
                      </span>
                    );
                  })}
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => onNavigate('command')}
                    className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-btn-ink transition-transform hover:-translate-y-0.5"
                  >
                    {copy.agencies.ctaPrimary} <ArrowRight className="h-4 w-4 shrink-0" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('responder')}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/12 px-5 py-3 text-sm font-bold text-slate-300 transition-colors hover:text-ink-hd"
                  >
                    {copy.agencies.ctaSecondary}
                  </button>
                </div>
              </div>

              {/* mini console */}
              <div className="rounded-3xl border border-white/10 bg-ink-950/80 p-4 backdrop-blur-xl">
                <div className="flex items-center justify-between gap-3 border-b border-white/6 pb-3">
                  <span className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-rwblue-300">
                    <Radio className="h-3.5 w-3.5 shrink-0" /> {copy.agencies.consoleTitle}
                  </span>
                  <span className="shrink-0 font-mono text-[10px] text-slate-500">
                    {copy.agencies.consoleMeta}
                  </span>
                </div>
                <div className="mt-3 space-y-2.5">
                  {copy.agencies.rows.map((row, i) => (
                    <div
                      key={CONSOLE_IDS[i]}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-3.5 py-3"
                    >
                      <div className="min-w-0">
                        <p className="font-mono text-[10px] text-slate-500">{CONSOLE_IDS[i]}</p>
                        <p className="truncate text-[12.5px] font-bold text-ink-hd">{row.type}</p>
                      </div>
                      <span
                        className={`shrink-0 rounded-lg border px-2 py-1 text-[9px] font-black tracking-wide ${CONSOLE_TONES[i]}`}
                      >
                        {row.priority}
                      </span>
                      <span className="shrink-0 text-right text-[11px] font-bold text-slate-300">
                        {row.eta}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-rwblue-400/25 bg-rwblue-500/10 px-3.5 py-3">
                  <span className="flex items-center gap-2 text-[11px] font-bold text-rwblue-200">
                    <Ambulance className="h-3.5 w-3.5 shrink-0" /> {copy.agencies.consoleUnits}
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ticker" />
                    {copy.agencies.consoleSocket}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* --------------------------------------------------- testimonials */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <Reveal>
          <h2 className="text-center text-3xl font-black tracking-tight text-ink-hd sm:text-4xl">
            {copy.testimonials.title}
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {copy.testimonials.items.map((t, i) => {
            const person = TESTIMONIAL_PEOPLE[i] ?? TESTIMONIAL_PEOPLE[0];
            return (
              <Reveal key={person.name} delay={i * 90}>
                <figure className="flex h-full flex-col rounded-3xl border border-white/8 bg-ink-900/60 p-6 backdrop-blur-xl">
                  <Quote className="h-6 w-6 text-rwsun-400/60" />
                  <blockquote className="mt-4 flex-1 text-[13.5px] leading-relaxed text-slate-300">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-3 border-t border-white/6 pt-4">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-rwblue-400/30 to-rwsun-400/20 text-[11px] font-black text-ink-hd ring-1 ring-white/10">
                      {person.avatar}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[12.5px] font-bold text-ink-hd">
                        {person.name}
                      </span>
                      <span className="block truncate text-[11px] text-slate-500">{t.role}</span>
                    </span>
                    <span className="ml-auto flex shrink-0 gap-0.5">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} className="h-3 w-3 fill-rwsun-400 text-rwsun-400" />
                      ))}
                    </span>
                  </figcaption>
                </figure>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* -------------------------------------------------------- referral */}
      <section className="relative overflow-hidden border-y border-white/6 bg-ink-900/40 py-20">
        <div className="pointer-events-none absolute left-0 top-0 h-full w-1/2 bg-gradient-to-r from-rwsun-500/8 to-transparent" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
          <Reveal>
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-rwsun-500/30 bg-rwsun-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-rwsun-400">
                <Users className="h-3.5 w-3.5" /> {copy.invite.eyebrow}
              </span>
              <h2 className="mt-5 text-3xl font-black tracking-tight text-ink-hd sm:text-4xl">
                {copy.invite.titleLead}{' '}
                <span className="text-gradient-warm">{copy.invite.titleAccent}</span>
                {copy.invite.titleTail}
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-slate-400">{copy.invite.body}</p>

              <ul className="mt-7 space-y-3.5">
                {copy.invite.bullets.map((text, i) => {
                  const Icon = INVITE_BULLET_ICONS[i] ?? Share2;
                  return (
                    <li key={text} className="flex items-start gap-3">
                      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-xl border border-rwsun-500/25 bg-rwsun-500/10 text-rwsun-400">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-[13.5px] font-medium leading-relaxed text-slate-300">
                        {text}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <button
                type="button"
                onClick={() => onNavigate('invite')}
                className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rwsun-400 to-rwsun-600 px-5 py-3 text-sm font-black text-btn-ink shadow-glow-amber transition-transform hover:-translate-y-0.5"
              >
                <Users className="h-4 w-4 shrink-0" /> {copy.invite.cta}
              </button>
            </div>
          </Reveal>

          <Reveal delay={110}>
            <div className="relative">
              <InviteShare currentLang={currentLang} className="shadow-lift" />
              <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.5rem] bg-rwsun-500/8 blur-3xl" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------ FAQ */}
      <section className="mx-auto max-w-3xl px-4 pb-20 sm:px-6">
        <Reveal>
          <h2 className="text-center text-3xl font-black tracking-tight text-ink-hd sm:text-4xl">
            {copy.faq.title}
          </h2>
        </Reveal>
        <div className="mt-10 space-y-3">
          {copy.faq.items.map((f, i) => {
            const open = openFaq === i;
            return (
              <Reveal key={f.q} delay={i * 50}>
                <div
                  className={`overflow-hidden rounded-2xl border backdrop-blur-xl transition-colors ${
                    open ? 'border-rwblue-400/30 bg-rwblue-500/[0.07]' : 'border-white/8 bg-ink-900/60'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? null : i)}
                    aria-expanded={open}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="text-[14px] font-bold text-ink-hd">{f.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300 ${
                        open ? 'rotate-180 text-rwblue-300' : ''
                      }`}
                    />
                  </button>
                  <div
                    className="grid transition-all duration-300 ease-out"
                    style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-4 text-[13px] leading-relaxed text-slate-400">{f.a}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------------- download */}
      <section id="download" className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/12 bg-gradient-to-br from-rwblue-600/25 via-ink-900 to-rwsun-600/20 p-8 sm:p-14">
            <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />
            <div className="pointer-events-none absolute -left-20 bottom-[-80px] h-72 w-72 rounded-full bg-rwgreen-400/20 blur-3xl" />

            <div className="relative grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-ink-950/60 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-rwsun-400 ring-1 ring-white/10">
                  <Zap className="h-3.5 w-3.5 shrink-0" /> {copy.download.badge}
                </span>
                <h2 className="mt-5 text-3xl font-black leading-tight tracking-tight text-ink-hd sm:text-5xl">
                  {copy.download.title}
                </h2>
                <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-slate-300">
                  {copy.download.body}
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <GooglePlayBadge size="lg" lang={currentLang} />
                  <AppStoreBadge size="lg" lang={currentLang} />
                </div>

                <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Star className="h-3.5 w-3.5 fill-rwsun-400 text-rwsun-400" /> {APP_CONFIG.rating}{' '}
                    · {APP_CONFIG.reviewCount} {copy.download.reviews}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <PhoneCall className="h-3.5 w-3.5 shrink-0 text-rwblue-300" /> {copy.download.tollFree}
                  </span>
                </p>
              </div>

              {/* scan-to-download card */}
              <div className="mx-auto w-full max-w-xs rounded-3xl border border-white/12 bg-ink-950/70 p-5 text-center backdrop-blur-xl">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  {copy.download.scan}
                </p>
                {/* decorative QR-style matrix */}
                <div className="mx-auto mt-4 grid w-36 grid-cols-9 gap-[3px] rounded-2xl bg-surface-paper p-3">
                  {Array.from({ length: 81 }).map((_, i) => {
                    const row = Math.floor(i / 9);
                    const col = i % 9;
                    const corner =
                      (row < 3 && col < 3) || (row < 3 && col > 5) || (row > 5 && col < 3);
                    const on = corner || (i * 7 + row * 3 + col * 5) % 3 === 0;
                    return (
                      <span
                        key={i}
                        className={`aspect-square rounded-[2px] ${on ? 'bg-btn-ink' : 'bg-transparent'}`}
                      />
                    );
                  })}
                </div>
                <p className="mt-4 text-[11px] font-semibold text-slate-300">
                  {copy.download.platforms}
                </p>
                <p className="mt-1 truncate font-mono text-[10px] text-slate-500">
                  {APP_CONFIG.androidPackage}
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* --------------------------------------------------- compliance */}
      <section className="border-t border-white/6 bg-ink-900/40 py-10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-4 px-4 sm:px-6">
          {copy.compliance.map((label, i) => {
            const Icon = COMPLIANCE_ICONS[i] ?? ShieldCheck;
            return (
              <span
                key={label}
                className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.14em] text-slate-500"
              >
                <Icon className="h-4 w-4 shrink-0 text-slate-600" />
                {label}
              </span>
            );
          })}
        </div>
      </section>
    </div>
  );
};
