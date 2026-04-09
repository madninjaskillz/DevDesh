import { useCallback } from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import type { DashboardIssue, DashboardPR, DashboardReviewRequest, TrendDataPoint } from '../../types/github';
import type { ActionItem } from '../../utils/actions';
import { formatAge } from '../../utils/dates';

interface ExportButtonProps {
  issues: DashboardIssue[];
  prs: DashboardPR[];
  reviewRequests: DashboardReviewRequest[];
  actionItems: ActionItem[];
  trendData?: TrendDataPoint[];
}

function sumField(arr: TrendDataPoint[], key: keyof TrendDataPoint) {
  return arr.reduce((s, d) => s + (d[key] as number), 0);
}

function avg(arr: TrendDataPoint[], key: keyof TrendDataPoint) {
  return arr.length > 0 ? Math.round(sumField(arr, key) / arr.length) : 0;
}

export function ExportButton({ issues, prs, reviewRequests, actionItems, trendData = [] }: ExportButtonProps) {
  const handleCopyStandup = useCallback(() => {
    const lines: string[] = [];
    const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' });

    lines.push(`**Standup — ${today}**`);
    lines.push('');

    if (trendData.length >= 14) {
      const thisWeek = trendData.slice(-7);
      const lastWeek = trendData.slice(-14, -7);
      const closedIssuesThis = sumField(thisWeek, 'closedIssuesToday');
      const closedIssuesLast = sumField(lastWeek, 'closedIssuesToday');
      const closedPRsThis = sumField(thisWeek, 'closedPRsToday');
      const closedPRsLast = sumField(lastWeek, 'closedPRsToday');
      lines.push('**This week velocity:**');
      lines.push(`- Issues closed: ${closedIssuesThis} (last week: ${closedIssuesLast})`);
      lines.push(`- PRs closed: ${closedPRsThis} (last week: ${closedPRsLast})`);
      lines.push('');
    }

    if (actionItems.length > 0) {
      lines.push(`**Needs attention (${actionItems.length}):**`);
      for (const item of actionItems.slice(0, 5)) {
        lines.push(`- ${item.title} — ${item.description}`);
      }
      if (actionItems.length > 5) lines.push(`- ...and ${actionItems.length - 5} more`);
      lines.push('');
    }

    lines.push(`**Open issues:** ${issues.length}`);
    for (const issue of issues.slice(0, 5)) {
      lines.push(`- #${issue.number} ${issue.title} (${issue.repoName}, ${formatAge(issue.ageDays)})`);
    }
    if (issues.length > 5) lines.push(`- ...and ${issues.length - 5} more`);
    lines.push('');

    lines.push(`**Open PRs:** ${prs.length}`);
    for (const pr of prs) {
      lines.push(`- #${pr.number} ${pr.title} [${pr.status}] (${pr.repoName}, ${formatAge(pr.ageDays)})`);
    }
    lines.push('');

    if (reviewRequests.length > 0) {
      lines.push(`**Reviews pending:** ${reviewRequests.length}`);
      for (const req of reviewRequests) {
        lines.push(`- #${req.number} ${req.title} from @${req.author}`);
      }
    }

    navigator.clipboard.writeText(lines.join('\n'));
  }, [issues, prs, reviewRequests, actionItems, trendData]);

  const handleCopyRetro = useCallback(() => {
    const lines: string[] = [];
    const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    lines.push(`**Retro Summary — ${today}**`);
    lines.push('');

    if (trendData.length >= 14) {
      const thisWeek = trendData.slice(-7);
      const lastWeek = trendData.slice(-14, -7);

      const closedIssuesThis = sumField(thisWeek, 'closedIssuesToday');
      const closedIssuesLast = sumField(lastWeek, 'closedIssuesToday');
      const closedPRsThis = sumField(thisWeek, 'closedPRsToday');
      const closedPRsLast = sumField(lastWeek, 'closedPRsToday');

      const avgCycleThis = avg(thisWeek, 'avgCycleTimeDays');
      const avgCycleLast = avg(lastWeek, 'avgCycleTimeDays');

      const avgIssueAgeThis = avg(thisWeek, 'avgIssueAgeDays');
      const avgIssueAgeLast = avg(lastWeek, 'avgIssueAgeDays');
      const avgPRAgeThis = avg(thisWeek, 'avgPRAgeDays');
      const avgPRAgeLast = avg(lastWeek, 'avgPRAgeDays');

      const delta = (curr: number, prev: number) => {
        const diff = curr - prev;
        if (diff === 0) return '(unchanged)';
        return diff > 0 ? `(+${diff} vs last week)` : `(${diff} vs last week)`;
      };

      lines.push('**Throughput:**');
      lines.push(`- Issues closed: ${closedIssuesThis} ${delta(closedIssuesThis, closedIssuesLast)}`);
      lines.push(`- PRs closed: ${closedPRsThis} ${delta(closedPRsThis, closedPRsLast)}`);
      lines.push(`- Avg PR cycle time: ${avgCycleThis}d ${delta(avgCycleThis, avgCycleLast)}`);
      lines.push('');

      lines.push('**Health:**');
      lines.push(`- Avg open issue age: ${avgIssueAgeThis}d ${delta(avgIssueAgeThis, avgIssueAgeLast)}`);
      lines.push(`- Avg open PR age: ${avgPRAgeThis}d ${delta(avgPRAgeThis, avgPRAgeLast)}`);
      lines.push(`- Open issues: ${thisWeek[thisWeek.length - 1]?.openIssues ?? 0}`);
      lines.push(`- Open PRs: ${thisWeek[thisWeek.length - 1]?.openPRs ?? 0}`);
      lines.push('');
    }

    if (trendData.length > 0) {
      const latest = trendData[trendData.length - 1];
      const staleIssues = latest.issuesAge14plus;
      const stalePRs = latest.prsAge14plus;
      if (staleIssues > 0 || stalePRs > 0) {
        lines.push('**Aging concerns:**');
        if (staleIssues > 0) lines.push(`- ${staleIssues} issue${staleIssues > 1 ? 's' : ''} older than 14 days`);
        if (stalePRs > 0) lines.push(`- ${stalePRs} PR${stalePRs > 1 ? 's' : ''} older than 14 days`);
        lines.push('');
      }
    }

    if (actionItems.length > 0) {
      lines.push(`**Outstanding actions (${actionItems.length}):**`);
      for (const item of actionItems.slice(0, 10)) {
        lines.push(`- ${item.title} — ${item.description}`);
      }
      if (actionItems.length > 10) lines.push(`- ...and ${actionItems.length - 10} more`);
    }

    navigator.clipboard.writeText(lines.join('\n'));
  }, [actionItems, trendData]);

  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Button
        size="small"
        variant="outlined"
        startIcon={<ContentCopyIcon fontSize="small" />}
        onClick={handleCopyStandup}
        sx={{ whiteSpace: 'nowrap' }}
      >
        Copy standup
      </Button>
      <Button
        size="small"
        variant="outlined"
        startIcon={<ContentCopyIcon fontSize="small" />}
        onClick={handleCopyRetro}
        sx={{ whiteSpace: 'nowrap' }}
      >
        Copy retro
      </Button>
    </Box>
  );
}
