import { useState } from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import BugReportIcon from '@mui/icons-material/BugReport';
import MergeIcon from '@mui/icons-material/CallMerge';
import ReviewsIcon from '@mui/icons-material/Reviews';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CommitIcon from '@mui/icons-material/Commit';
import { colors } from '../../theme/colors';

export const SIDEBAR_WIDTH_EXPANDED = 200;
export const SIDEBAR_WIDTH_COLLAPSED = 48;

const STORAGE_KEY = 'devdash-sidebar-collapsed';

interface SidebarSection {
  id: string;
  label: string;
  shortcut: string;
  icon: React.ReactNode;
  badgeKey: string;
}

const sections: SidebarSection[] = [
  { id: 'section-actions', label: 'Actions', shortcut: '1', icon: <PriorityHighIcon fontSize="small" />, badgeKey: 'actions' },
  { id: 'section-issues', label: 'Issues', shortcut: '2', icon: <BugReportIcon fontSize="small" />, badgeKey: 'issues' },
  { id: 'section-prs', label: 'Pull Requests', shortcut: '3', icon: <MergeIcon fontSize="small" />, badgeKey: 'prs' },
  { id: 'section-reviews', label: 'Reviews', shortcut: '4', icon: <ReviewsIcon fontSize="small" />, badgeKey: 'reviews' },
  { id: 'section-awaiting', label: 'Awaiting Review', shortcut: '5', icon: <VisibilityIcon fontSize="small" />, badgeKey: 'awaiting' },
  { id: 'section-trends', label: 'Trends', shortcut: '6', icon: <TrendingUpIcon fontSize="small" />, badgeKey: 'trends' },
  { id: 'section-commits', label: 'Commits', shortcut: '7', icon: <CommitIcon fontSize="small" />, badgeKey: 'commits' },
];

export interface SidebarBadges {
  actions?: number;
  issues?: number;
  prs?: number;
  reviews?: number;
  awaiting?: number;
  trends?: number;
  commits?: number;
}

interface SidebarProps {
  badges?: SidebarBadges;
}

export function Sidebar({ badges = {} }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(STORAGE_KEY) === 'true');

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  };

  const handleClick = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const width = collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;

  return (
    <Box
      component="nav"
      sx={{
        width,
        flexShrink: 0,
        position: 'sticky',
        top: 56,
        alignSelf: 'flex-start',
        maxHeight: 'calc(100vh - 56px)',
        overflow: 'auto',
        display: { xs: 'none', lg: 'block' },
        transition: 'width 0.2s ease',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: collapsed ? 'center' : 'flex-end', mb: 0.5 }}>
        <IconButton onClick={toggle} size="small">
          {collapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
        </IconButton>
      </Box>

      <Divider sx={{ mb: 0.5 }} />

      <List dense disablePadding>
        {sections.map((s) => {
          const count = badges[s.badgeKey as keyof SidebarBadges] ?? 0;
          const icon = count > 0 ? (
            <Badge
              badgeContent={count}
              color="primary"
              max={99}
              sx={{
                '& .MuiBadge-badge': {
                  fontSize: '0.6rem',
                  height: 16,
                  minWidth: 16,
                  padding: '0 3px',
                },
              }}
            >
              {s.icon}
            </Badge>
          ) : (
            s.icon
          );

          if (collapsed) {
            return (
              <Tooltip key={s.id} title={`${s.label}${count > 0 ? ` (${count})` : ''}`} placement="right">
                <ListItemButton
                  onClick={() => handleClick(s.id)}
                  sx={{ borderRadius: 1, py: 0.75, mb: 0.25, justifyContent: 'center', px: 0 }}
                >
                  <ListItemIcon sx={{ minWidth: 'auto' }}>{icon}</ListItemIcon>
                </ListItemButton>
              </Tooltip>
            );
          }

          return (
            <ListItemButton
              key={s.id}
              onClick={() => handleClick(s.id)}
              sx={{ borderRadius: 1, py: 0.5, mb: 0.25 }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>{icon}</ListItemIcon>
              <ListItemText
                primary={s.label}
                primaryTypographyProps={{ variant: 'body2', fontSize: '0.8rem', noWrap: true }}
              />
              <Typography variant="caption" sx={{ color: colors.gray[5], fontFamily: '"Roboto Mono", monospace', fontSize: '0.65rem' }}>
                {s.shortcut}
              </Typography>
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}
