import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useQueryClient } from '@tanstack/react-query';
import { useAssignedIssues, useOpenPRs, useReviewRequests, useDashboardSummary, useTrendData, useActivityFeed, useRecentCommits } from '../../api/queries';
import { SummaryCards } from './SummaryCards';
import { StaleAlerts } from './StaleAlerts';
import { ActionList } from './ActionList';
import { IssuesTable } from './IssuesTable';
import { PRsTable } from './PRsTable';
import { ReviewRequestsTable } from './ReviewRequestsTable';
import { TrendChart } from './TrendChart';
import { ActivityTimeline } from './ActivityTimeline';
import { CommitsSection } from './CommitsSection';
import { DetailDrawer, type DrawerItem } from './DetailDrawer';
import { ShortcutsDialog } from './ShortcutsDialog';
import { GitHubApiError } from '../../api/github';
import { computeActionItems } from '../../utils/actions';
import { useNotifications } from '../../hooks/useNotifications';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useThemeMode } from '../../theme/ThemeProvider';
import type { DashboardPR, MissingIssueLink } from '../../types/github';

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function DashboardPage() {
  const queryClient = useQueryClient();
  const { issues, isLoading: issuesLoading, isError: issuesError, error: issuesErr } = useAssignedIssues();
  const { prs, isLoading: prsLoading, isError: prsError, error: prsErr } = useOpenPRs();
  const { requests: reviewRequests, isLoading: reviewsLoading } = useReviewRequests();
  const { trendData, isLoading: trendLoading } = useTrendData();
  const { events, isLoading: eventsLoading } = useActivityFeed();
  const { commits, isLoading: commitsLoading } = useRecentCommits();

  const isLoading = issuesLoading || prsLoading;
  const summary = useDashboardSummary(issues, prs);

  // Compute missing issue links
  const prsWithMissingLinks: DashboardPR[] = useMemo(() => {
    if (isLoading) return prs;
    return prs.map((pr) => {
      const missingIssueLinks: MissingIssueLink[] = [];
      for (const issue of issues) {
        const issueRefersToThisPR = issue.linkedPRs.some(
          (linkedPR) => linkedPR.number === pr.number && linkedPR.repoName === pr.repoName,
        );
        if (!issueRefersToThisPR) continue;
        const prLinksBackToIssue = pr.linkedIssues.some(
          (linkedIssue) => linkedIssue.number === issue.number && linkedIssue.repoName === issue.repoName,
        );
        if (prLinksBackToIssue) continue;
        missingIssueLinks.push({
          issueNumber: issue.number,
          issueTitle: issue.title,
          issueUrl: issue.htmlUrl,
          issueRepoFullName: issue.repoFullName,
        });
      }
      return { ...pr, missingIssueLinks };
    });
  }, [prs, issues, isLoading]);

  // Compute action items
  const actionItems = useMemo(
    () => computeActionItems(prsWithMissingLinks, issues, reviewRequests),
    [prsWithMissingLinks, issues, reviewRequests],
  );

  const [drawerItem, setDrawerItem] = useState<DrawerItem | null>(null);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const { toggleTheme } = useThemeMode();

  // Notifications
  useNotifications(prsWithMissingLinks, issues, reviewRequests, isLoading || reviewsLoading);

  // Keyboard shortcuts
  const shortcuts = useKeyboardShortcuts([
    { key: 'r', description: 'Refresh data', handler: () => handleRefresh() },
    { key: '1', description: 'Jump to Actions', handler: () => scrollTo('section-actions') },
    { key: '2', description: 'Jump to Issues', handler: () => scrollTo('section-issues') },
    { key: '3', description: 'Jump to PRs', handler: () => scrollTo('section-prs') },
    { key: '4', description: 'Jump to Reviews', handler: () => scrollTo('section-reviews') },
    { key: '5', description: 'Jump to Activity', handler: () => scrollTo('section-activity') },
    { key: '6', description: 'Jump to Trends', handler: () => scrollTo('section-trends') },
    { key: 'd', description: 'Toggle dark mode', handler: () => toggleTheme() },
    { key: '?', description: 'Show shortcuts', handler: () => setShortcutsOpen(true) },
  ]);

  const handleItemClick = (owner: string, repo: string, number: number, type: 'issue' | 'pr') => {
    setDrawerItem({ type, owner, repo, number });
  };

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

      <StaleAlerts items={actionItems} />

      <Box id="section-actions">
        <ActionList items={actionItems} isLoading={isLoading || reviewsLoading} />
      </Box>

      <Typography id="section-issues" variant="h6" sx={{ mb: 1.5 }}>
        My Issues
      </Typography>
      <IssuesTable issues={issues} isLoading={issuesLoading} onItemClick={(o, r, n) => handleItemClick(o, r, n, 'issue')} />

      <Typography id="section-prs" variant="h6" sx={{ mb: 1.5, mt: 4 }}>
        My Pull Requests
      </Typography>
      <PRsTable prs={prsWithMissingLinks} isLoading={prsLoading} onItemClick={(o, r, n) => handleItemClick(o, r, n, 'pr')} />

      {(reviewRequests.length > 0 || reviewsLoading) && (
        <>
          <Typography id="section-reviews" variant="h6" sx={{ mb: 1.5, mt: 4 }}>
            Reviews Requested
          </Typography>
          <ReviewRequestsTable requests={reviewRequests} isLoading={reviewsLoading} />
        </>
      )}

      <Typography id="section-activity" variant="h6" sx={{ mb: 1.5, mt: 4 }}>
        Activity (Last 48h)
      </Typography>
      <ActivityTimeline events={events} isLoading={eventsLoading} />

      <Typography id="section-trends" variant="h6" sx={{ mb: 1.5, mt: 4 }}>
        Trends
      </Typography>
      <TrendChart data={trendData} isLoading={trendLoading} />

      <Typography variant="h6" sx={{ mb: 1.5, mt: 4 }}>
        My Recent Commits
      </Typography>
      <CommitsSection commits={commits} isLoading={commitsLoading} />

      <DetailDrawer
        open={!!drawerItem}
        onClose={() => setDrawerItem(null)}
        item={drawerItem}
      />

      <ShortcutsDialog
        open={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
        shortcuts={shortcuts}
      />
    </Box>
  );
}
