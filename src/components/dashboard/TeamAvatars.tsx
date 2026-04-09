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
import type { DashboardPR, DashboardIssue } from '../../types/github';
import { formatAge } from '../../utils/dates';
import { colors } from '../../theme/colors';

interface TeamMember {
  login: string;
  avatar_url: string;
}

interface TeamAvatarsProps {
  prs: DashboardPR[];
  issues: DashboardIssue[];
}

function getMemberActivity(member: string, prs: DashboardPR[], issues: DashboardIssue[]) {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 86400000);
  const sixWeeksAgo = new Date(now.getTime() - 42 * 86400000);

  const memberPRs = prs.filter((pr) => pr.author === member);
  const memberIssues = issues.filter((issue) => issue.assignees.some((a) => a.login === member));

  return { memberPRs, memberIssues, oneWeekAgo, sixWeeksAgo };
}

export function TeamAvatars({ prs, issues }: TeamAvatarsProps) {
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
    return [...map.entries()].map(([login, avatar_url]) => ({ login, avatar_url }));
  }, [prs, issues]);

  const activity = useMemo(() => {
    if (!selectedMember) return null;
    return getMemberActivity(selectedMember.login, prs, issues);
  }, [selectedMember, prs, issues]);

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
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{selectedMember.login}</Typography>
              </Box>
              <IconButton
                onClick={() => setSelectedMember(null)}
                sx={{ position: 'absolute', right: 8, top: 8 }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              {/* This Week */}
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                This Week
              </Typography>
              <ActivitySection
                prs={activity.memberPRs}
                issues={activity.memberIssues}
                label="this week"
              />

              <Divider sx={{ my: 2 }} />

              {/* Last 6 Weeks */}
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Last 6 Weeks
              </Typography>
              <SummaryStats
                prs={activity.memberPRs}
                issues={activity.memberIssues}
              />
            </DialogContent>
          </>
        )}
      </Dialog>
    </>
  );
}

function ActivitySection({ prs, issues, label }: { prs: DashboardPR[]; issues: DashboardIssue[]; label: string }) {
  return (
    <Box>
      {prs.length > 0 && (
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            Open PRs ({prs.length})
          </Typography>
          {prs.map((pr) => (
            <Box key={pr.htmlUrl} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
              <Chip
                label={pr.status}
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
        </Box>
      )}
      {issues.length > 0 && (
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            Open Issues ({issues.length})
          </Typography>
          {issues.map((issue) => (
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
      {prs.length === 0 && issues.length === 0 && (
        <Typography variant="body2" color="text.secondary">No open items {label}.</Typography>
      )}
    </Box>
  );
}

function SummaryStats({ prs, issues }: { prs: DashboardPR[]; issues: DashboardIssue[] }) {
  const prsByWeek = useMemo(() => {
    const weeks: { label: string; prs: number; issues: number }[] = [];
    const now = new Date();
    for (let w = 0; w < 6; w++) {
      const weekEnd = new Date(now.getTime() - w * 7 * 86400000);
      const weekStart = new Date(weekEnd.getTime() - 7 * 86400000);
      const weekLabel = w === 0 ? 'This week' : w === 1 ? 'Last week' : `${w} weeks ago`;

      // Count PRs created in this week
      const weekPRs = prs.filter((pr) => {
        const created = new Date(pr.createdAt);
        return created >= weekStart && created < weekEnd;
      }).length;

      // Count issues assigned in this week (using assignedDate if < 7 days, or estimate)
      const weekIssues = issues.filter((issue) => {
        const created = new Date(issue.htmlUrl ? issue.updatedAt : issue.updatedAt); // best proxy
        const ageDays = issue.ageDays;
        const assignedDate = new Date(now.getTime() - ageDays * 86400000);
        return assignedDate >= weekStart && assignedDate < weekEnd;
      }).length;

      weeks.push({ label: weekLabel, prs: weekPRs, issues: weekIssues });
    }
    return weeks;
  }, [prs, issues]);

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
        <Box sx={{ textAlign: 'center', flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>{prs.length}</Typography>
          <Typography variant="caption" color="text.secondary">Open PRs</Typography>
        </Box>
        <Box sx={{ textAlign: 'center', flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>{issues.length}</Typography>
          <Typography variant="caption" color="text.secondary">Open Issues</Typography>
        </Box>
        <Box sx={{ textAlign: 'center', flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {prs.length > 0 ? Math.round(prs.reduce((s, p) => s + p.ageDays, 0) / prs.length) : 0}d
          </Typography>
          <Typography variant="caption" color="text.secondary">Avg PR Age</Typography>
        </Box>
        <Box sx={{ textAlign: 'center', flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {issues.length > 0 ? Math.round(issues.reduce((s, i) => s + i.ageDays, 0) / issues.length) : 0}d
          </Typography>
          <Typography variant="caption" color="text.secondary">Avg Issue Age</Typography>
        </Box>
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mt: 2, mb: 0.5 }}>
        PRs opened per week
      </Typography>
      {prsByWeek.map((week) => (
        <Box key={week.label} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.25 }}>
          <Typography variant="caption" sx={{ width: 100 }}>{week.label}</Typography>
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ height: 14, borderRadius: 1, bgcolor: colors.green[3], minWidth: week.prs > 0 ? 8 : 0, width: `${Math.min(week.prs * 20, 100)}%`, transition: 'width 0.3s' }} />
            <Typography variant="caption">{week.prs}</Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
}
