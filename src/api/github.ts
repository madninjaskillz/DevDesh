import type { GitHubUser, GitHubIssue, GitHubPR, GitHubReview, ReviewThread } from '../types/github';

const API_BASE = 'https://api.github.com';
const GRAPHQL_URL = 'https://api.github.com/graphql';

function headers(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

async function fetchJSON<T>(url: string, token: string): Promise<T> {
  const res = await fetch(url, { headers: headers(token) });
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

export async function getPRReviewThreads(
  owner: string,
  repo: string,
  prNumber: number,
  token: string,
): Promise<{ threads: ReviewThread[]; totalCount: number; unresolvedCount: number }> {
  const query = `
    query($owner: String!, $repo: String!, $number: Int!) {
      repository(owner: $owner, name: $repo) {
        pullRequest(number: $number) {
          reviewThreads(first: 100) {
            nodes {
              isResolved
              comments {
                totalCount
              }
            }
            totalCount
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

  const reviewThreads = json.data.repository.pullRequest.reviewThreads;
  const threads: ReviewThread[] = reviewThreads.nodes;
  const totalCount = reviewThreads.totalCount;
  const unresolvedCount = threads.filter((t: ReviewThread) => !t.isResolved).length;

  return { threads, totalCount, unresolvedCount };
}
