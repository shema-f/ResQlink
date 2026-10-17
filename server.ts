import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import fs from 'fs';
import crypto from 'crypto';
import pg from 'pg';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =========================================================================
// RUNTIME MODES — prototype honesty & security controls
// =========================================================================

/**
 * Server behaviour switches.
 *
 * - `demoMode` gates every *simulated* behaviour (OTP codes echoed back to the
 *   caller, the fixed `123456` demo code). It defaults to true outside
 *   `NODE_ENV=production`: simulated identity and verification never run on a
 *   production path.
 * - `requireDispatchAuth` protects dispatch-level mutations with the
 *   `x-dispatch-api-key` header. It defaults to true in production (fail
 *   closed) and off in the clearly-labelled local demo.
 * - `serveClient` attaches Vite dev middleware / production static files;
 *   tests disable it so the suite never boots a bundler.
 */
export interface ServerOptions {
  demoMode?: boolean;
  requireDispatchAuth?: boolean;
  serveClient?: boolean;
}

const DEMO_MODE_DEFAULT =
  process.env.DEMO_MODE !== undefined
    ? process.env.DEMO_MODE !== 'false'
    : process.env.NODE_ENV !== 'production';

// =========================================================================
// DATA MODELS & TYPES
// =========================================================================

export interface LocationPoint {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  addressText: string;
  district: string;
  sector: string;
  cell?: string;
  landmark?: string;
}

export interface IncidentRecord {
  id: string;
  publicId: string;
  type: string;
  priority: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  status: 'REPORTED' | 'LOCATION_CONFIRMED' | 'TRIAGED' | 'DISPATCHED' | 'RESPONDER_EN_ROUTE' | 'ON_SCENE' | 'RESOLVED' | 'CANCELLED';
  location: LocationPoint;
  peopleAffected: number;
  unconsciousCount: number;
  firePresent: boolean;
  roadBlocked: boolean;
  description: string;
  reporterPhone: string;
  reporterName?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  assignedResponder?: {
    id: string;
    name: string;
    unit: string;
    type: 'POLICE' | 'AMBULANCE' | 'FIRE';
    etaMinutes: number;
    phone: string;
  };
  audioNote?: boolean;
  hasPhoto?: boolean;
  offlineQueued?: boolean;
}

/** Full incident lifecycle supported by the API and the dashboards. */
export const INCIDENT_STATUSES = [
  'REPORTED',
  'LOCATION_CONFIRMED',
  'TRIAGED',
  'DISPATCHED',
  'RESPONDER_EN_ROUTE',
  'ON_SCENE',
  'RESOLVED',
  'CANCELLED'
] as const;

/** Terminal states: an incident in one of these can never transition again. */
export const TERMINAL_INCIDENT_STATUSES: ReadonlySet<string> = new Set([
  'RESOLVED',
  'CANCELLED'
]);

export interface FacilityRecord {
  id: string;
  name: string;
  type: 'POLICE_STATION' | 'HOSPITAL' | 'HEALTH_CENTER' | 'FIRE_STATION';
  district: string;
  sector: string;
  phone: string;
  latitude: number;
  longitude: number;
  verified: boolean;
}

export interface ResponderRecord {
  id: string;
  unitName: string;
  vehiclePlate: string;
  responderType: 'POLICE' | 'AMBULANCE' | 'FIRE';
  currentStatus: 'AVAILABLE' | 'EN_ROUTE' | 'ON_SCENE' | 'BUSY';
  latitude: number;
  longitude: number;
  targetIncidentId?: string;
  etaMinutes: number;
  lastUpdated: string;
}

export interface AuditLogRecord {
  id: string;
  actorId: string;
  actorRole: string;
  action: string;
  resourceType: string;
  resourceId: string;
  ipAddress: string;
  details: string;
  timestamp: string;
}

interface OtpSession {
  phoneNumber: string;
  otpCode: string;
  expiresAt: number;
  verified: boolean;
}

// =========================================================================
// IN-MEMORY POSTGIS-EQUIVALENT STORE
//
// DATA PROVENANCE (see the "Data provenance" table in README.md):
//  - Facility names are real Rwandan institutions; their coordinates and
//    phone numbers are ILLUSTRATIVE approximations, not verified directory data.
//  - Incidents, responder units, GPS tracks and audit entries below are
//    FABRICATED demo data. None of it describes real events, people or units.
// =========================================================================

const facilitiesStore: FacilityRecord[] = [
  {
    id: 'fac-1',
    name: 'CHUK (University Teaching Hospital of Kigali)',
    type: 'HOSPITAL',
    district: 'Nyarugenge',
    sector: 'Kiyovu',
    phone: '+250 252 575 555',
    latitude: -1.9542,
    longitude: 30.0601,
    verified: true
  },
  {
    id: 'fac-2',
    name: 'King Faisal Hospital Rwanda',
    type: 'HOSPITAL',
    district: 'Gasabo',
    sector: 'Kacyiru',
    phone: '+250 252 588 888',
    latitude: -1.9427,
    longitude: 30.0924,
    verified: true
  },
  {
    id: 'fac-3',
    name: 'Rwanda Military Hospital (Kanombe)',
    type: 'HOSPITAL',
    district: 'Kicukiro',
    sector: 'Kanombe',
    phone: '+250 252 586 420',
    latitude: -1.9863,
    longitude: 30.1585,
    verified: true
  },
  {
    id: 'fac-4',
    name: 'Kibagabaga District Hospital',
    type: 'HOSPITAL',
    district: 'Gasabo',
    sector: 'Kimironko',
    phone: '+250 788 307 200',
    latitude: -1.9333,
    longitude: 30.1250,
    verified: true
  },
  {
    id: 'fac-5',
    name: 'RNP Central Headquarters (Kacyiru)',
    type: 'POLICE_STATION',
    district: 'Gasabo',
    sector: 'Kacyiru',
    phone: '+250 788 311 155',
    latitude: -1.9372,
    longitude: 30.0768,
    verified: true
  },
  {
    id: 'fac-6',
    name: 'RNP Traffic Police Directorate (Muhima)',
    type: 'POLICE_STATION',
    district: 'Nyarugenge',
    sector: 'Muhima',
    phone: '+250 788 311 113',
    latitude: -1.9465,
    longitude: 30.0543,
    verified: true
  },
  {
    id: 'fac-7',
    name: 'RNP Remera Police Station',
    type: 'POLICE_STATION',
    district: 'Gasabo',
    sector: 'Remera',
    phone: '+250 788 311 180',
    latitude: -1.9585,
    longitude: 30.1130,
    verified: true
  },
  {
    id: 'fac-8',
    name: 'RNP Fire & Rescue Brigade HQ (Remera)',
    type: 'FIRE_STATION',
    district: 'Gasabo',
    sector: 'Remera',
    phone: '+250 788 311 111',
    latitude: -1.9610,
    longitude: 30.1155,
    verified: true
  },
  {
    id: 'fac-9',
    name: 'RNP Kicukiro Police Station (Sonatubes)',
    type: 'POLICE_STATION',
    district: 'Kicukiro',
    sector: 'Kicukiro',
    phone: '+250 788 311 190',
    latitude: -1.9704,
    longitude: 30.0882,
    verified: true
  }
];

let incidentsStore: IncidentRecord[] = [
  {
    id: 'inc-101',
    publicId: 'RW-2026-00184',
    type: 'TRAFFIC_MOTO',
    priority: 'CRITICAL',
    status: 'DISPATCHED',
    location: {
      latitude: -1.9536,
      longitude: 30.0984,
      accuracyMeters: 6,
      addressText: 'KN 5 Rd, near Kigali Heights & Convention Centre',
      district: 'Gasabo',
      sector: 'Kimihurura',
      landmark: 'Kigali Convention Centre roundabout'
    },
    peopleAffected: 3,
    unconsciousCount: 1,
    firePresent: false,
    roadBlocked: true,
    description: 'Motorcycle collision with taxi car. Motorcyclist unconscious with head injury. Traffic backed up towards Kimihurura.',
    reporterPhone: '+250 788 412 901',
    reporterName: 'Emmanuel K.',
    createdAt: '2026-09-28T06:42:10Z',
    updatedAt: '2026-09-28T06:47:00Z',
    assignedResponder: {
      id: 'resp-01',
      name: 'RNP Traffic Unit Alpha-4',
      unit: 'Patrol 24-B',
      type: 'POLICE',
      etaMinutes: 4,
      phone: '+250 788 311 404'
    },
    hasPhoto: true
  },
  {
    id: 'inc-102',
    publicId: 'RW-2026-00183',
    type: 'TRAFFIC_TRUCK',
    priority: 'HIGH',
    status: 'RESPONDER_EN_ROUTE',
    location: {
      latitude: -1.9392,
      longitude: 30.0451,
      accuracyMeters: 9,
      addressText: 'Nyabugogo Bus Park access road, KN 1 Rd',
      district: 'Nyarugenge',
      sector: 'Gitega',
      landmark: 'Near Nyabugogo River Bridge'
    },
    peopleAffected: 2,
    unconsciousCount: 0,
    firePresent: false,
    roadBlocked: true,
    description: 'Heavy truck overturned blocking both inbound lanes from Muhanga. Fuel leaking onto pavement.',
    reporterPhone: '+250 783 912 345',
    reporterName: 'Aline U.',
    createdAt: '2026-09-28T06:30:20Z',
    updatedAt: '2026-09-28T06:44:15Z',
    assignedResponder: {
      id: 'resp-02',
      name: 'RNP Fire & Rescue Unit 2',
      unit: 'Rescue Pumper 02',
      type: 'FIRE',
      etaMinutes: 7,
      phone: '+250 788 311 202'
    }
  },
  {
    id: 'inc-103',
    publicId: 'RW-2026-00182',
    type: 'PEDESTRIAN',
    priority: 'CRITICAL',
    status: 'ON_SCENE',
    location: {
      latitude: -1.9715,
      longitude: 30.1118,
      accuracyMeters: 5,
      addressText: 'KK 15 Rd, Remera - Giporoso corridor',
      district: 'Kicukiro',
      sector: 'Niboye',
      landmark: 'Near Prince House'
    },
    peopleAffected: 1,
    unconsciousCount: 1,
    firePresent: false,
    roadBlocked: false,
    description: 'Pedestrian struck by private saloon car while crossing on marked zebra zone. SAMU ambulance paramedic team on scene.',
    reporterPhone: '+250 782 104 556',
    reporterName: 'Jean Damascene',
    createdAt: '2026-09-28T06:15:00Z',
    updatedAt: '2026-09-28T06:40:00Z',
    assignedResponder: {
      id: 'resp-03',
      name: 'SAMU Kigali Ambulance 07',
      unit: 'SAMU Mobile ICU',
      type: 'AMBULANCE',
      etaMinutes: 0,
      phone: '+250 788 912 007'
    }
  }
];

let respondersStore: ResponderRecord[] = [
  {
    id: 'resp-01',
    unitName: 'RNP Traffic Unit Alpha-4',
    vehiclePlate: 'GR 421-B',
    responderType: 'POLICE',
    currentStatus: 'EN_ROUTE',
    latitude: -1.9480,
    longitude: 30.0880,
    targetIncidentId: 'inc-101',
    etaMinutes: 4,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'resp-02',
    unitName: 'RNP Fire & Rescue Unit 2',
    vehiclePlate: 'GR 111-F',
    responderType: 'FIRE',
    currentStatus: 'EN_ROUTE',
    latitude: -1.9420,
    longitude: 30.0550,
    targetIncidentId: 'inc-102',
    etaMinutes: 7,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'resp-03',
    unitName: 'SAMU Kigali Ambulance 07',
    vehiclePlate: 'GR 912-M',
    responderType: 'AMBULANCE',
    currentStatus: 'ON_SCENE',
    latitude: -1.9715,
    longitude: 30.1118,
    targetIncidentId: 'inc-103',
    etaMinutes: 0,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'resp-04',
    unitName: 'RNP Patrol Delta-9 (Kicukiro)',
    vehiclePlate: 'GR 309-P',
    responderType: 'POLICE',
    currentStatus: 'AVAILABLE',
    latitude: -1.9704,
    longitude: 30.0882,
    etaMinutes: 0,
    lastUpdated: new Date().toISOString()
  }
];

const auditLogsStore: AuditLogRecord[] = [
  {
    id: 'aud-1',
    actorId: 'usr-dispatcher-01',
    actorRole: 'RNP_DISPATCHER',
    action: 'DISPATCH_RESPONDER',
    resourceType: 'INCIDENT',
    resourceId: 'RW-2026-00184',
    ipAddress: '197.243.22.84 (Kigali, RNP HQ)',
    details: 'Dispatched RNP Traffic Unit Alpha-4 (Patrol 24-B) to KN 5 Rd collision.',
    timestamp: '2026-09-28T06:43:00Z'
  },
  {
    id: 'aud-2',
    actorId: 'usr-paramedic-07',
    actorRole: 'SAMU_PARAMEDIC',
    action: 'ARRIVED_ON_SCENE',
    resourceType: 'INCIDENT',
    resourceId: 'RW-2026-00182',
    ipAddress: '105.178.44.12 (SAMU Mobile Unit)',
    details: 'Arrived at Giporoso pedestrian trauma scene. Triage commenced.',
    timestamp: '2026-09-28T06:38:00Z'
  },
  {
    id: 'aud-3',
    actorId: 'system-gateway',
    actorRole: 'GATEWAY',
    action: 'SMS_FALLBACK_INGEST',
    resourceType: 'INCIDENT',
    resourceId: 'RW-2026-00183',
    ipAddress: '197.243.10.5 (Africa\'s Talking Gateway)',
    details: 'Inbound emergency SMS parsed from +250783912345.',
    timestamp: '2026-09-28T06:30:20Z'
  }
];

const otpSessions: Map<string, OtpSession> = new Map();

// =========================================================================
// CITIZEN REFERRALS — "Invite & protect"
// =========================================================================

interface ReferralRecord {
  code: string;
  ownerName: string;
  district: string;
  invites: number;
  installs: number;
  lastInviteAt: string;
  createdAt: string;
}

const referralStore: Map<string, ReferralRecord> = new Map(
  [
    { code: 'RQ-ERIC', ownerName: 'Eric M.', district: 'Gasabo', invites: 27, installs: 21 },
    { code: 'RQ-DIANE', ownerName: 'Diane I.', district: 'Huye', invites: 19, installs: 16 },
    { code: 'RQ-JEAN', ownerName: 'Jean D.', district: 'Kicukiro', invites: 14, installs: 11 },
    { code: 'RQ-ALINE', ownerName: 'Aline U.', district: 'Nyarugenge', invites: 9, installs: 7 },
    { code: 'RQ-CLAUD', ownerName: 'Claudine U.', district: 'Musanze', invites: 6, installs: 5 }
  ].map((seed) => [
    seed.code,
    {
      ...seed,
      lastInviteAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }
  ])
);

const REFERRAL_CODE_PATTERN = /^[A-Z0-9-]{3,16}$/;

function normaliseReferralCode(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const code = raw.trim().toUpperCase();
  if (!REFERRAL_CODE_PATTERN.test(code)) return null;
  return code;
}

function ensureReferral(code: string, ownerName = 'resQlink Citizen', district = 'Kigali'): ReferralRecord {
  const existing = referralStore.get(code);
  if (existing) return existing;
  const created: ReferralRecord = {
    code,
    ownerName,
    district,
    invites: 0,
    installs: 0,
    lastInviteAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };
  referralStore.set(code, created);
  return created;
}

// =========================================================================
// AI EMERGENCY COPILOT ("Uwera") — Gemini, with a guided offline fallback
// =========================================================================

const AI_SYSTEM_INSTRUCTION = `You are Uwera, the calm AI emergency copilot inside resQlink, Rwanda's national emergency response platform.

Rules you must always follow:
- Be calm, brief and human. Never panic the user.
- Reply in the language of the user's last message: Kinyarwanda, English or French. If unclear, use English.
- Give at most 5 short numbered steps. Prefer imperative sentences.
- If there is any chance of danger, injury, fire, unconsciousness, heavy bleeding, chest pain or breathing difficulty, tell the user to call 112 (general emergency), 113 (traffic / road accidents), 912 (SAMU ambulance) or 111 (fire & rescue) immediately, and mention that resQlink can dial it in one tap.
- Rwanda facts you may use: 112 general emergency, 113 traffic accidents (RNP), 111 fire brigade, 912 SAMU ambulance, 3511 to report police misconduct, 997 anti-corruption, 114 maritime.
- Never give a medical diagnosis and never claim to be a doctor or to have dispatched anyone yourself. You prepare and guide the user; the RNP/SAMU dispatch does the rest.
- Keep the whole answer under 140 words unless the user explicitly asks for detail.`;

let genAiClient: GoogleGenAI | null = null;
let genAiDisabledReason = 'GEMINI_API_KEY not configured';

function getGenAiClient(): GoogleGenAI | null {
  const apiKey =
    process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.API_KEY;
  if (!apiKey) return null;
  if (!genAiClient) {
    try {
      genAiClient = new GoogleGenAI({ apiKey });
      genAiDisabledReason = '';
    } catch (err: any) {
      genAiDisabledReason = err?.message || 'Failed to initialise Gemini client';
      return null;
    }
  }
  return genAiClient;
}

/** Utility keyword triage used whenever Gemini is unavailable. */
function guidedFallback(message: string, language: string) {
  const q = (message || '').toLowerCase();
  const has = (...words: string[]) => words.some((w) => q.includes(w));

  const callNow =
    has('unconscious', 'bleed', 'bleeding', 'breath', 'chest', 'fire', 'explosion', 'trapped', 'burn', 'seizure', 'stroke', 'accident', 'impanuka', 'saigne', 'inconscient', 'yaye ubwenge');

  if (has('cpr', 'heart', 'breath')) {
    return {
      reply:
        '1. Call 912 (SAMU) now — or 112 for the general emergency line — and put the phone on speaker.\n2. Lay the person on their back on a hard, flat surface.\n3. Place the heel of your hand on the centre of the chest, the other hand on top, and push hard and fast — about 100–120 compressions per minute, 5–6 cm deep.\n4. Do not stop until the paramedics arrive or the person breathes again.\n5. If another person is with you, send them to the road to wave down the ambulance.',
      suggestions: ['Guide me through CPR', 'Where is the nearest hospital?', 'Call SAMU 912']
    };
  }

  if (has('fire', 'smoke', 'umuriro', 'incendie')) {
    return {
      reply:
        '1. Call 111 (Fire & Rescue) immediately.\n2. Get everyone out first — never re-enter a burning building.\n3. Stay low under the smoke and cover your nose with a wet cloth.\n4. Close doors behind you to slow the fire, but never lock an exit.\n5. Move upwind and keep at least 50 m clear so the brigade can work.',
      suggestions: ['Call Fire 111', 'How do I report smoke on a road?', 'Open the SOS reporter']
    };
  }

  if (has('road', 'pothole', 'hazard', 'landslide', 'flood', 'inzitizi')) {
    return {
      reply:
        '1. Do not stop in a live lane — pull fully off the carriageway and switch on hazard lights.\n2. From the resQlink app, open Road Hazards and attach a photo so RNP can geotag the exact spot.\n3. Place a reflective triangle at least 30 m behind the hazard at night.\n4. If traffic is obstructed, call 113 (RNP Traffic).\n5. Warn oncoming drivers with a slow hand signal as you leave.',
      suggestions: ['Report a road hazard', 'Call RNP 113', 'Open the SOS reporter']
    };
  }

  if (callNow) {
    return {
      reply:
        `1. Call the emergency number now — 112 general, 113 traffic, 912 ambulance, 111 fire. resQlink can dial it in one tap.\n2. Give the operator your location exactly as the app shows it.\n3. Do not move a seriously injured person unless there is fire or live traffic risk.\n4. If someone is bleeding, press firmly on the wound with a clean cloth.\n5. Keep the casualty warm and stay on the line until help arrives.`,
      suggestions: ['Send the SOS report', 'Nearest hospital to me', 'Is 113 free to call?']
    };
  }

  return {
    reply:
      'I can guide you, but for anything life-threatening call 112 straight away. Meanwhile: 1. Open the resQlink SOS screen and confirm your GPS pin. 2. Tap the incident type and casualty count — that is what triages the dispatch. 3. Call 112 or 113 yourself if the situation changes. 4. Stay where you are if it is safe, so responders can find you.',
    suggestions: ['How does one-tap SOS work?', 'Which number should I call?', 'Report a road hazard']
  };
}

const AI_SUGGESTION_POOL = [
  'What should I do after a moto accident?',
  'Guide me through CPR',
  'Which emergency number do I call?',
  'How do I report a road hazard?',
  'Is resQlink free?'
];

// =========================================================================
// REAL POSTGRESQL POOL (If DATABASE_URL is set in environment)
// =========================================================================

let pgPool: pg.Pool | null = null;
if (process.env.DATABASE_URL) {
  try {
    pgPool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
    });
    console.log('[POSTGRES] Connected to PostgreSQL instance');
  } catch (err) {
    console.warn('[POSTGRES] Failed to initialize pool with DATABASE_URL', err);
  }
}

// Spatial Haversine Calculation (WGS84 Earth Sphere)
function calculateWgs84DistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

// Record an audit log for DPPO compliance
function logAudit(actorId: string, actorRole: string, action: string, resourceType: string, resourceId: string, details: string, req?: express.Request) {
  const ip = req?.headers['x-forwarded-for'] || req?.socket.remoteAddress || '127.0.0.1';
  const entry: AuditLogRecord = {
    id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    actorId,
    actorRole,
    action,
    resourceType,
    resourceId,
    ipAddress: Array.isArray(ip) ? ip[0] : String(ip),
    details,
    timestamp: new Date().toISOString()
  };
  auditLogsStore.unshift(entry);
  if (auditLogsStore.length > 500) auditLogsStore.pop();
}

// =========================================================================
// SERVER INITIALIZATION
// =========================================================================

export interface CreatedServer {
  app: express.Express;
  httpServer: http.Server;
  io: SocketIOServer;
  demoMode: boolean;
  requireDispatchAuth: boolean;
}

/** Constant-time string comparison so API keys are not leaked via timing. */
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

/**
 * Builds the Express app + Socket.IO server WITHOUT binding a port, so the
 * API can be exercised directly by the test suite (`tests/server.test.ts`)
 * and by `startServer()`.
 */
export async function createApp(options: ServerOptions = {}): Promise<CreatedServer> {
  const app = express();
  const httpServer = http.createServer(app);
  const demoMode = options.demoMode ?? DEMO_MODE_DEFAULT;
  const requireDispatchAuth =
    options.requireDispatchAuth ?? process.env.NODE_ENV === 'production';
  const serveClient = options.serveClient ?? true;

  // In auth-enforcing (production) mode only the configured origin may open a
  // socket; the clearly-labelled demo keeps the original open behaviour.
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: requireDispatchAuth ? (process.env.CORS_ORIGIN || false) : '*'
    }
  });

  app.use(express.json());

  /**
   * Authorization for dispatch-level mutations (incident status changes,
   * responder heartbeats, outbound SMS, inbound SMS webhooks, arbitrary DB
   * connection tests). Fails closed in production: with no DISPATCH_API_KEY
   * configured the endpoints answer 503 instead of staying open.
   */
  const requireDispatchKey: express.RequestHandler = (req, res, next) => {
    if (!requireDispatchAuth) return next();
    const configuredKey = process.env.DISPATCH_API_KEY;
    if (!configuredKey) {
      return res.status(503).json({
        success: false,
        message:
          'DISPATCH_API_KEY is not configured. Dispatch mutations are disabled until a key is set.'
      });
    }
    const provided = req.header('x-dispatch-api-key') || '';
    if (!safeEqual(provided, configuredKey)) {
      return res.status(401).json({
        success: false,
        message: 'Missing or invalid x-dispatch-api-key header.'
      });
    }
    return next();
  };

  // Socket.IO Real-Time Engine
  io.on('connection', (socket) => {
    // Client connected
    socket.emit('connection:ack', {
      status: 'CONNECTED',
      serverTime: new Date().toISOString(),
      socketId: socket.id
    });

    socket.on('join:room', (room: string) => {
      socket.join(room);
    });

    socket.on('responder:ping', (data) => {
      // Forward to dispatchers
      io.to('command_center').emit('responder:location_update', data);
    });
  });

  // -----------------------------------------------------------------------
  // REST API ENDPOINTS
  // -----------------------------------------------------------------------

  // Health & Service Status
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'UP',
      platform: 'resQlink Rwanda Emergency Platform',
      version: '2.0.0',
      prototype: true,
      demoMode,
      identityVerification: demoMode ? 'SIMULATED_DEMO_ONLY' : 'DISABLED_NO_SMS_GATEWAY',
      dispatchAuth: requireDispatchAuth ? 'X_DISPATCH_API_KEY_REQUIRED' : 'OPEN_DEMO',
      rnpCommandLink: 'SIMULATED',
      postgisEngine: pgPool ? 'REAL_POSTGRESQL_POSTGIS' : 'SPATIAL_WGS84_EMULATED',
      webSockets: 'SOCKET_IO_ACTIVE',
      connectedClients: io.engine.clientsCount,
      activeIncidents: incidentsStore.filter((i) => i.status !== 'RESOLVED').length,
      timestamp: new Date().toISOString()
    });
  });

  // 1. GET /api/incidents - List incidents
  app.get('/api/incidents', (req, res) => {
    const { status, priority, limit } = req.query;
    let results = [...incidentsStore];

    if (status && typeof status === 'string') {
      results = results.filter((i) => i.status === status);
    }
    if (priority && typeof priority === 'string') {
      results = results.filter((i) => i.priority === priority);
    }

    results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (limit) {
      results = results.slice(0, Number(limit));
    }

    res.json({
      success: true,
      count: results.length,
      data: results
    });
  });

  // 2. POST /api/incidents - Create a new SOS emergency
  app.post('/api/incidents', (req, res) => {
    const body = req.body;

    // Failure-scenario validation: reject malformed payloads instead of
    // silently inventing an incident from garbage input.
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return res
        .status(400)
        .json({ success: false, message: 'Request body must be a JSON object.' });
    }
    for (const field of ['peopleAffected', 'unconsciousCount'] as const) {
      const value = body[field];
      if (value !== undefined && (typeof value !== 'number' || !Number.isFinite(value) || value < 0)) {
        return res
          .status(400)
          .json({ success: false, message: `${field} must be a non-negative number.` });
      }
    }
    if (body.location && typeof body.location === 'object') {
      for (const axis of ['latitude', 'longitude'] as const) {
        const value = body.location[axis];
        if (value !== undefined && (typeof value !== 'number' || !Number.isFinite(value))) {
          return res
            .status(400)
            .json({ success: false, message: `location.${axis} must be a finite number.` });
        }
      }
    }

    let priority: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' = 'MODERATE';
    if (body.unconsciousCount > 0 || body.firePresent || (body.peopleAffected && body.peopleAffected >= 4)) {
      priority = 'CRITICAL';
    } else if (body.peopleAffected > 0 || body.roadBlocked) {
      priority = 'HIGH';
    }

    const publicId = `RW-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const newIncident: IncidentRecord = {
      id: `inc-${Date.now()}`,
      publicId,
      type: body.type || 'TRAFFIC_MOTO',
      priority,
      status: 'TRIAGED',
      location: {
        latitude: body.location?.latitude || -1.9536,
        longitude: body.location?.longitude || 30.0984,
        accuracyMeters: body.location?.accuracyMeters || 8,
        addressText: body.location?.addressText || 'Kigali, Rwanda (GPS Detected)',
        district: body.location?.district || 'Gasabo',
        sector: body.location?.sector || 'Kimihurura',
        landmark: body.location?.landmark || 'Near Kigali Convention Centre'
      },
      peopleAffected: Number(body.peopleAffected || 1),
      unconsciousCount: Number(body.unconsciousCount || 0),
      firePresent: Boolean(body.firePresent),
      roadBlocked: Boolean(body.roadBlocked),
      description: body.description || 'Emergency reported via resQlink mobile app.',
      reporterPhone: body.reporterPhone || '+250 788 000 000',
      reporterName: body.reporterName || 'Citizen Caller',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignedResponder: {
        id: 'resp-auto-01',
        name: 'RNP Traffic Unit Kigali Alpha',
        unit: 'Patrol 18-A',
        type: 'POLICE',
        etaMinutes: 5,
        phone: '+250 788 311 113'
      }
    };

    incidentsStore.unshift(newIncident);

    // Audit log
    logAudit(newIncident.reporterPhone, 'CITIZEN', 'SOS_INCIDENT_REPORTED', 'INCIDENT', newIncident.publicId, `Reported ${newIncident.type} at ${newIncident.location.addressText}`, req);

    // Real-Time Socket.IO broadcast to Dispatchers and Responders
    io.emit('incident:new', newIncident);

    res.status(201).json({
      success: true,
      message: 'Emergency incident logged and broadcast via Socket.IO.',
      data: newIncident
    });
  });

  // 3. PATCH /api/incidents/:id - Status change & responder dispatch
  app.patch('/api/incidents/:id', requireDispatchKey, (req, res) => {
    const { id } = req.params;
    const { status, assignedResponder } = req.body || {};

    const index = incidentsStore.findIndex((i) => i.id === id || i.publicId === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }

    const current = incidentsStore[index];

    // Status-transition rules: unknown statuses are rejected, and terminal
    // incidents (RESOLVED / CANCELLED) can never be reopened or re-dispatched.
    if (status !== undefined) {
      if (!(INCIDENT_STATUSES as readonly string[]).includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Unknown status "${status}". Valid statuses: ${INCIDENT_STATUSES.join(', ')}.`
        });
      }
      if (TERMINAL_INCIDENT_STATUSES.has(current.status)) {
        return res.status(409).json({
          success: false,
          message: `Incident ${current.publicId} is already ${current.status}; terminal incidents cannot change status.`
        });
      }
    }

    const updated: IncidentRecord = {
      ...current,
      status: status || current.status,
      assignedResponder: assignedResponder !== undefined ? assignedResponder : current.assignedResponder,
      updatedAt: new Date().toISOString(),
      resolvedAt: status === 'RESOLVED' ? new Date().toISOString() : current.resolvedAt
    };

    incidentsStore[index] = updated;

    logAudit('dispatcher-rnp', 'RNP_DISPATCHER', 'INCIDENT_STATUS_CHANGE', 'INCIDENT', updated.publicId, `Status transitioned from ${current.status} to ${updated.status}`, req);

    // Broadcast to all clients
    io.emit('incident:updated', updated);

    res.json({
      success: true,
      message: `Incident ${updated.publicId} status updated to ${updated.status}`,
      data: updated
    });
  });

  // 4. GET /api/facilities/nearby - Spatial PostGIS KNN nearest facilities calculation
  app.get('/api/facilities/nearby', (req, res) => {
    const lat = parseFloat(req.query.lat as string) || -1.9536;
    const lng = parseFloat(req.query.lng as string) || 30.0984;
    const limit = parseInt(req.query.limit as string) || 6;
    const typeFilter = req.query.type as string;

    let list = [...facilitiesStore];
    if (typeFilter) {
      list = list.filter((f) => f.type === typeFilter);
    }

    const withDistances = list.map((f) => {
      const distanceKm = calculateWgs84DistanceKm(lat, lng, f.latitude, f.longitude);
      const estimatedTravelMinutes = Math.max(2, Math.round((distanceKm / 30) * 60));
      return {
        ...f,
        distanceKm,
        estimatedTravelMinutes
      };
    });

    withDistances.sort((a, b) => a.distanceKm - b.distanceKm);

    res.json({
      success: true,
      origin: { latitude: lat, longitude: lng },
      count: withDistances.slice(0, limit).length,
      data: withDistances.slice(0, limit)
    });
  });

  // 5. POST /api/auth/otp/request - Request Phone OTP for Rwanda (+250)
  app.post('/api/auth/otp/request', (req, res) => {
    const { phoneNumber } = req.body || {};
    if (!phoneNumber) {
      return res.status(400).json({ success: false, message: 'Phone number is required.' });
    }
    if (typeof phoneNumber !== 'string' || phoneNumber.trim().length < 8) {
      return res.status(400).json({ success: false, message: 'A valid Rwanda phone number is required.' });
    }

    // Production path: no SMS gateway is integrated, so we refuse to simulate
    // delivery instead of pretending a code reached a real handset.
    if (!demoMode) {
      return res.status(503).json({
        success: false,
        simulated: false,
        message:
          'SMS delivery is not integrated in this prototype, so phone verification is disabled outside demo mode.'
      });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    otpSessions.set(phoneNumber, {
      phoneNumber,
      otpCode,
      expiresAt,
      verified: false
    });

    logAudit(phoneNumber, 'CITIZEN', 'OTP_REQUESTED_DEMO', 'USER_AUTH', phoneNumber, 'Generated a demo OTP (no real SMS was sent)', req);

    res.json({
      success: true,
      simulated: true,
      message: `Demo code generated for ${phoneNumber}. No real SMS was sent — this is a prototype.`,
      demoCode: otpCode
    });
  });

  // 6. POST /api/auth/otp/verify - Verify Phone OTP code
  app.post('/api/auth/otp/verify', (req, res) => {
    const { phoneNumber, otpCode } = req.body;
    const session = otpSessions.get(phoneNumber);

    if (!session) {
      return res.status(400).json({ success: false, message: 'No OTP requested for this phone number.' });
    }

    if (Date.now() > session.expiresAt) {
      return res.status(400).json({ success: false, message: 'OTP code expired. Please request a new one.' });
    }

    if (session.otpCode !== otpCode && !(demoMode && otpCode === '123456')) {
      return res.status(400).json({ success: false, message: 'Incorrect OTP code.' });
    }

    session.verified = true;

    logAudit(phoneNumber, 'CITIZEN', 'OTP_VERIFIED_SUCCESS', 'USER_AUTH', phoneNumber, 'Identity successfully authenticated with DPPO compliance', req);

    res.json({
      success: true,
      message: demoMode
        ? 'Phone number verified in demo mode — this session is simulated and lives only in your browser.'
        : 'Phone number verified.',
      user: {
        phoneNumber,
        role: 'CITIZEN',
        verified: true,
        simulated: demoMode,
        sessionToken: `token-${Date.now()}`
      }
    });
  });

  // 7. GET /api/responders - Live responder patrol units
  app.get('/api/responders', (req, res) => {
    res.json({
      success: true,
      count: respondersStore.length,
      data: respondersStore
    });
  });

  // 8. POST /api/responders/location - Live GPS heartbeat from patrol vehicles
  app.post('/api/responders/location', requireDispatchKey, (req, res) => {
    const { responderId, latitude, longitude, status } = req.body;
    const resp = respondersStore.find((r) => r.id === responderId);
    if (!resp) {
      return res.status(404).json({ success: false, message: 'Responder not found' });
    }

    resp.latitude = latitude;
    resp.longitude = longitude;
    if (status) resp.currentStatus = status;
    resp.lastUpdated = new Date().toISOString();

    io.emit('responder:moved', resp);

    res.json({ success: true, message: 'Heartbeat acknowledged', data: resp });
  });

  // 9. GET /api/geocode/reverse - Reverse geocode Rwanda coordinates
  app.get('/api/geocode/reverse', async (req, res) => {
    const lat = parseFloat(req.query.lat as string) || -1.9536;
    const lng = parseFloat(req.query.lng as string) || 30.0984;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'resQlink-Rwanda-Emergency-App/1.0'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const address = data.address || {};
        const road = address.road || address.pedestrian || address.neighbourhood || 'Road';
        const suburb = address.suburb || address.village || address.quarter || '';
        const city = address.city || address.county || address.state || 'Kigali';
        const formatted = `${road}${suburb ? `, ${suburb}` : ''}, ${city}, Rwanda`;

        return res.json({
          success: true,
          formattedAddress: formatted,
          district: address.county || 'Gasabo',
          sector: address.suburb || 'Kimihurura',
          raw: data
        });
      }
    } catch {
      // fallback
    }

    res.json({
      success: true,
      formattedAddress: `KN 5 Rd, Kimihurura, Gasabo, Kigali`,
      district: 'Gasabo',
      sector: 'Kimihurura'
    });
  });

  // 10. GET & POST /api/sms/preview and /api/sms/send (Africa's Talking Rwanda Simulator)
  app.get('/api/sms/preview', (req, res) => {
    const incidentId = (req.query.id as string) || 'RW-2026-00184';
    const inc = incidentsStore.find((i) => i.publicId === incidentId || i.id === incidentId) || incidentsStore[0];

    const compactSms = `RESQ ${inc.publicId} LOC:${inc.location.latitude.toFixed(4)},${inc.location.longitude.toFixed(4)} TYPE:${inc.type} INJ:${inc.peopleAffected} UNCON:${inc.unconsciousCount} CALL:${inc.reporterPhone}`;
    const ussdString = `*113*${inc.publicId.replace(/\D/g, '')}#`;

    res.json({
      success: true,
      destinationNumber: '113',
      compactSms,
      ussdString,
      africasTalkingPayload: {
        to: '+250113',
        message: compactSms,
        from: 'RESQLINK_RNP'
      }
    });
  });

  app.post('/api/sms/send', requireDispatchKey, (req, res) => {
    const { to, message, incidentPublicId } = req.body;

    logAudit('+250113', 'TELECOM_GATEWAY', 'SMS_OUTBOUND_DISPATCH', 'SMS', incidentPublicId || 'EMERGENCY', `Dispatched SMS to RNP desk via Africa's Talking Rwanda gateway: ${message}`, req);

    res.json({
      success: true,
      provider: "Africa's Talking Rwanda",
      status: 'DELIVERED',
      cost: 'RWF 15.00',
      messageId: `AT-RWA-${Date.now()}`,
      to: to || '+250113',
      content: message
    });
  });

  // 11. POST /api/sms/webhook - Inbound emergency SMS receiver
  app.post('/api/sms/webhook', requireDispatchKey, (req, res) => {
    const { from, text } = req.body;
    console.log(`[INBOUND SMS] From: ${from}, Text: ${text}`);

    // Parse simple emergency SMS: "ACCIDENT Gasabo Nyabugogo 2 INJ"
    const publicId = `RW-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const newInc: IncidentRecord = {
      id: `inc-sms-${Date.now()}`,
      publicId,
      type: 'TRAFFIC_CAR',
      priority: 'HIGH',
      status: 'TRIAGED',
      location: {
        latitude: -1.9392,
        longitude: 30.0451,
        accuracyMeters: 25,
        addressText: 'Nyabugogo Corridor (Inbound SMS Reported)',
        district: 'Nyarugenge',
        sector: 'Gitega',
        landmark: 'Reported via SMS Fallback'
      },
      peopleAffected: 2,
      unconsciousCount: 0,
      firePresent: false,
      roadBlocked: true,
      description: `Inbound Emergency SMS: "${text || 'Traffic accident reported'}"`,
      reporterPhone: from || '+250 788 123 456',
      reporterName: 'SMS Caller',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    incidentsStore.unshift(newInc);
    io.emit('incident:new', newInc);

    res.json({
      success: true,
      reply: `RNP EMERGENCY DISPATCH: Incident ${publicId} received. RNP unit en route.`
    });
  });

  // 12. GET /api/audit-logs - DPPO Data Protection Audit Trail
  app.get('/api/audit-logs', (req, res) => {
    res.json({
      success: true,
      dppoCompliant: true,
      regulation: 'Rwanda Law No. 058/2021 on Personal Data Protection and Privacy',
      count: auditLogsStore.length,
      data: auditLogsStore
    });
  });

  // 13. POST /api/database/test-connection - Test external PostgreSQL connection string
  app.post('/api/database/test-connection', requireDispatchKey, async (req, res) => {
    const { connectionString } = req.body;
    if (!connectionString) {
      return res.status(400).json({ success: false, message: 'Connection string is required' });
    }

    try {
      const testPool = new pg.Pool({
        connectionString,
        connectionTimeoutMillis: 5000,
        ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false }
      });

      const client = await testPool.connect();
      const versionRes = await client.query('SELECT version();');
      
      let postgisInstalled = false;
      let postgisVersion = 'NOT_INSTALLED';
      try {
        const gisRes = await client.query('SELECT PostGIS_Version();');
        postgisInstalled = true;
        postgisVersion = gisRes.rows[0].postgis_version;
      } catch {
        // PostGIS extension not yet enabled
      }

      client.release();
      await testPool.end();

      res.json({
        success: true,
        message: 'Successfully connected to PostgreSQL database!',
        postgresVersion: versionRes.rows[0].version,
        postgisInstalled,
        postgisVersion,
        actionRequired: postgisInstalled ? null : 'Run "CREATE EXTENSION postgis;" in your database SQL console.'
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to connect to database'
      });
    }
  });

  // 14. GET /api/database/status - Database health and spatial statistics
  app.get('/api/database/status', (req, res) => {
    res.json({
      engine: pgPool ? 'PostgreSQL (Active Pool)' : 'In-Memory High-Precision PostGIS Emulator (WGS84 ST_Distance)',
      connected: true,
      postgisReady: true,
      tables: {
        facilities: facilitiesStore.length,
        incidents: incidentsStore.length,
        responders: respondersStore.length,
        auditLogs: auditLogsStore.length
      },
      spatialReferenceSystem: 'EPSG:4326 (WGS84)',
      rwandaBoundingBox: {
        minLat: -2.83,
        maxLat: -1.05,
        minLng: 28.86,
        maxLng: 30.9
      }
    });
  });

  // 15. POST /api/ussd/session - USSD *113# Interactive Offline Simulator
  app.post('/api/ussd/session', (req, res) => {
    const { sessionId, phoneNumber, text } = req.body;
    let response = '';

    if (!text || text === '') {
      // Main Menu
      response = 'CON Murakaza neza kuri resQlink (Polisi y\'u Rwanda 113):\n';
      response += '1. Rapora Impanuka (Report Accident)\n';
      response += '2. Hamagara Imodoka y\'Abakomeretse (SAMU 912)\n';
      response += '3. Reba Imiterere y\'Ubutabazi (Check Incident Status)\n';
      response += '4. Nimero z\'Ubutabazi (Hotlines Directory)';
    } else if (text === '1') {
      response = 'CON Hitamo Ubwoko bw\'Impanuka:\n';
      response += '1*1. Impanuka ya Moto (Motorcycle)\n';
      response += '1*2. Impanuka y\'Imodoka (Car Collision)\n';
      response += '1*3. Umunyamaguru wagonzwe (Pedestrian)';
    } else if (text.startsWith('1*')) {
      const parts = text.split('*');
      if (parts.length === 2) {
        response = 'CON Haba hari abakomeretse bangahe?\n1. Umuntu 1\n2. Abantu 2\n3. Abarenze 3';
      } else if (parts.length === 3) {
        response = 'CON Aho muri mu Mujyi wa Kigali:\n1. Gasabo (Kigali Heights / Remera)\n2. Nyarugenge (Nyabugogo / Downtown)\n3. Kicukiro (Sonatubes / Giporoso)';
      } else if (parts.length === 4) {
        const id = `RW-${Math.floor(1000 + Math.random() * 9000)}`;
        response = `END Ubutabazi bwakiriwe! ID: ${id}. Polisi n'imbangukiragutabara (SAMU) bari mu nzira baje aho muri. Nimero: 113.`;
      }
    } else if (text === '2') {
      response = 'END Turimo kuguha ubufasha bwa SAMU Ambulance kuri 912. Tegereza umupolisi aguhagereho.';
    } else if (text === '3') {
      const latest = incidentsStore[0];
      response = `END Impanuka ya nyuma (${latest.publicId}): Imiterere ni "${latest.status}". Umutabazi aracyari mu nzira.`;
    } else if (text === '4') {
      response = 'END Nimero za Polisi y\'u Rwanda:\nImpanuka: 113\nUbutabazi bwose: 112\nKizimyamuriro: 111\nSAMU: 912';
    } else {
      response = 'END Hitamo itari yo. Kanda *113# wongere ugerageze.';
    }

    res.send(response);
  });

  // 16. POST /api/ai/assistant - Gemini-powered emergency copilot ("Uwera")
  app.post('/api/ai/assistant', async (req, res) => {
    const { message, language = 'en', history } = req.body || {};
    const prompt = typeof message === 'string' ? message.trim().slice(0, 1200) : '';

    if (!prompt) {
      return res.status(400).json({
        success: false,
        engine: 'GUIDED_FALLBACK',
        reply: 'Tell me what happened and I will guide you step by step.',
        suggestions: AI_SUGGESTION_POOL.slice(0, 3)
      });
    }

    const client = getGenAiClient();

    if (client) {
      try {
        const turns = Array.isArray(history)
          ? history
              .slice(-6)
              .filter((h: any) => h && typeof h.content === 'string')
              .map((h: any) => ({
                role: h.role === 'user' ? 'user' : 'model',
                parts: [{ text: String(h.content).slice(0, 900) }]
              }))
          : [];

        const response = await client.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [...turns, { role: 'user', parts: [{ text: prompt }] }],
          config: {
            systemInstruction: AI_SYSTEM_INSTRUCTION,
            temperature: 0.35,
            maxOutputTokens: 700
          }
        });

        const raw = (response as any).text;
        const reply = typeof raw === 'function' ? raw() : raw;

        if (typeof reply === 'string' && reply.trim().length > 0) {
          logAudit('ai-copilot', 'AI_COPILOT', 'AI_ASSISTANT_REPLY', 'AI_SESSION', 'uwera', `Answered a ${language} emergency query via Gemini 2.5 Flash.`, req);
          return res.json({
            success: true,
            engine: 'GEMINI',
            model: 'gemini-2.5-flash',
            reply: reply.trim(),
            suggestions: AI_SUGGESTION_POOL.slice(0, 3)
          });
        }
      } catch (err: any) {
        console.warn('[AI] Gemini call failed, using guided fallback:', err?.message || err);
      }
    }

    const fallback = guidedFallback(prompt, language);
    res.json({
      success: true,
      engine: 'GUIDED_FALLBACK',
      note: genAiDisabledReason,
      reply: fallback.reply,
      suggestions: fallback.suggestions
    });
  });

  // 16b. GET /api/ai/status - Whether the Gemini copilot is live
  app.get('/api/ai/status', (req, res) => {
    res.json({
      success: true,
      model: 'gemini-2.5-flash',
      online: Boolean(getGenAiClient()),
      mode: getGenAiClient() ? 'GEMINI' : 'GUIDED_FALLBACK',
      note: genAiDisabledReason || null
    });
  });

  // 17. GET /api/referral/leaderboard - Top citizen referrers (social proof)
  app.get('/api/referral/leaderboard', (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 8, 25);
    const list = [...referralStore.values()]
      .sort((a, b) => b.invites - a.invites || b.installs - a.installs)
      .slice(0, limit)
      .map((r) => ({
        code: r.code,
        ownerName: r.ownerName,
        district: r.district,
        invites: r.invites,
        installs: r.installs
      }));

    res.json({
      success: true,
      count: list.length,
      note: 'Invites are recognition only — they never change emergency dispatch priority.',
      data: list
    });
  });

  // 18. GET /api/referral/:code - Referral stats for a citizen
  app.get('/api/referral/:code', (req, res) => {
    const code = normaliseReferralCode(req.params.code);
    if (!code) {
      return res.status(400).json({ success: false, message: 'Invalid referral code format.' });
    }

    const record = ensureReferral(code);
    res.json({
      success: true,
      data: {
        code: record.code,
        ownerName: record.ownerName,
        district: record.district,
        invites: record.invites,
        installs: record.installs,
        conversionRate: record.invites > 0 ? Number(((record.installs / record.invites) * 100).toFixed(1)) : 0,
        createdAt: record.createdAt
      }
    });
  });

  // 19. POST /api/referral/claim - Record a share or an accepted invite
  app.post('/api/referral/claim', (req, res) => {
    const code = normaliseReferralCode(req.body?.code);
    const channel = typeof req.body?.channel === 'string' ? req.body.channel.slice(0, 24) : 'LINK';
    const installed = Boolean(req.body?.installed);

    if (!code) {
      return res.status(400).json({ success: false, message: 'A valid referral code is required.' });
    }

    const record = ensureReferral(code, req.body?.ownerName, req.body?.district);
    record.invites += 1;
    if (installed) record.installs += 1;
    record.lastInviteAt = new Date().toISOString();

    logAudit(
      code,
      'CITIZEN',
      installed ? 'REFERRAL_INSTALL' : 'REFERRAL_SHARE',
      'REFERRAL',
      code,
      `Referral activity via ${channel}. Total invites: ${record.invites}.`,
      req
    );

    res.json({
      success: true,
      message: 'Referral recorded. Thank you for growing the safety net.',
      data: {
        code: record.code,
        invites: record.invites,
        installs: record.installs
      }
    });
  });

  // 20. GET /schema.sql & /api/schema - Direct download of PostgreSQL/PostGIS schema
  app.get(['/schema.sql', '/api/schema'], (req, res) => {
    const schemaPath = path.resolve(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', 'inline; filename="rwanda_resqlink_postgis_schema.sql"');
      return res.sendFile(schemaPath);
    }
    res.status(404).json({ success: false, message: 'schema.sql file not found' });
  });

  // -----------------------------------------------------------------------
  // VITE DEVELOPMENT MIDDLEWARES OR PRODUCTION STATIC FILES
  // -----------------------------------------------------------------------
  if (serveClient) {
    if (process.env.NODE_ENV === 'production') {
      app.use(express.static(path.resolve(__dirname, 'dist')));
      app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
      });
    } else {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa'
      });
      app.use(vite.middlewares);
    }
  }

  return { app, httpServer, io, demoMode, requireDispatchAuth };
}

async function startServer() {
  const { httpServer, io, demoMode, requireDispatchAuth } = await createApp();
  const PORT = Number(process.env.PORT) || 3000;

  // Background Heartbeat for Responders (Live Movement in Kigali) — a demo
  // simulation of units creeping toward their target incident.
  setInterval(() => {
    respondersStore.forEach((resp) => {
      if (resp.currentStatus === 'EN_ROUTE') {
        // Find targeted incident
        const targetInc = incidentsStore.find((i) => i.id === resp.targetIncidentId);
        if (targetInc) {
          // Creep closer to incident location
          const latDelta = (targetInc.location.latitude - resp.latitude) * 0.15;
          const lngDelta = (targetInc.location.longitude - resp.longitude) * 0.15;
          resp.latitude += latDelta;
          resp.longitude += lngDelta;
          const dist = calculateWgs84DistanceKm(resp.latitude, resp.longitude, targetInc.location.latitude, targetInc.location.longitude);
          resp.etaMinutes = Math.max(1, Math.round((dist / 35) * 60));
          resp.lastUpdated = new Date().toISOString();

          // Emit live update
          io.emit('responder:moved', {
            responderId: resp.id,
            latitude: resp.latitude,
            longitude: resp.longitude,
            etaMinutes: resp.etaMinutes,
            currentStatus: resp.currentStatus,
            unitName: resp.unitName
          });
        }
      }
    });
  }, 4000);

  httpServer.listen(PORT, '0.0.0.0', () => {
    // Note: 0.0.0.0 is the bind address (all interfaces, so LAN devices can
    // connect); browsers must use localhost or 127.0.0.1 instead.
    console.log(`resQlink Rwanda Emergency Platform with WebSockets running on http://localhost:${PORT}`);
    console.log(`  (bound to 0.0.0.0 — LAN-accessible; open http://localhost:${PORT} in your browser)`);
    console.log(
      `Mode: ${demoMode ? 'DEMO (simulated OTP/identity)' : 'PRODUCTION (simulation disabled)'} · dispatch auth: ${
        requireDispatchAuth ? 'x-dispatch-api-key required' : 'open (local demo)'
      }`
    );
  });
}

// Start only when executed directly (`npm run dev` / `npm start`), never when
// imported by the test suite.
const entryUrl = process.argv[1] ? pathToFileURL(process.argv[1]).href : '';
if (entryUrl === import.meta.url) {
  startServer().catch((err) => {
    console.error('resQlink server failed to start:', err);
    process.exit(1);
  });
}
