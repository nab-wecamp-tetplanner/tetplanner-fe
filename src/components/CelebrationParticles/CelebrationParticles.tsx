import React from 'react';
import './CelebrationParticles.css';

interface CelebrationParticlesProps {
  /** Viewport X coordinate for burst origin */
  x: number;
  /** Viewport Y coordinate for burst origin */
  y: number;
  /** Called when the animation is fully complete */
  onComplete?: () => void;
}

type ParticleType = 'coin' | 'confetti' | 'spark' | 'petal';

interface Particle {
  id: number;
  type: ParticleType;
  variant?: string;
  tx: number;   // final X offset
  ty: number;   // final Y offset
  rot: number;  // final rotation
  duration: number;
  delay: number;
  spinDuration?: number;
  swayDuration?: number;
}

/* ---------- helpers ---------- */
const rand = (min: number, max: number) => Math.random() * (max - min) + min;
const randInt = (min: number, max: number) => Math.floor(rand(min, max));

const CONFETTI_VARIANTS = ['confetti-red', 'confetti-gold', 'confetti-crimson'] as const;

function generateParticles(): Particle[] {
  const particles: Particle[] = [];
  let id = 0;

  // Golden coins — 8
  for (let i = 0; i < 8; i++) {
    const angle = rand(0, Math.PI * 2);
    const dist = rand(60, 160);
    particles.push({
      id: id++,
      type: 'coin',
      tx: Math.cos(angle) * dist,
      ty: Math.sin(angle) * dist - rand(20, 60),
      rot: rand(-360, 360),
      duration: rand(0.9, 1.4),
      delay: rand(0, 0.15),
    });
  }

  // Red confetti — 14
  for (let i = 0; i < 14; i++) {
    const angle = rand(0, Math.PI * 2);
    const dist = rand(50, 180);
    particles.push({
      id: id++,
      type: 'confetti',
      variant: CONFETTI_VARIANTS[randInt(0, 3)],
      tx: Math.cos(angle) * dist,
      ty: Math.sin(angle) * dist - rand(10, 40),
      rot: rand(-540, 540),
      duration: rand(0.8, 1.3),
      delay: rand(0, 0.12),
      spinDuration: rand(0.4, 0.9),
    });
  }

  // Firecracker sparks — 18
  for (let i = 0; i < 18; i++) {
    const angle = rand(0, Math.PI * 2);
    const dist = rand(40, 200);
    particles.push({
      id: id++,
      type: 'spark',
      tx: Math.cos(angle) * dist,
      ty: Math.sin(angle) * dist,
      rot: 0,
      duration: rand(0.5, 0.9),
      delay: rand(0, 0.08),
    });
  }

  // Peach blossom petals — 10
  for (let i = 0; i < 10; i++) {
    const angle = rand(0, Math.PI * 2);
    const dist = rand(60, 150);
    particles.push({
      id: id++,
      type: 'petal',
      tx: Math.cos(angle) * dist,
      ty: Math.sin(angle) * dist + rand(20, 60),
      rot: rand(-180, 180),
      duration: rand(1.2, 1.8),
      delay: rand(0, 0.2),
      swayDuration: rand(0.8, 1.6),
    });
  }

  return particles;
}

const CelebrationParticles: React.FC<CelebrationParticlesProps> = ({ x, y, onComplete }) => {
  const [particles] = React.useState<Particle[]>(() => generateParticles());

  React.useEffect(() => {
    // Auto-remove after longest possible animation
    const timeout = setTimeout(() => {
      onComplete?.();
    }, 2200);
    return () => clearTimeout(timeout);
  }, [onComplete]);

  const getClassName = (p: Particle) => {
    let cls = `celebration-particle celebration-particle--${p.type}`;
    if (p.variant) cls += ` celebration-particle--${p.variant}`;
    return cls;
  };

  return (
    <div className="celebration-container">
      {/* Shockwave ring */}
      <div
        className="celebration-shockwave"
        style={{ left: x, top: y }}
      />

      {/* Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className={getClassName(p)}
          style={{
            left: x,
            top: y,
            '--tx': `${p.tx}px`,
            '--ty': `${p.ty}px`,
            '--rot': `${p.rot}deg`,
            '--duration': `${p.duration}s`,
            '--spin-duration': `${p.spinDuration ?? 0.6}s`,
            '--sway-duration': `${p.swayDuration ?? 1}s`,
            animationDelay: `${p.delay}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

export default CelebrationParticles;
