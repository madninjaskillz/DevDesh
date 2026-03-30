import { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Chip from '@mui/material/Chip';
import MergeIcon from '@mui/icons-material/CallMerge';
import RateReviewIcon from '@mui/icons-material/RateReview';
import CommentIcon from '@mui/icons-material/Comment';
import ReviewsIcon from '@mui/icons-material/Reviews';
import ScheduleIcon from '@mui/icons-material/Schedule';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
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
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Skeleton width={250} height={32} />
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} height={48} sx={{ my: 0.5 }} />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <PriorityHighIcon sx={{ color: colors.green[5] }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              What should I do next?
            </Typography>
          </Box>
          <Typography color="text.secondary">
            Nothing urgent right now. You're on top of things!
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <PriorityHighIcon sx={{ color: colors.red.brand }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            What should I do next?
          </Typography>
          <Chip label={items.length} size="small" color="error" />
        </Box>

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
            sx={{ mt: 1 }}
          >
            {expanded ? 'Show less' : `Show all (${items.length})`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
