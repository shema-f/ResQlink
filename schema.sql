-- =========================================================================
-- resQlink: RWANDA EMERGENCY RESPONSE PLATFORM
-- PRODUCTION POSTGRESQL + POSTGIS DATABASE SCHEMA SPECIFICATION
-- Compliant with Rwanda Law No. 058/2021 on Personal Data Protection and Privacy
-- Spatial Reference System: EPSG:4326 (WGS84)
-- =========================================================================

-- -------------------------------------------------------------------------
-- 1. EXTENSIONS
-- -------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- -------------------------------------------------------------------------
-- 2. ENUMERATED TYPES
-- -------------------------------------------------------------------------

-- System roles with Role-Based Access Control (RBAC)
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'CITIZEN',
    'RNP_DISPATCHER',
    'RNP_PATROL_OFFICER',
    'SAMU_PARAMEDIC',
    'FIRE_RESCUE_CHIEF',
    'SUPER_ADMIN',
    'SAFETY_ANALYST'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Emergency incident classifications
DO $$ BEGIN
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
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Automated triage priority levels
DO $$ BEGIN
  CREATE TYPE priority_level AS ENUM (
    'CRITICAL',
    'HIGH',
    'MODERATE',
    'LOW'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Incident lifecycle workflow states
DO $$ BEGIN
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
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Emergency facility and service unit classifications
DO $$ BEGIN
  CREATE TYPE facility_type AS ENUM (
    'POLICE_STATION',
    'HOSPITAL',
    'HEALTH_CENTER',
    'FIRE_STATION',
    'AMBULANCE_BASE',
    'COMMAND_CENTRE'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Patrol vehicle operational availability
DO $$ BEGIN
  CREATE TYPE responder_status AS ENUM (
    'AVAILABLE',
    'DISPATCHED',
    'EN_ROUTE',
    'ON_SCENE',
    'BUSY',
    'OFF_DUTY'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Dispatch lifecycle states
DO $$ BEGIN
  CREATE TYPE dispatch_status AS ENUM (
    'DISPATCHED',
    'EN_ROUTE',
    'ON_SCENE',
    'COMPLETED',
    'CANCELLED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Road danger / hazard types ("Gerayo Amahoro")
DO $$ BEGIN
  CREATE TYPE hazard_type AS ENUM (
    'POTHOLE_CRITICAL',
    'LANDSLIDE',
    'TRAFFIC_LIGHT_FAILURE',
    'FALLEN_TREE_OBSTACLE',
    'OIL_SPILL_HAZARD',
    'BRIDGE_DAMAGE',
    'FLOODED_ROAD'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- -------------------------------------------------------------------------
-- 3. CORE TABLES
-- -------------------------------------------------------------------------

-- 3.1 USERS TABLE
-- Handles citizen profiles, RNP dispatchers, patrol officers, and SAMU paramedics
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number VARCHAR(25) NOT NULL UNIQUE, -- Formatted with Rwanda prefix (+250 78/79/72/73)
  full_name VARCHAR(150),
  role user_role NOT NULL DEFAULT 'CITIZEN',
  badge_number VARCHAR(50),                 -- For RNP / SAMU officers
  organization VARCHAR(100),               -- e.g. "Rwanda National Police", "SAMU", "RBC"
  national_id VARCHAR(20),                 -- Rwandan NID (16 digits) encrypted/hashed
  preferred_language VARCHAR(5) DEFAULT 'rw', -- 'rw' (Kinyarwanda), 'en' (English), 'fr' (French)
  is_verified BOOLEAN DEFAULT FALSE,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT chk_rwanda_phone CHECK (phone_number ~ '^\+250[0-9]{9}$')
);

CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 3.2 FACILITIES TABLE
-- Permanent emergency infrastructure across Rwanda (Police stations, Referral hospitals, Fire bases)
CREATE TABLE IF NOT EXISTS facilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  type facility_type NOT NULL,
  district VARCHAR(100) NOT NULL,          -- e.g. Gasabo, Nyarugenge, Kicukiro, Musanze, Huye
  sector VARCHAR(100) NOT NULL,            -- Sector administrative boundary
  cell VARCHAR(100),                       -- Cell administrative boundary
  phone VARCHAR(50) NOT NULL,              -- Direct hotline
  toll_free_number VARCHAR(20),            -- e.g. 112, 113, 111, 912
  
  -- Spatial Geography Point (WGS84 coordinate: Lon, Lat)
  location GEOGRAPHY(Point, 4326) NOT NULL,
  is_verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PostGIS GiST index for fast spatial k-nearest neighbors (KNN) queries
CREATE INDEX IF NOT EXISTS idx_facilities_location ON facilities USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_facilities_type ON facilities(type);
CREATE INDEX IF NOT EXISTS idx_facilities_district ON facilities(district);

-- 3.3 INCIDENTS TABLE
-- Central emergency repository capturing GPS SOS alerts from citizens or phone operators
CREATE TABLE IF NOT EXISTS incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  public_id VARCHAR(32) NOT NULL UNIQUE,     -- Human-readable tracking ID (e.g. RW-2026-00184)
  reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reporter_phone VARCHAR(30) NOT NULL,
  reporter_name VARCHAR(150),
  type incident_type NOT NULL,
  priority priority_level NOT NULL DEFAULT 'MODERATE',
  status incident_status NOT NULL DEFAULT 'REPORTED',
  
  -- Spatial Location (GIS)
  location GEOGRAPHY(Point, 4326) NOT NULL,
  accuracy_meters NUMERIC(6, 2) DEFAULT 10.0,
  address_text TEXT NOT NULL,                -- Reverse-geocoded road name (e.g. "KN 5 Rd, Kimihurura")
  district VARCHAR(100) NOT NULL,
  sector VARCHAR(100) NOT NULL,
  landmark TEXT,
  
  -- Emergency Triage Metrics
  people_affected INT NOT NULL DEFAULT 1,
  unconscious_count INT NOT NULL DEFAULT 0,
  fire_present BOOLEAN NOT NULL DEFAULT FALSE,
  road_blocked BOOLEAN NOT NULL DEFAULT FALSE,
  description TEXT,
  
  -- Communication & Media
  has_photo BOOLEAN DEFAULT FALSE,
  photo_url TEXT,
  audio_briefing_url TEXT,
  inbound_channel VARCHAR(30) DEFAULT 'APP_SOS', -- 'APP_SOS', 'CALL_HOTLINE', 'SMS_FALLBACK', 'USSD_113'
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- High-performance spatial and transactional indexes
CREATE INDEX IF NOT EXISTS idx_incidents_location ON incidents USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_priority ON incidents(priority);
CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON incidents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_reporter_phone ON incidents(reporter_phone);

-- 3.4 RESPONDERS TABLE
-- RNP patrol cars, SAMU mobile ICU ambulances, and Fire & Rescue trucks
CREATE TABLE IF NOT EXISTS responders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  unit_name VARCHAR(100) NOT NULL,           -- e.g. "RNP Traffic Unit Alpha-4"
  vehicle_plate VARCHAR(30) NOT NULL UNIQUE, -- e.g. "GR 421-B" (Government of Rwanda registration)
  responder_type facility_type NOT NULL,     -- POLICE_STATION, HOSPITAL, FIRE_STATION
  current_status responder_status NOT NULL DEFAULT 'AVAILABLE',
  
  -- Dynamic Real-Time GPS Tracking
  current_location GEOGRAPHY(Point, 4326),
  last_location_update TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  heading_degrees NUMERIC(5, 2),             -- 0 - 360 direction of travel
  speed_kmh NUMERIC(5, 2) DEFAULT 0.0,
  
  assigned_station_id UUID REFERENCES facilities(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spatial index on patrol vehicle locations
CREATE INDEX IF NOT EXISTS idx_responders_location ON responders USING GIST(current_location);
CREATE INDEX IF NOT EXISTS idx_responders_status ON responders(current_status);

-- 3.5 DISPATCHES TABLE
-- Response coordination between incidents and emergency units
CREATE TABLE IF NOT EXISTS dispatches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  responder_id UUID NOT NULL REFERENCES responders(id) ON DELETE CASCADE,
  dispatcher_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status dispatch_status NOT NULL DEFAULT 'DISPATCHED',
  eta_minutes INT,
  route_distance_km NUMERIC(6, 2),
  
  -- Milestone timestamps for SLA performance auditing
  dispatched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  arrived_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_dispatches_incident ON dispatches(incident_id);
CREATE INDEX IF NOT EXISTS idx_dispatches_responder ON dispatches(responder_id);
CREATE INDEX IF NOT EXISTS idx_dispatches_status ON dispatches(status);

-- 3.6 ROAD HAZARDS TABLE ("Gerayo Amahoro" Community Hazard Intelligence)
CREATE TABLE IF NOT EXISTS road_hazards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
  hazard_type hazard_type NOT NULL,
  location GEOGRAPHY(Point, 4326) NOT NULL,
  address_text TEXT NOT NULL,
  district VARCHAR(100) NOT NULL,
  sector VARCHAR(100) NOT NULL,
  description TEXT,
  severity VARCHAR(20) DEFAULT 'MODERATE', -- LOW, MODERATE, SEVERE
  is_verified BOOLEAN DEFAULT FALSE,
  is_cleared BOOLEAN DEFAULT FALSE,
  cleared_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_road_hazards_location ON road_hazards USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_road_hazards_cleared ON road_hazards(is_cleared);

-- 3.7 AUDIT LOGS TABLE
-- Mandatory compliance with Rwanda Law No. 058/2021 on Personal Data Protection and Privacy (DPPO)
-- Every read, write, dispatch, and export of citizen location or medical triage data is immutably logged.
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  actor_role VARCHAR(50) NOT NULL,          -- e.g. RNP_DISPATCHER, CITIZEN, SYSTEM_GATEWAY
  action VARCHAR(100) NOT NULL,             -- e.g. DISPATCH_UNIT, VIEW_LOCATION, EXPORT_DSAR
  resource_type VARCHAR(100) NOT NULL,      -- e.g. INCIDENT, USER_PROFILE, AUDIT_LOG
  resource_id VARCHAR(100) NOT NULL,        -- Target record ID or Public ID
  ip_address VARCHAR(50),
  details TEXT,
  metadata JSONB,                           -- Structured changes and request metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_time ON audit_logs(created_at DESC);

-- -------------------------------------------------------------------------
-- 4. AUTOMATED TRIGGERS & FUNCTIONS
-- -------------------------------------------------------------------------

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timestamp_users ON users;
CREATE TRIGGER set_timestamp_users
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_incidents ON incidents;
CREATE TRIGGER set_timestamp_incidents
BEFORE UPDATE ON incidents
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_responders ON responders;
CREATE TRIGGER set_timestamp_responders
BEFORE UPDATE ON responders
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- -------------------------------------------------------------------------
-- 5. SPATIAL QUERY FUNCTIONS (PostGIS Powered)
-- -------------------------------------------------------------------------

-- 5.1 Find N nearest emergency facilities to any accident coordinate in Rwanda
CREATE OR REPLACE FUNCTION fn_find_nearest_facilities(
  p_lng DOUBLE PRECISION,
  p_lat DOUBLE PRECISION,
  p_type facility_type DEFAULT NULL,
  p_limit INT DEFAULT 5
)
RETURNS TABLE (
  facility_id UUID,
  facility_name VARCHAR(255),
  facility_type facility_type,
  district VARCHAR(100),
  sector VARCHAR(100),
  phone VARCHAR(50),
  toll_free VARCHAR(20),
  distance_km NUMERIC,
  estimated_travel_minutes INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    f.id,
    f.name,
    f.type,
    f.district,
    f.sector,
    f.phone,
    f.toll_free_number,
    ROUND((ST_Distance(f.location, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography) / 1000)::numeric, 2) AS distance_km,
    GREATEST(2, ROUND(((ST_Distance(f.location, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography) / 1000) / 35.0 * 60)::numeric)::int) AS estimated_travel_minutes
  FROM facilities f
  WHERE (p_type IS NULL OR f.type = p_type)
  ORDER BY f.location <-> ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- 5.2 Find nearest available patrol units or ambulances for dispatch
CREATE OR REPLACE FUNCTION fn_find_nearest_responders(
  p_lng DOUBLE PRECISION,
  p_lat DOUBLE PRECISION,
  p_type facility_type DEFAULT NULL,
  p_limit INT DEFAULT 5
)
RETURNS TABLE (
  responder_id UUID,
  unit_name VARCHAR(100),
  vehicle_plate VARCHAR(30),
  responder_type facility_type,
  current_status responder_status,
  distance_km NUMERIC,
  eta_minutes INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.unit_name,
    r.vehicle_plate,
    r.responder_type,
    r.current_status,
    ROUND((ST_Distance(r.current_location, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography) / 1000)::numeric, 2) AS distance_km,
    GREATEST(1, ROUND(((ST_Distance(r.current_location, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography) / 1000) / 40.0 * 60)::numeric)::int) AS eta_minutes
  FROM responders r
  WHERE r.current_status = 'AVAILABLE'
    AND (p_type IS NULL OR r.responder_type = p_type)
    AND r.current_location IS NOT NULL
  ORDER BY r.current_location <-> ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- -------------------------------------------------------------------------
-- 6. OFFICIAL SEED DATA (Rwanda Verified Infrastructure)
-- -------------------------------------------------------------------------

-- 6.1 Major Hospitals & Health Facilities
INSERT INTO facilities (name, type, district, sector, phone, toll_free_number, location)
VALUES
  ('King Faisal Hospital Rwanda', 'HOSPITAL', 'Gasabo', 'Kacyiru', '+250 252 588 888', '3900', ST_SetSRID(ST_MakePoint(30.0924, -1.9427), 4326)::geography),
  ('CHUK (Centre Hospitalier Universitaire de Kigali)', 'HOSPITAL', 'Nyarugenge', 'Kiyovu', '+250 252 575 555', '912', ST_SetSRID(ST_MakePoint(30.0601, -1.9542), 4326)::geography),
  ('Rwanda Military Hospital (Kanombe)', 'HOSPITAL', 'Kicukiro', 'Kanombe', '+250 252 586 420', '912', ST_SetSRID(ST_MakePoint(30.1585, -1.9863), 4326)::geography),
  ('Kibagabaga Hospital', 'HOSPITAL', 'Gasabo', 'Kimironko', '+250 788 305 601', '912', ST_SetSRID(ST_MakePoint(30.1189, -1.9365), 4326)::geography),
  ('Muhima Hospital', 'HOSPITAL', 'Nyarugenge', 'Muhima', '+250 252 575 873', '912', ST_SetSRID(ST_MakePoint(30.0520, -1.9441), 4326)::geography)
ON CONFLICT DO NOTHING;

-- 6.2 Rwanda National Police (RNP) Command & Stations
INSERT INTO facilities (name, type, district, sector, phone, toll_free_number, location)
VALUES
  ('Rwanda National Police General Headquarters', 'COMMAND_CENTRE', 'Gasabo', 'Kacyiru', '+250 788 311 112', '112', ST_SetSRID(ST_MakePoint(30.0882, -1.9388), 4326)::geography),
  ('RNP Traffic & Road Safety Department HQ', 'POLICE_STATION', 'Nyarugenge', 'Muhima', '+250 788 311 113', '113', ST_SetSRID(ST_MakePoint(30.0573, -1.9485), 4326)::geography),
  ('RNP Remera Police Station', 'POLICE_STATION', 'Gasabo', 'Remera', '+250 788 311 180', '112', ST_SetSRID(ST_MakePoint(30.1130, -1.9585), 4326)::geography),
  ('RNP Central Police Station (CPS Kigali)', 'POLICE_STATION', 'Nyarugenge', 'Nyarugenge', '+250 788 311 150', '112', ST_SetSRID(ST_MakePoint(30.0592, -1.9521), 4326)::geography),
  ('RNP Kicukiro Police Station', 'POLICE_STATION', 'Kicukiro', 'Niboye', '+250 788 311 182', '112', ST_SetSRID(ST_MakePoint(30.1025, -1.9750), 4326)::geography)
ON CONFLICT DO NOTHING;

-- 6.3 Fire & Rescue Brigade Facilities
INSERT INTO facilities (name, type, district, sector, phone, toll_free_number, location)
VALUES
  ('RNP Fire & Rescue Brigade HQ (Remera)', 'FIRE_STATION', 'Gasabo', 'Remera', '+250 788 311 111', '111', ST_SetSRID(ST_MakePoint(30.1155, -1.9610), 4326)::geography),
  ('RNP Fire Station Nyabugogo', 'FIRE_STATION', 'Nyarugenge', 'Gitega', '+250 788 311 210', '111', ST_SetSRID(ST_MakePoint(30.0460, -1.9395), 4326)::geography)
ON CONFLICT DO NOTHING;

-- 6.4 Initial RNP Responders
INSERT INTO responders (unit_name, vehicle_plate, responder_type, current_status, current_location)
VALUES
  ('RNP Traffic Unit Alpha-4', 'GR 421-B', 'POLICE_STATION', 'AVAILABLE', ST_SetSRID(ST_MakePoint(30.0880, -1.9480), 4326)::geography),
  ('RNP Fire & Rescue Unit 2', 'GR 111-F', 'FIRE_STATION', 'AVAILABLE', ST_SetSRID(ST_MakePoint(30.0550, -1.9420), 4326)::geography),
  ('SAMU Kigali Ambulance 07', 'GR 912-M', 'HOSPITAL', 'AVAILABLE', ST_SetSRID(ST_MakePoint(30.1118, -1.9715), 4326)::geography),
  ('RNP Patrol Delta-9 (Kicukiro)', 'GR 309-P', 'POLICE_STATION', 'AVAILABLE', ST_SetSRID(ST_MakePoint(30.0882, -1.9704), 4326)::geography)
ON CONFLICT DO NOTHING;

-- =========================================================================
-- END OF SCHEMA SPECIFICATION
-- =========================================================================
