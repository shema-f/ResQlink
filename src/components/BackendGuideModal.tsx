import React, { useState } from 'react';
import { Database, Server, Smartphone, Key, MapPin, Radio, Shield, Copy, Check, Terminal, Activity, Download } from 'lucide-react';
import { LiveIntegrationConsole } from './LiveIntegrationConsole';

export const BackendGuideModal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'LIVE_CONSOLE' | 'SCHEMA' | 'CHECKLIST' | 'APIS' | 'POSTGIS' | 'NESTJS'>('LIVE_CONSOLE');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const POSTGRESQL_SCHEMA_SQL = `-- =========================================================================
-- resQlink: RWANDA EMERGENCY RESPONSE PLATFORM
-- PRODUCTION POSTGRESQL + POSTGIS DATABASE SCHEMA
-- =========================================================================

-- 1. Enable PostGIS Extension for high-precision geofencing & spatial distance
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. Enumerated Types
CREATE TYPE user_role AS ENUM (
  'CITIZEN',
  'RNP_DISPATCHER',
  'RNP_PATROL_OFFICER',
  'SAMU_PARAMEDIC',
  'FIRE_RESCUE_CHIEF',
  'SUPER_ADMIN',
  'SAFETY_ANALYST'
);

CREATE TYPE incident_type AS ENUM (
  'TRAFFIC_MOTO',
  'TRAFFIC_CAR',
  'TRAFFIC_TRUCK',
  'TRAFFIC_BUS',
  'PEDESTRIAN',
  'FIRE_EXPLOSION',
  'MEDICAL_CRITICAL',
  'ROAD_HAZARD'
);

CREATE TYPE priority_level AS ENUM (
  'CRITICAL',
  'HIGH',
  'MODERATE',
  'LOW'
);

CREATE TYPE incident_status AS ENUM (
  'REPORTED',
  'LOCATION_CONFIRMED',
  'TRIAGED',
  'DISPATCHED',
  'RESPONDER_EN_ROUTE',
  'ON_SCENE',
  'RESOLVED',
  'CANCELLED'
);

CREATE TYPE facility_type AS ENUM (
  'POLICE_STATION',
  'HOSPITAL',
  'HEALTH_CENTER',
  'FIRE_STATION',
  'AMBULANCE_BASE'
);

-- 3. Users Table (Citizens, Police Officers, Dispatchers, Paramedics)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number VARCHAR(20) NOT NULL UNIQUE, -- e.g. +250788412901
  full_name VARCHAR(150),
  role user_role NOT NULL DEFAULT 'CITIZEN',
  badge_number VARCHAR(50), -- Only for RNP / SAMU officers
  organization_id UUID,
  preferred_language VARCHAR(5) DEFAULT 'rw', -- rw, en, fr
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Facilities Table (Hospitals, RNP Stations, Fire Stations in Rwanda)
CREATE TABLE facilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  type facility_type NOT NULL,
  district VARCHAR(100) NOT NULL,
  sector VARCHAR(100) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  emergency_phone VARCHAR(50),
  -- PostGIS Geography Point (Longitude, Latitude) WGS84
  location GEOGRAPHY(Point, 4326) NOT NULL,
  is_verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spatial index on facilities for near-instant KNN nearest-neighbor queries
CREATE INDEX idx_facilities_location ON facilities USING GIST(location);

-- 5. Incidents Table (Emergency SOS Events)
CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  public_id VARCHAR(32) NOT NULL UNIQUE, -- e.g. RW-2026-00184
  reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reporter_phone VARCHAR(30) NOT NULL,
  type incident_type NOT NULL,
  priority priority_level NOT NULL,
  status incident_status NOT NULL DEFAULT 'REPORTED',
  
  -- Spatial Location
  location GEOGRAPHY(Point, 4326) NOT NULL,
  accuracy_meters NUMERIC(6, 2) DEFAULT 10.0,
  address_text TEXT NOT NULL,
  district VARCHAR(100) NOT NULL,
  sector VARCHAR(100) NOT NULL,
  landmark TEXT,
  
  -- Triage assessment indicators
  people_affected INT NOT NULL DEFAULT 0,
  unconscious_count INT NOT NULL DEFAULT 0,
  fire_present BOOLEAN NOT NULL DEFAULT FALSE,
  road_blocked BOOLEAN NOT NULL DEFAULT FALSE,
  description TEXT,
  
  -- Fallback flags
  is_offline_synced BOOLEAN DEFAULT FALSE,
  audio_note_url TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_incidents_location ON incidents USING GIST(location);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_created_at ON incidents(created_at DESC);

-- 6. Responders Table (RNP Patrol Cars, SAMU Ambulances, Fire Trucks)
CREATE TABLE responders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  unit_name VARCHAR(100) NOT NULL, -- e.g. 'RNP Traffic Unit Alpha-4'
  vehicle_plate VARCHAR(30),        -- e.g. 'GR 421-B'
  responder_type facility_type NOT NULL,
  current_status VARCHAR(50) DEFAULT 'AVAILABLE',
  current_location GEOGRAPHY(Point, 4326),
  last_location_update TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_responders_location ON responders USING GIST(current_location);

-- 7. Dispatches Table (Assignment of responders to incidents)
CREATE TABLE dispatches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  responder_id UUID NOT NULL REFERENCES responders(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES users(id),
  status VARCHAR(50) NOT NULL DEFAULT 'DISPATCHED',
  eta_minutes INT,
  dispatched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  arrived_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 8. Audit Logs Table (Rwanda DPP Law Compliance)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id VARCHAR(100) NOT NULL,
  ip_address VARCHAR(50),
  details TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_time ON audit_logs(created_at DESC);

-- 9. PostGIS Spatial KNN Query Function
CREATE OR REPLACE FUNCTION fn_find_nearest_facilities(
  p_lng DOUBLE PRECISION,
  p_lat DOUBLE PRECISION,
  p_limit INT DEFAULT 5
)
RETURNS TABLE (
  facility_id UUID,
  facility_name VARCHAR(255),
  facility_type facility_type,
  phone VARCHAR(50),
  distance_km NUMERIC,
  eta_minutes INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    f.id, f.name, f.type, f.phone,
    ROUND((ST_Distance(f.location, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography) / 1000)::numeric, 2) AS distance_km,
    GREATEST(2, ROUND(((ST_Distance(f.location, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography) / 1000) / 35.0 * 60)::numeric)::int) AS eta_minutes
  FROM facilities f
  ORDER BY f.location <-> ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;`;

  const SAMPLE_POSTGIS_QUERY = `-- Spatial Query: Find the 3 nearest Police Stations and 3 nearest Hospitals to an accident:
-- Assuming Accident Location: -1.9536 (Lat), 30.0984 (Lng) in Kigali

SELECT 
  id, 
  name, 
  type, 
  district, 
  phone,
  -- Calculate precise distance in kilometers using WGS84 geography
  ROUND((ST_Distance(location, ST_SetSRID(ST_MakePoint(30.0984, -1.9536), 4326)::geography) / 1000)::numeric, 2) AS distance_km
FROM facilities
WHERE type IN ('POLICE_STATION', 'HOSPITAL')
ORDER BY location <-> ST_SetSRID(ST_MakePoint(30.0984, -1.9536), 4326)::geography
LIMIT 6;`;

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 py-6 space-y-6 text-white">
      {/* Blueprint Header */}
      <div className="bg-gradient-to-r from-[#0b1c3d] via-[#102752] to-[#0b1c3d] border-2 border-amber-400/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-3">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-300">
          <Terminal className="w-4 h-4 text-amber-400" />
          <span>resQlink Production Engineering Specification</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          Database Schema & Third-Party Service Checklist
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          Here is everything required on your side to make the real-world backend, real-time location tracking, SMS fallback, and user authentication operate seamlessly in Rwanda.
        </p>

        {/* Tab navigation */}
        <div className="flex flex-wrap items-center gap-2 pt-3">
          <button
            onClick={() => setActiveTab('LIVE_CONSOLE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'LIVE_CONSOLE'
                ? 'bg-amber-400 text-slate-950 shadow-md font-black ring-2 ring-amber-300'
                : 'bg-slate-800 text-amber-300 hover:bg-slate-700 border border-amber-500/30'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>⚡ LIVE SERVICES TESTER &amp; CONSOLE</span>
          </button>

          <button
            onClick={() => setActiveTab('SCHEMA')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'SCHEMA'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            🐘 PostgreSQL + PostGIS DDL
          </button>

          <button
            onClick={() => setActiveTab('CHECKLIST')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'CHECKLIST'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            📋 What To Do on Your Side
          </button>

          <button
            onClick={() => setActiveTab('APIS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'APIS'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            🔌 APIs & Third-Party Services
          </button>

          <button
            onClick={() => setActiveTab('POSTGIS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'POSTGIS'
                ? 'bg-orange-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            🗺️ PostGIS Spatial Queries
          </button>

          <button
            onClick={() => setActiveTab('NESTJS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'NESTJS'
                ? 'bg-rose-500 text-white shadow-md font-black ring-2 ring-rose-300'
                : 'bg-slate-800 text-rose-300 hover:bg-slate-700 border border-rose-500/30'
            }`}
          >
            <span>🐱 NestJS + Socket.IO Backend</span>
          </button>
        </div>
      </div>

      {/* Tab 0: Live Services & Integrations Diagnostic Console */}
      {activeTab === 'LIVE_CONSOLE' && (
        <LiveIntegrationConsole />
      )}

      {/* Tab 1: PostgreSQL + PostGIS Schema */}
      {activeTab === 'SCHEMA' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-amber-400" />
                <span>Production PostGIS Schema (PostgreSQL 14+)</span>
              </h2>
              <p className="text-xs text-slate-400">
                Includes spatial indexes, GIS geography points, enum types, and audit logging.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="/schema.sql"
                download="rwanda_resqlink_postgis_schema.sql"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download schema.sql</span>
              </a>

              <button
                onClick={() => copyToClipboard(POSTGRESQL_SCHEMA_SQL, 'schema')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold border border-slate-700 transition-colors"
              >
                {copiedCode === 'schema' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode === 'schema' ? 'Copied SQL!' : 'Copy SQL Script'}</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-slate-300 overflow-x-auto max-h-[500px] leading-relaxed">
            <pre>{POSTGRESQL_SCHEMA_SQL}</pre>
          </div>
        </div>
      )}

      {/* Tab 2: What To Do on Your Side */}
      {activeTab === 'CHECKLIST' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Item 1: Database Setup */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold">
              1
            </div>
            <h3 className="text-base font-black text-white">Database with PostGIS Extension</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Create a PostgreSQL database on any provider (Supabase, Neon, AWS RDS, or Cloud SQL) and run:
            </p>
            <div className="bg-slate-950 p-2.5 rounded-xl font-mono text-xs text-emerald-400 border border-slate-800">
              CREATE EXTENSION postgis;
            </div>
            <p className="text-xs text-slate-400">
              This enables distance calculation between the accident coordinates and Rwanda hospitals / RNP stations in milliseconds.
            </p>
          </div>

          {/* Item 2: Real-Time Location & Dispatch */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
              2
            </div>
            <h3 className="text-base font-black text-white">Real-Time WebSockets (Socket.IO)</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              For real-time incident pushing to RNP Dispatchers:
            </p>
            <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
              <li>Citizen clicks SOS → triggers <code className="text-amber-300">incident:created</code> socket event.</li>
              <li>Command Center dashboard receives notification with audio siren instantly without page refresh.</li>
              <li>Mobile responder sends live GPS heartbeat every 15s to update distance and ETA.</li>
            </ul>
          </div>

          {/* Item 3: Phone Authentication & OTP */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
              3
            </div>
            <h3 className="text-base font-black text-white">User Authentication & OTP</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              For citizens and responders in Rwanda:
            </p>
            <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
              <li>Use <strong>Firebase Phone Auth</strong> or <strong>Supabase Phone Auth</strong> with Rwanda country code (+250).</li>
              <li>Supports MTN Rwanda (078, 079) and Airtel Rwanda (072, 073).</li>
              <li>Emergency SOS reports can also be submitted anonymously to prevent triage delays!</li>
            </ul>
          </div>

          {/* Item 4: Rwanda SMS & USSD Fallback */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-orange-600/20 border border-orange-500/40 flex items-center justify-center text-orange-400 font-bold">
              4
            </div>
            <h3 className="text-base font-black text-white">Rwanda Telecom SMS Gateway</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              When 3G/4G/5G data is unavailable on remote roads (e.g. Nyungwe forest or Gicumbi hills):
            </p>
            <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
              <li>Integrate with <strong>Africa&apos;s Talking Rwanda</strong> or <strong>Twilio</strong> or direct <strong>MTN Rwanda SMS API</strong>.</li>
              <li>The citizen app formats a compact SMS with GPS coordinates directly to RNP 112/113.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Tab 3: APIs and Services */}
      {activeTab === 'APIS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Radio className="w-5 h-5 text-emerald-400" />
            <span>Recommended Production Tech Stack for Rwanda</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <span className="font-bold text-cyan-300 block text-sm">Maps & Geolocation</span>
              <p className="text-slate-300">
                <strong>Leaflet + OpenStreetMap</strong> (Free, no credit card or token limits).
              </p>
              <p className="text-slate-400 text-[11px]">
                Optionally upgrade to MapLibre GL for 3D vector terrain of Rwanda&apos;s thousand hills.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <span className="font-bold text-amber-300 block text-sm">Reverse Geocoding</span>
              <p className="text-slate-300">
                <strong>Nominatim OSM</strong> or <strong>Google Maps Geocoding</strong>.
              </p>
              <p className="text-slate-400 text-[11px]">
                Converts (-1.9536, 30.0984) into &quot;KN 5 Rd, Kimihurura, Gasabo, Kigali&quot;.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <span className="font-bold text-emerald-300 block text-sm">Backend Engine</span>
              <p className="text-slate-300">
                <strong>Node.js + NestJS / Express + tsx</strong>.
              </p>
              <p className="text-slate-400 text-[11px]">
                Type-safe API endpoints for <code>/api/incidents</code>, <code>/api/dispatches</code>, and <code>/api/facilities</code>.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <span className="font-bold text-orange-300 block text-sm">Push Notifications</span>
              <p className="text-slate-300">
                <strong>Firebase Cloud Messaging (FCM)</strong>.
              </p>
              <p className="text-slate-400 text-[11px]">
                Instant high-priority alerts to responder mobile phones even when the app is in the background.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <span className="font-bold text-red-300 block text-sm">SMS / USSD Gateway</span>
              <p className="text-slate-300">
                <strong>Africa&apos;s Talking</strong> or <strong>MTN Rwanda SMS</strong>.
              </p>
              <p className="text-slate-400 text-[11px]">
                Delivers automated SMS dispatch and OTP verification to local Rwanda numbers.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <span className="font-bold text-purple-300 block text-sm">DPPO Compliance</span>
              <p className="text-slate-300">
                <strong>Data Protection Office (Rwanda)</strong>.
              </p>
              <p className="text-slate-400 text-[11px]">
                Data residency for location & health logs stored locally or with certified DPO authorization.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: PostGIS Queries */}
      {activeTab === 'POSTGIS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-orange-400" />
              <span>Sample Spatial SQL: Nearest Responder & Hospital</span>
            </h2>

            <button
              onClick={() => copyToClipboard(SAMPLE_POSTGIS_QUERY, 'postgis_query')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold border border-slate-700"
            >
              {copiedCode === 'postgis_query' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Query</span>
            </button>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-amber-300 overflow-x-auto leading-relaxed">
            <pre>{SAMPLE_POSTGIS_QUERY}</pre>
          </div>
        </div>
      )}

      {/* Tab 5: NestJS + Socket.IO Backend Architecture */}
      {activeTab === 'NESTJS' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-mono tracking-widest text-rose-400 font-bold">Production Node.js Architecture</span>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Server className="w-5 h-5 text-rose-400" />
                  <span>NestJS + TypeORM (PostGIS) + Socket.IO Implementation</span>
                </h2>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                NestJS 10+
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              This architecture fulfills all endpoints expected by the resQlink frontend (<code className="text-amber-300">GET /api/incidents</code>, <code className="text-amber-300">PATCH /api/incidents/:id/status</code>, <code className="text-amber-300">POST /api/incidents</code>, <code className="text-amber-300">GET /api/facilities/nearby</code>) and mounts the real-time WebSocket Gateway for live sirens and patrol telemetry.
            </p>
          </div>

          {/* Step 1: Install Dependencies */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 font-mono text-xs flex items-center justify-center font-bold">1</span>
                <span>Initialize NestJS Project & Install Dependencies</span>
              </h3>
              <button
                onClick={() => copyToClipboard(`npm i -g @nestjs/cli
nest new resqlink-backend --skip-git --package-manager npm
cd resqlink-backend
npm install @nestjs/typeorm typeorm pg @nestjs/websockets @nestjs/platform-socket.io socket.io class-validator class-transformer @nestjs/config`, 'nest_install')}
                className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 text-xs font-bold border border-slate-700 flex items-center gap-1.5"
              >
                {copiedCode === 'nest_install' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Command</span>
              </button>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 font-mono text-xs text-slate-200">
              <code>{`npm install @nestjs/typeorm typeorm pg \\
  @nestjs/websockets @nestjs/platform-socket.io socket.io \\
  class-validator class-transformer @nestjs/config`}</code>
            </div>
          </div>

          {/* Step 2: app.module.ts with PostGIS */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 font-mono text-xs flex items-center justify-center font-bold">2</span>
                <span>TypeORM PostGIS Configuration (src/app.module.ts)</span>
              </h3>
              <button
                onClick={() => copyToClipboard(`import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IncidentsModule } from './incidents/incidents.module';
import { EventsModule } from './events/events.module';
import { FacilitiesModule } from './facilities/facilities.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: false, // Use schema.sql migrations in production
        ssl: config.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
      }),
    }),
    IncidentsModule,
    EventsModule,
    FacilitiesModule,
  ],
})
export class AppModule {}`, 'nest_app_module')}
                className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 text-xs font-bold border border-slate-700 flex items-center gap-1.5"
              >
                {copiedCode === 'nest_app_module' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy src/app.module.ts</span>
              </button>
            </div>
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 max-h-60 overflow-y-auto leading-relaxed">
              <pre>{`// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IncidentsModule } from './incidents/incidents.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: false,
        ssl: config.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
      }),
    }),
    IncidentsModule,
    EventsModule,
  ],
})
export class AppModule {}`}</pre>
            </div>
          </div>

          {/* Step 3: TypeORM Entity with PostGIS Point */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 font-mono text-xs flex items-center justify-center font-bold">3</span>
                <span>Incident Entity with GIS Geography (src/incidents/incident.entity.ts)</span>
              </h3>
              <button
                onClick={() => copyToClipboard(`import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('incidents')
export class IncidentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'public_id', unique: true, length: 32 })
  @Index()
  publicId: string;

  @Column({ name: 'reporter_phone', length: 30 })
  reporterPhone: string;

  @Column({ name: 'reporter_name', nullable: true })
  reporterName: string;

  @Column({ type: 'varchar', default: 'TRAFFIC_MOTO' })
  type: string;

  @Column({ type: 'varchar', default: 'MODERATE' })
  @Index()
  priority: string;

  @Column({ type: 'varchar', default: 'REPORTED' })
  @Index()
  status: string;

  // PostGIS Geography Point (Longitude, Latitude) EPSG:4326
  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  @Index({ spatial: true })
  location: any;

  @Column({ name: 'address_text', type: 'text' })
  addressText: string;

  @Column({ length: 100 })
  district: string;

  @Column({ length: 100 })
  sector: string;

  @Column({ type: 'int', name: 'people_affected', default: 1 })
  peopleAffected: number;

  @Column({ type: 'int', name: 'unconscious_count', default: 0 })
  unconsciousCount: number;

  @Column({ type: 'boolean', name: 'fire_present', default: false })
  firePresent: boolean;

  @Column({ type: 'boolean', name: 'road_blocked', default: false })
  roadBlocked: boolean;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}`, 'nest_incident_entity')}
                className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 text-xs font-bold border border-slate-700 flex items-center gap-1.5"
              >
                {copiedCode === 'nest_incident_entity' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Entity</span>
              </button>
            </div>
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 max-h-60 overflow-y-auto leading-relaxed">
              <pre>{`// PostGIS Spatial Entity Column
@Column({
  type: 'geography',
  spatialFeatureType: 'Point',
  srid: 4326,
})
@Index({ spatial: true })
location: string; // Point(lon lat)`}</pre>
            </div>
          </div>

          {/* Step 4: Socket.IO Gateway */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 font-mono text-xs flex items-center justify-center font-bold">4</span>
                <span>Real-Time Dispatch Gateway (src/events/dispatch.gateway.ts)</span>
              </h3>
              <button
                onClick={() => copyToClipboard(`import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class DispatchGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    client.emit('connection:ack', {
      status: 'CONNECTED',
      serverTime: new Date().toISOString(),
      socketId: client.id,
    });
  }

  handleDisconnect(client: Socket) {}

  @SubscribeMessage('join:room')
  handleJoinRoom(client: Socket, room: string) {
    client.join(room);
  }

  @SubscribeMessage('responder:ping')
  handleResponderPing(client: Socket, payload: any) {
    this.server.to('command_center').emit('responder:location_update', payload);
  }

  // Broadcasters invoked from Services
  broadcastNewIncident(incident: any) {
    this.server.emit('incident:new', incident);
  }

  broadcastIncidentUpdated(incident: any) {
    this.server.emit('incident:updated', incident);
  }

  broadcastResponderMoved(payload: any) {
    this.server.emit('responder:moved', payload);
  }
}`, 'nest_gateway')}
                className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 text-xs font-bold border border-slate-700 flex items-center gap-1.5"
              >
                {copiedCode === 'nest_gateway' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Gateway</span>
              </button>
            </div>
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 max-h-60 overflow-y-auto leading-relaxed">
              <pre>{`@WebSocketGateway({ cors: { origin: '*' } })
export class DispatchGateway {
  @WebSocketServer()
  server: Server;

  broadcastNewIncident(incident: any) {
    this.server.emit('incident:new', incident);
  }

  broadcastIncidentUpdated(incident: any) {
    this.server.emit('incident:updated', incident);
  }
}`}</pre>
            </div>
          </div>

          {/* Step 5: Incidents Controller & Service */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 font-mono text-xs flex items-center justify-center font-bold">5</span>
                <span>REST Endpoints Controller (src/incidents/incidents.controller.ts)</span>
              </h3>
              <button
                onClick={() => copyToClipboard(`import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { IncidentsService } from './incidents.service';

@Controller('api/incidents')
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  // 1. GET /api/incidents
  @Get()
  async findAll(@Query('status') status?: string, @Query('priority') priority?: string) {
    const list = await this.incidentsService.findAll({ status, priority });
    return { success: true, count: list.length, data: list };
  }

  // 2. POST /api/incidents (Citizen SOS)
  @Post()
  async create(@Body() createDto: any) {
    const created = await this.incidentsService.create(createDto);
    return { success: true, message: 'Emergency incident created', data: created };
  }

  // 3. PATCH /api/incidents/:id/status (or PATCH /api/incidents/:id)
  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    const updated = await this.incidentsService.updateStatus(id, status);
    return { success: true, data: updated };
  }

  @Patch(':id')
  async updateGeneral(@Param('id') id: string, @Body() body: any) {
    const updated = await this.incidentsService.update(id, body);
    return { success: true, data: updated };
  }
}`, 'nest_controller')}
                className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 text-xs font-bold border border-slate-700 flex items-center gap-1.5"
              >
                {copiedCode === 'nest_controller' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Controller</span>
              </button>
            </div>
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 max-h-60 overflow-y-auto leading-relaxed">
              <pre>{`@Controller('api/incidents')
export class IncidentsController {
  // GET /api/incidents
  @Get()
  async findAll(@Query('status') status?: string) { ... }

  // PATCH /api/incidents/:id/status
  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: string) { ... }
}`}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
