import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import { useTheme } from '@mui/material/styles';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import type { TrendDataPoint } from '../../types/github';
import { colors } from '../../theme/colors';

interface Goals {
  goalMaxOpenIssues: number | null;
  goalMaxOpenPRs: number | null;
  goalMaxIssueAgeDays: number | null;
  goalMaxPRAgeDays: number | null;
  goalMaxCycleTimeDays: number | null;
}

interface TrendChartProps {
  data: TrendDataPoint[];
  isLoading?: boolean;
  goals?: Goals;
}

function GoalLine({ value }: { value: number | null | undefined }) {
  if (value == null) return null;
  return <ReferenceLine y={value} stroke={colors.red[3]} strokeDasharray="5 5" label={{ value: 'Goal', position: 'right', fill: colors.red[3], fontSize: 11 }} />;
}

export function TrendChart({ data, isLoading, goals }: TrendChartProps) {
  const theme = useTheme();
  const textColor = theme.palette.text.secondary;
  const gridColor = theme.palette.divider;

  if (isLoading) {
    return (
      <Grid container spacing={2}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <Grid key={i} size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 2 }}>
              <Skeleton variant="text" width={200} />
              <Skeleton variant="rectangular" height={280} />
            </Paper>
          </Grid>
        ))}
      </Grid>
    );
  }

  if (data.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">
          No trend data available.
        </Typography>
      </Paper>
    );
  }

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Open Items Over Time
          </Typography>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: textColor }} />
              <YAxis tick={{ fontSize: 12, fill: textColor }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${gridColor}`,
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="openIssues"
                name="Issues"
                stroke={colors.orange[5]}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="openPRs"
                name="PRs"
                stroke={colors.green[5]}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <GoalLine value={goals?.goalMaxOpenIssues} />
              <GoalLine value={goals?.goalMaxOpenPRs} />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Rolling 30-Day Closed
          </Typography>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: textColor }} />
              <YAxis tick={{ fontSize: 12, fill: textColor }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${gridColor}`,
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="closedIssues30d"
                name="Issues Closed (30d)"
                stroke={colors.orange[5]}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="closedPRs30d"
                name="PRs Closed (30d)"
                stroke={colors.green[5]}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Daily Closed
          </Typography>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: textColor }} />
              <YAxis tick={{ fontSize: 12, fill: textColor }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${gridColor}`,
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="closedIssuesToday"
                name="Issues Closed"
                stroke={colors.orange[5]}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="closedPRsToday"
                name="PRs Closed"
                stroke={colors.green[5]}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Average Time On Plate (days)
          </Typography>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: textColor }} />
              <YAxis tick={{ fontSize: 12, fill: textColor }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${gridColor}`,
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="avgIssueAgeDays"
                name="Avg Time Assigned"
                stroke={colors.orange[5]}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="avgPRAgeDays"
                name="Avg PR Age"
                stroke={colors.green[5]}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <GoalLine value={goals?.goalMaxIssueAgeDays} />
              <GoalLine value={goals?.goalMaxPRAgeDays} />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Max Time On Plate (days)
          </Typography>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: textColor }} />
              <YAxis tick={{ fontSize: 12, fill: textColor }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${gridColor}`,
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="maxIssueAgeDays"
                name="Max Time Assigned"
                stroke={colors.orange[5]}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="maxPRAgeDays"
                name="Max PR Age"
                stroke={colors.green[5]}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <GoalLine value={goals?.goalMaxIssueAgeDays} />
              <GoalLine value={goals?.goalMaxPRAgeDays} />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            PR Cycle Time (days)
          </Typography>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: textColor }} />
              <YAxis tick={{ fontSize: 12, fill: textColor }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${gridColor}`,
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="avgCycleTimeDays"
                name="Avg Cycle Time"
                stroke={colors.green[5]}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <GoalLine value={goals?.goalMaxCycleTimeDays} />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Issue Aging Breakdown
          </Typography>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: textColor }} />
              <YAxis tick={{ fontSize: 12, fill: textColor }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${gridColor}`,
                }}
              />
              <Legend />
              <Area type="monotone" dataKey="issuesAge14plus" name="14+ days" stackId="1" fill={colors.red[3]} stroke={colors.red[3]} />
              <Area type="monotone" dataKey="issuesAge7to14" name="7–14 days" stackId="1" fill={colors.orange[3]} stroke={colors.orange[3]} />
              <Area type="monotone" dataKey="issuesAge3to7" name="3–7 days" stackId="1" fill={colors.orange[1]} stroke={colors.orange[1]} />
              <Area type="monotone" dataKey="issuesAge0to3" name="< 3 days" stackId="1" fill={colors.green[3]} stroke={colors.green[3]} />
            </AreaChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            PR Aging Breakdown
          </Typography>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: textColor }} />
              <YAxis tick={{ fontSize: 12, fill: textColor }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${gridColor}`,
                }}
              />
              <Legend />
              <Area type="monotone" dataKey="prsAge14plus" name="14+ days" stackId="1" fill={colors.red[3]} stroke={colors.red[3]} />
              <Area type="monotone" dataKey="prsAge7to14" name="7–14 days" stackId="1" fill={colors.orange[3]} stroke={colors.orange[3]} />
              <Area type="monotone" dataKey="prsAge3to7" name="3–7 days" stackId="1" fill={colors.orange[1]} stroke={colors.orange[1]} />
              <Area type="monotone" dataKey="prsAge0to3" name="< 3 days" stackId="1" fill={colors.green[3]} stroke={colors.green[3]} />
            </AreaChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
  );
}
