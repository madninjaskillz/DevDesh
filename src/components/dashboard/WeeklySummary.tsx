import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import type { TrendDataPoint } from '../../types/github';
import { colors } from '../../theme/colors';

interface WeeklySummaryProps {
  trendData: TrendDataPoint[];
  isLoading: boolean;
}

function avg(arr: number[]): number {
  return arr.length > 0 ? Math.round(arr.reduce((s, n) => s + n, 0) / arr.length) : 0;
}

function TrendIndicator({ current, previous, label, lowerIsBetter = true }: { current: number; previous: number; label: string; lowerIsBetter?: boolean }) {
  const diff = current - previous;
  const improved = lowerIsBetter ? diff < 0 : diff > 0;
  const unchanged = diff === 0;

  return (
    <Box sx={{ textAlign: 'center', flex: 1 }}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>{current}</Typography>
        {unchanged ? (
          <TrendingFlatIcon sx={{ color: colors.gray[5], fontSize: 18 }} />
        ) : improved ? (
          <TrendingDownIcon sx={{ color: colors.green[5], fontSize: 18 }} />
        ) : (
          <TrendingUpIcon sx={{ color: colors.red.brand, fontSize: 18 }} />
        )}
      </Box>
      {!unchanged && (
        <Typography variant="caption" sx={{ color: improved ? colors.green[5] : colors.red.brand }}>
          {diff > 0 ? '+' : ''}{diff} vs last week
        </Typography>
      )}
    </Box>
  );
}

export function WeeklySummary({ trendData, isLoading }: WeeklySummaryProps) {
  if (isLoading) return <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 1 }} />;
  if (trendData.length < 8) return null; // Need at least 8 days for week comparison

  const thisWeek = trendData.slice(-7);
  const lastWeek = trendData.slice(-14, -7);

  const thisIssues = avg(thisWeek.map((d) => d.openIssues));
  const lastIssues = avg(lastWeek.map((d) => d.openIssues));
  const thisPRs = avg(thisWeek.map((d) => d.openPRs));
  const lastPRs = avg(lastWeek.map((d) => d.openPRs));
  const thisIssueAge = avg(thisWeek.map((d) => d.avgIssueAgeDays));
  const lastIssueAge = avg(lastWeek.map((d) => d.avgIssueAgeDays));
  const thisPRAge = avg(thisWeek.map((d) => d.avgPRAgeDays));
  const lastPRAge = avg(lastWeek.map((d) => d.avgPRAgeDays));

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="subtitle2" sx={{ mb: 1.5 }}>This Week vs Last Week</Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <TrendIndicator current={thisIssues} previous={lastIssues} label="Avg Open Issues" />
        <TrendIndicator current={thisPRs} previous={lastPRs} label="Avg Open PRs" />
        <TrendIndicator current={thisIssueAge} previous={lastIssueAge} label="Avg Issue Age (d)" />
        <TrendIndicator current={thisPRAge} previous={lastPRAge} label="Avg PR Age (d)" />
      </Box>
    </Paper>
  );
}
