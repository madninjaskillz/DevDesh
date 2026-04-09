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
  assignees: { login: string; avatar_url: string }[];
  created_at: string;
  updated_at: string;
  closed_at: string | null;
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
  closed_at: string | null;
  merged_at: string | null;
  head: { ref: string };
  base: { ref: string };
  requested_reviewers: { login: string; avatar_url: string }[];
  requested_teams: { name: string; slug: string }[];
  labels: { name: string; color: string }[];
}

export interface GitHubReview {
  user: { login: string; avatar_url: string };
  state: 'APPROVED' | 'CHANGES_REQUESTED' | 'COMMENTED' | 'PENDING' | 'DISMISSED';
  submitted_at: string;
}

export interface ReviewThread {
  isResolved: boolean;
  isOutdated: boolean;
  comments: {
    totalCount: number;
    nodes?: { author: { login: string; avatarUrl: string } }[];
  };
}

export interface LinkedIssue {
  number: number;
  title: string;
  url: string;
  repoName: string;
}

export interface LinkedPR {
  number: number;
  title: string;
  url: string;
  state: string;
  repoName: string;
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
  linkedPRs: LinkedPR[];
  projectStatus: { name: string; color: string } | null;
  assignees: { login: string; avatar_url: string }[];
}

export type PRStatus = 'draft' | 'approved' | 'changes_requested' | 'review_pending';

export interface MissingIssueLink {
  issueNumber: number;
  issueTitle: string;
  issueUrl: string;
  issueRepoFullName: string;
}

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
  unresolvedAuthors: { login: string; avatarUrl: string }[];
  totalThreadCount: number;
  reviewers: { login: string; avatar_url: string }[];
  linkedIssues: LinkedIssue[];
  missingIssueLinks: MissingIssueLink[];
  ciStatus: 'success' | 'failure' | 'pending' | 'neutral' | null;
  labels: { name: string; color: string }[];
  headRef: string;
  baseRef: string;
}

export interface TrendDataPoint {
  date: string;
  openIssues: number;
  openPRs: number;
  avgIssueAgeDays: number;
  avgPRAgeDays: number;
  maxIssueAgeDays: number;
  maxPRAgeDays: number;
  closedIssues30d: number;
  closedPRs30d: number;
}

export const DEFAULT_REPOS = [
  { owner: 'red-gate', repo: 'flyway-main' },
  { owner: 'red-gate', repo: 'FlywayDesktop' },
];

export interface ActivityEvent {
  id: string;
  type: string;
  action: string;
  title: string;
  url: string;
  actor: { login: string; avatar_url: string };
  repoName: string;
  timestamp: string;
}

export interface DashboardCommit {
  sha: string;
  message: string;
  url: string;
  repoName: string;
  repoFullName: string;
  date: string;
}

export type ReviewPriority = 'requested_me' | 'requested_team' | 'other';

export interface AwaitingReviewPR {
  number: number;
  title: string;
  htmlUrl: string;
  repoName: string;
  repoFullName: string;
  author: string;
  authorAvatar: string;
  createdAt: string;
  ageDays: number;
  draft: boolean;
  priority: ReviewPriority;
  requestedReviewers: string[];
  requestedTeams: string[];
}

export interface DashboardReviewRequest {
  number: number;
  title: string;
  htmlUrl: string;
  repoName: string;
  repoFullName: string;
  author: string;
  authorAvatar: string;
  createdAt: string;
  waitingDays: number;
}
