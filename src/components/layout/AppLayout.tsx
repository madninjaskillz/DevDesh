import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { AppHeader } from './AppHeader';
import { useSettings } from '../../hooks/useSettings';
import { useThemeMode } from '../../theme/ThemeProvider';
import { getBackgroundById } from '../../theme/backgrounds';

export function AppLayout({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const { themeDef } = useThemeMode();
  const theme = useTheme();
  const bg = settings.backgroundId ? getBackgroundById(settings.backgroundId) : null;
  const isDark = theme.palette.mode === 'dark';

  // Translucent themes (glass, fluent) already have blurred surfaces,
  // so they need a lighter scrim. Opaque themes need more.
  const isTranslucentTheme = ['glass', 'fluent', 'aqua', 'vista', 'sonoma'].includes(themeDef.name);
  const scrimOpacity = isTranslucentTheme ? 0.25 : 0.5;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        ...(bg ? {
          backgroundImage: `url(${bg.file})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        } : {}),
      }}
    >
      <AppHeader />
      <Box sx={{ height: 56 }} />
      <Box
        sx={{
          flex: 1,
          py: 3,
          px: 3,
          ...(bg ? {
            backgroundColor: isDark
              ? `rgba(0,0,0,${scrimOpacity})`
              : `rgba(255,255,255,${scrimOpacity})`,
          } : {}),
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
