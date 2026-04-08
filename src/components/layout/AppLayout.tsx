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
  const isVideo = bg?.file.endsWith('.mp4');

  const scrimOpacity = (settings.scrimOpacity ?? 50) / 100;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        position: 'relative',
        ...(bg && !isVideo ? {
          backgroundImage: `url(${bg.file})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        } : {}),
      }}
    >
      {bg && isVideo && (
        <video
          key={bg.file}
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: -1,
          }}
        >
          <source src={bg.file} type="video/mp4" />
        </video>
      )}
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
