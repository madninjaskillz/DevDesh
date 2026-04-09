import { useState, useMemo } from 'react';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MergeIcon from '@mui/icons-material/CallMerge';
import type { DashboardPR, DashboardIssue, DashboardReviewRequest, AwaitingReviewPR, GitHubIssue, GitHubPR } from '../../types/github';
import { formatAge } from '../../utils/dates';
import { colors } from '../../theme/colors';

interface TeamMember {
  login: string;
  avatar_url: string;
}

interface TeamAvatarsProps {
  prs: DashboardPR[];
  issues: DashboardIssue[];
  reviewRequests: DashboardReviewRequest[];
  awaitingReview: AwaitingReviewPR[];
  closedIssues: GitHubIssue[];
  closedPRs: GitHubPR[];
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

export function TeamAvatars({ prs, issues, reviewRequests, awaitingReview, closedIssues, closedPRs }: TeamAvatarsProps) {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const members = useMemo(() => {
    const map = new Map<string, string>();
    for (const pr of prs) {
      if (!map.has(pr.author)) map.set(pr.author, pr.authorAvatar);
    }
    for (const issue of issues) {
      for (const a of issue.assignees) {
        if (!map.has(a.login)) map.set(a.login, a.avatar_url);
      }
    }
    for (const pr of prs) {
      for (const r of pr.reviewers) {
        if (!map.has(r.login)) map.set(r.login, r.avatar_url);
      }
      for (const r of pr.reviews) {
        if (!map.has(r.user.login)) map.set(r.user.login, r.user.avatar_url);
      }
    }
    for (const req of reviewRequests) {
      if (!map.has(req.author)) map.set(req.author, req.authorAvatar);
    }
    for (const pr of awaitingReview) {
      if (!map.has(pr.author)) map.set(pr.author, pr.authorAvatar);
    }
    // Closed PR authors
    for (const pr of closedPRs) {
      if (!map.has(pr.user.login)) map.set(pr.user.login, pr.user.avatar_url);
    }
    // Closed issue assignees
    for (const issue of closedIssues) {
      for (const a of issue.assignees ?? []) {
        if (!map.has(a.login)) map.set(a.login, a.avatar_url);
      }
    }
    return [...map.entries()].map(([login, avatar_url]) => ({ login, avatar_url }));
  }, [prs, issues, reviewRequests, awaitingReview, closedIssues, closedPRs]);

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
      <AvatarGroup
        max={8}
        sx={{
          '& .MuiAvatar-root': { width: 28, height: 28, fontSize: '0.7rem', cursor: 'pointer' },
        }}
      >
        {members.map((m) => (
          <Tooltip key={m.login} title={m.login}>
            <Avatar
              src={m.avatar_url}
              alt={m.login}
              onClick={() => setSelectedMember(m)}
            />
          </Tooltip>
        ))}
      </AvatarGroup>

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
