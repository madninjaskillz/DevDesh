import type { DashboardPR, DashboardIssue, DashboardReviewRequest } from '../types/github';
import { daysAgo, formatAge } from './dates';

export type ActionType =
  | 'merge_approved'
  | 'address_review'
  | 'unresolved_comments'
  | 'review_requested'
  | 'stale_issue'
  | 'stale_pr'
  | 'missing_link';

export type ActionSeverity = 'critical' | 'warning' | 'info';

export interface ActionItem {
  id: string;
  type: ActionType;
  priority: number;
  title: string;
  description: string;
  url: string;
  ageDays: number;
  severity: ActionSeverity;
}

export function computeActionItems(
  prs: DashboardPR[],
  issues: DashboardIssue[],
  reviewRequests: DashboardReviewRequest[],
): ActionItem[] {
  const items: ActionItem[] = [];

  // 1. Approved PRs not yet merged
  for (const pr of prs) {
    if (pr.status === 'approved') {
      items.push({
        id: `merge-${pr.repoFullName}-${pr.number}`,
        type: 'merge_approved',
        priority: 1,
        title: `Merge PR #${pr.number}`,
        description: `"${pr.title}" is approved (${formatAge(pr.ageDays)} old)`,
        url: pr.htmlUrl,
        ageDays: pr.ageDays,
        severity: pr.ageDays > 1 ? 'critical' : 'warning',
      });
    }
  }

  // 2. PRs with changes requested
  for (const pr of prs) {
    if (pr.status === 'changes_requested') {
      items.push({
        id: `review-${pr.repoFullName}-${pr.number}`,
        type: 'address_review',
        priority: 2,
        title: `Address review on PR #${pr.number}`,
        description: `"${pr.title}" has changes requested`,
        url: pr.htmlUrl,
        ageDays: pr.ageDays,
        severity: 'critical',
      });
    }
  }

  // 3. Unresolved comments > 2 days
  for (const pr of prs) {
    if (pr.unresolvedThreadCount > 0 && pr.ageDays > 2) {
      // Don't duplicate if already flagged as changes_requested
      if (pr.status === 'changes_requested') continue;
      items.push({
        id: `comments-${pr.repoFullName}-${pr.number}`,
        type: 'unresolved_comments',
        priority: 3,
        title: `Respond to comments on PR #${pr.number}`,
        description: `${pr.unresolvedThreadCount} unresolved thread${pr.unresolvedThreadCount > 1 ? 's' : ''} on "${pr.title}"`,
        url: pr.htmlUrl,
        ageDays: pr.ageDays,
        severity: 'warning',
      });
    }
  }

  // 4. Review requests waiting > 3 days
  for (const req of reviewRequests) {
    if (req.waitingDays >= 3) {
      items.push({
        id: `review-req-${req.repoFullName}-${req.number}`,
        type: 'review_requested',
        priority: 4,
        title: `Review PR #${req.number} from @${req.author}`,
        description: `"${req.title}" waiting ${formatAge(req.waitingDays)}`,
        url: req.htmlUrl,
        ageDays: req.waitingDays,
        severity: req.waitingDays >= 5 ? 'critical' : 'warning',
      });
    }
  }

  // 5. Stale issues (no activity > 7 days)
  for (const issue of issues) {
    const daysSinceUpdate = daysAgo(issue.updatedAt);
    if (daysSinceUpdate >= 7) {
      items.push({
        id: `stale-issue-${issue.repoFullName}-${issue.number}`,
        type: 'stale_issue',
        priority: 5,
        title: `Issue #${issue.number} idle for ${formatAge(daysSinceUpdate)}`,
        description: `"${issue.title}" in ${issue.repoName}`,
        url: issue.htmlUrl,
        ageDays: daysSinceUpdate,
        severity: daysSinceUpdate >= 14 ? 'critical' : 'warning',
      });
    }
  }

  // 6. PRs with no linked issues
  for (const pr of prs) {
    if (pr.linkedIssues.length === 0 && pr.missingIssueLinks.length === 0 && !pr.draft) {
      items.push({
        id: `no-link-${pr.repoFullName}-${pr.number}`,
        type: 'missing_link',
        priority: 6,
        title: `PR #${pr.number} has no linked issue`,
        description: `"${pr.title}" in ${pr.repoName}`,
        url: pr.htmlUrl,
        ageDays: pr.ageDays,
        severity: 'info',
      });
    }
  }

  // Sort by priority, then by age desc within same priority
  return items.sort((a, b) => a.priority - b.priority || b.ageDays - a.ageDays);
}
