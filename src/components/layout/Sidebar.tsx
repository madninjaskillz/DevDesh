import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import BugReportIcon from '@mui/icons-material/BugReport';
import MergeIcon from '@mui/icons-material/CallMerge';
import ReviewsIcon from '@mui/icons-material/Reviews';
import TimelineIcon from '@mui/icons-material/Timeline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CommitIcon from '@mui/icons-material/Commit';
import { colors } from '../../theme/colors';

export const SIDEBAR_WIDTH = 200;

interface SidebarSection {
  id: string;
  label: string;
  shortcut: string;
  icon: React.ReactNode;
}

const sections: SidebarSection[] = [
  { id: 'section-actions', label: 'Actions', shortcut: '1', icon: <PriorityHighIcon fontSize="small" /> },
  { id: 'section-issues', label: 'Issues', shortcut: '2', icon: <BugReportIcon fontSize="small" /> },
  { id: 'section-prs', label: 'Pull Requests', shortcut: '3', icon: <MergeIcon fontSize="small" /> },
  { id: 'section-reviews', label: 'Reviews', shortcut: '4', icon: <ReviewsIcon fontSize="small" /> },
  { id: 'section-activity', label: 'Activity', shortcut: '5', icon: <TimelineIcon fontSize="small" /> },
  { id: 'section-trends', label: 'Trends', shortcut: '6', icon: <TrendingUpIcon fontSize="small" /> },
  { id: 'section-commits', label: 'Commits', shortcut: '7', icon: <CommitIcon fontSize="small" /> },
];

export function Sidebar() {
  const handleClick = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <Box
      component="nav"
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        position: 'sticky',
        top: 56,
        alignSelf: 'flex-start',
        maxHeight: 'calc(100vh - 56px)',
        overflow: 'auto',
        display: { xs: 'none', lg: 'block' },
      }}
    >
      <List dense disablePadding>
        {sections.map((s) => (
          <ListItemButton
            key={s.id}
            onClick={() => handleClick(s.id)}
            sx={{ borderRadius: 1, py: 0.5, mb: 0.25 }}
          >
            <ListItemIcon sx={{ minWidth: 28 }}>{s.icon}</ListItemIcon>
            <ListItemText
              primary={s.label}
              primaryTypographyProps={{ variant: 'body2', fontSize: '0.8rem' }}
            />
            <Typography variant="caption" sx={{ color: colors.gray[5], fontFamily: '"Roboto Mono", monospace', fontSize: '0.65rem' }}>
              {s.shortcut}
            </Typography>
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}
