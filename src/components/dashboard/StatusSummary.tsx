import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import type { ActionItem } from '../../utils/actions';
import type { DashboardIssue, DashboardPR, DashboardReviewRequest } from '../../types/github';

interface StatusSummaryProps {
  issues: DashboardIssue[];
  prs: DashboardPR[];
  reviewRequests: DashboardReviewRequest[];
  actionItems: ActionItem[];
  isLoading: boolean;
}

export function StatusSummary({ issues, prs, reviewRequests, actionItems, isLoading }: StatusSummaryProps) {
  if (isLoading) return null;

  const parts: string[] = [];

  const approvedPRs = prs.filter((p) => p.status === 'approved').length;
  const changesRequested = prs.filter((p) => p.status === 'changes_requested').length;
  const staleIssues = actionItems.filter((a) => a.type === 'stale_issue').length;

  if (approvedPRs > 0) parts.push(`${approvedPRs} PR${approvedPRs > 1 ? 's' : ''} ready to merge`);
  if (changesRequested > 0) parts.push(`${changesRequested} PR${changesRequested > 1 ? 's' : ''} needing changes`);
  if (reviewRequests.length > 0) parts.push(`${reviewRequests.length} review${reviewRequests.length > 1 ? 's' : ''} to do`);
  if (staleIssues > 0) parts.push(`${staleIssues} stale issue${staleIssues > 1 ? 's' : ''}`);

  if (parts.length === 0 && issues.length === 0 && prs.length === 0) {
    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="body1" color="text.secondary">
          All clear — nothing on your plate right now.
        </Typography>
      </Box>
    );
  }

  if (parts.length === 0) {
    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="body1" color="text.secondary">
          You have {issues.length} issue{issues.length !== 1 ? 's' : ''} and {prs.length} PR{prs.length !== 1 ? 's' : ''} — nothing urgent.
        </Typography>
      </Box>
    );
  }

  const sentence = 'You have ' + parts.slice(0, -1).join(', ') + (parts.length > 1 ? ', and ' : '') + parts[parts.length - 1] + '.';

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="body1">
        {sentence}
      </Typography>
    </Box>
  );
}
