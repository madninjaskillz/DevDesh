import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import { useQueryClient } from '@tanstack/react-query';
import { useAssignedIssues, useOpenPRs, useReviewRequests, useAwaitingReview, useDashboardSummary, useTrendData, useRecentCommits } from '../../api/queries';
import { SummaryCards } from './SummaryCards';
import { StaleAlerts } from './StaleAlerts';
import { ActionList } from './ActionList';
import { IssuesTable } from './IssuesTable';
import { PRsTable } from './PRsTable';
import { ReviewRequestsTable } from './ReviewRequestsTable';
import { AwaitingReviewTable } from './AwaitingReviewTable';
import { TrendChart } from './TrendChart';
import { CommitsSection } from './CommitsSection';
import { DetailDrawer, type DrawerItem } from './DetailDrawer';
import { ShortcutsDialog } from './ShortcutsDialog';
import { CollapsibleSection } from './CollapsibleSection';
import { SectionErrorBoundary } from './ErrorBoundary';
import { LabelFilter, type GroupBy } from './LabelFilter';
import { SearchBar } from './SearchBar';
import { ExportButton } from './ExportButton';
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

  // Section label lookup for keyboard shortcuts
  const sectionLabels: Record<string, string> = {
    'section-actions': 'Actions',
    'section-issues': 'Issues',
    'section-prs': 'PRs',
    'section-reviews': 'Reviews',
    'section-awaiting': 'Awaiting Review',
    'section-trends': 'Trends',
    'section-commits': 'Commits',
  };

  // Keyboard shortcuts — number keys follow section order
  const sectionShortcuts = settings.sectionOrder
    .slice(0, 9)
    .map((id, i) => ({
      key: String(i + 1),
      description: `Jump to ${sectionLabels[id] ?? id}`,
      handler: () => scrollTo(id),
    }));

  const shortcuts = useKeyboardShortcuts([
    { key: 'r', description: 'Refresh data', handler: () => queryClient.invalidateQueries() },
    ...sectionShortcuts,
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
    commits: commits.length,
  };

  return (
    <Box sx={{
      display: 'flex',
      gap: 3,
      fontSize: settings.compactMode ? '0.85rem' : undefined,
      // Text shadow for readability when a background image is active
      ...(settings.backgroundId ? { '& > * > .MuiTypography-h5, & > * > .MuiTypography-h6, & > * > .MuiTypography-body1': { textShadow: '0 1px 3px rgba(0,0,0,0.15)' } } : {}),
    }}>
      <Sidebar badges={sidebarBadges} />
      <Box sx={{ flex: 1, minWidth: 0, '& .MuiTableCell-root': settings.compactMode ? { py: 0.25, px: 0.75, fontSize: '0.8rem' } : undefined }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, flex: 1 }}>
          Dashboard
        </Typography>
        {focusMode && (
          <Chip label="Focus" size="small" color="primary" onDelete={toggleFocusMode} />
        )}
        {quietMode && !focusMode && (
          <Chip label="Quiet" size="small" color="secondary" onDelete={toggleQuietMode} />
        )}
        <ExportButton issues={issues} prs={prsWithMissingLinks} reviewRequests={reviewRequests} actionItems={actionItems} />
      </Box>

      {/* Search */}
      <SearchBar issues={issues} prs={prsWithMissingLinks} onItemClick={handleItemClick} />

      {/* Health bar */}
      <HealthBar actionItems={actionItems} isLoading={isLoading} />

      {/* Status summary */}
      <StatusSummary issues={issues} prs={prs} reviewRequests={reviewRequests} actionItems={actionItems} isLoading={isLoading} />

      {/* Last visit banner */}
      <LastVisitBanner issues={issues} prs={prs} reviewRequests={reviewRequests} isLoading={isLoading} />

      {/* Last worked on */}
      <LastWorkedOn commits={commits} prs={prsWithMissingLinks} isLoading={isLoading || commitsLoading} />

      {/* Errors — show per-error but don't block the whole dashboard */}
      {(issuesError || prsError) && (
        <Alert severity={isRateLimited ? 'warning' : 'error'} sx={{ mb: 2 }} onClose={() => {}}>
          {isRateLimited
            ? `GitHub API rate limit reached. Resets at ${(apiError as GitHubApiError).rateLimitReset?.toLocaleTimeString() ?? 'unknown'}. Showing cached data.`
            : `Some data failed to load: ${apiError?.message ?? 'Unknown error'}. Other sections may still work.`}
        </Alert>
      )}

      {/* Summary Cards */}
      <SectionErrorBoundary section="Summary Cards">
        <SummaryCards {...summary} isLoading={isLoading} staleIssueDays={settings.staleIssueDays} stalePRDays={settings.stalePRApprovedDays} />
      </SectionErrorBoundary>

      {/* Stale Alerts */}
      <StaleAlerts items={actionItems} />

      {/* Sections — rendered in user-configured order */}
      {settings.sectionOrder.map((sectionId) => {
        // Focus mode: only show actions
        if (focusMode && sectionId !== 'section-actions') return null;
        // Quiet mode: hide informational sections
        const quietHidden = ['section-trends', 'section-commits'];
        if (quietMode && quietHidden.includes(sectionId)) return null;

        switch (sectionId) {
          case 'section-actions':
            return (
              <SectionErrorBoundary key={sectionId} section="Action List">
                <CollapsibleSection id="section-actions" title="What should I do next?" badge={actionItems.length} icon={<PriorityHighIcon fontSize="small" />} autoCollapseWhenEmpty={autoCollapse}>
                  <ActionList items={actionItems} isLoading={isLoading || reviewsLoading} />
                </CollapsibleSection>
              </SectionErrorBoundary>
            );
          case 'section-issues':
            return (
              <SectionErrorBoundary key={sectionId} section="Issues">
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
            );
          case 'section-prs':
            return (
              <SectionErrorBoundary key={sectionId} section="Pull Requests">
                <CollapsibleSection id="section-prs" title="My Pull Requests" badge={prs.length} icon={<MergeIcon fontSize="small" />} autoCollapseWhenEmpty={autoCollapse}>
                  <PRsTable prs={prsWithMissingLinks} isLoading={prsLoading} onItemClick={(o, r, n) => handleItemClick(o, r, n, 'pr')} notes={notes} />
                </CollapsibleSection>
              </SectionErrorBoundary>
            );
          case 'section-reviews':
            return (
              <SectionErrorBoundary key={sectionId} section="Reviews">
                <CollapsibleSection id="section-reviews" title="Reviews Requested" badge={reviewRequests.length} icon={<ReviewsIcon fontSize="small" />} autoCollapseWhenEmpty={autoCollapse}>
                  <ReviewRequestsTable requests={reviewRequests} isLoading={reviewsLoading} />
                </CollapsibleSection>
              </SectionErrorBoundary>
            );
          case 'section-awaiting':
            return (
              <SectionErrorBoundary key={sectionId} section="Awaiting Review">
                <CollapsibleSection id="section-awaiting" title="PRs Awaiting Review" badge={awaitingReview.length} icon={<VisibilityIcon fontSize="small" />} autoCollapseWhenEmpty={autoCollapse}>
                  <AwaitingReviewTable prs={awaitingReview} isLoading={awaitingLoading} />
                </CollapsibleSection>
              </SectionErrorBoundary>
            );
          case 'section-trends':
            return (
              <SectionErrorBoundary key={sectionId} section="Trends">
                <CollapsibleSection id="section-trends" title="Trends" icon={<TrendingUpIcon fontSize="small" />}>
                  <WeeklySummary trendData={trendData} isLoading={trendLoading} />
                  <CalendarHeatmap trendData={trendData} isLoading={trendLoading} />
                  <TrendChart data={trendData} isLoading={trendLoading} />
                </CollapsibleSection>
              </SectionErrorBoundary>
            );
          case 'section-commits':
            return (
              <SectionErrorBoundary key={sectionId} section="Commits">
                <CollapsibleSection id="section-commits" title="My Recent Commits" badge={commits.length} icon={<CommitIcon fontSize="small" />} autoCollapseWhenEmpty={autoCollapse}>
                  <CommitsSection commits={commits} isLoading={commitsLoading} />
                </CollapsibleSection>
              </SectionErrorBoundary>
            );
          default:
            return null;
        }
      })}

      <DetailDrawer open={!!drawerItem} onClose={() => setDrawerItem(null)} item={drawerItem} />
      <ShortcutsDialog open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} shortcuts={shortcuts} />
      </Box>
    </Box>
  );
}
