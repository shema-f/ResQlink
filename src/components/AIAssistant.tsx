import React from 'react';
import { Language } from '../types';
import { UweraChat } from './UweraChat';
import { Sparkles, X } from 'lucide-react';

interface AIAssistantProps {
  currentLang: Language;
  onCallHotline: (number: string, serviceName: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Lifts the widget above the sticky download promo bar. */
  raised?: boolean;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  currentLang,
  onCallHotline,
  open,
  onOpenChange,
  raised = false
}) => {
  return (
    <>
      {/* Floating launcher */}
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        aria-label={open ? 'Close AI copilot' : 'Open AI emergency copilot'}
        className={`fixed right-4 z-[70] flex items-center gap-2.5 rounded-full border border-rwblue-400/40 bg-ink-900/90 py-2.5 pl-2.5 pr-4 text-left shadow-glow-cyan backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 sm:right-6 ${
          raised ? 'bottom-[5.5rem] sm:bottom-24' : 'bottom-5 sm:bottom-6'
        } ${open ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
      >
        <span className="relative grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-rwblue-400 to-rwblue-600 text-btn-ink">
          <span className="absolute inset-0 rounded-full bg-rwblue-400/40 animate-pulse-ring" />
          <Sparkles className="relative h-4.5 w-4.5" />
        </span>
        <span className="flex flex-col leading-none">
          <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-rwblue-300">
            AI Copilot
          </span>
          <span className="mt-1 text-[12.5px] font-extrabold text-ink-hd">Ask Uwera</span>
        </span>
      </button>

      {/* Panel */}
      <div
        className={`fixed inset-x-3 z-[80] sm:inset-x-auto sm:right-6 sm:w-[380px] ${
          raised ? 'bottom-[5.5rem] sm:bottom-24' : 'bottom-3 sm:bottom-6'
        } ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
        style={{
          transition: 'opacity 320ms cubic-bezier(0.16,1,0.3,1), transform 320ms cubic-bezier(0.16,1,0.3,1)',
          opacity: open ? 1 : 0,
          transform: open ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.97)'
        }}
        aria-hidden={!open}
      >
        <div className="relative">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close AI copilot"
            className="absolute right-3 top-3 z-10 grid h-7 w-7 place-items-center rounded-lg border border-white/10 bg-ink-950/70 text-slate-400 transition-colors hover:text-ink-hd"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <UweraChat
            currentLang={currentLang}
            onCallHotline={onCallHotline}
            className="h-[68vh] max-h-[560px] shadow-lift"
          />
        </div>
        <p className="mt-2 px-1 text-center text-[10px] leading-relaxed text-slate-500">
          Uwera gives AI guidance only and never replaces a dispatcher. In a life-threatening
          emergency, call 112 immediately.
        </p>
      </div>
    </>
  );
};
