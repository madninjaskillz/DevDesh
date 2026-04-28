import { useState, useRef } from 'react';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import MergeIcon from '@mui/icons-material/CallMerge';
import RateReviewIcon from '@mui/icons-material/RateReview';
import CommentIcon from '@mui/icons-material/Comment';
import ReviewsIcon from '@mui/icons-material/Reviews';
import ScheduleIcon from '@mui/icons-material/Schedule';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import EventIcon from '@mui/icons-material/Event';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SnoozeIcon from '@mui/icons-material/Snooze';
import type { ActionItem, ActionType, ActionSeverity } from '../../utils/actions';
import type { UseSnoozeReturn } from '../../hooks/useSnooze';
import { colors } from '../../theme/colors';

const ICON_MAP: Record<ActionType, React.ReactNode> = {
  merge_approved: <MergeIcon sx={{ color: colors.green[5] }} />,
  address_review: <RateReviewIcon sx={{ color: colors.red.brand }} />,
  unresolved_comments: <CommentIcon sx={{ color: colors.orange[5] }} />,
  review_requested: <ReviewsIcon sx={{ color: colors.blue[5] }} />,
  stale_issue: <ScheduleIcon sx={{ color: colors.orange[5] }} />,
  stale_pr: <ScheduleIcon sx={{ color: colors.orange[5] }} />,
  missing_link: <LinkOffIcon sx={{ color: colors.gray[5] }} />,
  meeting: <EventIcon sx={{ color: colors.blue[5] }} />,
};

const SEVERITY_BORDER: Record<ActionSeverity, string> = {
  critical: colors.red.brand,
  warning: colors.orange[5],
  info: colors.blue[5],
};

const SNOOZE_OPTIONS = [
  { label: '1 day', days: 1 },
  { label: '3 days', days: 3 },
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
];

interface ActionListProps {
  items: ActionItem[];
  isLoading: boolean;
  snooze?: UseSnoozeReturn;
}

export function ActionList({ items, isLoading, snooze }: ActionListProps) {
  const [expanded, setExpanded] = useState(false);
  const [menuItemId, setMenuItemId] = useState<string | null>(null);
  const menuAnchor = useRef<HTMLElement | null>(null);

  const activeItems = snooze ? items.filter((item) => !snooze.isSnoozed(item.id)) : items;
  const displayCount = expanded ? activeItems.length : 10;
  const visible = activeItems.slice(0, displayCount);
  const hasMore = activeItems.length > 10;

  if (isLoading) {
    return (
      <Paper sx={{ p: 2 }}>
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} height={48} sx={{ my: 0.5 }} />
        ))}
      </Paper>
    );
  }

  if (activeItems.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">
          Nothing urgent right now. You're on top of things!
        </Typography>
        {snooze && snooze.snoozedCount > 0 && (
          <Button size="small" onClick={snooze.unsnoozeAll} sx={{ mt: 1 }}>
            Show {snooze.snoozedCount} snoozed
          </Button>
        )}
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 1 }}>
      <List dense disablePadding>
        {visible.map((item) => {
          const linkProps = item.url
            ? { component: 'a' as const, href: item.url, target: '_blank', rel: 'noopener' }
            : {};
          return (
          <ListItemButton
            key={item.id}
            {...linkProps}
            sx={{
              borderLeft: `4px solid ${SEVERITY_BORDER[item.severity]}`,
              mb: 0.5,
              borderRadius: 1,
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              {ICON_MAP[item.type]}
            </ListItemIcon>
            <ListItemText
              primary={item.title}
              secondary={item.description}
              primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
              secondaryTypographyProps={{ variant: 'caption' }}
            />
            {snooze && (
              <Tooltip title="Snooze">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    menuAnchor.current = e.currentTarget;
                    setMenuItemId(item.id);
                  }}
                  sx={{ ml: 1, opacity: 0.5, '&:hover': { opacity: 1 } }}
                >
                  <SnoozeIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            )}
          </ListItemButton>
          );
        })}
      </List>

      <Menu
        anchorEl={menuAnchor.current}
        open={!!menuItemId}
        onClose={() => setMenuItemId(null)}
      >
        {SNOOZE_OPTIONS.map((opt) => (
          <MenuItem
            key={opt.days}
            onClick={() => {
              if (menuItemId) snooze?.snooze(menuItemId, opt.days);
              setMenuItemId(null);
            }}
          >
            {opt.label}
          </MenuItem>
        ))}
      </Menu>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, ml: 1 }}>
        {hasMore && (
          <Button
            size="small"
            onClick={() => setExpanded(!expanded)}
            endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          >
            {expanded ? 'Show less' : `Show all (${activeItems.length})`}
          </Button>
        )}
        {snooze && snooze.snoozedCount > 0 && (
          <Button size="small" onClick={snooze.unsnoozeAll}>
            Show {snooze.snoozedCount} snoozed
          </Button>
        )}
      </Box>
    </Paper>
  );
}
