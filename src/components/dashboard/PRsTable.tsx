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
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CommentIcon from '@mui/icons-material/Comment';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import type { DashboardPR, PRStatus } from '../../types/github';
import { formatAge, formatDate, getAgeColor } from '../../utils/dates';
import { colors } from '../../theme/colors';

type SortField = 'title' | 'repoName' | 'ageDays' | 'status' | 'unresolvedThreadCount';
type SortDir = 'asc' | 'desc';

const STATUS_CONFIG: Record<PRStatus, { label: string; color: 'default' | 'success' | 'error' | 'warning' }> = {
  draft: { label: 'Draft', color: 'default' },
  review_pending: { label: 'Review Pending', color: 'warning' },
  changes_requested: { label: 'Changes Requested', color: 'error' },
  approved: { label: 'Approved', color: 'success' },
};

interface PRsTableProps {
  prs: DashboardPR[];
  isLoading: boolean;
}

export function PRsTable({ prs, isLoading }: PRsTableProps) {
  const [sortField, setSortField] = useState<SortField>('ageDays');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
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
            const hasNoLinkedIssues = pr.linkedIssues.length === 0;
            return (
              <TableRow
                key={`${pr.repoFullName}-${pr.number}`}
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
                  {pr.linkedIssues.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
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
                    </Box>
                  ) : (
                    <Tooltip title="No linked issues">
                      <LinkOffIcon sx={{ color: colors.red[3], fontSize: 18 }} />
                    </Tooltip>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{formatDate(pr.createdAt)}</Typography>
                </TableCell>
                <TableCell>
                  <Chip label={formatAge(pr.ageDays)} color={getAgeColor(pr.ageDays)} size="small" />
                </TableCell>
                <TableCell>
                  <IconButton href={pr.htmlUrl} target="_blank" rel="noopener" size="small">
                    <OpenInNewIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
