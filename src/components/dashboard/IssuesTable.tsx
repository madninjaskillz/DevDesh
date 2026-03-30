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
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import GroupIcon from '@mui/icons-material/Group';
import type { DashboardIssue } from '../../types/github';
import type { GroupBy } from './LabelFilter';
import { NoteChip } from './NoteChip';
import { formatAge, formatDate, getAgeColor } from '../../utils/dates';

type SortField = 'title' | 'repoName' | 'ageDays';
type SortDir = 'asc' | 'desc';

interface NotesHook {
  getNote: (repoFullName: string, number: number) => string;
  setNote: (repoFullName: string, number: number, text: string) => void;
}

interface IssuesTableProps {
  issues: DashboardIssue[];
  isLoading: boolean;
  onItemClick?: (owner: string, repo: string, number: number) => void;
  groupBy?: GroupBy;
  notes?: NotesHook;
}

export function IssuesTable({ issues, isLoading, onItemClick, groupBy = 'none', notes }: IssuesTableProps) {
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
    return [...issues].sort((a, b) => {
      const mul = sortDir === 'asc' ? 1 : -1;
      if (sortField === 'ageDays') return (a.ageDays - b.ageDays) * mul;
      return a[sortField].localeCompare(b[sortField]) * mul;
    });
  }, [issues, sortField, sortDir]);

  if (isLoading) {
    return (
      <Paper sx={{ p: 2 }}>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} height={40} sx={{ my: 0.5 }} />
        ))}
      </Paper>
    );
  }

  if (issues.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">No issues assigned to you. Nice work!</Typography>
      </Paper>
    );
  }

  // Grouped rendering
  if (groupBy !== 'none') {
    const groups = new Map<string, DashboardIssue[]>();
    for (const issue of sorted) {
      if (groupBy === 'repo') {
        const key = issue.repoName;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(issue);
      } else {
        // Group by label — issue appears in each matching label group
        const labels = issue.labels.length > 0 ? issue.labels.map((l) => l.name) : ['Unlabeled'];
        for (const label of labels) {
          if (!groups.has(label)) groups.set(label, []);
          groups.get(label)!.push(issue);
        }
      }
    }

    return (
      <Box>
        {[...groups.entries()].map(([groupName, groupIssues]) => (
          <Accordion key={groupName} defaultExpanded disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2">
                {groupName}
                <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                  ({groupIssues.length})
                </Typography>
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <IssuesTable issues={groupIssues} isLoading={false} onItemClick={onItemClick} />
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
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
            <TableCell>Labels</TableCell>
            <TableCell>Board</TableCell>
            <TableCell>Linked PRs</TableCell>
            {notes && <TableCell>Notes</TableCell>}
            <TableCell>Assigned</TableCell>
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
          {sorted.map((issue) => (
            <TableRow key={`${issue.repoFullName}-${issue.number}`} hover>
              <TableCell sx={{ maxWidth: 400 }}>
                <Tooltip title={issue.title} enterDelay={500}>
                  <Link
                    href={issue.htmlUrl}
                    target="_blank"
                    rel="noopener"
                    underline="hover"
                    onClick={(e) => {
                      if (!e.ctrlKey && !e.metaKey && onItemClick) {
                        e.preventDefault();
                        const [owner, repo] = issue.repoFullName.split('/');
                        onItemClick(owner, repo, issue.number);
                      }
                    }}
                    sx={{
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    #{issue.number} {issue.title}
                  </Link>
                </Tooltip>
                {issue.assigneeCount > 1 && (
                  <Tooltip title={`${issue.assigneeCount} assignees — shared ownership`}>
                    <GroupIcon sx={{ fontSize: 14, color: 'warning.main', ml: 0.5, verticalAlign: 'middle' }} />
                  </Tooltip>
                )}
              </TableCell>
              <TableCell>
                <Chip label={issue.repoName} variant="outlined" />
              </TableCell>
              <TableCell>
                {issue.labels.map((label) => (
                  <Chip
                    key={label.id}
                    label={label.name}
                    size="small"
                    sx={{
                      mr: 0.5,
                      mb: 0.5,
                      bgcolor: `#${label.color}`,
                      color: isLightColor(label.color) ? '#000' : '#fff',
                    }}
                  />
                ))}
              </TableCell>
              <TableCell>
                {issue.projectStatus ? (
                  <Chip
                    label={issue.projectStatus.name}
                    size="small"
                    sx={{
                      bgcolor: projectStatusColor(issue.projectStatus.color),
                      color: '#fff',
                      fontWeight: 600,
                    }}
                  />
                ) : (
                  <Typography variant="body2" color="text.secondary">--</Typography>
                )}
              </TableCell>
              <TableCell>
                {issue.linkedPRs.length > 0 ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {issue.linkedPRs.map((pr) => (
                      <Chip
                        key={pr.url}
                        label={`#${pr.number}`}
                        size="small"
                        component="a"
                        href={pr.url}
                        target="_blank"
                        rel="noopener"
                        clickable
                        variant="outlined"
                        color={pr.state === 'MERGED' ? 'success' : pr.state === 'OPEN' ? 'primary' : 'default'}
                        title={pr.title}
                      />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">--</Typography>
                )}
              </TableCell>
              {notes && (
                <TableCell>
                  <NoteChip
                    note={notes.getNote(issue.repoFullName, issue.number)}
                    onSave={(text) => notes.setNote(issue.repoFullName, issue.number, text)}
                  />
                </TableCell>
              )}
              <TableCell>
                <Typography variant="body2">{formatDate(issue.assignedDate)}</Typography>
              </TableCell>
              <TableCell>
                <Chip label={formatAge(issue.ageDays)} color={getAgeColor(issue.ageDays)} size="small" />
              </TableCell>
              <TableCell>
                <IconButton href={issue.htmlUrl} target="_blank" rel="noopener" size="small">
                  <OpenInNewIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

/** Map GitHub ProjectV2 color enum to hex */
function projectStatusColor(color: string): string {
  const map: Record<string, string> = {
    GREEN: '#1a7f37',
    YELLOW: '#bf8700',
    ORANGE: '#bc4c00',
    RED: '#cf222e',
    PURPLE: '#8250df',
    BLUE: '#0969da',
    PINK: '#bf3989',
    GRAY: '#6e7781',
  };
  return map[color] ?? map.GRAY;
}

function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}
