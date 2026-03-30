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
import type { DashboardReviewRequest } from '../../types/github';
import { formatAge, getAgeColor } from '../../utils/dates';

type SortField = 'title' | 'repoName' | 'waitingDays' | 'author';
type SortDir = 'asc' | 'desc';

interface ReviewRequestsTableProps {
  requests: DashboardReviewRequest[];
  isLoading: boolean;
}

export function ReviewRequestsTable({ requests, isLoading }: ReviewRequestsTableProps) {
  const [sortField, setSortField] = useState<SortField>('waitingDays');
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
    return [...requests].sort((a, b) => {
      const mul = sortDir === 'asc' ? 1 : -1;
      if (sortField === 'waitingDays') return (a.waitingDays - b.waitingDays) * mul;
      return String(a[sortField]).localeCompare(String(b[sortField])) * mul;
    });
  }, [requests, sortField, sortDir]);

  if (isLoading) {
    return (
      <Paper sx={{ p: 2 }}>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} height={40} sx={{ my: 0.5 }} />
        ))}
      </Paper>
    );
  }

  if (requests.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">No reviews requested.</Typography>
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
            <TableCell>
              <TableSortLabel
                active={sortField === 'waitingDays'}
                direction={sortField === 'waitingDays' ? sortDir : 'desc'}
                onClick={() => handleSort('waitingDays')}
              >
                Waiting
              </TableSortLabel>
            </TableCell>
            <TableCell width={48} />
          </TableRow>
        </TableHead>
        <TableBody>
          {sorted.map((req) => (
            <TableRow key={`${req.repoFullName}-${req.number}`} hover>
              <TableCell sx={{ maxWidth: 400 }}>
                <Tooltip title={req.title} enterDelay={500}>
                  <Link
                    href={req.htmlUrl}
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
                    #{req.number} {req.title}
                  </Link>
                </Tooltip>
              </TableCell>
              <TableCell>
                <Chip label={req.repoName} variant="outlined" size="small" />
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar src={req.authorAvatar} alt={req.author} sx={{ width: 20, height: 20 }} />
                  <Typography variant="body2">{req.author}</Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Chip label={formatAge(req.waitingDays)} color={getAgeColor(req.waitingDays)} size="small" />
              </TableCell>
              <TableCell>
                <IconButton href={req.htmlUrl} target="_blank" rel="noopener" size="small">
                  <OpenInNewIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
