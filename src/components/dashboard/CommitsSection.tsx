import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Skeleton from '@mui/material/Skeleton';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CommitIcon from '@mui/icons-material/Commit';
import { parseISO, isToday, isYesterday, format } from 'date-fns';
import type { DashboardCommit } from '../../types/github';
import { colors } from '../../theme/colors';

function groupByDay(commits: DashboardCommit[]): { label: string; commits: DashboardCommit[] }[] {
  const groups = new Map<string, DashboardCommit[]>();
  for (const commit of commits) {
    const date = parseISO(commit.date);
    let label: string;
    if (isToday(date)) label = 'Today';
    else if (isYesterday(date)) label = 'Yesterday';
    else label = format(date, 'dd MMM yyyy');
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(commit);
  }
  return [...groups.entries()].map(([label, commits]) => ({ label, commits }));
}

interface CommitsSectionProps {
  commits: DashboardCommit[];
  isLoading: boolean;
}

export function CommitsSection({ commits, isLoading }: CommitsSectionProps) {
  if (isLoading) {
    return (
      <Paper sx={{ p: 2 }}>
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} height={36} sx={{ my: 0.5 }} />
        ))}
      </Paper>
    );
  }

  if (commits.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">No commits in the last 30 days.</Typography>
      </Paper>
    );
  }

  const groups = groupByDay(commits);

  return (
    <Box>
      {groups.map((group) => (
        <Accordion key={group.label} defaultExpanded={group.label === 'Today' || group.label === 'Yesterday'} disableGutters>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle2">
              {group.label}
              <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                ({group.commits.length} commit{group.commits.length !== 1 ? 's' : ''})
              </Typography>
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0 }}>
            {group.commits.map((commit) => (
              <Box
                key={commit.sha}
                sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}
              >
                <CommitIcon sx={{ fontSize: 16, color: colors.gray[5] }} />
                <Link
                  href={commit.url}
                  target="_blank"
                  rel="noopener"
                  underline="hover"
                  variant="body2"
                  sx={{
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontFamily: '"Roboto Mono", monospace',
                    fontSize: '0.8rem',
                  }}
                >
                  {commit.message.split('\n')[0]}
                </Link>
                <Chip label={commit.repoName} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                  {format(parseISO(commit.date), 'HH:mm')}
                </Typography>
              </Box>
            ))}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}
