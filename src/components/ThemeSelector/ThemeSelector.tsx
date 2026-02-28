import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import type { TetTheme } from '../../context/ThemeContext';
import './ThemeSelector.css';

const THEMES: { id: TetTheme; label: string; icon: string; colors: [string, string] }[] = [
  { id: 'spring-blossom',    label: 'Spring Blossom',    icon: '🌸', colors: ['#fbbf24', '#dc2626'] },
  { id: 'jade-prosperity',   label: 'Jade Prosperity',   icon: '🀄', colors: ['#22c55e', '#ca8a04'] },
  { id: 'morning-lantern',   label: 'Morning Lantern',   icon: '🏮', colors: ['#fb923c', '#dc2626'] },
  { id: 'midnight-dragon',   label: 'Midnight Dragon',   icon: '🐉', colors: ['#f59e0b', '#1e293b'] },
  { id: 'minimal',           label: 'Minimal Clean',     icon: '🤍', colors: ['#3b82f6', '#f8fafc'] },
];

const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-col gap-2 bg-white">
      {THEMES.map((t) => (
        <button
          key={t.id}
          onClick={() => setTheme(t.id)}
          className={`
            flex items-center justify-between p-3 rounded-lg border transition-all
            ${theme === t.id 
              ? 'border-primary bg-primary/10 shadow-sm' 
              : 'border-accent bg-transparent hover:bg-accent/50'}
          `}
        >
          <div className="flex items-center gap-2">
            <span className="text-md">{t.icon}</span>
            <span className={`text-[10px] ${theme === t.id ? 'font-bold' : ''}`}>
              {t.label}
            </span>
          </div>
          
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-full" style={{ background: t.colors[0] }} />
            <div className="w-3 h-3 rounded-full" style={{ background: t.colors[1] }} />
          </div>
        </button>
      ))}
    </div>
  );
};
export default ThemeSelector;
