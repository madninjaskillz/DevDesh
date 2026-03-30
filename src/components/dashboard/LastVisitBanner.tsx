import { useMemo } from 'react';
import Alert from '@mui/material/Alert';
import { differenceInHours, formatDistanceToNow } from 'date-fns';
import type { DashboardIssue, DashboardPR, DashboardReviewRequest } from '../../types/github';

const VISIT_KEY = 'devdash-last-visit';
const SNAPSHOT_KEY = 'devdash-last-snapshot';

interface Snapshot {
  issueCount: number;
  prCount: number;
  reviewCount: number;
  timestamp: string;
}

export function recordVisit(issues: DashboardIssue[], prs: DashboardPR[], reviews: DashboardReviewRequest[]) {
  const snapshot: Snapshot = {
    issueCount: issues.length,
    prCount: prs.length,
    reviewCount: reviews.length,
    timestamp: new Date().toISOString(),
  };
  localStorage.setItem(VISIT_KEY, new Date().toISOString());
  localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot));
}

interface LastVisitBannerProps {
  issues: DashboardIssue[];
  prs: DashboardPR[];
  reviewRequests: DashboardReviewRequest[];
  isLoading: boolean;
}

export function LastVisitBanner({ issues, prs, reviewRequests, isLoading }: LastVisitBannerProps) {
  const message = useMemo(() => {
    if (isLoading) return null;

    const lastVisit = localStorage.getItem(VISIT_KEY);
    const snapshotRaw = localStorage.getItem(SNAPSHOT_KEY);

    if (!lastVisit || !snapshotRaw) {
      // First visit — record and skip banner
      recordVisit(issues, prs, reviewRequests);
      return null;
    }

    const lastDate = new Date(lastVisit);
    const hoursSince = differenceInHours(new Date(), lastDate);

    if (hoursSince < 12) {
      // Recent visit, no banner needed. Update snapshot.
      recordVisit(issues, prs, reviewRequests);
      return null;
    }

    const prev: Snapshot = JSON.parse(snapshotRaw);
    const changes: string[] = [];

    const newIssues = issues.length - prev.issueCount;
    const newPRs = prs.length - prev.prCount;
    const newReviews = reviewRequests.length - prev.reviewCount;

    if (newIssues > 0) changes.push(`${newIssues} new issue${newIssues > 1 ? 's' : ''} assigned`);
    if (newIssues < 0) changes.push(`${Math.abs(newIssues)} issue${Math.abs(newIssues) > 1 ? 's' : ''} closed`);
    if (newPRs > 0) changes.push(`${newPRs} new PR${newPRs > 1 ? 's' : ''}`);
    if (newPRs < 0) changes.push(`${Math.abs(newPRs)} PR${Math.abs(newPRs) > 1 ? 's' : ''} closed/merged`);
    if (newReviews > 0) changes.push(`${newReviews} new review request${newReviews > 1 ? 's' : ''}`);

    // Record the new visit
    recordVisit(issues, prs, reviewRequests);

    if (changes.length === 0) {
      return `Welcome back (last visit ${formatDistanceToNow(lastDate, { addSuffix: true })}). Nothing changed while you were away.`;
    }

    return `Since your last visit ${formatDistanceToNow(lastDate, { addSuffix: true })}: ${changes.join(', ')}.`;
  }, [isLoading, issues.length, prs.length, reviewRequests.length]);

  if (!message) return null;

  return (
    <Alert severity="info" sx={{ mb: 2 }}>
      {message}
    </Alert>
  );
}
