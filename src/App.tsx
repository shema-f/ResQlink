import React, { useState, useEffect } from 'react';
import { Incident, Language } from './types';
import { INITIAL_INCIDENTS } from './data/rwandaData';
import { RNPHeader } from './components/RNPHeader';
import { CitizenSOS } from './components/CitizenSOS';
import { CommandDashboard } from './components/CommandDashboard';
import { ResponderView } from './components/ResponderView';
import { RoadHazardReport } from './components/RoadHazardReport';
import { CampaignsView } from './components/CampaignsView';
import { BackendGuideModal } from './components/BackendGuideModal';
import { CallHotlineModal } from './components/CallHotlineModal';
import { PhoneAuthModal } from './components/PhoneAuthModal';
import { apiService } from './services/api';
import { emergencyAudio } from './utils/audio';

export default function App() {
  const [currentLang, setCurrentLang] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<string>('citizen');
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [activeHotline, setActiveHotline] = useState<{ number: string; serviceName: string } | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<{ phoneNumber: string; verified: boolean } | null>(() => {
    try {
      const saved = localStorage.getItem('resqlink_user');
      return saved ? JSON.parse(saved) : { phoneNumber: '+250 788 412 901', verified: true };
    } catch {
      return { phoneNumber: '+250 788 412 901', verified: true };
    }
  });

  // Sync incidents from the Express backend on mount and poll
  useEffect(() => {
    const fetchIncidents = async () => {
      const data = await apiService.getIncidents();
      if (data && data.length > 0) {
        setIncidents(data);
      }
    };

    fetchIncidents();
    const interval = setInterval(fetchIncidents, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleAuthSuccess = (user: { phoneNumber: string; verified: boolean }) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('resqlink_user', JSON.stringify(user));
    } catch {
      // ignore
    }
  };

  const handleNewIncident = (incident: Incident) => {
    setIncidents((prev) => [incident, ...prev.filter((i) => i.id !== incident.id)]);
  };

  const handleUpdateIncidentStatus = async (id: string, newStatus: Incident['status']) => {
    // Optimistic UI update
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === id
          ? {
              ...inc,
              status: newStatus,
              updatedAt: new Date().toISOString(),
              resolvedAt: newStatus === 'RESOLVED' ? new Date().toISOString() : inc.resolvedAt
            }
          : inc
      )
    );

    // Persist to Express backend
    await apiService.updateIncident(id, { status: newStatus });
  };

  const handleAssignResponder = async (incidentId: string, responderType: 'POLICE' | 'AMBULANCE' | 'FIRE') => {
    const responderMap = {
      POLICE: {
        id: 'resp-p-new',
        name: 'RNP Traffic Unit Kigali Alpha',
        unit: 'Patrol 12-A',
        type: 'POLICE' as const,
        etaMinutes: 5,
        phone: '+250 788 311 113'
      },
      AMBULANCE: {
        id: 'resp-a-new',
        name: 'SAMU Kigali Ambulance 03',
        unit: 'SAMU ICU Rapid 03',
        type: 'AMBULANCE' as const,
        etaMinutes: 8,
        phone: '+250 788 912 003'
      },
      FIRE: {
        id: 'resp-f-new',
        name: 'RNP Fire & Rescue Remera Unit',
        unit: 'Pumper 01',
        type: 'FIRE' as const,
        etaMinutes: 6,
        phone: '+250 788 311 111'
      }
    };

    const assigned = responderMap[responderType];

    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== incidentId) return inc;
        return {
          ...inc,
          status: 'DISPATCHED',
          assignedResponder: assigned,
          updatedAt: new Date().toISOString()
        };
      })
    );

    await apiService.updateIncident(incidentId, {
      status: 'DISPATCHED',
      assignedResponder: assigned
    });
  };

  const handleCallHotline = (number: string, serviceName: string) => {
    setActiveHotline({ number, serviceName });
  };

  return (
    <div className="min-h-screen bg-[#071120] text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* Official Rwanda National Police Header */}
      <RNPHeader
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onCallHotline={handleCallHotline}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'citizen' && (
          <CitizenSOS
            currentLang={currentLang}
            onNewIncident={handleNewIncident}
            activeIncidents={incidents}
            onCallHotline={handleCallHotline}
          />
        )}

        {activeTab === 'command' && (
          <CommandDashboard
            currentLang={currentLang}
            incidents={incidents}
            onUpdateIncidentStatus={handleUpdateIncidentStatus}
            onAssignResponder={handleAssignResponder}
            onCallHotline={handleCallHotline}
          />
        )}

        {activeTab === 'responder' && (
          <ResponderView
            currentLang={currentLang}
            activeIncidents={incidents}
            onUpdateIncidentStatus={handleUpdateIncidentStatus}
            onCallHotline={handleCallHotline}
          />
        )}

        {activeTab === 'hazards' && (
          <RoadHazardReport currentLang={currentLang} />
        )}

        {activeTab === 'campaigns' && (
          <CampaignsView currentLang={currentLang} onCallHotline={handleCallHotline} />
        )}

        {activeTab === 'blueprint' && (
          <BackendGuideModal />
        )}
      </main>

      {/* Official RNP / resQlink Footer */}
      <footer className="w-full bg-[#050d1a] border-t border-slate-800/80 text-slate-400 py-6 px-4 text-center text-xs space-y-3">
        {/* Police Checkerboard Ribbon */}
        <div className="w-full h-1.5 flex overflow-hidden opacity-60 max-w-4xl mx-auto rounded-full">
          {Array.from({ length: 36 }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-full ${i % 2 === 0 ? 'bg-amber-400' : 'bg-[#0f2756]'}`}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400">
          <span>Rwanda National Police (RNP) &bull; Service &bull; Protection &bull; Integrity</span>
          <span>&bull;</span>
          <span>Emergency Toll-Free: 112 / 113 / 111 / 912</span>
          <span>&bull;</span>
          <span>Republic of Rwanda Data Protection &amp; Privacy Office (DPPO) Compliant</span>
        </div>

        <p className="text-[10px] text-slate-500">
          resQlink Rwanda Emergency Response Platform &copy; 2026. All rights reserved.
        </p>
      </footer>

      {/* Call Hotline Modal */}
      {activeHotline && (
        <CallHotlineModal
          hotline={activeHotline}
          onClose={() => setActiveHotline(null)}
        />
      )}

      {/* Phone OTP Verification Modal */}
      <PhoneAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        currentUser={currentUser}
      />
    </div>
  );
}
