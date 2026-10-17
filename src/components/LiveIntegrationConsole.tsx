import React, { useState, useEffect } from 'react';
import { apiService, getSocket } from '../services/api';
import type { Socket } from 'socket.io-client';
import {
  Activity,
  Database,
  Radio,
  Send,
  Smartphone,
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Terminal,
  ShieldCheck,
  Download,
  Copy,
  Check,
  MapPin,
  Flame,
  Globe
} from 'lucide-react';
import { emergencyAudio } from '../utils/audio';

export const LiveIntegrationConsole: React.FC = () => {
  // Socket.IO Status
  const [socketConnected, setSocketConnected] = useState<boolean>(false);
  const [socketId, setSocketId] = useState<string>('Connecting...');
  const [recentEvents, setRecentEvents] = useState<{ id: string; event: string; time: string; payload: any }[]>([]);

  // Database Connection Tester
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [customConnString, setCustomConnString] = useState<string>('');
  const [testingConn, setTestingConn] = useState<boolean>(false);
  const [connResult, setConnResult] = useState<any>(null);

  // PostGIS Spatial Distance Test
  const [testLat, setTestLat] = useState<number>(-1.9536);
  const [testLng, setTestLng] = useState<number>(30.0984);
  const [spatialResults, setSpatialResults] = useState<any[]>([]);
  const [calculatingSpatial, setCalculatingSpatial] = useState<boolean>(false);

  // Reverse Geocoding Test
  const [geoResult, setGeoResult] = useState<any>(null);
  const [geocoding, setGeocoding] = useState<boolean>(false);

  // SMS Gateway Test (Africa's Talking Rwanda)
  const [smsTo, setSmsTo] = useState<string>('+250113');
  const [smsMessage, setSmsMessage] = useState<string>('RESQ RW-2026-00184 LOC:-1.9536,30.0984 INJ:3 UNCON:1 RNP_DISPATCH_REQ');
  const [smsSending, setSmsSending] = useState<boolean>(false);
  const [smsResult, setSmsResult] = useState<any>(null);

  // USSD *113# Interactive Terminal
  const [ussdInput, setUssdInput] = useState<string>('');
  const [ussdHistory, setUssdHistory] = useState<string>('*113#');
  const [ussdScreen, setUssdScreen] = useState<string>('');
  const [ussdLoading, setUssdLoading] = useState<boolean>(false);
  const [ussdActive, setUssdActive] = useState<boolean>(false);

  // DPPO Audit Logs
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [copied, setCopied] = useState<boolean>(false);

  // Backend API health — a real fetch with an honest timestamp
  const [apiHealth, setApiHealth] = useState<any>(null);
  const [apiCheckedAt, setApiCheckedAt] = useState<string | null>(null);
  const [dbChecked, setDbChecked] = useState<boolean>(false);

  const refreshHealth = async () => {
    const health = await apiService.checkHealth();
    setApiHealth(health);
    setApiCheckedAt(new Date().toISOString());
    const db = await apiService.getDatabaseStatus();
    setDbStatus(db);
    setDbChecked(true);
  };

  useEffect(() => {
    let activeSocket: Socket | null = null;
    let cancelled = false;

    const handleConnect = () => {
      setSocketConnected(true);
      setSocketId(activeSocket?.id || 'Connected');
    };

    const handleDisconnect = () => {
      setSocketConnected(false);
    };

    let counter = 0;
    const createEventId = () => `ev-${Date.now()}-${++counter}-${Math.random().toString(36).slice(2, 7)}`;

    const handleIncidentNew = (data: any) => {
      setRecentEvents((prev) => [
        { id: createEventId(), event: '🚨 incident:new', time: new Date().toLocaleTimeString(), payload: data },
        ...prev.slice(0, 15)
      ]);
    };

    const handleResponderMoved = (data: any) => {
      setRecentEvents((prev) => [
        { id: createEventId(), event: '🚔 responder:moved', time: new Date().toLocaleTimeString(), payload: data },
        ...prev.slice(0, 15)
      ]);
    };

    const handleIncidentUpdated = (data: any) => {
      setRecentEvents((prev) => [
        { id: createEventId(), event: '✅ incident:updated', time: new Date().toLocaleTimeString(), payload: data },
        ...prev.slice(0, 15)
      ]);
    };

    // 1. Socket.IO listener — lazy-loaded so the realtime stack stays out of
    //    the initial (marketing) bundle.
    getSocket().then((socket) => {
      if (cancelled) return;
      activeSocket = socket;
      if (socket.connected) {
        setSocketConnected(true);
        setSocketId(socket.id || 'Connected');
      }
      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);
      socket.on('incident:new', handleIncidentNew);
      socket.on('responder:moved', handleResponderMoved);
      socket.on('incident:updated', handleIncidentUpdated);
    });

    // 2. Load DB Status, API health & Audit Logs
    refreshHealth();
    apiService.getAuditLogs().then((res) => setAuditLogs(res.data || []));

    // 3. Run default spatial calculation
    runSpatialTest(-1.9536, 30.0984);

    return () => {
      cancelled = true;
      activeSocket?.off('connect', handleConnect);
      activeSocket?.off('disconnect', handleDisconnect);
      activeSocket?.off('incident:new', handleIncidentNew);
      activeSocket?.off('responder:moved', handleResponderMoved);
      activeSocket?.off('incident:updated', handleIncidentUpdated);
    };
  }, []);

  const runSpatialTest = async (lat: number, lng: number) => {
    setCalculatingSpatial(true);
    const facilities = await apiService.getNearbyFacilities(lat, lng);
    setSpatialResults(facilities);
    setCalculatingSpatial(false);
  };

  const handleTestDatabaseConn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customConnString.trim()) return;

    setTestingConn(true);
    setConnResult(null);
    const res = await apiService.testDatabaseConnection(customConnString);
    setConnResult(res);
    setTestingConn(false);
  };

  const handleTestGeocode = async () => {
    setGeocoding(true);
    const res = await apiService.reverseGeocode(testLat, testLng);
    setGeoResult(res);
    setGeocoding(false);
  };

  const handleSendSms = async (e: React.FormEvent) => {
    e.preventDefault();
    setSmsSending(true);
    const res = await apiService.sendEmergencySms(smsTo, smsMessage, 'RW-2026-00184');
    setSmsResult(res);
    setSmsSending(false);
    // Refresh audit logs
    apiService.getAuditLogs().then((r) => setAuditLogs(r.data || []));
  };

  // USSD *113# dial session
  const startUssd = async () => {
    setUssdActive(true);
    setUssdLoading(true);
    setUssdHistory('*113#');
    setUssdInput('');
    const text = await apiService.runUssdSession('');
    setUssdScreen(text);
    setUssdLoading(false);
  };

  const sendUssdStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ussdInput.trim()) return;

    setUssdLoading(true);
    const newHistory = ussdHistory === '*113#' ? ussdInput : `${ussdHistory}*${ussdInput}`;
    setUssdHistory(newHistory);

    // Query server
    const query = newHistory.replace('*113#*', '').replace('*113#', '');
    const text = await apiService.runUssdSession(query);
    setUssdScreen(text);
    setUssdInput('');
    setUssdLoading(false);
  };

  const downloadAuditJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `resQlink_DPPO_Audit_Package_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 text-ink-hd text-xs">
      {/* Live Services Status Summary Header — only real fetch results are
          painted green; unknown stays grey and failure stays red. */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Backend API health */}
        <div className="bg-panel border border-slate-800 rounded-2xl p-3.5 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-rwblue-600 block uppercase">resQlink API</span>
            <div className="text-sm font-bold text-ink-hd flex items-center gap-1.5 mt-0.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  apiHealth ? 'bg-emerald-400' : apiCheckedAt ? 'bg-red-500' : 'bg-slate-500'
                }`}
              />
              <span>{apiHealth ? 'API Healthy' : apiCheckedAt ? 'API Unreachable' : 'Checking…'}</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
              {apiCheckedAt ? `checked ${new Date(apiCheckedAt).toLocaleTimeString()}` : 'no response yet'}
            </span>
          </div>
          <Activity className="w-6 h-6 text-rwblue-500 opacity-80" />
        </div>

        {/* Socket.IO */}
        <div className="bg-panel border border-slate-800 rounded-2xl p-3.5 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-cyan-300 block uppercase">Real-Time WebSockets</span>
            <div className="text-sm font-bold text-ink-hd flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-emerald-400 animate-ping' : 'bg-red-500'}`} />
              <span>{socketConnected ? 'Socket.IO Online' : 'Connecting…'}</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">ID: {socketId.slice(0, 10)}...</span>
          </div>
          <Radio className="w-6 h-6 text-cyan-400 opacity-80" />
        </div>

        {/* PostGIS Engine */}
        <div className="bg-panel border border-amber-500/40 rounded-2xl p-3.5 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-amber-300 block uppercase">PostGIS Spatial GIS</span>
            <div className="text-sm font-bold text-ink-hd flex items-center gap-1.5 mt-0.5">
              <span
                className={`w-2 h-2 rounded-full ${dbStatus ? 'bg-emerald-400' : dbChecked ? 'bg-red-500' : 'bg-slate-500'}`}
              />
              <span>{dbStatus ? 'PostGIS responding' : dbChecked ? 'DB unreachable' : 'Checking…'}</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
              {dbStatus?.spatialReferenceSystem || 'SRS unknown'}
            </span>
          </div>
          <Database className="w-6 h-6 text-amber-400 opacity-80" />
        </div>

        {/* SMS / USSD Fallback */}
        <div className="bg-panel border border-emerald-500/40 rounded-2xl p-3.5 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-amber-300 block uppercase">SMS &amp; USSD *113#</span>
            <div className="text-sm font-bold text-ink-hd flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Gateway simulator</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
              SIMULATED — no live SMS/USSD leaves this environment
            </span>
          </div>
          <Smartphone className="w-6 h-6 text-emerald-400 opacity-80" />
        </div>

        {/* DPPO Compliance */}
        <div className="bg-panel border border-purple-500/40 rounded-2xl p-3.5 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-purple-300 block uppercase">Rwanda DPPO Law</span>
            <div className="text-sm font-bold text-ink-hd flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${auditLogs.length > 0 ? 'bg-emerald-400' : dbChecked ? 'bg-slate-500' : 'bg-slate-500'}`} />
              <span>{auditLogs.length > 0 ? `${auditLogs.length} audit events` : 'No audit events yet'}</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">Law No. 058/2021</span>
          </div>
          <ShieldCheck className="w-6 h-6 text-purple-400 opacity-80" />
        </div>
      </div>

      {/* Grid: 2 Columns for Live Diagnostic Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Tool 1: PostgreSQL & PostGIS Live Connection Tester */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-ink-hd text-sm">PostgreSQL + PostGIS Connection Test</h3>
            </div>
            <span className="text-[10px] font-mono text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-600/40">
              Supabase / Neon / Cloud SQL
            </span>
          </div>

          <p className="text-slate-300 text-[11px] leading-relaxed">
            Test a PostgreSQL database connection string against your own resQlink backend. The
            backend verifies connection latency and checks whether the <code className="text-amber-300">postgis</code> extension is active:
          </p>

          <div className="rounded-xl border border-rwsun-500/40 bg-rwsun-500/10 px-3 py-2 text-[11px] leading-relaxed text-rwsun-400">
            Use a <strong>development</strong> database only — never paste production credentials.
            The string is sent only to this app&apos;s own <span className="font-mono">/api</span> endpoint,
            is never stored client-side, and the check is read-only (no migrations, no destructive tests).
          </div>

          <form onSubmit={handleTestDatabaseConn} className="space-y-3">
            <input
              type="text"
              value={customConnString}
              onChange={(e) => setCustomConnString(e.target.value)}
              placeholder="postgresql://user:•••@host:5432/resqlink_dev"
              autoComplete="off"
              spellCheck={false}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={testingConn || !customConnString}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-btn-ink font-bold text-xs shadow flex items-center gap-1.5 transition-transform active:scale-95 disabled:opacity-50"
              >
                {testingConn ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Testing Connection...</span>
                  </>
                ) : (
                  <>
                    <Database className="w-3.5 h-3.5" />
                    <span>Test PostgreSQL &amp; PostGIS</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setCustomConnString('postgresql://postgres:postgres@localhost:5432/resqlink_rw')}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
              >
                Sample URL
              </button>
            </div>
          </form>

          {connResult && (
            <div className={`p-3 rounded-2xl border text-[11px] space-y-1 ${
              connResult.success
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                : 'bg-red-950/80 border-red-500/50 text-red-200'
            }`}>
              <div className="font-bold">{connResult.message}</div>
              {connResult.postgresVersion && (
                <div className="font-mono text-[10px] text-slate-300 truncate">
                  PostgreSQL: {connResult.postgresVersion}
                </div>
              )}
              {connResult.postgisVersion && (
                <div className="font-mono text-[10px] text-amber-300">
                  PostGIS Extension: {connResult.postgisVersion}
                </div>
              )}
              {connResult.actionRequired && (
                <div className="text-amber-300 font-bold text-[10px]">
                  Notice: {connResult.actionRequired}
                </div>
              )}
            </div>
          )}

          {/* Current Local Database Status */}
          {dbStatus && (
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1 font-mono text-[11px]">
              <span className="text-slate-400 text-[10px] block">CURRENT ACTIVE ENGINE</span>
              <div className="font-bold text-emerald-400">{dbStatus.engine}</div>
              <div className="text-slate-300 text-[10px]">
                Facilities: {dbStatus.tables.facilities} | Incidents: {dbStatus.tables.incidents} | Responders: {dbStatus.tables.responders} | SRS: {dbStatus.spatialReferenceSystem}
              </div>
            </div>
          )}
        </div>

        {/* Tool 2: Spatial Haversine / PostGIS KNN Distance Calculator */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-400" />
              <h3 className="font-bold text-ink-hd text-sm">PostGIS Spatial Distance &amp; ETAs</h3>
            </div>
            <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-600/40">
              ST_Distance(geography)
            </span>
          </div>

          <p className="text-slate-300 text-[11px]">
            Compute distance and travel time from any Rwanda GPS coordinate to registered emergency facilities:
          </p>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block font-mono">LATITUDE</label>
              <input
                type="number"
                step="0.0001"
                value={testLat}
                onChange={(e) => setTestLat(parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-mono text-cyan-300"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block font-mono">LONGITUDE</label>
              <input
                type="number"
                step="0.0001"
                value={testLng}
                onChange={(e) => setTestLng(parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-mono text-cyan-300"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => runSpatialTest(testLat, testLng)}
              disabled={calculatingSpatial}
              className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-accent-ink font-bold text-xs shadow flex items-center gap-1.5"
            >
              {calculatingSpatial ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5" />}
              <span>Calculate Spatial Distances</span>
            </button>

            <button
              onClick={handleTestGeocode}
              disabled={geocoding}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-accent-ink font-bold text-xs shadow flex items-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{geocoding ? 'Reverse Geocoding...' : 'Reverse Geocode OSM'}</span>
            </button>
          </div>

          {geoResult && (
            <div className="bg-slate-950 border border-cyan-800/80 p-2.5 rounded-xl font-mono text-[11px] text-cyan-300">
              📍 {geoResult.formattedAddress} ({geoResult.district} - {geoResult.sector})
            </div>
          )}

          {spatialResults.length > 0 && (
            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
              {spatialResults.slice(0, 3).map((f) => (
                <div key={f.id} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-[11px]">
                  <div>
                    <span className="font-bold text-ink-hd block">{f.name}</span>
                    <span className="text-[10px] text-slate-400">{f.sector}, {f.district}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-amber-300 font-mono font-bold">{f.distanceKm} km</span>
                    <span className="text-[10px] text-emerald-400 block font-mono">~{f.estimatedTravelMinutes} mins</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tool 3: Africa's Talking Rwanda SMS Fallback Dispatcher */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-ink-hd text-sm">Africa&apos;s Talking Rwanda SMS Gateway</h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-600/40">
              MTN &amp; Airtel Fallback
            </span>
          </div>

          <p className="text-slate-300 text-[11px]">
            Test automated SMS dispatch transmission to RNP 113 for areas without 3G/4G coverage:
          </p>

          <form onSubmit={handleSendSms} className="space-y-3">
            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">DESTINATION SHORTCODE</label>
              <input
                type="text"
                value={smsTo}
                onChange={(e) => setSmsTo(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono text-emerald-300"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">EMERGENCY SMS PAYLOAD</label>
              <textarea
                rows={2}
                value={smsMessage}
                onChange={(e) => setSmsMessage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs font-mono text-slate-200"
              />
            </div>

            <button
              type="submit"
              disabled={smsSending}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-accent-ink font-bold text-xs shadow flex items-center justify-center gap-1.5"
            >
              {smsSending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Transmit Emergency SMS via Gateway</span>
            </button>
          </form>

          {smsResult && (
            <div className="bg-emerald-950/80 border border-emerald-500/50 p-3 rounded-2xl text-[11px] font-mono text-emerald-200 space-y-1">
              <div className="font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Delivered: Message ID {smsResult.messageId}</span>
              </div>
              <div className="text-[10px] text-slate-300">
                Provider: {smsResult.provider} &bull; Cost: {smsResult.cost} &bull; To: {smsResult.to}
              </div>
            </div>
          )}
        </div>

        {/* Tool 4: Interactive USSD *113# Emergency Simulator Screen */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-ink-hd text-sm">Interactive USSD *113# Phone Simulator</h3>
            </div>
            <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-600/40">
              Offline Dialing
            </span>
          </div>

          <p className="text-slate-300 text-[11px]">
            Dial <strong className="text-amber-300">*113#</strong> to experience how citizens without internet or smartphones can report accidents and request SAMU in Kinyarwanda:
          </p>

          {!ussdActive ? (
            <button
              onClick={startUssd}
              className="w-full py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-accent-ink font-bold text-xs shadow flex items-center justify-center gap-2"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Dial *113# on Rwanda Emergency GSM</span>
            </button>
          ) : (
            <div className="bg-slate-950 border border-cyan-500/40 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-b border-slate-800 pb-1.5">
                <span>USSD Session: {ussdHistory}</span>
                <button onClick={startUssd} className="text-amber-400 hover:underline">
                  Reset
                </button>
              </div>

              {/* Simulated Feature Phone LCD Screen */}
              <div className="bg-panel-deep border border-cyan-900 p-3 rounded-xl font-mono text-xs text-cyan-200 whitespace-pre-line leading-relaxed min-h-[100px] shadow-inner">
                {ussdLoading ? 'Loading USSD response...' : ussdScreen}
              </div>

              {!ussdScreen.startsWith('END') && (
                <form onSubmit={sendUssdStep} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={ussdInput}
                    onChange={(e) => setUssdInput(e.target.value)}
                    placeholder="Enter choice (e.g. 1)"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                  <button
                    type="submit"
                    disabled={ussdLoading || !ussdInput.trim()}
                    className="px-4 py-1.5 rounded-xl bg-amber-400 text-btn-ink font-bold text-xs shadow hover:bg-amber-300"
                  >
                    Send
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Real-Time Socket.IO Live Event Stream & DPPO Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Real-time Socket.IO Stream */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-ink-hd text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Live Socket.IO WebSocket Event Stream</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">
              {recentEvents.length} events
            </span>
          </div>

          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {recentEvents.length === 0 ? (
              <div className="p-4 text-center text-slate-500 font-mono text-[11px]">
                Waiting for WebSocket events... (Trigger SOS or assign responder to see live broadcasts)
              </div>
            ) : (
              recentEvents.map((ev, idx) => (
                <div key={`${ev.id}-${idx}`} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px] font-mono space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-300">{ev.event}</span>
                    <span className="text-[10px] text-slate-500">{ev.time}</span>
                  </div>
                  <div className="text-slate-400 text-[10px] truncate">
                    {JSON.stringify(ev.payload)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* DPPO Audit Trail */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-ink-hd text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>Rwanda DPPO Audit Trail (Law No. 058/2021)</span>
            </h3>
            <button
              onClick={downloadAuditJson}
              className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-500/40 font-bold"
            >
              <Download className="w-3 h-3" />
              <span>Export DSAR JSON</span>
            </button>
          </div>

          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {auditLogs.map((log) => (
              <div key={log.id} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px] space-y-0.5">
                <div className="flex items-center justify-between font-mono">
                  <span className="font-bold text-purple-300 text-[10px]">{log.action}</span>
                  <span className="text-[10px] text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="text-slate-300 text-[10px]">{log.details}</div>
                <div className="text-[9px] text-slate-500 font-mono">Actor: {log.actorRole} ({log.actorId}) &bull; IP: {log.ipAddress}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
