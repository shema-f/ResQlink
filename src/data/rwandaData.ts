import { EmergencyContact, Facility, Incident, RoadHazard } from '../types';

export const EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    id: '112',
    code: '112',
    name: 'General Emergency',
    nameRw: "Ubutabazi bw'Ihutirwa",
    nameFr: "Urgences Générales",
    number: '112',
    category: 'POLICE',
    icon: 'ShieldAlert',
    description: 'Rwanda National Police central dispatch center (24/7 Toll-free)'
  },
  {
    id: '113',
    code: '113',
    name: 'Traffic Accidents',
    nameRw: 'Impanuka zo mu Muhanda',
    nameFr: 'Accidents de Circulation',
    number: '113',
    category: 'TRAFFIC',
    icon: 'CarFront',
    description: 'RNP Traffic and Road Safety Department instant accident hotline'
  },
  {
    id: '111',
    code: '111',
    name: 'Fire and Rescue',
    nameRw: "Inkongi y'Umuriro",
    nameFr: 'Incendie et Secours',
    number: '111',
    category: 'FIRE',
    icon: 'Flame',
    description: 'RNP Fire and Rescue Brigade emergency dispatch'
  },
  {
    id: '912',
    code: '912',
    name: 'SAMU Ambulance',
    nameRw: "Imodoka y'Abakomeretse (SAMU)",
    nameFr: 'Service Ambulancier SAMU',
    number: '912',
    category: 'HEALTH',
    icon: 'Ambulance',
    description: 'National Emergency Medical Assistance Service (SAMU/MINISANTE)'
  },
  {
    id: '114',
    code: '114',
    name: 'Health Emergency Desk',
    nameRw: "Ubuzima no Kwirinda",
    nameFr: 'Urgences Sanitaires',
    number: '114',
    category: 'HEALTH',
    icon: 'HeartPulse',
    description: 'Ministry of Health & Rwanda Biomedical Centre (RBC)'
  },
  {
    id: '3511',
    code: '3511',
    name: 'Abuse by Police Officer',
    nameRw: "Ihohoterwa Rikozwe n'Umupolisi",
    nameFr: 'Abus par Agent de Police',
    number: '3511',
    category: 'INTEGRITY',
    icon: 'UserCheck',
    description: 'RNP Inspectorate of Police Professional Standards'
  },
  {
    id: '997',
    code: '997',
    name: 'Anti Corruption Desk',
    nameRw: 'Kurwanya Ruswa',
    nameFr: 'Lutte Contre la Corruption',
    number: '997',
    category: 'INTEGRITY',
    icon: 'Lock',
    description: 'RNP & Ombudsman Anti-Corruption reporting line'
  },
  {
    id: '110',
    code: '110',
    name: 'Maritime Problems',
    nameRw: "Impanuka mu Mazí (Ikiyaga)",
    nameFr: 'Sécurité Maritime / Lacs',
    number: '110',
    category: 'MARITIME',
    icon: 'Ship',
    description: 'Lake Kivu, Muhazi, and inland waterway police patrol unit'
  },
  {
    id: '118',
    code: '118',
    name: 'Driving License Queries',
    nameRw: 'Ibibazo bya Perimi',
    nameFr: 'Permis de Conduire',
    number: '118',
    category: 'TRAFFIC',
    icon: 'FileBadge',
    description: 'Automated status and official RNP driver testing assistance'
  }
];

export const RWANDA_FACILITIES: Facility[] = [
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

export const INITIAL_INCIDENTS: Incident[] = [
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
  },
  {
    id: 'inc-104',
    publicId: 'RW-2026-00181',
    type: 'FIRE_EXPLOSION',
    priority: 'CRITICAL',
    status: 'RESOLVED',
    location: {
      latitude: -1.9482,
      longitude: 30.1345,
      accuracyMeters: 12,
      addressText: 'KG 17 Ave, Kimironko Market perimeter',
      district: 'Gasabo',
      sector: 'Kimironko',
      landmark: 'Opposite Kimironko Taxi Park'
    },
    peopleAffected: 4,
    unconsciousCount: 0,
    firePresent: true,
    roadBlocked: false,
    description: 'Commercial bakery electrical short circuit flare-up. Extinguished by Remera Fire Brigade. No fatalities.',
    reporterPhone: '+250 785 667 890',
    createdAt: '2026-09-28T05:10:00Z',
    updatedAt: '2026-09-28T06:05:00Z'
  }
];

export const INITIAL_HAZARDS: RoadHazard[] = [
  {
    id: 'haz-1',
    hazardType: 'POTHOLE',
    district: 'Gasabo',
    locationText: 'KG 9 Ave, between Nyarutarama Tennis Club & MTN Centre',
    severity: 'DANGEROUS',
    reportedAt: '2026-09-28T06:00:00Z',
    status: 'CREW_ASSIGNED'
  },
  {
    id: 'haz-2',
    hazardType: 'BROKEN_LIGHT',
    district: 'Kicukiro',
    locationText: 'Sonatubes Junction, primary traffic light blinking red',
    severity: 'MODERATE',
    reportedAt: '2026-09-28T05:30:00Z',
    status: 'PENDING_INVESTIGATION'
  },
  {
    id: 'haz-3',
    hazardType: 'OIL_SPILL',
    district: 'Nyarugenge',
    locationText: 'Muhima slope towards Kinamba round-about',
    severity: 'DANGEROUS',
    reportedAt: '2026-09-28T06:12:00Z',
    status: 'CREW_ASSIGNED'
  }
];

export const PRESET_LOCATIONS: { name: string; district: string; sector: string; lat: number; lng: number; landmark: string }[] = [
  {
    name: 'Kigali Convention Centre / Kimihurura',
    district: 'Gasabo',
    sector: 'Kimihurura',
    lat: -1.9536,
    lng: 30.0984,
    landmark: 'Near Kigali Heights roundabout'
  },
  {
    name: 'Nyabugogo Bus Terminal / Downtown link',
    district: 'Nyarugenge',
    sector: 'Gitega',
    lat: -1.9392,
    lng: 30.0451,
    landmark: 'Nyabugogo River Bridge corridor'
  },
  {
    name: 'Remera - Giporoso / Amahoro Stadium',
    district: 'Gasabo',
    sector: 'Remera',
    lat: -1.9585,
    lng: 30.1130,
    landmark: 'Near BK Arena & Prince House'
  },
  {
    name: 'Kicukiro Centre / Sonatubes Junction',
    district: 'Kicukiro',
    sector: 'Kicukiro',
    lat: -1.9704,
    lng: 30.0882,
    landmark: 'Flyover interchange towards Bugesera'
  },
  {
    name: 'Musanze Town Center (Northern Province)',
    district: 'Musanze',
    sector: 'Muhoza',
    lat: -1.5034,
    lng: 29.6349,
    landmark: 'RN4 junction towards Volcanoes National Park'
  },
  {
    name: 'Huye Town Center (Southern Province)',
    district: 'Huye',
    sector: 'Ngoma',
    lat: -2.6033,
    lng: 29.7420,
    landmark: 'Near National University & Arboretum'
  }
];
