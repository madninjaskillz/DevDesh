import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import type { ActionItem } from '../../utils/actions';
import { colors } from '../../theme/colors';

interface HealthBarProps {
  actionItems: ActionItem[];
  isLoading: boolean;
}

export function HealthBar({ actionItems, isLoading }: HealthBarProps) {
  if (isLoading) return null;

  const critical = actionItems.filter((a) => a.severity === 'critical').length;
  const warnings = actionItems.filter((a) => a.severity === 'warning').length;
  const total = actionItems.length;

  let color: string;
  let label: string;

  if (critical > 0) {
    color = colors.red.brand;
    label = `${critical} critical item${critical > 1 ? 's' : ''} need attention`;
  } else if (warnings > 0) {
    color = colors.orange[5];
    label = `${warnings} item${warnings > 1 ? 's' : ''} to watch`;
  } else if (total > 0) {
    color = colors.blue[5];
    label = `${total} low-priority item${total > 1 ? 's' : ''}`;
  } else {
    color = colors.green[5];
    label = 'All clear';
  }

  return (
    <Tooltip title={label}>
      <Box sx={{ height: 4, borderRadius: 2, bgcolor: 'action.hover', mb: 2, overflow: 'hidden' }}>
        <Box
          sx={{
            height: '100%',
            borderRadius: 2,
            bgcolor: color,
            width: '100%',
            transition: 'background-color 0.3s ease',
          }}
        />
      </Box>
    </Tooltip>
  );
}
