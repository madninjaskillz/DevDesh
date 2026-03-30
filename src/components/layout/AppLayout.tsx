import type { ReactNode } from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import { AppHeader } from './AppHeader';
import { Sidebar } from './Sidebar';

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppHeader />
      <Container maxWidth="xl" sx={{ flex: 1, py: 3 }}>
        <Box sx={{ display: 'flex', gap: 3 }}>
          <Sidebar />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {children}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
