import React, { useState, useEffect } from 'react';
import { PhoneCall, ShieldAlert, CheckCircle2, Volume2, PhoneOff } from 'lucide-react';
import { emergencyAudio } from '../utils/audio';

interface CallHotlineModalProps {
  hotline: { number: string; serviceName: string } | null;
  onClose: () => void;
}

export const CallHotlineModal: React.FC<CallHotlineModalProps> = ({ hotline, onClose }) => {
  const [callState, setCallState] = useState<'RINGING' | 'CONNECTED' | 'DISCONNECTED'>('RINGING');
  const [seconds, setSeconds] = useState<number>(0);

  useEffect(() => {
    if (!hotline) return;
    emergencyAudio.playDispatchBeep();
    setCallState('RINGING');
    setSeconds(0);

    const timer = setTimeout(() => {
      setCallState('CONNECTED');
    }, 1800);

    return () => clearTimeout(timer);
  }, [hotline]);

  useEffect(() => {
    if (callState !== 'CONNECTED') return;
    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [callState]);

  if (!hotline) return null;

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-panel-deep border-2 border-amber-400/80 w-full max-w-md rounded-3xl p-6 shadow-2xl text-ink-hd space-y-5 text-center relative overflow-hidden">
        {/* Glow halo */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>RNP Emergency Operations Link</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-ink-hd font-bold text-lg"
          >
            ✕
          </button>
        </div>

        {/* Big Dialing Icon */}
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="relative">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-xl transition-all ${
              callState === 'CONNECTED'
                ? 'bg-emerald-600 text-accent-ink animate-pulse'
                : 'bg-amber-500 text-btn-ink'
            }`}>
              <PhoneCall className="w-10 h-10 animate-bounce" />
            </div>
          </div>

          <div>
            <div className="text-3xl font-black font-mono tracking-wider text-amber-300">
              {hotline.number}
            </div>
            <div className="text-base font-bold text-ink-hd mt-1">
              {hotline.serviceName}
            </div>
            <div className="text-xs font-mono text-cyan-300 mt-0.5">
              {callState === 'RINGING' && 'Connecting to Operator desk in Kigali...'}
              {callState === 'CONNECTED' && `Call in Progress • ${formatSeconds(seconds)} (Toll-Free)`}
            </div>
          </div>
        </div>

        {/* Rwanda Operator Protocol Guide */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-left text-xs space-y-2">
          <div className="font-bold text-amber-400 uppercase tracking-wider text-[10px]">
            Operator Quick Checklist:
          </div>
          <ul className="text-slate-300 space-y-1 list-disc list-inside text-[11px]">
            <li>State your name and location (Sector, District, or Landmark).</li>
            <li>Report number of injured persons and if anyone is unconscious.</li>
            <li>Confirm if road is blocked or fuel/fire is present.</li>
            <li>Do not hang up until instructed by the officer.</li>
          </ul>
        </div>

        {/* Real Device Link & Hang up */}
        <div className="flex items-center gap-2">
          <a
            href={`tel:${hotline.number}`}
            className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-accent-ink font-bold text-xs flex items-center justify-center gap-1.5 shadow"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Open Phone Dialer</span>
          </a>

          <button
            onClick={onClose}
            className="py-3 px-5 rounded-2xl bg-red-600 hover:bg-red-500 text-accent-ink font-bold text-xs flex items-center justify-center gap-1.5 shadow"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span>End</span>
          </button>
        </div>
      </div>
    </div>
  );
};
