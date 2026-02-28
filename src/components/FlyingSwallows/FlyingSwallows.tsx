import React, { useState, useEffect, useCallback } from 'react';
import './FlyingSwallows.css';

interface Swallow {
  id: number;
  startX: number;   // % start position
  startY: number;   // % start position  
  size: number;     // scale factor
  duration: number; // s — flight time across screen
  delay: number;    // s — stagger between birds in a flock
  flip: boolean;    // mirror horizontally for variety
  route: number;    // which flight path (0-3)
}

interface FlyingSwallowsProps {
  /** Seconds between each flock appearance */
  interval?: number;
  /** Number of birds per flock */
  flockSize?: number;
}

const ROUTES = [
  // top-left → bottom-right
  { from: { x: -8, y: 10 }, to: { x: 110, y: 75 } },
  // top-right → bottom-left
  { from: { x: 108, y: 8 }, to: { x: -10, y: 70 } },
  // left-mid → right-top
  { from: { x: -8, y: 50 }, to: { x: 110, y: 15 } },
  // right-mid → left-bottom
  { from: { x: 108, y: 40 }, to: { x: -10, y: 80 } },
];

function generateFlock(flockSize: number, flockId: number): Swallow[] {
  const route = flockId % ROUTES.length;
  return Array.from({ length: flockSize }, (_, i) => ({
    id: flockId * 100 + i,
    startX: 0,
    startY: 0,
    size: 0.7 + Math.random() * 0.5,
    duration: 4 + Math.random() * 2.5,
    delay: i * (0.4 + Math.random() * 0.6),
    flip: route === 1 || route === 3,
    route,
  }));
}

const FlyingSwallows: React.FC<FlyingSwallowsProps> = ({
  interval = 12,
  flockSize = 3,
}) => {
  const [flocks, setFlocks] = useState<Swallow[][]>([]);
  const [flockCounter, setFlockCounter] = useState(0);

  const spawnFlock = useCallback(() => {
    const newFlock = generateFlock(flockSize, flockCounter);
    setFlocks((prev) => [...prev.slice(-2), newFlock]); // keep max 3 flocks in DOM
    setFlockCounter((c) => c + 1);
  }, [flockSize, flockCounter]);

  useEffect(() => {
    // First flock after a short initial delay
    const initialTimer = setTimeout(spawnFlock, 3000);
    return () => clearTimeout(initialTimer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (flockCounter === 0) return;
    const timer = setTimeout(spawnFlock, interval * 1000);
    return () => clearTimeout(timer);
  }, [flockCounter, interval, spawnFlock]);

  return (
    <div className="flying-swallows" aria-hidden="true">
      {flocks.map((flock) =>
        flock.map((bird) => {
          const r = ROUTES[bird.route];
          return (
            <div
              key={bird.id}
              className={`flying-swallows__bird flying-swallows__route-${bird.route}`}
              style={{
                ['--fly-from-x' as string]: `${r.from.x}vw`,
                ['--fly-from-y' as string]: `${r.from.y}vh`,
                ['--fly-to-x' as string]: `${r.to.x}vw`,
                ['--fly-to-y' as string]: `${r.to.y}vh`,
                animationDuration: `${bird.duration}s`,
                animationDelay: `${bird.delay}s`,
                transform: bird.flip ? 'scaleX(-1)' : 'none',
              }}
            >
              <svg
                className="flying-swallows__svg"
                width={32 * bird.size}
                height={20 * bird.size}
                viewBox="0 0 32 20"
                fill="none"
              >
                {/* Swallow silhouette */}
                <path
                  d="M16 10 C14 6, 6 1, 0 3 C4 5, 6 7, 8 10 C6 7, 4 5, 0 3
                     M16 10 C14 6, 10 4, 8 10
                     M16 10 C18 6, 26 1, 32 3 C28 5, 26 7, 24 10 C26 7, 28 5, 32 3
                     M16 10 C18 6, 22 4, 24 10
                     M16 10 L14 16 L16 13 L18 16 Z"
                  fill="var(--text-heading)"
                  opacity="0.55"
                />
              </svg>
            </div>
          );
        })
      )}
    </div>
  );
};

export default FlyingSwallows;
