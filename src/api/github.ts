import type { GitHubUser, GitHubIssue, GitHubPR, GitHubReview, ReviewThread, LinkedIssue, LinkedPR } from '../types/github';

const API_BASE = 'https://api.github.com';
const GRAPHQL_URL = 'https://api.github.com/graphql';

// Rate limit tracking
export interface RateLimitInfo {
  remaining: number;
  limit: number;
  resetAt: Date;
}

let _rateLimit: RateLimitInfo = { remaining: 5000, limit: 5000, resetAt: new Date() };

function trackRateLimit(res: Response) {
  const remaining = res.headers.get('X-RateLimit-Remaining');
  const limit = res.headers.get('X-RateLimit-Limit');
  const reset = res.headers.get('X-RateLimit-Reset');
  if (remaining) _rateLimit.remaining = Number(remaining);
  if (limit) _rateLimit.limit = Number(limit);
  if (reset) _rateLimit.resetAt = new Date(Number(reset) * 1000);
}

export function getRateLimit(): RateLimitInfo {
  return { ..._rateLimit };
}

function headers(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

async function fetchJSON<T>(url: string, token: string): Promise<T> {
  const res = await fetch(url, { headers: headers(token) });
  trackRateLimit(res);
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new GitHubApiError(res.status, body, res.headers);
  }
  return res.json();
}

async function fetchAllPages<T>(url: string, token: string): Promise<T[]> {
  const results: T[] = [];
  let nextUrl: string | null = `${url}${url.includes('?') ? '&' : '?'}per_page=100`;

  while (nextUrl) {
    const res = await fetch(nextUrl, { headers: headers(token) });
    trackRateLimit(res);
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new GitHubApiError(res.status, body, res.headers);
    }
    const data: T[] = await res.json();
    results.push(...data);

    const link = res.headers.get('Link');
    nextUrl = parseLinkNext(link);
  }

  return results;
}

function parseLinkNext(link: string | null): string | null {
  if (!link) return null;
  const match = link.match(/<([^>]+)>;\s*rel="next"/);
  return match?.[1] ?? null;
}

export class GitHubApiError extends Error {
  status: number;
  body: string;
  responseHeaders: Headers;

  constructor(status: number, body: string, responseHeaders: Headers) {
    super(`GitHub API error ${status}: ${body.slice(0, 200)}`);
    this.name = 'GitHubApiError';
    this.status = status;
    this.body = body;
    this.responseHeaders = responseHeaders;
  }

  get isUnauthorized() {
    return this.status === 401;
  }

  get isRateLimited() {
    return this.status === 403 || this.status === 429;
  }

  get rateLimitReset(): Date | null {
    const reset = this.responseHeaders.get('X-RateLimit-Reset');
    return reset ? new Date(Number(reset) * 1000) : null;
  }
}

export async function getUser(token: string): Promise<GitHubUser> {
  return fetchJSON<GitHubUser>(`${API_BASE}/user`, token);
}

export async function getUserTeamSlugs(token: string): Promise<string[]> {
  try {
    const teams = await fetchAllPages<{ slug: string; organization: { login: string } }>(
      `${API_BASE}/user/teams`,
      token,
    );
    return teams.map((t) => t.slug);
  } catch {
    return [];
  }
}

export async function getAssignedIssues(
  owner: string,
  repo: string,
  username: string,
  token: string,
): Promise<GitHubIssue[]> {
  const issues = await fetchAllPages<GitHubIssue>(
    `${API_BASE}/repos/${owner}/${repo}/issues?assignee=${username}&state=open&sort=created&direction=asc`,
    token,
  );
  // Filter out PRs (GitHub's issues endpoint includes PRs)
  return issues.filter((i) => !i.pull_request);
}

export async function getOpenPRs(
  owner: string,
  repo: string,
  token: string,
): Promise<GitHubPR[]> {
  return fetchAllPages<GitHubPR>(
    `${API_BASE}/repos/${owner}/${repo}/pulls?state=open&sort=created&direction=asc`,
    token,
  );
}

export async function getRecentlyClosedIssues(
  owner: string,
  repo: string,
  username: string,
  since: string,
  token: string,
): Promise<GitHubIssue[]> {
  const issues = await fetchAllPages<GitHubIssue>(
    `${API_BASE}/repos/${owner}/${repo}/issues?assignee=${username}&state=closed&since=${since}&sort=updated&direction=desc`,
    token,
  );
  return issues.filter((i) => !i.pull_request);
}

export async function getRecentlyClosedPRs(
  owner: string,
  repo: string,
  since: string,
  token: string,
): Promise<GitHubPR[]> {
  // The pulls endpoint doesn't support `since`, so we fetch sorted by updated desc
  // and stop paginating once we pass the cutoff date. We use a single page of 100
  // which should be sufficient for 30 days of closed PRs.
  const prs = await fetchJSON<GitHubPR[]>(
    `${API_BASE}/repos/${owner}/${repo}/pulls?state=closed&sort=updated&direction=desc&per_page=100`,
    token,
  );
  const cutoff = new Date(since);
  return prs.filter((pr) => {
    const closed = pr.closed_at ?? pr.merged_at;
    return closed && new Date(closed) >= cutoff;
  });
}

export async function getPRReviews(
  owner: string,
  repo: string,
  prNumber: number,
  token: string,
): Promise<GitHubReview[]> {
  return fetchAllPages<GitHubReview>(
    `${API_BASE}/repos/${owner}/${repo}/pulls/${prNumber}/reviews`,
    token,
  );
}

export type CIStatus = 'success' | 'failure' | 'pending' | 'neutral' | null;

export interface PRGraphQLData {
  threads: ReviewThread[];
  totalCount: number;
  unresolvedCount: number;
  unresolvedAuthors: { login: string; avatarUrl: string }[];
  linkedIssues: LinkedIssue[];
  ciStatus: CIStatus;
}

export async function getPRGraphQLData(
  owner: string,
  repo: string,
  prNumber: number,
  token: string,
): Promise<PRGraphQLData> {
  const query = `
    query($owner: String!, $repo: String!, $number: Int!) {
      repository(owner: $owner, name: $repo) {
        pullRequest(number: $number) {
          reviewThreads(first: 100) {
            nodes {
              isResolved
              isOutdated
              comments(first: 1) {
                totalCount
                nodes {
                  author {
                    login
                    avatarUrl
                  }
                }
              }
            }
            totalCount
          }
          commits(last: 1) {
            nodes {
              commit {
                statusCheckRollup {
                  state
                }
              }
            }
          }
          closingIssuesReferences(first: 10) {
            nodes {
              number
              title
              url
              repository {
                name
              }
            }
          }
        }
      }
    }
  `;

  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify({
      query,
      variables: { owner, repo, number: prNumber },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new GitHubApiError(res.status, body, res.headers);
  }

  const json = await res.json();
  if (json.errors) {
    throw new Error(`GraphQL error: ${JSON.stringify(json.errors)}`);
  }

  const pr = json.data.repository.pullRequest;
  const reviewThreads = pr.reviewThreads;
  const threads: ReviewThread[] = reviewThreads.nodes;
  const totalCount = reviewThreads.totalCount;
  // A thread is "active" (needs attention) if:
  // - not resolved
  // - not outdated (code changed since comment)
  // - not authored by a bot (e.g. github-advanced-security, dependabot)
  const activeThreads = threads.filter((t: any) => {
    if (t.isResolved || t.isOutdated) return false;
    const authorLogin: string = t.comments?.nodes?.[0]?.author?.login ?? '';
    if (authorLogin.endsWith('[bot]') || authorLogin === 'github-advanced-security') return false;
    return true;
  });
  const unresolvedCount = activeThreads.length;

  // Extract unique authors of active unresolved threads
  const authorMap = new Map<string, { login: string; avatarUrl: string }>();
  for (const t of activeThreads) {
    if (t.comments?.nodes?.[0]?.author) {
      const a = t.comments.nodes[0].author;
      if (!authorMap.has(a.login)) {
        authorMap.set(a.login, { login: a.login, avatarUrl: a.avatarUrl });
      }
    }
  }
  const unresolvedAuthors = [...authorMap.values()];

  const linkedIssues: LinkedIssue[] = (pr.closingIssuesReferences.nodes ?? []).map(
    (node: { number: number; title: string; url: string; repository: { name: string } }) => ({
      number: node.number,
      title: node.title,
      url: node.url,
      repoName: node.repository.name,
    }),
  );

  // CI status from the latest commit's status check rollup
  const rollupState = pr.commits?.nodes?.[0]?.commit?.statusCheckRollup?.state;
  let ciStatus: CIStatus = null;
  if (rollupState === 'SUCCESS') ciStatus = 'success';
  else if (rollupState === 'FAILURE' || rollupState === 'ERROR') ciStatus = 'failure';
  else if (rollupState === 'PENDING' || rollupState === 'EXPECTED') ciStatus = 'pending';
  else if (rollupState) ciStatus = 'neutral';

  return { threads, totalCount, unresolvedCount, unresolvedAuthors, linkedIssues, ciStatus };
}

export async function getIssueLinkedPRs(
  owner: string,
  repo: string,
  issueNumbers: number[],
  token: string,
): Promise<Map<number, LinkedPR[]>> {
  if (issueNumbers.length === 0) return new Map();

  const issueFragments = issueNumbers.map(
    (num, i) => `issue${i}: issue(number: ${num}) {
      number
      timelineItems(itemTypes: [CROSS_REFERENCED_EVENT, CONNECTED_EVENT], first: 20) {
        nodes {
          ... on CrossReferencedEvent {
            source {
              ... on PullRequest {
                number
                title
                url
                state
                repository {
                  name
                }
              }
            }
          }
          ... on ConnectedEvent {
            subject {
              ... on PullRequest {
                number
                title
                url
                state
                repository {
                  name
                }
              }
            }
          }
        }
      }
    }`,
  );

  const query = `query($owner: String!, $repo: String!) {
    repository(owner: $owner, name: $repo) {
      ${issueFragments.join('\n')}
    }
  }`;

  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify({ query, variables: { owner, repo } }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new GitHubApiError(res.status, body, res.headers);
  }

  const json = await res.json();
  // Don't throw on partial errors — extract what we can
  const repoData = json.data?.repository;
  if (!repoData) return new Map();

  const result = new Map<number, LinkedPR[]>();

  issueNumbers.forEach((num, i) => {
    const issueData = repoData[`issue${i}`];
    if (!issueData) {
      result.set(num, []);
      return;
    }

    const prs: LinkedPR[] = [];
    const seen = new Set<number>();
    for (const node of issueData.timelineItems?.nodes ?? []) {
      const prData = node.source ?? node.subject;
      if (prData?.number && !seen.has(prData.number)) {
        seen.add(prData.number);
        prs.push({
          number: prData.number,
          title: prData.title,
          url: prData.url,
          state: prData.state,
          repoName: prData.repository?.name ?? repo,
        });
      }
    }

    result.set(num, prs);
  });

  return result;
}

export async function getIssueProjectStatuses(
  owner: string,
  repo: string,
  issueNumbers: number[],
  token: string,
): Promise<Map<number, { name: string; color: string } | null>> {
  if (issueNumbers.length === 0) return new Map();

  const issueFragments = issueNumbers.map(
    (num, i) => `issue${i}: issue(number: ${num}) {
      number
      projectItems(first: 5) {
        nodes {
          fieldValueByName(name: "Status") {
            ... on ProjectV2ItemFieldSingleSelectValue {
              name
              color
            }
          }
        }
      }
    }`,
  );

  const query = `query($owner: String!, $repo: String!) {
    repository(owner: $owner, name: $repo) {
      ${issueFragments.join('\n')}
    }
  }`;

  try {
    const res = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify({ query, variables: { owner, repo } }),
    });

    if (!res.ok) return new Map();

    const json = await res.json();
    const repoData = json.data?.repository;
    if (!repoData) return new Map();

    const result = new Map<number, { name: string; color: string } | null>();

    issueNumbers.forEach((num, i) => {
      const issueData = repoData[`issue${i}`];
      if (!issueData?.projectItems?.nodes) {
        result.set(num, null);
        return;
      }

      let status: { name: string; color: string } | null = null;
      for (const item of issueData.projectItems.nodes) {
        const fv = item.fieldValueByName;
        if (fv?.name) {
          status = { name: fv.name, color: fv.color ?? 'GRAY' };
          break;
        }
      }
      result.set(num, status);
    });

    return result;
  } catch {
    // Project status is non-critical — fail silently
    return new Map();
  }
}

export interface ItemDetail {
  number: number;
  title: string;
  body: string;
  state: string;
  html_url: string;
  user: { login: string; avatar_url: string };
  created_at: string;
  updated_at: string;
  labels: { name: string; color: string }[];
}

export interface GitHubComment {
  id: number;
  body: string;
  user: { login: string; avatar_url: string };
  created_at: string;
  updated_at: string;
}

export async function getIssueDetail(
  owner: string,
  repo: string,
  number: number,
  token: string,
): Promise<ItemDetail> {
  return fetchJSON<ItemDetail>(
    `${API_BASE}/repos/${owner}/${repo}/issues/${number}`,
    token,
  );
}

export async function getItemComments(
  owner: string,
  repo: string,
  number: number,
  token: string,
): Promise<GitHubComment[]> {
  return fetchJSON<GitHubComment[]>(
    `${API_BASE}/repos/${owner}/${repo}/issues/${number}/comments?per_page=15&sort=created&direction=desc`,
    token,
  );
}

export async function getRepoEvents(
  owner: string,
  repo: string,
  token: string,
): Promise<any[]> {
  return fetchJSON<any[]>(
    `${API_BASE}/repos/${owner}/${repo}/events?per_page=100`,
    token,
  );
}

export async function getRecentCommits(
  owner: string,
  repo: string,
  username: string,
  since: string,
  token: string,
): Promise<any[]> {
  return fetchJSON<any[]>(
    `${API_BASE}/repos/${owner}/${repo}/commits?author=${username}&since=${since}&per_page=50`,
    token,
  );
}

export async function getPRBody(
  owner: string,
  repo: string,
  prNumber: number,
  token: string,
): Promise<string> {
  const pr = await fetchJSON<{ body: string | null }>(
    `${API_BASE}/repos/${owner}/${repo}/pulls/${prNumber}`,
    token,
  );
  return pr.body ?? '';
}

export async function updatePRBody(
  owner: string,
  repo: string,
  prNumber: number,
  body: string,
  token: string,
): Promise<void> {
  const res = await fetch(`${API_BASE}/repos/${owner}/${repo}/pulls/${prNumber}`, {
    method: 'PATCH',
    headers: { ...headers(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ body }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new GitHubApiError(res.status, text, res.headers);
  }
}

export interface CheckRun {
  name: string;
  status: 'queued' | 'in_progress' | 'completed';
  conclusion: 'success' | 'failure' | 'neutral' | 'cancelled' | 'skipped' | 'timed_out' | 'action_required' | null;
  html_url: string;
  started_at: string | null;
  completed_at: string | null;
}

export async function getPRCheckRuns(
  owner: string,
  repo: string,
  prNumber: number,
  token: string,
): Promise<CheckRun[]> {
  // First get the PR to find the head SHA
  const pr = await fetchJSON<{ head: { sha: string } }>(
    `${API_BASE}/repos/${owner}/${repo}/pulls/${prNumber}`,
    token,
  );
  const sha = pr.head.sha;

  const result = await fetchJSON<{ check_runs: CheckRun[] }>(
    `${API_BASE}/repos/${owner}/${repo}/commits/${sha}/check-runs?per_page=100`,
    token,
  );
  return result.check_runs;
}

export async function mergePR(
  owner: string,
  repo: string,
  prNumber: number,
  token: string,
): Promise<void> {
  const res = await fetch(`${API_BASE}/repos/${owner}/${repo}/pulls/${prNumber}/merge`, {
    method: 'PUT',
    headers: { ...headers(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ merge_method: 'squash' }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new GitHubApiError(res.status, text, res.headers);
  }
}
