import { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import RefreshIcon from '@mui/icons-material/Refresh';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import DensitySmallIcon from '@mui/icons-material/DensitySmall';
import DensityMediumIcon from '@mui/icons-material/DensityMedium';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { useQueryClient } from '@tanstack/react-query';
import { useThemeMode } from '../../theme/ThemeProvider';
import { useAuth } from '../../hooks/useAuth';
import { useSettings } from '../../hooks/useSettings';
import { colors } from '../../theme/colors';
import { SettingsDialog } from '../settings/SettingsDialog';

function HeaderDivider() {
  return <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.15)', mx: 0.5 }} />;
}

export function AppHeader() {
  const { mode, toggleTheme } = useThemeMode();
  const { user, isAuthenticated, logout } = useAuth();
  const { settings, updateSettings } = useSettings();
  const queryClient = useQueryClient();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(() => localStorage.getItem('devdash-notifications') === 'true');

  const toggleNotifications = () => {
    const next = !notifEnabled;
    setNotifEnabled(next);
    localStorage.setItem('devdash-notifications', String(next));
    if (next && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries();
  };

  const toggleFocusMode = () => updateSettings({ focusMode: !settings.focusMode });
  const toggleQuietMode = () => updateSettings({ quietMode: !settings.quietMode });
  const toggleCompactMode = () => updateSettings({ compactMode: !settings.compactMode });

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        color="inherit"
        sx={{ backgroundColor: colors.gray[7], color: colors.white }}
      >
        <Toolbar variant="dense" sx={{ minHeight: 44, px: '0 !important', gap: 0 }}>
          {/* Brand block — colored background like Flyway Desktop */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: colors.red.brand,
              px: 2,
              alignSelf: 'stretch',
              gap: 1,
            }}
          >
            <DashboardIcon sx={{ color: colors.white, fontSize: 22 }} />
          </Box>

          {/* Product name */}
          <Typography
            noWrap
            sx={{
              fontWeight: 700,
              color: colors.white,
              fontSize: '0.95rem',
              px: 2,
              letterSpacing: '0.02em',
            }}
          >
            DevDash
          </Typography>

          <HeaderDivider />

          {/* Spacer */}
          <Box sx={{ flex: 1 }} />

          {isAuthenticated && (
            <>
              {/* View modes */}
              <Tooltip title="Refresh data (R)">
                <IconButton onClick={handleRefresh} size="small" sx={{ color: colors.white }}>
                  <RefreshIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title={settings.focusMode ? 'Exit focus mode (F)' : 'Focus mode (F)'}>
                <IconButton
                  onClick={toggleFocusMode}
                  size="small"
                  sx={{
                    color: settings.focusMode ? colors.red.brand : colors.white,
                    bgcolor: settings.focusMode ? 'rgba(204,0,0,0.2)' : 'transparent',
                  }}
                >
                  <CenterFocusStrongIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title={settings.quietMode ? 'Exit quiet mode (Q)' : 'Quiet mode (Q)'}>
                <IconButton
                  onClick={toggleQuietMode}
                  size="small"
                  sx={{
                    color: settings.quietMode ? colors.blue[4] : colors.white,
                    bgcolor: settings.quietMode ? 'rgba(103,169,241,0.2)' : 'transparent',
                  }}
                >
                  <VisibilityOffIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title={settings.compactMode ? 'Normal density' : 'Compact density'}>
                <IconButton onClick={toggleCompactMode} size="small" sx={{ color: colors.white }}>
                  {settings.compactMode ? <DensitySmallIcon sx={{ fontSize: 18 }} /> : <DensityMediumIcon sx={{ fontSize: 18 }} />}
                </IconButton>
              </Tooltip>

              <HeaderDivider />

              {/* Notifications & Settings */}
              <Tooltip title={notifEnabled ? 'Disable notifications' : 'Enable notifications'}>
                <IconButton onClick={toggleNotifications} size="small" sx={{ color: colors.white }}>
                  {notifEnabled ? <NotificationsIcon sx={{ fontSize: 18 }} /> : <NotificationsOffIcon sx={{ fontSize: 18 }} />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Settings">
                <IconButton onClick={() => setSettingsOpen(true)} size="small" sx={{ color: colors.white }}>
                  <SettingsIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
                <IconButton onClick={toggleTheme} size="small" sx={{ color: colors.white }}>
                  {mode === 'light' ? <DarkModeIcon sx={{ fontSize: 18 }} /> : <LightModeIcon sx={{ fontSize: 18 }} />}
                </IconButton>
              </Tooltip>

              <HeaderDivider />

              {/* User */}
              {user && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mx: 1 }}>
                  <Avatar src={user.avatar_url} alt={user.login} sx={{ width: 24, height: 24 }} />
                  <Typography variant="body2" sx={{ color: colors.white, fontSize: '0.8rem' }} noWrap>
                    {user.login}
                  </Typography>
                  <Tooltip title="Sign out">
                    <IconButton onClick={logout} size="small" sx={{ color: colors.white }}>
                      <LogoutIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </>
          )}

          {!isAuthenticated && (
            <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
              <IconButton onClick={toggleTheme} size="small" sx={{ color: colors.white, mr: 1 }}>
                {mode === 'light' ? <DarkModeIcon sx={{ fontSize: 18 }} /> : <LightModeIcon sx={{ fontSize: 18 }} />}
              </IconButton>
            </Tooltip>
          )}

          {/* Redgate branding — right edge */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              px: 2,
              alignSelf: 'stretch',
              borderLeft: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <svg viewBox="0 0 850.4 203.2" height="18" fill="rgba(255,255,255,0.55)">
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

      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
