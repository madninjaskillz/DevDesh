import { useQueries } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import {
  getAssignedIssues,
  getOpenPRs,
  getRecentlyClosedIssues,
  getRecentlyClosedPRs,
  getPRReviews,
  getPRGraphQLData,
  getIssueLinkedPRs,
  type PRGraphQLData,
} from './github';
import { daysAgo } from '../utils/dates';
import { computeTrendData } from '../utils/trends';
import { REPOS, type DashboardIssue, type DashboardPR, type PRStatus, type TrendDataPoint } from '../types/github';
import { useMemo } from 'react';
import { subDays, formatISO } from 'date-fns';

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

  // Collect issue numbers per repo for linked PR lookup
  const issuesByRepo = useMemo(() => {
    return queries.map((q, idx) => ({
      ...REPOS[idx],
      issues: (q.data ?? []).map((i) => i.number),
    }));
  }, [queries.map((q) => q.data).join(',')]);

  // Fetch linked PRs for all issues per repo
  const linkedPRQueries = useQueries({
    queries: issuesByRepo.map(({ owner, repo, issues: issueNums }) => ({
      queryKey: ['issue-linked-prs', owner, repo, issueNums.join(',')],
      queryFn: () => getIssueLinkedPRs(owner, repo, issueNums, token!),
      enabled: !!token && issueNums.length > 0,
      staleTime: STALE_TIME,
    })),
  });

  const isLoading = queries.some((q) => q.isLoading) || linkedPRQueries.some((q) => q.isLoading);
  const isError = queries.some((q) => q.isError);
  const error = queries.find((q) => q.error)?.error ?? null;

  const issues: DashboardIssue[] = useMemo(() => {
    return queries
      .flatMap((q, idx) => {
        const linkedPRMap = linkedPRQueries[idx]?.data as Map<number, import('../types/github').LinkedPR[]> | undefined;
        return (q.data ?? []).map((issue) => ({
          number: issue.number,
          title: issue.title,
          htmlUrl: issue.html_url,
          labels: issue.labels,
          assignedDate: issue.created_at,
          ageDays: daysAgo(issue.created_at),
          repoName: REPOS[idx].repo,
          repoFullName: `${REPOS[idx].owner}/${REPOS[idx].repo}`,
          updatedAt: issue.updated_at,
          linkedPRs: linkedPRMap?.get(issue.number) ?? [],
        }));
      })
      .sort((a, b) => b.ageDays - a.ageDays);
  }, [queries.map((q) => q.data).join(','), linkedPRQueries.map((q) => q.dataUpdatedAt).join(',')]);

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

  // Fetch reviews and GraphQL data (threads + linked issues) for each PR
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
          queryKey: ['pr-graphql', owner, repo, pr.number],
          queryFn: () => getPRGraphQLData(owner, repo, pr.number, token!),
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
      const gqlData = enrichmentQueries[i * 2 + 1]?.data as PRGraphQLData | undefined;

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
        unresolvedThreadCount: gqlData?.unresolvedCount ?? 0,
        totalThreadCount: gqlData?.totalCount ?? 0,
        linkedIssues: gqlData?.linkedIssues ?? [],
        missingIssueLinks: [],
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

export function useTrendData() {
  const { token, user } = useAuth();
  const since = formatISO(subDays(new Date(), 30), { representation: 'date' });

  // Fetch open issues (already have these, but we need the raw GitHubIssue for created_at/closed_at)
  const openIssueQueries = useQueries({
    queries: REPOS.map(({ owner, repo }) => ({
      queryKey: ['trend-open-issues', owner, repo, user?.login],
      queryFn: () => getAssignedIssues(owner, repo, user!.login, token!),
      enabled: !!token && !!user,
      staleTime: STALE_TIME,
    })),
  });

  // Fetch recently closed issues
  const closedIssueQueries = useQueries({
    queries: REPOS.map(({ owner, repo }) => ({
      queryKey: ['trend-closed-issues', owner, repo, user?.login, since],
      queryFn: () => getRecentlyClosedIssues(owner, repo, user!.login, since, token!),
      enabled: !!token && !!user,
      staleTime: STALE_TIME,
    })),
  });

  // Fetch open PRs
  const openPRQueries = useQueries({
    queries: REPOS.map(({ owner, repo }) => ({
      queryKey: ['trend-open-prs', owner, repo],
      queryFn: () => getOpenPRs(owner, repo, token!),
      enabled: !!token && !!user,
      staleTime: STALE_TIME,
    })),
  });

  // Fetch recently closed PRs
  const closedPRQueries = useQueries({
    queries: REPOS.map(({ owner, repo }) => ({
      queryKey: ['trend-closed-prs', owner, repo, since],
      queryFn: () => getRecentlyClosedPRs(owner, repo, since, token!),
      enabled: !!token && !!user,
      staleTime: STALE_TIME,
    })),
  });

  const isLoading = [
    ...openIssueQueries,
    ...closedIssueQueries,
    ...openPRQueries,
    ...closedPRQueries,
  ].some((q) => q.isLoading);

  const trendData: TrendDataPoint[] = useMemo(() => {
    if (isLoading) return [];

    // Combine open + recently closed issues
    const allIssues = [
      ...openIssueQueries.flatMap((q) => q.data ?? []),
      ...closedIssueQueries.flatMap((q) => q.data ?? []),
    ];

    // Combine open + recently closed PRs, filtered to user's PRs
    const allPRs = [
      ...openPRQueries.flatMap((q) => q.data ?? []),
      ...closedPRQueries.flatMap((q) => q.data ?? []),
    ].filter((pr) => pr.user.login === user?.login);

    // Deduplicate by number+repo (an item could appear in both open and closed if state changed)
    const uniqueIssues = dedup(allIssues, (i) => `${i.repository_url}-${i.number}`);
    const uniquePRs = dedup(allPRs, (p) => `${p.html_url}`);

    return computeTrendData(
      uniqueIssues.map((i) => ({ created_at: i.created_at, closed_at: i.closed_at })),
      uniquePRs.map((p) => ({ created_at: p.created_at, closed_at: p.closed_at ?? p.merged_at })),
      30,
    );
  }, [
    isLoading,
    openIssueQueries.map((q) => q.dataUpdatedAt).join(','),
    closedIssueQueries.map((q) => q.dataUpdatedAt).join(','),
    openPRQueries.map((q) => q.dataUpdatedAt).join(','),
    closedPRQueries.map((q) => q.dataUpdatedAt).join(','),
    user?.login,
  ]);

  return { trendData, isLoading };
}

function dedup<T>(items: T[], key: (item: T) => string): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const k = key(item);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
