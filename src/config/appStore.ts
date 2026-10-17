/**
 * Single source of truth for everything the marketing surfaces need:
 * store listings, social proof and headline stats.
 *
 * Swap the store URLs here once the listings are live — every CTA on the
 * site reads from this file.
 */
export const APP_CONFIG = {
  name: 'resQlink',
  version: '0.1.0',
  repositoryUrl: 'https://github.com/shema-f/ResQlink',
  apiDocsUrl: 'https://github.com/shema-f/ResQlink#api-surface-selection',
  /** Referral links stay on the deployment currently serving the prototype. */
  sharePath: '/',
  districts: 0
} as const;

export const APP_STATS = [
  { value: 'React', label: 'Accessible web interface', accent: 'cyan' as const },
  { value: 'API', label: 'Express + Socket.IO demo backend', accent: 'amber' as const },
  { value: '3', label: 'Interface languages', accent: 'green' as const },
  { value: 'Demo', label: 'Synthetic data only', accent: 'cyan' as const }
] as const;
