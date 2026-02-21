import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type ThemeType = "minimal" | "bloom" | "mai";

export const THEMES = {
  minimal: "minimal",
  bloom: "bloom",
  mai: "mai",
} as const;

type ThemeContextType = {
  theme: ThemeType;
  changeTheme: (newTheme: ThemeType) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: "minimal",
  changeTheme: () => {},
});
export const ThemeProvider = ({ children } : { children: ReactNode }) => {
  // Default 'minimal'
  const [theme, setTheme] = useState<ThemeType>("minimal");

  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme') || 'minimal';
    setTheme(savedTheme as typeof THEMES[keyof typeof THEMES]);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const changeTheme = (newTheme: ThemeType) => {
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, changeTheme }}>  
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);