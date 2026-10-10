import { Incident, Facility, LocationData } from '../types';
import { io, Socket } from 'socket.io-client';

export const API_BASE = '/api';

export interface NearbyFacilityResponse extends Facility {
  distanceKm: number;
  estimatedTravelMinutes: number;
}

export interface ReverseGeocodeResult {
  formattedAddress: string;
  district: string;
  sector: string;
}

let socketInstance: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socketInstance) {
    socketInstance = io(window.location.origin, {
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      transports: ['websocket', 'polling']
    });
  }
  return socketInstance;
};

export const apiService = {
  // Real-time socket getter
  getSocket,

  // Check backend health
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`);
      return await res.json();
    } catch (e) {
      console.warn('Backend offline or starting up', e);
      return null;
    }
  },

  // Fetch all incidents
  async getIncidents(): Promise<Incident[]> {
    try {
      const res = await fetch(`${API_BASE}/incidents`);
      const data = await res.json();
      return data.data || [];
    } catch {
      return [];
    }
  },

  // Create new incident
  async createIncident(incident: Partial<Incident>): Promise<Incident | null> {
    try {
      const res = await fetch(`${API_BASE}/incidents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incident)
      });
      const data = await res.json();
      return data.data || null;
    } catch {
      return null;
    }
  },

  // Update incident status or responder
  async updateIncident(id: string, updates: { status?: Incident['status']; assignedResponder?: Incident['assignedResponder'] }): Promise<Incident | null> {
    try {
      const res = await fetch(`${API_BASE}/incidents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      return data.data || null;
    } catch {
      return null;
    }
  },

  // PostGIS spatial KNN calculation for nearest facilities
  async getNearbyFacilities(lat: number, lng: number): Promise<NearbyFacilityResponse[]> {
    try {
      const res = await fetch(`${API_BASE}/facilities/nearby?lat=${lat}&lng=${lng}&limit=6`);
      const data = await res.json();
      return data.data || [];
    } catch {
      return [];
    }
  },

  // Reverse Geocoding
  async reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult | null> {
    try {
      const res = await fetch(`${API_BASE}/geocode/reverse?lat=${lat}&lng=${lng}`);
      const data = await res.json();
      if (data.success) {
        return {
          formattedAddress: data.formattedAddress,
          district: data.district,
          sector: data.sector
        };
      }
      return null;
    } catch {
      return null;
    }
  },

  // Request Phone OTP
  async requestOtp(phoneNumber: string): Promise<{ success: boolean; demoCode?: string; message: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/otp/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber })
      });
      return await res.json();
    } catch {
      return { success: false, message: 'Failed to connect to SMS Gateway.' };
    }
  },

  // Verify Phone OTP
  async verifyOtp(phoneNumber: string, otpCode: string): Promise<{ success: boolean; user?: any; message: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, otpCode })
      });
      return await res.json();
    } catch {
      return { success: false, message: 'Verification error' };
    }
  },

  // Get SMS / USSD Fallback payload
  async getSmsPreview(incidentId: string) {
    try {
      const res = await fetch(`${API_BASE}/sms/preview?id=${incidentId}`);
      return await res.json();
    } catch {
      return null;
    }
  },

  // Send Live SMS through Africa's Talking simulation
  async sendEmergencySms(to: string, message: string, incidentPublicId: string) {
    try {
      const res = await fetch(`${API_BASE}/sms/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, message, incidentPublicId })
      });
      return await res.json();
    } catch {
      return { success: false, message: 'Failed to transmit SMS' };
    }
  },

  // Interactive USSD *113# Simulator
  async runUssdSession(text: string, phoneNumber = '+250788412901'): Promise<string> {
    try {
      const res = await fetch(`${API_BASE}/ussd/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: 'ussd-sim-1', phoneNumber, text })
      });
      return await res.text();
    } catch {
      return 'END Connection timeout to USSD gateway *113#';
    }
  },

  // Database status
  async getDatabaseStatus() {
    try {
      const res = await fetch(`${API_BASE}/database/status`);
      return await res.json();
    } catch {
      return null;
    }
  },

  // Test custom PostgreSQL/PostGIS connection
  async testDatabaseConnection(connectionString: string) {
    try {
      const res = await fetch(`${API_BASE}/database/test-connection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionString })
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, message: e.message || 'Connection test failed' };
    }
  },

  // Get DPPO Audit Logs
  async getAuditLogs() {
    try {
      const res = await fetch(`${API_BASE}/audit-logs`);
      return await res.json();
    } catch {
      return { success: false, data: [] };
    }
  },

  // Get Responders
  async getResponders() {
    try {
      const res = await fetch(`${API_BASE}/responders`);
      const data = await res.json();
      return data.data || [];
    } catch {
      return [];
    }
  },

  // Send Responder GPS Heartbeat
  async updateResponderLocation(responderId: string, latitude: number, longitude: number, status?: string) {
    try {
      const res = await fetch(`${API_BASE}/responders/location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responderId, latitude, longitude, status })
      });
      return await res.json();
    } catch {
      return null;
    }
  }
};
