import { useCallback } from 'react';
import Button from '@mui/material/Button';
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

export function ExportButton({ issues, prs, reviewRequests, actionItems, trendData = [] }: ExportButtonProps) {
  const handleCopy = useCallback(() => {
    const lines: string[] = [];
    const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' });

    lines.push(`**Standup — ${today}**`);
    lines.push('');

    if (trendData.length >= 14) {
      const thisWeek = trendData.slice(-7);
      const lastWeek = trendData.slice(-14, -7);
      const sum = (arr: TrendDataPoint[], key: keyof TrendDataPoint) => arr.reduce((s, d) => s + (d[key] as number), 0);
      const closedIssuesThis = sum(thisWeek, 'closedIssuesToday');
      const closedIssuesLast = sum(lastWeek, 'closedIssuesToday');
      const closedPRsThis = sum(thisWeek, 'closedPRsToday');
      const closedPRsLast = sum(lastWeek, 'closedPRsToday');
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
  }, [issues, prs, reviewRequests, actionItems]);

  return (
    <Button
      size="small"
      variant="outlined"
      startIcon={<ContentCopyIcon fontSize="small" />}
      onClick={handleCopy}
      sx={{ whiteSpace: 'nowrap' }}
    >
      Copy standup
    </Button>
  );
}
