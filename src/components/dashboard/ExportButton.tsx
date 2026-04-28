import { useCallback, useMemo, useState } from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CodeIcon from '@mui/icons-material/Code';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { DashboardIssue, DashboardPR, DashboardReviewRequest, TrendDataPoint } from '../../types/github';
import type { ActionItem } from '../../utils/actions';
import type { OutlookMeeting } from '../../utils/outlook';
import { formatAge } from '../../utils/dates';

interface ExportButtonProps {
  issues: DashboardIssue[];
  prs: DashboardPR[];
  reviewRequests: DashboardReviewRequest[];
  actionItems: ActionItem[];
  trendData?: TrendDataPoint[];
  meetings?: OutlookMeeting[];
}

function sumField(arr: TrendDataPoint[], key: keyof TrendDataPoint) {
  return arr.reduce((s, d) => s + (d[key] as number), 0);
}

function avg(arr: TrendDataPoint[], key: keyof TrendDataPoint) {
  return arr.length > 0 ? Math.round(sumField(arr, key) / arr.length) : 0;
}

function buildStandup(
  issues: DashboardIssue[],
  prs: DashboardPR[],
  reviewRequests: DashboardReviewRequest[],
  actionItems: ActionItem[],
  trendData: TrendDataPoint[],
): string {
  const lines: string[] = [];
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' });

  lines.push(`**Standup — ${today}**`);
  lines.push('');

  if (trendData.length >= 14) {
    const thisWeek = trendData.slice(-7);
    const lastWeek = trendData.slice(-14, -7);
    const closedIssuesThis = sumField(thisWeek, 'closedIssuesToday');
    const closedIssuesLast = sumField(lastWeek, 'closedIssuesToday');
    const closedPRsThis = sumField(thisWeek, 'closedPRsToday');
    const closedPRsLast = sumField(lastWeek, 'closedPRsToday');
    lines.push('**This week velocity:**');
    lines.push(`- Issues closed: ${closedIssuesThis} (last week: ${closedIssuesLast})`);
    lines.push(`- PRs closed: ${closedPRsThis} (last week: ${closedPRsLast})`);
    lines.push('');
  }

  if (actionItems.length > 0) {
    lines.push(`**Needs attention (${actionItems.length}):**`);
    for (const item of actionItems.slice(0, 5)) {
      lines.push(`- ${item.title} — ${item.description}`);
    }
    if (actionItems.length > 5) lines.push(`- ...and ${actionItems.length - 5} more`);
    lines.push('');
  }

  lines.push(`**Open issues:** ${issues.length}`);
  for (const issue of issues.slice(0, 5)) {
    lines.push(`- #${issue.number} ${issue.title} (${issue.repoName}, ${formatAge(issue.ageDays)})`);
  }
  if (issues.length > 5) lines.push(`- ...and ${issues.length - 5} more`);
  lines.push('');

  lines.push(`**Open PRs:** ${prs.length}`);
  for (const pr of prs) {
    lines.push(`- #${pr.number} ${pr.title} [${pr.status}] (${pr.repoName}, ${formatAge(pr.ageDays)})`);
  }
  lines.push('');

  if (reviewRequests.length > 0) {
    lines.push(`**Reviews pending:** ${reviewRequests.length}`);
    for (const req of reviewRequests) {
      lines.push(`- #${req.number} ${req.title} from @${req.author}`);
    }
  }

  return lines.join('\n');
}

function buildRetro(
  actionItems: ActionItem[],
  trendData: TrendDataPoint[],
  meetings: OutlookMeeting[],
): string {
  const lines: string[] = [];
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  lines.push(`**Retro Summary — ${today}**`);
  lines.push('');

  if (trendData.length >= 14) {
    const thisWeek = trendData.slice(-7);
    const lastWeek = trendData.slice(-14, -7);

    const closedIssuesThis = sumField(thisWeek, 'closedIssuesToday');
    const closedIssuesLast = sumField(lastWeek, 'closedIssuesToday');
    const closedPRsThis = sumField(thisWeek, 'closedPRsToday');
    const closedPRsLast = sumField(lastWeek, 'closedPRsToday');

    const avgCycleThis = avg(thisWeek, 'avgCycleTimeDays');
    const avgCycleLast = avg(lastWeek, 'avgCycleTimeDays');

    const avgIssueAgeThis = avg(thisWeek, 'avgIssueAgeDays');
    const avgIssueAgeLast = avg(lastWeek, 'avgIssueAgeDays');
    const avgPRAgeThis = avg(thisWeek, 'avgPRAgeDays');
    const avgPRAgeLast = avg(lastWeek, 'avgPRAgeDays');

    const delta = (curr: number, prev: number) => {
      const diff = curr - prev;
      if (diff === 0) return '(unchanged)';
      return diff > 0 ? `(+${diff} vs last week)` : `(${diff} vs last week)`;
    };

    lines.push('**Throughput:**');
    lines.push(`- Issues closed: ${closedIssuesThis} ${delta(closedIssuesThis, closedIssuesLast)}`);
    lines.push(`- PRs closed: ${closedPRsThis} ${delta(closedPRsThis, closedPRsLast)}`);
    lines.push(`- Avg PR cycle time: ${avgCycleThis}d ${delta(avgCycleThis, avgCycleLast)}`);
    lines.push('');

    lines.push('**Health:**');
    lines.push(`- Avg open issue age: ${avgIssueAgeThis}d ${delta(avgIssueAgeThis, avgIssueAgeLast)}`);
    lines.push(`- Avg open PR age: ${avgPRAgeThis}d ${delta(avgPRAgeThis, avgPRAgeLast)}`);
    lines.push(`- Open issues: ${thisWeek[thisWeek.length - 1]?.openIssues ?? 0}`);
    lines.push(`- Open PRs: ${thisWeek[thisWeek.length - 1]?.openPRs ?? 0}`);
    lines.push('');
  }

  if (trendData.length > 0) {
    const latest = trendData[trendData.length - 1];
    const staleIssues = latest.issuesAge14plus;
    const stalePRs = latest.prsAge14plus;
    if (staleIssues > 0 || stalePRs > 0) {
      lines.push('**Aging concerns:**');
      if (staleIssues > 0) lines.push(`- ${staleIssues} issue${staleIssues > 1 ? 's' : ''} older than 14 days`);
      if (stalePRs > 0) lines.push(`- ${stalePRs} PR${stalePRs > 1 ? 's' : ''} older than 14 days`);
      lines.push('');
    }
  }

  // Meetings attended in the past 7 days. Filter:
  // - skip all-day events (vacation/holiday markers)
  // - skip declined (responseStatus 4)
  // - keep accepted/tentative/organized/none-set (anything not declined)
  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const attended = meetings
    .filter((m) => !m.isAllDay)
    .filter((m) => m.responseStatus !== 4)
    .map((m) => ({ m, startMs: Date.parse(m.start) }))
    .filter(({ startMs }) => !Number.isNaN(startMs) && startMs >= weekAgo && startMs < now)
    .sort((a, b) => a.startMs - b.startMs);

  if (attended.length > 0) {
    const totalMins = attended.reduce((sum, { m }) => {
      const dur = (Date.parse(m.end) - Date.parse(m.start)) / 60000;
      return sum + (Number.isFinite(dur) ? dur : 0);
    }, 0);
    const totalH = Math.round(totalMins / 60 * 10) / 10;
    lines.push(`**Meetings attended (${attended.length}, ~${totalH}h total):**`);
    for (const { m, startMs } of attended) {
      const day = new Date(startMs).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
      const time = new Date(startMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      lines.push(`- ${day} ${time} — ${m.subject}`);
    }
    lines.push('');
  }

  if (actionItems.length > 0) {
    lines.push(`**Outstanding actions (${actionItems.length}):**`);
    for (const item of actionItems.slice(0, 10)) {
      lines.push(`- ${item.title} — ${item.description}`);
    }
    if (actionItems.length > 10) lines.push(`- ...and ${actionItems.length - 10} more`);
  }

  return lines.join('\n');
}

// Promote whole-line **...** patterns to proper markdown headings so the
// rendered view has visual hierarchy. The clipboard copy still uses the
// original raw text — this transformation is rendering-only.
function elevateHeadings(raw: string): string {
  return raw
    .split('\n')
    .map((line) => {
      const m = /^\*\*(.+?)\*\*$/.exec(line.trim());
      if (!m) return line;
      const t = m[1].trim();
      if (t.endsWith(':')) return `### ${t.slice(0, -1).trim()}`;
      return `## ${t}`;
    })
    .join('\n');
}

const mdComponents: Components = {
  h2: ({ children }) => (
    <>
      <Typography variant="h6" sx={{ mt: 0, mb: 1, fontWeight: 700, letterSpacing: '-0.01em' }}>
        {children}
      </Typography>
      <Divider sx={{ mb: 2 }} />
    </>
  ),
  h3: ({ children }) => (
    <Typography
      variant="overline"
      sx={{
        display: 'block',
        mt: 2,
        mb: 0.5,
        fontWeight: 700,
        color: 'primary.main',
        letterSpacing: '0.05em',
        lineHeight: 1.4,
      }}
    >
      {children}
    </Typography>
  ),
  p: ({ children }) => (
    <Typography variant="body2" sx={{ my: 0.5, lineHeight: 1.6 }}>{children}</Typography>
  ),
  ul: ({ children }) => (
    <Box component="ul" sx={{ m: 0, mb: 1.5, pl: 2.5, '& li': { mb: 0.25 } }}>{children}</Box>
  ),
  li: ({ children }) => (
    <Typography component="li" variant="body2" sx={{ lineHeight: 1.6 }}>{children}</Typography>
  ),
  strong: ({ children }) => (
    <Box component="strong" sx={{ fontWeight: 600 }}>{children}</Box>
  ),
  code: ({ children }) => (
    <Box
      component="code"
      sx={{
        fontFamily: '"Roboto Mono", monospace',
        fontSize: '0.85em',
        bgcolor: 'action.hover',
        px: 0.5,
        py: 0.1,
        borderRadius: 0.5,
      }}
    >
      {children}
    </Box>
  ),
};

interface OutputDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  text: string;
}

function OutputDialog({ open, onClose, title, text }: OutputDialogProps) {
  const [copied, setCopied] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  const handleCopy = () => {
    void navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const enhanced = useMemo(() => elevateHeadings(text), [text]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 0.5, pr: 1 }}>
        {title}
        <Box sx={{ flex: 1 }} />
        <Tooltip title={showRaw ? 'Show formatted' : 'Show raw markdown'}>
          <IconButton size="small" onClick={() => setShowRaw((v) => !v)}>
            <CodeIcon fontSize="small" color={showRaw ? 'primary' : 'inherit'} />
          </IconButton>
        </Tooltip>
        <Tooltip title={copied ? 'Copied' : 'Copy to clipboard'}>
          <IconButton size="small" onClick={handleCopy}>
            {copied ? <CheckIcon fontSize="small" color="success" /> : <ContentCopyIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </DialogTitle>
      <DialogContent dividers sx={{ bgcolor: 'background.default' }}>
        {showRaw ? (
          <Box
            component="pre"
            sx={{
              m: 0,
              p: 1.5,
              fontFamily: '"Roboto Mono", monospace',
              fontSize: '0.8rem',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              bgcolor: 'background.paper',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
              maxHeight: 480,
              overflow: 'auto',
            }}
          >
            {text}
          </Box>
        ) : (
          <Box
            sx={{
              p: 2,
              bgcolor: 'background.paper',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
              maxHeight: 520,
              overflow: 'auto',
            }}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
              {enhanced}
            </ReactMarkdown>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCopy} startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />} variant="contained">
          {copied ? 'Copied' : 'Copy markdown'}
        </Button>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export function ExportButton({ issues, prs, reviewRequests, actionItems, trendData = [], meetings = [] }: ExportButtonProps) {
  const [showStandup, setShowStandup] = useState(false);
  const [showRetro, setShowRetro] = useState(false);

  const standupText = useMemo(
    () => buildStandup(issues, prs, reviewRequests, actionItems, trendData),
    [issues, prs, reviewRequests, actionItems, trendData],
  );

  const retroText = useMemo(
    () => buildRetro(actionItems, trendData, meetings),
    [actionItems, trendData, meetings],
  );

  const handleShowStandup = useCallback(() => setShowStandup(true), []);
  const handleShowRetro = useCallback(() => setShowRetro(true), []);

  return (
    <>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<VisibilityIcon fontSize="small" />}
          onClick={handleShowStandup}
          sx={{ whiteSpace: 'nowrap' }}
        >
          Show standup
        </Button>
        <Button
          size="small"
          variant="outlined"
          startIcon={<VisibilityIcon fontSize="small" />}
          onClick={handleShowRetro}
          sx={{ whiteSpace: 'nowrap' }}
        >
          Show retro
        </Button>
      </Box>
      <OutputDialog
        open={showStandup}
        onClose={() => setShowStandup(false)}
        title="Standup"
        text={standupText}
      />
      <OutputDialog
        open={showRetro}
        onClose={() => setShowRetro(false)}
        title="Retro Summary"
        text={retroText}
      />
    </>
  );
}
