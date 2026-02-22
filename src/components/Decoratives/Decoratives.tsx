import React from 'react';
import './Decoratives.css';

/* ===== Lantern ===== */
interface LanternProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Lantern: React.FC<LanternProps> = ({ className = '', size = 'md' }) => {
  const sizeMap = { sm: { w: 20, h: 32 }, md: { w: 28, h: 44 }, lg: { w: 36, h: 56 } };
  const s = sizeMap[size];
  return (
    <div className={`deco-lantern deco-lantern--${size} ${className}`}>
      <svg width={s.w} height={s.h} viewBox="0 0 28 44" fill="none">
        <rect x="11" y="0" width="6" height="6" rx="1" fill="var(--primary-dark)" />
        <line x1="14" y1="6" x2="14" y2="10" stroke="var(--primary-dark)" strokeWidth="1.5" />
        <ellipse cx="14" cy="26" rx="13" ry="16" fill="var(--lantern-body)" />
        <ellipse cx="14" cy="26" rx="10" ry="13" fill="var(--lantern-glow)" opacity="0.7" />
        <ellipse cx="14" cy="26" rx="5" ry="8" fill="var(--lantern-core)" opacity="0.4" />
        <rect x="10" y="42" width="8" height="2" rx="1" fill="var(--primary-dark)" />
      </svg>
    </div>
  );
};

/* ===== Blossom Branch ===== */
interface BlossomBranchProps {
  className?: string;
  variant?: 'peach' | 'apricot';
}

export const BlossomBranch: React.FC<BlossomBranchProps> = ({ className = '', variant = 'peach' }) => {
  const petalColor = variant === 'peach' ? 'var(--blossom-petal)' : 'var(--accent)';
  const centerColor = 'var(--blossom-center)';
  return (
    <div className={`deco-blossom-branch deco-blossom-branch--${variant} ${className}`}>
      <svg width="80" height="90" viewBox="0 0 80 90" fill="none">
        {/* Branch */}
        <path
          d="M40 85 C35 65, 25 50, 15 35 C10 28, 20 20, 30 25 C35 28, 38 35, 40 42"
          stroke="var(--primary-dark)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M40 42 C42 35, 50 28, 55 25 C60 22, 65 28, 62 35"
          stroke="var(--primary-dark)"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
        {/* Flowers */}
        {[
          { cx: 15, cy: 32, r: 6 },
          { cx: 30, cy: 22, r: 7 },
          { cx: 55, cy: 22, r: 6 },
          { cx: 62, cy: 32, r: 5 },
          { cx: 40, cy: 40, r: 5 },
        ].map((f, i) => (
          <g key={i}>
            {[0, 72, 144, 216, 288].map((angle) => (
              <ellipse
                key={angle}
                cx={f.cx}
                cy={f.cy - f.r + 1}
                rx={f.r * 0.4}
                ry={f.r * 0.65}
                fill={petalColor}
                opacity="0.75"
                transform={`rotate(${angle} ${f.cx} ${f.cy})`}
              />
            ))}
            <circle cx={f.cx} cy={f.cy} r={f.r * 0.3} fill={centerColor} />
          </g>
        ))}
      </svg>
    </div>
  );
};

/* ===== Cloud Motif ===== */
interface CloudMotifProps {
  className?: string;
}

export const CloudMotif: React.FC<CloudMotifProps> = ({ className = '' }) => (
  <div className={`deco-cloud ${className}`}>
    <svg width="100" height="40" viewBox="0 0 100 40" fill="none" opacity="0.18">
      <path
        d="M10 30 Q15 10, 30 15 Q35 5, 50 12 Q60 2, 72 12 Q85 8, 90 20 Q95 30, 80 32 L20 32 Q5 32, 10 30Z"
        fill="var(--text-subtle)"
      />
    </svg>
  </div>
);

/* ===== Zodiac Mascot (Snake for 2025) ===== */
interface ZodiacMascotProps {
  className?: string;
  size?: number;
}

export const ZodiacMascot: React.FC<ZodiacMascotProps> = ({ className = '', size = 48 }) => (
  <div className={`deco-mascot ${className}`}>
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      {/* Coiled body */}
      <path
        d="M24 40 C10 40, 6 30, 10 22 C14 14, 22 12, 28 16 C34 20, 32 28, 26 30 C20 32, 18 28, 20 24"
        stroke="var(--primary)"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Head */}
      <circle cx="20" cy="24" r="4" fill="var(--primary)" />
      {/* Eye */}
      <circle cx="19" cy="23" r="1.2" fill="var(--bg)" />
      {/* Tongue */}
      <path
        d="M16 25 L13 27 M13 27 L12 26 M13 27 L12 28"
        stroke="var(--secondary)"
        strokeWidth="1"
        strokeLinecap="round"
      />
      {/* Pattern dots */}
      <circle cx="28" cy="17" r="1" fill="var(--accent)" opacity="0.7" />
      <circle cx="32" cy="22" r="1" fill="var(--accent)" opacity="0.7" />
      <circle cx="28" cy="28" r="1" fill="var(--accent)" opacity="0.7" />
    </svg>
  </div>
);

/* ===== Traditional Cake (Banh Chung / Banh Tet) ===== */
interface TraditionalCakeProps {
  className?: string;
  variant?: 'chung' | 'tet';
}

export const TraditionalCake: React.FC<TraditionalCakeProps> = ({ className = '', variant = 'chung' }) => (
  <div className={`deco-cake deco-cake--${variant} ${className}`}>
    {variant === 'chung' ? (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        {/* Square banh chung */}
        <rect x="4" y="4" width="28" height="28" rx="3" fill="#15803d" />
        <rect x="7" y="7" width="22" height="22" rx="1.5" fill="#22c55e" opacity="0.6" />
        {/* Bamboo string ties */}
        <line x1="18" y1="2" x2="18" y2="34" stroke="#14532d" strokeWidth="1.5" />
        <line x1="2" y1="18" x2="34" y2="18" stroke="#14532d" strokeWidth="1.5" />
        {/* Center decoration */}
        <rect x="14" y="14" width="8" height="8" rx="1" fill="#fde68a" opacity="0.5" />
      </svg>
    ) : (
      <svg width="20" height="40" viewBox="0 0 20 40" fill="none">
        {/* Cylindrical banh tet */}
        <rect x="3" y="4" width="14" height="32" rx="7" fill="#15803d" />
        <rect x="5" y="6" width="10" height="28" rx="5" fill="#22c55e" opacity="0.5" />
        {/* Ties */}
        <line x1="2" y1="12" x2="18" y2="12" stroke="#14532d" strokeWidth="1" />
        <line x1="2" y1="20" x2="18" y2="20" stroke="#14532d" strokeWidth="1" />
        <line x1="2" y1="28" x2="18" y2="28" stroke="#14532d" strokeWidth="1" />
      </svg>
    )}
  </div>
);

/* ===== Mystic Knot Divider ===== */
interface MysticKnotProps {
  className?: string;
  width?: number;
}

export const MysticKnot: React.FC<MysticKnotProps> = ({ className = '', width = 160 }) => (
  <div className={`deco-knot ${className}`}>
    <svg width={width} height="24" viewBox="0 0 160 24" fill="none">
      <line x1="0" y1="12" x2="50" y2="12" stroke="var(--border)" strokeWidth="1" />
      {/* Center knot */}
      <path
        d="M60 6 C65 6, 68 10, 68 12 C68 14, 65 18, 60 18 C55 18, 52 14, 52 12 C52 10, 55 6, 60 6Z"
        stroke="var(--primary)"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M80 12 C80 8, 85 4, 90 4 C95 4, 100 8, 100 12 C100 16, 95 20, 90 20 C85 20, 80 16, 80 12Z"
        stroke="var(--secondary)"
        strokeWidth="1.5"
        fill="none"
      />
      <circle cx="75" cy="12" r="2" fill="var(--primary)" opacity="0.4" />
      <line x1="110" y1="12" x2="160" y2="12" stroke="var(--border)" strokeWidth="1" />
    </svg>
  </div>
);
