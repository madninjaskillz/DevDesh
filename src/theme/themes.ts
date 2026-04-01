import { createTheme, type Theme, type ThemeOptions } from '@mui/material/styles';
import { colors } from './colors';

export type ThemeName = 'redgate' | 'glass' | 'metro' | 'fluent' | 'win95';

export interface AppThemeDef {
  name: ThemeName;
  label: string;
  description: string;
  light: Theme;
  dark: Theme;
  /** Custom tokens for non-MUI components (header, sidebar, etc.) */
  custom: {
    headerBg: (mode: 'light' | 'dark') => string;
    headerColor: string;
    brandBlockBg: string;
    brandBlockColor: string;
    sidebarBg: (mode: 'light' | 'dark') => string;
    cardBorderRadius: number;
    globalCss?: (mode: 'light' | 'dark') => string;
  };
}

// === Shared base ===
const baseComponents: ThemeOptions['components'] = {
  MuiButton: { styleOverrides: { root: { textTransform: 'none' as const } } },
  MuiCard: { styleOverrides: { root: ({ theme }) => ({ padding: theme.spacing(2) }) } },
  MuiCardContent: { styleOverrides: { root: ({ theme }) => ({ padding: theme.spacing(1), '&:last-child': { paddingBottom: theme.spacing(1) } }) } },
  MuiChip: { defaultProps: { size: 'small' } },
  MuiTableCell: { styleOverrides: { root: { padding: '8px 12px' } } },
  MuiTooltip: { defaultProps: { arrow: true } },
};

// === 1. REDGATE ===
const redgateLight = createTheme({
  palette: {
    mode: 'light',
    primary: { light: colors.blue[5], main: colors.blue[6], dark: colors.blue[7] },
    secondary: { light: colors.gray[4], main: colors.gray[5], dark: colors.gray[6] },
    error: { main: '#f65b55' },
    warning: { light: colors.orange[4], main: colors.orange[5], dark: '#E65100' },
    success: { light: colors.green[4], main: colors.green[5], dark: colors.green[6] },
    background: { default: colors.gray[1], paper: colors.white },
  },
  typography: { fontFamily: '"Roboto", "Helvetica Neue", Arial, sans-serif', h1: { fontWeight: 700 }, h2: { fontWeight: 700 }, h3: { fontWeight: 700 }, h4: { fontWeight: 700 }, h5: { fontWeight: 700 }, h6: { fontWeight: 700 }, button: { fontWeight: 500 } },
  components: baseComponents,
});
const redgateDark = createTheme({
  palette: {
    mode: 'dark',
    primary: { light: colors.blue[5], main: colors.blue[4], dark: colors.blue[7] },
    secondary: { light: colors.gray[3], main: colors.gray[4], dark: colors.gray[5] },
    error: { main: '#f65b55' },
    warning: { light: colors.orange[4], main: colors.orange[5], dark: '#E65100' },
    success: { light: colors.green[4], main: colors.green[5], dark: colors.green[6] },
    background: { default: colors.gray[9], paper: colors.gray[8] },
  },
  typography: { fontFamily: '"Roboto", "Helvetica Neue", Arial, sans-serif', h1: { fontWeight: 700 }, h2: { fontWeight: 700 }, h3: { fontWeight: 700 }, h4: { fontWeight: 700 }, h5: { fontWeight: 700 }, h6: { fontWeight: 700 }, button: { fontWeight: 500 } },
  components: baseComponents,
});

// === 2. APPLE GLASS ===
const glassComponents: ThemeOptions['components'] = {
  ...baseComponents,
  MuiPaper: { styleOverrides: { root: { backdropFilter: 'blur(24px) saturate(200%)', backgroundColor: 'rgba(255,255,255,0.45)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.4)', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' } } },
  MuiCard: { styleOverrides: { root: ({ theme }) => ({ padding: theme.spacing(2), backdropFilter: 'blur(24px) saturate(200%)', backgroundColor: 'rgba(255,255,255,0.35)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.4)', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }) } },
  MuiChip: { defaultProps: { size: 'small' }, styleOverrides: { root: { borderRadius: 20 } } },
  MuiButton: { styleOverrides: { root: { textTransform: 'none' as const, borderRadius: 20 } } },
  MuiTableCell: { styleOverrides: { root: { padding: '8px 12px', borderColor: 'rgba(0,0,0,0.06)' } } },
  MuiTooltip: { defaultProps: { arrow: true } },
};
const glassDarkComponents: ThemeOptions['components'] = {
  ...baseComponents,
  MuiPaper: { styleOverrides: { root: { backdropFilter: 'blur(24px) saturate(200%)', backgroundColor: 'rgba(20,20,20,0.5)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' } } },
  MuiCard: { styleOverrides: { root: ({ theme }) => ({ padding: theme.spacing(2), backdropFilter: 'blur(24px) saturate(200%)', backgroundColor: 'rgba(20,20,20,0.4)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }) } },
  MuiChip: { defaultProps: { size: 'small' }, styleOverrides: { root: { borderRadius: 20 } } },
  MuiButton: { styleOverrides: { root: { textTransform: 'none' as const, borderRadius: 20 } } },
  MuiTableCell: { styleOverrides: { root: { padding: '8px 12px', borderColor: 'rgba(255,255,255,0.06)' } } },
  MuiTooltip: { defaultProps: { arrow: true } },
};
const glassLight = createTheme({
  palette: { mode: 'light', primary: { main: '#007AFF' }, secondary: { main: '#8E8E93' }, error: { main: '#FF3B30' }, warning: { main: '#FF9500' }, success: { main: '#34C759' }, background: { default: 'transparent', paper: 'rgba(255,255,255,0.45)' } },
  typography: { fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif', fontWeightBold: 600, h1: { fontWeight: 600 }, h2: { fontWeight: 600 }, h3: { fontWeight: 600 }, h4: { fontWeight: 600 }, h5: { fontWeight: 600 }, h6: { fontWeight: 600 }, button: { fontWeight: 500 } },
  shape: { borderRadius: 12 },
  components: glassComponents,
});
const glassDark = createTheme({
  palette: { mode: 'dark', primary: { main: '#0A84FF' }, secondary: { main: '#98989D' }, error: { main: '#FF453A' }, warning: { main: '#FF9F0A' }, success: { main: '#30D158' }, background: { default: 'transparent', paper: 'rgba(20,20,20,0.5)' } },
  typography: { fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif', fontWeightBold: 600, h1: { fontWeight: 600 }, h2: { fontWeight: 600 }, h3: { fontWeight: 600 }, h4: { fontWeight: 600 }, h5: { fontWeight: 600 }, h6: { fontWeight: 600 }, button: { fontWeight: 500 } },
  shape: { borderRadius: 12 },
  components: glassDarkComponents,
});

// === 3. METRO ===
const metroComponents: ThemeOptions['components'] = {
  ...baseComponents,
  MuiPaper: { styleOverrides: { root: { borderRadius: 0, boxShadow: 'none', border: '2px solid', borderColor: 'rgba(0,0,0,0.1)' } } },
  MuiCard: { styleOverrides: { root: ({ theme }) => ({ padding: theme.spacing(2), borderRadius: 0 }) } },
  MuiButton: { styleOverrides: { root: { textTransform: 'uppercase' as const, borderRadius: 0, fontWeight: 600, letterSpacing: '0.05em' } } },
  MuiChip: { defaultProps: { size: 'small' }, styleOverrides: { root: { borderRadius: 0 } } },
  MuiTableCell: { styleOverrides: { root: { padding: '8px 12px' } } },
  MuiTooltip: { defaultProps: { arrow: false } },
};
const metroLight = createTheme({
  palette: { mode: 'light', primary: { main: '#0078D7' }, secondary: { main: '#666666' }, error: { main: '#E81123' }, warning: { main: '#FF8C00' }, success: { main: '#107C10' }, background: { default: '#FFFFFF', paper: '#FFFFFF' } },
  typography: { fontFamily: '"Segoe UI", "Roboto", Arial, sans-serif', h1: { fontWeight: 300, fontSize: '2.5rem' }, h2: { fontWeight: 300 }, h3: { fontWeight: 300 }, h4: { fontWeight: 400 }, h5: { fontWeight: 400 }, h6: { fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.1em', fontSize: '0.85rem' }, button: { fontWeight: 600 } },
  shape: { borderRadius: 0 },
  components: metroComponents,
});
const metroDark = createTheme({
  palette: { mode: 'dark', primary: { main: '#0078D7' }, secondary: { main: '#999999' }, error: { main: '#E81123' }, warning: { main: '#FF8C00' }, success: { main: '#107C10' }, background: { default: '#1D1D1D', paper: '#2D2D2D' } },
  typography: { fontFamily: '"Segoe UI", "Roboto", Arial, sans-serif', h1: { fontWeight: 300, fontSize: '2.5rem' }, h2: { fontWeight: 300 }, h3: { fontWeight: 300 }, h4: { fontWeight: 400 }, h5: { fontWeight: 400 }, h6: { fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.1em', fontSize: '0.85rem' }, button: { fontWeight: 600 } },
  shape: { borderRadius: 0 },
  components: { ...metroComponents, MuiPaper: { styleOverrides: { root: { borderRadius: 0, boxShadow: 'none', border: '2px solid', borderColor: 'rgba(255,255,255,0.08)' } } } },
});

// === 4. FLUENT (Windows 11 / Fluent 2) ===
// Key: Mica-like layered surfaces, subtle borders, 4px control radius, 8px container radius,
// Segoe UI Variable font at 600 weight for headings, layered shadow system, calm/warm feel
const fluentTypography: ThemeOptions['typography'] = {
  fontFamily: '"Segoe UI Variable", "Segoe UI", -apple-system, "Roboto", sans-serif',
  fontSize: 14,
  h1: { fontWeight: 600, fontSize: '1.75rem', lineHeight: 1.3 },
  h2: { fontWeight: 600, fontSize: '1.25rem', lineHeight: 1.4 },
  h3: { fontWeight: 600, fontSize: '1rem', lineHeight: 1.5 },
  h4: { fontWeight: 600, fontSize: '0.95rem' },
  h5: { fontWeight: 600, fontSize: '0.9rem' },
  h6: { fontWeight: 600, fontSize: '0.85rem' },
  body1: { fontSize: '0.875rem', lineHeight: 1.43 },
  body2: { fontSize: '0.8125rem', lineHeight: 1.43 },
  caption: { fontSize: '0.75rem', lineHeight: 1.33 },
  button: { fontWeight: 600, fontSize: '0.875rem' },
};
const fluentLightComponents: ThemeOptions['components'] = {
  ...baseComponents,
  MuiPaper: { styleOverrides: { root: {
    borderRadius: 8,
    border: '1px solid rgba(0,0,0,0.0578)',
    boxShadow: '0 1px 2px rgba(0,0,0,0.14), 0 0 2px rgba(0,0,0,0.12)',
    backgroundColor: '#FFFFFF',
  } } },
  MuiCard: { styleOverrides: { root: ({ theme }) => ({
    padding: theme.spacing(1.5),
    borderRadius: 8,
    border: '1px solid rgba(0,0,0,0.0578)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.04), 0 0 2px rgba(0,0,0,0.06)',
    backgroundColor: '#FAFAFA',
  }) } },
  MuiButton: { styleOverrides: { root: {
    textTransform: 'none' as const,
    borderRadius: 4,
    fontWeight: 600,
    boxShadow: 'none',
    transition: 'background 100ms ease-out, box-shadow 100ms ease-out',
    '&:hover': { boxShadow: '0 1px 2px rgba(0,0,0,0.14)' },
  } } },
  MuiChip: { defaultProps: { size: 'small' }, styleOverrides: { root: { borderRadius: 4 } } },
  MuiTableCell: { styleOverrides: { root: { padding: '8px 12px', borderColor: 'rgba(0,0,0,0.0578)' } } },
  MuiTableRow: { styleOverrides: { root: {
    transition: 'background 100ms ease-out',
    '&:hover': { backgroundColor: 'rgba(0,0,0,0.024)' },
  } } },
  MuiTooltip: { defaultProps: { arrow: false }, styleOverrides: { tooltip: {
    borderRadius: 4,
    boxShadow: '0 8px 16px rgba(0,0,0,0.14), 0 0 2px rgba(0,0,0,0.12)',
    backgroundColor: '#FFFFFF',
    color: '#242424',
    border: '1px solid rgba(0,0,0,0.0578)',
    fontSize: '0.75rem',
  } } },
  MuiIconButton: { styleOverrides: { root: {
    borderRadius: 4,
    transition: 'background 100ms ease-out',
  } } },
  MuiListItemButton: { styleOverrides: { root: {
    borderRadius: 4,
    transition: 'background 100ms ease-out',
  } } },
};
const fluentDarkComponents: ThemeOptions['components'] = {
  ...baseComponents,
  MuiPaper: { styleOverrides: { root: {
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.0837)',
    boxShadow: '0 1px 2px rgba(0,0,0,0.28), 0 0 2px rgba(0,0,0,0.24)',
    backgroundColor: '#2D2D2D',
  } } },
  MuiCard: { styleOverrides: { root: ({ theme }) => ({
    padding: theme.spacing(1.5),
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.0605)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.14), 0 0 2px rgba(0,0,0,0.2)',
    backgroundColor: '#292929',
  }) } },
  MuiButton: { styleOverrides: { root: {
    textTransform: 'none' as const,
    borderRadius: 4,
    fontWeight: 600,
    boxShadow: 'none',
    transition: 'background 100ms ease-out, box-shadow 100ms ease-out',
    '&:hover': { boxShadow: '0 1px 2px rgba(0,0,0,0.28)' },
  } } },
  MuiChip: { defaultProps: { size: 'small' }, styleOverrides: { root: { borderRadius: 4 } } },
  MuiTableCell: { styleOverrides: { root: { padding: '8px 12px', borderColor: 'rgba(255,255,255,0.0605)' } } },
  MuiTableRow: { styleOverrides: { root: {
    transition: 'background 100ms ease-out',
    '&:hover': { backgroundColor: 'rgba(255,255,255,0.035)' },
  } } },
  MuiTooltip: { defaultProps: { arrow: false }, styleOverrides: { tooltip: {
    borderRadius: 4,
    boxShadow: '0 8px 16px rgba(0,0,0,0.28), 0 0 2px rgba(0,0,0,0.24)',
    backgroundColor: '#2D2D2D',
    color: '#FFFFFF',
    border: '1px solid rgba(255,255,255,0.0837)',
    fontSize: '0.75rem',
  } } },
  MuiIconButton: { styleOverrides: { root: {
    borderRadius: 4,
    transition: 'background 100ms ease-out',
  } } },
  MuiListItemButton: { styleOverrides: { root: {
    borderRadius: 4,
    transition: 'background 100ms ease-out',
  } } },
};
const fluentLight = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0078D4', light: '#62ABF5', dark: '#005A9E' },
    secondary: { main: '#605E5C', light: '#8A8886', dark: '#3B3A39' },
    error: { main: '#D13438' },
    warning: { main: '#FFB900' },
    success: { main: '#107C10' },
    background: { default: '#F5F5F5', paper: '#FFFFFF' },
    text: { primary: '#242424', secondary: '#616161' },
    divider: 'rgba(0,0,0,0.0578)',
    action: { hover: 'rgba(0,0,0,0.024)', selected: 'rgba(0,0,0,0.04)' },
  },
  typography: fluentTypography,
  shape: { borderRadius: 4 },
  components: fluentLightComponents,
});
const fluentDark = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#60CDFF', light: '#98ECFF', dark: '#0078D4' },
    secondary: { main: '#9E9E9E', light: '#C8C6C4', dark: '#605E5C' },
    error: { main: '#FF99A4' },
    warning: { main: '#FCE100' },
    success: { main: '#6CCB5F' },
    background: { default: '#1F1F1F', paper: '#2D2D2D' },
    text: { primary: '#FFFFFF', secondary: '#C8C8C8' },
    divider: 'rgba(255,255,255,0.0837)',
    action: { hover: 'rgba(255,255,255,0.035)', selected: 'rgba(255,255,255,0.06)' },
  },
  typography: fluentTypography,
  shape: { borderRadius: 4 },
  components: fluentDarkComponents,
});

// === 5. WIN95 ===
const win95Font = '"Pixelated MS Sans Serif", "MS Sans Serif", "Roboto", Tahoma, sans-serif';
const win95Components: ThemeOptions['components'] = {
  ...baseComponents,
  MuiPaper: { styleOverrides: { root: { borderRadius: 0, boxShadow: 'inset -1px -1px 0 #000, inset 1px 1px 0 #fff, inset -2px -2px 0 #808080, inset 2px 2px 0 #DFDFDF' } } },
  MuiCard: { styleOverrides: { root: ({ theme }) => ({ padding: theme.spacing(2), borderRadius: 0, boxShadow: 'inset -1px -1px 0 #000, inset 1px 1px 0 #fff, inset -2px -2px 0 #808080, inset 2px 2px 0 #DFDFDF' }) } },
  MuiButton: { styleOverrides: { root: { textTransform: 'none' as const, borderRadius: 0, fontWeight: 400, boxShadow: 'inset -1px -1px 0 #000, inset 1px 1px 0 #fff, inset -2px -2px 0 #808080, inset 2px 2px 0 #DFDFDF', '&:active': { boxShadow: 'inset 1px 1px 0 #000, inset -1px -1px 0 #fff, inset 2px 2px 0 #808080' } } } },
  MuiChip: { defaultProps: { size: 'small' }, styleOverrides: { root: { borderRadius: 0 } } },
  MuiTableCell: { styleOverrides: { root: { padding: '4px 8px', borderColor: '#808080' } } },
  MuiTooltip: { defaultProps: { arrow: false } },
};
const win95Light = createTheme({
  palette: { mode: 'light', primary: { main: '#000080' }, secondary: { main: '#808080' }, error: { main: '#FF0000' }, warning: { main: '#FFFF00' }, success: { main: '#008000' }, background: { default: '#C0C0C0', paper: '#C0C0C0' } },
  typography: { fontFamily: win95Font, fontSize: 13, h1: { fontWeight: 700 }, h2: { fontWeight: 700 }, h3: { fontWeight: 700 }, h4: { fontWeight: 700 }, h5: { fontWeight: 700 }, h6: { fontWeight: 700, fontSize: '0.85rem' }, button: { fontWeight: 400 } },
  shape: { borderRadius: 0 },
  components: win95Components,
});
const win95Dark = createTheme({
  palette: { mode: 'dark', primary: { main: '#5B5BFF' }, secondary: { main: '#808080' }, error: { main: '#FF4444' }, warning: { main: '#FFFF44' }, success: { main: '#44FF44' }, background: { default: '#2C2C2C', paper: '#3C3C3C' } },
  typography: { fontFamily: win95Font, fontSize: 13, h1: { fontWeight: 700 }, h2: { fontWeight: 700 }, h3: { fontWeight: 700 }, h4: { fontWeight: 700 }, h5: { fontWeight: 700 }, h6: { fontWeight: 700, fontSize: '0.85rem' }, button: { fontWeight: 400 } },
  shape: { borderRadius: 0 },
  components: { ...win95Components, MuiPaper: { styleOverrides: { root: { borderRadius: 0, boxShadow: 'inset -1px -1px 0 #000, inset 1px 1px 0 #555, inset -2px -2px 0 #333, inset 2px 2px 0 #4a4a4a' } } } },
});

// === Registry ===
export const THEMES: Record<ThemeName, AppThemeDef> = {
  redgate: {
    name: 'redgate', label: 'Redgate', description: 'Official Redgate product styling',
    light: redgateLight, dark: redgateDark,
    custom: {
      headerBg: () => colors.gray[7],
      headerColor: colors.white,
      brandBlockBg: colors.red.brand,
      brandBlockColor: colors.white,
      sidebarBg: () => 'transparent',
      cardBorderRadius: 4,
    },
  },
  glass: {
    name: 'glass', label: 'Apple Glass', description: 'Translucent glass with blur effects',
    light: glassLight, dark: glassDark,
    custom: {
      headerBg: (m) => m === 'dark' ? 'rgba(30,30,30,0.8)' : 'rgba(255,255,255,0.7)',
      headerColor: '',  // uses theme default
      brandBlockBg: '#007AFF',
      brandBlockColor: '#fff',
      sidebarBg: () => 'transparent',
      cardBorderRadius: 16,
      globalCss: () => 'body { backdrop-filter: none; } .MuiAppBar-root { backdrop-filter: blur(20px) saturate(180%); }',
    },
  },
  metro: {
    name: 'metro', label: 'Metro', description: 'Bold, flat Windows Phone style',
    light: metroLight, dark: metroDark,
    custom: {
      headerBg: () => '#0078D7',
      headerColor: '#fff',
      brandBlockBg: '#005A9E',
      brandBlockColor: '#fff',
      sidebarBg: () => 'transparent',
      cardBorderRadius: 0,
    },
  },
  fluent: {
    name: 'fluent', label: 'Fluent', description: 'Windows 11 Fluent Design System',
    light: fluentLight, dark: fluentDark,
    custom: {
      headerBg: (m) => m === 'dark' ? '#1C1C1C' : '#F9F9F9',
      headerColor: '',
      brandBlockBg: '#0078D4',
      brandBlockColor: '#fff',
      sidebarBg: (m) => m === 'dark' ? '#1C1C1C' : '#F9F9F9',
      cardBorderRadius: 8,
    },
  },
  win95: {
    name: 'win95', label: 'Win95', description: 'Classic Windows 95 retro look',
    light: win95Light, dark: win95Dark,
    custom: {
      headerBg: () => '#000080',
      headerColor: '#fff',
      brandBlockBg: '#C0C0C0',
      brandBlockColor: '#000',
      sidebarBg: () => 'transparent',
      cardBorderRadius: 0,
    },
  },
};

export const THEME_NAMES = Object.keys(THEMES) as ThemeName[];
