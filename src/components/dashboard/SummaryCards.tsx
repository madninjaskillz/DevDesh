import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import BugReportIcon from '@mui/icons-material/BugReport';
import MergeIcon from '@mui/icons-material/CallMerge';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { formatAge } from '../../utils/dates';
import { colors } from '../../theme/colors';

interface SummaryCardsProps {
  totalIssues: number;
  totalPRs: number;
  avgIssueAge: number;
  avgPRAge: number;
  isLoading: boolean;
  staleIssueDays?: number;
  stalePRDays?: number;
}

type TrafficLight = 'green' | 'amber' | 'red';

function getTrafficLight(value: number, threshold: number): TrafficLight {
  if (value <= 0) return 'green';
  if (value >= threshold * 2) return 'red';
  if (value >= threshold) return 'amber';
  return 'green';
}

const TRAFFIC_COLORS: Record<TrafficLight, { bg: string; text: string }> = {
  green: { bg: 'rgba(52, 199, 89, 0.12)', text: colors.green[5] },
  amber: { bg: 'rgba(255, 149, 0, 0.12)', text: colors.orange[5] },
  red: { bg: 'rgba(255, 59, 48, 0.12)', text: colors.red.brand },
};

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trafficLight: TrafficLight;
  isLoading: boolean;
}

function StatCard({ title, value, icon, trafficLight, isLoading }: StatCardProps) {
  const tc = TRAFFIC_COLORS[trafficLight];
  return (
    <Card elevation={1} sx={{ bgcolor: isLoading ? undefined : tc.bg }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
          {icon}
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
        </Box>
        {isLoading ? (
          <Skeleton width={60} height={36} />
        ) : (
          <Typography variant="h4" sx={{ fontWeight: 700, color: tc.text }}>
            {value}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export function SummaryCards({ totalIssues, totalPRs, avgIssueAge, avgPRAge, isLoading, staleIssueDays = 7, stalePRDays = 1 }: SummaryCardsProps) {
  const issueCountLight = getTrafficLight(totalIssues, 5);
  const prCountLight = getTrafficLight(totalPRs, 5);
  const issueAgeLight = getTrafficLight(avgIssueAge, staleIssueDays);
  const prAgeLight = getTrafficLight(avgPRAge, stalePRDays);

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title="Open Issues"
          value={String(totalIssues)}
          icon={<BugReportIcon sx={{ fontSize: 22 }} />}
          trafficLight={issueCountLight}
          isLoading={isLoading}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title="Open PRs"
          value={String(totalPRs)}
          icon={<MergeIcon sx={{ fontSize: 22 }} />}
          trafficLight={prCountLight}
          isLoading={isLoading}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title="Avg Issue Age"
          value={formatAge(avgIssueAge)}
          icon={<ScheduleIcon sx={{ fontSize: 22 }} />}
          trafficLight={issueAgeLight}
          isLoading={isLoading}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title="Avg PR Age"
          value={formatAge(avgPRAge)}
          icon={<ScheduleIcon sx={{ fontSize: 22 }} />}
          trafficLight={prAgeLight}
          isLoading={isLoading}
        />
      </Grid>
    </Grid>
  );
}
