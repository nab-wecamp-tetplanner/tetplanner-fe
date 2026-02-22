import React, { useMemo } from 'react';
import './FallingPetals.css';

interface Petal {
  id: number;
  left: number;      // % from left
  size: number;       // px
  delay: number;      // s
  duration: number;   // s
  rotation: number;   // initial deg
  drift: number;      // horizontal sway px
  opacity: number;
}

interface FallingPetalsProps {
  count?: number;
}

const FallingPetals: React.FC<FallingPetalsProps> = ({ count = 18 }) => {
  const petals = useMemo<Petal[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 8 + Math.random() * 10,
      delay: Math.random() * 12,
      duration: 10 + Math.random() * 10,
      rotation: Math.random() * 360,
      drift: -40 + Math.random() * 80,
      opacity: 0.25 + Math.random() * 0.45,
    }));
  }, [count]);

  return (
    <div className="falling-petals" aria-hidden="true">
      {petals.map((p) => (
        <div
          key={p.id}
          className="falling-petals__petal"
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            ['--drift' as string]: `${p.drift}px`,
            ['--rotation' as string]: `${p.rotation}deg`,
          }}
        >
          <svg
            width={p.size}
            height={p.size}
            viewBox="0 0 16 16"
            fill="none"
            style={{ opacity: p.opacity }}
          >
            {/* 5-petal apricot blossom */}
            {[0, 72, 144, 216, 288].map((angle) => (
              <ellipse
                key={angle}
                cx="8"
                cy="4"
                rx="2.8"
                ry="4.5"
                fill="var(--blossom-petal)"
                transform={`rotate(${angle} 8 8)`}
              />
            ))}
            <circle cx="8" cy="8" r="2" fill="var(--blossom-center)" />
          </svg>
        </div>
      ))}
    </div>
  );
};

export default FallingPetals;
