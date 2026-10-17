import React, { useEffect, useMemo, useState } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { apiService } from '../services/api';
import { copyToClipboard } from '../utils/download';
import {
  canUseNativeShare,
  getProfile,
  referralLink,
  sanitiseName,
  setOwnerName,
  shareMessage,
  smsShareUrl,
  tierProgress,
  whatsappShareUrl,
  ReferralProfile,
  ReferralStats
} from '../services/referral';
import { inviteCopy } from '../data/inviteContent';
import {
  Check,
  Copy,
  Info,
  Loader2,
  MessageSquare,
  Pencil,
  Share2,
  Trophy,
  Users,
  X
} from 'lucide-react';

export const WhatsAppGlyph: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

interface InviteShareProps {
  currentLang: Language;
  /** Trims the stats and milestone blocks for inline embeds. */
  compact?: boolean;
  className?: string;
}

export const InviteShare: React.FC<InviteShareProps> = ({
  currentLang,
  compact = false,
  className = ''
}) => {
  const t = TRANSLATIONS[currentLang];
  const inv = inviteCopy(currentLang);

  const [profile, setProfile] = useState<ReferralProfile>(() => getProfile());
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [copied, setCopied] = useState<'code' | 'link' | null>(null);
  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [busyChannel, setBusyChannel] = useState<string | null>(null);

  const link = useMemo(() => referralLink(profile.code), [profile.code]);
  const message = useMemo(() => shareMessage(profile.code, currentLang), [profile.code, currentLang]);
  const tier = useMemo(
    () => tierProgress(stats?.invites ?? 0, inv.milestones.tiers),
    [stats?.invites, inv.milestones.tiers]
  );

  useEffect(() => {
    let cancelled = false;
    setLoadingStats(true);
    apiService.getReferralStats(profile.code).then((data) => {
      if (cancelled) return;
      if (data) setStats(data as ReferralStats);
      setLoadingStats(false);
    });
    return () => {
      cancelled = true;
    };
  }, [profile.code]);

  const refreshStats = async () => {
    const data = await apiService.getReferralStats(profile.code);
    if (data) setStats(data as ReferralStats);
  };

  const flash = (what: 'code' | 'link') => {
    setCopied(what);
    window.setTimeout(() => setCopied(null), 1800);
  };

  /** Records the share with the backend, then refreshes the live counters. */
  const recordShare = async (channel: string) => {
    setBusyChannel(channel);
    await apiService.claimReferral(profile.code, channel);
    await refreshStats();
    setBusyChannel(null);
  };

  const handleShare = (channel: 'WHATSAPP' | 'SMS' | 'NATIVE') => {
    const url =
      channel === 'WHATSAPP'
        ? whatsappShareUrl(message)
        : channel === 'SMS'
          ? smsShareUrl(message)
          : link;

    if (channel === 'NATIVE' && canUseNativeShare()) {
      navigator
        .share({ title: 'resQlink — Rwanda Emergency Response', text: message, url: link })
        .catch(() => undefined);
    } else if (channel === 'SMS') {
      // Hand off to the device SMS composer without unloading the app.
      window.location.href = url;
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
    void recordShare(channel);
  };

  const applyName = () => {
    const next = setOwnerName(nameDraft);
    setProfile(next);
    setEditing(false);
  };

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-white/10 bg-ink-900/70 backdrop-blur-xl ${className}`}
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-rwsun-500/12 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-[-70px] h-48 w-48 rounded-full bg-rwgreen-400/12 blur-3xl" />

      <div className="relative p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-rwsun-400 to-rwsun-600 text-btn-ink">
              <Users className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-[15px] font-extrabold tracking-tight text-ink-hd">{t.invite}</h3>
              <p className="mt-0.5 max-w-sm text-[11.5px] leading-relaxed text-slate-400">
                {t.inviteDesc}
              </p>
            </div>
          </div>
          {!loadingStats && stats && (
            <span className="hidden shrink-0 items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ticker" />{' '}
              {inv.liveLabel}
            </span>
          )}
        </div>

        {/* Code + link */}
        <div className="mt-5 rounded-2xl border border-white/8 bg-ink-950/60 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            {t.yourInviteCode}
          </p>

          {editing ? (
            <div className="mt-2.5 flex items-center gap-2">
              <div className="flex flex-1 items-center gap-1.5 rounded-xl border border-rwblue-400/40 bg-ink-900 px-3 py-2">
                <span className="font-mono text-sm font-bold text-slate-500">RQ-</span>
                <input
                  autoFocus
                  value={nameDraft}
                  onChange={(e) => setNameDraft(sanitiseName(e.target.value))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') applyName();
                    if (e.key === 'Escape') setEditing(false);
                  }}
                  placeholder="ERIC"
                  maxLength={6}
                  className="w-full bg-transparent font-mono text-sm font-black uppercase tracking-wider text-ink-hd placeholder:text-slate-600 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={applyName}
                className="grid h-9 w-9 place-items-center rounded-xl bg-rwblue-500 text-btn-ink transition-transform hover:scale-105"
                aria-label="Save invite code"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 text-slate-400 transition-colors hover:text-ink-hd"
                aria-label="Cancel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="mt-2 flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-2xl font-black tracking-[0.12em] text-ink-hd sm:text-3xl">
                {profile.code}
              </span>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-[10.5px] font-bold text-slate-400 transition-colors hover:text-ink-hd"
              >
                <Pencil className="h-3 w-3" /> {t.personaliseCode}
              </button>
            </div>
          )}

          <div className="mt-3.5 flex items-center gap-2 rounded-xl border border-white/8 bg-ink-950/80 px-3 py-2.5">
            <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-rwblue-300">
              {link}
            </span>
            <button
              type="button"
              onClick={async () => {
                if (await copyToClipboard(link)) flash('link');
              }}
              className="shrink-0 text-slate-400 transition-colors hover:text-ink-hd"
              aria-label={t.copyLink}
            >
              {copied === 'link' ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Share actions */}
        <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => handleShare('WHATSAPP')}
            className="group flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 py-3 text-[13px] font-black text-[#03150b] transition-transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <WhatsAppGlyph className="h-4 w-4" />
            {t.shareWhatsApp}
          </button>

          <button
            type="button"
            onClick={() => handleShare('SMS')}
            className="group flex items-center justify-center gap-2 rounded-2xl bg-rwblue-500 px-4 py-3 text-[13px] font-black text-btn-ink transition-transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <MessageSquare className="h-4 w-4" />
            {t.shareSms}
          </button>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={async () => {
              if (await copyToClipboard(profile.code)) flash('code');
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[11.5px] font-bold text-slate-300 transition-colors hover:border-rwblue-400/40 hover:text-ink-hd"
          >
            {copied === 'code' ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" /> {profile.code}
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" /> {t.copyCode}
              </>
            )}
          </button>

          {canUseNativeShare() && (
            <button
              type="button"
              onClick={() => handleShare('NATIVE')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[11.5px] font-bold text-slate-300 transition-colors hover:border-rwblue-400/40 hover:text-ink-hd"
            >
              <Share2 className="h-3.5 w-3.5" /> {t.shareMore}
            </button>
          )}

          {busyChannel && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> {inv.recordingLabel}
            </span>
          )}
        </div>

        {/* Stats + milestone */}
        {!compact && (
          <>
            <div className="mt-5 grid grid-cols-3 gap-2.5">
              {[
                { label: t.invitesSent, value: loadingStats ? '—' : (stats?.invites ?? 0) },
                { label: t.installsConfirmed, value: loadingStats ? '—' : (stats?.installs ?? 0) },
                {
                  label: t.conversionRate,
                  value: loadingStats ? '—' : `${stats?.conversionRate ?? 0}%`
                }
              ].map((cell) => (
                <div
                  key={cell.label}
                  className="rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-3 text-center"
                >
                  <p className="text-xl font-black tracking-tight text-ink-hd">{cell.value}</p>
                  <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {cell.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-[12px] font-extrabold text-ink-hd">
                  <Trophy className="h-3.5 w-3.5 shrink-0 text-rwsun-400" />
                  {tier.earned ? tier.earned.title : (tier.next?.title ?? '')}
                </span>
                {tier.next && tier.remaining > 0 && (
                  <span className="shrink-0 text-[10.5px] font-bold text-slate-500">
                    {tier.remaining} {inv.toNextPrefix} {tier.next.title}
                  </span>
                )}
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink-950">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rwsun-400 to-rwblue-400 transition-all duration-700"
                  style={{ width: `${tier.progress}%` }}
                />
              </div>
              <p className="mt-2.5 text-[11px] leading-relaxed text-slate-400">
                {tier.earned ? tier.earned.body : (tier.next?.body ?? '')}
              </p>
            </div>
          </>
        )}

        <p className="mt-4 flex items-start gap-2 text-[10.5px] leading-relaxed text-slate-500">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-600" />
          {t.fairnessNote}
        </p>
      </div>
    </div>
  );
};
