import { useState, useMemo } from 'react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Popper from '@mui/material/Popper';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import SearchIcon from '@mui/icons-material/Search';
import BugReportIcon from '@mui/icons-material/BugReport';
import MergeIcon from '@mui/icons-material/CallMerge';
import type { DashboardIssue, DashboardPR } from '../../types/github';

interface SearchBarProps {
  issues: DashboardIssue[];
  prs: DashboardPR[];
  onItemClick: (owner: string, repo: string, number: number, type: 'issue' | 'pr') => void;
}

interface SearchResult {
  type: 'issue' | 'pr';
  number: number;
  title: string;
  repoName: string;
  repoFullName: string;
  url: string;
}

export function SearchBar({ issues, prs, onItemClick }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const results = useMemo((): SearchResult[] => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];

    const isNumber = /^\d+$/.test(q) || /^#\d+$/.test(q);
    const num = parseInt(q.replace('#', ''), 10);

    const issueResults: SearchResult[] = issues
      .filter((i) => (isNumber ? i.number === num : i.title.toLowerCase().includes(q) || `#${i.number}`.includes(q)))
      .map((i) => ({ type: 'issue' as const, number: i.number, title: i.title, repoName: i.repoName, repoFullName: i.repoFullName, url: i.htmlUrl }));

    const prResults: SearchResult[] = prs
      .filter((p) => (isNumber ? p.number === num : p.title.toLowerCase().includes(q) || `#${p.number}`.includes(q)))
      .map((p) => ({ type: 'pr' as const, number: p.number, title: p.title, repoName: p.repoName, repoFullName: p.repoFullName, url: p.htmlUrl }));

    return [...issueResults, ...prResults].slice(0, 10);
  }, [query, issues, prs]);

  const open = results.length > 0 && !!anchorEl;

  return (
    <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
      <Box sx={{ mb: 2 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Search issues and PRs... (by title or #number)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={(e) => setAnchorEl(e.currentTarget)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
        <Popper open={open} anchorEl={anchorEl} placement="bottom-start" sx={{ zIndex: 1300, width: anchorEl?.clientWidth }}>
          <Paper elevation={8} sx={{ mt: 0.5, maxHeight: 400, overflow: 'auto' }}>
            <List dense disablePadding>
              {results.map((r) => (
                <ListItemButton
                  key={`${r.type}-${r.repoFullName}-${r.number}`}
                  onClick={() => {
                    const [owner, repo] = r.repoFullName.split('/');
                    onItemClick(owner, repo, r.number, r.type);
                    setQuery('');
                    setAnchorEl(null);
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    {r.type === 'issue' ? <BugReportIcon fontSize="small" /> : <MergeIcon fontSize="small" />}
                  </ListItemIcon>
                  <ListItemText
                    primary={`#${r.number} ${r.title}`}
                    primaryTypographyProps={{ variant: 'body2', noWrap: true }}
                  />
                  <Chip label={r.repoName} size="small" variant="outlined" sx={{ ml: 1, height: 20, fontSize: '0.65rem' }} />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        </Popper>
      </Box>
    </ClickAwayListener>
  );
}
