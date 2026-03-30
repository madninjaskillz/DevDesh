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
import CircularProgress from '@mui/material/CircularProgress';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CommentIcon from '@mui/icons-material/Comment';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import MergeTypeIcon from '@mui/icons-material/MergeType';
import { useQueryClient } from '@tanstack/react-query';
import type { DashboardPR, PRStatus } from '../../types/github';
import { formatAge, formatDate, getAgeColor } from '../../utils/dates';
import { colors } from '../../theme/colors';
import { getPRBody, updatePRBody, mergePR } from '../../api/github';
import { useAuth } from '../../hooks/useAuth';
import { NoteChip } from './NoteChip';

type SortField = 'title' | 'repoName' | 'ageDays' | 'status' | 'unresolvedThreadCount';
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
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [sortField, setSortField] = useState<SortField>('ageDays');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [fixingPRs, setFixingPRs] = useState<Set<string>>(new Set());
  const [mergingPRs, setMergingPRs] = useState<Set<string>>(new Set());

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
            <TableCell>Linked Issues</TableCell>
            {notes && <TableCell>Notes</TableCell>}
            <TableCell>Created</TableCell>
            <TableCell>
              <TableSortLabel
                active={sortField === 'ageDays'}
                direction={sortField === 'ageDays' ? sortDir : 'desc'}
                onClick={() => handleSort('ageDays')}
              >
                Age
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

            return (
              <TableRow
                key={prKey}
                hover
                sx={hasNoLinkedIssues ? {
                  bgcolor: (theme) => theme.palette.mode === 'light' ? '#FDE8E8' : 'rgba(245, 204, 204, 0.08)',
                } : undefined}
              >
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
                  <Chip label={statusConf.label} color={statusConf.color} />
                </TableCell>
                <TableCell>
                  {pr.unresolvedThreadCount > 0 ? (
                    <Chip
                      icon={<CommentIcon />}
                      label={`${pr.unresolvedThreadCount} / ${pr.totalThreadCount}`}
                      sx={{ bgcolor: `${colors.orange[5]}30`, color: colors.orange[5], fontWeight: 600 }}
                    />
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
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
                    {/* Properly linked issues */}
                    {pr.linkedIssues.map((issue) => (
                      <Chip
                        key={issue.url}
                        label={`#${issue.number}`}
                        size="small"
                        component="a"
                        href={issue.url}
                        target="_blank"
                        rel="noopener"
                        clickable
                        variant="outlined"
                        title={issue.title}
                      />
                    ))}
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
                {notes && (
                  <TableCell>
                    <NoteChip
                      note={notes.getNote(pr.repoFullName, pr.number)}
                      onSave={(text) => notes.setNote(pr.repoFullName, pr.number, text)}
                    />
                  </TableCell>
                )}
                <TableCell>
                  <Typography variant="body2">{formatDate(pr.createdAt)}</Typography>
                </TableCell>
                <TableCell>
                  <Chip label={formatAge(pr.ageDays)} color={getAgeColor(pr.ageDays)} size="small" />
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
