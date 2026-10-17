/**
 * Single source of truth for everything the marketing surfaces need:
 * store listings, social proof and headline stats.
 *
 * Swap the store URLs here once the listings are live — every CTA on the
 * site reads from this file.
 */
export const APP_CONFIG = {
  name: 'resQlink',
  version: '2.4',
  androidPackage: 'rw.gov.resqlink',
  iosBundleId: 'rw.gov.resqlink.ios',
  playStoreUrl:
    'https://play.google.com/store/apps/details?id=rw.gov.resqlink',
  appStoreUrl: 'https://apps.apple.com/rw/app/resqlink-emergency-id6440000000',
  /** Deep-link used by the Smart App Banner on iOS. */
  fallbackDownloadUrl: 'https://resqlink.rw/download',
  /** Base URL that citizen referral links are built from. */
  shareBaseUrl: 'https://resqlink.rw/join',
  rating: 4.9,
  reviewCount: '18,400',
  downloads: '260,000+',
  districts: 30
} as const;

export const APP_STATS = [
  { value: '4.2s', label: 'Average alert to dispatch', accent: 'cyan' as const },
  { value: '260K+', label: 'Citizens protected', accent: 'amber' as const },
  { value: '30', label: 'Districts covered', accent: 'green' as const },
  { value: '99.2%', label: 'GPS accuracy under 10m', accent: 'cyan' as const }
] as const;
