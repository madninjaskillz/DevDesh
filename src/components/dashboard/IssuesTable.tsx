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
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import type { DashboardIssue } from '../../types/github';
import type { GroupBy } from './LabelFilter';
import { NoteChip } from './NoteChip';
import { OverflowChips } from './OverflowChips';
import { daysAgo, formatAge, formatDate, getAgeColor } from '../../utils/dates';
import { useHighlight, scrollToHighlighted } from '../../hooks/useHighlight';

type SortField = 'title' | 'repoName' | 'ageDays' | 'updatedAt';
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
  const { highlightedKey, setHighlightedKey } = useHighlight();
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
      if (sortField === 'updatedAt') return a.updatedAt.localeCompare(b.updatedAt) * mul;
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
            <TableCell>Assignees</TableCell>
            <TableCell>Labels</TableCell>
            <TableCell>Board</TableCell>
            <TableCell>Linked PRs</TableCell>
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
          {sorted.map((issue) => (
            <TableRow
              key={`${issue.repoFullName}-${issue.number}`}
              hover
              data-item-key={`${issue.repoFullName}-${issue.number}`}
              sx={highlightedKey === `${issue.repoFullName}-${issue.number}` ? {
                bgcolor: (theme) => theme.palette.mode === 'light' ? 'rgba(25, 118, 210, 0.08)' : 'rgba(144, 202, 249, 0.08)',
                transition: 'background-color 0.2s',
              } : { transition: 'background-color 0.2s' }}
            >
              {notes && (
                <TableCell>
                  <NoteChip
                    note={notes.getNote(issue.repoFullName, issue.number)}
                    onSave={(text) => notes.setNote(issue.repoFullName, issue.number, text)}
                  />
                </TableCell>
              )}
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
              </TableCell>
              <TableCell>
                <Chip label={issue.repoName} variant="outlined" />
              </TableCell>
              <TableCell>
                <AvatarGroup max={4} sx={{ justifyContent: 'flex-start', '& .MuiAvatar-root': { width: 24, height: 24, fontSize: '0.7rem' } }}>
                  {issue.assignees.map((a) => (
                    <Tooltip key={a.login} title={a.login}>
                      <Avatar src={a.avatar_url} alt={a.login} />
                    </Tooltip>
                  ))}
                </AvatarGroup>
              </TableCell>
              <TableCell>
                <OverflowChips
                  maxVisible={2}
                  items={issue.labels.map((label) => ({
                    key: String(label.id),
                    label: label.name,
                    chipProps: {
                      variant: 'filled' as const,
                      sx: {
                        bgcolor: `#${label.color}`,
                        color: isLightColor(label.color) ? '#000' : '#fff',
                      },
                    },
                  }))}
                />
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
                  <OverflowChips
                    maxVisible={2}
                    items={issue.linkedPRs.map((pr) => ({
                      key: pr.url,
                      label: `#${pr.number}`,
                      tooltip: pr.title,
                      href: pr.url,
                      highlightKey: `${issue.repoFullName.split('/')[0]}/${pr.repoName}-${pr.number}`,
                      chipProps: {
                        color: pr.state === 'MERGED' ? 'success' as const : pr.state === 'OPEN' ? 'primary' as const : 'default' as const,
                      },
                    }))}
                    onHighlight={(key) => {
                      setHighlightedKey(key);
                      if (key) scrollToHighlighted(key);
                    }}
                  />
                ) : (
                  <Typography variant="body2" color="text.secondary">--</Typography>
                )}
              </TableCell>
              <TableCell>
                <Chip label={formatAge(issue.ageDays)} color={getAgeColor(issue.ageDays)} size="small" />
              </TableCell>
              <TableCell>
                <Tooltip title={formatDate(issue.updatedAt)}>
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                    {formatAge(daysAgo(issue.updatedAt))} ago
                  </Typography>
                </Tooltip>
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
