export interface GitHubUser {
  login: string;
  avatar_url: string;
  name: string | null;
  html_url: string;
}

export interface GitHubLabel {
  id: number;
  name: string;
  color: string;
  description: string | null;
}

export interface GitHubIssue {
  number: number;
  title: string;
  html_url: string;
  state: string;
  labels: GitHubLabel[];
  assignee: { login: string } | null;
  assignees: { login: string }[];
  created_at: string;
  updated_at: string;
  pull_request?: { url: string };
  repository_url: string;
}

export interface GitHubPR {
  number: number;
  title: string;
  html_url: string;
  state: string;
  draft: boolean;
  user: { login: string; avatar_url: string };
  created_at: string;
  updated_at: string;
  head: { ref: string };
  base: { ref: string };
  requested_reviewers: { login: string; avatar_url: string }[];
}

export interface GitHubReview {
  user: { login: string; avatar_url: string };
  state: 'APPROVED' | 'CHANGES_REQUESTED' | 'COMMENTED' | 'PENDING' | 'DISMISSED';
  submitted_at: string;
}

export interface ReviewThread {
  isResolved: boolean;
  comments: {
    totalCount: number;
  };
}

export interface DashboardIssue {
  number: number;
  title: string;
  htmlUrl: string;
  labels: GitHubLabel[];
  assignedDate: string;
  ageDays: number;
  repoName: string;
  repoFullName: string;
  updatedAt: string;
}

export type PRStatus = 'draft' | 'approved' | 'changes_requested' | 'review_pending';

export interface DashboardPR {
  number: number;
  title: string;
  htmlUrl: string;
  draft: boolean;
  author: string;
  authorAvatar: string;
  repoName: string;
  repoFullName: string;
  createdAt: string;
  ageDays: number;
  status: PRStatus;
  reviews: GitHubReview[];
  unresolvedThreadCount: number;
  totalThreadCount: number;
  headRef: string;
  baseRef: string;
}

export interface TrendDataPoint {
  date: string;
  openIssues: number;
  openPRs: number;
  avgIssueAgeDays: number;
  avgPRAgeDays: number;
}

export const REPOS = [
  { owner: 'red-gate', repo: 'flyway-main' },
  { owner: 'red-gate', repo: 'FlywayDesktop' },
] as const;

export type RepoConfig = (typeof REPOS)[number];
