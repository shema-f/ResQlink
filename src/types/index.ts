export type Language = 'en' | 'rw' | 'fr';

export type IncidentType = 
  | 'TRAFFIC_CAR'
  | 'TRAFFIC_MOTO'
  | 'TRAFFIC_TRUCK'
  | 'TRAFFIC_BUS'
  | 'PEDESTRIAN'
  | 'FIRE_EXPLOSION'
  | 'MEDICAL_CRITICAL'
  | 'ROAD_HAZARD';

export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';

export type IncidentStatus = 
  | 'REPORTED'
  | 'LOCATION_CONFIRMED'
  | 'TRIAGED'
  | 'DISPATCHED'
  | 'RESPONDER_EN_ROUTE'
  | 'ON_SCENE'
  | 'RESOLVED'
  | 'CANCELLED';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  addressText: string;
  district: string;
  sector: string;
  cell?: string;
  landmark?: string;
}

export interface Incident {
  id: string;
  publicId: string;
  type: IncidentType;
  priority: PriorityLevel;
  status: IncidentStatus;
  location: LocationData;
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

export interface EmergencyContact {
  id: string;
  code: string;
  name: string;
  nameRw: string;
  nameFr: string;
  number: string;
  category: 'POLICE' | 'HEALTH' | 'FIRE' | 'INTEGRITY' | 'TRAFFIC' | 'MARITIME';
  icon: string;
  description: string;
}

export interface Facility {
  id: string;
  name: string;
  type: 'POLICE_STATION' | 'HOSPITAL' | 'HEALTH_CENTER' | 'FIRE_STATION';
  district: string;
  sector: string;
  phone: string;
  latitude: number;
  longitude: number;
  distanceKm?: number;
  verified: boolean;
}

export interface RoadHazard {
  id: string;
  hazardType: 'POTHOLE' | 'LANDSLIDE' | 'BROKEN_LIGHT' | 'FALLEN_TREE' | 'FLOODING' | 'OIL_SPILL' | 'DAMAGED_BRIDGE';
  district: string;
  locationText: string;
  severity: 'DANGEROUS' | 'MODERATE' | 'ATTENTION';
  reportedAt: string;
  status: 'PENDING_INVESTIGATION' | 'CREW_ASSIGNED' | 'FIXED';
  /** CITIZEN = public submission awaiting verification, VERIFIED = confirmed by RNP/RTDA. */
  source?: 'CITIZEN' | 'VERIFIED';
}
