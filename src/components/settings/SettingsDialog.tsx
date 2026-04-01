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
import Slider from '@mui/material/Slider';
import Tooltip from '@mui/material/Tooltip';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import InputAdornment from '@mui/material/InputAdornment';
import Collapse from '@mui/material/Collapse';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import Link from '@mui/material/Link';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useRepoConfig } from '../../hooks/useRepoConfig';
import { useSettings } from '../../hooks/useSettings';
import { useAuth } from '../../hooks/useAuth';
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
  const [tab, setTab] = useState(0);
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
      <DialogTitle sx={{ pb: 0 }}>Settings</DialogTitle>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="Visual" />
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

            <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
              Theme
            </Typography>
            <ThemePicker
              currentTheme={(settings.themeName || 'redgate') as any}
              mode={mode}
              onSelect={(name) => {
                const defaultBg = THEME_DEFAULT_BACKGROUND[name] ?? '';
                updateSettings({ themeName: name, backgroundId: defaultBg });
              }}
            />

            <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
              Background
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 1 }}>
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
          </>
        )}

        {/* === GITHUB TAB === */}
        {tab === 1 && (
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
        {tab === 2 && (
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
  { label: 'Editor Themes', themes: ['catppuccin', 'dracula', 'gruvbox', 'monokai', 'nord', 'onedark', 'solarized'] },
  { label: 'Operating Systems', themes: ['android', 'amiga', 'beos', 'chromeos', 'c64', 'gnome', 'ios', 'aqua', 'macos9', 'sonoma', 'msdos', 'nextstep', 'os2', 'palmos', 'irix', 'ubuntu', 'win31', 'win95', 'vista', 'winxp'] },
  { label: 'Vibes', themes: ['cyberpunk', 'highcontrast', 'paper', 'synthwave', 'terminal', 'vaporwave'] },
];

function ThemeItem({ name, mode, selected, onSelect }: { name: ThemeName; mode: 'light' | 'dark'; selected: boolean; onSelect: () => void }) {
  const t = THEMES[name];
  // Strip group prefix from label for display
  const displayLabel = t.label.replace(/^(Design System|Editor|OS|Vibe) - /, '');
  return (
    <Box
      onClick={onSelect}
      sx={{
        display: 'flex', alignItems: 'center', gap: 1.5, py: 0.75, px: 1.5, cursor: 'pointer',
        borderRadius: 1, border: '2px solid', borderColor: selected ? 'primary.main' : 'transparent',
        bgcolor: selected ? 'action.selected' : 'transparent',
        '&:hover': { bgcolor: 'action.hover' }, transition: 'all 0.1s',
      }}
    >
      <Box sx={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
        <Box sx={{ width: 12, height: 12, borderRadius: '2px', bgcolor: t.custom.brandBlockBg }} />
        <Box sx={{ width: 12, height: 12, borderRadius: '2px', bgcolor: t.custom.headerBg(mode), border: '1px solid rgba(128,128,128,0.3)' }} />
        <Box sx={{ width: 12, height: 12, borderRadius: '2px', bgcolor: mode === 'dark' ? t.dark.palette?.background?.paper : t.light.palette?.background?.paper, border: '1px solid rgba(128,128,128,0.3)' }} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: selected ? 700 : 500, fontSize: '0.8rem' }} noWrap>
          {displayLabel}
        </Typography>
      </Box>
    </Box>
  );
}

function ThemePicker({ currentTheme, mode, onSelect }: { currentTheme: ThemeName; mode: 'light' | 'dark'; onSelect: (name: ThemeName) => void }) {
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());

  const toggleGroup = (label: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label); else next.add(label);
      return next;
    });
  };

  const query = search.trim().toLowerCase();
  const isSearching = query.length > 0;

  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 2, maxHeight: 320, overflow: 'auto' }}>
      {/* Search */}
      <Box sx={{ p: 1, borderBottom: '1px solid', borderColor: 'divider', position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 1 }}>
        <TextField
          size="small" fullWidth placeholder="Search themes..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18 }} /></InputAdornment> } }}
          sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.85rem' } }}
        />
      </Box>

      {isSearching ? (
        // Flat filtered list
        <Box sx={{ p: 0.5 }}>
          {THEME_NAMES.filter((name) => {
            const t = THEMES[name];
            return t.label.toLowerCase().includes(query) || t.description.toLowerCase().includes(query);
          }).map((name) => (
            <ThemeItem key={name} name={name} mode={mode} selected={name === currentTheme} onSelect={() => onSelect(name)} />
          ))}
        </Box>
      ) : (
        // Grouped with collapsible headers
        <Box sx={{ p: 0.5 }}>
          {THEME_GROUPS.map((group) => (
            <Box key={group.label}>
              <Box
                onClick={() => toggleGroup(group.label)}
                sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', py: 0.5, px: 1, userSelect: 'none', '&:hover': { bgcolor: 'action.hover' }, borderRadius: 1 }}
              >
                {collapsed.has(group.label) ? <ExpandMoreIcon sx={{ fontSize: 18, mr: 0.5 }} /> : <ExpandLessIcon sx={{ fontSize: 18, mr: 0.5 }} />}
                <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', fontSize: '0.7rem' }}>
                  {group.label}
                </Typography>
                <Typography variant="caption" sx={{ ml: 0.5, color: 'text.secondary', fontSize: '0.65rem' }}>
                  ({group.themes.length})
                </Typography>
              </Box>
              <Collapse in={!collapsed.has(group.label)}>
                {group.themes.map((name) => (
                  <ThemeItem key={name} name={name} mode={mode} selected={name === currentTheme} onSelect={() => onSelect(name)} />
                ))}
              </Collapse>
            </Box>
          ))}
        </Box>
      )}
    </Box>
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
