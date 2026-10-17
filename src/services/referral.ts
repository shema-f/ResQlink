import { Language } from '../types';
import { APP_CONFIG } from '../config/appStore';

/* ------------------------------------------------------------------- types */

export interface ReferralProfile {
  /** e.g. RQ-4K7PM or RQ-ERIC when the citizen personalises it. */
  code: string;
  ownerName: string;
  district: string;
  createdAt: string;
}

export interface ReferralStats {
  code: string;
  ownerName: string;
  district: string;
  invites: number;
  installs: number;
  conversionRate: number;
}

export interface LeaderboardEntry {
  code: string;
  ownerName: string;
  district: string;
  invites: number;
  installs: number;
}

/* --------------------------------------------------------------- constants */

const PROFILE_KEY = 'resqlink_referral_profile';
const INCOMING_KEY = 'resqlink_referral_incoming';

/** Unambiguous alphabet — no O/0, I/1 confusion when read aloud or by SMS. */
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export interface RewardTier {
  invites: number;
  title: string;
  body: string;
}

/**
 * Milestone maths only — the wording lives in the localised content modules
 * (`src/data/inviteContent.ts`) so translators own the copy.
 */
export function tierProgress(invites: number, tiers: readonly RewardTier[]) {
  const safeInvites = Math.max(0, invites);

  // Highest milestone actually earned — null while below the first threshold,
  // so the UI never claims a badge the citizen has not reached.
  let index = -1;
  for (let i = 0; i < tiers.length; i++) {
    if (safeInvites >= tiers[i].invites) index = i;
  }

  const earned = index >= 0 ? tiers[index] : null;
  const next = tiers[index + 1] ?? null;
  const from = earned ? earned.invites : 0;

  const progress = next
    ? Math.max(0, Math.min(100, Math.round(((safeInvites - from) / (next.invites - from)) * 100)))
    : 100;

  const remaining = next ? Math.max(0, next.invites - safeInvites) : 0;

  return { earned, next, index, progress, remaining };
}

/* ------------------------------------------------------------------ profile */

function randomCode(length = 5): string {
  let out = '';
  const buffer = new Uint8Array(length);
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(buffer);
  } else {
    for (let i = 0; i < length; i++) buffer[i] = Math.floor(Math.random() * 256);
  }
  for (let i = 0; i < length; i++) out += ALPHABET[buffer[i] % ALPHABET.length];
  return out;
}

/** Keeps only letters, so codes stay readable in SMS and spoken aloud. */
export function sanitiseName(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 6);
}

export function getProfile(): ReferralProfile {
  const fallback: ReferralProfile = {
    code: `RQ-${randomCode()}`,
    ownerName: '',
    district: 'Kigali',
    createdAt: new Date().toISOString()
  };

  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(fallback));
      return fallback;
    }
    const parsed = JSON.parse(raw) as Partial<ReferralProfile>;
    if (!parsed.code) throw new Error('missing code');
    return {
      code: parsed.code,
      ownerName: parsed.ownerName ?? '',
      district: parsed.district ?? 'Kigali',
      createdAt: parsed.createdAt ?? fallback.createdAt
    };
  } catch {
    return fallback;
  }
}

export function saveProfile(profile: ReferralProfile): ReferralProfile {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // storage unavailable — keep the in-memory value
  }
  return profile;
}

/** Personalise the code into RQ-<NAME>. Letters only, 2–6 characters. */
export function setOwnerName(rawName: string): ReferralProfile {
  const profile = getProfile();
  const name = sanitiseName(rawName);
  const next: ReferralProfile = name.length >= 2
    ? { ...profile, ownerName: name, code: `RQ-${name}` }
    : { ...profile, ownerName: '' };
  return saveProfile(next);
}

/* ------------------------------------------------------- incoming referrals */

/** Reads ?ref=CODE once and remembers it so it survives the install detour. */
export function captureIncomingReferral(): string | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get('ref');
    if (!raw) return getIncomingReferral();

    const code = raw.trim().toUpperCase();
    if (!/^[A-Z0-9-]{3,16}$/.test(code)) return getIncomingReferral();

    // Never let a citizen "refer" themselves.
    if (code === getProfile().code) return null;

    localStorage.setItem(INCOMING_KEY, code);
    return code;
  } catch {
    return null;
  }
}

export function getIncomingReferral(): string | null {
  try {
    return localStorage.getItem(INCOMING_KEY);
  } catch {
    return null;
  }
}

export function clearIncomingReferral(): void {
  try {
    localStorage.removeItem(INCOMING_KEY);
  } catch {
    // ignore
  }
}

/* ------------------------------------------------------------------ sharing */

export function referralLink(code: string): string {
  return `${APP_CONFIG.shareBaseUrl}?ref=${encodeURIComponent(code)}`;
}

const SHARE_COPY: Record<Language, (code: string, link: string) => string> = {
  en: (code, link) =>
    `I use resQlink to stay safe on Rwandan roads. One tap sends your GPS to RNP, SAMU and Fire & Rescue, and it works offline via SMS. Install it free — it might save someone you love:\n${link}\nMy invite code: ${code}`,
  rw: (code, link) =>
    `Nkoresha resQlink kugira ngo nkomeze umutekano mu muhanda. Kanda rimwe, aho uri hoherezwa kuri Polisi, SAMU na Kizimyamuriro — bikora na nta interineti. Kuramo kubuntu:\n${link}\nKode yanjye: ${code}`,
  fr: (code, link) =>
    `J'utilise resQlink pour rester en sécurité sur les routes rwandaises. Un seul tap envoie votre GPS à la Police, au SAMU et aux Pompiers, et ça marche hors ligne par SMS. Téléchargez-le gratuitement :\n${link}\nMon code : ${code}`
};

export function shareMessage(code: string, lang: Language): string {
  const build = SHARE_COPY[lang] ?? SHARE_COPY.en;
  return build(code, referralLink(code));
}

/** WhatsApp click-to-chat with a prefilled message. */
export function whatsappShareUrl(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

/**
 * SMS body link. `sms:?body=` is understood by Android and iOS;
 * desktop browsers simply ignore it.
 */
export function smsShareUrl(message: string): string {
  return `sms:?body=${encodeURIComponent(message)}`;
}

export function telegramShareUrl(message: string, link: string): string {
  return `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(message)}`;
}

export function canUseNativeShare(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
}
