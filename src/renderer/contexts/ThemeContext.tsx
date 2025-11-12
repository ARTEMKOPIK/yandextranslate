import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ThemeMode } from '../../shared/types';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'app-theme';
const THEME_MODE_STORAGE_KEY = 'app-theme-mode';

function getSystemTheme(): Theme {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'dark';
}

function getEffectiveTheme(mode: ThemeMode): Theme {
  if (mode === 'system') {
    return getSystemTheme();
  }
  return mode;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [themeMode, setThemeModeState] = useState<ThemeMode>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const storedMode = localStorage.getItem(THEME_MODE_STORAGE_KEY) as ThemeMode | null;
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;

    const initialMode = storedMode || 'dark';
    const initialTheme = storedTheme || getEffectiveTheme(initialMode);

    setThemeModeState(initialMode);
    setThemeState(initialTheme);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const htmlElement = document.documentElement;
    if (theme === 'dark') {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }

    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme, mounted]);

  useEffect(() => {
    if (!mounted || themeMode !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setThemeState(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeMode, mounted]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setThemeState(newTheme);
    setThemeModeState(newTheme);
    localStorage.setItem(THEME_MODE_STORAGE_KEY, newTheme);
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    setThemeModeState(newTheme);
    localStorage.setItem(THEME_MODE_STORAGE_KEY, newTheme);
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    setThemeState(getEffectiveTheme(mode));
    localStorage.setItem(THEME_MODE_STORAGE_KEY, mode);
  };

  return (
    <ThemeContext.Provider value={{ theme, themeMode, toggleTheme, setTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
