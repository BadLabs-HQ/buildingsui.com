type Props = { size?: number; mood?: 'grin' | 'wink' | 'wow'; className?: string };

// Hard hat Sui droplet. Pure SVG so it stays crisp and costs nothing to store on Walrus.
export function Mascot({ size = 240, mood = 'grin', className }: Props) {
  return (
    <svg
      className={className}
      width={size}
      height={size * 1.15}
      viewBox="0 0 200 230"
      role="img"
      aria-label="Builder droplet mascot wearing a hard hat"
    >
      <defs>
        <linearGradient id="drop" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#8fd0ff" />
          <stop offset="0.55" stopColor="#4da2ff" />
          <stop offset="1" stopColor="#2a6fe0" />
        </linearGradient>
        <linearGradient id="hat" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe07a" />
          <stop offset="1" stopColor="#ffb31a" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="218" rx="58" ry="8" fill="#000" opacity="0.28" />
      <path
        d="M100 40 C100 40 34 98 34 142 A66 66 0 0 0 166 142 C166 98 100 40 100 40 Z"
        fill="url(#drop)"
        stroke="#06122b"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <path d="M62 128 C62 104 78 84 92 70" stroke="#fff" strokeOpacity="0.55" strokeWidth="9" strokeLinecap="round" fill="none" />
      {/* hard hat */}
      <path d="M52 78 C52 44 148 44 148 78 Z" fill="url(#hat)" stroke="#06122b" strokeWidth="6" strokeLinejoin="round" />
      <rect x="92" y="40" width="16" height="36" rx="6" fill="#ffd24d" stroke="#06122b" strokeWidth="5" />
      <rect x="36" y="74" width="128" height="16" rx="8" fill="url(#hat)" stroke="#06122b" strokeWidth="6" />
      {/* face */}
      {mood === 'wink' ? (
        <path d="M68 128 q10 -8 20 0" stroke="#06122b" strokeWidth="6" strokeLinecap="round" fill="none" />
      ) : (
        <g>
          <ellipse cx="78" cy="126" rx="9" ry="12" fill="#06122b" />
          <circle cx="81" cy="121" r="3.5" fill="#fff" />
        </g>
      )}
      <ellipse cx="122" cy="126" rx="9" ry="12" fill="#06122b" />
      <circle cx="125" cy="121" r="3.5" fill="#fff" />
      {mood === 'wow' ? (
        <ellipse cx="100" cy="162" rx="11" ry="13" fill="#06122b" />
      ) : (
        <path d="M74 152 Q100 180 126 152" stroke="#06122b" strokeWidth="6" strokeLinecap="round" fill="#0a1b3d" />
      )}
      <ellipse cx="64" cy="150" rx="9" ry="6" fill="#ff8fb1" opacity="0.55" />
      <ellipse cx="136" cy="150" rx="9" ry="6" fill="#ff8fb1" opacity="0.55" />
    </svg>
  );
}
