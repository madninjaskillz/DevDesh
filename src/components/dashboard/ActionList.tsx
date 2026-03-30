import { useState } from 'react';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import MergeIcon from '@mui/icons-material/CallMerge';
import RateReviewIcon from '@mui/icons-material/RateReview';
import CommentIcon from '@mui/icons-material/Comment';
import ReviewsIcon from '@mui/icons-material/Reviews';
import ScheduleIcon from '@mui/icons-material/Schedule';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import type { ActionItem, ActionType, ActionSeverity } from '../../utils/actions';
import { colors } from '../../theme/colors';

const ICON_MAP: Record<ActionType, React.ReactNode> = {
  merge_approved: <MergeIcon sx={{ color: colors.green[5] }} />,
  address_review: <RateReviewIcon sx={{ color: colors.red.brand }} />,
  unresolved_comments: <CommentIcon sx={{ color: colors.orange[5] }} />,
  review_requested: <ReviewsIcon sx={{ color: colors.blue[5] }} />,
  stale_issue: <ScheduleIcon sx={{ color: colors.orange[5] }} />,
  stale_pr: <ScheduleIcon sx={{ color: colors.orange[5] }} />,
  missing_link: <LinkOffIcon sx={{ color: colors.gray[5] }} />,
};

const SEVERITY_BORDER: Record<ActionSeverity, string> = {
  critical: colors.red.brand,
  warning: colors.orange[5],
  info: colors.blue[5],
};

interface ActionListProps {
  items: ActionItem[];
  isLoading: boolean;
}

export function ActionList({ items, isLoading }: ActionListProps) {
  const [expanded, setExpanded] = useState(false);
  const displayCount = expanded ? items.length : 10;
  const visible = items.slice(0, displayCount);
  const hasMore = items.length > 10;

  if (isLoading) {
    return (
      <Paper sx={{ p: 2 }}>
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} height={48} sx={{ my: 0.5 }} />
        ))}
      </Paper>
    );
  }

  if (items.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">
          Nothing urgent right now. You're on top of things!
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 1 }}>
      <List dense disablePadding>
        {visible.map((item) => (
          <ListItemButton
            key={item.id}
            component="a"
            href={item.url}
            target="_blank"
            rel="noopener"
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
          </ListItemButton>
        ))}
      </List>

      {hasMore && (
        <Button
          size="small"
          onClick={() => setExpanded(!expanded)}
          endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          sx={{ mt: 0.5, ml: 1 }}
        >
          {expanded ? 'Show less' : `Show all (${items.length})`}
        </Button>
      )}
    </Paper>
  );
}
