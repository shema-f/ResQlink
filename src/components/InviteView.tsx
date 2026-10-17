import React, { useEffect, useState } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { Reveal } from './Reveal';
import { InviteShare } from './InviteShare';
import { StoreBadgeRow } from './StoreBadges';
import { apiService } from '../services/api';
import type { LeaderboardEntry } from '../services/referral';
import { inviteCopy } from '../data/inviteContent';
import { landingCopy } from '../data/landingContent';
import { APP_STATS } from '../config/appStore';
import {
  Award,
  Check,
  Crown,
  Download,
  Info,
  MapPin,
  Radio,
  Share2,
  ShieldCheck,
  Smartphone,
  Trophy,
  Users
} from 'lucide-react';

interface InviteViewProps {
  currentLang: Language;
  onNavigate: (tab: string) => void;
}

const STEP_ICONS = [Share2, Smartphone, ShieldCheck];
const TIER_ICONS = [Award, Trophy, Trophy, Crown];

export const InviteView: React.FC<InviteViewProps> = ({ currentLang, onNavigate }) => {
  const t = TRANSLATIONS[currentLang];
  const copy = inviteCopy(currentLang);
  const stats = landingCopy(currentLang).stats;

  const [board, setBoard] = useState<LeaderboardEntry[]>([]);
  const [loadingBoard, setLoadingBoard] = useState(true);

  useEffect(() => {
    apiService
      .getReferralLeaderboard()
      .then((data) => setBoard((data as LeaderboardEntry[]) || []))
      .finally(() => setLoadingBoard(false));
  }, []);

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px]">
        <div className="absolute left-[-8%] top-[-140px] h-[440px] w-[440px] rounded-full bg-rwsun-500/14 blur-[130px]" />
        <div className="absolute right-[-6%] top-[40px] h-[400px] w-[400px] rounded-full bg-rwgreen-400/14 blur-[130px]" />
        <div className="absolute inset-0 bg-grid opacity-25" />
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-24 pt-12 sm:px-6">
        {/* ------------------------------------------------------- hero */}
        <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <Reveal>
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-rwsun-400">
                <Users className="h-3.5 w-3.5" /> {t.invite}
              </span>

              <h1 className="mt-5 text-[2.4rem] font-black leading-[1.06] tracking-tight text-ink-hd sm:text-5xl">
                {copy.hero.titleLead}{' '}
                <span className="text-gradient">{copy.hero.titleAccent}</span>
                {copy.hero.titleTail}
              </h1>

              <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-slate-400">
                {copy.hero.body}
              </p>

              <div className="mt-8 space-y-4">
                {copy.steps.map((s, i) => {
                  const Icon = STEP_ICONS[i] ?? Share2;
                  return (
                    <div key={s.title} className="flex items-start gap-3.5">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.05] text-rwblue-300">
                        <Icon className="h-4.5 w-4.5" />
                      </span>
                      <div>
                        <p className="flex items-center gap-2 text-[13.5px] font-extrabold text-ink-hd">
                          <span className="font-mono text-[10.5px] text-slate-500">{`0${i + 1}`}</span>
                          {s.title}
                        </p>
                        <p className="mt-1 max-w-md text-[12.5px] leading-relaxed text-slate-400">
                          {s.body}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('citizen')}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-alert-500 to-alert-600 px-5 py-3 text-sm font-black text-accent-ink shadow-glow-red transition-transform hover:-translate-y-0.5"
                >
                  <Radio className="h-4 w-4 shrink-0" /> {copy.hero.ctaDemo}
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('campaigns')}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/12 px-5 py-3 text-sm font-bold text-slate-300 transition-colors hover:text-ink-hd"
                >
                  <ShieldCheck className="h-4 w-4 shrink-0" /> {copy.hero.ctaCampaigns}
                </button>
              </div>
            </div>
          </Reveal>

          <Reveal delay={110}>
            <InviteShare currentLang={currentLang} className="shadow-lift" />
          </Reveal>
        </div>

        {/* -------------------------------------------------- impact band */}
        <Reveal>
          <div className="mt-16 grid grid-cols-2 gap-3 rounded-3xl border border-white/8 bg-ink-900/50 p-5 backdrop-blur-xl sm:grid-cols-4 sm:p-6">
            {APP_STATS.map((s, i) => (
              <div key={s.value} className="px-2 py-2">
                <p
                  className={`text-2xl font-black tracking-tight sm:text-3xl ${
                    s.accent === 'cyan'
                      ? 'text-rwblue-300'
                      : s.accent === 'amber'
                        ? 'text-rwsun-400'
                        : 'text-rwgreen-300'
                  }`}
                >
                  {s.value}
                </p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {stats[i]?.label ?? s.label}
                </p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* --------------------------------------------------- milestones */}
        <div className="mt-16">
          <Reveal>
            <div className="flex items-start gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.05] text-rwsun-400">
                <Trophy className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[10.5px] font-black uppercase tracking-[0.22em] text-rwsun-400">
                  {copy.milestones.eyebrow}
                </p>
                <h2 className="mt-1.5 text-xl font-black tracking-tight text-ink-hd sm:text-2xl">
                  {copy.milestones.title}
                </h2>
                <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-slate-400">
                  {copy.milestones.body}
                </p>
              </div>
            </div>
          </Reveal>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {copy.milestones.tiers.map((tier, i) => {
              const Icon = TIER_ICONS[i] ?? Trophy;
              return (
                <Reveal key={tier.title} delay={i * 70}>
                  <div className="h-full rounded-3xl border border-white/8 bg-ink-900/60 p-5 backdrop-blur-xl transition-colors hover:border-rwsun-500/30">
                    <div className="flex items-center justify-between">
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/[0.05] text-rwsun-400">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="font-mono text-[11px] font-bold text-slate-500">
                        {tier.invites}{' '}
                        {tier.invites === 1 ? copy.inviteSingular : copy.invitePlural}
                      </span>
                    </div>
                    <p className="mt-4 text-[14px] font-extrabold tracking-tight text-ink-hd">
                      {tier.title}
                    </p>
                    <p className="mt-1.5 text-[12px] leading-relaxed text-slate-400">{tier.body}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>

        {/* --------------------------------------------------- leaderboard */}
        <div className="mt-16">
          <Reveal>
            <div className="flex items-start gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.05] text-rwblue-300">
                <Crown className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[10.5px] font-black uppercase tracking-[0.22em] text-rwblue-300">
                  {copy.board.eyebrow}
                </p>
                <h2 className="mt-1.5 text-xl font-black tracking-tight text-ink-hd sm:text-2xl">
                  {copy.board.title}
                </h2>
              </div>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="mt-8 overflow-hidden rounded-3xl border border-white/8 bg-ink-900/60 backdrop-blur-xl">
              <div className="hidden grid-cols-[48px_1fr_140px_110px_110px] gap-4 border-b border-white/8 px-5 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500 sm:grid">
                <span>{copy.board.colRank}</span>
                <span>{copy.board.colCitizen}</span>
                <span>{copy.board.colDistrict}</span>
                <span className="text-right">{copy.board.colInvites}</span>
                <span className="text-right">{copy.board.colInstalls}</span>
              </div>

              {loadingBoard &&
                Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-14 animate-pulse border-b border-white/5 bg-white/[0.015]"
                  />
                ))}

              {!loadingBoard &&
                board.map((row, i) => (
                  <div
                    key={row.code}
                    className={`grid grid-cols-[36px_1fr_auto] items-center gap-4 px-5 py-3.5 sm:grid-cols-[48px_1fr_140px_110px_110px] ${
                      i % 2 === 0 ? 'bg-white/[0.015]' : ''
                    }`}
                  >
                    <span
                      className={`grid h-7 w-7 place-items-center rounded-lg text-[11px] font-black ${
                        i === 0
                          ? 'bg-rwsun-500 text-btn-ink'
                          : i < 3
                            ? 'bg-white/10 text-ink-hd'
                            : 'bg-white/[0.04] text-slate-500'
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-bold text-ink-hd">
                        {row.ownerName}
                      </span>
                      <span className="block font-mono text-[10.5px] text-slate-500">{row.code}</span>
                    </span>
                    <span className="hidden items-center gap-1.5 text-[12px] text-slate-400 sm:flex">
                      <MapPin className="h-3.5 w-3.5 text-slate-600" />
                      {row.district}
                    </span>
                    <span className="hidden text-right text-[13px] font-bold text-rwblue-300 sm:block">
                      {row.invites}
                    </span>
                    <span className="text-right text-[13px] font-bold text-emerald-400">
                      {row.installs}
                    </span>
                  </div>
                ))}

              {!loadingBoard && board.length === 0 && (
                <p className="px-5 py-8 text-center text-[12.5px] text-slate-500">
                  {copy.board.empty}
                </p>
              )}
            </div>
          </Reveal>

          <Reveal delay={140}>
            <p className="mt-4 flex items-start gap-2 text-[11px] leading-relaxed text-slate-500">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-600" />
              {t.fairnessNote}
            </p>
          </Reveal>
        </div>

        {/* ------------------------------------------------------ final CTA */}
        <Reveal>
          <div className="relative mt-16 overflow-hidden rounded-[2.25rem] border border-white/12 bg-gradient-to-br from-rwgreen-400/20 via-ink-900 to-rwblue-600/20 p-8 text-center sm:p-12">
            <div className="pointer-events-none absolute inset-0 bg-grid opacity-25" />
            <span className="relative mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white/[0.06] text-rwsun-400 ring-1 ring-white/10">
              <Download className="h-5 w-5" />
            </span>
            <h2 className="relative mt-5 text-2xl font-black tracking-tight text-ink-hd sm:text-3xl">
              {copy.final.title}
            </h2>
            <p className="relative mx-auto mt-3 max-w-lg text-[13.5px] leading-relaxed text-slate-300">
              {copy.final.body}
            </p>
            <div className="relative mt-7 flex justify-center">
              <StoreBadgeRow size="lg" lang={currentLang} />
            </div>
            <p className="relative mt-5 flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
              {copy.final.note}
            </p>
          </div>
        </Reveal>
      </div>
    </div>
  );
};
