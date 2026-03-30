import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Paper from '@mui/material/Paper';
import { subDays, format, startOfDay, eachDayOfInterval } from 'date-fns';
import type { TrendDataPoint } from '../../types/github';
import { colors } from '../../theme/colors';

interface CalendarHeatmapProps {
  trendData: TrendDataPoint[];
  isLoading: boolean;
}

function getColor(value: number, max: number): string {
  if (value === 0) return colors.gray[2];
  const ratio = value / Math.max(max, 1);
  if (ratio < 0.25) return colors.green[1];
  if (ratio < 0.5) return colors.green[3];
  if (ratio < 0.75) return colors.orange[3];
  return colors.red[3];
}

export function CalendarHeatmap({ trendData, isLoading }: CalendarHeatmapProps) {
  const cells = useMemo(() => {
    const today = startOfDay(new Date());
    const start = subDays(today, 29);
    const days = eachDayOfInterval({ start, end: today });

    const dataMap = new Map<string, TrendDataPoint>();
    for (const point of trendData) {
      dataMap.set(point.date, point);
    }

    return days.map((day) => {
      const key = format(day, 'yyyy-MM-dd');
      const data = dataMap.get(key);
      const total = data ? data.openIssues + data.openPRs : 0;
      return { date: key, day, total, data };
    });
  }, [trendData]);

  if (isLoading || trendData.length === 0) return null;

  const maxTotal = Math.max(...cells.map((c) => c.total), 1);

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>Workload Heatmap (30 days)</Typography>
      <Box sx={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
        {cells.map((cell) => (
          <Tooltip
            key={cell.date}
            title={`${format(cell.day, 'dd MMM')}: ${cell.data?.openIssues ?? 0} issues, ${cell.data?.openPRs ?? 0} PRs`}
          >
            <Box
              sx={{
                width: 20,
                height: 20,
                borderRadius: '3px',
                bgcolor: getColor(cell.total, maxTotal),
                cursor: 'default',
                transition: 'transform 0.1s',
                '&:hover': { transform: 'scale(1.3)' },
              }}
            />
          </Tooltip>
        ))}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
        <Typography variant="caption" color="text.secondary">Less</Typography>
        {[colors.gray[2], colors.green[1], colors.green[3], colors.orange[3], colors.red[3]].map((c, i) => (
          <Box key={i} sx={{ width: 12, height: 12, borderRadius: '2px', bgcolor: c }} />
        ))}
        <Typography variant="caption" color="text.secondary">More</Typography>
      </Box>
    </Paper>
  );
}
