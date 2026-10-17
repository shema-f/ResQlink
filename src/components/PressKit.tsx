import React, { useState } from 'react';
import { Reveal } from './Reveal';
import { createZip, ZipEntry } from '../utils/zip';
import {
  copyToClipboard,
  downloadBlob,
  downloadSvg,
  downloadText,
  svgToDataUrl,
  svgToPngBlob,
  svgToPngBytes
} from '../utils/download';
import {
  APPSTORE_BADGE_SVG,
  APP_ICON_SVG,
  BOILERPLATE,
  BRAND_COLOURS,
  BRAND_GUIDELINES_TXT,
  FACT_SHEET,
  LOGO_DARK_SVG,
  LOGO_LIGHT_SVG,
  MARK_MONO_SVG,
  PLAY_BADGE_SVG,
  PRESS_CONTACT,
  README_TXT,
  SCREENSHOTS,
  TYPOGRAPHY,
  USAGE_DO,
  USAGE_DONT
} from '../data/brandAssets';
import {
  AlertTriangle,
  Apple,
  BookOpen,
  Check,
  Copy,
  Download,
  FileText,
  Image as ImageIcon,
  Mail,
  MapPin,
  Package,
  PhoneCall,
  Sparkles,
  Type as TypeIcon,
  X
} from 'lucide-react';

/* --------------------------------------------------------------- structure */

interface PressAsset {
  id: string;
  fileName: string;
  folder: string;
  title: string;
  description: string;
  svg: string;
  svgWidth: number;
  svgHeight: number;
  pngWidth: number;
  pngHeight: number;
  stage: 'dark' | 'light' | 'plain';
  frameClass: string;
}

const LOGO_ASSETS: PressAsset[] = [
  {
    id: 'app-icon',
    fileName: 'resqlink-app-icon',
    folder: 'logos',
    title: 'App icon / mark',
    description: 'Primary square mark for app stores, avatars and social profiles.',
    svg: APP_ICON_SVG,
    svgWidth: 1024,
    svgHeight: 1024,
    pngWidth: 1024,
    pngHeight: 1024,
    stage: 'plain',
    frameClass: 'aspect-square'
  },
  {
    id: 'logo-dark',
    fileName: 'resqlink-primary-dark',
    folder: 'logos',
    title: 'Primary logo — on dark',
    description: 'Horizontal lockup for dark backgrounds, web headers and video.',
    svg: LOGO_DARK_SVG,
    svgWidth: 1600,
    svgHeight: 480,
    pngWidth: 1600,
    pngHeight: 480,
    stage: 'plain',
    frameClass: 'aspect-[10/3]'
  },
  {
    id: 'logo-light',
    fileName: 'resqlink-primary-light',
    folder: 'logos',
    title: 'Primary logo — on light',
    description: 'Same lockup prepared for white, print and light-coloured panels.',
    svg: LOGO_LIGHT_SVG,
    svgWidth: 1600,
    svgHeight: 480,
    pngWidth: 1600,
    pngHeight: 480,
    stage: 'plain',
    frameClass: 'aspect-[10/3]'
  },
  {
    id: 'mark-mono',
    fileName: 'resqlink-mark-mono',
    folder: 'logos',
    title: 'Monochrome mark',
    description: 'Single-colour knockout for stamps, watermarks and low-ink print.',
    svg: MARK_MONO_SVG,
    svgWidth: 1024,
    svgHeight: 1024,
    pngWidth: 1024,
    pngHeight: 1024,
    stage: 'dark',
    frameClass: 'aspect-square'
  }
];

const BADGE_ASSETS: PressAsset[] = [
  {
    id: 'google-play-badge',
    fileName: 'resqlink-google-play-badge',
    folder: 'badges',
    title: 'Google Play badge',
    description: 'Pair with the Android listing link in any article or deck.',
    svg: PLAY_BADGE_SVG,
    svgWidth: 646,
    svgHeight: 250,
    pngWidth: 1292,
    pngHeight: 500,
    stage: 'dark',
    frameClass: 'aspect-[646/250]'
  },
  {
    id: 'app-store-badge',
    fileName: 'resqlink-app-store-badge',
    folder: 'badges',
    title: 'App Store badge',
    description: 'Pair with the iOS listing link in any article or deck.',
    svg: APPSTORE_BADGE_SVG,
    svgWidth: 646,
    svgHeight: 250,
    pngWidth: 1292,
    pngHeight: 500,
    stage: 'dark',
    frameClass: 'aspect-[646/250]'
  }
];

const SCREEN_ASSETS: PressAsset[] = SCREENSHOTS.map((s) => ({
  id: s.id,
  fileName: `resqlink-${s.id}`,
  folder: 'screenshots',
  title: s.title,
  description: s.description,
  svg: s.svg,
  svgWidth: 390,
  svgHeight: 844,
  pngWidth: 780,
  pngHeight: 1688,
  stage: 'dark',
  frameClass: 'aspect-[390/844]'
}));

const ALL_ASSETS = [...LOGO_ASSETS, ...SCREEN_ASSETS, ...BADGE_ASSETS];

const FACT_SHEET_TXT = `resQlink — Fact Sheet
=====================

${FACT_SHEET.map(([k, v]) => `${k.padEnd(20)} ${v}`).join('\n')}

CONTACT
-------
${PRESS_CONTACT.name}
${PRESS_CONTACT.email}
${PRESS_CONTACT.phone}
${PRESS_CONTACT.address}
`;

/* ------------------------------------------------------------- sub-pieces */

const AssetCard: React.FC<{ asset: PressAsset }> = ({ asset }) => {
  const [state, setState] = useState<'idle' | 'working' | 'done'>('idle');

  const stageClass =
    asset.stage === 'light'
      ? 'bg-white'
      : asset.stage === 'dark'
        ? 'bg-[#0a0f1d] bg-grid'
        : 'bg-[#070c18]';

  const grabPng = async () => {
    setState('working');
    const png = await svgToPngBlob(asset.svg, asset.pngWidth, asset.pngHeight);
    if (png) {
      downloadBlob(png, `${asset.fileName}.png`);
      setState('done');
    } else {
      setState('idle');
    }
    window.setTimeout(() => setState('idle'), 1600);
  };

  return (
    <div className="aurora-border group h-full rounded-3xl">
      <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-white/8 bg-ink-900/70 backdrop-blur-xl">
        <div
          className={`flex items-center justify-center overflow-hidden p-5 ${stageClass} ${
            asset.stage === 'plain' ? '' : 'border-b border-white/8'
          }`}
        >
          <img
            src={svgToDataUrl(asset.svg)}
            alt={`${asset.title} — resQlink brand asset`}
            loading="lazy"
            className={`w-full object-contain ${asset.frameClass}`}
          />
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="text-[14px] font-extrabold tracking-tight text-ink-hd">{asset.title}</h3>
          <p className="mt-1.5 flex-1 text-[12px] leading-relaxed text-slate-400">
            {asset.description}
          </p>
          <p className="mt-3 font-mono text-[10px] text-slate-500">
            SVG {asset.svgWidth}×{asset.svgHeight} · PNG {asset.pngWidth}×{asset.pngHeight}
          </p>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => downloadSvg(asset.svg, `${asset.fileName}.svg`)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[11.5px] font-bold text-slate-200 transition-colors hover:border-rwblue-400/40 hover:text-ink-hd"
            >
              <FileText className="h-3.5 w-3.5" /> SVG
            </button>
            <button
              type="button"
              onClick={grabPng}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-rwblue-500 px-3 py-2 text-[11.5px] font-black text-btn-ink transition-transform hover:-translate-y-0.5"
            >
              {state === 'working' ? (
                <>
                  <Sparkles className="h-3.5 w-3.5 animate-pulse" /> Rendering…
                </>
              ) : state === 'done' ? (
                <>
                  <Check className="h-3.5 w-3.5" /> Saved
                </>
              ) : (
                <>
                  <ImageIcon className="h-3.5 w-3.5" /> PNG
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CopyButton: React.FC<{ text: string; label: string }> = ({ text, label }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        const ok = await copyToClipboard(text);
        if (ok) {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1800);
        }
      }}
      className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-bold text-slate-300 transition-colors hover:border-rwblue-400/40 hover:text-ink-hd"
    >
      {copied ? (
        <>
          <Check className="h-3 w-3 text-emerald-400" /> Copied
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" /> {label}
        </>
      )}
    </button>
  );
};

const SectionHeading: React.FC<{
  icon: React.ElementType;
  eyebrow: string;
  title: string;
  body?: string;
}> = ({ icon: Icon, eyebrow, title, body }) => (
  <Reveal>
    <div className="flex items-start gap-4">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.05] text-rwblue-300">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-[10.5px] font-black uppercase tracking-[0.22em] text-rwblue-300">
          {eyebrow}
        </p>
        <h2 className="mt-1.5 text-xl font-black tracking-tight text-ink-hd sm:text-2xl">{title}</h2>
        {body && <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-slate-400">{body}</p>}
      </div>
    </div>
  </Reveal>
);

/* -------------------------------------------------------------------- page */

export const PressKit: React.FC = () => {
  const [zipState, setZipState] = useState<{ busy: boolean; step: number; total: number }>({
    busy: false,
    step: 0,
    total: 0
  });
  const [colourCopied, setColourCopied] = useState<string | null>(null);

  const buildAndDownloadZip = async () => {
    const total = 4 + ALL_ASSETS.length * 2;
    setZipState({ busy: true, step: 0, total });

    const files: ZipEntry[] = [
      { name: 'README.txt', data: README_TXT },
      { name: 'docs/brand-guidelines.txt', data: BRAND_GUIDELINES_TXT },
      { name: 'docs/fact-sheet.txt', data: FACT_SHEET_TXT },
      {
        name: 'docs/boilerplate.txt',
        data: `resQlink — Boilerplate copy\n=====================================\n\nSHORT\n-----\n${BOILERPLATE.short}\n\nMEDIUM\n------\n${BOILERPLATE.medium}\n\nLONG\n----\n${BOILERPLATE.long}\n`
      }
    ];
    setZipState((s) => ({ ...s, step: 4 }));

    for (const asset of ALL_ASSETS) {
      files.push({ name: `${asset.folder}/${asset.fileName}.svg`, data: asset.svg });
      setZipState((s) => ({ ...s, step: s.step + 1 }));

      const png = await svgToPngBytes(asset.svg, asset.pngWidth, asset.pngHeight);
      if (png) files.push({ name: `${asset.folder}/${asset.fileName}.png`, data: png });
      setZipState((s) => ({ ...s, step: s.step + 1 }));
    }

    const zip = createZip(files);
    downloadBlob(zip, 'resqlink-press-kit.zip');
    setZipState({ busy: false, step: 0, total: 0 });
  };

  const progress = zipState.total ? Math.round((zipState.step / zipState.total) * 100) : 0;

  return (
    <div className="relative">
      {/* ambient background */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px]">
        <div className="absolute left-[-6%] top-[-120px] h-[420px] w-[420px] rounded-full bg-rwblue-500/16 blur-[130px]" />
        <div className="absolute right-[-6%] top-[20px] h-[380px] w-[380px] rounded-full bg-rwsun-500/12 blur-[130px]" />
        <div className="absolute inset-0 bg-grid opacity-25" />
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-24 pt-12 sm:px-6">
        {/* ------------------------------------------------------- header */}
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.25rem] border border-white/10 bg-gradient-to-br from-ink-800 via-ink-900 to-ink-950 p-7 sm:p-10">
            <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-rwblue-500/15 blur-3xl" />
            <div className="pointer-events-none absolute inset-0 bg-hair opacity-50" />

            <div className="relative grid items-center gap-8 lg:grid-cols-[1.3fr_0.7fr]">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
                  <BookOpen className="h-3.5 w-3.5 text-rwsun-400" /> Press &amp; Media
                </span>
                <h1 className="mt-5 text-3xl font-black leading-tight tracking-tight text-ink-hd sm:text-5xl">
                  resQlink press kit
                </h1>
                <p className="mt-4 max-w-xl text-[14.5px] leading-relaxed text-slate-400">
                  Every logo, app screen, store badge and the approved boilerplate — in one download.
                  Vector SVG for print, PNG for the web, plus the fact sheet and brand rules.
                </p>

                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={buildAndDownloadZip}
                    disabled={zipState.busy}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rwblue-400 to-rwblue-600 px-5 py-3 text-sm font-black text-btn-ink shadow-glow-cyan transition-transform hover:-translate-y-0.5 disabled:opacity-70"
                  >
                    <Package className={`h-4 w-4 ${zipState.busy ? 'animate-pulse' : ''}`} />
                    {zipState.busy
                      ? `Packaging assets… ${progress}%`
                      : `Download all assets (.zip · ${ALL_ASSETS.length * 2 + 4} files)`}
                  </button>
                  <CopyButton text={BOILERPLATE.medium} label="Copy boilerplate" />
                </div>

                {zipState.busy && (
                  <div className="mt-4 h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-rwblue-400 to-rwsun-400 transition-all duration-200"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </div>

              {/* license / usage summary */}
              <div className="rounded-3xl border border-white/10 bg-ink-950/70 p-5 backdrop-blur-xl">
                <p className="text-[10.5px] font-black uppercase tracking-[0.18em] text-slate-500">
                  In this kit
                </p>
                <ul className="mt-3.5 space-y-2.5 text-[12.5px]">
                  {[
                    ['logos/', `${LOGO_ASSETS.length} files · SVG + PNG`],
                    ['screenshots/', `${SCREEN_ASSETS.length} files · SVG + PNG`],
                    ['badges/', `${BADGE_ASSETS.length} files · SVG + PNG`],
                    ['docs/', 'Boilerplate · fact sheet · brand rules']
                  ].map(([folder, meta]) => (
                    <li key={folder} className="flex items-center justify-between gap-3">
                      <span className="font-mono font-bold text-rwblue-300">{folder}</span>
                      <span className="text-right text-slate-400">{meta}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 border-t border-white/8 pt-3.5 text-[11px] leading-relaxed text-slate-500">
                  Free to use in editorial coverage of resQlink. Do not imply endorsement of unrelated
                  products.
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* -------------------------------------------------------- notice */}
        <Reveal delay={80}>
          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-rwsun-500/25 bg-rwsun-500/[0.07] px-5 py-4">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rwsun-400" />
            <p className="text-[12.5px] leading-relaxed text-rwsun-100">
              Please make clear in any coverage that in a life-threatening emergency the fastest action
              is to <strong className="font-bold">call 112 directly</strong>. resQlink guides and
              dispatches, but it never replaces a human operator.
            </p>
          </div>
        </Reveal>

        {/* --------------------------------------------------------- logos */}
        <div className="mt-16">
          <SectionHeading
            icon={Sparkles}
            eyebrow="Logo suite"
            title="Logos & the app icon"
            body="Four treatments covering dark UI, light print, the app store icon and a single-colour knockout. Minimum clear space is one third of the mark's height."
          />
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {LOGO_ASSETS.map((asset, i) => (
              <Reveal key={asset.id} delay={i * 60}>
                <AssetCard asset={asset} />
              </Reveal>
            ))}
          </div>
        </div>

        {/* --------------------------------------------------- screenshots */}
        <div className="mt-16">
          <SectionHeading
            icon={ImageIcon}
            eyebrow="Product shots"
            title="App screenshots"
            body="Four screens covering the citizen journey: one-tap SOS, live dispatch tracking, the Uwera AI copilot and road hazard reporting. Supplied at 2× for retina displays."
          />
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {SCREEN_ASSETS.map((asset, i) => (
              <Reveal key={asset.id} delay={i * 60}>
                <AssetCard asset={asset} />
              </Reveal>
            ))}
          </div>
        </div>

        {/* -------------------------------------------------------- badges */}
        <div className="mt-16">
          <SectionHeading
            icon={Apple}
            eyebrow="Download badges"
            title="Google Play & App Store badges"
            body="Drop-in badges that pair with the store links in articles, decks and partner pages."
          />
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {BADGE_ASSETS.map((asset, i) => (
              <Reveal key={asset.id} delay={i * 60}>
                <AssetCard asset={asset} />
              </Reveal>
            ))}
          </div>
        </div>

        {/* ------------------------------------------------------- colours */}
        <div className="mt-16">
          <SectionHeading
            icon={TypeIcon}
            eyebrow="Brand system"
            title="Colours & typography"
            body="Click any swatch to copy the hex value. Emergency red is reserved for SOS and emergency actions only."
          />
          <div className="mt-8 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
            <Reveal>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {BRAND_COLOURS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={async () => {
                      const ok = await copyToClipboard(c.hex);
                      if (ok) {
                        setColourCopied(c.hex);
                        window.setTimeout(() => setColourCopied(null), 1600);
                      }
                    }}
                    className="group overflow-hidden rounded-2xl border border-white/8 bg-ink-900/60 text-left transition-transform hover:-translate-y-0.5"
                  >
                    <span className="block h-16 w-full" style={{ backgroundColor: c.hex }} />
                    <span className="block px-3 py-2.5">
                      <span className="flex items-center gap-1.5 text-[11.5px] font-bold text-ink-hd">
                        {c.name}
                        {colourCopied === c.hex && (
                          <Check className="h-3 w-3 text-emerald-400" />
                        )}
                      </span>
                      <span className="mt-0.5 block font-mono text-[10px] text-slate-500">
                        {c.hex}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </Reveal>

            <Reveal delay={90}>
              <div className="h-full rounded-3xl border border-white/8 bg-ink-900/60 p-6">
                <p className="text-[10.5px] font-black uppercase tracking-[0.18em] text-slate-500">
                  Typeface
                </p>
                <p
                  className="mt-3 text-3xl font-extrabold tracking-tight text-ink-hd"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Plus Jakarta Sans
                </p>
                <ul className="mt-5 space-y-3">
                  {TYPOGRAPHY.map((t) => (
                    <li key={t.label} className="border-t border-white/6 pt-3 first:border-0 first:pt-0">
                      <span className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                        {t.label}
                      </span>
                      <span className="mt-0.5 block text-[12.5px] font-medium text-slate-300">
                        {t.value}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-5 text-[11px] leading-relaxed text-slate-500">
                  The wordmark ships as live text. Install Plus Jakarta Sans from Google Fonts if you
                  need to recreate it in layout.
                </p>
              </div>
            </Reveal>
          </div>
        </div>

        {/* ------------------------------------------------------- usage */}
        <div className="mt-16">
          <SectionHeading
            icon={X}
            eyebrow="Brand rules"
            title="How to use — and how not to"
          />
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <Reveal>
              <div className="h-full rounded-3xl border border-emerald-500/20 bg-emerald-500/[0.05] p-6">
                <p className="flex items-center gap-2 text-[12px] font-black uppercase tracking-[0.16em] text-emerald-400">
                  <Check className="h-4 w-4" /> Do
                </p>
                <ul className="mt-4 space-y-3">
                  {USAGE_DO.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-[12.5px] leading-relaxed text-slate-300">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <div className="h-full rounded-3xl border border-alert-500/20 bg-alert-500/[0.05] p-6">
                <p className="flex items-center gap-2 text-[12px] font-black uppercase tracking-[0.16em] text-alert-400">
                  <X className="h-4 w-4" /> Don&apos;t
                </p>
                <ul className="mt-4 space-y-3">
                  {USAGE_DONT.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-[12.5px] leading-relaxed text-slate-300">
                      <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-alert-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>

        {/* -------------------------------------------------- boilerplate */}
        <div className="mt-16">
          <SectionHeading
            icon={FileText}
            eyebrow="Words"
            title="Boilerplate copy"
            body="Three approved lengths. Copy whichever fits — please do not edit the facts."
          />
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {(
              [
                ['Short', 'One line', BOILERPLATE.short],
                ['Medium', 'Paragraph', BOILERPLATE.medium],
                ['Long', 'Full description', BOILERPLATE.long]
              ] as const
            ).map(([label, kind, text], i) => (
              <Reveal key={label} delay={i * 70}>
                <div className="flex h-full flex-col rounded-3xl border border-white/8 bg-ink-900/60 p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-extrabold text-ink-hd">{label}</span>
                    <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {kind}
                    </span>
                  </div>
                  <p className="mt-4 flex-1 text-[12.5px] leading-relaxed text-slate-400">{text}</p>
                  <div className="mt-5">
                    <CopyButton text={text} label="Copy" />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* ---------------------------------------------------- fact sheet */}
        <div className="mt-16">
          <SectionHeading icon={FileText} eyebrow="At a glance" title="Fact sheet" />
          <Reveal>
            <div className="mt-8 overflow-hidden rounded-3xl border border-white/8 bg-ink-900/60">
              {FACT_SHEET.map(([key, value], i) => (
                <div
                  key={key}
                  className={`flex flex-col gap-1 px-5 py-3.5 sm:flex-row sm:items-center sm:gap-6 ${
                    i % 2 === 0 ? 'bg-white/[0.015]' : ''
                  }`}
                >
                  <span className="w-44 shrink-0 text-[11.5px] font-bold uppercase tracking-wider text-slate-500">
                    {key}
                  </span>
                  <span className="text-[13px] font-medium text-slate-200">{value}</span>
                </div>
              ))}
            </div>
          </Reveal>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => downloadText(FACT_SHEET_TXT, 'resqlink-fact-sheet.txt')}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-[11.5px] font-bold text-slate-200 transition-colors hover:border-rwblue-400/40 hover:text-ink-hd"
            >
              <Download className="h-3.5 w-3.5" /> Download fact sheet (.txt)
            </button>
            <button
              type="button"
              onClick={() =>
                downloadText(BRAND_GUIDELINES_TXT, 'resqlink-brand-guidelines.txt')
              }
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-[11.5px] font-bold text-slate-200 transition-colors hover:border-rwblue-400/40 hover:text-ink-hd"
            >
              <Download className="h-3.5 w-3.5" /> Brand guidelines (.txt)
            </button>
            <button
              type="button"
              onClick={() => downloadText(README_TXT, 'resqlink-press-kit-README.txt')}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-[11.5px] font-bold text-slate-200 transition-colors hover:border-rwblue-400/40 hover:text-ink-hd"
            >
              <Download className="h-3.5 w-3.5" /> Kit README (.txt)
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------- contact */}
        <Reveal>
          <div className="mt-16 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-rwblue-600/20 via-ink-900 to-rwsun-600/15 p-7 sm:p-10">
            <div className="grid gap-8 md:grid-cols-[1.2fr_1fr]">
              <div>
                <p className="text-[10.5px] font-black uppercase tracking-[0.22em] text-rwsun-400">
                  Media enquiries
                </p>
                <h2 className="mt-3 text-2xl font-black tracking-tight text-ink-hd sm:text-3xl">
                  Talk to the resQlink media desk.
                </h2>
                <p className="mt-3 max-w-md text-[13.5px] leading-relaxed text-slate-300">
                  Interviews, product demos, data on road safety response times and access to the RNP
                  operations floor are available on request.
                </p>
              </div>
              <div className="space-y-3">
                {[
                  { icon: Mail, label: PRESS_CONTACT.email, href: `mailto:${PRESS_CONTACT.email}` },
                  { icon: PhoneCall, label: PRESS_CONTACT.phone, href: `tel:${PRESS_CONTACT.phone.replace(/\s/g, '')}` },
                  { icon: MapPin, label: PRESS_CONTACT.address, href: undefined }
                ].map((row) => {
                  const Inner = (
                    <>
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.06] text-rwblue-300">
                        <row.icon className="h-4 w-4" />
                      </span>
                      <span className="text-[12.5px] font-semibold text-slate-200">{row.label}</span>
                    </>
                  );
                  return row.href ? (
                    <a
                      key={row.label}
                      href={row.href}
                      className="flex items-center gap-3 rounded-2xl border border-white/8 bg-ink-950/50 px-4 py-3 transition-colors hover:border-rwblue-400/40"
                    >
                      {Inner}
                    </a>
                  ) : (
                    <div
                      key={row.label}
                      className="flex items-center gap-3 rounded-2xl border border-white/8 bg-ink-950/50 px-4 py-3"
                    >
                      {Inner}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
};
