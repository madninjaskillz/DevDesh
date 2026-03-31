import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import { AppHeader } from './AppHeader';

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppHeader />
      <Box sx={{ height: 44 }} /> {/* Spacer for fixed header */}
      <Box sx={{ flex: 1, py: 3, px: 3 }}>
        {children}
      </Box>
    </Box>
  );
}
