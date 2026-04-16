import { useState, useMemo } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MergeIcon from '@mui/icons-material/CallMerge';
import GroupIcon from '@mui/icons-material/Group';
import type { DashboardPR, DashboardIssue, DashboardReviewRequest, AwaitingReviewPR, GitHubIssue, GitHubPR } from '../../types/github';
import { formatAge } from '../../utils/dates';
import { colors } from '../../theme/colors';

interface TeamMember {
  login: string;
  avatar_url: string;
  lastActive: string;
  openPRs: number;
  openIssues: number;
  closedPRs: number;
  closedIssues: number;
  recent30d: number;
}

interface TeamAvatarsProps {
  prs: DashboardPR[];
  issues: DashboardIssue[];
  reviewRequests: DashboardReviewRequest[];
  awaitingReview: AwaitingReviewPR[];
  closedIssues: GitHubIssue[];
  closedPRs: GitHubPR[];
  /** When set, only contributors from starred repos appear in the list. */
  starredRepos?: Set<string>;
}

interface ClosedItem {
  number: number;
  title: string;
  url: string;
  repoName: string;
  closedAt: string;
  merged?: boolean;
}

function daysAgoFromDate(dateStr: string): number {
  return Math.max(0, Math.round((Date.now() - new Date(dateStr).getTime()) / 86400000));
}

export function TeamAvatars({ prs, issues, reviewRequests, awaitingReview, closedIssues, closedPRs, starredRepos }: TeamAvatarsProps) {
  const [listOpen, setListOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  // When starred repos are configured, only derive contributors from those repos.
  // Activity counts still use all repos so member detail dialogs show full context.
  const hasStarFilter = starredRepos && starredRepos.size > 0;

  const members = useMemo(() => {
    const map = new Map<string, { avatar_url: string; dates: string[] }>();

    const touch = (login: string, avatar: string, date?: string) => {
      if (!map.has(login)) map.set(login, { avatar_url: avatar, dates: [] });
      const entry = map.get(login)!;
      if (!entry.avatar_url && avatar) entry.avatar_url = avatar;
      if (date) entry.dates.push(date);
    };

    // Helper: check if a repo fullName passes the star filter
    const inScope = (repoFullName: string) => !hasStarFilter || starredRepos!.has(repoFullName);

    // Extract repo fullName from a GitHub html_url like "https://github.com/owner/repo/..."
    const repoFromUrl = (url: string) => {
      const parts = url.split('/');
      return parts.length >= 5 ? `${parts[3]}/${parts[4]}` : '';
    };

    for (const pr of prs) {
      if (!inScope(pr.repoFullName)) continue;
      touch(pr.author, pr.authorAvatar, pr.createdAt);
      for (const r of pr.reviewers) touch(r.login, r.avatar_url);
      for (const r of pr.reviews) touch(r.user.login, r.user.avatar_url, r.submitted_at);
    }
    for (const issue of issues) {
      if (!inScope(issue.repoFullName)) continue;
      for (const a of issue.assignees) touch(a.login, a.avatar_url, issue.updatedAt);
    }
    for (const req of reviewRequests) {
      if (!inScope(req.repoFullName)) continue;
      touch(req.author, req.authorAvatar, req.createdAt);
    }
    for (const pr of awaitingReview) {
      if (!inScope(pr.repoFullName)) continue;
      touch(pr.author, pr.authorAvatar, pr.createdAt);
    }
    for (const pr of closedPRs) {
      if (!inScope(repoFromUrl(pr.html_url))) continue;
      touch(pr.user.login, pr.user.avatar_url, pr.merged_at ?? pr.closed_at ?? pr.updated_at);
    }
    for (const issue of closedIssues) {
      const parts = issue.repository_url.split('/');
      const repo = parts.length >= 2 ? `${parts[parts.length - 2]}/${parts[parts.length - 1]}` : '';
      if (!inScope(repo)) continue;
      for (const a of issue.assignees ?? []) touch(a.login, a.avatar_url, issue.closed_at ?? issue.updated_at);
    }

    // Build member objects with activity counts (across ALL repos for full context)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();

    return [...map.entries()]
      .map(([login, { avatar_url, dates }]) => {
        const lastActive = dates.length > 0 ? dates.sort().reverse()[0] : '';
        const openPRs = prs.filter((pr) => pr.author === login).length;
        const openIssues = issues.filter((i) => i.assignees.some((a) => a.login === login)).length;
        const closedPRCount = closedPRs.filter((pr) => pr.user.login === login).length;
        const closedIssueCount = closedIssues.filter((i) => (i.assignees ?? []).some((a) => a.login === login)).length;
        const recent30d = closedPRs.filter((pr) => pr.user.login === login && (pr.merged_at ?? pr.closed_at ?? '') >= thirtyDaysAgo).length
          + closedIssues.filter((i) => (i.assignees ?? []).some((a) => a.login === login) && (i.closed_at ?? '') >= thirtyDaysAgo).length;
        return { login, avatar_url, lastActive, openPRs, openIssues, closedPRs: closedPRCount, closedIssues: closedIssueCount, recent30d } as TeamMember;
      })
      .sort((a, b) => b.recent30d - a.recent30d || b.lastActive.localeCompare(a.lastActive));
  }, [prs, issues, reviewRequests, awaitingReview, closedIssues, closedPRs, hasStarFilter, starredRepos]);

  const activity = useMemo(() => {
    if (!selectedMember) return null;
    const login = selectedMember.login;

    const memberPRs = prs.filter((pr) => pr.author === login);
    const memberIssues = issues.filter((issue) => issue.assignees.some((a) => a.login === login));

    const memberClosedPRs: ClosedItem[] = closedPRs
      .filter((pr) => pr.user.login === login)
      .map((pr) => {
        const repo = pr.html_url.split('/').slice(3, 5).join('/');
        return {
          number: pr.number,
          title: pr.title,
          url: pr.html_url,
          repoName: repo.split('/')[1] ?? repo,
          closedAt: pr.merged_at ?? pr.closed_at ?? '',
          merged: !!pr.merged_at,
        };
      })
      .sort((a, b) => b.closedAt.localeCompare(a.closedAt));

    const memberClosedIssues: ClosedItem[] = closedIssues
      .filter((issue) => (issue.assignees ?? []).some((a) => a.login === login))
      .map((issue) => {
        const parts = issue.repository_url.split('/');
        return {
          number: issue.number,
          title: issue.title,
          url: issue.html_url,
          repoName: parts[parts.length - 1] ?? '',
          closedAt: issue.closed_at ?? '',
        };
      })
      .sort((a, b) => b.closedAt.localeCompare(a.closedAt));

    return { memberPRs, memberIssues, memberClosedPRs, memberClosedIssues };
  }, [selectedMember, prs, issues, closedPRs, closedIssues]);

  if (members.length === 0) return null;

  return (
    <>
      <Button
        size="small"
        variant="outlined"
        startIcon={<GroupIcon fontSize="small" />}
        onClick={() => setListOpen(true)}
        sx={{ whiteSpace: 'nowrap' }}
      >
        Contributors ({members.length})
      </Button>

      {/* Contributors list dialog */}
      <Dialog
        open={listOpen && !selectedMember}
        onClose={() => setListOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Contributors
          <IconButton onClick={() => setListOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <List disablePadding>
            {members.map((m) => (
              <ListItemButton
                key={m.login}
                onClick={() => setSelectedMember(m)}
                sx={{ py: 1.5 }}
              >
                <ListItemAvatar>
                  <Avatar src={m.avatar_url} alt={m.login} sx={{ width: 36, height: 36 }} />
                </ListItemAvatar>
                <ListItemText
                  primary={m.login}
                  secondary={[
                    m.openPRs > 0 && `${m.openPRs} open PR${m.openPRs !== 1 ? 's' : ''}`,
                    m.openIssues > 0 && `${m.openIssues} open issue${m.openIssues !== 1 ? 's' : ''}`,
                    m.closedPRs > 0 && `${m.closedPRs} closed PR${m.closedPRs !== 1 ? 's' : ''}`,
                    m.closedIssues > 0 && `${m.closedIssues} closed issue${m.closedIssues !== 1 ? 's' : ''}`,
                  ].filter(Boolean).join(' \u00b7 ') || 'No recent activity'}
                  primaryTypographyProps={{ fontWeight: 600, variant: 'body2' }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
                {m.lastActive && (
                  <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap', ml: 1 }}>
                    {formatAge(daysAgoFromDate(m.lastActive))} ago
                  </Typography>
                )}
              </ListItemButton>
            ))}
          </List>
        </DialogContent>
      </Dialog>

      {/* Member detail dialog */}
      <Dialog
        open={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        maxWidth="sm"
        fullWidth
      >
        {selectedMember && activity && (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pr: 6 }}>
              <Avatar src={selectedMember.avatar_url} alt={selectedMember.login} sx={{ width: 36, height: 36 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{selectedMember.login}</Typography>
              <IconButton
                onClick={() => setSelectedMember(null)}
                sx={{ position: 'absolute', right: 8, top: 8 }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              {/* Summary stats */}
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <StatBox label="Open PRs" value={activity.memberPRs.length} />
                <StatBox label="Open Issues" value={activity.memberIssues.length} />
                <StatBox label="PRs Closed (90d)" value={activity.memberClosedPRs.length} />
                <StatBox label="Issues Closed (90d)" value={activity.memberClosedIssues.length} />
              </Box>

              {/* Weekly throughput */}
              <WeeklyBreakdown closedPRs={activity.memberClosedPRs} closedIssues={activity.memberClosedIssues} />

              <Divider sx={{ my: 2 }} />

              {/* Open PRs */}
              {activity.memberPRs.length > 0 && (
                <>
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Open PRs</Typography>
                  {activity.memberPRs.map((pr) => (
                    <Box key={pr.htmlUrl} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                      <Chip
                        label={pr.status.replace('_', ' ')}
                        size="small"
                        color={pr.status === 'approved' ? 'success' : pr.status === 'changes_requested' ? 'error' : pr.status === 'draft' ? 'default' : 'warning'}
                        sx={{ minWidth: 60, fontSize: '0.65rem' }}
                      />
                      <Link href={pr.htmlUrl} target="_blank" rel="noopener" variant="body2" sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        #{pr.number} {pr.title}
                      </Link>
                      <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                        {pr.repoName} &middot; {formatAge(pr.ageDays)}
                      </Typography>
                    </Box>
                  ))}
                </>
              )}

              {/* Open Issues */}
              {activity.memberIssues.length > 0 && (
                <Box sx={{ mt: activity.memberPRs.length > 0 ? 1.5 : 0 }}>
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Open Issues</Typography>
                  {activity.memberIssues.map((issue) => (
                    <Box key={issue.htmlUrl} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: colors.orange[5], flexShrink: 0 }} />
                      <Link href={issue.htmlUrl} target="_blank" rel="noopener" variant="body2" sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        #{issue.number} {issue.title}
                      </Link>
                      <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                        {issue.repoName} &middot; {formatAge(issue.ageDays)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}

              {/* Recently Closed PRs */}
              {activity.memberClosedPRs.length > 0 && (
                <Box sx={{ mt: 1.5 }}>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Recently Closed PRs</Typography>
                  {activity.memberClosedPRs.slice(0, 15).map((pr) => (
                    <Box key={pr.url} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                      {pr.merged ? (
                        <MergeIcon sx={{ fontSize: 16, color: colors.green[5] }} />
                      ) : (
                        <CheckCircleIcon sx={{ fontSize: 16, color: colors.red[3] }} />
                      )}
                      <Link href={pr.url} target="_blank" rel="noopener" variant="body2" sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        #{pr.number} {pr.title}
                      </Link>
                      <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                        {pr.repoName} &middot; {formatAge(daysAgoFromDate(pr.closedAt))} ago
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}

              {/* Recently Closed Issues */}
              {activity.memberClosedIssues.length > 0 && (
                <Box sx={{ mt: 1.5 }}>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Recently Closed Issues</Typography>
                  {activity.memberClosedIssues.slice(0, 15).map((issue) => (
                    <Box key={issue.url} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                      <CheckCircleIcon sx={{ fontSize: 16, color: colors.green[5] }} />
                      <Link href={issue.url} target="_blank" rel="noopener" variant="body2" sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        #{issue.number} {issue.title}
                      </Link>
                      <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                        {issue.repoName} &middot; {formatAge(daysAgoFromDate(issue.closedAt))} ago
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}

              {activity.memberPRs.length === 0 && activity.memberIssues.length === 0 &&
                activity.memberClosedPRs.length === 0 && activity.memberClosedIssues.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No activity found in the last 90 days.
                </Typography>
              )}
            </DialogContent>
          </>
        )}
      </Dialog>
    </>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <Box sx={{ textAlign: 'center', flex: 1 }}>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>{value}</Typography>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
    </Box>
  );
}

function WeeklyBreakdown({ closedPRs, closedIssues }: { closedPRs: ClosedItem[]; closedIssues: ClosedItem[] }) {
  const weeks = useMemo(() => {
    const now = Date.now();
    const result: { label: string; prs: number; issues: number }[] = [];
    for (let w = 0; w < 6; w++) {
      const weekEnd = now - w * 7 * 86400000;
      const weekStart = weekEnd - 7 * 86400000;
      const label = w === 0 ? 'This week' : w === 1 ? 'Last week' : `${w} weeks ago`;

      const prs = closedPRs.filter((p) => {
        const t = new Date(p.closedAt).getTime();
        return t >= weekStart && t < weekEnd;
      }).length;

      const iss = closedIssues.filter((i) => {
        const t = new Date(i.closedAt).getTime();
        return t >= weekStart && t < weekEnd;
      }).length;

      result.push({ label, prs, issues: iss });
    }
    return result;
  }, [closedPRs, closedIssues]);

  const maxVal = Math.max(...weeks.map((w) => w.prs + w.issues), 1);

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
        Closed per week
      </Typography>
      {weeks.map((week) => (
        <Box key={week.label} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.25 }}>
          <Typography variant="caption" sx={{ width: 90, flexShrink: 0 }}>{week.label}</Typography>
          <Box sx={{ flex: 1, display: 'flex', height: 14, borderRadius: 1, overflow: 'hidden' }}>
            {week.prs > 0 && (
              <Box sx={{ height: '100%', bgcolor: colors.green[3], width: `${(week.prs / maxVal) * 100}%`, transition: 'width 0.3s' }} />
            )}
            {week.issues > 0 && (
              <Box sx={{ height: '100%', bgcolor: colors.orange[3], width: `${(week.issues / maxVal) * 100}%`, transition: 'width 0.3s' }} />
            )}
          </Box>
          <Typography variant="caption" sx={{ minWidth: 50 }}>
            {week.prs} PR{week.prs !== 1 ? 's' : ''}, {week.issues} iss
          </Typography>
        </Box>
      ))}
      <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 10, height: 10, borderRadius: 1, bgcolor: colors.green[3] }} />
          <Typography variant="caption" color="text.secondary">PRs</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 10, height: 10, borderRadius: 1, bgcolor: colors.orange[3] }} />
          <Typography variant="caption" color="text.secondary">Issues</Typography>
        </Box>
      </Box>
    </Box>
  );
}
