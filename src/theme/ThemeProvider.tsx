import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import useMediaQuery from '@mui/material/useMediaQuery';
import { THEMES, type ThemeName, type AppThemeDef } from './themes';
import { useSettings } from '../hooks/useSettings';

type ThemeMode = 'light' | 'dark';

interface ThemeContextValue {
  mode: ThemeMode;
  toggleTheme: () => void;
  themeDef: AppThemeDef;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'light',
  toggleTheme: () => {},
  themeDef: THEMES.redgate,
});

export const useThemeMode = () => useContext(ThemeContext);

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const stored = localStorage.getItem('devdash-theme') as ThemeMode | null;
  const [mode, setMode] = useState<ThemeMode>(stored ?? (prefersDark ? 'dark' : 'light'));
  const { settings } = useSettings();

  const toggleTheme = () => {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('devdash-theme', next);
      return next;
    });
  };

  const themeName = (settings.themeName as ThemeName) || 'redgate';
  const themeDef = THEMES[themeName] ?? THEMES.redgate;
  const muiTheme = useMemo(() => (mode === 'dark' ? themeDef.dark : themeDef.light), [mode, themeDef]);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, themeDef }}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline enableColorScheme />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}
