import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { Card, SectionHeader } from './ui';
import {
  Gauge,
  Bike,
  Armchair,
  Footprints,
  Smartphone,
  WineOff,
  Megaphone
} from 'lucide-react';

/* =========================================================================
   Gerayo Amahoro — accessible road-safety education block shared by
   /hazards and /campaigns. Renders in EN / IKINYARWANDA / FR from the
   global language switch, as a semantic list (screen-reader friendly,
   no colour-only meaning, no animation).
   ========================================================================= */

interface GerayoAmahoroProps {
  currentLang: Language;
  className?: string;
}

export const GerayoAmahoro: React.FC<GerayoAmahoroProps> = ({ currentLang, className = '' }) => {
  const t = TRANSLATIONS[currentLang];

  const tips = [
    { icon: Gauge, text: t.gerayoTipSpeed },
    { icon: Bike, text: t.gerayoTipHelmet },
    { icon: Armchair, text: t.gerayoTipSeatbelt },
    { icon: Footprints, text: t.gerayoTipCross },
    { icon: Smartphone, text: t.gerayoTipPhone },
    { icon: WineOff, text: t.gerayoTipAlcohol }
  ];

  return (
    <Card tone="warning" className={className}>
      <SectionHeader
        title={
          <span className="flex items-center gap-2">
            <Megaphone className="h-3.5 w-3.5 text-rwsun-400" aria-hidden />
            {t.gerayoTitle}
          </span>
        }
        action={<span className="font-mono text-[10.5px] text-slate-500">RNP · RSF</span>}
      />

      <div className="space-y-4 p-4 sm:p-5">
        <p className="max-w-3xl text-sm leading-relaxed text-slate-300">{t.gerayoIntro}</p>

        <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {tips.map((tip, idx) => (
            <li
              key={idx}
              className="flex items-start gap-3 rounded-xl border border-ink-700 bg-panel p-3.5"
            >
              <span
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-rwsun-500/15 text-rwsun-400 ring-1 ring-inset ring-rwsun-500/30"
                aria-hidden
              >
                <tip.icon className="h-4 w-4" />
              </span>
              <p className="text-xs leading-relaxed text-slate-300">
                <span className="mr-1.5 font-mono text-[10.5px] font-bold text-rwsun-400">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                {tip.text}
              </p>
            </li>
          ))}
        </ul>

        <p className="rounded-xl border border-rwblue-500/35 bg-rwblue-500/10 px-3.5 py-3 text-xs leading-relaxed text-rwblue-600">
          {t.gerayoReport}
        </p>
      </div>
    </Card>
  );
};