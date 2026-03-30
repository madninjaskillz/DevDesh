import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import { useQueryClient } from '@tanstack/react-query';
import { useAssignedIssues, useOpenPRs, useReviewRequests, useAwaitingReview, useDashboardSummary, useTrendData, useActivityFeed, useRecentCommits } from '../../api/queries';
import { SummaryCards } from './SummaryCards';
import { StaleAlerts } from './StaleAlerts';
import { ActionList } from './ActionList';
import { IssuesTable } from './IssuesTable';
import { PRsTable } from './PRsTable';
import { ReviewRequestsTable } from './ReviewRequestsTable';
import { AwaitingReviewTable } from './AwaitingReviewTable';
import { TrendChart } from './TrendChart';
import { ActivityTimeline } from './ActivityTimeline';
import { CommitsSection } from './CommitsSection';
import { DetailDrawer, type DrawerItem } from './DetailDrawer';
import { ShortcutsDialog } from './ShortcutsDialog';
import { CollapsibleSection } from './CollapsibleSection';
import { SectionErrorBoundary } from './ErrorBoundary';
import { LabelFilter, type GroupBy } from './LabelFilter';
import { StatusSummary } from './StatusSummary';
import { HealthBar } from './HealthBar';
import { LastVisitBanner } from './LastVisitBanner';
import { LastWorkedOn } from './LastWorkedOn';
import { WeeklySummary } from './WeeklySummary';
import { CalendarHeatmap } from './CalendarHeatmap';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import BugReportIcon from '@mui/icons-material/BugReport';
import MergeIcon from '@mui/icons-material/CallMerge';
import ReviewsIcon from '@mui/icons-material/Reviews';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TimelineIcon from '@mui/icons-material/Timeline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CommitIcon from '@mui/icons-material/Commit';
import { GitHubApiError } from '../../api/github';
import { computeActionItems } from '../../utils/actions';
import { useNotifications } from '../../hooks/useNotifications';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useThemeMode } from '../../theme/ThemeProvider';
import { useSettings } from '../../hooks/useSettings';
import { useNotes } from '../../hooks/useNotes';
import { Sidebar, type SidebarBadges } from '../layout/Sidebar';
import type { DashboardPR, MissingIssueLink } from '../../types/github';

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function DashboardPage() {
  const queryClient = useQueryClient();
  const { issues, isLoading: issuesLoading, isError: issuesError, error: issuesErr } = useAssignedIssues();
  const { prs, isLoading: prsLoading, isError: prsError, error: prsErr } = useOpenPRs();
  const { requests: reviewRequests, isLoading: reviewsLoading } = useReviewRequests();
  const { awaitingReview, isLoading: awaitingLoading } = useAwaitingReview();
  const { trendData, isLoading: trendLoading } = useTrendData();
  const { events, isLoading: eventsLoading } = useActivityFeed();
  const { commits, isLoading: commitsLoading } = useRecentCommits();
  const { settings, updateSettings } = useSettings();
  const notes = useNotes();

  const isLoading = issuesLoading || prsLoading;
  const summary = useDashboardSummary(issues, prs);

  // Missing issue links
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

  // Action items
  const actionItems = useMemo(
    () => computeActionItems(prsWithMissingLinks, issues, reviewRequests, {
      staleIssueDays: settings.staleIssueDays,
      staleCommentDays: settings.staleCommentDays,
      staleReviewRequestDays: settings.staleReviewRequestDays,
    }),
    [prsWithMissingLinks, issues, reviewRequests, settings],
  );

  // Label filtering
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [groupBy, setGroupBy] = useState<GroupBy>('none');
  const filteredIssues = useMemo(() => {
    if (selectedLabels.length === 0) return issues;
    return issues.filter((issue) => issue.labels.some((l) => selectedLabels.includes(l.name)));
  }, [issues, selectedLabels]);

  // State
  const [drawerItem, setDrawerItem] = useState<DrawerItem | null>(null);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const { toggleTheme } = useThemeMode();

  const focusMode = settings.focusMode;
  const quietMode = settings.quietMode;
  const autoCollapse = settings.autoCollapseEmpty;
  const toggleFocusMode = () => updateSettings({ focusMode: !focusMode });
  const toggleQuietMode = () => updateSettings({ quietMode: !quietMode });

  // Notifications
  useNotifications(prsWithMissingLinks, issues, reviewRequests, isLoading || reviewsLoading);

  // Keyboard shortcuts
  const shortcuts = useKeyboardShortcuts([
    { key: 'r', description: 'Refresh data', handler: () => queryClient.invalidateQueries() },
    { key: '1', description: 'Jump to Actions', handler: () => scrollTo('section-actions') },
    { key: '2', description: 'Jump to Issues', handler: () => scrollTo('section-issues') },
    { key: '3', description: 'Jump to PRs', handler: () => scrollTo('section-prs') },
    { key: '4', description: 'Jump to Reviews', handler: () => scrollTo('section-reviews') },
    { key: '5', description: 'Jump to Awaiting Review', handler: () => scrollTo('section-awaiting') },
    { key: '6', description: 'Jump to Activity', handler: () => scrollTo('section-activity') },
    { key: '7', description: 'Jump to Trends', handler: () => scrollTo('section-trends') },
    { key: '8', description: 'Jump to Commits', handler: () => scrollTo('section-commits') },
    { key: 'd', description: 'Toggle dark mode', handler: () => toggleTheme() },
    { key: 'f', description: 'Toggle focus mode', handler: () => toggleFocusMode() },
    { key: 'q', description: 'Toggle quiet mode', handler: () => toggleQuietMode() },
    { key: '?', description: 'Show shortcuts', handler: () => setShortcutsOpen(true) },
  ]);

  const handleItemClick = (owner: string, repo: string, number: number, type: 'issue' | 'pr') => {
    setDrawerItem({ type, owner, repo, number });
  };

  const apiError = issuesErr ?? prsErr;
  const isRateLimited = apiError instanceof GitHubApiError && apiError.isRateLimited;

  const sidebarBadges: SidebarBadges = {
    actions: actionItems.length,
    issues: issues.length,
    prs: prs.length,
    reviews: reviewRequests.length,
    awaiting: awaitingReview.length,
    activity: events.length,
    commits: commits.length,
  };

  return (
    <Box sx={{ display: 'flex', gap: 3 }}>
      <Sidebar badges={sidebarBadges} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Dashboard
        </Typography>
        {focusMode && (
          <Chip label="Focus" size="small" color="primary" onDelete={toggleFocusMode} />
        )}
        {quietMode && !focusMode && (
          <Chip label="Quiet" size="small" color="secondary" onDelete={toggleQuietMode} />
        )}
      </Box>

      {/* Health bar */}
      <HealthBar actionItems={actionItems} isLoading={isLoading} />

      {/* Status summary */}
      <StatusSummary issues={issues} prs={prs} reviewRequests={reviewRequests} actionItems={actionItems} isLoading={isLoading} />

      {/* Last visit banner */}
      <LastVisitBanner issues={issues} prs={prs} reviewRequests={reviewRequests} isLoading={isLoading} />

      {/* Last worked on */}
      <LastWorkedOn commits={commits} prs={prsWithMissingLinks} isLoading={isLoading || commitsLoading} />

      {/* Errors */}
      {(issuesError || prsError) && (
        <Alert severity={isRateLimited ? 'warning' : 'error'} sx={{ mb: 2 }}>
          {isRateLimited
            ? `GitHub API rate limit reached. Resets at ${(apiError as GitHubApiError).rateLimitReset?.toLocaleTimeString() ?? 'unknown'}.`
            : `Failed to fetch data: ${apiError?.message ?? 'Unknown error'}`}
        </Alert>
      )}

      {/* Summary Cards */}
      <SectionErrorBoundary section="Summary Cards">
        <SummaryCards {...summary} isLoading={isLoading} />
      </SectionErrorBoundary>

      {/* Stale Alerts */}
      <StaleAlerts items={actionItems} />

      {/* Action List */}
      <SectionErrorBoundary section="Action List">
        <CollapsibleSection id="section-actions" title="What should I do next?" badge={actionItems.length} icon={<PriorityHighIcon fontSize="small" />} autoCollapseWhenEmpty={autoCollapse}>
          <ActionList items={actionItems} isLoading={isLoading || reviewsLoading} />
        </CollapsibleSection>
      </SectionErrorBoundary>

      {/* Focus mode: hide everything below actions */}
      {!focusMode && (
        <>
          {/* Issues */}
          <SectionErrorBoundary section="Issues">
            <CollapsibleSection id="section-issues" title="My Issues" badge={issues.length} icon={<BugReportIcon fontSize="small" />} autoCollapseWhenEmpty={autoCollapse}>
              <LabelFilter
                issues={issues}
                selectedLabels={selectedLabels}
                onLabelsChange={setSelectedLabels}
                groupBy={groupBy}
                onGroupByChange={setGroupBy}
              />
              <IssuesTable
                issues={filteredIssues}
                isLoading={issuesLoading}
                onItemClick={(o, r, n) => handleItemClick(o, r, n, 'issue')}
                groupBy={groupBy}
                notes={notes}
              />
            </CollapsibleSection>
          </SectionErrorBoundary>

          {/* PRs */}
          <SectionErrorBoundary section="Pull Requests">
            <CollapsibleSection id="section-prs" title="My Pull Requests" badge={prs.length} icon={<MergeIcon fontSize="small" />} autoCollapseWhenEmpty={autoCollapse}>
              <PRsTable prs={prsWithMissingLinks} isLoading={prsLoading} onItemClick={(o, r, n) => handleItemClick(o, r, n, 'pr')} notes={notes} />
            </CollapsibleSection>
          </SectionErrorBoundary>

          {/* Reviews */}
          <SectionErrorBoundary section="Reviews">
            <CollapsibleSection id="section-reviews" title="Reviews Requested" badge={reviewRequests.length} icon={<ReviewsIcon fontSize="small" />} autoCollapseWhenEmpty={autoCollapse}>
              <ReviewRequestsTable requests={reviewRequests} isLoading={reviewsLoading} />
            </CollapsibleSection>
          </SectionErrorBoundary>

          {/* Awaiting Review — all PRs needing review */}
          <SectionErrorBoundary section="Awaiting Review">
            <CollapsibleSection id="section-awaiting" title="PRs Awaiting Review" badge={awaitingReview.length} icon={<VisibilityIcon fontSize="small" />} autoCollapseWhenEmpty={autoCollapse}>
              <AwaitingReviewTable prs={awaitingReview} isLoading={awaitingLoading} />
            </CollapsibleSection>
          </SectionErrorBoundary>

          {/* Quiet mode hides informational sections */}
          {!quietMode && (
            <>
              {/* Activity */}
              <SectionErrorBoundary section="Activity">
                <CollapsibleSection id="section-activity" title="Activity (Last 48h)" badge={events.length} icon={<TimelineIcon fontSize="small" />} autoCollapseWhenEmpty={autoCollapse}>
                  <ActivityTimeline events={events} isLoading={eventsLoading} />
                </CollapsibleSection>
              </SectionErrorBoundary>

              {/* Trends */}
              <SectionErrorBoundary section="Trends">
                <CollapsibleSection id="section-trends" title="Trends" icon={<TrendingUpIcon fontSize="small" />}>
                  <WeeklySummary trendData={trendData} isLoading={trendLoading} />
                  <CalendarHeatmap trendData={trendData} isLoading={trendLoading} />
                  <TrendChart data={trendData} isLoading={trendLoading} />
                </CollapsibleSection>
              </SectionErrorBoundary>

              {/* Commits */}
              <SectionErrorBoundary section="Commits">
                <CollapsibleSection id="section-commits" title="My Recent Commits" badge={commits.length} icon={<CommitIcon fontSize="small" />} autoCollapseWhenEmpty={autoCollapse}>
                  <CommitsSection commits={commits} isLoading={commitsLoading} />
                </CollapsibleSection>
              </SectionErrorBoundary>
            </>
          )}
        </>
      )}

      <DetailDrawer open={!!drawerItem} onClose={() => setDrawerItem(null)} item={drawerItem} />
      <ShortcutsDialog open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} shortcuts={shortcuts} />
      </Box>
    </Box>
  );
}
