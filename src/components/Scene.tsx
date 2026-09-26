import type { CSSProperties } from 'react';

// Full screen painted backdrop: a Sui blue sunrise over the ocean and a skyline under construction.
// Everything is vector, so it is sharp at any size and tiny to host on Walrus.

const HORIZON = 610;

type Tower = { x: number; w: number; h: number; unfinished?: boolean };

const towers: Tower[] = [
  { x: 40, w: 90, h: 210 },
  { x: 140, w: 70, h: 300, unfinished: true },
  { x: 220, w: 110, h: 170 },
  { x: 345, w: 80, h: 250 },
  { x: 1020, w: 90, h: 230 },
  { x: 1120, w: 120, h: 330, unfinished: true },
  { x: 1255, w: 80, h: 190 },
  { x: 1345, w: 105, h: 280 },
  { x: 1465, w: 95, h: 220, unfinished: true },
];

function Building({ x, w, h, unfinished }: Tower) {
  const top = HORIZON - h;
  const cols = Math.floor((w - 16) / 18);
  const rows = Math.floor((h - (unfinished ? 70 : 24)) / 24);
  const windows = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // Deterministic "random" lights so the skyline never flickers between renders.
      const lit = (x * 7 + r * 13 + c * 29) % 5 < 2;
      windows.push(
        <rect
          key={`${r}-${c}`}
          x={x + 10 + c * 18}
          y={top + (unfinished ? 60 : 16) + r * 24}
          width="9"
          height="12"
          rx="1.5"
          fill={lit ? '#ffd98a' : '#1d3a7a'}
          opacity={lit ? 0.9 : 0.55}
        />,
      );
    }
  }
  return (
    <g>
      <rect x={x} y={top + (unfinished ? 50 : 0)} width={w} height={h - (unfinished ? 50 : 0)} fill="#0c2152" />
      <rect x={x} y={top + (unfinished ? 50 : 0)} width="6" height={h} fill="#16326f" />
      {unfinished && (
        <g stroke="#ffc83d" strokeWidth="2.5" opacity="0.85">
          {/* scaffolding on the unfinished floors */}
          <line x1={x} y1={top} x2={x} y2={top + 50} />
          <line x1={x + w} y1={top} x2={x + w} y2={top + 50} />
          <line x1={x} y1={top} x2={x + w} y2={top} />
          <line x1={x} y1={top + 25} x2={x + w} y2={top + 25} />
          <line x1={x} y1={top} x2={x + w} y2={top + 50} />
          <line x1={x + w} y1={top} x2={x} y2={top + 50} />
        </g>
      )}
      {windows}
    </g>
  );
}

function Crane({ x, h, jib, flip = false }: { x: number; h: number; jib: number; flip?: boolean }) {
  const top = HORIZON - h;
  const dir = flip ? -1 : 1;
  return (
    <g stroke="#ffc83d" strokeWidth="3" fill="none" opacity="0.95">
      <line x1={x} y1={HORIZON} x2={x} y2={top} />
      <line x1={x + 14} y1={HORIZON} x2={x + 14} y2={top} />
      {Array.from({ length: Math.floor(h / 22) }, (_, i) => (
        <line key={i} x1={x} y1={HORIZON - i * 22} x2={x + 14} y2={HORIZON - (i + 1) * 22} />
      ))}
      <line x1={x + 7 - dir * 40} y1={top} x2={x + 7 + dir * jib} y2={top} />
      <line x1={x + 7 - dir * 40} y1={top + 10} x2={x + 7 + dir * jib} y2={top + 10} />
      <line x1={x + 7} y1={top - 26} x2={x + 7 + dir * jib} y2={top} />
      <line x1={x + 7} y1={top - 26} x2={x + 7 - dir * 40} y2={top} />
      <rect x={x + 7 - dir * 40 - (flip ? 0 : 18)} y={top + 10} width="18" height="16" fill="#ffc83d" stroke="none" />
      <g className="scene-hook" style={{ transformOrigin: `${x + 7 + dir * jib * 0.75}px ${top + 10}px` }}>
        <line x1={x + 7 + dir * jib * 0.75} y1={top + 10} x2={x + 7 + dir * jib * 0.75} y2={top + 90} strokeWidth="1.5" stroke="#eaf4ff" />
        <rect x={x + 7 + dir * jib * 0.75 - 16} y={top + 90} width="32" height="18" rx="3" fill="#4da2ff" stroke="#0c2152" />
      </g>
    </g>
  );
}

function Cloud({ className, style }: { className: string; style?: CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 320 110" aria-hidden>
      <g fill="#fff3e4">
        <ellipse cx="90" cy="70" rx="80" ry="34" />
        <ellipse cx="170" cy="52" rx="70" ry="44" />
        <ellipse cx="240" cy="72" rx="68" ry="30" />
      </g>
      <g fill="#ffc9a8" opacity="0.7">
        <ellipse cx="160" cy="92" rx="140" ry="14" />
      </g>
    </svg>
  );
}

export function Scene() {
  return (
    <div className="scene" aria-hidden>
      <svg className="scene-art" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0a1c52" />
            <stop offset="0.35" stopColor="#2458c7" />
            <stop offset="0.58" stopColor="#5fb0ff" />
            <stop offset="0.68" stopColor="#ffc7a1" />
            <stop offset="0.7" stopColor="#ffe3a6" />
          </linearGradient>
          <radialGradient id="sun" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#fffbe8" />
            <stop offset="0.35" stopColor="#ffe08a" />
            <stop offset="0.7" stopColor="#ffc83d" stopOpacity="0.55" />
            <stop offset="1" stopColor="#ffc83d" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3b86e8" />
            <stop offset="0.4" stopColor="#1a4bb0" />
            <stop offset="1" stopColor="#081a47" />
          </linearGradient>
          <linearGradient id="glint" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff1c2" stopOpacity="0.9" />
            <stop offset="1" stopColor="#ffc83d" stopOpacity="0" />
          </linearGradient>
        </defs>

        <rect width="1600" height={HORIZON} fill="url(#sky)" />
        {/* sun rays */}
        <g opacity="0.16" fill="#fff4cc">
          {Array.from({ length: 12 }, (_, i) => (
            <path key={i} d="M800 600 L780 -200 L820 -200 Z" transform={`rotate(${-75 + i * 13.6} 800 600)`} />
          ))}
        </g>
        <circle cx="800" cy="600" r="320" fill="url(#sun)" />
        <circle cx="800" cy="600" r="92" fill="#fff6d6" />

        {/* distant hills */}
        <path d="M0 610 Q160 540 320 590 T640 575 T980 590 T1300 560 T1600 590 V610 H0 Z" fill="#274f9e" opacity="0.7" />

        {towers.map((t) => (
          <Building key={t.x} {...t} />
        ))}
        <Crane x={255} h={380} jib={170} />
        <Crane x={1180} h={420} jib={200} flip />

        <rect y={HORIZON} width="1600" height={900 - HORIZON} fill="url(#sea)" />
        {/* sun reflection */}
        <g className="scene-glint">
          {Array.from({ length: 9 }, (_, i) => (
            <rect
              key={i}
              x={800 - (90 - i * 8)}
              y={HORIZON + 8 + i * 26}
              width={(90 - i * 8) * 2}
              height="7"
              rx="3.5"
              fill="url(#glint)"
              opacity={0.85 - i * 0.08}
            />
          ))}
        </g>
        <g stroke="#9fd0ff" strokeWidth="2" opacity="0.35" strokeLinecap="round">
          <line x1="140" y1="680" x2="230" y2="680" />
          <line x1="420" y1="740" x2="540" y2="740" />
          <line x1="1060" y1="700" x2="1170" y2="700" />
          <line x1="1300" y1="780" x2="1440" y2="780" />
          <line x1="260" y1="830" x2="380" y2="830" />
        </g>
      </svg>

      <Cloud className="cloud cloud-far" style={{ top: '9%' }} />
      <Cloud className="cloud cloud-near" style={{ top: '22%' }} />
      <Cloud className="cloud cloud-far slow" style={{ top: '4%', animationDelay: '-60s' }} />
      <div className="scene-shade" />
    </div>
  );
}
