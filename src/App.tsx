import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Incident, Language } from './types';
import { INITIAL_INCIDENTS } from './data/rwandaData';
import { TRANSLATIONS } from './data/translations';
import { RNPHeader } from './components/RNPHeader';
import { LandingPage } from './components/LandingPage';
import { CallHotlineModal } from './components/CallHotlineModal';
import { PhoneAuthModal } from './components/PhoneAuthModal';
import { AIAssistant } from './components/AIAssistant';
import { ViewLoader } from './components/ViewLoader';
import { GooglePlayBadge, AppStoreBadge } from './components/StoreBadges';
import { LazyViews, onIdle, prefetchLightViews } from './routes/lazyViews';
import { captureIncomingReferral, clearIncomingReferral } from './services/referral';
import { apiService } from './services/api';
import { useTheme } from './hooks/useTheme';
import { ShieldCheck, X, Sparkles, PhoneCall, Heart, Users } from 'lucide-react';

export default function App() {
  const [currentLang, setCurrentLang] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<string>('home');
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [activeHotline, setActiveHotline] = useState<{ number: string; serviceName: string } | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [aiOpen, setAiOpen] = useState<boolean>(false);
  const [promoDismissed, setPromoDismissed] = useState<boolean>(false);
  const { theme, toggleTheme } = useTheme();
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const claimedRef = useRef(false);
  const [currentUser, setCurrentUser] = useState<{ phoneNumber: string; verified: boolean } | null>(() => {
    // No simulated identity: the app never seeds a pre-verified phone number.
    // A session only exists after an explicit (demo) OTP verification on this
    // device; malformed or legacy hardcoded demo sessions are discarded.
    try {
      const saved = localStorage.getItem('resqlink_user');
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      const isLegitimate =
        parsed &&
        typeof parsed.phoneNumber === 'string' &&
        parsed.verified === true &&
        parsed.phoneNumber !== '+250 788 412 901'; // legacy hardcoded demo identity
      return isLegitimate ? parsed : null;
    } catch {
      return null;
    }
  });

  const t = TRANSLATIONS[currentLang];

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

  // Always start a new section at the top of the page
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  // Warm the light view chunks once the browser is idle so navigation is instant.
  useEffect(() => onIdle(prefetchLightViews), []);

  // Pick up ?ref=CODE from an invite link and credit the inviter once
  useEffect(() => {
    const code = captureIncomingReferral();
    if (!code) return;
    setInviteCode(code);
    if (claimedRef.current) return;
    claimedRef.current = true;
    void apiService.claimReferral(code, 'INVITE_LINK', true);
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

  const showPromoBar = activeTab !== 'home' && !promoDismissed;

  return (
    <div className="flex min-h-screen flex-col bg-ink-950 font-sans text-slate-100">
      {/* Official Rwanda National Police Header */}
      <RNPHeader
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onCallHotline={handleCallHotline}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenAi={() => setAiOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Invited-by banner (?ref=CODE) */}
      {inviteCode && (
        <div className="border-b border-rwsun-500/25 bg-gradient-to-r from-rwsun-500/14 via-rwsun-500/5 to-transparent">
          <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 sm:px-6">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-rwsun-500 text-btn-ink">
              <Users className="h-4 w-4" />
            </span>
            <p className="min-w-0 flex-1 text-[12px] leading-relaxed text-rwsun-100">
              You were invited by{' '}
              <span className="font-mono font-black text-rwsun-300">{inviteCode}</span>. Welcome to
              the safety net — their invite has been credited.
            </p>
            <button
              onClick={() => setActiveTab('invite')}
              className="hidden shrink-0 rounded-xl bg-rwsun-500 px-3 py-1.5 text-[11px] font-black text-btn-ink transition-transform hover:-translate-y-0.5 sm:block"
            >
              Invite your own
            </button>
            <button
              onClick={() => {
                setInviteCode(null);
                clearIncomingReferral();
              }}
              aria-label="Dismiss invite banner"
              className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-rwsun-300/70 transition-colors hover:text-ink-hd"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {/* Marketing landing page — eagerly bundled, it is the default route. */}
        {activeTab === 'home' && (
          <LandingPage
            currentLang={currentLang}
            onNavigate={setActiveTab}
            onCallHotline={handleCallHotline}
            onOpenAi={() => setAiOpen(true)}
          />
        )}

        {/* Everything else is code-split and streamed in on demand. */}
        <Suspense fallback={<ViewLoader />}>
          {activeTab === 'citizen' && (
            <LazyViews.citizen
              currentLang={currentLang}
              onNewIncident={handleNewIncident}
              activeIncidents={incidents}
              onCallHotline={handleCallHotline}
            />
          )}

          {activeTab === 'command' && (
            <LazyViews.command
              currentLang={currentLang}
              incidents={incidents}
              onUpdateIncidentStatus={handleUpdateIncidentStatus}
              onAssignResponder={handleAssignResponder}
              onCallHotline={handleCallHotline}
            />
          )}

          {activeTab === 'responder' && (
            <LazyViews.responder
              currentLang={currentLang}
              activeIncidents={incidents}
              onUpdateIncidentStatus={handleUpdateIncidentStatus}
              onCallHotline={handleCallHotline}
            />
          )}

          {activeTab === 'hazards' && <LazyViews.hazards currentLang={currentLang} />}

          {activeTab === 'campaigns' && (
            <LazyViews.campaigns currentLang={currentLang} onCallHotline={handleCallHotline} />
          )}

          {activeTab === 'invite' && (
            <LazyViews.invite currentLang={currentLang} onNavigate={setActiveTab} />
          )}

          {activeTab === 'press' && <LazyViews.press />}

          {activeTab === 'blueprint' && <LazyViews.blueprint />}
        </Suspense>
      </main>

      {/* Official RNP / resQlink Footer */}
      <footer className="relative mt-auto overflow-hidden border-t border-white/8 bg-ink-950">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-20" />

        {/* Police battenburg ribbon */}
        <div className="flex h-3 w-full overflow-hidden opacity-80 sm:h-4">
          {Array.from({ length: 60 }).map((_, i) => (
            <div
              key={i}
              className={`h-full flex-1 ${i % 2 === 0 ? 'bg-rwsun-500' : 'bg-rwblue-700'}`}
            />
          ))}
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-rwblue-400 to-rwblue-600 text-[11px] font-black text-btn-ink">
                RQ
              </span>
              <span className="text-lg font-extrabold tracking-tight text-ink-hd">
                res<span className="text-rwblue-400">Q</span>link
              </span>
            </div>
            <p className="mt-4 max-w-md text-[13px] leading-relaxed text-slate-400">
              {t.tagline}. One tap connects every citizen to the Rwanda National Police, SAMU and the
              Fire &amp; Rescue Brigade — with an AI copilot in Kinyarwanda, English and French.
            </p>

            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <GooglePlayBadge size="sm" lang={currentLang} />
              <AppStoreBadge size="sm" lang={currentLang} />
            </div>
          </div>

          <div>
            <h4 className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
              Explore
            </h4>
            <ul className="mt-4 space-y-2.5 text-[13px]">
              {[
                ['home', t.home],
                ['citizen', t.citizenSos],
                ['command', t.commandDashboard],
                ['responder', t.responderPortal],
                ['hazards', t.roadSafetyHazards],
                ['campaigns', t.campaigns],
                ['invite', t.invite],
                ['press', t.pressKit]
              ].map(([id, label]) => (
                <li key={id}>
                  <button
                    onClick={() => setActiveTab(id)}
                    className="text-slate-400 transition-colors hover:text-ink-hd"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
              Toll-free lines
            </h4>
            <ul className="mt-4 space-y-2.5 text-[13px]">
              {[
                ['112', 'General Emergency'],
                ['113', 'RNP Traffic'],
                ['111', 'Fire & Rescue'],
                ['912', 'SAMU Ambulance'],
                ['3511', 'Police Misconduct'],
                ['997', 'Anti-Corruption']
              ].map(([num, label]) => (
                <li key={num}>
                  <button
                    onClick={() => handleCallHotline(num, label)}
                    className="group flex items-center gap-2 text-slate-400 transition-colors hover:text-ink-hd"
                  >
                    <PhoneCall className="h-3.5 w-3.5 text-rwblue-400" />
                    <span className="font-mono font-bold text-slate-300 group-hover:text-rwsun-400">
                      {num}
                    </span>
                    <span>{label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="relative border-t border-white/6 px-4 py-5 sm:px-6">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-[11px] text-slate-500 md:flex-row">
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              Rwanda National Police · Service · Protection · Integrity
            </span>
            <span className="flex items-center gap-2">
              <span>DPPO Compliant · Law No. 058/2021</span>
            </span>
            <span className="flex items-center gap-2">
              Built with <Heart className="h-3 w-3 text-alert-400" /> for Rwanda
            </span>
          </div>
          <p className="mx-auto mt-3 max-w-7xl text-center text-[10px] text-slate-600 md:text-left">
            resQlink Rwanda Emergency Response Platform © 2026 — an engineering prototype by
            Ferrivox. All incident, responder and identity data in this build is simulated, and no
            request reaches RNP, SAMU or any emergency service. Uwera AI provides guidance only and
            never replaces an RNP or SAMU dispatcher.
          </p>
        </div>
      </footer>

      {/* Sticky app-download promo bar (hidden on the landing page) */}
      {showPromoBar && (
        <div className="fixed inset-x-0 bottom-0 z-[75] border-t border-white/10 bg-ink-900/92 px-3 py-2.5 backdrop-blur-2xl">
          <div className="mx-auto flex max-w-5xl items-center gap-3">
            <span className="hidden h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-rwblue-400 to-rwblue-600 text-btn-ink sm:grid">
              <Sparkles className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-extrabold text-ink-hd">
                Explore the resQlink prototype
              </p>
              <p className="truncate text-[10.5px] text-slate-400">
                Source code and API documentation are available on GitHub.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <GooglePlayBadge size="sm" lang={currentLang} className="hidden sm:inline-flex" />
              <AppStoreBadge size="sm" lang={currentLang} className="hidden sm:inline-flex" />
              <a
                href="https://github.com/shema-f/ResQlink"
                target="_blank"
                rel="noopener noreferrer"
                className="sm:hidden rounded-xl bg-rwblue-500 px-3 py-2 text-[11px] font-black text-btn-ink"
              >
                View source
              </a>
              <button
                onClick={() => setPromoDismissed(true)}
                aria-label="Dismiss download banner"
                className="grid h-7 w-7 place-items-center rounded-lg text-slate-500 transition-colors hover:text-ink-hd"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Emergency Copilot */}
      <AIAssistant
        currentLang={currentLang}
        onCallHotline={handleCallHotline}
        open={aiOpen}
        onOpenChange={setAiOpen}
        raised={showPromoBar}
      />

      {/* Call Hotline Modal */}
      {activeHotline && (
        <CallHotlineModal hotline={activeHotline} onClose={() => setActiveHotline(null)} />
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
