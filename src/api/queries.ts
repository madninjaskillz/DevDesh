import { useQueries } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import {
  getAssignedIssues,
  getOpenPRs,
  getPRReviews,
  getPRReviewThreads,
} from './github';
import { daysAgo } from '../utils/dates';
import { saveDailySnapshot, loadTrendHistory } from '../utils/trends';
import { REPOS, type DashboardIssue, type DashboardPR, type PRStatus } from '../types/github';
import { useEffect, useMemo } from 'react';

const STALE_TIME = 5 * 60 * 1000;
const REFETCH_INTERVAL = 5 * 60 * 1000;

export function useAssignedIssues() {
  const { token, user } = useAuth();

  const queries = useQueries({
    queries: REPOS.map(({ owner, repo }) => ({
      queryKey: ['issues', owner, repo, user?.login],
      queryFn: () => getAssignedIssues(owner, repo, user!.login, token!),
      enabled: !!token && !!user,
      staleTime: STALE_TIME,
      refetchInterval: REFETCH_INTERVAL,
    })),
  });

  const isLoading = queries.some((q) => q.isLoading);
  const isError = queries.some((q) => q.isError);
  const error = queries.find((q) => q.error)?.error ?? null;

  const issues: DashboardIssue[] = useMemo(() => {
    return queries
      .flatMap((q, idx) =>
        (q.data ?? []).map((issue) => ({
          number: issue.number,
          title: issue.title,
          htmlUrl: issue.html_url,
          labels: issue.labels,
          assignedDate: issue.created_at,
          ageDays: daysAgo(issue.created_at),
          repoName: REPOS[idx].repo,
          repoFullName: `${REPOS[idx].owner}/${REPOS[idx].repo}`,
          updatedAt: issue.updated_at,
        })),
      )
      .sort((a, b) => b.ageDays - a.ageDays);
  }, [queries.map((q) => q.data).join(',')]);

  return { issues, isLoading, isError, error };
}

export function useOpenPRs() {
  const { token, user } = useAuth();

  const prQueries = useQueries({
    queries: REPOS.map(({ owner, repo }) => ({
      queryKey: ['prs', owner, repo],
      queryFn: () => getOpenPRs(owner, repo, token!),
      enabled: !!token && !!user,
      staleTime: STALE_TIME,
      refetchInterval: REFETCH_INTERVAL,
    })),
  });

  const allPRs = useMemo(() => {
    return prQueries.flatMap((q, idx) =>
      (q.data ?? [])
        .filter((pr) => pr.user.login === user?.login)
        .map((pr) => ({ ...pr, repoIdx: idx })),
    );
  }, [prQueries.map((q) => q.data).join(','), user?.login]);

  // Fetch reviews and thread info for each PR
  const enrichmentQueries = useQueries({
    queries: allPRs.flatMap((pr) => {
      const { owner, repo } = REPOS[pr.repoIdx];
      return [
        {
          queryKey: ['pr-reviews', owner, repo, pr.number],
          queryFn: () => getPRReviews(owner, repo, pr.number, token!),
          enabled: !!token,
          staleTime: STALE_TIME,
        },
        {
          queryKey: ['pr-threads', owner, repo, pr.number],
          queryFn: () => getPRReviewThreads(owner, repo, pr.number, token!),
          enabled: !!token,
          staleTime: STALE_TIME,
        },
      ];
    }),
  });

  const isLoading = prQueries.some((q) => q.isLoading) || enrichmentQueries.some((q) => q.isLoading);
  const isError = prQueries.some((q) => q.isError);
  const error = prQueries.find((q) => q.error)?.error ?? null;

  const dashboardPRs: DashboardPR[] = useMemo(() => {
    return allPRs.map((pr, i) => {
      const reviews = (enrichmentQueries[i * 2]?.data as Awaited<ReturnType<typeof getPRReviews>> | undefined) ?? [];
      const threadData = (enrichmentQueries[i * 2 + 1]?.data as Awaited<ReturnType<typeof getPRReviewThreads>> | undefined);

      // Determine status from latest review per reviewer
      const latestByReviewer = new Map<string, string>();
      for (const review of reviews) {
        if (review.state !== 'COMMENTED' && review.state !== 'PENDING') {
          latestByReviewer.set(review.user.login, review.state);
        }
      }

      let status: PRStatus = 'review_pending';
      if (pr.draft) {
        status = 'draft';
      } else if ([...latestByReviewer.values()].some((s) => s === 'CHANGES_REQUESTED')) {
        status = 'changes_requested';
      } else if (latestByReviewer.size > 0 && [...latestByReviewer.values()].every((s) => s === 'APPROVED')) {
        status = 'approved';
      }

      return {
        number: pr.number,
        title: pr.title,
        htmlUrl: pr.html_url,
        draft: pr.draft,
        author: pr.user.login,
        authorAvatar: pr.user.avatar_url,
        repoName: REPOS[pr.repoIdx].repo,
        repoFullName: `${REPOS[pr.repoIdx].owner}/${REPOS[pr.repoIdx].repo}`,
        createdAt: pr.created_at,
        ageDays: daysAgo(pr.created_at),
        status,
        reviews,
        unresolvedThreadCount: threadData?.unresolvedCount ?? 0,
        totalThreadCount: threadData?.totalCount ?? 0,
        headRef: pr.head.ref,
        baseRef: pr.base.ref,
      };
    }).sort((a, b) => b.ageDays - a.ageDays);
  }, [allPRs, enrichmentQueries.map((q) => q.data).join(',')]);

  return { prs: dashboardPRs, isLoading, isError, error };
}

export function useDashboardSummary(issues: DashboardIssue[], prs: DashboardPR[]) {
  const avgIssueAge = issues.length > 0
    ? Math.round(issues.reduce((sum, i) => sum + i.ageDays, 0) / issues.length)
    : 0;

  const avgPRAge = prs.length > 0
    ? Math.round(prs.reduce((sum, p) => sum + p.ageDays, 0) / prs.length)
    : 0;

  return {
    totalIssues: issues.length,
    totalPRs: prs.length,
    avgIssueAge,
    avgPRAge,
  };
}

export function useTrendData(issues: DashboardIssue[], prs: DashboardPR[], isLoading: boolean) {
  const summary = useDashboardSummary(issues, prs);

  useEffect(() => {
    if (!isLoading && (issues.length > 0 || prs.length > 0)) {
      saveDailySnapshot({
        openIssues: summary.totalIssues,
        openPRs: summary.totalPRs,
        avgIssueAgeDays: summary.avgIssueAge,
        avgPRAgeDays: summary.avgPRAge,
      });
    }
  }, [isLoading, summary.totalIssues, summary.totalPRs, summary.avgIssueAge, summary.avgPRAge]);

  return loadTrendHistory();
}
