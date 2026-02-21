import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import type { TetTheme } from '../../context/ThemeContext';
import './ThemeSelector.css';

const THEMES: { id: TetTheme; label: string; icon: string; colors: [string, string] }[] = [
  { id: 'spring-blossom',    label: 'Spring Blossom',    icon: '🌸', colors: ['#fbbf24', '#dc2626'] },
  { id: 'jade-prosperity',   label: 'Jade Prosperity',   icon: '🀄', colors: ['#22c55e', '#ca8a04'] },
  { id: 'morning-lantern',   label: 'Morning Lantern',   icon: '🏮', colors: ['#fb923c', '#dc2626'] },
  { id: 'midnight-dragon',   label: 'Midnight Dragon',   icon: '🐉', colors: ['#f59e0b', '#1e293b'] },
];

const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="theme-selector">
      <span className="theme-selector__label">Theme</span>
      <div className="theme-selector__options">
        {THEMES.map((t) => (
          <button
            key={t.id}
            className={`theme-selector__btn ${theme === t.id ? 'theme-selector__btn--active' : ''}`}
            onClick={() => setTheme(t.id)}
            title={t.label}
            aria-label={`Switch to ${t.label} theme`}
          >
            <span className="theme-selector__icon">{t.icon}</span>
            <span className="theme-selector__swatch">
              <span style={{ background: t.colors[0] }} />
              <span style={{ background: t.colors[1] }} />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeSelector;
