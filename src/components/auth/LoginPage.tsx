import { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { useAuth } from '../../hooks/useAuth';
import { colors } from '../../theme/colors';

export function LoginPage() {
  const { login, isLoading, error } = useAuth();
  const [token, setToken] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;
    try {
      await login(token.trim());
    } catch {
      // Error is handled in useAuth
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Card sx={{ maxWidth: 440, width: '100%', mx: 2, p: 3 }}>
        <CardContent>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <DashboardIcon sx={{ fontSize: 48, color: colors.red.brand, mb: 1 }} />
            <Typography variant="h5" gutterBottom>
              Dev<Box component="span" sx={{ color: colors.red.brand }}>Dash</Box>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Connect your GitHub account to get started
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="GitHub Personal Access Token"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxx"
              disabled={isLoading}
              sx={{ mb: 2 }}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isLoading || !token.trim()}
              sx={{ mb: 2 }}
            >
              {isLoading ? <CircularProgress size={20} /> : 'Connect'}
            </Button>
          </form>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Create a{' '}
            <Link
              href="https://github.com/settings/tokens/new?scopes=repo&description=DevDash"
              target="_blank"
              rel="noopener"
            >
              Personal Access Token
            </Link>{' '}
            with the <strong>repo</strong> scope. Your token is stored only in this browser's
            localStorage.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
