import { useCallback, useEffect, useRef, useState } from 'react';
import type { DashboardPR, DashboardIssue, DashboardReviewRequest } from '../types/github';

const STORAGE_KEY = 'devdash-notifications';

interface NotificationData {
  prCount: number;
  issueCount: number;
  reviewRequestCount: number;
  approvedPRs: Set<string>;
  changesRequestedPRs: Set<string>;
}

function snapshot(prs: DashboardPR[], issues: DashboardIssue[], reviews: DashboardReviewRequest[]): NotificationData {
  return {
    prCount: prs.length,
    issueCount: issues.length,
    reviewRequestCount: reviews.length,
    approvedPRs: new Set(prs.filter((p) => p.status === 'approved').map((p) => p.htmlUrl)),
    changesRequestedPRs: new Set(prs.filter((p) => p.status === 'changes_requested').map((p) => p.htmlUrl)),
  };
}

export function useNotifications(prs: DashboardPR[], issues: DashboardIssue[], reviews: DashboardReviewRequest[], isLoading: boolean) {
  const [enabled, setEnabled] = useState(() => localStorage.getItem(STORAGE_KEY) === 'true');
  const prevData = useRef<NotificationData | null>(null);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      if (next && Notification.permission === 'default') {
        Notification.requestPermission();
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (!enabled || isLoading) return;
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const current = snapshot(prs, issues, reviews);
    const prev = prevData.current;

    if (prev) {
      // New review requests
      if (current.reviewRequestCount > prev.reviewRequestCount) {
        const diff = current.reviewRequestCount - prev.reviewRequestCount;
        notify(`${diff} new review request${diff > 1 ? 's' : ''}`, 'You have new PRs to review');
      }

      // PR approved
      for (const url of current.approvedPRs) {
        if (!prev.approvedPRs.has(url)) {
          const pr = prs.find((p) => p.htmlUrl === url);
          if (pr) notify(`PR #${pr.number} approved`, pr.title, url);
        }
      }

      // Changes requested
      for (const url of current.changesRequestedPRs) {
        if (!prev.changesRequestedPRs.has(url)) {
          const pr = prs.find((p) => p.htmlUrl === url);
          if (pr) notify(`Changes requested on PR #${pr.number}`, pr.title, url);
        }
      }

      // New issue assigned
      if (current.issueCount > prev.issueCount) {
        const diff = current.issueCount - prev.issueCount;
        notify(`${diff} new issue${diff > 1 ? 's' : ''} assigned`, 'Check your dashboard');
      }
    }

    prevData.current = current;
  }, [enabled, isLoading, prs, issues, reviews]);

  return { enabled, toggle };
}

function notify(title: string, body: string, url?: string) {
  const n = new Notification(title, { body, icon: '/DevDesh/favicon.svg' });
  if (url) {
    n.onclick = () => {
      window.open(url, '_blank');
      n.close();
    };
  }
}
