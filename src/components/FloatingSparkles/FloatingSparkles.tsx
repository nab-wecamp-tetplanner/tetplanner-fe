import React, { useState } from 'react';
import './FloatingSparkles.css';

interface Sparkle {
  id: number;
  left: number;       // % from left
  size: number;       // px (2-4)
  delay: number;      // s
  duration: number;   // s
  opacity: number;    // max opacity
  drift: number;      // horizontal drift px
}

interface FloatingSparklesProps {
  count?: number;
}

function generateSparkles(count: number): Sparkle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    size: 2 + Math.random() * 2.5,
    delay: Math.random() * 14,
    duration: 8 + Math.random() * 12,
    opacity: 0.3 + Math.random() * 0.5,
    drift: -30 + Math.random() * 60,
  }));
}

const FloatingSparkles: React.FC<FloatingSparklesProps> = ({ count = 28 }) => {
  const [sparkles] = useState<Sparkle[]>(() => generateSparkles(count));

  return (
    <div className="floating-sparkles" aria-hidden="true">
      {sparkles.map((s) => (
        <div
          key={s.id}
          className="floating-sparkles__dot"
          style={{
            left: `${s.left}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
            ['--sparkle-drift' as string]: `${s.drift}px`,
            ['--sparkle-opacity' as string]: s.opacity,
          }}
        />
      ))}
    </div>
  );
};

export default FloatingSparkles;
