import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Slider from '@mui/material/Slider';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import Link from '@mui/material/Link';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useRepoConfig } from '../../hooks/useRepoConfig';
import { useSettings } from '../../hooks/useSettings';
import { useAuth } from '../../hooks/useAuth';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { THEMES, THEME_NAMES } from '../../theme/themes';
import { BACKGROUNDS, THEME_DEFAULT_BACKGROUND } from '../../theme/backgrounds';
import { useThemeMode } from '../../theme/ThemeProvider';

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  const { repos, addRepo, removeRepo, isValidating, error } = useRepoConfig();
  const { settings, updateSettings } = useSettings();
  const { mode, toggleTheme } = useThemeMode();
  const { token, login, isLoading: authLoading, error: authError } = useAuth();
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [newToken, setNewToken] = useState('');
  const [tokenSaved, setTokenSaved] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!owner.trim() || !repo.trim()) return;
    await addRepo(owner.trim(), repo.trim());
    setOwner('');
    setRepo('');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Settings</DialogTitle>
      <DialogContent>
        {/* Appearance: mode toggle */}
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Appearance
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Button
            variant={mode === 'light' ? 'contained' : 'outlined'}
            size="small"
            startIcon={<LightModeIcon />}
            onClick={() => { if (mode !== 'light') toggleTheme(); }}
          >
            Light
          </Button>
          <Button
            variant={mode === 'dark' ? 'contained' : 'outlined'}
            size="small"
            startIcon={<DarkModeIcon />}
            onClick={() => { if (mode !== 'dark') toggleTheme(); }}
          >
            Dark
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
          Theme
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 1, mb: 2 }}>
          {THEME_NAMES.map((name) => {
            const selected = (settings.themeName || 'redgate') === name;
            return (
              <Box
                key={name}
                onClick={() => {
                  const defaultBg = THEME_DEFAULT_BACKGROUND[name] ?? '';
                  updateSettings({ themeName: name, backgroundId: defaultBg });
                }}
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  cursor: 'pointer',
                  border: '2px solid',
                  borderColor: selected ? 'primary.main' : 'divider',
                  bgcolor: selected ? 'action.selected' : 'transparent',
                  '&:hover': { borderColor: 'primary.light' },
                  transition: 'all 0.15s',
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {THEMES[name].label}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                  {THEMES[name].description}
                </Typography>
              </Box>
            );
          })}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
          Background
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 1, mb: 2 }}>
          <Box
            onClick={() => updateSettings({ backgroundId: '' })}
            sx={{
              height: 60,
              borderRadius: 1,
              cursor: 'pointer',
              border: '2px solid',
              borderColor: !settings.backgroundId ? 'primary.main' : 'divider',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'action.hover',
              '&:hover': { borderColor: 'primary.light' },
              transition: 'all 0.15s',
            }}
          >
            <Typography variant="caption" color="text.secondary">None</Typography>
          </Box>
          {BACKGROUNDS.map((bg) => {
            const selected = settings.backgroundId === bg.id;
            return (
              <Tooltip key={bg.id} title={bg.label}>
                <Box
                  onClick={() => updateSettings({ backgroundId: bg.id })}
                  sx={{
                    height: 60,
                    borderRadius: 1,
                    cursor: 'pointer',
                    border: '2px solid',
                    borderColor: selected ? 'primary.main' : 'transparent',
                    backgroundImage: `url(${bg.file})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    '&:hover': { borderColor: 'primary.light', transform: 'scale(1.05)' },
                    transition: 'all 0.15s',
                  }}
                />
              </Tooltip>
            );
          })}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Monitored Repositories
        </Typography>

        <List dense>
          {repos.map((r) => (
            <ListItem
              key={`${r.owner}/${r.repo}`}
              secondaryAction={
                <IconButton
                  edge="end"
                  onClick={() => removeRepo(r.owner, r.repo)}
                  disabled={repos.length <= 1}
                  size="small"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              }
            >
              <ListItemText
                primary={`${r.owner}/${r.repo}`}
                primaryTypographyProps={{ variant: 'body2', fontFamily: '"Roboto Mono", monospace' }}
              />
            </ListItem>
          ))}
        </List>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleAdd} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
          <TextField
            label="Owner"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            size="small"
            placeholder="red-gate"
            disabled={isValidating}
            sx={{ flex: 1 }}
          />
          <TextField
            label="Repository"
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
            size="small"
            placeholder="flyway-main"
            disabled={isValidating}
            sx={{ flex: 1 }}
          />
          <Button
            type="submit"
            variant="contained"
            size="small"
            disabled={isValidating || !owner.trim() || !repo.trim()}
            startIcon={isValidating ? <CircularProgress size={16} /> : <AddIcon />}
            sx={{ minWidth: 80, mt: 0.5 }}
          >
            Add
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          GitHub Token
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Current token: <code>{'•'.repeat(8)}{token?.slice(-4) ?? '????'}</code>
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mb: 1 }}>
          <TextField
            size="small"
            fullWidth
            type="password"
            placeholder="ghp_xxxxxxxxxxxx"
            value={newToken}
            onChange={(e) => { setNewToken(e.target.value); setTokenSaved(false); }}
            disabled={authLoading}
          />
          <Button
            variant="contained"
            size="small"
            disabled={authLoading || !newToken.trim() || tokenSaved}
            startIcon={tokenSaved ? <CheckCircleIcon /> : authLoading ? <CircularProgress size={16} /> : undefined}
            onClick={async () => {
              try {
                await login(newToken.trim());
                setNewToken('');
                setTokenSaved(true);
              } catch { /* error shown below */ }
            }}
            sx={{ minWidth: 90, mt: 0.5 }}
          >
            {tokenSaved ? 'Saved' : 'Update'}
          </Button>
        </Box>

        {authError && (
          <Alert severity="error" sx={{ mb: 1 }}>{authError}</Alert>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Create a{' '}
          <Link href="https://github.com/settings/tokens/new?scopes=repo,read:project&description=DevDash" target="_blank" rel="noopener">
            new token
          </Link>
          {' '}with <strong>repo</strong> and <strong>read:project</strong> scopes.
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" sx={{ mb: 2 }}>
          Stale Thresholds
        </Typography>

        <ThresholdSlider
          label="Issue idle (days)"
          value={settings.staleIssueDays}
          onChange={(v) => updateSettings({ staleIssueDays: v })}
          min={1}
          max={30}
        />
        <ThresholdSlider
          label="Unresolved comments (days)"
          value={settings.staleCommentDays}
          onChange={(v) => updateSettings({ staleCommentDays: v })}
          min={1}
          max={14}
        />
        <ThresholdSlider
          label="Approved PR not merged (days)"
          value={settings.stalePRApprovedDays}
          onChange={(v) => updateSettings({ stalePRApprovedDays: v })}
          min={1}
          max={7}
        />
        <ThresholdSlider
          label="Review request pending (days)"
          value={settings.staleReviewRequestDays}
          onChange={(v) => updateSettings({ staleReviewRequestDays: v })}
          min={1}
          max={14}
        />

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Daily Digest (Slack)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Set up <code>DIGEST_GITHUB_TOKEN</code>, <code>SLACK_WEBHOOK_URL</code> as repo secrets and{' '}
          <code>GITHUB_USERNAME</code>, <code>DIGEST_REPOS</code> as repo variables in your GitHub repo settings.
          The digest runs at 8 AM UTC on weekdays.
        </Typography>
      </DialogContent>
    </Dialog>
  );
}

function ThresholdSlider({ label, value, onChange, min, max }: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
}) {
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="body2">{label}</Typography>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>{value}d</Typography>
      </Box>
      <Slider
        value={value}
        onChange={(_, v) => onChange(v as number)}
        min={min}
        max={max}
        step={1}
        size="small"
        valueLabelDisplay="auto"
      />
    </Box>
  );
}
