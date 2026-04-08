import { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@mui/material/styles';
import { useThemeMode } from '../../theme/ThemeProvider';
import { useAuth } from '../../hooks/useAuth';
import { SettingsDialog } from '../settings/SettingsDialog';

// Load Redgate brand fonts (served locally to avoid CORS issues)
(() => {
  if (typeof document === 'undefined') return;
  const id = 'redgate-font';
  if (document.getElementById(id)) return;
  const base = import.meta.env.BASE_URL;
  const style = document.createElement('style');
  style.id = id;
  style.textContent = `
    @font-face {
      font-family: 'Redgate';
      src: url('${base}fonts/redgate.woff') format('woff');
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }
    @font-face {
      font-family: 'Redgate Type';
      src: url('${base}fonts/redgate-type-medium.woff') format('woff');
      font-weight: 500;
      font-style: normal;
      font-display: swap;
    }
  `;
  document.head.appendChild(style);
})();

function LogoIcon({ size = 34, badgeColor = '#E30613', lineColor = '#FFFFFF' }: { size?: number; badgeColor?: string; lineColor?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
      <path d="M256 160 Q512 100 768 160 L768 768 Q512 828 256 768 Z" fill={badgeColor} />
      <path d="M320 330 H478 H638 C720 330 736 432 668 466 H550 H382 C286 466 286 602 382 602 H478 H638 H728"
        fill="none" stroke={lineColor} strokeWidth="34" strokeLinecap="round" strokeLinejoin="round" />
      <g fill={badgeColor} stroke={lineColor} strokeWidth="34">
        <circle cx="478" cy="330" r="34" />
        <circle cx="638" cy="330" r="34" />
        <circle cx="382" cy="466" r="34" />
        <circle cx="550" cy="466" r="34" />
        <circle cx="478" cy="602" r="34" />
        <circle cx="638" cy="602" r="34" />
      </g>
    </svg>
  );
}

/** Check if a hex color is close to red (hue 0-30 or 330-360, high saturation) */
function isReddish(hex: string): boolean {
  const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return false;
  const r = parseInt(m[1], 16) / 255;
  const g = parseInt(m[2], 16) / 255;
  const b = parseInt(m[3], 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const delta = max - min;
  if (delta < 0.2 || max < 0.3) return false; // too grey or too dark
  let h = 0;
  if (delta > 0) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }
  return (h <= 30 || h >= 330);
}

export function AppHeader() {
  const { mode, toggleTheme, themeDef } = useThemeMode();
  const muiTheme = useTheme();
  const headerBg = themeDef.custom.headerBg(mode);
  const headerColor = themeDef.custom.headerColor || muiTheme.palette.text.primary;
  const brandBg = themeDef.custom.brandBlockBg;
  const { user, isAuthenticated, logout } = useAuth();
  const queryClient = useQueryClient();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const handleRefresh = () => {
    queryClient.invalidateQueries({ refetchType: 'all' });
  };


  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        color="inherit"
        sx={{
          background: headerBg,
          color: headerColor,
          backdropFilter: (['glass', 'fluent', 'aqua', 'vista', 'sonoma'].includes(themeDef.name)) ? 'blur(20px) saturate(180%)' : undefined,
        }}
      >
        <Toolbar sx={{ minHeight: '56px !important', px: '0 !important', gap: 0 }}>
          {/* Brand block with logo + product name */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: brandBg,
              px: 2.5,
              pr: 3,
              alignSelf: 'stretch',
              gap: 1.5,
            }}
          >
            <LogoIcon
              size={50}
              badgeColor={isReddish(brandBg) ? '#FFFFFF' : '#E30613'}
              lineColor={isReddish(brandBg) ? '#E30613' : '#FFFFFF'}
            />
            <Typography
              noWrap
              sx={{
                fontFamily: '"Redgate Type", "Redgate", "Roboto", sans-serif',
                fontWeight: 500,
                color: '#FFFFFF',
                fontSize: '1.25rem',
                letterSpacing: '0.03em',
              }}
            >
              DevDash
            </Typography>
          </Box>

          
          {/* Spacer */}
          <Box sx={{ flex: 1 }} />

          {isAuthenticated && (
            <>
              {/* Left group: view toggles */}
              <Tooltip title="Refresh data (R)">
                <IconButton onClick={handleRefresh} size="small" sx={{ color: headerColor }}>
                  <RefreshIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
                <IconButton onClick={toggleTheme} size="small" sx={{ color: headerColor }}>
                  {mode === 'light' ? <DarkModeIcon sx={{ fontSize: 18 }} /> : <LightModeIcon sx={{ fontSize: 18 }} />}
                </IconButton>
              </Tooltip>

              {/* Settings — always last before user profile */}
              <Tooltip title="Settings">
                <IconButton onClick={() => setSettingsOpen(true)} size="small" sx={{ color: headerColor }}>
                  <SettingsIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>

              
              {/* User */}
              {user && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mx: 1 }}>
                  <Avatar src={user.avatar_url} alt={user.login} sx={{ width: 28, height: 28 }} />
                  <Typography variant="body2" sx={{ color: headerColor, fontSize: '0.8rem' }} noWrap>
                    {user.login}
                  </Typography>
                  <Tooltip title="Sign out">
                    <IconButton onClick={logout} size="small" sx={{ color: headerColor }}>
                      <LogoutIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </>
          )}

          {!isAuthenticated && (
            <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
              <IconButton onClick={toggleTheme} size="small" sx={{ color: headerColor, mr: 1 }}>
                {mode === 'light' ? <DarkModeIcon sx={{ fontSize: 18 }} /> : <LightModeIcon sx={{ fontSize: 18 }} />}
              </IconButton>
            </Tooltip>
          )}

          {/* Redgate branding — right edge */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              px: 2.5,
              alignSelf: 'stretch',
              borderLeft: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            <svg viewBox="0 0 850.4 203.2" height="22" fill="rgba(255,255,255,0.65)">
              <g>
                <g>
                  <polygon points="115.9,92.3 58.9,90.9 78.7,111.8 115.9,110.9" />
                  <polygon points="107.2,142 115.9,141 115.9,123.2 90.8,124.6" />
                  <polygon points="0,153.2 92.4,143.5 74.6,125.6 0,129.9" />
                  <polygon points="39.9,90.4 0,89.4 0,113.8 61.5,112.3" />
                  <polygon points="44.7,75.9 115.9,80 115.9,62.1 22.4,52.3" />
                  <polygon points="0,50 0,73.3 24.4,74.7 0,50" />
                </g>
                <path d="M120.9,154.2c2.2-0.3,4.9-3.1,4.9-7.5V56.4c0-4.3-2.5-7.1-4.9-7.5L0,31.8V16.6C13.7,6.8,42.6,0,76.2,0s62.5,6.8,76.2,16.6v170c-13.7,9.8-42.6,16.6-76.2,16.6S13.7,196.4,0,186.6v-15.2L120.9,154.2" />
              </g>
              <g>
                <path d="M210,134.1v-20.6c0-15.2,0.4-39.4,7-54.6c16.2-8,33.6-11.8,52.8-9.4c1,7.2,0,13.6-3.6,19.4c-9.8-1.6-19.6-0.4-29.4,3.8c-3.6,11.2-4,28.8-4,38.6v42.2c-7.4,1.2-12,1.2-20.6,0C210,147.1,210,140.7,210,134.1z" />
                <path d="M328.4,114.5c-8.4,0-22-0.4-31.8-2.2v8.8c0,15.6,15.2,16.4,28,16.4c9,0,22-1.6,32.2-5.2c3.4,4.6,4.6,9.2,3.8,14.6c-11.4,6.4-24.8,10-40,10c-24.8,0-46.8-6-46.8-35.2v-13.6c0-14.4,2.8-35.4,8.6-49c13.4-7.2,26.4-10.8,38.4-10.8c26,0,44.6,8,44.6,35.2c0,7-1.8,21.2-4.8,28.6C351.8,113.1,339.8,114.5,328.4,114.5z M320.6,67.9c-6.8,0-13.2,1.8-19.8,5.2c-2,6-3.4,14.4-3.8,21.8c9,2.4,16.4,2.4,24,2.4c8.8,0,15.2-0.6,20.8-1.8c1.2-3.8,1.6-7.6,1.6-11.4C343.4,70.5,332.2,67.9,320.6,67.9z" />
                <path d="M813.4,114.5c-8.4,0-22-0.4-31.8-2.2v8.8c0,15.6,15.2,16.4,28,16.4c9,0,22-1.6,32.2-5.2c3.4,4.6,4.6,9.2,3.8,14.6c-11.4,6.4-24.8,10-40,10c-24.8,0-46.8-6-46.8-35.2v-13.6c0-14.4,2.8-35.4,8.6-49c13.4-7.2,26.4-10.8,38.4-10.8c26,0,44.6,8,44.6,35.2c0,7-1.8,21.2-4.8,28.6C836.8,113.1,824.8,114.5,813.4,114.5z M805.6,67.9c-6.8,0-13.2,1.8-19.8,5.2c-2,6-3.4,14.4-3.8,21.8c9,2.4,16.4,2.4,24,2.4c8.8,0,15.2-0.6,20.8-1.8c1.2-3.8,1.6-7.6,1.6-11.4C828.4,70.5,817.2,67.9,805.6,67.9z" />
                <path d="M750,138.9c-4.2,0.4-5.7,0.5-7.1,0.5c-11.6,0-23.6-0.7-23.6-16.8V72.3h26c2-6.4,2-13,0-19.4h-26V27.3c-7.2-1.8-14-1.8-20.4,0.2c-2.2,9.6-2.2,20.2-2.2,29.6v66.8c0,26.5,19.8,32.4,31.2,32.7c14,0.3,21.6-2.7,24.9-4.2c0,0,0.9-2.7,0.2-7.2C752.2,140.4,750,138.9,750,138.9z" />
                <path d="M530.3,48.3c-12,0-24.6,3.2-39.4,10.4c-6.4,15.2-7,39.2-7,54.4v8.6c0,29.2,21.4,35.2,45.4,35.2c8.8,0,16.8-2.2,24.2-5.8c-0.2,8.2-1.2,19-3,23.6c-6.4,3-14.2,4.4-21.8,4.4c-9.6,0-20.6-0.8-34-6.2c-3.8,4.6-6.2,10.8-7.2,17.2c15.2,6.6,26,8.4,41.4,8.4c19.2,0,31.2-5,41.2-10.8c4.4-13.8,6-31.8,6.4-49.6V83.5C576.5,55.1,556.1,48.3,530.3,48.3z M553.9,131.6c-4.2,3.4-13.2,5.7-23.5,5.7s-19.3-2.3-23.5-5.7V73.3c4.2-3.4,13.2-5.7,23.5-5.7s19.3,2.3,23.5,5.7V131.6z" />
                <path d="M636.7,48.3c-12,0-24.6,3.2-39.4,10.4c-6.4,15.2-7,39.2-7,54.4v7.8c0,29,24.6,34.8,37.6,34.8c13.4,0,26.2-4.6,33.4-12l1.8,9.8c7.2,1.4,12,1.6,18.2,0c0.8-6.4,1.6-16.8,1.6-27.8V83.5C682.9,55.1,662.5,48.3,636.7,48.3z M660.1,126.7c-4.2,3.4-13.2,8.8-23.5,8.8s-19.3-2.3-23.5-5.7V73.3c4.2-3.4,13.2-5.7,23.5-5.7s19.3,2.3,23.5,5.7V126.7z" />
                <path d="M467.9,5.9c-7.8-1.6-13.2-1.4-20.6,0v48c-5.6-4.2-14-5.6-23.4-5.6c-12,0-24.6,3.2-39.2,10.4c-5.6,13.2-6.8,34-7,48.2v14.8c0,29.2,21.4,35.2,46.2,35.2c15.2,0,28.4-3.8,39.6-10.8c6.4-16,6.6-46.4,6.6-52.8V28.7C470.1,21.1,470.1,13.5,467.9,5.9z M447.9,131.6c-4.2,3.4-13.2,5.7-23.5,5.7c-10.4,0-19.3-2.3-23.5-5.7V73.3c4.2-3.4,13.2-5.7,23.5-5.7c10.4,0,19.3,2.3,23.5,5.7V131.6z" />
              </g>
            </svg>
          </Box>
        </Toolbar>
      </AppBar>

      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} onOpen={() => setSettingsOpen(true)} />
    </>
  );
}
