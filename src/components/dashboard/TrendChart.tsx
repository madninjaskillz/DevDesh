import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { TrendDataPoint } from '../../types/github';
import { colors } from '../../theme/colors';

interface TrendChartProps {
  data: TrendDataPoint[];
}

export function TrendChart({ data }: TrendChartProps) {
  const theme = useTheme();
  const textColor = theme.palette.text.secondary;
  const gridColor = theme.palette.divider;

  if (data.length < 2) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">
          Trend data will appear after the dashboard has been visited on multiple days.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {data.length === 0
            ? 'No data points recorded yet.'
            : `1 data point recorded (${data[0].date}). Come back tomorrow!`}
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
                stroke={colors.red.brand}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="openPRs"
                name="PRs"
                stroke={colors.blue[6]}
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
            Average Age Over Time (days)
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
                name="Avg Issue Age"
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
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
  );
}
