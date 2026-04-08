import { useState, useRef, useCallback, useEffect } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import Tooltip from '@mui/material/Tooltip';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import InputAdornment from '@mui/material/InputAdornment';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import Link from '@mui/material/Link';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import BugReportIcon from '@mui/icons-material/BugReport';
import MergeIcon from '@mui/icons-material/CallMerge';
import ReviewsIcon from '@mui/icons-material/Reviews';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PreviewIcon from '@mui/icons-material/RemoveRedEye';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CommitIcon from '@mui/icons-material/Commit';
import { useRepoConfig } from '../../hooks/useRepoConfig';
import { useSettings, DEFAULT_SECTION_ORDER } from '../../hooks/useSettings';
import { useAuth } from '../../hooks/useAuth';
import { THEMES, THEME_NAMES } from '../../theme/themes';
import { BACKGROUNDS, THEME_DEFAULT_BACKGROUND } from '../../theme/backgrounds';
import { useThemeMode } from '../../theme/ThemeProvider';

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export function SettingsDialog({ open, onClose, onOpen }: SettingsDialogProps) {
  const { repos, addRepo, removeRepo, isValidating, error } = useRepoConfig();
  const { settings, updateSettings } = useSettings();
  const { mode, toggleTheme } = useThemeMode();
  const { token, login, isLoading: authLoading, error: authError } = useAuth();
  const [tab, setTab] = useState(0);
  const [notifEnabled, setNotifEnabled] = useState(() => localStorage.getItem('devdash-notifications') === 'true');
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
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 0 }}>Settings</DialogTitle>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="Visual" />
        <Tab label="Layout" />
        <Tab label="GitHub" />
        <Tab label="Thresholds" />
      </Tabs>
      <DialogContent sx={{ pt: 2.5, minHeight: 420 }}>

        {/* === VISUAL TAB === */}
        {tab === 0 && (
          <>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Appearance
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2.5 }}>
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

            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Theme
            </Typography>
            <ThemeSelector
              currentTheme={(settings.themeName || 'redgate') as ThemeName}
              mode={mode}
              onSelect={(name) => {
                const defaultBg = THEME_DEFAULT_BACKGROUND[name] ?? '';
                updateSettings({ themeName: name, backgroundId: defaultBg });
              }}
              onSettingsClose={onClose}
              onSettingsOpen={onOpen}
            />

            <Typography variant="subtitle2" sx={{ mb: 1, mt: 2 }}>
              Background
            </Typography>
            <BackgroundSelector
              currentBg={settings.backgroundId}
              onSelect={(id) => updateSettings({ backgroundId: id })}
            />

            <Typography variant="subtitle2" sx={{ mb: 1, mt: 2 }}>
              Display Modes
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <FormControlLabel
                control={<Switch size="small" checked={settings.focusMode} onChange={() => updateSettings({ focusMode: !settings.focusMode })} />}
                label="Focus mode — show only action items"
                slotProps={{ typography: { variant: 'body2', fontSize: '0.85rem' } }}
              />
              <FormControlLabel
                control={<Switch size="small" checked={settings.compactMode} onChange={() => updateSettings({ compactMode: !settings.compactMode })} />}
                label="Compact mode — smaller text and tighter spacing"
                slotProps={{ typography: { variant: 'body2', fontSize: '0.85rem' } }}
              />
              <FormControlLabel
                control={<Switch size="small" checked={settings.quietMode} onChange={() => updateSettings({ quietMode: !settings.quietMode })} />}
                label="Quiet mode — hide trends and commits"
                slotProps={{ typography: { variant: 'body2', fontSize: '0.85rem' } }}
              />
              <FormControlLabel
                control={<Switch size="small" checked={settings.autoCollapseEmpty} onChange={() => updateSettings({ autoCollapseEmpty: !settings.autoCollapseEmpty })} />}
                label="Auto-collapse empty sections"
                slotProps={{ typography: { variant: 'body2', fontSize: '0.85rem' } }}
              />
              <FormControlLabel
                control={<Switch size="small" checked={notifEnabled} onChange={() => {
                  const next = !notifEnabled;
                  setNotifEnabled(next);
                  localStorage.setItem('devdash-notifications', String(next));
                  if (next && 'Notification' in window && Notification.permission === 'default') {
                    Notification.requestPermission();
                  }
                }} />}
                label="Desktop notifications"
                slotProps={{ typography: { variant: 'body2', fontSize: '0.85rem' } }}
              />
            </Box>
          </>
        )}

        {/* === LAYOUT TAB === */}
        {tab === 1 && (
          <SectionOrderEditor />
        )}

        {/* === GITHUB TAB === */}
        {tab === 2 && (
          <>
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

            <Box component="form" onSubmit={handleAdd} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mb: 3 }}>
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

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Create a{' '}
              <Link href="https://github.com/settings/tokens/new?scopes=repo,read:project&description=DevDash" target="_blank" rel="noopener">
                new token
              </Link>
              {' '}with <strong>repo</strong> and <strong>read:project</strong> scopes.
            </Typography>

            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Daily Digest (Slack)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Set up <code>DIGEST_GITHUB_TOKEN</code>, <code>SLACK_WEBHOOK_URL</code> as repo secrets and{' '}
              <code>GITHUB_USERNAME</code>, <code>DIGEST_REPOS</code> as repo variables in your GitHub repo settings.
              The digest runs at 8 AM UTC on weekdays.
            </Typography>
          </>
        )}

        {/* === THRESHOLDS TAB === */}
        {tab === 3 && (
          <>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Stale Thresholds
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Configure when items are considered stale and appear in the action list.
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
          </>
        )}

      </DialogContent>
    </Dialog>
  );
}

// Theme groups for the picker
import type { ThemeName } from '../../theme/themes';

interface ThemeGroup {
  label: string;
  themes: ThemeName[];
}

const THEME_GROUPS: ThemeGroup[] = [
  { label: 'Featured', themes: ['redgate'] },
  { label: 'Design Systems', themes: ['ant', 'carbon', 'fluent', 'hig', 'glass', 'metro'] },
  { label: 'Editor Themes', themes: ['ayu', 'catppuccin', 'cobalt', 'dracula', 'everforest', 'gruvbox', 'kanagawa', 'material', 'monokai', 'nightowl', 'nord', 'onedark', 'palenight', 'rosepine', 'solarized', 'tokyonight', 'vitesse'] },
  { label: 'Operating Systems', themes: ['android', 'amiga', 'atari', 'blackberry', 'beos', 'chromeos', 'c64', 'gnome', 'haiku', 'hpux', 'ios', 'kde', 'aqua', 'macos9', 'mint', 'morphos', 'msdos', 'nextstep', 'openstep', 'os2', 'palmos', 'plan9', 'reactos', 'redhat', 'riscos', 'sailfish', 'solaris', 'symbian', 'templeos', 'tizen', 'tos', 'irix', 'ubuntu', 'webos', 'win10', 'win31', 'win95', 'vista', 'windowsphone', 'winxp', 'zxspectrum'] },
  { label: 'Vibes', themes: ['brutalist', 'cottagecore', 'cyberpunk', 'highcontrast', 'noir', 'paper', 'pastel', 'retrowave', 'solarpunk', 'steampunk', 'synthwave', 'terminal', 'vaporwave', 'y2k'] },
  { label: 'Web Sites', themes: ['amazon', 'discord', 'ebay', 'facebook', 'github_theme', 'linkedin', 'netflix', 'reddit', 'slack', 'spotify', 'stackoverflow', 'twitch', 'twitter', 'wikipedia', 'youtube'] },
  { label: 'Media', themes: ['ateam', 'barbie', 'batman', 'ghostbusters', 'jurassicpark', 'matrix', 'simpsons', 'spongebob', 'starwars', 'tron'] },
];

function ThemeSelector({ currentTheme, mode, onSelect, onSettingsClose, onSettingsOpen }: { currentTheme: ThemeName; mode: 'light' | 'dark'; onSelect: (name: ThemeName) => void; onSettingsClose: () => void; onSettingsOpen: () => void }) {
  const [open, setOpen] = useState(false);
  const savedTheme = useRef<ThemeName>(currentTheme);
  const previewingName = useRef<ThemeName | null>(null);
  const [countdown, setCountdown] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Lifted state so it survives dialog close/reopen during preview
  const [groupTab, setGroupTab] = useState(0);
  const [search, setSearch] = useState('');
  const scrollPos = useRef(0);
  const t = THEMES[currentTheme];
  const displayLabel = t.label.replace(/^(Design System|Editor|OS|Vibe|Web Site) - /, '');

  const isPreviewing = countdown > 0;

  const clearPreviewTimer = useCallback(() => {
    if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }
    setCountdown(0);
    previewingName.current = null;
  }, []);

  // Cleanup on unmount
  useEffect(() => () => clearPreviewTimer(), [clearPreviewTimer]);

  const revertPreview = useCallback(() => {
    clearPreviewTimer();
    onSelect(savedTheme.current);
    onSettingsOpen();
    setTimeout(() => setOpen(true), 100);
  }, [clearPreviewTimer, onSelect, onSettingsOpen]);

  const keepPreview = useCallback(() => {
    // Theme is already applied — just stop the countdown
    clearPreviewTimer();
  }, [clearPreviewTimer]);

  const handlePreview = useCallback((name: ThemeName) => {
    savedTheme.current = currentTheme;
    previewingName.current = name;
    onSelect(name);
    setOpen(false);
    onSettingsClose();
    setCountdown(5);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Time's up — revert
          if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }
          // Use setTimeout to avoid setState during render
          setTimeout(() => {
            previewingName.current = null;
            onSelect(savedTheme.current);
            onSettingsOpen();
            setTimeout(() => setOpen(true), 100);
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [currentTheme, onSelect, onSettingsClose, onSettingsOpen]);

  return (
    <>
      <Box
        onClick={() => setOpen(true)}
        sx={{
          display: 'flex', gap: 2, alignItems: 'center', p: 1.5,
          border: '1px solid', borderColor: 'divider', borderRadius: 1.5,
          cursor: 'pointer', mb: 1,
          '&:hover': { borderColor: 'primary.light', bgcolor: 'action.hover' },
          transition: 'all 0.15s',
        }}
      >
        <Box sx={{ width: 100, flexShrink: 0 }}>
          <ThemePreviewCard name={currentTheme} mode={mode} selected size="large" onSelect={() => {}} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{displayLabel}</Typography>
          <Typography variant="caption" color="text.secondary">{t.description}</Typography>
          <Typography variant="caption" color="primary" sx={{ display: 'block', mt: 0.5 }}>Click to change</Typography>
        </Box>
      </Box>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Choose Theme</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <ThemePicker
            currentTheme={currentTheme} mode={mode} onSelect={onSelect} onPreview={handlePreview}
            groupTab={groupTab} onGroupTabChange={setGroupTab}
            search={search} onSearchChange={setSearch}
            scrollPos={scrollPos}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Preview countdown toast */}
      <Snackbar
        open={isPreviewing}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Paper elevation={6} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5, borderRadius: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Reverting in {countdown}s
          </Typography>
          <Button size="small" variant="contained" color="primary" onClick={keepPreview}>
            Keep
          </Button>
          <Button size="small" variant="outlined" onClick={revertPreview}>
            Cancel
          </Button>
        </Paper>
      </Snackbar>
    </>
  );
}

function BackgroundSelector({ currentBg, onSelect }: { currentBg: string; onSelect: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const current = BACKGROUNDS.find((b) => b.id === currentBg);

  return (
    <>
      <Box
        onClick={() => setOpen(true)}
        sx={{
          display: 'flex', gap: 2, alignItems: 'center', p: 1.5,
          border: '1px solid', borderColor: 'divider', borderRadius: 1.5,
          cursor: 'pointer', mb: 1,
          '&:hover': { borderColor: 'primary.light', bgcolor: 'action.hover' },
          transition: 'all 0.15s',
        }}
      >
        <Box
          sx={{
            width: 80, height: 50, borderRadius: 1, flexShrink: 0,
            bgcolor: 'action.hover',
            backgroundImage: current ? `url(${current.file})` : undefined,
            backgroundSize: 'cover', backgroundPosition: 'center',
            border: '1px solid', borderColor: 'divider',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {!current && <Typography variant="caption" color="text.secondary">None</Typography>}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{current?.label ?? 'No background'}</Typography>
          <Typography variant="caption" color="primary">Click to change</Typography>
        </Box>
      </Box>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Choose Background</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 1 }}>
            <Box
              onClick={() => { onSelect(''); setOpen(false); }}
              sx={{
                height: 70, borderRadius: 1, cursor: 'pointer',
                border: '2px solid', borderColor: !currentBg ? 'primary.main' : 'divider',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: 'action.hover',
                '&:hover': { borderColor: 'primary.light' },
                transition: 'all 0.15s',
              }}
            >
              <Typography variant="caption" color="text.secondary">None</Typography>
            </Box>
            {BACKGROUNDS.map((bg) => {
              const selected = currentBg === bg.id;
              return (
                <Tooltip key={bg.id} title={bg.label}>
                  <Box
                    onClick={() => { onSelect(bg.id); setOpen(false); }}
                    sx={{
                      height: 70, borderRadius: 1, cursor: 'pointer',
                      border: '2px solid', borderColor: selected ? 'primary.main' : 'transparent',
                      backgroundImage: `url(${bg.file})`, backgroundSize: 'cover', backgroundPosition: 'center',
                      '&:hover': { borderColor: 'primary.light', transform: 'scale(1.05)' },
                      transition: 'all 0.15s',
                    }}
                  />
                </Tooltip>
              );
            })}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function ThemePreviewCard({ name, mode, selected, onSelect, onPreview, size = 'small' }: { name: ThemeName; mode: 'light' | 'dark'; selected: boolean; onSelect: () => void; onPreview?: () => void; size?: 'small' | 'large' }) {
  const t = THEMES[name];
  const displayLabel = t.label.replace(/^(Design System|Editor|OS|Vibe) - /, '');
  const palette = mode === 'dark' ? t.dark.palette : t.light.palette;
  const bg = palette?.background?.default ?? '#fff';
  const paper = palette?.background?.paper ?? '#fff';
  const primary = palette?.primary?.main ?? '#1976d2';
  const textPrimary = palette?.text?.primary ?? '#000';
  const textSecondary = palette?.text?.secondary ?? '#666';
  const headerBg = t.custom.headerBg(mode);
  const brandBg = t.custom.brandBlockBg;
  const isLarge = size === 'large';
  const h = isLarge ? 100 : 72;

  return (
    <Tooltip title={t.description} placement="top" enterDelay={400}>
      <Box
        onClick={onSelect}
        sx={{
          cursor: 'pointer',
          borderRadius: 1.5,
          border: '2px solid',
          borderColor: selected ? 'primary.main' : 'divider',
          overflow: 'hidden',
          transition: 'all 0.15s',
          boxShadow: selected ? 3 : 0,
          transform: selected ? 'scale(1.02)' : 'scale(1)',
          position: 'relative',
          '&:hover': { borderColor: selected ? 'primary.main' : 'primary.light', transform: 'scale(1.04)', boxShadow: 2 },
          '&:hover .preview-btn': { opacity: 1 },
        }}
      >
        {/* Mini dashboard preview */}
        <Box sx={{ height: h, bgcolor: bg, position: 'relative', overflow: 'hidden' }}>
          {/* Header bar */}
          <Box sx={{ height: isLarge ? 14 : 10, bgcolor: headerBg, display: 'flex', alignItems: 'center', px: 0.5, gap: '2px' }}>
            <Box sx={{ width: isLarge ? 16 : 10, height: isLarge ? 5 : 3, borderRadius: 0.5, bgcolor: brandBg }} />
            <Box sx={{ flex: 1 }} />
            <Box sx={{ width: isLarge ? 4 : 3, height: isLarge ? 4 : 3, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.4)' }} />
          </Box>
          {/* Body */}
          <Box sx={{ display: 'flex', p: isLarge ? 0.75 : 0.5, gap: isLarge ? 0.75 : 0.5, height: `calc(100% - ${isLarge ? 14 : 10}px)` }}>
            {/* Sidebar */}
            <Box sx={{ width: isLarge ? 18 : 12, bgcolor: paper, borderRadius: `${Math.min(t.custom.cardBorderRadius, 4)}px`, display: 'flex', flexDirection: 'column', gap: '2px', p: '2px' }}>
              {[primary, textSecondary, textSecondary].map((c, i) => (
                <Box key={i} sx={{ height: isLarge ? 4 : 3, borderRadius: 0.5, bgcolor: c, opacity: i === 0 ? 0.9 : 0.25 }} />
              ))}
            </Box>
            {/* Main content */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: isLarge ? 0.5 : '3px' }}>
              {/* Summary cards row */}
              <Box sx={{ display: 'flex', gap: '3px' }}>
                {[primary, brandBg, textSecondary].map((c, i) => (
                  <Box key={i} sx={{ flex: 1, height: isLarge ? 14 : 10, bgcolor: paper, borderRadius: `${Math.min(t.custom.cardBorderRadius, 4)}px`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Box sx={{ width: '60%', height: isLarge ? 4 : 3, borderRadius: 0.5, bgcolor: c, opacity: 0.7 }} />
                  </Box>
                ))}
              </Box>
              {/* Content cards */}
              {[0.9, 0.5].map((opacity, i) => (
                <Box key={i} sx={{ flex: 1, bgcolor: paper, borderRadius: `${Math.min(t.custom.cardBorderRadius, 4)}px`, p: '3px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <Box sx={{ width: '50%', height: 3, borderRadius: 0.5, bgcolor: primary, opacity }} />
                  <Box sx={{ width: '80%', height: 2, borderRadius: 0.5, bgcolor: textPrimary, opacity: 0.15 }} />
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
        {/* Preview button */}
        {onPreview && (
          <IconButton
            className="preview-btn"
            size="small"
            onClick={(e) => { e.stopPropagation(); onPreview(); }}
            sx={{
              position: 'absolute', top: isLarge ? 16 : 12, right: 2,
              opacity: 0, transition: 'opacity 0.15s',
              bgcolor: 'rgba(0,0,0,0.5)', color: '#fff',
              width: isLarge ? 24 : 20, height: isLarge ? 24 : 20,
              '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
            }}
          >
            <PreviewIcon sx={{ fontSize: isLarge ? 14 : 12 }} />
          </IconButton>
        )}
        {/* Label */}
        <Box sx={{ px: 1, py: 0.5, bgcolor: selected ? 'primary.main' : 'background.paper', transition: 'background-color 0.15s' }}>
          <Typography
            variant="caption"
            noWrap
            sx={{
              display: 'block',
              fontWeight: selected ? 700 : 500,
              fontSize: isLarge ? '0.8rem' : '0.7rem',
              color: selected ? 'primary.contrastText' : 'text.primary',
              textAlign: 'center',
            }}
          >
            {displayLabel}
          </Typography>
        </Box>
      </Box>
    </Tooltip>
  );
}

function ThemePicker({ currentTheme, mode, onSelect, onPreview, groupTab, onGroupTabChange, search, onSearchChange, scrollPos }: {
  currentTheme: ThemeName; mode: 'light' | 'dark'; onSelect: (name: ThemeName) => void; onPreview?: (name: ThemeName) => void;
  groupTab: number; onGroupTabChange: (tab: number) => void;
  search: string; onSearchChange: (search: string) => void;
  scrollPos: React.MutableRefObject<number>;
}) {
  const gridRef = useRef<HTMLDivElement>(null);

  const query = search.trim().toLowerCase();
  const isSearching = query.length > 0;

  const activeGroup = THEME_GROUPS[groupTab];

  // Save scroll position on scroll, restore on mount
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    el.scrollTop = scrollPos.current;
    const handleScroll = () => { scrollPos.current = el.scrollTop; };
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [groupTab, isSearching]);

  return (
    <Box sx={{ mb: 2 }}>
      {/* Current theme preview */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Box sx={{ width: 140, flexShrink: 0 }}>
          <ThemePreviewCard name={currentTheme} mode={mode} selected size="large" onSelect={() => {}} />
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.25 }}>
            Current theme
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            {THEMES[currentTheme].label.replace(/^(Design System|Editor|OS|Vibe) - /, '')}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
            {THEMES[currentTheme].description}
          </Typography>
        </Box>
      </Box>

      {/* Search */}
      <TextField
        size="small" fullWidth placeholder="Search themes..."
        value={search} onChange={(e) => onSearchChange(e.target.value)}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18 }} /></InputAdornment> } }}
        sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { fontSize: '0.85rem' } }}
      />

      {/* Category tabs */}
      {!isSearching && (
        <Tabs
          value={groupTab}
          onChange={(_, v) => { scrollPos.current = 0; onGroupTabChange(v); }}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 0 }}
        >
          {THEME_GROUPS.map((group) => (
            <Tab key={group.label} label={`${group.label} (${group.themes.length})`} sx={{ textTransform: 'none', fontSize: '0.75rem', minHeight: 36, py: 0.5 }} />
          ))}
        </Tabs>
      )}

      {/* Theme grid */}
      <Box ref={gridRef} sx={{ border: '1px solid', borderColor: 'divider', borderTop: isSearching ? undefined : 'none', borderRadius: isSearching ? 1 : '0 0 4px 4px', maxHeight: 360, overflow: 'auto' }}>
        {isSearching ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 1, p: 1 }}>
            {THEME_NAMES.filter((name) => {
              const t = THEMES[name];
              return t.label.toLowerCase().includes(query) || t.description.toLowerCase().includes(query);
            }).map((name) => (
              <ThemePreviewCard key={name} name={name} mode={mode} selected={name === currentTheme} onSelect={() => onSelect(name)} onPreview={onPreview ? () => onPreview(name) : undefined} />
            ))}
          </Box>
        ) : (
          <Box sx={{ p: 1 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 1 }}>
              {activeGroup.themes.map((name) => (
                <ThemePreviewCard key={name} name={name} mode={mode} selected={name === currentTheme} onSelect={() => onSelect(name)} onPreview={onPreview ? () => onPreview(name) : undefined} />
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

const SECTION_META: Record<string, { label: string; icon: React.ReactNode }> = {
  'section-actions': { label: 'What should I do next?', icon: <PriorityHighIcon fontSize="small" /> },
  'section-issues': { label: 'My Issues', icon: <BugReportIcon fontSize="small" /> },
  'section-prs': { label: 'My Pull Requests', icon: <MergeIcon fontSize="small" /> },
  'section-reviews': { label: 'Reviews Requested', icon: <ReviewsIcon fontSize="small" /> },
  'section-awaiting': { label: 'PRs Awaiting Review', icon: <VisibilityIcon fontSize="small" /> },
  'section-trends': { label: 'Trends', icon: <TrendingUpIcon fontSize="small" /> },
  'section-commits': { label: 'My Recent Commits', icon: <CommitIcon fontSize="small" /> },
};

function SectionOrderEditor() {
  const { settings, updateSettings } = useSettings();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const order = settings.sectionOrder;
  const isDefault = order.every((id, i) => id === DEFAULT_SECTION_ORDER[i]) && order.length === DEFAULT_SECTION_ORDER.length;

  const handleDragStart = (index: number) => (e: React.DragEvent) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setOverIndex(index);
  };

  const handleDrop = (dropIndex: number) => (e: React.DragEvent) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null);
      setOverIndex(null);
      return;
    }
    const next = [...order];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(dropIndex, 0, moved);
    updateSettings({ sectionOrder: next });
    setDragIndex(null);
    setOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  const moveItem = (from: number, to: number) => {
    if (to < 0 || to >= order.length) return;
    const next = [...order];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    updateSettings({ sectionOrder: next });
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle2">Section Order</Typography>
        <Button
          size="small"
          startIcon={<RestartAltIcon />}
          disabled={isDefault}
          onClick={() => updateSettings({ sectionOrder: [...DEFAULT_SECTION_ORDER] })}
        >
          Reset
        </Button>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        Drag sections to reorder them on the dashboard. Number key shortcuts will update to match.
      </Typography>
      <List dense sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
        {order.map((id, index) => {
          const meta = SECTION_META[id];
          if (!meta) return null;
          const isDragging = dragIndex === index;
          const isOver = overIndex === index && dragIndex !== index;
          return (
            <ListItem
              key={id}
              draggable
              onDragStart={handleDragStart(index)}
              onDragOver={handleDragOver(index)}
              onDrop={handleDrop(index)}
              onDragEnd={handleDragEnd}
              secondaryAction={
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <IconButton size="small" disabled={index === 0} onClick={() => moveItem(index, index - 1)}>
                    <ExpandLessIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" disabled={index === order.length - 1} onClick={() => moveItem(index, index + 1)}>
                    <ExpandMoreIcon fontSize="small" />
                  </IconButton>
                </Box>
              }
              sx={{
                opacity: isDragging ? 0.4 : 1,
                borderTop: isOver ? '2px solid' : '2px solid transparent',
                borderColor: isOver ? 'primary.main' : 'transparent',
                cursor: 'grab',
                '&:active': { cursor: 'grabbing' },
                transition: 'all 0.1s',
                userSelect: 'none',
              }}
            >
              <ListItemIcon sx={{ minWidth: 28, color: 'text.secondary' }}>
                <DragIndicatorIcon fontSize="small" />
              </ListItemIcon>
              <ListItemIcon sx={{ minWidth: 32 }}>
                {meta.icon}
              </ListItemIcon>
              <ListItemText
                primary={meta.label}
                primaryTypographyProps={{ variant: 'body2', fontSize: '0.85rem' }}
                secondary={`Key: ${index + 1}`}
                secondaryTypographyProps={{ variant: 'caption', fontSize: '0.7rem' }}
              />
            </ListItem>
          );
        })}
      </List>
    </>
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
