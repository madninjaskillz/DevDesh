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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            {isLoading ? (
              <Skeleton width={60} height={40} />
            ) : (
              <Typography variant="h4" sx={{ fontWeight: 700, color }}>
                {value}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: `${color}18`,
            }}
          >
            {icon}
          </Box>
        </Box>
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
          icon={<BugReportIcon sx={{ color: colors.red.brand, fontSize: 28 }} />}
          color={colors.red.brand}
          isLoading={isLoading}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title="Open PRs"
          value={String(totalPRs)}
          icon={<MergeIcon sx={{ color: colors.blue[6], fontSize: 28 }} />}
          color={colors.blue[6]}
          isLoading={isLoading}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title="Avg Issue Age"
          value={formatAge(avgIssueAge)}
          icon={<ScheduleIcon sx={{ color: colors.orange[5], fontSize: 28 }} />}
          color={colors.orange[5]}
          isLoading={isLoading}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title="Avg PR Age"
          value={formatAge(avgPRAge)}
          icon={<ScheduleIcon sx={{ color: colors.green[5], fontSize: 28 }} />}
          color={colors.green[5]}
          isLoading={isLoading}
        />
      </Grid>
    </Grid>
  );
}
