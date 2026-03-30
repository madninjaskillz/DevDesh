import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import type { DashboardIssue } from '../../types/github';

export type GroupBy = 'none' | 'label' | 'repo';

interface LabelFilterProps {
  issues: DashboardIssue[];
  selectedLabels: string[];
  onLabelsChange: (labels: string[]) => void;
  groupBy: GroupBy;
  onGroupByChange: (g: GroupBy) => void;
}

function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

export function LabelFilter({ issues, selectedLabels, onLabelsChange, groupBy, onGroupByChange }: LabelFilterProps) {
  const allLabels = useMemo(() => {
    const map = new Map<string, { name: string; color: string; count: number }>();
    for (const issue of issues) {
      for (const label of issue.labels) {
        const existing = map.get(label.name);
        if (existing) {
          existing.count++;
        } else {
          map.set(label.name, { name: label.name, color: label.color, count: 1 });
        }
      }
    }
    return [...map.values()].sort((a, b) => b.count - a.count);
  }, [issues]);

  if (allLabels.length === 0) return null;

  const toggleLabel = (name: string) => {
    if (selectedLabels.includes(name)) {
      onLabelsChange(selectedLabels.filter((l) => l !== name));
    } else {
      onLabelsChange([...selectedLabels, name]);
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', flex: 1 }}>
        {allLabels.map((label) => {
          const selected = selectedLabels.includes(label.name);
          return (
            <Chip
              key={label.name}
              label={`${label.name} (${label.count})`}
              size="small"
              onClick={() => toggleLabel(label.name)}
              sx={{
                bgcolor: selected ? `#${label.color}` : 'transparent',
                color: selected ? (isLightColor(label.color) ? '#000' : '#fff') : 'text.primary',
                border: `1px solid #${label.color}`,
                fontWeight: selected ? 600 : 400,
              }}
            />
          );
        })}
        {selectedLabels.length > 0 && (
          <Chip label="Clear" size="small" variant="outlined" onClick={() => onLabelsChange([])} />
        )}
      </Box>
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
