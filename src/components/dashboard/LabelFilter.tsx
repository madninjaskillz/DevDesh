import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import LabelIcon from '@mui/icons-material/Label';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import type { DashboardIssue } from '../../types/github';

export type GroupBy = 'none' | 'label' | 'repo';

interface LabelFilterProps {
  issues: DashboardIssue[];
  selectedLabels: string[];
  onLabelsChange: (labels: string[]) => void;
  selectedStatuses: string[];
  onStatusesChange: (statuses: string[]) => void;
  groupBy: GroupBy;
  onGroupByChange: (g: GroupBy) => void;
}

function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

const STATUS_COLORS: Record<string, string> = {
  GREEN: '#2da44e', RED: '#cf222e', YELLOW: '#bf8700', ORANGE: '#bc4c00',
  PURPLE: '#8250df', BLUE: '#0969da', PINK: '#bf3989', GRAY: '#656d76',
};

interface FilterDropdownProps {
  label: string;
  icon: React.ReactNode;
  items: { name: string; color: string; count: number }[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

function FilterDropdown({ label, icon, items, selected, onChange }: FilterDropdownProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => i.name.toLowerCase().includes(q));
  }, [items, search]);

  const toggle = (name: string) => {
    if (selected.includes(name)) {
      onChange(selected.filter((s) => s !== name));
    } else {
      onChange([...selected, name]);
    }
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <Button
        size="small"
        variant={selected.length > 0 ? 'contained' : 'outlined'}
        startIcon={icon}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{ textTransform: 'none', fontSize: '0.75rem' }}
      >
        {label}{selected.length > 0 ? ` (${selected.length})` : ''}
      </Button>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => { setAnchorEl(null); setSearch(''); }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { sx: { width: 280, maxHeight: 360 } } }}
      >
        <Box sx={{ p: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <TextField
            size="small"
            fullWidth
            placeholder={`Search ${label.toLowerCase()}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16 }} /></InputAdornment> } }}
            sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.8rem' } }}
          />
        </Box>
        <Box sx={{ overflow: 'auto', maxHeight: 260, px: 0.5, py: 0.5 }}>
          {filtered.length === 0 && (
            <Typography variant="caption" color="text.secondary" sx={{ p: 1, display: 'block' }}>
              No matches
            </Typography>
          )}
          {filtered.map((item) => (
            <FormControlLabel
              key={item.name}
              control={
                <Checkbox
                  size="small"
                  checked={selected.includes(item.name)}
                  onChange={() => toggle(item.name)}
                  sx={{ py: 0.25 }}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: item.color.startsWith('#') ? item.color : `#${item.color}`, flexShrink: 0 }} />
                  <Typography variant="body2" sx={{ fontSize: '0.8rem', flex: 1 }} noWrap>
                    {item.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', flexShrink: 0 }}>
                    {item.count}
                  </Typography>
                </Box>
              }
              sx={{ display: 'flex', mx: 0, width: '100%', '& .MuiFormControlLabel-label': { flex: 1, minWidth: 0 } }}
            />
          ))}
        </Box>
        {selected.length > 0 && (
          <Box sx={{ p: 0.75, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'flex-end' }}>
            <Button size="small" onClick={() => onChange([])} sx={{ fontSize: '0.7rem', textTransform: 'none' }}>
              Clear all
            </Button>
          </Box>
        )}
      </Popover>
    </>
  );
}

export function LabelFilter({ issues, selectedLabels, onLabelsChange, selectedStatuses, onStatusesChange, groupBy, onGroupByChange }: LabelFilterProps) {
  const allLabels = useMemo(() => {
    const map = new Map<string, { name: string; color: string; count: number }>();
    for (const issue of issues) {
      for (const label of issue.labels) {
        const existing = map.get(label.name);
        if (existing) existing.count++;
        else map.set(label.name, { name: label.name, color: `#${label.color}`, count: 1 });
      }
    }
    return [...map.values()].sort((a, b) => b.count - a.count);
  }, [issues]);

  const allStatuses = useMemo(() => {
    const map = new Map<string, { name: string; color: string; count: number }>();
    for (const issue of issues) {
      if (!issue.projectStatus) continue;
      const existing = map.get(issue.projectStatus.name);
      if (existing) existing.count++;
      else map.set(issue.projectStatus.name, {
        name: issue.projectStatus.name,
        color: STATUS_COLORS[issue.projectStatus.color] ?? STATUS_COLORS.GRAY,
        count: 1,
      });
    }
    return [...map.values()].sort((a, b) => b.count - a.count);
  }, [issues]);

  const hasFilters = selectedLabels.length > 0 || selectedStatuses.length > 0;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
      {allLabels.length > 0 && (
        <FilterDropdown
          label="Labels"
          icon={<LabelIcon sx={{ fontSize: 16 }} />}
          items={allLabels}
          selected={selectedLabels}
          onChange={onLabelsChange}
        />
      )}
      {allStatuses.length > 0 && (
        <FilterDropdown
          label="Board"
          icon={<ViewColumnIcon sx={{ fontSize: 16 }} />}
          items={allStatuses}
          selected={selectedStatuses}
          onChange={onStatusesChange}
        />
      )}

      {/* Active filter chips */}
      {selectedLabels.map((name) => {
        const label = allLabels.find((l) => l.name === name);
        return (
          <Chip
            key={`l-${name}`}
            label={name}
            size="small"
            onDelete={() => onLabelsChange(selectedLabels.filter((l) => l !== name))}
            sx={{
              bgcolor: label?.color,
              color: label ? (isLightColor(label.color.replace('#', '')) ? '#000' : '#fff') : undefined,
              fontWeight: 600,
              fontSize: '0.7rem',
            }}
          />
        );
      })}
      {selectedStatuses.map((name) => {
        const status = allStatuses.find((s) => s.name === name);
        return (
          <Chip
            key={`s-${name}`}
            label={name}
            size="small"
            onDelete={() => onStatusesChange(selectedStatuses.filter((s) => s !== name))}
            sx={{ bgcolor: status?.color, color: '#fff', fontWeight: 600, fontSize: '0.7rem' }}
          />
        );
      })}
      {hasFilters && (
        <Chip label="Clear all" size="small" variant="outlined" onClick={() => { onLabelsChange([]); onStatusesChange([]); }} sx={{ fontSize: '0.7rem' }} />
      )}

      <Box sx={{ flex: 1 }} />

      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Group by</InputLabel>
        <Select
          value={groupBy}
          label="Group by"
          onChange={(e) => onGroupByChange(e.target.value as GroupBy)}
        >
          <MenuItem value="none">None</MenuItem>
          <MenuItem value="label">Label</MenuItem>
          <MenuItem value="repo">Repo</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}
