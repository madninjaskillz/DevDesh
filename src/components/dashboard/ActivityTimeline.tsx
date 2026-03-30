import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Skeleton from '@mui/material/Skeleton';
import CommentIcon from '@mui/icons-material/Comment';
import RateReviewIcon from '@mui/icons-material/RateReview';
import MergeIcon from '@mui/icons-material/CallMerge';
import BugReportIcon from '@mui/icons-material/BugReport';
import CommitIcon from '@mui/icons-material/Commit';
import { formatDistanceToNow, parseISO, isToday, isYesterday, format } from 'date-fns';
import type { ActivityEvent } from '../../types/github';
import { colors } from '../../theme/colors';

function eventIcon(type: string) {
  if (type === 'IssueCommentEvent') return <CommentIcon sx={{ fontSize: 16, color: colors.blue[5] }} />;
  if (type === 'PullRequestReviewEvent') return <RateReviewIcon sx={{ fontSize: 16, color: colors.green[5] }} />;
  if (type === 'PullRequestEvent') return <MergeIcon sx={{ fontSize: 16, color: colors.blue[6] }} />;
  if (type === 'IssuesEvent') return <BugReportIcon sx={{ fontSize: 16, color: colors.red.brand }} />;
  if (type === 'PushEvent') return <CommitIcon sx={{ fontSize: 16, color: colors.gray[5] }} />;
  return <CommentIcon sx={{ fontSize: 16, color: colors.gray[5] }} />;
}

function groupByDay(events: ActivityEvent[]): { label: string; events: ActivityEvent[] }[] {
  const groups = new Map<string, ActivityEvent[]>();
  for (const evt of events) {
    const date = parseISO(evt.timestamp);
    let label: string;
    if (isToday(date)) label = 'Today';
    else if (isYesterday(date)) label = 'Yesterday';
    else label = format(date, 'dd MMM yyyy');
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(evt);
  }
  return [...groups.entries()].map(([label, events]) => ({ label, events }));
}

interface ActivityTimelineProps {
  events: ActivityEvent[];
  isLoading: boolean;
}

export function ActivityTimeline({ events, isLoading }: ActivityTimelineProps) {
  if (isLoading) {
    return (
      <Paper sx={{ p: 2 }}>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} height={40} sx={{ my: 0.5 }} />
        ))}
      </Paper>
    );
  }

  if (events.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">No recent activity in the last 48 hours.</Typography>
      </Paper>
    );
  }

  const groups = groupByDay(events);

  return (
    <Paper sx={{ p: 2 }}>
      {groups.map((group) => (
        <Box key={group.label} sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            {group.label}
          </Typography>
          {group.events.map((evt) => (
            <Box
              key={evt.id}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5,
                py: 0.75,
                borderLeft: `2px solid`,
                borderColor: 'divider',
                pl: 2,
                ml: 1,
              }}
            >
              <Box sx={{ mt: 0.25 }}>{eventIcon(evt.type)}</Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Link
                  href={evt.url}
                  target="_blank"
                  rel="noopener"
                  underline="hover"
                  variant="body2"
                  sx={{
                    display: 'block',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {evt.title}
                </Link>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                  <Avatar src={evt.actor.avatar_url} sx={{ width: 14, height: 14 }} />
                  <Typography variant="caption" color="text.secondary">
                    {evt.actor.login}
                  </Typography>
                  <Chip label={evt.repoName} size="small" variant="outlined" sx={{ height: 18, fontSize: '0.65rem' }} />
                  <Typography variant="caption" color="text.secondary">
                    {formatDistanceToNow(parseISO(evt.timestamp), { addSuffix: true })}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      ))}
    </Paper>
  );
}
