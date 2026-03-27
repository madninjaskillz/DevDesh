import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useQueryClient } from '@tanstack/react-query';
import { useAssignedIssues, useOpenPRs, useDashboardSummary, useTrendData } from '../../api/queries';
import { SummaryCards } from './SummaryCards';
import { IssuesTable } from './IssuesTable';
import { PRsTable } from './PRsTable';
import { TrendChart } from './TrendChart';
import { GitHubApiError } from '../../api/github';

export function DashboardPage() {
  const queryClient = useQueryClient();
  const { issues, isLoading: issuesLoading, isError: issuesError, error: issuesErr } = useAssignedIssues();
  const { prs, isLoading: prsLoading, isError: prsError, error: prsErr } = useOpenPRs();

  const isLoading = issuesLoading || prsLoading;
  const summary = useDashboardSummary(issues, prs);
  const trendData = useTrendData(issues, prs, isLoading);

  const [lastRefresh, setLastRefresh] = useState(new Date());

  const handleRefresh = () => {
    queryClient.invalidateQueries();
    setLastRefresh(new Date());
  };

  const apiError = issuesErr ?? prsErr;
  const isRateLimited = apiError instanceof GitHubApiError && apiError.isRateLimited;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Dashboard
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {(issuesError || prsError) && (
        <Alert severity={isRateLimited ? 'warning' : 'error'} sx={{ mb: 2 }}>
          {isRateLimited
            ? `GitHub API rate limit reached. Resets at ${(apiError as GitHubApiError).rateLimitReset?.toLocaleTimeString() ?? 'unknown'}.`
            : `Failed to fetch data: ${apiError?.message ?? 'Unknown error'}`}
        </Alert>
      )}

      <SummaryCards {...summary} isLoading={isLoading} />

      <Typography variant="h6" sx={{ mb: 1.5, mt: 3 }}>
        My Issues
      </Typography>
      <IssuesTable issues={issues} isLoading={issuesLoading} />

      <Typography variant="h6" sx={{ mb: 1.5, mt: 4 }}>
        My Pull Requests
      </Typography>
      <PRsTable prs={prs} isLoading={prsLoading} />

      <Typography variant="h6" sx={{ mb: 1.5, mt: 4 }}>
        Trends
      </Typography>
      <TrendChart data={trendData} />
    </Box>
  );
}
