import React, { useState, useEffect, useCallback } from 'react';
import './Gamification.css';

/* ============================================================
   Firecracker Confetti — burst on task completion
   ============================================================ */
interface ConfettiParticle {
  id: number;
  tx: number;
  ty: number;
  color: string;
  size: number;
  duration: number;
  delay: number;
}

interface FirecrackerConfettiProps {
  x: number;
  y: number;
  onComplete?: () => void;
}

const CONFETTI_COLORS = [
  'var(--secondary)', 'var(--primary-light)', 'var(--accent)',
  'var(--secondary-light)', 'var(--primary)', '#fff',
];

export const FirecrackerConfetti: React.FC<FirecrackerConfettiProps> = ({ x, y, onComplete }) => {
  const [particles] = useState<ConfettiParticle[]>(() => {
    const result: ConfettiParticle[] = [];
    for (let i = 0; i < 30; i++) {
      const angle = (Math.PI * 2 * i) / 30 + (Math.random() - 0.5) * 0.5;
      const dist = 60 + Math.random() * 140;
      result.push({
        id: i,
        tx: Math.cos(angle) * dist,
        ty: Math.sin(angle) * dist - Math.random() * 40,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        size: 4 + Math.random() * 6,
        duration: 0.6 + Math.random() * 0.6,
        delay: Math.random() * 0.15,
      });
    }
    return result;
  });

  useEffect(() => {
    const timer = setTimeout(() => onComplete?.(), 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="gamification-confetti-overlay">
      {particles.map((p) => (
        <div
          key={p.id}
          className="gamification-confetti-particle"
          style={{
            left: x,
            top: y,
            width: p.size,
            height: p.size * 0.6,
            background: p.color,
            '--tx': `${p.tx}px`,
            '--ty': `${p.ty}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

/* ============================================================
   Lucky Envelope — appears when all tasks are completed
   ============================================================ */
interface LuckyEnvelopeProps {
  show: boolean;
  onOpen: () => void;
}

export const LuckyEnvelope: React.FC<LuckyEnvelopeProps> = ({ show, onOpen }) => {
  if (!show) return null;

  return (
    <button className="lucky-envelope" onClick={onOpen} title="Open Lucky Envelope!">
      <div className="lucky-envelope__body">
        <span className="lucky-envelope__icon">🧧</span>
        <span className="lucky-envelope__text">Reward!</span>
      </div>
      <div className="lucky-envelope__glow" />
    </button>
  );
};

/* ============================================================
   Reward Modal — congratulations overlay
   ============================================================ */
interface RewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalTasks: number;
}

const LUCKY_MESSAGES = [
  '🎊 Chúc Mừng Năm Mới!',
  '🧧 Wishing you prosperity!',
  '🎆 May fortune smile upon you!',
  '🏮 A new year of great luck!',
];

export const RewardModal: React.FC<RewardModalProps> = ({ isOpen, onClose, totalTasks }) => {
  const [flippedCards, setFlippedCards] = useState<Set<number>>(() => new Set());
  const [message, setMessage] = useState('');

  const handleFlip = useCallback((index: number) => {
    if (flippedCards.has(index)) return;
    setFlippedCards((prev) => new Set(prev).add(index));
    setMessage(LUCKY_MESSAGES[index % LUCKY_MESSAGES.length]);
  }, [flippedCards]);

  // Reset when modal opens — use key pattern instead of effect
  const prevIsOpen = React.useRef(isOpen);
  if (isOpen && !prevIsOpen.current) {
    setFlippedCards(new Set());
    setMessage('');
  }
  prevIsOpen.current = isOpen;

  if (!isOpen) return null;

  return (
    <div className="reward-modal-overlay" onClick={onClose}>
      <div className="reward-modal" onClick={(e) => e.stopPropagation()}>
        <button className="reward-modal__close" onClick={onClose}>✕</button>

        <div className="reward-modal__header">
          <span className="reward-modal__emoji">🎉</span>
          <h2 className="reward-modal__title">All Tasks Complete!</h2>
          <p className="reward-modal__subtitle">
            You've completed all {totalTasks} tasks. Choose a lucky envelope!
          </p>
        </div>

        <div className="reward-modal__envelopes">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`reward-envelope-card ${flippedCards.has(i) ? 'reward-envelope-card--flipped' : ''}`}
              onClick={() => handleFlip(i)}
            >
              <div className="reward-envelope-card__front">
                <span>🧧</span>
              </div>
              <div className="reward-envelope-card__back">
                <span>{LUCKY_MESSAGES[i % LUCKY_MESSAGES.length]}</span>
              </div>
            </div>
          ))}
        </div>

        {message && (
          <div className="reward-modal__message">
            <p>{message}</p>
          </div>
        )}

        <button className="reward-modal__done-btn" onClick={onClose}>
          🎆 Continue Planning
        </button>
      </div>
    </div>
  );
};
