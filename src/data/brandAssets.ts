/**
 * resQlink press kit assets.
 * Everything here is authored as a standalone, self-contained SVG string so it
 * can be previewed in the browser and downloaded as either .svg or .png.
 */

const FONT = "'Plus Jakarta Sans','Segoe UI',Helvetica,Arial,sans-serif";

/* ------------------------------------------------------------------ colours */

export const BRAND_COLOURS = [
  { name: 'Ink 950', hex: '#03060E', note: 'Primary background' },
  { name: 'Ink 900', hex: '#060B16', note: 'Surfaces' },
  { name: 'Rwanda Blue', hex: '#00A1DE', note: 'Primary accent · links · active' },
  { name: 'Blue Light', hex: '#7FD8F5', note: 'Accent on dark UI' },
  { name: 'Sun Yellow', hex: '#FAD201', note: 'Highlight · urgent CTA' },
  { name: 'Hill Green', hex: '#20603D', note: 'Success · coverage' },
  { name: 'Emergency Red', hex: '#EF4444', note: 'SOS only — never decoratively' },
  { name: 'Slate 400', hex: '#94A3B8', note: 'Body copy on dark' }
] as const;

export const TYPOGRAPHY = [
  { label: 'Display / Headings', value: 'Plus Jakarta Sans ExtraBold 800' },
  { label: 'Sub headings', value: 'Plus Jakarta Sans Bold 700' },
  { label: 'Body', value: 'Plus Jakarta Sans Medium 500' },
  { label: 'Data & coordinates', value: 'JetBrains Mono · Menlo · monospace' }
] as const;

/* --------------------------------------------------------------- logo marks */

const ICON_BODY = `
  <defs>
    <linearGradient id="rqSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0284c7"/><stop offset="100%" stop-color="#0369a1"/>
    </linearGradient>
    <linearGradient id="rqYellow" x1="0%" y1="0%" x2="100%" y2="50%">
      <stop offset="0%" stop-color="#facc15"/><stop offset="100%" stop-color="#eab308"/>
    </linearGradient>
    <linearGradient id="rqGreen" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#15803d"/><stop offset="100%" stop-color="#166534"/>
    </linearGradient>
    <linearGradient id="rqPin" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ef4444"/><stop offset="100%" stop-color="#b91c1c"/>
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="44" fill="#060e1d"/>
  <path d="M 60,35 C 75,30 95,38 115,28 C 135,24 152,36 160,52 C 168,68 158,85 165,102 C 172,118 162,135 152,142 C 135,155 120,148 100,152 C 78,156 62,146 50,135 C 38,124 42,98 42,80 C 42,60 48,42 60,35 Z"
    fill="url(#rqSky)" stroke="#38bdf8" stroke-width="3.5" stroke-linejoin="round"/>
  <path d="M 50,90 L 80,55 L 110,95 L 140,65 L 163,100 L 45,100 Z" fill="#034870" opacity="0.6"/>
  <g transform="translate(138, 52) scale(0.65)">
    <circle cx="0" cy="0" r="10" fill="#facc15"/>
    <line x1="0" y1="-13" x2="0" y2="-19" stroke="#facc15" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="0" y1="13" x2="0" y2="19" stroke="#facc15" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="-13" y1="0" x2="-19" y2="0" stroke="#facc15" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="13" y1="0" x2="19" y2="0" stroke="#facc15" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="-9" y1="-9" x2="-14" y2="-14" stroke="#facc15" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="9" y1="9" x2="14" y2="14" stroke="#facc15" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="9" y1="-9" x2="14" y2="-14" stroke="#facc15" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="-9" y1="9" x2="-14" y2="14" stroke="#facc15" stroke-width="2.5" stroke-linecap="round"/>
  </g>
  <path d="M 44,115 C 75,110 115,90 164,82 C 165,95 160,112 150,122 C 115,115 75,130 45,135 Z" fill="url(#rqYellow)"/>
  <path d="M 45,132 C 75,128 115,114 152,120 C 145,138 125,149 100,152 C 78,155 60,146 45,132 Z" fill="url(#rqGreen)"/>
  <path d="M 100,105 C 98,125 78,145 70,175 L 125,175 C 115,145 106,125 104,105 Z" fill="#f8fafc"/>
  <path d="M 98,115 L 94,170" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 3"/>
  <path d="M 68,90 C 63,80 63,68 68,58" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" fill="none"/>
  <path d="M 59,96 C 52,82 52,66 59,52" stroke="#38bdf8" stroke-width="3" stroke-linecap="round" fill="none"/>
  <path d="M 132,90 C 137,80 137,68 132,58" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" fill="none"/>
  <path d="M 141,96 C 148,82 148,66 141,52" stroke="#38bdf8" stroke-width="3" stroke-linecap="round" fill="none"/>
  <g transform="translate(100, 72) scale(1.1)">
    <path d="M 0,26 C -0.5,24 -17,2 -17,-12 C -17,-22 -9.5,-30 0,-30 C 9.5,-30 17,-22 17,-12 C 17,2 0.5,24 0,26 Z"
      fill="url(#rqPin)" stroke="#ffffff" stroke-width="2.5"/>
    <path d="M -3,-18 H 3 V -14 H 7 V -10 H 3 V -6 H -3 V -10 H -7 V -14 H -3 Z" fill="#ffffff"/>
  </g>`;

/** Square app icon / mark — 1024px master. */
export const APP_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 200 200" role="img" aria-label="resQlink app icon">${ICON_BODY}
</svg>`;

/** Single-colour knockout mark on a transparent canvas. */
export const MARK_MONO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 200 200" role="img" aria-label="resQlink monochrome mark">
  <rect width="200" height="200" rx="46" fill="#ffffff"/>
  <path d="M 68,96 C 62,84 62,68 68,56" stroke="#060e1d" stroke-width="5" stroke-linecap="round" fill="none"/>
  <path d="M 57,104 C 49,87 49,65 57,48" stroke="#060e1d" stroke-width="4.5" stroke-linecap="round" fill="none" opacity="0.55"/>
  <path d="M 132,96 C 138,84 138,68 132,56" stroke="#060e1d" stroke-width="5" stroke-linecap="round" fill="none"/>
  <path d="M 143,104 C 151,87 151,65 143,48" stroke="#060e1d" stroke-width="4.5" stroke-linecap="round" fill="none" opacity="0.55"/>
  <g transform="translate(100, 74) scale(1.15)">
    <path d="M 0,26 C -0.5,24 -17,2 -17,-12 C -17,-22 -9.5,-30 0,-30 C 9.5,-30 17,-22 17,-12 C 17,2 0.5,24 0,26 Z" fill="#060e1d"/>
    <path d="M -3,-18 H 3 V -14 H 7 V -10 H 3 V -6 H -3 V -10 H -7 V -14 H -3 Z" fill="#ffffff"/>
  </g>
  <path d="M 74,140 H 126" stroke="#060e1d" stroke-width="7" stroke-linecap="round"/>
  <path d="M 86,154 H 114" stroke="#060e1d" stroke-width="5" stroke-linecap="round" opacity="0.5"/>
</svg>`;

const horizontalLogo = (dark: boolean) => {
  const bg = dark ? '#060e1d' : '#ffffff';
  const word = dark ? '#ffffff' : '#0B1524';
  const sub = dark ? '#94A3B8' : '#5A6B85';
  const rule = dark ? 'rgba(255,255,255,0.10)' : 'rgba(11,21,36,0.10)';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="480" viewBox="0 0 1600 480" role="img" aria-label="resQlink logo">
  <rect width="1600" height="480" fill="${bg}"/>
  <g transform="translate(80, 60) scale(1.8)">${ICON_BODY}
  </g>
  <line x1="470" y1="150" x2="470" y2="330" stroke="${rule}" stroke-width="3"/>
  <text x="530" y="262" font-family="${FONT}" font-size="158" font-weight="800" letter-spacing="-5" fill="${word}">res<tspan fill="#00a1de">Q</tspan>link</text>
  <text x="536" y="322" font-family="${FONT}" font-size="26" font-weight="700" letter-spacing="9" fill="${sub}">RWANDA EMERGENCY RESPONSE</text>
</svg>`;
};

export const LOGO_DARK_SVG = horizontalLogo(true);
export const LOGO_LIGHT_SVG = horizontalLogo(false);

/* ------------------------------------------------------------ store badges */

const PLAY_GLYPH = `<g transform="translate(52, 84) scale(6.6)">
  <path d="M1.03 1.27l6.553 6.05 3.044-2.81L3.333.215C2.39-.341 1.231.24 1.03 1.27" fill="#7fd8f5"/>
  <path d="M1 13.396V2.603L6.846 8z" fill="#00a1de"/>
  <path d="M14.222 9.374c1.037-.61 1.037-2.137 0-2.748L11.528 5.04 8.32 8l3.207 2.96z" fill="#fad201"/>
  <path d="M10.627 11.49L7.583 8.68 1.03 14.73c.201 1.029 1.36 1.61 2.303 1.055z" fill="#3d9c6d"/>
</g>`;

const APPLE_GLYPH = `<g transform="translate(176, 76) scale(0.2)">
  <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" fill="#ffffff"/>
</g>`;

const badge = (glyph: string, kicker: string, title: string) => `<svg xmlns="http://www.w3.org/2000/svg" width="646" height="250" viewBox="0 0 646 250" role="img" aria-label="${title}">
  <rect x="3" y="3" width="640" height="244" rx="34" fill="#060b16" stroke="rgba(255,255,255,0.16)" stroke-width="3"/>
  ${glyph}
  <text x="172" y="112" font-family="${FONT}" font-size="27" font-weight="600" letter-spacing="2" fill="#94a3b8">${kicker}</text>
  <text x="170" y="180" font-family="${FONT}" font-size="60" font-weight="800" letter-spacing="-1.5" fill="#ffffff">${title}</text>
</svg>`;

export const PLAY_BADGE_SVG = badge(PLAY_GLYPH, 'GET IT ON', 'Google Play');
export const APPSTORE_BADGE_SVG = badge(APPLE_GLYPH, 'DOWNLOAD ON THE', 'App Store');

/* ------------------------------------------------------------- screenshots */

const screen = (inner: string, label: string) => `<svg xmlns="http://www.w3.org/2000/svg" width="390" height="844" viewBox="0 0 390 844" role="img" aria-label="${label}">
  <rect width="390" height="844" fill="#040a14"/>
  <text x="28" y="30" font-family="${FONT}" font-size="12" font-weight="600" fill="#5b6b8c">06:47</text>
  <rect x="300" y="20" width="20" height="11" rx="3" fill="#5b6b8c"/>
  <rect x="326" y="20" width="26" height="11" rx="3" fill="#5b6b8c"/>
  <rect x="358" y="19" width="14" height="13" rx="3" fill="#5b6b8c"/>
${inner}
</svg>`;

const appBar = (title: string, pill: string) => `
  <rect x="0" y="44" width="390" height="60" fill="#08101d"/>
  <rect x="20" y="58" width="32" height="32" rx="11" fill="#00a1de"/>
  <circle cx="36" cy="74" r="7" fill="#040a14"/>
  <text x="62" y="80" font-family="${FONT}" font-size="16" font-weight="800" fill="#ffffff">${title}</text>
  <rect x="252" y="62" width="118" height="24" rx="12" fill="rgba(16,185,129,0.12)" stroke="rgba(52,211,153,0.35)"/>
  <circle cx="268" cy="74" r="4" fill="#34d399"/>
  <text x="280" y="78" font-family="${FONT}" font-size="10" font-weight="700" letter-spacing="1.4" fill="#34d399">${pill}</text>
  <line x1="0" y1="104" x2="390" y2="104" stroke="rgba(255,255,255,0.07)"/>`;

const hotlineRow = (y: number) => {
  const items = [
    { x: 24, label: '112', sub: 'Emergency', fill: '#ef4444' },
    { x: 112, label: '113', sub: 'Traffic', fill: '#fad201', ink: '#03060e' },
    { x: 200, label: '912', sub: 'Ambulance', fill: '#059669' },
    { x: 288, label: '111', sub: 'Fire', fill: '#ea580c' }
  ];
  return items
    .map(
      (i) => `
  <rect x="${i.x}" y="${y}" width="78" height="46" rx="14" fill="${i.fill}"/>
  <text x="${i.x + 39}" y="${y + 24}" text-anchor="middle" font-family="${FONT}" font-size="15" font-weight="800" fill="${i.ink || '#ffffff'}">${i.label}</text>
  <text x="${i.x + 39}" y="${y + 38}" text-anchor="middle" font-family="${FONT}" font-size="8.5" font-weight="600" fill="${i.ink || '#ffffff'}" opacity="0.85">${i.sub}</text>`
    )
    .join('');
};

export interface PressScreenshot {
  id: string;
  title: string;
  description: string;
  svg: string;
}

export const SCREENSHOTS: PressScreenshot[] = [
  {
    id: '01-sos-home',
    title: 'One-tap SOS',
    description: 'The panic-proof home screen. GPS locked, single giant SOS target, live dispatch card.',
    svg: screen(
      `${appBar('resQlink', 'LIVE')}
  <text x="195" y="146" text-anchor="middle" font-family="${FONT}" font-size="9.5" font-weight="700" letter-spacing="2.4" fill="#5b6b8c">LOCATION LOCKED · ±6 M</text>
  <g transform="translate(108, 168)">
    <path d="M0,10 C0,10 -7,-1 -7,-6 C-7,-10 -4,-13 0,-13 C4,-13 7,-10 7,-6 C7,-1 0,10 0,10 Z" fill="#ef4444"/>
    <circle cx="0" cy="-6" r="2.4" fill="#ffffff"/>
  </g>
  <text x="126" y="172" font-family="${FONT}" font-size="14" font-weight="700" fill="#ffffff">KN 5 Rd, Kimihurura</text>

  <circle cx="195" cy="340" r="112" fill="rgba(239,68,68,0.10)" stroke="rgba(239,68,68,0.22)"/>
  <circle cx="195" cy="340" r="90" fill="none" stroke="rgba(239,68,68,0.30)" stroke-width="2"/>
  <circle cx="195" cy="340" r="70" fill="#ef4444"/>
  <text x="195" y="336" text-anchor="middle" font-family="${FONT}" font-size="36" font-weight="800" letter-spacing="-1" fill="#ffffff">SOS</text>
  <text x="195" y="360" text-anchor="middle" font-family="${FONT}" font-size="9" font-weight="700" letter-spacing="2" fill="#fee2e2">TAP TO DISPATCH</text>

  <rect x="24" y="482" width="342" height="94" rx="20" fill="rgba(0,161,222,0.09)" stroke="rgba(0,161,222,0.28)"/>
  <rect x="42" y="498" width="36" height="36" rx="12" fill="#00a1de"/>
  <rect x="50" y="512" width="20" height="10" rx="3" fill="#040a14"/>
  <text x="92" y="512" font-family="${FONT}" font-size="13" font-weight="700" fill="#ffffff">RNP Unit Alpha-4</text>
  <text x="92" y="530" font-family="${FONT}" font-size="11" font-weight="600" fill="#7fd8f5">En route · ETA 4 min</text>
  <rect x="42" y="548" width="306" height="7" rx="3.5" fill="#040a14"/>
  <rect x="42" y="548" width="196" height="7" rx="3.5" fill="#fad201"/>

  <rect x="24" y="592" width="342" height="66" rx="18" fill="rgba(250,210,1,0.08)" stroke="rgba(250,210,1,0.28)"/>
  <path d="M50 610 l4 10 10 4 -10 4 -4 10 -4 -10 -10 -4 10 -4 z" fill="#fad201"/>
  <text x="76" y="620" font-family="${FONT}" font-size="10.5" font-weight="600" fill="#ffe27a">I pre-briefed the 112 operator in</text>
  <text x="76" y="636" font-family="${FONT}" font-size="10.5" font-weight="600" fill="#ffe27a">Kinyarwanda. Keep the rider still.</text>

  ${hotlineRow(688)}`,
      'resQlink one-tap SOS screen'
    )
  },
  {
    id: '02-live-dispatch',
    title: 'Live dispatch tracking',
    description: 'PostGIS map with the assigned unit moving towards the scene and a real-time ETA.',
    svg: screen(
      `${appBar('RW-2026-00184', 'EN ROUTE')}
  <rect x="0" y="104" width="390" height="440" fill="#061124"/>
  <path d="M0 190 L390 160" stroke="#16233d" stroke-width="22" stroke-linecap="round"/>
  <path d="M0 300 L390 268" stroke="#16233d" stroke-width="16" stroke-linecap="round"/>
  <path d="M120 104 L96 544" stroke="#16233d" stroke-width="18" stroke-linecap="round"/>
  <path d="M292 104 L318 544" stroke="#16233d" stroke-width="14" stroke-linecap="round"/>
  <path d="M0 430 L390 392" stroke="#16233d" stroke-width="12" stroke-linecap="round"/>
  <rect x="150" y="200" width="90" height="52" rx="8" fill="rgba(0,161,222,0.06)"/>
  <rect x="30" y="320" width="72" height="48" rx="8" fill="rgba(32,96,61,0.14)"/>
  <rect x="240" y="430" width="80" height="52" rx="8" fill="rgba(0,161,222,0.06)"/>
  <path d="M118 410 C 160 380 200 350 232 306" stroke="#00a1de" stroke-width="5" stroke-linecap="round" fill="none" stroke-dasharray="14 10"/>
  <circle cx="118" cy="410" r="13" fill="#00a1de" stroke="#040a14" stroke-width="4"/>
  <circle cx="118" cy="410" r="5" fill="#ffffff"/>
  <g transform="translate(232, 306)">
    <circle r="15" fill="#ef4444" opacity="0.2"/>
    <path d="M0,12 C0,12 -9,-2 -9,-9 C-9,-14 -5,-18 0,-18 C5,-18 9,-14 9,-9 C9,-2 0,12 0,12 Z" fill="#ef4444" stroke="#ffffff" stroke-width="2"/>
    <circle cx="0" cy="-9" r="3" fill="#ffffff"/>
  </g>
  <text x="256" y="288" font-family="${FONT}" font-size="10" font-weight="700" fill="#ffb4b4">SCENE</text>
  <text x="132" y="436" font-family="${FONT}" font-size="10" font-weight="700" fill="#7fd8f5">RNP Alpha-4</text>

  <rect x="0" y="544" width="390" height="300" rx="28" fill="#08101d"/>
  <rect x="170" y="562" width="50" height="5" rx="2.5" fill="#1b2f4d"/>
  <text x="24" y="606" font-family="${FONT}" font-size="17" font-weight="800" fill="#ffffff">RNP Unit Alpha-4</text>
  <text x="24" y="628" font-family="${FONT}" font-size="11.5" font-weight="600" fill="#94a3b8">Patrol 24-B · GR 421-B · +250 788 311 404</text>
  <rect x="24" y="646" width="164" height="58" rx="16" fill="rgba(0,161,222,0.10)" stroke="rgba(0,161,222,0.3)"/>
  <text x="40" y="674" font-family="${FONT}" font-size="19" font-weight="800" fill="#7fd8f5">4 min</text>
  <text x="40" y="692" font-family="${FONT}" font-size="10" font-weight="600" fill="#94a3b8">Estimated arrival</text>
  <rect x="202" y="646" width="164" height="58" rx="16" fill="rgba(250,210,1,0.08)" stroke="rgba(250,210,1,0.26)"/>
  <text x="218" y="674" font-family="${FONT}" font-size="19" font-weight="800" fill="#fad201">2.1 km</text>
  <text x="218" y="692" font-family="${FONT}" font-size="10" font-weight="600" fill="#94a3b8">Distance to scene</text>`,
      'resQlink live dispatch tracking screen'
    )
  },
  {
    id: '03-ai-copilot',
    title: 'Uwera AI copilot',
    description: 'Gemini-powered triage guidance in Kinyarwanda, English or French.',
    svg: screen(
      `${appBar('Uwera AI', 'GEMINI 2.5')}
  <rect x="24" y="128" width="250" height="66" rx="18" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.09)"/>
  <text x="42" y="156" font-family="${FONT}" font-size="11.5" font-weight="600" fill="#e2e8f4">Muraho! Tell me what is happening and</text>
  <text x="42" y="174" font-family="${FONT}" font-size="11.5" font-weight="600" fill="#e2e8f4">I will walk you through it step by step.</text>

  <rect x="128" y="210" width="238" height="46" rx="18" fill="#00a1de"/>
  <text x="248" y="238" text-anchor="middle" font-family="${FONT}" font-size="11.5" font-weight="700" fill="#040a14">Moto accident, rider bleeding</text>

  <rect x="24" y="272" width="308" height="176" rx="18" fill="rgba(0,161,222,0.08)" stroke="rgba(0,161,222,0.24)"/>
  <text x="42" y="300" font-family="${FONT}" font-size="11.5" font-weight="600" fill="#e2e8f4">1. Call 113 (RNP Traffic) and 912 (SAMU)</text>
  <text x="52" y="318" font-family="${FONT}" font-size="11.5" font-weight="600" fill="#e2e8f4">right away — resQlink dials in one tap.</text>
  <text x="42" y="346" font-family="${FONT}" font-size="11.5" font-weight="600" fill="#e2e8f4">2. Press firmly on the wound with a clean</text>
  <text x="52" y="364" font-family="${FONT}" font-size="11.5" font-weight="600" fill="#e2e8f4">cloth. Do not remove it if soaked.</text>
  <text x="42" y="392" font-family="${FONT}" font-size="11.5" font-weight="600" fill="#e2e8f4">3. Keep the rider still and warm. Do not</text>
  <text x="52" y="410" font-family="${FONT}" font-size="11.5" font-weight="600" fill="#e2e8f4">remove the helmet unless breathing stops.</text>

  <rect x="24" y="466" width="180" height="34" rx="17" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)"/>
  <text x="114" y="488" text-anchor="middle" font-family="${FONT}" font-size="10.5" font-weight="700" fill="#cbd5e1">Send the SOS report</text>
  <rect x="214" y="466" width="150" height="34" rx="17" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)"/>
  <text x="289" y="488" text-anchor="middle" font-family="${FONT}" font-size="10.5" font-weight="700" fill="#cbd5e1">Nearest hospital</text>

  <rect x="24" y="524" width="342" height="56" rx="18" fill="rgba(4,10,20,0.7)" stroke="rgba(255,255,255,0.1)"/>
  <text x="44" y="558" font-family="${FONT}" font-size="12" font-weight="500" fill="#64748b">Describe the emergency…</text>
  <circle cx="336" cy="552" r="17" fill="#00a1de"/>
  <path d="M330 552 h12 m-5 -5 l5 5 -5 5" stroke="#040a14" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  ${hotlineRow(604)}`,
      'resQlink Uwera AI copilot screen'
    )
  },
  {
    id: '04-road-hazard',
    title: 'Road hazard reporting',
    description: 'Citizens geotag potholes, landslides and broken lights straight to RNP crews.',
    svg: screen(
      `${appBar('Road Hazards', 'RNP 113')}
  <text x="24" y="146" font-family="${FONT}" font-size="19" font-weight="800" fill="#ffffff">Report a road hazard</text>
  <text x="24" y="168" font-family="${FONT}" font-size="11" font-weight="500" fill="#94a3b8">Pick the hazard, attach a photo, submit. RNP gets the exact GPS spot.</text>
  ${[
    ['Pothole', '#fad201'],
    ['Landslide', '#ef4444'],
    ['Broken light', '#00a1de'],
    ['Fallen tree', '#3d9c6d'],
    ['Flooding', '#7fd8f5'],
    ['Oil spill', '#ea580c']
  ]
    .map(([label, colour], i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 24 + col * 176;
      const y = 190 + row * 88;
      return `<rect x="${x}" y="${y}" width="166" height="76" rx="18" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.09)"/>
  <circle cx="${x + 26}" cy="${y + 26}" r="11" fill="${colour}" opacity="0.85"/>
  <text x="${x + 16}" y="${y + 60}" font-family="${FONT}" font-size="12" font-weight="700" fill="#e2e8f4">${label}</text>`;
    })
    .join('')}
  <text x="24" y="500" font-family="${FONT}" font-size="11" font-weight="700" letter-spacing="1.6" fill="#5b6b8c">SEVERITY</text>
  <rect x="24" y="512" width="112" height="40" rx="13" fill="#ef4444"/>
  <text x="80" y="537" text-anchor="middle" font-family="${FONT}" font-size="11.5" font-weight="800" fill="#ffffff">Dangerous</text>
  <rect x="144" y="512" width="112" height="40" rx="13" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)"/>
  <text x="200" y="537" text-anchor="middle" font-family="${FONT}" font-size="11.5" font-weight="700" fill="#cbd5e1">Moderate</text>
  <rect x="264" y="512" width="102" height="40" rx="13" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)"/>
  <text x="315" y="537" text-anchor="middle" font-family="${FONT}" font-size="11.5" font-weight="700" fill="#cbd5e1">Attention</text>
  <rect x="24" y="570" width="166" height="66" rx="18" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.09)"/>
  <rect x="46" y="590" width="26" height="20" rx="5" fill="none" stroke="#7fd8f5" stroke-width="2"/>
  <circle cx="59" cy="600" r="4" fill="none" stroke="#7fd8f5" stroke-width="2"/>
  <text x="84" y="606" font-family="${FONT}" font-size="11" font-weight="700" fill="#cbd5e1">Attach photo</text>
  <rect x="200" y="570" width="166" height="66" rx="18" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.09)"/>
  <rect x="222" y="592" width="14" height="20" rx="7" fill="#7fd8f5"/>
  <path d="M229 596 v10" stroke="#040a14" stroke-width="2"/>
  <text x="244" y="606" font-family="${FONT}" font-size="11" font-weight="700" fill="#cbd5e1">Voice note</text>
  <rect x="24" y="656" width="342" height="56" rx="18" fill="#00a1de"/>
  <text x="195" y="690" text-anchor="middle" font-family="${FONT}" font-size="13" font-weight="800" letter-spacing="0.6" fill="#040a14">SUBMIT HAZARD REPORT</text>`,
      'resQlink road hazard reporting screen'
    )
  }
];

/* -------------------------------------------------------------- text assets */

export const BOILERPLATE = {
  short:
    'resQlink is Rwanda\u2019s national emergency response app. One tap sends your GPS position straight to the Rwanda National Police, SAMU and the Fire & Rescue Brigade.',
  medium:
    'resQlink is Rwanda\u2019s national emergency response app, built for citizens, police dispatchers and field responders alike. A single tap locks your GPS position, triages the incident and pushes it straight to the Rwanda National Police, SAMU and the Fire & Rescue Brigade. It works offline over SMS and USSD *113#, speaks Kinyarwanda, English and French, and includes Uwera — an AI copilot that guides users through the critical seconds before responders arrive.',
  long:
    'resQlink is Rwanda\u2019s national emergency response platform, delivered as a citizen app, a command centre and a responder client. On the citizen side, one tap locks high-precision GPS, captures casualties and hazards, and dispatches the report to the Rwanda National Police, SAMU ambulance services and the Fire & Rescue Brigade in a matter of seconds. Where there is no data coverage, the report queues locally and falls back to SMS and the USSD *113# menu. Inside the app, Uwera — an AI copilot powered by Google Gemini — gives calm, step-by-step first-aid guidance and prepares the briefing an operator will ask for, in Kinyarwanda, English or French. On the operations side, dispatchers work from a live PostGIS map with automatic spatial triage, while field units receive GPS heartbeats, routing and one-tap status transitions. All location and health data is handled under Rwanda Law No. 058/2021 with a full DPPO audit trail.'
};

export const FACT_SHEET = [
  ['Product', 'resQlink — Rwanda Emergency Response Platform'],
  ['Category', 'Emergency response / public safety'],
  ['Availability', 'Android (Google Play) and iOS (App Store)'],
  ['Price', 'Free — no ads, no subscription'],
  ['App size', 'Under 12 MB'],
  ['Languages', 'Kinyarwanda, English, French'],
  ['Coverage', 'All 30 districts of Rwanda'],
  ['Average dispatch', '4.2 seconds from tap to RNP dispatch'],
  ['Offline mode', 'SMS fallback + USSD *113# menu'],
  ['AI copilot', 'Uwera, powered by Google Gemini 2.5 Flash'],
  ['Emergency lines', '112 general · 113 traffic · 111 fire · 912 SAMU'],
  ['Compliance', 'Rwanda Law No. 058/2021 (DPPO) audit trail'],
  ['Current version', '2.4']
];

export const USAGE_DO = [
  'Use the supplied SVG whenever possible — it scales cleanly at any size.',
  'Keep a minimum clear space of one third of the mark\u2019s height on every side.',
  'Use the light logo on light backgrounds and the dark logo on dark backgrounds.',
  'Use the emergency red (#EF4444) only for SOS and emergency actions.'
];

export const USAGE_DONT = [
  'Do not recolour, outline or add effects to the mark.',
  'Do not stretch, rotate or crop the logo.',
  'Do not place the logo on a busy photograph without a solid panel.',
  'Do not use the app icon as a general-purpose graphic — it is the app icon.'
];

export const PRESS_CONTACT = {
  name: 'resQlink Media Desk',
  email: 'press@resqlink.rw',
  phone: '+250 788 311 155',
  address: 'Kacyiru, Gasabo District, City of Kigali, Rwanda'
};

export const README_TXT = `resQlink — Press & Media Kit
=====================================

Thank you for covering resQlink, Rwanda's national emergency response app.

CONTENTS
--------
logos/          App icon, primary logo (dark + light) and the monochrome mark,
                supplied as SVG (vector) and PNG (raster).
screenshots/    Four app screens as SVG and PNG — SOS, live dispatch tracking,
                the Uwera AI copilot and road hazard reporting.
badges/         Official-style Google Play and App Store download badges.
docs/           Boilerplate copy, fact sheet and brand guidelines.

FILE FORMATS
------------
SVG  Vector artwork. Use this whenever possible — it scales to any size
     without loss of quality and is ideal for print.
PNG  Raster artwork with a transparent background (logos and marks) or a
     full-bleed dark background (screenshots). Do not enlarge beyond the
     supplied pixel dimensions.

IMPORTANT
---------
The wordmark uses the typeface Plus Jakarta Sans (ExtraBold 800). If you need
to recreate the wordmark in layout, install the typeface from Google Fonts:
https://fonts.google.com/specimen/Plus+Jakarta+Sans

resQlink is an emergency tool. Please make clear in any coverage that in a
life-threatening situation the fastest action is to call 112 directly —
resQlink guides and dispatches, but it never replaces a human operator.

CONTACT
-------
${PRESS_CONTACT.name}
${PRESS_CONTACT.email}
${PRESS_CONTACT.phone}
${PRESS_CONTACT.address}
`;

export const BRAND_GUIDELINES_TXT = `resQlink — Brand Guidelines (summary)
=====================================

COLOUR PALETTE
--------------
${BRAND_COLOURS.map((c) => `${c.name.padEnd(18)} ${c.hex}   ${c.note}`).join('\n')}

TYPOGRAPHY
----------
${TYPOGRAPHY.map((t) => `${t.label.padEnd(22)} ${t.value}`).join('\n')}
Typeface: Plus Jakarta Sans — https://fonts.google.com/specimen/Plus+Jakarta+Sans

LOGO USAGE
----------
DO
${USAGE_DO.map((u) => `- ${u}`).join('\n')}

DON'T
${USAGE_DONT.map((u) => `- ${u}`).join('\n')}

BOILERPLATE — SHORT
-------------------
${BOILERPLATE.short}

BOILERPLATE — MEDIUM
--------------------
${BOILERPLATE.medium}

BOILERPLATE — LONG
------------------
${BOILERPLATE.long}

FACT SHEET
----------
${FACT_SHEET.map(([k, v]) => `${k.padEnd(20)} ${v}`).join('\n')}

CONTACT
-------
${PRESS_CONTACT.name}
${PRESS_CONTACT.email}
${PRESS_CONTACT.phone}
${PRESS_CONTACT.address}
`;
