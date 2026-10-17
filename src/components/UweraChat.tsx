import React, { useEffect, useRef, useState } from 'react';
import { Language } from '../types';
import { apiService } from '../services/api';
import {
  Ambulance,
  CarFront,
  Flame,
  Send,
  ShieldAlert,
  Sparkles,
  UserRound,
  Bot,
  Loader2
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface UweraChatProps {
  currentLang: Language;
  onCallHotline: (number: string, serviceName: string) => void;
  /** Compact mode trims chrome for inline embeds. */
  compact?: boolean;
  className?: string;
  /** Optional quick actions rendered under the composer. */
  showCallRow?: boolean;
}

const GREETING: Record<Language, string> = {
  en: 'Muraho! I am Uwera, your resQlink emergency copilot. Tell me what is happening and I will walk you through it — or ask which number to call.',
  rw: 'Muraho! Ndi Uwera, umufasha wawe wa resQlink. Mbwira ibyabaye nkuguhe intambwe ku yindi — cyangwa umbaze nimero wagurira.',
  fr: "Muraho ! Je suis Uwera, votre copilote d'urgence resQlink. Dites-moi ce qui se passe et je vous guide pas à pas."
};

const QUICK_PROMPTS: Record<Language, string[]> = {
  en: ['Moto accident, one rider bleeding', 'Guide me through CPR', 'Which number do I call?'],
  rw: ['Impanuka ya moto, umunyamotoka ava amaraso', 'Nyigisha CPR', 'Nahamagara iyihe nimero?'],
  fr: ['Accident de moto, un blessé saigne', 'Guidez-moi pour la RCP', 'Quel numéro appeler ?']
};

export const UweraChat: React.FC<UweraChatProps> = ({
  currentLang,
  onCallHotline,
  compact = false,
  className = '',
  showCallRow = true
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'greet', role: 'assistant', content: GREETING[currentLang] }
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(QUICK_PROMPTS[currentLang]);
  const [engine, setEngine] = useState<'GEMINI' | 'GUIDED_FALLBACK' | 'CHECKING'>('CHECKING');
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    apiService.getAiStatus().then((status) => {
      if (status) {
        setEngine(status.online ? 'GEMINI' : 'GUIDED_FALLBACK');
      } else {
        setEngine('GUIDED_FALLBACK');
      }
    });
  }, []);

  useEffect(() => {
    setMessages([{ id: 'greet', role: 'assistant', content: GREETING[currentLang] }]);
    setSuggestions(QUICK_PROMPTS[currentLang]);
  }, [currentLang]);

  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, busy]);

  const send = async (text: string) => {
    const question = text.trim();
    if (!question || busy) return;

    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', content: question };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput('');
    setBusy(true);

    const history = nextHistory
      .filter((m) => m.id !== 'greet')
      .map((m) => ({ role: m.role, content: m.content }));

    const res = await apiService.askAiAssistant(question, currentLang, history);
    const reply = res?.reply || 'I could not reach the copilot. Please call 112 or 113 directly.';

    if (res?.engine === 'GEMINI' || res?.engine === 'GUIDED_FALLBACK') {
      setEngine(res.engine);
    }
    if (res?.suggestions?.length) setSuggestions(res.suggestions);

    setMessages((prev) => [
      ...prev,
      { id: `a-${Date.now()}`, role: 'assistant', content: reply }
    ]);
    setBusy(false);
  };

  const engineLabel =
    engine === 'GEMINI'
      ? 'Gemini 2.5 live'
      : engine === 'GUIDED_FALLBACK'
        ? 'Guided safety mode'
        : 'Connecting…';

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-ink-900/85 backdrop-blur-2xl ${className}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/8 bg-gradient-to-r from-rwblue-500/12 via-transparent to-rwsun-500/10 px-4 py-3">
        <div className="relative">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-rwblue-400 to-rwblue-600 text-btn-ink shadow-glow-cyan">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-ink-900 bg-emerald-400 animate-ticker" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold tracking-tight text-ink-hd">Uwera</span>
            <span className="rounded-full border border-rwblue-400/30 bg-rwblue-500/15 px-2 py-[1px] text-[9px] font-bold uppercase tracking-[0.14em] text-rwblue-300">
              AI Copilot
            </span>
          </div>
          <p className="truncate text-[11px] font-medium text-slate-400">{engineLabel}</p>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className={`no-scrollbar space-y-3 overflow-y-auto px-4 py-4 ${compact ? 'max-h-64' : 'max-h-[46vh] min-h-[220px] flex-1'}`}
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-xl border ${
                m.role === 'user'
                  ? 'border-white/12 bg-ink-700 text-slate-300'
                  : 'border-rwblue-400/30 bg-rwblue-500/15 text-rwblue-300'
              }`}
            >
              {m.role === 'user' ? <UserRound className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
            </div>
            <div
              className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-[12.5px] leading-relaxed ${
                m.role === 'user'
                  ? 'bg-rwblue-500 text-btn-ink font-semibold'
                  : 'border border-white/8 bg-white/[0.04] text-slate-200'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {busy && (
          <div className="flex items-center gap-2 pl-9 text-[11px] font-medium text-slate-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-rwblue-300" />
            Uwera is thinking…
          </div>
        )}
      </div>

      {/* Suggestion chips */}
      {suggestions.length > 0 && !busy && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-2">
          {suggestions.slice(0, 4).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => send(s)}
              className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold text-slate-300 transition-colors hover:border-rwblue-400/40 hover:text-ink-hd"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Composer */}
      <div className="border-t border-white/8 p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2 rounded-2xl border border-white/10 bg-ink-950/70 px-3 py-2 focus-within:border-rwblue-400/50"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe the emergency…"
            className="min-w-0 flex-1 bg-transparent text-[12.5px] text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            aria-label="Send message"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-rwblue-500 text-btn-ink transition-transform hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>

        {showCallRow && (
          <div className="mt-2.5 flex items-center gap-2">
            <button
              type="button"
              onClick={() => onCallHotline('112', 'RNP Central Emergency')}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-alert-500/90 px-2 py-2 text-[11px] font-bold text-accent-ink transition-colors hover:bg-alert-400"
            >
              <ShieldAlert className="h-3.5 w-3.5" /> 112
            </button>
            <button
              type="button"
              onClick={() => onCallHotline('113', 'RNP Traffic Accidents')}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-rwsun-500 px-2 py-2 text-[11px] font-bold text-btn-ink transition-colors hover:bg-rwsun-400"
            >
              <CarFront className="h-3.5 w-3.5" /> 113
            </button>
            <button
              type="button"
              onClick={() => onCallHotline('912', 'SAMU Ambulance')}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-2 py-2 text-[11px] font-bold text-accent-ink transition-colors hover:bg-emerald-500"
            >
              <Ambulance className="h-3.5 w-3.5" /> 912
            </button>
            <button
              type="button"
              onClick={() => onCallHotline('111', 'Fire & Rescue Brigade')}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-orange-600 px-2 py-2 text-[11px] font-bold text-accent-ink transition-colors hover:bg-orange-500"
            >
              <Flame className="h-3.5 w-3.5" /> 111
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
