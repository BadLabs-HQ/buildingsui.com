// DJ Builder: the hard hat droplet with headphones and shades, behind a pair of decks.
export function DjBuilder({ size = 180, spinning = false }: { size?: number; spinning?: boolean }) {
  return (
    <svg width={size} height={size * 0.95} viewBox="0 0 240 228" role="img" aria-label="DJ Builder at the decks">
      <defs>
        <linearGradient id="dj-drop" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#8fd0ff" />
          <stop offset="0.55" stopColor="#4da2ff" />
          <stop offset="1" stopColor="#2a6fe0" />
        </linearGradient>
        <linearGradient id="dj-deck" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9e2ee" />
          <stop offset="1" stopColor="#8e9bb0" />
        </linearGradient>
      </defs>

      {/* droplet body */}
      <path d="M120 58 C120 58 58 98 58 132 A62 62 0 0 0 182 132 C182 98 120 58 120 58 Z" fill="url(#dj-drop)" stroke="#06122b" strokeWidth="6" strokeLinejoin="round" />
      {/* hard hat */}
      <path d="M74 76 C74 44 166 44 166 76 Z" fill="#ffc83d" stroke="#06122b" strokeWidth="6" strokeLinejoin="round" />
      <rect x="60" y="72" width="120" height="14" rx="7" fill="#ffc83d" stroke="#06122b" strokeWidth="6" />
      {/* headphones */}
      <path d="M64 118 C60 70 180 70 176 118" stroke="#06122b" strokeWidth="9" fill="none" strokeLinecap="round" />
      <rect x="48" y="106" width="24" height="38" rx="10" fill="#4da2ff" stroke="#06122b" strokeWidth="5" />
      <rect x="168" y="106" width="24" height="38" rx="10" fill="#4da2ff" stroke="#06122b" strokeWidth="5" />
      {/* shades */}
      <path d="M80 110 H160 V120 Q158 136 140 136 Q124 136 122 120 H118 Q116 136 100 136 Q82 136 80 120 Z" fill="#06122b" />
      <path d="M88 114 h14" stroke="#4da2ff" strokeWidth="3" strokeLinecap="round" />
      <path d="M128 114 h14" stroke="#4da2ff" strokeWidth="3" strokeLinecap="round" />
      <path d="M98 152 Q120 166 142 150" stroke="#06122b" strokeWidth="6" strokeLinecap="round" fill="none" />

      {/* decks */}
      <rect x="6" y="160" width="228" height="58" rx="10" fill="url(#dj-deck)" stroke="#06122b" strokeWidth="6" />
      <rect x="102" y="170" width="36" height="40" rx="5" fill="#5b6a82" stroke="#06122b" strokeWidth="4" />
      <path d="M112 178 v24 M128 178 v24" stroke="#ffc83d" strokeWidth="4" strokeLinecap="round" />
      {[52, 188].map((cx) => (
        <g key={cx} className={spinning ? 'dj-spin' : undefined} style={{ transformOrigin: `${cx}px 189px` }}>
          <circle cx={cx} cy="189" r="24" fill="#1b2433" stroke="#06122b" strokeWidth="4" />
          <circle cx={cx} cy="189" r="15" fill="none" stroke="#3a4a66" strokeWidth="2" />
          <circle cx={cx} cy="189" r="6" fill="#ffc83d" />
          <rect x={cx - 1.5} y="168" width="3" height="9" fill="#eaf4ff" />
        </g>
      ))}
    </svg>
  );
}
