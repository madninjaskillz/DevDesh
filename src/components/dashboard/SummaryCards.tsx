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
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  isLoading: boolean;
}

function StatCard({ title, value, icon, color, isLoading }: StatCardProps) {
  return (
    <Card elevation={1}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: `${color}18`,
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        </Box>
        {isLoading ? (
          <Skeleton width={60} height={36} />
        ) : (
          <Typography variant="h4" sx={{ fontWeight: 700, color, mt: 0.5 }}>
            {value}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export function SummaryCards({ totalIssues, totalPRs, avgIssueAge, avgPRAge, isLoading }: SummaryCardsProps) {
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title="Open Issues"
          value={String(totalIssues)}
          icon={<BugReportIcon sx={{ color: colors.red.brand, fontSize: 22 }} />}
          color={colors.red.brand}
          isLoading={isLoading}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title="Open PRs"
          value={String(totalPRs)}
          icon={<MergeIcon sx={{ color: colors.blue[6], fontSize: 22 }} />}
          color={colors.blue[6]}
          isLoading={isLoading}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title="Avg Issue Age"
          value={formatAge(avgIssueAge)}
          icon={<ScheduleIcon sx={{ color: colors.orange[5], fontSize: 22 }} />}
          color={colors.orange[5]}
          isLoading={isLoading}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title="Avg PR Age"
          value={formatAge(avgPRAge)}
          icon={<ScheduleIcon sx={{ color: colors.green[5], fontSize: 22 }} />}
          color={colors.green[5]}
          isLoading={isLoading}
        />
      </Grid>
    </Grid>
  );
}
