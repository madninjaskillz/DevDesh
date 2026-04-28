import type { DashboardPR, DashboardIssue, DashboardReviewRequest } from '../types/github';
import { daysAgo, formatAge } from './dates';

export type ActionType =
  | 'merge_approved'
  | 'address_review'
  | 'unresolved_comments'
  | 'review_requested'
  | 'stale_issue'
  | 'stale_pr'
  | 'missing_link'
  | 'meeting';

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

export interface StaleThresholds {
  staleIssueDays: number;
  staleCommentDays: number;
  staleReviewRequestDays: number;
}

const DEFAULT_THRESHOLDS: StaleThresholds = {
  staleIssueDays: 7,
  staleCommentDays: 2,
  staleReviewRequestDays: 3,
};

export function computeActionItems(
  prs: DashboardPR[],
  issues: DashboardIssue[],
  reviewRequests: DashboardReviewRequest[],
  thresholds: StaleThresholds = DEFAULT_THRESHOLDS,
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

  // 3. Unresolved comments > threshold days
  for (const pr of prs) {
    if (pr.unresolvedThreadCount > 0 && pr.ageDays > thresholds.staleCommentDays) {
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

  // 4. Review requests waiting > threshold days
  for (const req of reviewRequests) {
    if (req.waitingDays >= thresholds.staleReviewRequestDays) {
      items.push({
        id: `review-req-${req.repoFullName}-${req.number}`,
        type: 'review_requested',
        priority: 4,
        title: `Review PR #${req.number} from @${req.author}`,
        description: `"${req.title}" waiting ${formatAge(req.waitingDays)}`,
        url: req.htmlUrl,
        ageDays: req.waitingDays,
        severity: req.waitingDays >= thresholds.staleReviewRequestDays + 2 ? 'critical' : 'warning',
      });
    }
  }

  // 5. Stale issues (no activity > threshold days)
  for (const issue of issues) {
    const daysSinceUpdate = daysAgo(issue.updatedAt);
    if (daysSinceUpdate >= thresholds.staleIssueDays) {
      items.push({
        id: `stale-issue-${issue.repoFullName}-${issue.number}`,
        type: 'stale_issue',
        priority: 5,
        title: `Issue #${issue.number} idle for ${formatAge(daysSinceUpdate)}`,
        description: `"${issue.title}" in ${issue.repoName}`,
        url: issue.htmlUrl,
        ageDays: daysSinceUpdate,
        severity: daysSinceUpdate >= thresholds.staleIssueDays * 2 ? 'critical' : 'warning',
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

export interface MeetingLike {
  id: string;
  subject: string;
  start: string; // ISO
  end: string;   // ISO
  location?: string;
  organizer?: string;
  isAllDay?: boolean;
  url?: string;
}

export function computeMeetingActions(meetings: MeetingLike[], now: Date = new Date()): ActionItem[] {
  const items: ActionItem[] = [];
  const nowMs = now.getTime();
  const dayEnd = new Date(now); dayEnd.setHours(23, 59, 59, 999);

  for (const m of meetings) {
    const startMs = Date.parse(m.start);
    const endMs = Date.parse(m.end);
    if (Number.isNaN(startMs) || Number.isNaN(endMs)) continue;
    if (m.isAllDay) continue;
    if (endMs < nowMs) continue;
    if (startMs > dayEnd.getTime()) continue;

    const minsUntil = Math.round((startMs - nowMs) / 60000);
    const inProgress = startMs <= nowMs && endMs > nowMs;
    const startLabel = new Date(startMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let priority: number;
    let severity: ActionSeverity;
    let title: string;

    if (inProgress) {
      priority = 0;
      severity = 'critical';
      title = `Now: ${m.subject}`;
    } else if (minsUntil <= 15) {
      priority = 0;
      severity = 'critical';
      title = `In ${minsUntil}m: ${m.subject}`;
    } else if (minsUntil <= 60) {
      priority = 0.5;
      severity = 'warning';
      title = `In ${minsUntil}m: ${m.subject}`;
    } else {
      priority = 1.5;
      severity = 'info';
      title = `${startLabel}: ${m.subject}`;
    }

    const descParts: string[] = [];
    if (m.location) descParts.push(m.location);
    if (m.organizer) descParts.push(`organized by ${m.organizer}`);
    const description = descParts.length > 0 ? descParts.join(' — ') : `Meeting at ${startLabel}`;

    items.push({
      id: `meeting-${m.id}`,
      type: 'meeting',
      priority,
      title,
      description,
      url: m.url ?? '',
      ageDays: 0,
      severity,
    });
  }

  return items.sort((a, b) => a.priority - b.priority);
}
