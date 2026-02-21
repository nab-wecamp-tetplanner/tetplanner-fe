import React, { createContext, useState, useEffect, type ReactNode } from 'react';

export type TetTheme = 'spring-blossom' | 'jade-prosperity' | 'morning-lantern' | 'midnight-dragon';

export interface ThemeContextType {
  theme: TetTheme;
  setTheme: (theme: TetTheme) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'tet-planner-theme';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<TetTheme>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return (saved as TetTheme) || 'spring-blossom';
  });

  const setTheme = (newTheme: TetTheme) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.add('theme-transition');
    const timer = setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
    }, 500);
    return () => clearTimeout(timer);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
