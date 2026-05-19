import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
});

interface ThemeProviderProps {
  theme?: Theme;
  defaultTheme?: Theme;
  children: React.ReactNode;
}

export function ThemeProvider({
  theme: controlledTheme,
  defaultTheme = 'light',
  children,
}: ThemeProviderProps) {
  const [internalTheme, setInternalTheme] = useState<Theme>(defaultTheme);
  const theme = controlledTheme ?? internalTheme;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setInternalTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setInternalTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
