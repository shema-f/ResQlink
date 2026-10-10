import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showSubtitle?: boolean;
  className?: string;
}

export const ResQlinkLogo: React.FC<LogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = ''
}) => {
  const iconDimensions = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-16 h-16',
    hero: 'w-24 h-24 sm:w-28 sm:h-28'
  }[size];

  const titleSize = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    hero: 'text-4xl sm:text-5xl'
  }[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* App Icon Badge */}
      <div className={`relative flex-shrink-0 ${iconDimensions} rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-black p-0.5 shadow-xl shadow-cyan-950/40 border border-cyan-500/30 overflow-hidden group`}>
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow">
          <defs>
            {/* Background Glow */}
            <radialGradient id="badgeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#020617" stopOpacity="1" />
            </radialGradient>

            {/* Rwanda Silhouette / Flag Colors */}
            <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>

            <linearGradient id="yellowBand" x1="0%" y1="0%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#eab308" />
            </linearGradient>

            <linearGradient id="greenBand" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#15803d" />
              <stop offset="100%" stopColor="#166534" />
            </linearGradient>

            {/* Pin Red Gradient */}
            <linearGradient id="pinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#b91c1c" />
            </linearGradient>
          </defs>

          {/* Badge Background */}
          <rect width="200" height="200" rx="42" fill="#060e1d" />

          {/* Rwanda Map Outline Contour */}
          <path
            d="M 60,35 C 75,30 95,38 115,28 C 135,24 152,36 160,52 C 168,68 158,85 165,102 C 172,118 162,135 152,142 C 135,155 120,148 100,152 C 78,156 62,146 50,135 C 38,124 42,98 42,80 C 42,60 48,42 60,35 Z"
            fill="url(#skyGrad)"
            stroke="#38bdf8"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Mountains Silhouette in Upper Map */}
          <path
            d="M 50,90 L 80,55 L 110,95 L 140,65 L 163,100 L 45,100 Z"
            fill="#034870"
            opacity="0.6"
          />

          {/* Radiant Sun in Rwanda's Map top-right */}
          <g transform="translate(138, 52) scale(0.65)">
            <circle cx="0" cy="0" r="10" fill="#facc15" />
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => (
              <line
                key={i}
                x1="0"
                y1="-13"
                x2="0"
                y2="-19"
                stroke="#facc15"
                strokeWidth="2.5"
                strokeLinecap="round"
                transform={`rotate(${deg})`}
              />
            ))}
          </g>

          {/* Yellow Swoop Band */}
          <path
            d="M 44,115 C 75,110 115,90 164,82 C 165,95 160,112 150,122 C 115,115 75,130 45,135 Z"
            fill="url(#yellowBand)"
          />

          {/* Green Hills Base */}
          <path
            d="M 45,132 C 75,128 115,114 152,120 C 145,138 125,149 100,152 C 78,155 60,146 45,132 Z"
            fill="url(#greenBand)"
          />

          {/* Curving Winding Road */}
          <path
            d="M 100,105 C 98,125 78,145 70,175 L 125,175 C 115,145 106,125 104,105 Z"
            fill="#f8fafc"
          />
          <path
            d="M 98,115 L 94,170"
            stroke="#94a3b8"
            strokeWidth="2"
            strokeDasharray="4 3"
          />

          {/* Radiating Sound / Emergency Waves */}
          {/* Left waves */}
          <path
            d="M 68,90 C 63,80 63,68 68,58"
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 59,96 C 52,82 52,66 59,52"
            stroke="#38bdf8"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />

          {/* Right waves */}
          <path
            d="M 132,90 C 137,80 137,68 132,58"
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 141,96 C 148,82 148,66 141,52"
            stroke="#38bdf8"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />

          {/* Central Emergency Red Pin with White Cross */}
          <g transform="translate(100, 72) scale(1.1)">
            {/* Pin body */}
            <path
              d="M 0,26 C -0.5,24 -17,2 -17,-12 C -17,-22 -9.5,-30 0,-30 C 9.5,-30 17,-22 17,-12 C 17,2 0.5,24 0,26 Z"
              fill="url(#pinGrad)"
              stroke="#ffffff"
              strokeWidth="2.5"
            />
            {/* White Medical Cross */}
            <path
              d="M -3,-18 H 3 V -14 H 7 V -10 H 3 V -6 H -3 V -10 H -7 V -14 H -3 Z"
              fill="#ffffff"
            />
          </g>
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <div className={`font-extrabold tracking-tight text-white flex items-baseline ${titleSize}`}>
          <span>res</span>
          <span className="text-cyan-400 font-black">Q</span>
          <span>link</span>
        </div>
        {showSubtitle && (
          <div className="flex items-center gap-1.5 -mt-0.5">
            <span className="text-[9px] sm:text-[10px] font-bold tracking-widest text-slate-300 uppercase">
              RWANDA EMERGENCY RESPONSE
            </span>
            <div className="hidden sm:flex h-1.5 w-6 rounded-full overflow-hidden border border-slate-700/60 ml-0.5">
              <span className="w-1/3 bg-sky-400" />
              <span className="w-1/3 bg-yellow-400" />
              <span className="w-1/3 bg-emerald-600" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const RNPDoveBadge: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => {
  return (
    <div className={`relative ${className} flex-shrink-0 rounded-full border border-amber-400/50 p-0.5 bg-gradient-to-b from-[#102a5c] to-[#081836] shadow-md flex items-center justify-center`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Outer Circular Police Ring */}
        <circle cx="50" cy="50" r="46" fill="none" stroke="#facc15" strokeWidth="3" />
        <circle cx="50" cy="50" r="41" fill="#0d234d" stroke="#facc15" strokeWidth="1" strokeDasharray="3 2" />
        
        {/* RNP Peace Dove Silhouette */}
        <path
          d="M 50,30 C 53,30 57,28 62,24 C 64,28 67,31 72,32 C 67,35 63,39 60,45 C 57,51 55,59 55,68 L 47,65 C 47,60 48,54 45,51 C 42,48 37,47 31,48 C 35,43 40,41 43,36 C 45,33 46,31 50,30 Z"
          fill="#ffffff"
          stroke="#facc15"
          strokeWidth="1.2"
        />
        {/* Olive Branch in Beak */}
        <path
          d="M 62,24 Q 69,20 74,23 M 65,22 Q 68,18 70,21 M 68,22 Q 72,20 75,25"
          stroke="#4ade80"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
        {/* Star Ribbon */}
        <polygon points="50,72 52,77 57,77 53,80 55,85 50,82 45,85 47,80 43,77 48,77" fill="#facc15" />
      </svg>
    </div>
  );
};
