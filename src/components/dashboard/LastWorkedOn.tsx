import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import type { DashboardCommit, DashboardPR } from '../../types/github';

interface LastWorkedOnProps {
  commits: DashboardCommit[];
  prs: DashboardPR[];
  isLoading: boolean;
}

export function LastWorkedOn({ commits, prs, isLoading }: LastWorkedOnProps) {
  if (isLoading || commits.length === 0) return null;

  // Find the most recent commit and match it to a PR or issue
  const latest = commits[0];
  const matchingPR = prs.find((pr) => pr.repoName === latest.repoName && pr.headRef && latest.message.includes(pr.headRef));
  const resumeItem = matchingPR ?? null;

  return (
    <Paper sx={{ p: 1.5, mb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <PlayArrowIcon sx={{ color: 'primary.main', fontSize: 20 }} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary">
          Last worked on
        </Typography>
        <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
          {resumeItem ? (
            <Link href={resumeItem.htmlUrl} target="_blank" rel="noopener" underline="hover">
              PR #{resumeItem.number}: {resumeItem.title}
            </Link>
          ) : (
            <Link href={latest.url} target="_blank" rel="noopener" underline="hover">
              {latest.message.split('\n')[0]}
            </Link>
          )}
        </Typography>
      </Box>
      <Chip label={latest.repoName} size="small" variant="outlined" />
    </Paper>
  );
}
