import React from 'react';
import { Loader2 } from 'lucide-react';

interface ViewLoaderProps {
  label?: string;
}

/** Suspense fallback for code-split views. Matches the app's dark surface. */
export const ViewLoader: React.FC<ViewLoaderProps> = ({ label = 'Loading secure module' }) => (
  <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
    <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-white/8 bg-ink-900/50 py-20 backdrop-blur-xl">
      <div className="relative grid h-12 w-12 place-items-center">
        <span className="absolute inset-0 rounded-2xl bg-rwblue-500/20 blur-lg" />
        <span className="absolute inset-0 rounded-2xl border border-rwblue-400/30 animate-pulse-ring" />
        <Loader2 className="relative h-5 w-5 animate-spin text-rwblue-300" />
      </div>
      <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <div className="flex gap-1.5">
        <span className="h-1 w-1 rounded-full bg-slate-700" />
        <span className="h-1 w-1 rounded-full bg-slate-700" />
        <span className="h-1 w-1 rounded-full bg-slate-700" />
      </div>
    </div>
  </div>
);
