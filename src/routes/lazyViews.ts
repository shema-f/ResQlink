import { lazy } from 'react';

/**
 * Code-split view registry.
 *
 * The marketing landing page is the default route and stays eagerly bundled.
 * Everything else — including the Leaflet / Google Maps command centre, the
 * Socket.IO dashboards and the large asset blobs in the press kit — is split
 * into its own chunk and only fetched when it is actually opened.
 */

const loaders = {
  citizen: () => import('../components/CitizenSOS').then((m) => ({ default: m.CitizenSOS })),
  command: () =>
    import('../components/CommandDashboard').then((m) => ({ default: m.CommandDashboard })),
  responder: () => import('../components/ResponderView').then((m) => ({ default: m.ResponderView })),
  hazards: () =>
    import('../components/RoadHazardReport').then((m) => ({ default: m.RoadHazardReport })),
  campaigns: () => import('../components/CampaignsView').then((m) => ({ default: m.CampaignsView })),
  invite: () => import('../components/InviteView').then((m) => ({ default: m.InviteView })),
  press: () => import('../components/PressKit').then((m) => ({ default: m.PressKit })),
  blueprint: () =>
    import('../components/BackendGuideModal').then((m) => ({ default: m.BackendGuideModal }))
};

export type LazyViewId = keyof typeof loaders;

export const LazyViews = {
  citizen: lazy(loaders.citizen),
  command: lazy(loaders.command),
  responder: lazy(loaders.responder),
  hazards: lazy(loaders.hazards),
  campaigns: lazy(loaders.campaigns),
  invite: lazy(loaders.invite),
  press: lazy(loaders.press),
  blueprint: lazy(loaders.blueprint)
};

/** Views that are light enough to warm in the background on first idle. */
const LIGHT_VIEWS: LazyViewId[] = [
  'citizen',
  'responder',
  'hazards',
  'campaigns',
  'invite',
  'press'
];

const warmed = new Set<string>();

/** Fetch a view's chunk without rendering it. Safe to call repeatedly. */
export function prefetchView(id: string): void {
  if (!(id in loaders) || warmed.has(id)) return;
  warmed.add(id);
  loaders[id as LazyViewId]().catch(() => warmed.delete(id));
}

/**
 * Respects Save-Data and 2G connections — resQlink is used on metered rural
 * data, so background warm-up is skipped when the user is data-frugal.
 * Explicit intent (hovering a nav item) always prefetches regardless.
 */
function isDataFrugal(): boolean {
  if (typeof navigator === 'undefined') return false;
  const conn = (navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string };
  }).connection;
  if (!conn) return false;
  if (conn.saveData) return true;
  return conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g';
}

/** Called on nav hover/focus and on first idle so navigation feels instant. */
export function prefetchLightViews(): void {
  if (isDataFrugal()) return;
  LIGHT_VIEWS.forEach(prefetchView);
}

/** requestIdleCallback with a timer fallback for Safari. */
export function onIdle(callback: () => void): () => void {
  const w = window as Window & {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    cancelIdleCallback?: (handle: number) => void;
  };

  if (typeof w.requestIdleCallback === 'function') {
    const handle = w.requestIdleCallback(callback, { timeout: 3000 });
    return () => w.cancelIdleCallback?.(handle);
  }

  const handle = window.setTimeout(callback, 1500);
  return () => window.clearTimeout(handle);
}
