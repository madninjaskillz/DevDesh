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
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import type { AwaitingReviewPR } from '../../types/github';
import { formatAge, getAgeColor } from '../../utils/dates';
import { colors } from '../../theme/colors';

type SortField = 'title' | 'repoName' | 'ageDays' | 'author';
type SortDir = 'asc' | 'desc';

const PRIORITY_CONFIG = {
  requested_me: { label: 'You', color: colors.red.brand, icon: <PersonIcon sx={{ fontSize: 14 }} /> },
  requested_team: { label: 'Your team', color: colors.orange[5], icon: <GroupIcon sx={{ fontSize: 14 }} /> },
  other: { label: 'Other', color: colors.gray[5], icon: null },
} as const;

interface AwaitingReviewTableProps {
  prs: AwaitingReviewPR[];
  isLoading: boolean;
}

export function AwaitingReviewTable({ prs, isLoading }: AwaitingReviewTableProps) {
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
      return String(a[sortField]).localeCompare(String(b[sortField])) * mul;
    });
  }, [prs, sortField, sortDir]);

  if (isLoading) {
    return (
      <Paper sx={{ p: 2 }}>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} height={40} sx={{ my: 0.5 }} />
        ))}
      </Paper>
    );
  }

  if (prs.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">No PRs awaiting review.</Typography>
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
                active={sortField === 'author'}
                direction={sortField === 'author' ? sortDir : 'asc'}
                onClick={() => handleSort('author')}
              >
                Author
              </TableSortLabel>
            </TableCell>
            <TableCell>Requested</TableCell>
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
            const priorityConf = PRIORITY_CONFIG[pr.priority];
            return (
              <TableRow
                key={`${pr.repoFullName}-${pr.number}`}
                hover
                sx={pr.priority === 'requested_me' ? {
                  borderLeft: `3px solid ${colors.red.brand}`,
                  bgcolor: (theme) => theme.palette.mode === 'light' ? '#FDE8E8' : 'rgba(245, 204, 204, 0.06)',
                } : pr.priority === 'requested_team' ? {
                  borderLeft: `3px solid ${colors.orange[5]}`,
                  bgcolor: (theme) => theme.palette.mode === 'light' ? '#FFF3E0' : 'rgba(252, 144, 3, 0.06)',
                } : undefined}
              >
                <TableCell sx={{ maxWidth: 400 }}>
                  <Tooltip title={pr.title} enterDelay={500}>
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
                  <Chip label={pr.repoName} variant="outlined" size="small" />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar src={pr.authorAvatar} alt={pr.author} sx={{ width: 20, height: 20 }} />
                    <Typography variant="body2">{pr.author}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    icon={priorityConf.icon ?? undefined}
                    label={priorityConf.label}
                    size="small"
                    sx={{
                      bgcolor: `${priorityConf.color}18`,
                      color: priorityConf.color,
                      fontWeight: 600,
                      borderColor: `${priorityConf.color}40`,
                    }}
                    variant="outlined"
                  />
                  {pr.requestedTeams.length > 0 && pr.priority !== 'requested_me' && (
                    <Tooltip title={pr.requestedTeams.join(', ')}>
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                        ({pr.requestedTeams.join(', ')})
                      </Typography>
                    </Tooltip>
                  )}
                </TableCell>
                <TableCell>
                  <Chip label={formatAge(pr.ageDays)} color={getAgeColor(pr.ageDays)} size="small" />
                </TableCell>
                <TableCell>
                  <IconButton href={pr.htmlUrl} target="_blank" rel="noopener" size="small">
                    <OpenInNewIcon fontSize="small" />
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
