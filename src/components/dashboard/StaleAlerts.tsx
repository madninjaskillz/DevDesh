import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import type { ActionItem } from '../../utils/actions';

interface StaleAlertsProps {
  items: ActionItem[];
}

export function StaleAlerts({ items }: StaleAlertsProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const criticalItems = items.filter((i) => i.severity === 'critical' && !dismissed.has(i.id));

  if (criticalItems.length === 0) return null;

  return (
    <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
      {criticalItems.slice(0, 5).map((item) => (
        <Alert
          key={item.id}
          severity="warning"
          onClose={() => setDismissed((prev) => new Set(prev).add(item.id))}
        >
          <Link href={item.url} target="_blank" rel="noopener" underline="hover" color="inherit">
            <strong>{item.title}</strong>
          </Link>
          {' — '}
          {item.description}
        </Alert>
      ))}
    </Box>
  );
}
