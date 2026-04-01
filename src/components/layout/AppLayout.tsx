import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import { AppHeader } from './AppHeader';
import { useSettings } from '../../hooks/useSettings';
import { getBackgroundById } from '../../theme/backgrounds';

export function AppLayout({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const bg = settings.backgroundId ? getBackgroundById(settings.backgroundId) : null;

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
      <Box sx={{ height: 44 }} />
      <Box sx={{ flex: 1, py: 3, px: 3 }}>
        {children}
      </Box>
    </Box>
  );
}
