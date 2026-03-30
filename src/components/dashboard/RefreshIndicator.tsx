import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

interface RefreshIndicatorProps {
  lastRefresh: Date;
  isLoading: boolean;
}

export function RefreshIndicator({ lastRefresh, isLoading }: RefreshIndicatorProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isLoading) {
      setProgress(0);
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Date.now() - lastRefresh.getTime();
      const pct = Math.min(100, (elapsed / REFRESH_INTERVAL) * 100);
      setProgress(pct);
    }, 1000);

    return () => clearInterval(interval);
  }, [lastRefresh, isLoading]);

  const secondsUntilRefresh = Math.max(0, Math.round((REFRESH_INTERVAL - (Date.now() - lastRefresh.getTime())) / 1000));
  const minutes = Math.floor(secondsUntilRefresh / 60);
  const seconds = secondsUntilRefresh % 60;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 160 }}>
      <Box sx={{ flex: 1 }}>
        <LinearProgress
          variant={isLoading ? 'indeterminate' : 'determinate'}
          value={progress}
          sx={{ height: 3, borderRadius: 1 }}
        />
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap', fontSize: '0.7rem' }}>
        {isLoading ? 'Refreshing...' : `${minutes}:${String(seconds).padStart(2, '0')}`}
      </Typography>
    </Box>
  );
}
