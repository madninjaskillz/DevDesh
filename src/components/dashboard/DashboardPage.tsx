import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
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
import { LabelFilter, FilterDropdown, type GroupBy } from './LabelFilter';
import { SearchBar } from './SearchBar';
import { ExportButton } from './ExportButton';
import { StatusSummary } from './StatusSummary';
import { HealthBar } from './HealthBar';
import { LastVisitBanner } from './LastVisitBanner';
import { LastWorkedOn } from './LastWorkedOn';
import { WeeklySummary } from './WeeklySummary';
import { CalendarHeatmap } from './CalendarHeatmap';
import { HighlightContext, useHighlightState } from '../../hooks/useHighlight';
import { TeamAvatars } from './TeamAvatars';
import { useSnooze } from '../../hooks/useSnooze';
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
import { useThemeMode, useTextCase } from '../../theme/ThemeProvider';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useSettings } from '../../hooks/useSettings';
import { useNotes } from '../../hooks/useNotes';
import { useRepoConfig } from '../../hooks/useRepoConfig';
import { Sidebar, type SidebarBadges } from '../layout/Sidebar';
import type { DashboardPR, MissingIssueLink } from '../../types/github';

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function DashboardPage() {
  const highlightValue = useHighlightState();
  const snooze = useSnooze();
  const queryClient = useQueryClient();
  const { settings, updateSettings } = useSettings();
  const teamMode = settings.teamMode;
  const { issues: allIssues, isLoading: issuesLoading, isError: issuesError, error: issuesErr } = useAssignedIssues(teamMode);
  const { prs: allPrs, isLoading: prsLoading, isError: prsError, error: prsErr } = useOpenPRs(teamMode);
  const { requests: allReviewRequests, isLoading: reviewsLoading } = useReviewRequests();
  const { awaitingReview: allAwaitingReview, isLoading: awaitingLoading } = useAwaitingReview();
  const { trendData, isLoading: trendLoading } = useTrendData(teamMode);
  const { commits: allCommits, isLoading: commitsLoading } = useRecentCommits(teamMode);
  const notes = useNotes();
  const { repos } = useRepoConfig();

  // Repo filter — separate disabled sets for personal and team views
  const storageKey = teamMode ? 'devdash-disabled-repos-team' : 'devdash-disabled-repos';
  const [disabledReposMy, setDisabledReposMy] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem('devdash-disabled-repos');
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch { return new Set(); }
  });
  const [disabledReposTeam, setDisabledReposTeam] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem('devdash-disabled-repos-team');
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch { return new Set(); }
  });
  const disabledRepos = teamMode ? disabledReposTeam : disabledReposMy;
  const toggleRepo = (fullName: string) => {
    const setter = teamMode ? setDisabledReposTeam : setDisabledReposMy;
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(fullName)) next.delete(fullName); else next.add(fullName);
      localStorage.setItem(storageKey, JSON.stringify([...next]));
      return next;
    });
  };
  const isRepoActive = (fullName: string) => !disabledRepos.has(fullName);

  // Filter all data by active repos
  const issues = useMemo(
    () => allIssues.filter((i) => isRepoActive(i.repoFullName)),
    [allIssues, disabledRepos],
  );
  const prs = useMemo(
    () => allPrs.filter((p) => isRepoActive(p.repoFullName)),
    [allPrs, disabledRepos],
  );
  const reviewRequests = useMemo(
    () => allReviewRequests.filter((r) => isRepoActive(r.repoFullName)),
    [allReviewRequests, disabledRepos],
  );
  const awaitingReview = useMemo(
    () => allAwaitingReview.filter((a) => isRepoActive(a.repoFullName)),
    [allAwaitingReview, disabledRepos],
  );
  const commits = useMemo(
    () => allCommits.filter((c) => isRepoActive(c.repoFullName)),
    [allCommits, disabledRepos],
  );

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

  // Label + board status filtering (exclude-based: all shown by default, uncheck to hide)
  // Persist per view (dashboard / team)
  const [excludedLabelsMy, setExcludedLabelsMy] = useState<string[]>(() => {
    try { const r = localStorage.getItem('devdash-excluded-labels'); return r ? JSON.parse(r) : []; } catch { return []; }
  });
  const [excludedLabelsTeam, setExcludedLabelsTeam] = useState<string[]>(() => {
    try { const r = localStorage.getItem('devdash-excluded-labels-team'); return r ? JSON.parse(r) : []; } catch { return []; }
  });
  const [excludedStatusesMy, setExcludedStatusesMy] = useState<string[]>(() => {
    try { const r = localStorage.getItem('devdash-excluded-statuses'); return r ? JSON.parse(r) : []; } catch { return []; }
  });
  const [excludedStatusesTeam, setExcludedStatusesTeam] = useState<string[]>(() => {
    try { const r = localStorage.getItem('devdash-excluded-statuses-team'); return r ? JSON.parse(r) : []; } catch { return []; }
  });
  const [groupByMy, setGroupByMy] = useState<GroupBy>(() => {
    try { return (localStorage.getItem('devdash-groupby') as GroupBy) || 'none'; } catch { return 'none'; }
  });
  const [groupByTeam, setGroupByTeam] = useState<GroupBy>(() => {
    try { return (localStorage.getItem('devdash-groupby-team') as GroupBy) || 'none'; } catch { return 'none'; }
  });

  const excludedLabels = teamMode ? excludedLabelsTeam : excludedLabelsMy;
  const setExcludedLabels = (v: string[] | ((prev: string[]) => string[])) => {
    const setter = teamMode ? setExcludedLabelsTeam : setExcludedLabelsMy;
    const key = teamMode ? 'devdash-excluded-labels-team' : 'devdash-excluded-labels';
    setter((prev) => { const next = typeof v === 'function' ? v(prev) : v; localStorage.setItem(key, JSON.stringify(next)); return next; });
  };
  const excludedStatuses = teamMode ? excludedStatusesTeam : excludedStatusesMy;
  const setExcludedStatuses = (v: string[] | ((prev: string[]) => string[])) => {
    const setter = teamMode ? setExcludedStatusesTeam : setExcludedStatusesMy;
    const key = teamMode ? 'devdash-excluded-statuses-team' : 'devdash-excluded-statuses';
    setter((prev) => { const next = typeof v === 'function' ? v(prev) : v; localStorage.setItem(key, JSON.stringify(next)); return next; });
  };
  const groupBy = teamMode ? groupByTeam : groupByMy;
  const setGroupBy = (v: GroupBy) => {
    const setter = teamMode ? setGroupByTeam : setGroupByMy;
    const key = teamMode ? 'devdash-groupby-team' : 'devdash-groupby';
    setter(v); localStorage.setItem(key, v);
  };
  const filteredIssues = useMemo(() => {
    let result = issues;
    if (excludedLabels.length > 0) {
      result = result.filter((issue) => !issue.labels.every((l) => excludedLabels.includes(l.name)));
    }
    if (excludedStatuses.length > 0) {
      result = result.filter((issue) => !issue.projectStatus || !excludedStatuses.includes(issue.projectStatus.name));
    }
    return result;
  }, [issues, excludedLabels, excludedStatuses]);

  // PR status filtering (draft excluded by default) — persist per view
  const [excludedPRStatusesMy, setExcludedPRStatusesMy] = useState<string[]>(() => {
    try { const r = localStorage.getItem('devdash-excluded-pr-statuses'); return r ? JSON.parse(r) : ['draft']; } catch { return ['draft']; }
  });
  const [excludedPRStatusesTeam, setExcludedPRStatusesTeam] = useState<string[]>(() => {
    try { const r = localStorage.getItem('devdash-excluded-pr-statuses-team'); return r ? JSON.parse(r) : ['draft']; } catch { return ['draft']; }
  });
  const excludedPRStatuses = teamMode ? excludedPRStatusesTeam : excludedPRStatusesMy;
  const setExcludedPRStatuses = (v: string[] | ((prev: string[]) => string[])) => {
    const setter = teamMode ? setExcludedPRStatusesTeam : setExcludedPRStatusesMy;
    const key = teamMode ? 'devdash-excluded-pr-statuses-team' : 'devdash-excluded-pr-statuses';
    setter((prev) => { const next = typeof v === 'function' ? v(prev) : v; localStorage.setItem(key, JSON.stringify(next)); return next; });
  };
  const filteredPRs = useMemo(() => {
    if (excludedPRStatuses.length === 0) return prsWithMissingLinks;
    return prsWithMissingLinks.filter((pr) => !excludedPRStatuses.includes(pr.status));
  }, [prsWithMissingLinks, excludedPRStatuses]);

  // State
  const [drawerItem, setDrawerItem] = useState<DrawerItem | null>(null);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const { toggleTheme } = useThemeMode();
  const textCase = useTextCase();

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
    { key: 'r', description: 'Refresh data', handler: () => queryClient.invalidateQueries({ refetchType: 'all' }) },
    ...sectionShortcuts,
    { key: 'd', description: 'Toggle dark mode', handler: () => toggleTheme() },
    { key: 'f', description: 'Toggle focus mode', handler: () => toggleFocusMode() },
    { key: 'q', description: 'Toggle quiet mode', handler: () => toggleQuietMode() },
    { key: 't', description: 'Toggle team view', handler: () => updateSettings({ teamMode: !teamMode }) },
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
    <HighlightContext.Provider value={highlightValue}>
    <Box sx={{
      display: 'flex',
      gap: 3,
      fontSize: settings.compactMode ? '0.85rem' : undefined,
      // Text shadow for readability when a background image is active
      ...(settings.backgroundId ? { '& > * > .MuiTypography-h5, & > * > .MuiTypography-h6, & > * > .MuiTypography-body1': { textShadow: '0 1px 3px rgba(0,0,0,0.15)' } } : {}),
    }}>
      <Sidebar badges={sidebarBadges} />
      <Box sx={{ flex: 1, minWidth: 0, '& .MuiTableCell-root': settings.compactMode ? { py: 0.25, px: 0.75, fontSize: '0.8rem' } : undefined }}>
      {/* Header with view tabs */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Tabs
          value={teamMode ? 1 : 0}
          onChange={(_, v) => updateSettings({ teamMode: v === 1 })}
        >
          <Tab label={textCase("Dashboard")} />
          <Tab label={textCase("Team")} />
        </Tabs>
        <Box sx={{ flex: 1 }} />
        {focusMode && (
          <Chip label="Focus" size="small" color="primary" onDelete={toggleFocusMode} />
        )}
        {quietMode && !focusMode && (
          <Chip label="Quiet" size="small" color="secondary" onDelete={toggleQuietMode} />
        )}
        <TeamAvatars prs={prsWithMissingLinks} issues={issues} />
        <ExportButton issues={issues} prs={prsWithMissingLinks} reviewRequests={reviewRequests} actionItems={actionItems} trendData={trendData} />
      </Box>

      {/* Repo filter */}
      {repos.length > 1 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0, mb: 0.5 }}>
          {repos.map((r) => {
            const fullName = `${r.owner}/${r.repo}`;
            return (
              <FormControlLabel
                key={fullName}
                control={
                  <Checkbox
                    size="small"
                    checked={isRepoActive(fullName)}
                    onChange={() => toggleRepo(fullName)}
                    sx={{ py: 0, px: 0.5 }}
                  />
                }
                label={r.repo}
                slotProps={{ typography: { variant: 'caption', sx: { fontSize: '0.75rem', color: 'text.secondary' } } }}
                sx={{ mr: 2, ml: 0 }}
              />
            );
          })}
        </Box>
      )}

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
                <CollapsibleSection id="section-actions" title={teamMode ? 'Action Items' : 'What should I do next?'} badge={actionItems.filter((a) => !snooze.isSnoozed(a.id)).length} icon={<PriorityHighIcon fontSize="small" />} autoCollapseWhenEmpty={autoCollapse}>
                  <ActionList items={actionItems} isLoading={isLoading || reviewsLoading} snooze={snooze} />
                </CollapsibleSection>
              </SectionErrorBoundary>
            );
          case 'section-issues':
            return (
              <SectionErrorBoundary key={sectionId} section="Issues">
                <CollapsibleSection id="section-issues" title={teamMode ? 'Issues' : 'My Issues'} badge={issues.length} icon={<BugReportIcon fontSize="small" />} autoCollapseWhenEmpty={autoCollapse}>
                  <LabelFilter
                    issues={issues}
                    excludedLabels={excludedLabels}
                    onExcludedLabelsChange={setExcludedLabels}
                    excludedStatuses={excludedStatuses}
                    onExcludedStatusesChange={setExcludedStatuses}
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
          case 'section-prs': {
            const prStatusItems = [
              { name: 'draft', color: '#656d76', count: prsWithMissingLinks.filter((p) => p.status === 'draft').length },
              { name: 'review_pending', color: '#bf8700', count: prsWithMissingLinks.filter((p) => p.status === 'review_pending').length },
              { name: 'changes_requested', color: '#cf222e', count: prsWithMissingLinks.filter((p) => p.status === 'changes_requested').length },
              { name: 'approved', color: '#2da44e', count: prsWithMissingLinks.filter((p) => p.status === 'approved').length },
            ].filter((s) => s.count > 0);
            return (
              <SectionErrorBoundary key={sectionId} section="Pull Requests">
                <CollapsibleSection id="section-prs" title={teamMode ? 'Pull Requests' : 'My Pull Requests'} badge={prs.length} icon={<MergeIcon fontSize="small" />} autoCollapseWhenEmpty={autoCollapse}>
                  {prStatusItems.length > 1 && (
                    <Box sx={{ mb: 1.5 }}>
                      <FilterDropdown
                        label="Status"
                        icon={<FilterListIcon sx={{ fontSize: 16 }} />}
                        items={prStatusItems}
                        excluded={excludedPRStatuses}
                        onChange={setExcludedPRStatuses}
                      />
                    </Box>
                  )}
                  <PRsTable prs={filteredPRs} isLoading={prsLoading} onItemClick={(o, r, n) => handleItemClick(o, r, n, 'pr')} notes={notes} />
                </CollapsibleSection>
              </SectionErrorBoundary>
            );
          }
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
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <WeeklySummary trendData={trendData} isLoading={trendLoading} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <CalendarHeatmap trendData={trendData} isLoading={trendLoading} />
                    </Grid>
                  </Grid>
                  <TrendChart data={trendData} isLoading={trendLoading} goals={settings} />
                </CollapsibleSection>
              </SectionErrorBoundary>
            );
          case 'section-commits':
            return (
              <SectionErrorBoundary key={sectionId} section="Commits">
                <CollapsibleSection id="section-commits" title={teamMode ? 'Recent Commits' : 'My Recent Commits'} badge={commits.length} icon={<CommitIcon fontSize="small" />} autoCollapseWhenEmpty={autoCollapse}>
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
    </HighlightContext.Provider>
  );
}
