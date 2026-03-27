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
import DashboardIcon from '@mui/icons-material/Dashboard';
import { useThemeMode } from '../../theme/ThemeProvider';
import { useAuth } from '../../hooks/useAuth';
import { colors } from '../../theme/colors';

export function AppHeader() {
  const { mode, toggleTheme } = useThemeMode();
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <AppBar
      position="static"
      elevation={2}
      color="inherit"
      sx={{ backgroundColor: colors.gray[7], color: colors.white }}
    >
      <Toolbar variant="dense" sx={{ minHeight: 48 }}>
        <DashboardIcon sx={{ mr: 1, color: colors.red.brand, fontSize: 24 }} />
        <Typography
          variant="h6"
          noWrap
          sx={{ flexGrow: 1, fontWeight: 700, color: colors.white, fontSize: '1.1rem' }}
        >
          Dev
          <Box component="span" sx={{ color: colors.red.brand }}>
            Dash
          </Box>
        </Typography>

        <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
          <IconButton onClick={toggleTheme} sx={{ color: colors.white }}>
            {mode === 'light' ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}
          </IconButton>
        </Tooltip>

        {isAuthenticated && user && (
          <>
            <Tooltip title={user.login}>
              <Avatar
                src={user.avatar_url}
                alt={user.login}
                sx={{ width: 28, height: 28, ml: 1 }}
              />
            </Tooltip>
            <Tooltip title="Sign out">
              <IconButton onClick={logout} sx={{ color: colors.white, ml: 0.5 }}>
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
