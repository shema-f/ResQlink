import { Incident, Facility, LocationData } from '../types';
import type { Socket } from 'socket.io-client';

export const API_BASE = '/api';

// Production deployments gate dispatch mutations behind DISPATCH_API_KEY;
// the browser attaches it here when VITE_DISPATCH_API_KEY is configured.
// In the local demo the endpoints are open (clearly labelled as a prototype).
const dispatchApiKey = (import.meta.env.VITE_DISPATCH_API_KEY as string | undefined) || undefined;
const jsonHeaders: Record<string, string> = {
  'Content-Type': 'application/json',
  ...(dispatchApiKey ? { 'x-dispatch-api-key': dispatchApiKey } : {})
};

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
let socketPromise: Promise<Socket> | null = null;

/**
 * Lazily pulls in socket.io-client so the realtime stack stays out of the
 * initial (marketing) bundle and only loads for the live dashboards.
 */
export const getSocket = async (): Promise<Socket> => {
  if (socketInstance) return socketInstance;
  if (!socketPromise) {
    socketPromise = import('socket.io-client').then(({ io }) => {
      socketInstance = io(window.location.origin, {
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
        transports: ['websocket', 'polling']
      });
      return socketInstance;
    });
  }
  return socketPromise;
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
        headers: jsonHeaders,
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
        headers: jsonHeaders,
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
        headers: jsonHeaders,
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

  // Ask the AI emergency copilot ("Uwera") for guidance
  async askAiAssistant(
    message: string,
    language: string = 'en',
    history: Array<{ role: 'user' | 'assistant'; content: string }> = []
  ): Promise<{ success: boolean; engine?: string; reply: string; suggestions?: string[] } | null> {
    try {
      const res = await fetch(`${API_BASE}/ai/assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, language, history })
      });
      return await res.json();
    } catch {
      return null;
    }
  },

  // Whether the Gemini copilot is live or running guided answers
  async getAiStatus(): Promise<{ online: boolean; model: string; mode: string } | null> {
    try {
      const res = await fetch(`${API_BASE}/ai/status`);
      return await res.json();
    } catch {
      return null;
    }
  },

  // Referral stats for a citizen invite code
  async getReferralStats(code: string): Promise<any | null> {
    try {
      const res = await fetch(`${API_BASE}/referral/${encodeURIComponent(code)}`);
      const data = await res.json();
      return data.data || null;
    } catch {
      return null;
    }
  },

  // Record a share or an accepted invite
  async claimReferral(code: string, channel: string, installed = false) {
    try {
      const res = await fetch(`${API_BASE}/referral/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, channel, installed })
      });
      return await res.json();
    } catch {
      return null;
    }
  },

  // Top citizen referrers
  async getReferralLeaderboard(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/referral/leaderboard`);
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
        headers: jsonHeaders,
        body: JSON.stringify({ responderId, latitude, longitude, status })
      });
      return await res.json();
    } catch {
      return null;
    }
  }
};
