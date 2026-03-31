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
        position="static"
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
              px: 2.5,
              alignSelf: 'stretch',
              borderLeft: '1px solid rgba(255,255,255,0.1)',
              gap: 1,
            }}
          >
            {/* Redgate "R" mark */}
            <Box
              sx={{
                width: 18,
                height: 18,
                borderRadius: '3px',
                bgcolor: colors.red.brand,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography sx={{ color: colors.white, fontSize: '0.7rem', fontWeight: 700, lineHeight: 1 }}>
                R
              </Typography>
            </Box>
            <Typography
              sx={{
                color: 'rgba(255,255,255,0.6)',
                fontSize: '0.8rem',
                fontWeight: 300,
                letterSpacing: '0.08em',
                whiteSpace: 'nowrap',
                fontFamily: '"Roboto", "Helvetica Neue", Arial, sans-serif',
              }}
            >
              redgate
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
