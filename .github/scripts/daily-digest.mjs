/**
 * DevDash Daily Digest — Posts a workload summary to Slack.
 *
 * Environment variables:
 *   GITHUB_TOKEN      — PAT with `repo` scope
 *   GITHUB_USERNAME   — Your GitHub username
 *   SLACK_WEBHOOK_URL — Slack Incoming Webhook URL
 *   REPOS             — Comma-separated owner/repo pairs (default: red-gate/flyway-main,red-gate/FlywayDesktop)
 */

const TOKEN = process.env.GITHUB_TOKEN;
const USERNAME = process.env.GITHUB_USERNAME;
const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK_URL;
const REPOS = (process.env.REPOS || 'red-gate/flyway-main,red-gate/FlywayDesktop')
  .split(',')
  .map((r) => r.trim().split('/'))
  .map(([owner, repo]) => ({ owner, repo }));

if (!TOKEN || !USERNAME || !SLACK_WEBHOOK) {
  console.error('Missing required env vars: GITHUB_TOKEN, GITHUB_USERNAME, SLACK_WEBHOOK_URL');
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  Accept: 'application/vnd.github+json',
  'User-Agent': 'DevDash-Digest',
};

async function fetchJSON(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${url}`);
  return res.json();
}

async function getAssignedIssues(owner, repo) {
  const issues = await fetchJSON(
    `https://api.github.com/repos/${owner}/${repo}/issues?assignee=${USERNAME}&state=open&per_page=100`
  );
  return issues.filter((i) => !i.pull_request);
}

async function getOpenPRs(owner, repo) {
  const prs = await fetchJSON(
    `https://api.github.com/repos/${owner}/${repo}/pulls?state=open&per_page=100`
  );
  return prs.filter((pr) => pr.user.login === USERNAME);
}

async function getReviewRequests(owner, repo) {
  const prs = await fetchJSON(
    `https://api.github.com/repos/${owner}/${repo}/pulls?state=open&per_page=100`
  );
  return prs.filter((pr) =>
    pr.requested_reviewers?.some((r) => r.login === USERNAME)
  );
}

function daysAgo(dateStr) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

function formatAge(days) {
  if (days === 0) return '<1d';
  if (days < 7) return `${days}d`;
  const w = Math.floor(days / 7);
  const r = days % 7;
  return r > 0 ? `${w}w ${r}d` : `${w}w`;
}

async function main() {
  let allIssues = [];
  let allPRs = [];
  let allReviewRequests = [];

  for (const { owner, repo } of REPOS) {
    const [issues, prs, reviews] = await Promise.all([
      getAssignedIssues(owner, repo),
      getOpenPRs(owner, repo),
      getReviewRequests(owner, repo),
    ]);
    allIssues.push(...issues.map((i) => ({ ...i, repo: `${owner}/${repo}` })));
    allPRs.push(...prs.map((p) => ({ ...p, repo: `${owner}/${repo}` })));
    allReviewRequests.push(...reviews.map((r) => ({ ...r, repo: `${owner}/${repo}` })));
  }

  // Build action items
  const actions = [];

  // Stale issues (>7 days no update)
  for (const issue of allIssues) {
    const age = daysAgo(issue.updated_at);
    if (age >= 7) {
      actions.push(`🔴 Issue #${issue.number} idle for ${formatAge(age)}: ${issue.title}`);
    }
  }

  // Review requests
  for (const pr of allReviewRequests) {
    const age = daysAgo(pr.created_at);
    if (age >= 3) {
      actions.push(`🟡 Review PR #${pr.number} from @${pr.user.login} (waiting ${formatAge(age)}): ${pr.title}`);
    }
  }

  // Summary
  const avgIssueAge = allIssues.length > 0
    ? Math.round(allIssues.reduce((s, i) => s + daysAgo(i.created_at), 0) / allIssues.length)
    : 0;
  const avgPRAge = allPRs.length > 0
    ? Math.round(allPRs.reduce((s, p) => s + daysAgo(p.created_at), 0) / allPRs.length)
    : 0;

  const blocks = [
    {
      type: 'header',
      text: { type: 'plain_text', text: '📊 DevDash Daily Digest' },
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Open Issues:* ${allIssues.length}` },
        { type: 'mrkdwn', text: `*Open PRs:* ${allPRs.length}` },
        { type: 'mrkdwn', text: `*Avg Issue Age:* ${formatAge(avgIssueAge)}` },
        { type: 'mrkdwn', text: `*Avg PR Age:* ${formatAge(avgPRAge)}` },
        { type: 'mrkdwn', text: `*Reviews Pending:* ${allReviewRequests.length}` },
      ],
    },
  ];

  if (actions.length > 0) {
    blocks.push({ type: 'divider' });
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*⚠️ Needs Attention (${actions.length}):*\n${actions.slice(0, 10).join('\n')}${
          actions.length > 10 ? `\n_...and ${actions.length - 10} more_` : ''
        }`,
      },
    });
  }

  blocks.push({ type: 'divider' });
  blocks.push({
    type: 'context',
    elements: [
      { type: 'mrkdwn', text: `Repos: ${REPOS.map((r) => `${r.owner}/${r.repo}`).join(', ')}` },
    ],
  });

  // Post to Slack
  const res = await fetch(SLACK_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ blocks }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Slack webhook failed: ${res.status} ${text}`);
  }

  console.log(`✅ Digest posted: ${allIssues.length} issues, ${allPRs.length} PRs, ${actions.length} actions`);
}

main().catch((err) => {
  console.error('❌ Digest failed:', err);
  process.exit(1);
});
