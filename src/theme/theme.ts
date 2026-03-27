import { createTheme, type ThemeOptions } from '@mui/material/styles';
import { colors } from './colors';

const commonComponents: ThemeOptions['components'] = {
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: 'none' as const,
      },
    },
  },
  MuiToolbar: {
    defaultProps: {
      variant: 'dense',
    },
  },
  MuiCard: {
    styleOverrides: {
      root: ({ theme }) => ({
        padding: theme.spacing(2),
      }),
    },
  },
  MuiCardContent: {
    styleOverrides: {
      root: ({ theme }) => ({
        padding: theme.spacing(1),
        '&:last-child': { paddingBottom: theme.spacing(1) },
      }),
    },
  },
  MuiChip: {
    defaultProps: {
      size: 'small',
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: {
        padding: '8px 12px',
      },
    },
  },
  MuiSvgIcon: {
    defaultProps: {
      fontSize: 'small',
    },
  },
  MuiTooltip: {
    defaultProps: {
      arrow: true,
    },
  },
};

const commonTypography: ThemeOptions['typography'] = {
  fontFamily: '"Roboto", "Helvetica Neue", Arial, sans-serif',
  h1: { fontWeight: 700 },
  h2: { fontWeight: 700 },
  h3: { fontWeight: 700 },
  h4: { fontWeight: 700 },
  h5: { fontWeight: 700 },
  h6: { fontWeight: 700 },
  button: { fontWeight: 500 },
};

const commonPalette = {
  brand: {
    main: colors.red.brand,
    contrastText: colors.white,
  },
  error: { main: '#f65b55' },
  warning: {
    light: colors.orange[4],
    main: colors.orange[5],
    dark: '#E65100',
  },
  info: {
    light: colors.blue[3],
    main: colors.blue[4],
    dark: colors.blue[5],
  },
  success: {
    light: colors.green[4],
    main: colors.green[5],
    dark: colors.green[6],
  },
};

export const lightThemeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      light: colors.blue[5],
      main: colors.blue[6],
      dark: colors.blue[7],
    },
    secondary: {
      light: colors.gray[4],
      main: colors.gray[5],
      dark: colors.gray[6],
    },
    ...commonPalette,
    background: {
      default: colors.gray[1],
      paper: colors.white,
    },
  },
  typography: commonTypography,
  components: commonComponents,
};

export const darkThemeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      light: colors.blue[5],
      main: colors.blue[4],
      dark: colors.blue[7],
    },
    secondary: {
      light: colors.gray[3],
      main: colors.gray[4],
      dark: colors.gray[5],
    },
    ...commonPalette,
    background: {
      default: colors.gray[9],
      paper: colors.gray[8],
    },
  },
  typography: commonTypography,
  components: commonComponents,
};

export const lightTheme = createTheme(lightThemeOptions);
export const darkTheme = createTheme(darkThemeOptions);
