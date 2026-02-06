import React, { createContext, useContext } from 'react';

export const theme = {
  colors: {
    background: '#0f172a',
    card: '#1e293b',
    border: '#334155',
    text: '#f8fafc',
    textSecondary: '#94a3b8',
    primary: '#38bdf8',
  },
} as const;

type Theme = typeof theme;

const ThemeContext = createContext<Theme>(theme);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
