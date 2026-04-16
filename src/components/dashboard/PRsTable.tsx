import { useState, useMemo } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import CircularProgress from '@mui/material/CircularProgress';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CommentIcon from '@mui/icons-material/Comment';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import MergeTypeIcon from '@mui/icons-material/MergeType';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { useQueryClient } from '@tanstack/react-query';
import type { DashboardPR, PRStatus } from '../../types/github';
import { daysAgo, formatAge, formatDate, getAgeColor } from '../../utils/dates';
import { colors } from '../../theme/colors';
import { getPRBody, updatePRBody, mergePR, addLabelToIssue } from '../../api/github';
import { useAuth } from '../../hooks/useAuth';
import { NoteChip } from './NoteChip';
import { OverflowChips } from './OverflowChips';
import { useHighlight, scrollToHighlighted } from '../../hooks/useHighlight';

function getTimeInStatus(pr: DashboardPR): string {
  if (pr.status === 'approved') {
    const approvals = pr.reviews.filter((r) => r.state === 'APPROVED');
    if (approvals.length > 0) {
      const latest = approvals.reduce((a, b) => a.submitted_at > b.submitted_at ? a : b);
      return formatAge(daysAgo(latest.submitted_at));
    }
  }
  if (pr.status === 'changes_requested') {
    const changes = pr.reviews.filter((r) => r.state === 'CHANGES_REQUESTED');
    if (changes.length > 0) {
      const latest = changes.reduce((a, b) => a.submitted_at > b.submitted_at ? a : b);
      return formatAge(daysAgo(latest.submitted_at));
    }
  }
  return formatAge(daysAgo(pr.createdAt));
}

type SortField = 'title' | 'repoName' | 'ageDays' | 'updatedAt' | 'status' | 'unresolvedThreadCount';
type SortDir = 'asc' | 'desc';

const STATUS_CONFIG: Record<PRStatus, { label: string; color: 'default' | 'success' | 'error' | 'warning' }> = {
  draft: { label: 'Draft', color: 'default' },
  review_pending: { label: 'Review Pending', color: 'warning' },
  changes_requested: { label: 'Changes Requested', color: 'error' },
  approved: { label: 'Approved', color: 'success' },
};

interface NotesHook {
  getNote: (repoFullName: string, number: number) => string;
  setNote: (repoFullName: string, number: number, text: string) => void;
}

interface PRsTableProps {
  prs: DashboardPR[];
  isLoading: boolean;
  onItemClick?: (owner: string, repo: string, number: number) => void;
  notes?: NotesHook;
}

export function PRsTable({ prs, isLoading, onItemClick, notes }: PRsTableProps) {
  const { highlightedKey, setHighlightedKey } = useHighlight();
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [sortField, setSortField] = useState<SortField>('ageDays');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [fixingPRs, setFixingPRs] = useState<Set<string>>(new Set());
  const [mergingPRs, setMergingPRs] = useState<Set<string>>(new Set());
  // Maps "owner/repo-number" → label name for optimistic UI
  const [appliedLabels, setAppliedLabels] = useState<Map<string, string>>(new Map());

  const handleAddLabel = async (pr: DashboardPR, label: string) => {
    if (!token) return;
    const prKey = `${pr.repoFullName}-${pr.number}`;
    setAppliedLabels((prev) => new Map(prev).set(prKey, label));
    try {
      const [owner, repo] = pr.repoFullName.split('/');
      await addLabelToIssue(owner, repo, pr.number, label, token);
      queryClient.invalidateQueries({ queryKey: ['prs'] });
    } catch (err) {
      console.error('Failed to add label:', err);
      // Revert optimistic update on failure
      setAppliedLabels((prev) => { const n = new Map(prev); n.delete(prKey); return n; });
    }
  };

  const handleMerge = async (pr: DashboardPR) => {
    if (!token) return;
    const prKey = `${pr.repoFullName}-${pr.number}`;
    if (!window.confirm(`Merge PR #${pr.number} "${pr.title}"?`)) return;
    setMergingPRs((prev) => new Set(prev).add(prKey));
    try {
      const [owner, repo] = pr.repoFullName.split('/');
      await mergePR(owner, repo, pr.number, token);
      queryClient.invalidateQueries({ queryKey: ['prs'] });
    } catch (err) {
      console.error('Failed to merge:', err);
      alert('Failed to merge PR. Check the console for details.');
    } finally {
      setMergingPRs((prev) => { const n = new Set(prev); n.delete(prKey); return n; });
    }
  };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const handleFixLinks = async (pr: DashboardPR) => {
    if (!token || pr.missingIssueLinks.length === 0) return;

    const prKey = `${pr.repoFullName}-${pr.number}`;
    setFixingPRs((prev) => new Set(prev).add(prKey));

    try {
      const [owner, repo] = pr.repoFullName.split('/');
      const currentBody = await getPRBody(owner, repo, pr.number, token);

      // Build "Closes" references for each missing issue
      const closeLines = pr.missingIssueLinks.map((missing) => {
        // If issue is in the same repo, use short form; otherwise use full form
        if (missing.issueRepoFullName === pr.repoFullName) {
          return `Closes #${missing.issueNumber}`;
        }
        return `Closes ${missing.issueRepoFullName}#${missing.issueNumber}`;
      });

      const separator = currentBody.trim() ? '\n\n' : '';
      const newBody = currentBody.trim() + separator + closeLines.join('\n');

      await updatePRBody(owner, repo, pr.number, newBody, token);

      // Invalidate queries so the linked issues refresh
      queryClient.invalidateQueries({ queryKey: ['pr-graphql', owner, repo, pr.number] });
      queryClient.invalidateQueries({ queryKey: ['issue-linked-prs'] });
    } catch (err) {
      console.error('Failed to fix PR links:', err);
    } finally {
      setFixingPRs((prev) => {
        const next = new Set(prev);
        next.delete(prKey);
        return next;
      });
    }
  };

  const sorted = useMemo(() => {
    return [...prs].sort((a, b) => {
      const mul = sortDir === 'asc' ? 1 : -1;
      if (sortField === 'ageDays') return (a.ageDays - b.ageDays) * mul;
      if (sortField === 'updatedAt') return a.updatedAt.localeCompare(b.updatedAt) * mul;
      if (sortField === 'unresolvedThreadCount') return (a.unresolvedThreadCount - b.unresolvedThreadCount) * mul;
      if (sortField === 'status') return a.status.localeCompare(b.status) * mul;
      if (sortField === 'repoName') return a.repoName.localeCompare(b.repoName) * mul;
      return a.title.localeCompare(b.title) * mul;
    });
  }, [prs, sortField, sortDir]);

  if (isLoading) {
    return (
      <Paper sx={{ p: 2 }}>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} height={40} sx={{ my: 0.5 }} />
        ))}
      </Paper>
    );
  }

  if (prs.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">No open pull requests.</Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            {notes && <TableCell>Notes</TableCell>}
            <TableCell>
              <TableSortLabel
                active={sortField === 'title'}
                direction={sortField === 'title' ? sortDir : 'asc'}
                onClick={() => handleSort('title')}
              >
                Title
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={sortField === 'repoName'}
                direction={sortField === 'repoName' ? sortDir : 'asc'}
                onClick={() => handleSort('repoName')}
              >
                Repo
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={sortField === 'status'}
                direction={sortField === 'status' ? sortDir : 'asc'}
                onClick={() => handleSort('status')}
              >
                Status
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={sortField === 'unresolvedThreadCount'}
                direction={sortField === 'unresolvedThreadCount' ? sortDir : 'desc'}
                onClick={() => handleSort('unresolvedThreadCount')}
              >
                Unresolved
              </TableSortLabel>
            </TableCell>
            <TableCell>Reviewers</TableCell>
            <TableCell>Linked Issues</TableCell>
            <TableCell>CI</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>
              <TableSortLabel
                active={sortField === 'ageDays'}
                direction={sortField === 'ageDays' ? sortDir : 'desc'}
                onClick={() => handleSort('ageDays')}
              >
                Age
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={sortField === 'updatedAt'}
                direction={sortField === 'updatedAt' ? sortDir : 'desc'}
                onClick={() => handleSort('updatedAt')}
              >
                Activity
              </TableSortLabel>
            </TableCell>
            <TableCell width={48} />
          </TableRow>
        </TableHead>
        <TableBody>
          {sorted.map((pr) => {
            const statusConf = STATUS_CONFIG[pr.status];
            const hasNoLinkedIssues = pr.linkedIssues.length === 0 && pr.missingIssueLinks.length === 0;
            const hasMissingLinks = pr.missingIssueLinks.length > 0;
            const prKey = `${pr.repoFullName}-${pr.number}`;
            const isFixing = fixingPRs.has(prKey);

            const isHighlighted = highlightedKey === prKey;
            return (
              <TableRow
                key={prKey}
                hover
                data-item-key={prKey}
                sx={isHighlighted ? {
                  bgcolor: (theme) => theme.palette.mode === 'light' ? 'rgba(25, 118, 210, 0.08)' : 'rgba(144, 202, 249, 0.08)',
                  transition: 'background-color 0.2s',
                } : hasNoLinkedIssues ? {
                  bgcolor: (theme) => theme.palette.mode === 'light' ? '#FDE8E8' : 'rgba(245, 204, 204, 0.08)',
                  transition: 'background-color 0.2s',
                } : { transition: 'background-color 0.2s' }}
              >
                {notes && (
                  <TableCell>
                    <NoteChip
                      note={notes.getNote(pr.repoFullName, pr.number)}
                      onSave={(text) => notes.setNote(pr.repoFullName, pr.number, text)}
                    />
                  </TableCell>
                )}
                <TableCell sx={{ maxWidth: 400 }}>
                  <Tooltip title={`${pr.headRef} → ${pr.baseRef}`} enterDelay={500}>
                    <Link
                      href={pr.htmlUrl}
                      target="_blank"
                      rel="noopener"
                      underline="hover"
                      onClick={(e) => {
                        if (!e.ctrlKey && !e.metaKey && onItemClick) {
                          e.preventDefault();
                          const [owner, repo] = pr.repoFullName.split('/');
                          onItemClick(owner, repo, pr.number);
                        }
                      }}
                      sx={{
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      #{pr.number} {pr.title}
                    </Link>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Chip label={pr.repoName} variant="outlined" />
                </TableCell>
                <TableCell>
                  <Tooltip title={`In ${statusConf.label.toLowerCase()} for ${getTimeInStatus(pr)}`}>
                    <Chip label={statusConf.label} color={statusConf.color} />
                  </Tooltip>
                </TableCell>
                <TableCell>
                  {pr.unresolvedThreadCount > 0 ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Chip
                        icon={<CommentIcon />}
                        label={`${pr.unresolvedThreadCount} / ${pr.totalThreadCount}`}
                        size="small"
                        sx={{ bgcolor: `${colors.orange[5]}30`, color: colors.orange[5], fontWeight: 600 }}
                      />
                      <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 20, height: 20, fontSize: '0.6rem' } }}>
                        {pr.unresolvedAuthors.map((a) => (
                          <Tooltip key={a.login} title={a.login}>
                            <Avatar src={a.avatarUrl} alt={a.login} />
                          </Tooltip>
                        ))}
                      </AvatarGroup>
                    </Box>
                  ) : pr.totalThreadCount > 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      0 / {pr.totalThreadCount}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      --
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <AvatarGroup max={4} sx={{ justifyContent: 'flex-start', '& .MuiAvatar-root': { width: 22, height: 22, fontSize: '0.65rem' } }}>
                    {pr.reviewers.map((r) => (
                      <Tooltip key={r.login} title={r.login}>
                        <Avatar src={r.avatar_url} alt={r.login} />
                      </Tooltip>
                    ))}
                  </AvatarGroup>
                  {pr.reviewers.length === 0 && (
                    <Typography variant="body2" color="text.secondary">--</Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
                    {/* Properly linked issues */}
                    {pr.linkedIssues.length > 0 && (
                      <OverflowChips
                        maxVisible={2}
                        items={pr.linkedIssues.map((issue) => ({
                          key: issue.url,
                          label: `#${issue.number}`,
                          tooltip: issue.title,
                          href: issue.url,
                          highlightKey: `${pr.repoFullName.split('/')[0]}/${issue.repoName}-${issue.number}`,
                        }))}
                        onHighlight={(key) => {
                          setHighlightedKey(key);
                          if (key) scrollToHighlighted(key);
                        }}
                      />
                    )}
                    {/* Issues that reference this PR but PR doesn't link back */}
                    {pr.missingIssueLinks.map((missing) => (
                      <Tooltip
                        key={missing.issueUrl}
                        title={`Issue #${missing.issueNumber} references this PR, but PR doesn't link back`}
                      >
                        <Chip
                          icon={<WarningAmberIcon sx={{ fontSize: 14 }} />}
                          label={`#${missing.issueNumber}`}
                          size="small"
                          component="a"
                          href={missing.issueUrl}
                          target="_blank"
                          rel="noopener"
                          clickable
                          sx={{
                            bgcolor: `${colors.orange[5]}20`,
                            borderColor: colors.orange[4],
                            color: colors.orange[5],
                          }}
                          variant="outlined"
                        />
                      </Tooltip>
                    ))}
                    {/* Fix button when there are missing links */}
                    {hasMissingLinks && (
                      <Tooltip title={`Add "Closes" reference${pr.missingIssueLinks.length > 1 ? 's' : ''} to PR body`}>
                        <IconButton
                          size="small"
                          onClick={() => handleFixLinks(pr)}
                          disabled={isFixing}
                          sx={{
                            color: colors.orange[5],
                            '&:hover': { bgcolor: `${colors.orange[5]}15` },
                          }}
                        >
                          {isFixing ? <CircularProgress size={16} /> : <AutoFixHighIcon sx={{ fontSize: 16 }} />}
                        </IconButton>
                      </Tooltip>
                    )}
                    {/* No links at all */}
                    {hasNoLinkedIssues && (
                      <Tooltip title="No linked issues">
                        <LinkOffIcon sx={{ color: colors.red[3], fontSize: 18 }} />
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  {pr.ciStatus === 'success' && (
                    <Tooltip title="CI passed"><CheckCircleIcon sx={{ color: colors.green[5], fontSize: 18 }} /></Tooltip>
                  )}
                  {pr.ciStatus === 'failure' && (
                    <Tooltip title="CI failed"><CancelIcon sx={{ color: colors.red.brand, fontSize: 18 }} /></Tooltip>
                  )}
                  {pr.ciStatus === 'pending' && (
                    <Tooltip title="CI running"><HourglassEmptyIcon sx={{ color: colors.orange[5], fontSize: 18 }} /></Tooltip>
                  )}
                  {pr.ciStatus === 'neutral' && (
                    <Tooltip title="CI neutral"><RemoveCircleOutlineIcon sx={{ color: colors.gray[5], fontSize: 18 }} /></Tooltip>
                  )}
                  {!pr.ciStatus && (
                    <Typography variant="body2" color="text.secondary">--</Typography>
                  )}
                </TableCell>
                <TableCell>
                  {(() => {
                    const maint = pr.labels.find((l) => l.name === 'Maintenance');
                    const newCap = pr.labels.find((l) => l.name === 'New capability');
                    const optimistic = appliedLabels.get(prKey);
                    const showLabel = maint ? 'Maintenance' : newCap ? 'New capability' : optimistic ?? null;
                    const labelColor = maint ? maint.color : newCap ? newCap.color : null;
                    if (showLabel) {
                      return labelColor
                        ? <Chip label={showLabel} size="small" sx={{ bgcolor: `#${labelColor}30`, color: `#${labelColor}`, fontWeight: 600, border: `1px solid #${labelColor}` }} />
                        : <Chip label={showLabel} size="small" color="primary" variant="outlined" sx={{ fontWeight: 600 }} />;
                    }
                    return (
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Add Maintenance label">
                          <Chip label="+M" size="small" clickable onClick={() => handleAddLabel(pr, 'Maintenance')} variant="outlined" sx={{ fontSize: '0.7rem', fontWeight: 700 }} />
                        </Tooltip>
                        <Tooltip title="Add New capability label">
                          <Chip label="+NC" size="small" clickable onClick={() => handleAddLabel(pr, 'New capability')} variant="outlined" sx={{ fontSize: '0.7rem', fontWeight: 700 }} />
                        </Tooltip>
                      </Box>
                    );
                  })()}
                </TableCell>
                <TableCell>
                  <Chip label={formatAge(pr.ageDays)} color={getAgeColor(pr.ageDays)} size="small" />
                </TableCell>
                <TableCell>
                  <Tooltip title={formatDate(pr.updatedAt)}>
                    <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                      {formatAge(daysAgo(pr.updatedAt))} ago
                    </Typography>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.25 }}>
                    {pr.status === 'approved' && (
                      <Tooltip title="Merge this PR">
                        <IconButton
                          size="small"
                          onClick={() => handleMerge(pr)}
                          disabled={mergingPRs.has(prKey)}
                          sx={{ color: colors.green[5] }}
                        >
                          {mergingPRs.has(prKey) ? <CircularProgress size={16} /> : <MergeTypeIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    )}
                    <IconButton href={pr.htmlUrl} target="_blank" rel="noopener" size="small">
                      <OpenInNewIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
