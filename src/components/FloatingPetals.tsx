import React, { useEffect, useState, useMemo } from "react";

interface Petal {
  id: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
  swayAmount: number;
  rotation: number;
  opacity: number;
}

const PETAL_COUNT = 18;

const generatePetals = (): Petal[] =>
  Array.from({ length: PETAL_COUNT }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    size: 10 + Math.random() * 14,
    delay: Math.random() * 12,
    duration: 8 + Math.random() * 10,
    swayAmount: 30 + Math.random() * 60,
    rotation: Math.random() * 360,
    opacity: 0.35 + Math.random() * 0.4,
  }));

export const FloatingPetals: React.FC = () => {
  const [isDark, setIsDark] = useState(false);
  const petals = useMemo(generatePetals, []);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });

    setIsDark(document.documentElement.classList.contains("dark"));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Hoa mai (vàng) for light, hoa đào (hồng) for dark
  const petalColor = isDark ? "hsl(340, 65%, 65%)" : "hsl(45, 90%, 60%)";
  const petalColorInner = isDark ? "hsl(340, 70%, 75%)" : "hsl(50, 95%, 75%)";

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[100] overflow-hidden"
      aria-hidden="true"
      style={{ border: "2px solid red" }} // DEBUG: Test if component renders
    >
      {petals.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.left}%`,
            top: "-30px",
            animation: `petal-fall ${p.duration}s ease-in-out ${p.delay}s infinite`,
            // @ts-ignore
            "--sway": `${p.swayAmount}px`,
          }}
        >
          <svg
            width={p.size}
            height={p.size}
            viewBox="0 0 24 24"
            style={{
              opacity: p.opacity,
              animation: `petal-spin ${3 + Math.random() * 4}s linear infinite`,
              transform: `rotate(${p.rotation}deg)`,
            }}
          >
            {isDark ? (
              // Hoa đào - 5 cánh tròn hồng
              <g>
                {[0, 72, 144, 216, 288].map((angle) => (
                  <ellipse
                    key={angle}
                    cx="12"
                    cy="5"
                    rx="3.5"
                    ry="5"
                    fill={petalColor}
                    transform={`rotate(${angle} 12 12)`}
                  />
                ))}
                <circle cx="12" cy="12" r="2.5" fill={petalColorInner} />
              </g>
            ) : (
              // Hoa mai - 5 cánh nhọn vàng
              <g>
                {[0, 72, 144, 216, 288].map((angle) => (
                  <ellipse
                    key={angle}
                    cx="12"
                    cy="4"
                    rx="2.8"
                    ry="5.5"
                    fill={petalColor}
                    transform={`rotate(${angle} 12 12)`}
                  />
                ))}
                <circle cx="12" cy="12" r="2" fill={petalColorInner} />
              </g>
            )}
          </svg>
        </div>
      ))}
    </div>
  );
};
