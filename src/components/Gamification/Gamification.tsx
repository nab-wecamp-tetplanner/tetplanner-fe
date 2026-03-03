import React, { useState, useEffect, useCallback } from 'react';
import './Gamification.css';
import horseImg from '../images/horse.png';
import { X }  from 'lucide-react';


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
  onClose?: () => void;
}

export const LuckyEnvelope: React.FC<LuckyEnvelopeProps> = ({ show, onOpen }) => {
  if (!show) return null;

  // Generate firework bursts
  const fireworks = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    left: 10 + Math.random() * 80,
    top: 10 + Math.random() * 60,
    delay: Math.random() * 2,
    size: 120 + Math.random() * 100,
    color1: ['#fbbf24', '#ef4444', '#f97316', '#a855f7', '#3b82f6', '#ec4899'][i],
    color2: ['#fde68a', '#fca5a5', '#fdba74', '#d8b4fe', '#93c5fd', '#f9a8d4'][i],
  }));

  return (
    <>
      {/* Fireworks overlay */}
      <div className="fireworks-overlay">
        {fireworks.map((fw) => (
          <div
            key={fw.id}
            className="firework"
            style={{
              left: `${fw.left}%`,
              top: `${fw.top}%`,
              animationDelay: `${fw.delay}s`,
              '--fw-size': `${fw.size}px`,
              '--fw-color1': fw.color1,
              '--fw-color2': fw.color2,
            } as React.CSSProperties}
          >
            {Array.from({ length: 12 }, (_, j) => (
              <div
                key={j}
                className="firework__spark"
                style={{
                  '--angle': `${j * 30}deg`,
                  '--fw-color1': fw.color1,
                  '--fw-color2': fw.color2,
                } as React.CSSProperties}
              />
            ))}
          </div>
        ))}
      </div>

      <button className="lucky-envelope" onClick={onOpen} title="Open Lucky Envelope!">
        <div className="lucky-envelope__body">
          <img src={horseImg} alt="Lucky Horse" className="lucky-envelope__icon-img" />
        </div>
        <span className="lucky-envelope__title">Bravo!</span>
        <span className="lucky-envelope__text">You got a reward!</span>
        <span className="lucky-envelope__cta">Tap to open</span>
        <div className="lucky-envelope__glow" />
      </button>
    </>
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
  'Wishing you joy and happiness!',
  'May prosperity follow you!',
  'Peace and success to you!',
  'May all your wishes come true!',
  'Health and vitality!',
  'Fortune and wealth!',
  'A year full of laughter!',
  'Great luck and great gain!',
  'Smooth sailing ahead!',
  'Complete happiness!',
  'Success in all endeavors!',
  'Instant success upon arrival!',
];

export const RewardModal: React.FC<RewardModalProps> = ({ isOpen, onClose, totalTasks }) => {
  const [flippedCard, setFlippedCard] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [cardMessages, setCardMessages] = useState<string[]>([]);

  const handleFlip = useCallback((index: number) => {
    if (flippedCard !== null) return; // Only allow opening 1 card
    setFlippedCard(index);
    setMessage(cardMessages[index]);
  }, [flippedCard, cardMessages]);

  // Reset and randomize messages when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setFlippedCard(null);
      setMessage('');
      // Shuffle and pick 4 random messages
      const shuffled = [...LUCKY_MESSAGES].sort(() => Math.random() - 0.5);
      setCardMessages(shuffled.slice(0, 4));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    // Cái div bọc ngoài cùng của bạn (nhớ phải có position: relative)
      <div className="lucky-envelope-wrapper" style={{ position: 'relative' }}>
        
        {/* 🔴 NÚT TẮT NẰM Ở ĐÂY */}
        {onClose && (
          <button
            onClick={(e) => {
              e.stopPropagation(); // Cực kỳ quan trọng: Ngăn không cho click xuyên xuống onOpen
              onClose();
            }}
            className="close-envelope-btn"
          >
            <X size={16} />
          </button>
        )}
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
              className={`reward-envelope-card ${flippedCard === i ? 'reward-envelope-card--flipped' : ''} ${flippedCard !== null && flippedCard !== i ? 'reward-envelope-card--disabled' : ''}`}
              onClick={() => handleFlip(i)}
            >
              <div className="reward-envelope-card__front">
                <img src={horseImg} alt="Lucky Horse" className="reward-envelope-card__icon" />
              </div>
              <div className="reward-envelope-card__back">
                <span>{cardMessages[i]}</span>
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
          Continue Planning
        </button>
      </div>
    </div>
    </div>
  );
};
