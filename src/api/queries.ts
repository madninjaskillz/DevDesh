import { useQueries } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { useRepoConfig } from '../hooks/useRepoConfig';
import {
  getAssignedIssues,
  getOpenPRs,
  getRecentlyClosedIssues,
  getRecentlyClosedPRs,
  getBatchedPREnrichment,
  getIssueLinkedPRs,
  getIssueAssignmentDates,
  getIssueProjectStatuses,
  getUserTeamSlugs,
  getRepoEvents,
  getRecentCommits,
  type PRGraphQLData,
} from './github';
import { daysAgo } from '../utils/dates';
import { computeTrendData } from '../utils/trends';
import type { DashboardIssue, DashboardPR, DashboardReviewRequest, DashboardCommit, ActivityEvent, AwaitingReviewPR, ReviewPriority, PRStatus, TrendDataPoint, GitHubIssue, GitHubPR } from '../types/github';
import { useMemo } from 'react';
import { subDays, formatISO } from 'date-fns';

const STALE_TIME = 5 * 60 * 1000;
const REFETCH_INTERVAL = 5 * 60 * 1000;

export function useAssignedIssues(teamMode = false) {
  const { token, user } = useAuth();
  const { repos } = useRepoConfig();

  const queries = useQueries({
    queries: repos.map(({ owner, repo }) => ({
      queryKey: ['issues', owner, repo, teamMode ? '__all__' : user?.login],
      queryFn: () => getAssignedIssues(owner, repo, teamMode ? null : user!.login, token!),
      enabled: !!token && !!user,
      staleTime: STALE_TIME,
      refetchInterval: REFETCH_INTERVAL,
      refetchOnWindowFocus: true,
    })),
  });

  const issuesByRepo = useMemo(() => {
    return queries.map((q, idx) => ({
      ...repos[idx],
      issues: (q.data ?? []).map((i) => i.number),
    }));
  }, [queries.map((q) => q.dataUpdatedAt).join(','), repos]);

  const linkedPRQueries = useQueries({
    queries: issuesByRepo.map(({ owner, repo, issues: issueNums }) => ({
      queryKey: ['issue-linked-prs', owner, repo, issueNums.join(',')],
      queryFn: () => getIssueLinkedPRs(owner, repo, issueNums, token!),
      enabled: !!token && issueNums.length > 0,
      staleTime: STALE_TIME,
    })),
  });

  const projectStatusQueries = useQueries({
    queries: issuesByRepo.map(({ owner, repo, issues: issueNums }) => ({
      queryKey: ['issue-project-status', owner, repo, issueNums.join(',')],
      queryFn: () => getIssueProjectStatuses(owner, repo, issueNums, token!),
      enabled: !!token && issueNums.length > 0,
      staleTime: STALE_TIME,
    })),
  });

  const assignmentDateQueries = useQueries({
    queries: issuesByRepo.map(({ owner, repo, issues: issueNums }) => ({
      queryKey: ['issue-assignment-date', owner, repo, user?.login, issueNums.join(',')],
      queryFn: () => getIssueAssignmentDates(owner, repo, issueNums, user!.login, token!),
      enabled: !!token && !!user && issueNums.length > 0,
      staleTime: STALE_TIME,
    })),
  });

  const isLoading = queries.some((q) => q.isLoading) || linkedPRQueries.some((q) => q.isLoading);
  const isError = queries.some((q) => q.isError);
  const error = queries.find((q) => q.error)?.error ?? null;

  const issues: DashboardIssue[] = useMemo(() => {
    return queries
      .flatMap((q, idx) => {
        const linkedPRMap = linkedPRQueries[idx]?.data as Record<number, import('../types/github').LinkedPR[]> | undefined;
        const statusMap = projectStatusQueries[idx]?.data as Record<number, { name: string; color: string } | null> | undefined;
        const assignmentDateMap = assignmentDateQueries[idx]?.data as Record<number, string | null> | undefined;
        return (q.data ?? []).map((issue) => {
          const assignedDate = recordGet(assignmentDateMap, issue.number) ?? issue.created_at;
          return {
            number: issue.number,
            title: issue.title,
            htmlUrl: issue.html_url,
            labels: issue.labels,
            assignedDate,
            ageDays: daysAgo(assignedDate),
            repoName: repos[idx].repo,
            repoFullName: `${repos[idx].owner}/${repos[idx].repo}`,
            updatedAt: issue.updated_at,
            linkedPRs: recordGet(linkedPRMap, issue.number) ?? [],
            projectStatus: recordGet(statusMap, issue.number) ?? null,
            assignees: issue.assignees ?? [],
          };
        });
      })
      .sort((a, b) => b.ageDays - a.ageDays);
  }, [queries.map((q) => q.dataUpdatedAt).join(','), linkedPRQueries.map((q) => q.dataUpdatedAt).join(','), projectStatusQueries.map((q) => q.dataUpdatedAt).join(','), assignmentDateQueries.map((q) => q.dataUpdatedAt).join(','), repos]);

  return { issues, isLoading, isError, error };
}

export function useOpenPRs(teamMode = false) {
  const { token, user } = useAuth();
  const { repos } = useRepoConfig();

  const prQueries = useQueries({
    queries: repos.map(({ owner, repo }) => ({
      queryKey: ['prs', owner, repo],
      queryFn: () => getOpenPRs(owner, repo, token!),
      enabled: !!token && !!user,
      staleTime: STALE_TIME,
      refetchInterval: REFETCH_INTERVAL,
      refetchOnWindowFocus: true,
    })),
  });

  // Group PRs by repo for batched enrichment (1 query per repo instead of N×2)
  const prsByRepo = useMemo(() => {
    return prQueries.map((q, idx) => {
      const filtered = (q.data ?? [])
        .filter((pr) => teamMode || pr.user.login === user?.login);
      return {
        ...repos[idx],
        prs: filtered,
        numbers: filtered.map((pr) => pr.number),
      };
    });
  }, [prQueries.map((q) => q.dataUpdatedAt).join(','), user?.login, teamMode, repos]);

  // One batched enrichment query per repo (reviews + GraphQL in a single request)
  const enrichmentQueries = useQueries({
    queries: prsByRepo.map(({ owner, repo, numbers }) => ({
      queryKey: ['pr-enrichment-batch', owner, repo, numbers.join(',')],
      queryFn: () => getBatchedPREnrichment(owner, repo, numbers, token!),
      enabled: !!token && numbers.length > 0,
      staleTime: STALE_TIME,
    })),
  });

  const isLoading = prQueries.some((q) => q.isLoading) || enrichmentQueries.some((q) => q.isLoading);
  const isError = prQueries.some((q) => q.isError);
  const error = prQueries.find((q) => q.error)?.error ?? null;

  const dashboardPRs: DashboardPR[] = useMemo(() => {
    return prsByRepo.flatMap((repoGroup, repoIdx) => {
      const enrichment = enrichmentQueries[repoIdx]?.data as Record<number, { graphql: PRGraphQLData; reviews: import('../types/github').GitHubReview[] }> | undefined;

      return repoGroup.prs.map((pr) => {
        const prEnrichment = enrichment?.[pr.number];
        const reviews = prEnrichment?.reviews ?? [];
        const gqlData = prEnrichment?.graphql;

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
          repoName: repoGroup.repo,
          repoFullName: `${repoGroup.owner}/${repoGroup.repo}`,
          createdAt: pr.created_at,
          updatedAt: pr.updated_at,
          ageDays: daysAgo(pr.created_at),
          status,
          reviews,
          unresolvedThreadCount: gqlData?.unresolvedCount ?? 0,
          unresolvedAuthors: gqlData?.unresolvedAuthors ?? [],
          totalThreadCount: gqlData?.totalCount ?? 0,
          reviewers: pr.requested_reviewers ?? [],
          linkedIssues: gqlData?.linkedIssues ?? [],
          missingIssueLinks: [],
          ciStatus: gqlData?.ciStatus ?? null,
          labels: pr.labels ?? [],
          headRef: pr.head.ref,
          baseRef: pr.base.ref,
        };
      });
    }).sort((a, b) => b.ageDays - a.ageDays);
  }, [prsByRepo, enrichmentQueries.map((q) => q.dataUpdatedAt).join(',')]);

  return { prs: dashboardPRs, isLoading, isError, error };
}

export function useReviewRequests() {
  const { token, user } = useAuth();
  const { repos } = useRepoConfig();

  // Reuses the same ['prs', owner, repo] cache keys — TanStack Query deduplicates.
  // No refetchInterval/refetchOnWindowFocus here; useOpenPRs already drives those.
  const prQueries = useQueries({
    queries: repos.map(({ owner, repo }) => ({
      queryKey: ['prs', owner, repo],
      queryFn: () => getOpenPRs(owner, repo, token!),
      enabled: !!token && !!user,
      staleTime: STALE_TIME,
    })),
  });

  const isLoading = prQueries.some((q) => q.isLoading);
  const isError = prQueries.some((q) => q.isError);
  const error = prQueries.find((q) => q.error)?.error ?? null;

  const requests: DashboardReviewRequest[] = useMemo(() => {
    return prQueries
      .flatMap((q, idx) =>
        (q.data ?? [])
          .filter((pr) => pr.requested_reviewers.some((r) => r.login === user?.login))
          .map((pr) => ({
            number: pr.number,
            title: pr.title,
            htmlUrl: pr.html_url,
            repoName: repos[idx].repo,
            repoFullName: `${repos[idx].owner}/${repos[idx].repo}`,
            author: pr.user.login,
            authorAvatar: pr.user.avatar_url,
            createdAt: pr.created_at,
            updatedAt: pr.updated_at,
            waitingDays: daysAgo(pr.created_at),
          })),
      )
      .sort((a, b) => b.waitingDays - a.waitingDays);
  }, [prQueries.map((q) => q.dataUpdatedAt).join(','), user?.login, repos]);

  return { requests, isLoading, isError, error };
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

export function useTrendData(teamMode = false) {
  const { token, user } = useAuth();
  const { repos } = useRepoConfig();
  const since = formatISO(subDays(new Date(), 90), { representation: 'date' });
  const loginOrAll = teamMode ? null : user?.login ?? null;

  const openIssueQueries = useQueries({
    queries: repos.map(({ owner, repo }) => ({
      queryKey: ['trend-open-issues', owner, repo, teamMode ? '__all__' : user?.login],
      queryFn: () => getAssignedIssues(owner, repo, loginOrAll, token!),
      enabled: !!token && !!user,
      staleTime: STALE_TIME,
    })),
  });

  const closedIssueQueries = useQueries({
    queries: repos.map(({ owner, repo }) => ({
      queryKey: ['trend-closed-issues', owner, repo, teamMode ? '__all__' : user?.login, since],
      queryFn: () => getRecentlyClosedIssues(owner, repo, loginOrAll, since, token!),
      enabled: !!token && !!user,
      staleTime: STALE_TIME,
    })),
  });

  // Always fetch all closed issues (unfiltered) for team member summaries
  const allClosedIssueQueries = useQueries({
    queries: teamMode ? [] : repos.map(({ owner, repo }) => ({
      queryKey: ['trend-closed-issues', owner, repo, '__all__', since],
      queryFn: () => getRecentlyClosedIssues(owner, repo, null, since, token!),
      enabled: !!token && !!user,
      staleTime: STALE_TIME,
    })),
  });

  const openPRQueries = useQueries({
    queries: repos.map(({ owner, repo }) => ({
      queryKey: ['trend-open-prs', owner, repo],
      queryFn: () => getOpenPRs(owner, repo, token!),
      enabled: !!token && !!user,
      staleTime: STALE_TIME,
    })),
  });

  const closedPRQueries = useQueries({
    queries: repos.map(({ owner, repo }) => ({
      queryKey: ['trend-closed-prs', owner, repo, since],
      queryFn: () => getRecentlyClosedPRs(owner, repo, since, token!),
      enabled: !!token && !!user,
      staleTime: STALE_TIME,
    })),
  });

  // Collect per-repo issue numbers so trend-age calculations can use assignment date, not creation date.
  // In teamMode there is no single user to measure assignment-for, so we skip this fetch and fall back to created_at.
  const trendIssueNumbersByRepo = useMemo(() => {
    return repos.map((_, idx) => {
      const open = openIssueQueries[idx]?.data ?? [];
      const closed = closedIssueQueries[idx]?.data ?? [];
      const nums = Array.from(new Set([...open, ...closed].map((i) => i.number)));
      nums.sort((a, b) => a - b);
      return nums;
    });
  }, [openIssueQueries.map((q) => q.dataUpdatedAt).join(','), closedIssueQueries.map((q) => q.dataUpdatedAt).join(','), repos]);

  const assignmentDateQueries = useQueries({
    queries: repos.map(({ owner, repo }, idx) => {
      const nums = trendIssueNumbersByRepo[idx] ?? [];
      return {
        queryKey: ['trend-issue-assignment-date', owner, repo, user?.login, nums.join(',')],
        queryFn: () => getIssueAssignmentDates(owner, repo, nums, user!.login, token!),
        enabled: !!token && !!user && !teamMode && nums.length > 0,
        staleTime: STALE_TIME,
      };
    }),
  });

  const isLoading = [
    ...openIssueQueries,
    ...closedIssueQueries,
    ...openPRQueries,
    ...closedPRQueries,
    ...allClosedIssueQueries,
    ...assignmentDateQueries,
  ].some((q) => q.isLoading);

  const { trendData, closedIssues, closedPRs } = useMemo(() => {
    if (isLoading) return { trendData: [] as TrendDataPoint[], closedIssues: [] as GitHubIssue[], closedPRs: [] as GitHubPR[] };

    const allIssues = repos.flatMap((_, idx) => {
      const assignmentMap = assignmentDateQueries[idx]?.data as Record<number, string | null> | undefined;
      const open = openIssueQueries[idx]?.data ?? [];
      const closed = closedIssueQueries[idx]?.data ?? [];
      return [...open, ...closed].map((i) => ({
        ...i,
        assigned_at: recordGet(assignmentMap, i.number) ?? null,
      }));
    });

    const allPRs = [
      ...openPRQueries.flatMap((q) => q.data ?? []),
      ...closedPRQueries.flatMap((q) => q.data ?? []),
    ].filter((pr) => teamMode || pr.user.login === user?.login);

    const uniqueIssues = dedup(allIssues, (i) => `${i.repository_url}-${i.number}`);
    const uniquePRs = dedup(allPRs, (p) => `${p.html_url}`);

    const td = computeTrendData(
      uniqueIssues.map((i) => ({ created_at: i.created_at, closed_at: i.closed_at, assigned_at: i.assigned_at })),
      uniquePRs.map((p) => ({ created_at: p.created_at, closed_at: p.closed_at ?? p.merged_at, merged_at: p.merged_at })),
      90,
    );

    // Unfiltered closed items for team member summaries
    const allClosedIssueData = teamMode
      ? closedIssueQueries.flatMap((q) => q.data ?? [])
      : allClosedIssueQueries.flatMap((q) => q.data ?? []);
    const allClosedPRData = closedPRQueries.flatMap((q) => q.data ?? []);

    const ci = dedup(allClosedIssueData, (i) => `${i.repository_url}-${i.number}`).filter((i) => i.closed_at !== null);
    const cp = dedup(allClosedPRData, (p) => `${p.html_url}`).filter((p) => p.closed_at !== null || p.merged_at !== null);

    return { trendData: td, closedIssues: ci, closedPRs: cp };
  }, [
    isLoading,
    openIssueQueries.map((q) => q.dataUpdatedAt).join(','),
    closedIssueQueries.map((q) => q.dataUpdatedAt).join(','),
    openPRQueries.map((q) => q.dataUpdatedAt).join(','),
    closedPRQueries.map((q) => q.dataUpdatedAt).join(','),
    allClosedIssueQueries.map((q) => q.dataUpdatedAt).join(','),
    assignmentDateQueries.map((q) => q.dataUpdatedAt).join(','),
    user?.login,
    teamMode,
  ]);

  return { trendData, closedIssues, closedPRs, isLoading };
}

export function useAwaitingReview() {
  const { token, user } = useAuth();
  const { repos } = useRepoConfig();

  // Shares ['prs', owner, repo] cache with useOpenPRs — no need for own refetch config
  const prQueries = useQueries({
    queries: repos.map(({ owner, repo }) => ({
      queryKey: ['prs', owner, repo],
      queryFn: () => getOpenPRs(owner, repo, token!),
      enabled: !!token && !!user,
      staleTime: STALE_TIME,
    })),
  });

  const teamQuery = useQueries({
    queries: [{
      queryKey: ['user-teams'],
      queryFn: () => getUserTeamSlugs(token!),
      enabled: !!token,
      staleTime: 30 * 60 * 1000, // 30 min — teams don't change often
    }],
  });

  const isLoading = prQueries.some((q) => q.isLoading) || teamQuery.some((q) => q.isLoading);

  const awaitingReview: AwaitingReviewPR[] = useMemo(() => {
    const myTeams = new Set(teamQuery[0]?.data ?? []);
    const login = user?.login;
    if (!login) return [];

    return prQueries
      .flatMap((q, idx) =>
        (q.data ?? [])
          .filter((pr) => pr.user.login !== login && !pr.draft) // Not my PRs, not drafts
          .map((pr) => {
            const requestedMe = pr.requested_reviewers.some((r) => r.login === login);
            const requestedMyTeam = (pr.requested_teams ?? []).some((t) => myTeams.has(t.slug));

            let priority: ReviewPriority;
            if (requestedMe) priority = 'requested_me';
            else if (requestedMyTeam) priority = 'requested_team';
            else priority = 'other';

            return {
              number: pr.number,
              title: pr.title,
              htmlUrl: pr.html_url,
              repoName: repos[idx].repo,
              repoFullName: `${repos[idx].owner}/${repos[idx].repo}`,
              author: pr.user.login,
              authorAvatar: pr.user.avatar_url,
              createdAt: pr.created_at,
              updatedAt: pr.updated_at,
              ageDays: daysAgo(pr.created_at),
              draft: pr.draft,
              priority,
              requestedReviewers: pr.requested_reviewers.map((r) => r.login),
              requestedTeams: (pr.requested_teams ?? []).map((t) => t.name),
            };
          })
          // Only include PRs that are waiting for review (have requested reviewers/teams, or no reviews yet)
          .filter((pr) => pr.priority === 'requested_me' || pr.priority === 'requested_team' || pr.requestedReviewers.length > 0 || pr.requestedTeams.length > 0),
      )
      .sort((a, b) => {
        const priorityOrder: Record<ReviewPriority, number> = { requested_me: 0, requested_team: 1, other: 2 };
        const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (pDiff !== 0) return pDiff;
        return b.ageDays - a.ageDays;
      });
  }, [prQueries.map((q) => q.dataUpdatedAt).join(','), teamQuery[0]?.data, user?.login, repos]);

  return { awaitingReview, isLoading };
}

export function useActivityFeed() {
  const { token, user } = useAuth();
  const { repos } = useRepoConfig();

  const queries = useQueries({
    queries: repos.map(({ owner, repo }) => ({
      queryKey: ['events', owner, repo],
      queryFn: () => getRepoEvents(owner, repo, token!),
      enabled: !!token && !!user,
      staleTime: STALE_TIME,
      refetchInterval: REFETCH_INTERVAL,
    })),
  });

  const isLoading = queries.some((q) => q.isLoading);

  const events: ActivityEvent[] = useMemo(() => {
    const cutoff = subDays(new Date(), 2).toISOString();
    const allEvents: ActivityEvent[] = [];

    queries.forEach((q, idx) => {
      for (const evt of q.data ?? []) {
        if (evt.created_at < cutoff) continue;
        // Only events involving the current user
        const actorLogin = evt.actor?.login;
        const isMe = actorLogin === user?.login;
        const payload = evt.payload ?? {};

        let title = '';
        let url = '';
        let action = evt.type;

        if (evt.type === 'IssueCommentEvent') {
          title = `Commented on #${payload.issue?.number}: ${payload.issue?.title ?? ''}`;
          url = payload.comment?.html_url ?? payload.issue?.html_url ?? '';
          action = 'commented';
        } else if (evt.type === 'PullRequestReviewEvent') {
          title = `Reviewed PR #${payload.pull_request?.number}: ${payload.pull_request?.title ?? ''}`;
          url = payload.review?.html_url ?? payload.pull_request?.html_url ?? '';
          action = payload.review?.state ?? 'reviewed';
        } else if (evt.type === 'PullRequestEvent') {
          title = `${payload.action} PR #${payload.pull_request?.number}: ${payload.pull_request?.title ?? ''}`;
          url = payload.pull_request?.html_url ?? '';
          action = payload.action ?? 'updated';
        } else if (evt.type === 'IssuesEvent') {
          title = `${payload.action} issue #${payload.issue?.number}: ${payload.issue?.title ?? ''}`;
          url = payload.issue?.html_url ?? '';
          action = payload.action ?? 'updated';
        } else if (evt.type === 'PushEvent') {
          if (!isMe) continue;
          const count = payload.commits?.length ?? 0;
          title = `Pushed ${count} commit${count !== 1 ? 's' : ''}`;
          url = `https://github.com/${repos[idx].owner}/${repos[idx].repo}/compare/${payload.before?.slice(0, 7)}...${payload.head?.slice(0, 7)}`;
          action = 'pushed';
        } else {
          continue;
        }

        allEvents.push({
          id: evt.id,
          type: evt.type,
          action,
          title,
          url,
          actor: { login: actorLogin ?? '', avatar_url: evt.actor?.avatar_url ?? '' },
          repoName: repos[idx].repo,
          timestamp: evt.created_at,
        });
      }
    });

    return allEvents.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [queries.map((q) => q.dataUpdatedAt).join(','), user?.login, repos]);

  return { events, isLoading };
}

export function useRecentCommits(teamMode = false) {
  const { token, user } = useAuth();
  const { repos } = useRepoConfig();
  const since = formatISO(subDays(new Date(), 30), { representation: 'date' });

  const queries = useQueries({
    queries: repos.map(({ owner, repo }) => ({
      queryKey: ['commits', owner, repo, teamMode ? '__all__' : user?.login, since],
      queryFn: () => getRecentCommits(owner, repo, teamMode ? null : user!.login, since, token!),
      enabled: !!token && !!user,
      staleTime: STALE_TIME,
    })),
  });

  const isLoading = queries.some((q) => q.isLoading);

  const commits: DashboardCommit[] = useMemo(() => {
    return queries
      .flatMap((q, idx) =>
        (q.data ?? []).map((c: any) => ({
          sha: c.sha,
          message: c.commit?.message ?? '',
          url: c.html_url,
          repoName: repos[idx].repo,
          repoFullName: `${repos[idx].owner}/${repos[idx].repo}`,
          date: c.commit?.author?.date ?? c.commit?.committer?.date ?? '',
        })),
      )
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [queries.map((q) => q.dataUpdatedAt).join(','), repos]);

  return { commits, isLoading };
}

/** Get from a Record<number, V> — keys may be numbers or strings after JSON round-trip */
function recordGet<V>(obj: Record<number, V> | undefined, key: number): V | undefined {
  if (!obj) return undefined;
  return obj[key] ?? obj[String(key) as any];
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
