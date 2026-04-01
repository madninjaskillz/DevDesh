import { createTheme, type Theme, type ThemeOptions } from '@mui/material/styles';
import { colors } from './colors';

export type ThemeName = 'redgate' | 'glass' | 'metro' | 'fluent' | 'win95' | 'winxp' | 'macos9' | 'aqua' | 'vista' | 'cyberpunk' | 'nord' | 'dracula' | 'solarized' | 'catppuccin' | 'synthwave' | 'terminal';

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
    backdropFilter: 'blur(16px) saturate(150%)',
    backgroundColor: 'rgba(255,255,255,0.78)',
  } } },
  MuiCard: { styleOverrides: { root: ({ theme }) => ({
    padding: theme.spacing(1.5),
    borderRadius: 8,
    border: '1px solid rgba(0,0,0,0.0578)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.04), 0 0 2px rgba(0,0,0,0.06)',
    backdropFilter: 'blur(16px) saturate(150%)',
    backgroundColor: 'rgba(250,250,250,0.72)',
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
    backdropFilter: 'blur(16px) saturate(150%)',
    backgroundColor: 'rgba(45,45,45,0.72)',
  } } },
  MuiCard: { styleOverrides: { root: ({ theme }) => ({
    padding: theme.spacing(1.5),
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.0605)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.14), 0 0 2px rgba(0,0,0,0.2)',
    backdropFilter: 'blur(16px) saturate(150%)',
    backgroundColor: 'rgba(41,41,41,0.65)',
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
    background: { default: 'transparent', paper: 'rgba(255,255,255,0.78)' },
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
    background: { default: 'transparent', paper: 'rgba(45,45,45,0.72)' },
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

// === 6. WINDOWS XP (Luna) ===
// Key: Rounded bubbly UI, blue/green/silver Luna theme, Tahoma font,
// gradient title bars, soft drop shadows, colorful and friendly
const winxpFont = 'Tahoma, "Segoe UI", "Roboto", Arial, sans-serif';
const winxpLightComponents: ThemeOptions['components'] = {
  ...baseComponents,
  MuiPaper: { styleOverrides: { root: {
    borderRadius: 8,
    border: '1px solid #AEB2B5',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    backgroundColor: '#FFFFFF',
  } } },
  MuiCard: { styleOverrides: { root: ({ theme }) => ({
    padding: theme.spacing(2),
    borderRadius: 8,
    border: '1px solid #AEB2B5',
    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
    backgroundColor: '#F5F8FC',
    backgroundImage: 'linear-gradient(180deg, #FFFFFF 0%, #ECF4FC 100%)',
  }) } },
  MuiButton: { styleOverrides: { root: {
    textTransform: 'none' as const,
    borderRadius: 6,
    fontWeight: 400,
    border: '1px solid #ADB2B5',
    backgroundImage: 'linear-gradient(180deg, #FFFFFF 0%, #ECE9D8 100%)',
    boxShadow: '0 1px 0 rgba(255,255,255,0.5) inset',
    '&:hover': { backgroundImage: 'linear-gradient(180deg, #FFF8E1 0%, #FFE9A0 100%)' },
  } } },
  MuiChip: { defaultProps: { size: 'small' }, styleOverrides: { root: { borderRadius: 12 } } },
  MuiTableCell: { styleOverrides: { root: { padding: '6px 10px', borderColor: '#D6DDE5' } } },
  MuiTooltip: { defaultProps: { arrow: true }, styleOverrides: { tooltip: {
    backgroundColor: '#FFFFE1',
    color: '#000000',
    border: '1px solid #000000',
    borderRadius: 2,
    fontSize: '0.75rem',
  } } },
};
const winxpDarkComponents: ThemeOptions['components'] = {
  ...baseComponents,
  MuiPaper: { styleOverrides: { root: {
    borderRadius: 8,
    border: '1px solid #4A5568',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    backgroundColor: '#2A3142',
  } } },
  MuiCard: { styleOverrides: { root: ({ theme }) => ({
    padding: theme.spacing(2),
    borderRadius: 8,
    border: '1px solid #4A5568',
    boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
    backgroundColor: '#2A3142',
    backgroundImage: 'linear-gradient(180deg, #323B4F 0%, #2A3142 100%)',
  }) } },
  MuiButton: { styleOverrides: { root: {
    textTransform: 'none' as const,
    borderRadius: 6,
    fontWeight: 400,
    border: '1px solid #4A5568',
    backgroundImage: 'linear-gradient(180deg, #3D4A60 0%, #2D3748 100%)',
    '&:hover': { backgroundImage: 'linear-gradient(180deg, #4A5A72 0%, #3D4A60 100%)' },
  } } },
  MuiChip: { defaultProps: { size: 'small' }, styleOverrides: { root: { borderRadius: 12 } } },
  MuiTableCell: { styleOverrides: { root: { padding: '6px 10px', borderColor: '#4A5568' } } },
  MuiTooltip: { defaultProps: { arrow: true }, styleOverrides: { tooltip: {
    backgroundColor: '#2D3748',
    color: '#E2E8F0',
    border: '1px solid #4A5568',
    borderRadius: 2,
    fontSize: '0.75rem',
  } } },
};
const winxpLight = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0054E3', light: '#3C8CF5', dark: '#003399' },
    secondary: { main: '#7B8FA1' },
    error: { main: '#CC0000' },
    warning: { main: '#FF9900' },
    success: { main: '#339933' },
    background: { default: '#D6DDE5', paper: '#FFFFFF' },
    text: { primary: '#000000', secondary: '#4A5568' },
  },
  typography: { fontFamily: winxpFont, fontSize: 13, h1: { fontWeight: 700 }, h2: { fontWeight: 700 }, h3: { fontWeight: 700 }, h4: { fontWeight: 700 }, h5: { fontWeight: 700 }, h6: { fontWeight: 700, fontSize: '0.85rem' }, button: { fontWeight: 400 } },
  shape: { borderRadius: 6 },
  components: winxpLightComponents,
});
const winxpDark = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#5B9BF5', light: '#89BDF8', dark: '#2A6FD4' },
    secondary: { main: '#8899AA' },
    error: { main: '#FF6666' },
    warning: { main: '#FFBB33' },
    success: { main: '#66CC66' },
    background: { default: '#1A2233', paper: '#2A3142' },
    text: { primary: '#E2E8F0', secondary: '#A0AEC0' },
  },
  typography: { fontFamily: winxpFont, fontSize: 13, h1: { fontWeight: 700 }, h2: { fontWeight: 700 }, h3: { fontWeight: 700 }, h4: { fontWeight: 700 }, h5: { fontWeight: 700 }, h6: { fontWeight: 700, fontSize: '0.85rem' }, button: { fontWeight: 400 } },
  shape: { borderRadius: 6 },
  components: winxpDarkComponents,
});

// === 7. MAC OS 9 (Platinum) ===
// Key: Chicago/Charcoal font, grayscale platinum surfaces, pinstripe texture feel,
// small rounded buttons, classic Mac grey palette
const macos9Font = '"Lucida Grande", "Geneva", "Helvetica Neue", sans-serif';
const macos9Components: ThemeOptions['components'] = {
  ...baseComponents,
  MuiPaper: { styleOverrides: { root: { borderRadius: 4, border: '1px solid #999', boxShadow: '1px 1px 0 #666, -1px -1px 0 #fff' } } },
  MuiCard: { styleOverrides: { root: ({ theme }) => ({ padding: theme.spacing(1.5), borderRadius: 4, border: '1px solid #999', boxShadow: '1px 1px 0 #666', backgroundColor: '#ECECEC' }) } },
  MuiButton: { styleOverrides: { root: { textTransform: 'none' as const, borderRadius: 12, fontWeight: 400, fontSize: '0.8rem', border: '1px solid #888', backgroundImage: 'linear-gradient(180deg, #FFFFFF 0%, #DDDDDD 100%)', boxShadow: '0 1px 0 rgba(255,255,255,0.6) inset', '&:hover': { backgroundImage: 'linear-gradient(180deg, #EEEEFF 0%, #CCCCDD 100%)' } } } },
  MuiChip: { defaultProps: { size: 'small' }, styleOverrides: { root: { borderRadius: 10 } } },
  MuiTableCell: { styleOverrides: { root: { padding: '4px 8px', borderColor: '#CCCCCC', fontSize: '0.8rem' } } },
  MuiTooltip: { defaultProps: { arrow: false }, styleOverrides: { tooltip: { backgroundColor: '#FFFFCC', color: '#000', border: '1px solid #000', borderRadius: 2, fontSize: '0.75rem' } } },
};
const macos9Light = createTheme({
  palette: { mode: 'light', primary: { main: '#3366CC' }, secondary: { main: '#888888' }, error: { main: '#CC0000' }, warning: { main: '#FF9900' }, success: { main: '#339933' }, background: { default: '#DDDDEE', paper: '#ECECEC' }, text: { primary: '#000000', secondary: '#555555' } },
  typography: { fontFamily: macos9Font, fontSize: 12, h1: { fontWeight: 700 }, h2: { fontWeight: 700 }, h3: { fontWeight: 700 }, h4: { fontWeight: 700 }, h5: { fontWeight: 700 }, h6: { fontWeight: 700, fontSize: '0.8rem' }, button: { fontWeight: 400 } },
  shape: { borderRadius: 4 },
  components: macos9Components,
});
const macos9Dark = createTheme({
  palette: { mode: 'dark', primary: { main: '#6699FF' }, secondary: { main: '#999999' }, error: { main: '#FF6666' }, warning: { main: '#FFBB33' }, success: { main: '#66CC66' }, background: { default: '#3A3A4A', paper: '#4A4A5A' }, text: { primary: '#EEEEEE', secondary: '#AAAAAA' } },
  typography: { fontFamily: macos9Font, fontSize: 12, h1: { fontWeight: 700 }, h2: { fontWeight: 700 }, h3: { fontWeight: 700 }, h4: { fontWeight: 700 }, h5: { fontWeight: 700 }, h6: { fontWeight: 700, fontSize: '0.8rem' }, button: { fontWeight: 400 } },
  shape: { borderRadius: 4 },
  components: { ...macos9Components, MuiPaper: { styleOverrides: { root: { borderRadius: 4, border: '1px solid #666', boxShadow: '1px 1px 0 #333' } } }, MuiCard: { styleOverrides: { root: ({ theme }) => ({ padding: theme.spacing(1.5), borderRadius: 4, border: '1px solid #666', backgroundColor: '#4A4A5A' }) } } },
});

// === 8. MACOS AQUA ===
// Key: Glossy gel buttons, pinstripes, brushed metal, bright saturated blue,
// Lucida Grande font, heavy use of transparency and reflections
const aquaComponents: ThemeOptions['components'] = {
  ...baseComponents,
  MuiPaper: { styleOverrides: { root: { borderRadius: 10, border: '1px solid rgba(0,0,0,0.15)', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', backdropFilter: 'blur(12px)', backgroundColor: 'rgba(255,255,255,0.85)' } } },
  MuiCard: { styleOverrides: { root: ({ theme }) => ({ padding: theme.spacing(2), borderRadius: 10, border: '1px solid rgba(0,0,0,0.12)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', backdropFilter: 'blur(12px)', backgroundColor: 'rgba(245,248,255,0.8)', backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(230,238,255,0.7) 100%)' }) } },
  MuiButton: { styleOverrides: { root: { textTransform: 'none' as const, borderRadius: 14, fontWeight: 500, backgroundImage: 'linear-gradient(180deg, #7CB8FF 0%, #2680EB 50%, #1A5FBF 100%)', color: '#fff', border: '1px solid #1A5FBF', boxShadow: '0 1px 0 rgba(255,255,255,0.4) inset, 0 1px 2px rgba(0,0,0,0.2)', '&:hover': { backgroundImage: 'linear-gradient(180deg, #8EC5FF 0%, #3090FF 50%, #2070D0 100%)' } } } },
  MuiChip: { defaultProps: { size: 'small' }, styleOverrides: { root: { borderRadius: 14 } } },
  MuiTableCell: { styleOverrides: { root: { padding: '6px 10px', borderColor: 'rgba(0,0,0,0.08)' } } },
  MuiTooltip: { defaultProps: { arrow: true } },
};
const aquaLight = createTheme({
  palette: { mode: 'light', primary: { main: '#2680EB' }, secondary: { main: '#8E8E93' }, error: { main: '#FF3B30' }, warning: { main: '#FF9500' }, success: { main: '#34C759' }, background: { default: 'transparent', paper: 'rgba(255,255,255,0.85)' }, text: { primary: '#1C1C1E', secondary: '#636366' } },
  typography: { fontFamily: '"Lucida Grande", -apple-system, "Helvetica Neue", sans-serif', h1: { fontWeight: 700 }, h2: { fontWeight: 700 }, h3: { fontWeight: 600 }, h4: { fontWeight: 600 }, h5: { fontWeight: 600 }, h6: { fontWeight: 600 }, button: { fontWeight: 500 } },
  shape: { borderRadius: 10 },
  components: aquaComponents,
});
const aquaDark = createTheme({
  palette: { mode: 'dark', primary: { main: '#4DA3FF' }, secondary: { main: '#98989D' }, error: { main: '#FF453A' }, warning: { main: '#FF9F0A' }, success: { main: '#30D158' }, background: { default: 'transparent', paper: 'rgba(30,30,40,0.8)' }, text: { primary: '#FFFFFF', secondary: '#ABABAF' } },
  typography: { fontFamily: '"Lucida Grande", -apple-system, "Helvetica Neue", sans-serif', h1: { fontWeight: 700 }, h2: { fontWeight: 700 }, h3: { fontWeight: 600 }, h4: { fontWeight: 600 }, h5: { fontWeight: 600 }, h6: { fontWeight: 600 }, button: { fontWeight: 500 } },
  shape: { borderRadius: 10 },
  components: { ...aquaComponents, MuiPaper: { styleOverrides: { root: { borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 16px rgba(0,0,0,0.3)', backdropFilter: 'blur(12px)', backgroundColor: 'rgba(30,30,40,0.75)' } } }, MuiCard: { styleOverrides: { root: ({ theme }) => ({ padding: theme.spacing(2), borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', backgroundColor: 'rgba(30,30,40,0.7)' }) } }, MuiButton: { styleOverrides: { root: { textTransform: 'none' as const, borderRadius: 14, fontWeight: 500, backgroundImage: 'linear-gradient(180deg, #5599FF 0%, #2266CC 50%, #1A55AA 100%)', color: '#fff', border: '1px solid #1A55AA' } } } },
});

// === 9. WINDOWS VISTA (Aero) ===
// Key: Glass/transparency (Aero Glass), heavy blur, glowing edges,
// gradient title bars, Segoe UI font, translucent dark surfaces
const vistaComponents: ThemeOptions['components'] = {
  ...baseComponents,
  MuiPaper: { styleOverrides: { root: { borderRadius: 6, border: '1px solid rgba(255,255,255,0.4)', boxShadow: '0 0 12px rgba(0,0,0,0.15), 0 4px 8px rgba(0,0,0,0.1)', backdropFilter: 'blur(16px) saturate(120%)', backgroundColor: 'rgba(255,255,255,0.6)' } } },
  MuiCard: { styleOverrides: { root: ({ theme }) => ({ padding: theme.spacing(2), borderRadius: 6, border: '1px solid rgba(255,255,255,0.35)', boxShadow: '0 0 8px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.08)', backdropFilter: 'blur(16px) saturate(120%)', backgroundColor: 'rgba(240,248,255,0.55)' }) } },
  MuiButton: { styleOverrides: { root: { textTransform: 'none' as const, borderRadius: 4, fontWeight: 400, border: '1px solid rgba(0,0,0,0.2)', backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(220,230,240,0.8) 100%)', backdropFilter: 'blur(4px)', '&:hover': { backgroundImage: 'linear-gradient(180deg, rgba(220,235,255,0.9) 0%, rgba(180,210,240,0.8) 100%)' } } } },
  MuiChip: { defaultProps: { size: 'small' }, styleOverrides: { root: { borderRadius: 10 } } },
  MuiTableCell: { styleOverrides: { root: { padding: '6px 10px', borderColor: 'rgba(0,0,0,0.08)' } } },
  MuiTooltip: { defaultProps: { arrow: true } },
};
const vistaLight = createTheme({
  palette: { mode: 'light', primary: { main: '#1B5FA0' }, secondary: { main: '#7A8A99' }, error: { main: '#C42B1C' }, warning: { main: '#F09609' }, success: { main: '#0F7B0F' }, background: { default: 'transparent', paper: 'rgba(255,255,255,0.6)' }, text: { primary: '#1A1A1A', secondary: '#555555' } },
  typography: { fontFamily: '"Segoe UI", "Roboto", Arial, sans-serif', h1: { fontWeight: 600 }, h2: { fontWeight: 600 }, h3: { fontWeight: 600 }, h4: { fontWeight: 600 }, h5: { fontWeight: 600 }, h6: { fontWeight: 600 }, button: { fontWeight: 400 } },
  shape: { borderRadius: 6 },
  components: vistaComponents,
});
const vistaDark = createTheme({
  palette: { mode: 'dark', primary: { main: '#4DA8DA' }, secondary: { main: '#8899AA' }, error: { main: '#FF6B6B' }, warning: { main: '#FFB347' }, success: { main: '#77DD77' }, background: { default: 'transparent', paper: 'rgba(20,25,35,0.65)' }, text: { primary: '#F0F0F0', secondary: '#AABBCC' } },
  typography: { fontFamily: '"Segoe UI", "Roboto", Arial, sans-serif', h1: { fontWeight: 600 }, h2: { fontWeight: 600 }, h3: { fontWeight: 600 }, h4: { fontWeight: 600 }, h5: { fontWeight: 600 }, h6: { fontWeight: 600 }, button: { fontWeight: 400 } },
  shape: { borderRadius: 6 },
  components: { ...vistaComponents, MuiPaper: { styleOverrides: { root: { borderRadius: 6, border: '1px solid rgba(100,150,200,0.25)', boxShadow: '0 0 12px rgba(0,0,0,0.3)', backdropFilter: 'blur(16px) saturate(120%)', backgroundColor: 'rgba(20,25,35,0.6)' } } }, MuiCard: { styleOverrides: { root: ({ theme }) => ({ padding: theme.spacing(2), borderRadius: 6, border: '1px solid rgba(100,150,200,0.15)', backdropFilter: 'blur(16px) saturate(120%)', backgroundColor: 'rgba(20,25,35,0.5)' }) } } },
});

// === 10. CYBERPUNK ===
// Key: Neon colors on dark backgrounds, glowing borders, sharp angles,
// monospace/futuristic fonts, magenta/cyan/yellow neon palette
const cyberFont = '"Rajdhani", "Orbitron", "Roboto Mono", "Roboto", monospace';
const cyberComponents: ThemeOptions['components'] = {
  ...baseComponents,
  MuiPaper: { styleOverrides: { root: { borderRadius: 2, border: '1px solid #00FFFF40', boxShadow: '0 0 8px rgba(0,255,255,0.15), 0 4px 12px rgba(0,0,0,0.4)', backgroundColor: 'rgba(10,10,20,0.85)' } } },
  MuiCard: { styleOverrides: { root: ({ theme }) => ({ padding: theme.spacing(2), borderRadius: 2, border: '1px solid #FF00FF30', boxShadow: '0 0 6px rgba(255,0,255,0.1), 0 2px 8px rgba(0,0,0,0.3)', backgroundColor: 'rgba(15,10,25,0.8)' }) } },
  MuiButton: { styleOverrides: { root: { textTransform: 'uppercase' as const, borderRadius: 0, fontWeight: 700, letterSpacing: '0.1em', border: '1px solid #00FFFF', color: '#00FFFF', backgroundColor: 'transparent', boxShadow: '0 0 6px rgba(0,255,255,0.3)', '&:hover': { backgroundColor: 'rgba(0,255,255,0.1)', boxShadow: '0 0 12px rgba(0,255,255,0.5)' } } } },
  MuiChip: { defaultProps: { size: 'small' }, styleOverrides: { root: { borderRadius: 2, fontFamily: cyberFont } } },
  MuiTableCell: { styleOverrides: { root: { padding: '6px 10px', borderColor: '#FF00FF25' } } },
  MuiTableRow: { styleOverrides: { root: { '&:hover': { backgroundColor: 'rgba(0,255,255,0.05)' } } } },
  MuiTooltip: { defaultProps: { arrow: false }, styleOverrides: { tooltip: { backgroundColor: '#0A0A14', color: '#00FFFF', border: '1px solid #00FFFF40', borderRadius: 0 } } },
};
const cyberLight = createTheme({
  palette: { mode: 'dark', primary: { main: '#00FFFF' }, secondary: { main: '#FF00FF' }, error: { main: '#FF0040' }, warning: { main: '#FFE600' }, success: { main: '#00FF88' }, background: { default: '#0A0A14', paper: 'rgba(10,10,20,0.85)' }, text: { primary: '#E0E0FF', secondary: '#8888CC' } },
  typography: { fontFamily: cyberFont, fontSize: 13, h1: { fontWeight: 700, letterSpacing: '0.05em' }, h2: { fontWeight: 700 }, h3: { fontWeight: 700 }, h4: { fontWeight: 600 }, h5: { fontWeight: 600 }, h6: { fontWeight: 700, letterSpacing: '0.08em', fontSize: '0.85rem' }, button: { fontWeight: 700 } },
  shape: { borderRadius: 2 },
  components: cyberComponents,
});
// Cyberpunk is inherently dark — "light" mode is slightly lighter dark
const cyberDark = createTheme({
  palette: { mode: 'dark', primary: { main: '#00FFFF' }, secondary: { main: '#FF00FF' }, error: { main: '#FF0040' }, warning: { main: '#FFE600' }, success: { main: '#00FF88' }, background: { default: '#050508', paper: 'rgba(8,5,15,0.9)' }, text: { primary: '#E0E0FF', secondary: '#7777BB' } },
  typography: { fontFamily: cyberFont, fontSize: 13, h1: { fontWeight: 700, letterSpacing: '0.05em' }, h2: { fontWeight: 700 }, h3: { fontWeight: 700 }, h4: { fontWeight: 600 }, h5: { fontWeight: 600 }, h6: { fontWeight: 700, letterSpacing: '0.08em', fontSize: '0.85rem' }, button: { fontWeight: 700 } },
  shape: { borderRadius: 2 },
  components: cyberComponents,
});

// === 11. NORD ===
// Arctic, blue-grey palette. Clean, calm, low contrast.
const nordLight = createTheme({
  palette: { mode: 'light', primary: { main: '#5E81AC' }, secondary: { main: '#81A1C1' }, error: { main: '#BF616A' }, warning: { main: '#EBCB8B' }, success: { main: '#A3BE8C' }, background: { default: '#ECEFF4', paper: '#E5E9F0' }, text: { primary: '#2E3440', secondary: '#4C566A' }, divider: '#D8DEE9' },
  typography: { fontFamily: '"Inter", "Roboto", sans-serif', h1: { fontWeight: 600 }, h2: { fontWeight: 600 }, h3: { fontWeight: 600 }, h4: { fontWeight: 600 }, h5: { fontWeight: 600 }, h6: { fontWeight: 600 }, button: { fontWeight: 500 } },
  shape: { borderRadius: 8 },
  components: { ...baseComponents, MuiPaper: { styleOverrides: { root: { borderRadius: 8, border: '1px solid #D8DEE9', boxShadow: 'none' } } }, MuiCard: { styleOverrides: { root: ({ theme }) => ({ padding: theme.spacing(2), borderRadius: 8, border: '1px solid #D8DEE9', boxShadow: 'none', backgroundColor: '#E5E9F0' }) } }, MuiButton: { styleOverrides: { root: { textTransform: 'none' as const, borderRadius: 6, fontWeight: 500 } } }, MuiChip: { defaultProps: { size: 'small' }, styleOverrides: { root: { borderRadius: 6 } } }, MuiTableCell: { styleOverrides: { root: { padding: '8px 12px', borderColor: '#D8DEE9' } } }, MuiTooltip: { defaultProps: { arrow: true } } },
});
const nordDark = createTheme({
  palette: { mode: 'dark', primary: { main: '#88C0D0' }, secondary: { main: '#81A1C1' }, error: { main: '#BF616A' }, warning: { main: '#EBCB8B' }, success: { main: '#A3BE8C' }, background: { default: '#2E3440', paper: '#3B4252' }, text: { primary: '#ECEFF4', secondary: '#D8DEE9' }, divider: '#4C566A' },
  typography: { fontFamily: '"Inter", "Roboto", sans-serif', h1: { fontWeight: 600 }, h2: { fontWeight: 600 }, h3: { fontWeight: 600 }, h4: { fontWeight: 600 }, h5: { fontWeight: 600 }, h6: { fontWeight: 600 }, button: { fontWeight: 500 } },
  shape: { borderRadius: 8 },
  components: { ...baseComponents, MuiPaper: { styleOverrides: { root: { borderRadius: 8, border: '1px solid #4C566A', boxShadow: 'none', backgroundColor: '#3B4252' } } }, MuiCard: { styleOverrides: { root: ({ theme }) => ({ padding: theme.spacing(2), borderRadius: 8, border: '1px solid #4C566A', boxShadow: 'none', backgroundColor: '#3B4252' }) } }, MuiButton: { styleOverrides: { root: { textTransform: 'none' as const, borderRadius: 6, fontWeight: 500 } } }, MuiChip: { defaultProps: { size: 'small' }, styleOverrides: { root: { borderRadius: 6 } } }, MuiTableCell: { styleOverrides: { root: { padding: '8px 12px', borderColor: '#4C566A' } } }, MuiTooltip: { defaultProps: { arrow: true } } },
});

// === 12. DRACULA ===
// Purple/pink dark theme. Rich, vibrant, iconic.
const draculaLight = createTheme({
  palette: { mode: 'light', primary: { main: '#6272A4' }, secondary: { main: '#BD93F9' }, error: { main: '#FF5555' }, warning: { main: '#F1FA8C' }, success: { main: '#50FA7B' }, background: { default: '#F8F8F2', paper: '#FFFFFF' }, text: { primary: '#282A36', secondary: '#6272A4' } },
  typography: { fontFamily: '"Fira Code", "Roboto Mono", "Roboto", monospace', h1: { fontWeight: 700 }, h2: { fontWeight: 700 }, h3: { fontWeight: 600 }, h4: { fontWeight: 600 }, h5: { fontWeight: 600 }, h6: { fontWeight: 600 }, button: { fontWeight: 500 } },
  shape: { borderRadius: 8 },
  components: { ...baseComponents, MuiPaper: { styleOverrides: { root: { borderRadius: 8, border: '1px solid #E0E0E0' } } }, MuiCard: { styleOverrides: { root: ({ theme }) => ({ padding: theme.spacing(2), borderRadius: 8 }) } }, MuiButton: { styleOverrides: { root: { textTransform: 'none' as const, borderRadius: 6 } } }, MuiChip: { defaultProps: { size: 'small' }, styleOverrides: { root: { borderRadius: 6 } } }, MuiTableCell: { styleOverrides: { root: { padding: '8px 12px' } } }, MuiTooltip: { defaultProps: { arrow: true } } },
});
const draculaDark = createTheme({
  palette: { mode: 'dark', primary: { main: '#BD93F9' }, secondary: { main: '#FF79C6' }, error: { main: '#FF5555' }, warning: { main: '#F1FA8C' }, success: { main: '#50FA7B' }, info: { main: '#8BE9FD' }, background: { default: '#282A36', paper: '#44475A' }, text: { primary: '#F8F8F2', secondary: '#6272A4' } },
  typography: { fontFamily: '"Fira Code", "Roboto Mono", "Roboto", monospace', h1: { fontWeight: 700 }, h2: { fontWeight: 700 }, h3: { fontWeight: 600 }, h4: { fontWeight: 600 }, h5: { fontWeight: 600 }, h6: { fontWeight: 600 }, button: { fontWeight: 500 } },
  shape: { borderRadius: 8 },
  components: { ...baseComponents, MuiPaper: { styleOverrides: { root: { borderRadius: 8, border: '1px solid #6272A4', backgroundColor: '#44475A' } } }, MuiCard: { styleOverrides: { root: ({ theme }) => ({ padding: theme.spacing(2), borderRadius: 8, border: '1px solid #6272A4', backgroundColor: '#44475A' }) } }, MuiButton: { styleOverrides: { root: { textTransform: 'none' as const, borderRadius: 6 } } }, MuiChip: { defaultProps: { size: 'small' }, styleOverrides: { root: { borderRadius: 6 } } }, MuiTableCell: { styleOverrides: { root: { padding: '8px 12px', borderColor: '#6272A4' } } }, MuiTooltip: { defaultProps: { arrow: true } } },
});

// === 13. SOLARIZED ===
// Ethan Schoonover's scientific colour scheme. Warm base, precise accents.
const solarizedLight = createTheme({
  palette: { mode: 'light', primary: { main: '#268BD2' }, secondary: { main: '#2AA198' }, error: { main: '#DC322F' }, warning: { main: '#B58900' }, success: { main: '#859900' }, background: { default: '#FDF6E3', paper: '#EEE8D5' }, text: { primary: '#657B83', secondary: '#93A1A1' }, divider: '#EEE8D5' },
  typography: { fontFamily: '"Source Sans Pro", "Roboto", sans-serif', h1: { fontWeight: 600 }, h2: { fontWeight: 600 }, h3: { fontWeight: 600 }, h4: { fontWeight: 600 }, h5: { fontWeight: 600 }, h6: { fontWeight: 600 }, button: { fontWeight: 500 } },
  shape: { borderRadius: 6 },
  components: { ...baseComponents, MuiPaper: { styleOverrides: { root: { borderRadius: 6, border: '1px solid #EEE8D5', boxShadow: 'none', backgroundColor: '#EEE8D5' } } }, MuiCard: { styleOverrides: { root: ({ theme }) => ({ padding: theme.spacing(2), borderRadius: 6, boxShadow: 'none', backgroundColor: '#EEE8D5' }) } }, MuiButton: { styleOverrides: { root: { textTransform: 'none' as const, borderRadius: 4 } } }, MuiChip: { defaultProps: { size: 'small' }, styleOverrides: { root: { borderRadius: 4 } } }, MuiTableCell: { styleOverrides: { root: { padding: '8px 12px', borderColor: '#EEE8D5' } } }, MuiTooltip: { defaultProps: { arrow: true } } },
});
const solarizedDark = createTheme({
  palette: { mode: 'dark', primary: { main: '#268BD2' }, secondary: { main: '#2AA198' }, error: { main: '#DC322F' }, warning: { main: '#B58900' }, success: { main: '#859900' }, background: { default: '#002B36', paper: '#073642' }, text: { primary: '#839496', secondary: '#586E75' }, divider: '#073642' },
  typography: { fontFamily: '"Source Sans Pro", "Roboto", sans-serif', h1: { fontWeight: 600 }, h2: { fontWeight: 600 }, h3: { fontWeight: 600 }, h4: { fontWeight: 600 }, h5: { fontWeight: 600 }, h6: { fontWeight: 600 }, button: { fontWeight: 500 } },
  shape: { borderRadius: 6 },
  components: { ...baseComponents, MuiPaper: { styleOverrides: { root: { borderRadius: 6, border: '1px solid #073642', boxShadow: 'none', backgroundColor: '#073642' } } }, MuiCard: { styleOverrides: { root: ({ theme }) => ({ padding: theme.spacing(2), borderRadius: 6, boxShadow: 'none', backgroundColor: '#073642' }) } }, MuiButton: { styleOverrides: { root: { textTransform: 'none' as const, borderRadius: 4 } } }, MuiChip: { defaultProps: { size: 'small' }, styleOverrides: { root: { borderRadius: 4 } } }, MuiTableCell: { styleOverrides: { root: { padding: '8px 12px', borderColor: '#073642' } } }, MuiTooltip: { defaultProps: { arrow: true } } },
});

// === 14. CATPPUCCIN (Mocha) ===
// Trendy pastel palette. Warm, cozy, soft on the eyes.
const catppuccinLight = createTheme({
  palette: { mode: 'light', primary: { main: '#8839EF' }, secondary: { main: '#EA76CB' }, error: { main: '#D20F39' }, warning: { main: '#DF8E1D' }, success: { main: '#40A02B' }, info: { main: '#209FB5' }, background: { default: '#EFF1F5', paper: '#E6E9EF' }, text: { primary: '#4C4F69', secondary: '#6C6F85' }, divider: '#CCD0DA' },
  typography: { fontFamily: '"Inter", "Roboto", sans-serif', h1: { fontWeight: 600 }, h2: { fontWeight: 600 }, h3: { fontWeight: 600 }, h4: { fontWeight: 600 }, h5: { fontWeight: 600 }, h6: { fontWeight: 600 }, button: { fontWeight: 500 } },
  shape: { borderRadius: 12 },
  components: { ...baseComponents, MuiPaper: { styleOverrides: { root: { borderRadius: 12, border: '1px solid #CCD0DA', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' } } }, MuiCard: { styleOverrides: { root: ({ theme }) => ({ padding: theme.spacing(2), borderRadius: 12, border: '1px solid #CCD0DA' }) } }, MuiButton: { styleOverrides: { root: { textTransform: 'none' as const, borderRadius: 20 } } }, MuiChip: { defaultProps: { size: 'small' }, styleOverrides: { root: { borderRadius: 20 } } }, MuiTableCell: { styleOverrides: { root: { padding: '8px 12px', borderColor: '#CCD0DA' } } }, MuiTooltip: { defaultProps: { arrow: true } } },
});
const catppuccinDark = createTheme({
  palette: { mode: 'dark', primary: { main: '#CBA6F7' }, secondary: { main: '#F5C2E7' }, error: { main: '#F38BA8' }, warning: { main: '#FAB387' }, success: { main: '#A6E3A1' }, info: { main: '#89DCEB' }, background: { default: '#1E1E2E', paper: '#313244' }, text: { primary: '#CDD6F4', secondary: '#A6ADC8' }, divider: '#45475A' },
  typography: { fontFamily: '"Inter", "Roboto", sans-serif', h1: { fontWeight: 600 }, h2: { fontWeight: 600 }, h3: { fontWeight: 600 }, h4: { fontWeight: 600 }, h5: { fontWeight: 600 }, h6: { fontWeight: 600 }, button: { fontWeight: 500 } },
  shape: { borderRadius: 12 },
  components: { ...baseComponents, MuiPaper: { styleOverrides: { root: { borderRadius: 12, border: '1px solid #45475A', boxShadow: 'none', backgroundColor: '#313244' } } }, MuiCard: { styleOverrides: { root: ({ theme }) => ({ padding: theme.spacing(2), borderRadius: 12, border: '1px solid #45475A', backgroundColor: '#313244' }) } }, MuiButton: { styleOverrides: { root: { textTransform: 'none' as const, borderRadius: 20 } } }, MuiChip: { defaultProps: { size: 'small' }, styleOverrides: { root: { borderRadius: 20 } } }, MuiTableCell: { styleOverrides: { root: { padding: '8px 12px', borderColor: '#45475A' } } }, MuiTooltip: { defaultProps: { arrow: true } } },
});

// === 15. SYNTHWAVE ===
// 80s retro neon. Purple/pink sunset gradient feel, warm neon glow.
const synthwaveLight = createTheme({
  palette: { mode: 'dark', primary: { main: '#FF7EDB' }, secondary: { main: '#36F9F6' }, error: { main: '#FE4450' }, warning: { main: '#FEDE5D' }, success: { main: '#72F1B8' }, background: { default: '#262335', paper: '#34294F' }, text: { primary: '#F0E3FF', secondary: '#B4A5CC' } },
  typography: { fontFamily: '"Orbitron", "Rajdhani", "Roboto", sans-serif', fontSize: 13, h1: { fontWeight: 700 }, h2: { fontWeight: 700 }, h3: { fontWeight: 600 }, h4: { fontWeight: 600 }, h5: { fontWeight: 600 }, h6: { fontWeight: 600, letterSpacing: '0.05em' }, button: { fontWeight: 600 } },
  shape: { borderRadius: 4 },
  components: { ...baseComponents, MuiPaper: { styleOverrides: { root: { borderRadius: 4, border: '1px solid #FF7EDB30', boxShadow: '0 0 8px rgba(255,126,219,0.1)', backgroundColor: '#34294F' } } }, MuiCard: { styleOverrides: { root: ({ theme }) => ({ padding: theme.spacing(2), borderRadius: 4, border: '1px solid #FF7EDB25', boxShadow: '0 0 6px rgba(255,126,219,0.08)', backgroundColor: '#34294F' }) } }, MuiButton: { styleOverrides: { root: { textTransform: 'none' as const, borderRadius: 4, border: '1px solid #FF7EDB50', '&:hover': { boxShadow: '0 0 10px rgba(255,126,219,0.3)' } } } }, MuiChip: { defaultProps: { size: 'small' }, styleOverrides: { root: { borderRadius: 4 } } }, MuiTableCell: { styleOverrides: { root: { padding: '6px 10px', borderColor: '#FF7EDB15' } } }, MuiTooltip: { defaultProps: { arrow: false } } },
});
const synthwaveDark = createTheme({
  palette: { mode: 'dark', primary: { main: '#FF7EDB' }, secondary: { main: '#36F9F6' }, error: { main: '#FE4450' }, warning: { main: '#FEDE5D' }, success: { main: '#72F1B8' }, background: { default: '#1A1328', paper: '#2A1F3D' }, text: { primary: '#F0E3FF', secondary: '#9B8BB4' } },
  typography: { fontFamily: '"Orbitron", "Rajdhani", "Roboto", sans-serif', fontSize: 13, h1: { fontWeight: 700 }, h2: { fontWeight: 700 }, h3: { fontWeight: 600 }, h4: { fontWeight: 600 }, h5: { fontWeight: 600 }, h6: { fontWeight: 600, letterSpacing: '0.05em' }, button: { fontWeight: 600 } },
  shape: { borderRadius: 4 },
  components: { ...baseComponents, MuiPaper: { styleOverrides: { root: { borderRadius: 4, border: '1px solid #FF7EDB25', boxShadow: '0 0 8px rgba(255,126,219,0.08)', backgroundColor: '#2A1F3D' } } }, MuiCard: { styleOverrides: { root: ({ theme }) => ({ padding: theme.spacing(2), borderRadius: 4, border: '1px solid #FF7EDB20', backgroundColor: '#2A1F3D' }) } }, MuiButton: { styleOverrides: { root: { textTransform: 'none' as const, borderRadius: 4, border: '1px solid #FF7EDB40', '&:hover': { boxShadow: '0 0 10px rgba(255,126,219,0.25)' } } } }, MuiChip: { defaultProps: { size: 'small' }, styleOverrides: { root: { borderRadius: 4 } } }, MuiTableCell: { styleOverrides: { root: { padding: '6px 10px', borderColor: '#FF7EDB12' } } }, MuiTooltip: { defaultProps: { arrow: false } } },
});

// === 16. TERMINAL ===
// Green on black. Monospace everything. The hacker aesthetic.
const termFont = '"Fira Code", "Cascadia Code", "Roboto Mono", monospace';
const terminalLight = createTheme({
  palette: { mode: 'dark', primary: { main: '#00FF00' }, secondary: { main: '#00CC00' }, error: { main: '#FF0000' }, warning: { main: '#FFFF00' }, success: { main: '#00FF00' }, background: { default: '#0A0A0A', paper: '#111111' }, text: { primary: '#00FF00', secondary: '#009900' }, divider: '#003300' },
  typography: { fontFamily: termFont, fontSize: 13, h1: { fontWeight: 700 }, h2: { fontWeight: 700 }, h3: { fontWeight: 400 }, h4: { fontWeight: 400 }, h5: { fontWeight: 400 }, h6: { fontWeight: 400, fontSize: '0.85rem' }, body1: { fontSize: '0.85rem' }, body2: { fontSize: '0.8rem' }, button: { fontWeight: 400 } },
  shape: { borderRadius: 0 },
  components: { ...baseComponents, MuiPaper: { styleOverrides: { root: { borderRadius: 0, border: '1px solid #003300', boxShadow: 'none', backgroundColor: '#111111' } } }, MuiCard: { styleOverrides: { root: ({ theme }) => ({ padding: theme.spacing(1.5), borderRadius: 0, border: '1px solid #003300', boxShadow: 'none', backgroundColor: '#0D0D0D' }) } }, MuiButton: { styleOverrides: { root: { textTransform: 'uppercase' as const, borderRadius: 0, fontWeight: 400, border: '1px solid #00FF00', color: '#00FF00', backgroundColor: 'transparent', '&:hover': { backgroundColor: '#003300' } } } }, MuiChip: { defaultProps: { size: 'small' }, styleOverrides: { root: { borderRadius: 0, border: '1px solid #009900' } } }, MuiTableCell: { styleOverrides: { root: { padding: '4px 8px', borderColor: '#003300', fontFamily: termFont } } }, MuiTooltip: { defaultProps: { arrow: false }, styleOverrides: { tooltip: { backgroundColor: '#001100', color: '#00FF00', border: '1px solid #003300', borderRadius: 0, fontFamily: termFont } } } },
});
const terminalDark = createTheme({
  palette: { mode: 'dark', primary: { main: '#00FF00' }, secondary: { main: '#00AA00' }, error: { main: '#FF3333' }, warning: { main: '#FFFF33' }, success: { main: '#00FF00' }, background: { default: '#000000', paper: '#0A0A0A' }, text: { primary: '#00DD00', secondary: '#007700' }, divider: '#002200' },
  typography: { fontFamily: termFont, fontSize: 13, h1: { fontWeight: 700 }, h2: { fontWeight: 700 }, h3: { fontWeight: 400 }, h4: { fontWeight: 400 }, h5: { fontWeight: 400 }, h6: { fontWeight: 400, fontSize: '0.85rem' }, body1: { fontSize: '0.85rem' }, body2: { fontSize: '0.8rem' }, button: { fontWeight: 400 } },
  shape: { borderRadius: 0 },
  components: { ...baseComponents, MuiPaper: { styleOverrides: { root: { borderRadius: 0, border: '1px solid #002200', boxShadow: 'none', backgroundColor: '#0A0A0A' } } }, MuiCard: { styleOverrides: { root: ({ theme }) => ({ padding: theme.spacing(1.5), borderRadius: 0, border: '1px solid #002200', boxShadow: 'none', backgroundColor: '#050505' }) } }, MuiButton: { styleOverrides: { root: { textTransform: 'uppercase' as const, borderRadius: 0, fontWeight: 400, border: '1px solid #00DD00', color: '#00DD00', backgroundColor: 'transparent', '&:hover': { backgroundColor: '#002200' } } } }, MuiChip: { defaultProps: { size: 'small' }, styleOverrides: { root: { borderRadius: 0, border: '1px solid #007700' } } }, MuiTableCell: { styleOverrides: { root: { padding: '4px 8px', borderColor: '#002200', fontFamily: termFont } } }, MuiTooltip: { defaultProps: { arrow: false }, styleOverrides: { tooltip: { backgroundColor: '#000000', color: '#00DD00', border: '1px solid #002200', borderRadius: 0, fontFamily: termFont } } } },
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
      headerBg: (m) => m === 'dark' ? 'rgba(28,28,28,0.8)' : 'rgba(249,249,249,0.8)',
      headerColor: '',
      brandBlockBg: '#0078D4',
      brandBlockColor: '#fff',
      sidebarBg: () => 'transparent',
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
  winxp: {
    name: 'winxp', label: 'Windows XP', description: 'Luna blue theme with gradient buttons',
    light: winxpLight, dark: winxpDark,
    custom: {
      headerBg: (m) => m === 'dark' ? 'linear-gradient(180deg, #1E3A5F 0%, #0F2744 100%)' : 'linear-gradient(180deg, #0A246A 0%, #3A6EA5 50%, #0A246A 100%)',
      headerColor: '#fff',
      brandBlockBg: '#2A8E2A',
      brandBlockColor: '#fff',
      sidebarBg: () => 'transparent',
      cardBorderRadius: 8,
    },
  },
  macos9: {
    name: 'macos9', label: 'Mac OS 9', description: 'Classic Platinum grey with rounded buttons',
    light: macos9Light, dark: macos9Dark,
    custom: {
      headerBg: () => 'linear-gradient(180deg, #CCCCDD 0%, #AAAABB 100%)',
      headerColor: '#000',
      brandBlockBg: '#6699CC',
      brandBlockColor: '#fff',
      sidebarBg: () => 'transparent',
      cardBorderRadius: 4,
    },
  },
  aqua: {
    name: 'aqua', label: 'macOS Aqua', description: 'Glossy gel buttons and translucent blue',
    light: aquaLight, dark: aquaDark,
    custom: {
      headerBg: (m) => m === 'dark' ? 'rgba(20,20,30,0.8)' : 'linear-gradient(180deg, rgba(200,220,255,0.9) 0%, rgba(160,190,240,0.85) 100%)',
      headerColor: '',
      brandBlockBg: '#2680EB',
      brandBlockColor: '#fff',
      sidebarBg: () => 'transparent',
      cardBorderRadius: 10,
    },
  },
  vista: {
    name: 'vista', label: 'Windows Vista', description: 'Aero Glass with blur and glow effects',
    light: vistaLight, dark: vistaDark,
    custom: {
      headerBg: (m) => m === 'dark' ? 'rgba(15,20,30,0.75)' : 'rgba(200,220,240,0.65)',
      headerColor: '',
      brandBlockBg: '#1B5FA0',
      brandBlockColor: '#fff',
      sidebarBg: () => 'transparent',
      cardBorderRadius: 6,
    },
  },
  cyberpunk: {
    name: 'cyberpunk', label: 'Cyberpunk', description: 'Neon glow on dark with sharp edges',
    light: cyberLight, dark: cyberDark,
    custom: {
      headerBg: () => 'rgba(8,5,15,0.9)',
      headerColor: '#00FFFF',
      brandBlockBg: '#FF00FF',
      brandBlockColor: '#000',
      sidebarBg: () => 'transparent',
      cardBorderRadius: 2,
    },
  },
  nord: {
    name: 'nord', label: 'Nord', description: 'Arctic blue-grey, calm and clean',
    light: nordLight, dark: nordDark,
    custom: { headerBg: (m) => m === 'dark' ? '#2E3440' : '#D8DEE9', headerColor: '', brandBlockBg: '#5E81AC', brandBlockColor: '#ECEFF4', sidebarBg: () => 'transparent', cardBorderRadius: 8 },
  },
  dracula: {
    name: 'dracula', label: 'Dracula', description: 'Iconic purple/pink dark theme',
    light: draculaLight, dark: draculaDark,
    custom: { headerBg: (m) => m === 'dark' ? '#282A36' : '#F8F8F2', headerColor: '', brandBlockBg: '#BD93F9', brandBlockColor: '#282A36', sidebarBg: () => 'transparent', cardBorderRadius: 8 },
  },
  solarized: {
    name: 'solarized', label: 'Solarized', description: 'Precision colours for readability',
    light: solarizedLight, dark: solarizedDark,
    custom: { headerBg: (m) => m === 'dark' ? '#002B36' : '#FDF6E3', headerColor: '', brandBlockBg: '#268BD2', brandBlockColor: '#FDF6E3', sidebarBg: () => 'transparent', cardBorderRadius: 6 },
  },
  catppuccin: {
    name: 'catppuccin', label: 'Catppuccin', description: 'Warm pastel tones, cozy and soft',
    light: catppuccinLight, dark: catppuccinDark,
    custom: { headerBg: (m) => m === 'dark' ? '#1E1E2E' : '#EFF1F5', headerColor: '', brandBlockBg: '#CBA6F7', brandBlockColor: '#1E1E2E', sidebarBg: () => 'transparent', cardBorderRadius: 12 },
  },
  synthwave: {
    name: 'synthwave', label: 'Synthwave', description: '80s retro sunset with neon pink',
    light: synthwaveLight, dark: synthwaveDark,
    custom: { headerBg: () => '#1A1328', headerColor: '#FF7EDB', brandBlockBg: '#FF7EDB', brandBlockColor: '#1A1328', sidebarBg: () => 'transparent', cardBorderRadius: 4 },
  },
  terminal: {
    name: 'terminal', label: 'Terminal', description: 'Green on black hacker aesthetic',
    light: terminalLight, dark: terminalDark,
    custom: { headerBg: () => '#0A0A0A', headerColor: '#00FF00', brandBlockBg: '#003300', brandBlockColor: '#00FF00', sidebarBg: () => 'transparent', cardBorderRadius: 0 },
  },
};

export const THEME_NAMES = Object.keys(THEMES) as ThemeName[];
