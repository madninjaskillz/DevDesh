import { useState, useRef, useCallback } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';

interface OverflowItem {
  key: string;
  label: string;
  href?: string;
  chipProps?: Record<string, any>;
}

interface OverflowChipsProps {
  items: OverflowItem[];
  maxVisible?: number;
}

export function OverflowChips({ items, maxVisible = 1 }: OverflowChipsProps) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleClose = useCallback(() => {
    closeTimer.current = setTimeout(() => setOpen(false), 400);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const handleEnter = useCallback(() => {
    cancelClose();
    setOpen(true);
  }, [cancelClose]);

  const handleLeave = useCallback(() => {
    scheduleClose();
  }, [scheduleClose]);

  if (items.length === 0) return null;

  const visible = items.slice(0, maxVisible);
  const overflow = items.slice(maxVisible);

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
      {visible.map((item) => (
        <Chip
          key={item.key}
          label={item.label}
          size="small"
          component={item.href ? 'a' : 'span'}
          href={item.href}
          target={item.href ? '_blank' : undefined}
          rel={item.href ? 'noopener' : undefined}
          clickable={!!item.href}
          variant="outlined"
          {...item.chipProps}
        />
      ))}
      {overflow.length > 0 && (
        <>
          <Chip
            ref={anchorRef}
            label={`+${overflow.length} more`}
            size="small"
            variant="outlined"
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
            sx={{ cursor: 'default', fontSize: '0.7rem' }}
          />
          <Popper
            open={open}
            anchorEl={anchorRef.current}
            placement="bottom-start"
            sx={{ zIndex: 1300 }}
          >
            <Paper
              elevation={4}
              onMouseEnter={cancelClose}
              onMouseLeave={handleLeave}
              sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 0.5, maxWidth: 320, maxHeight: 240, overflow: 'auto' }}
            >
              {overflow.map((item) => (
                <Chip
                  key={item.key}
                  label={item.label}
                  size="small"
                  component={item.href ? 'a' : 'span'}
                  href={item.href}
                  target={item.href ? '_blank' : undefined}
                  rel={item.href ? 'noopener' : undefined}
                  clickable={!!item.href}
                  variant="outlined"
                  {...item.chipProps}
                />
              ))}
            </Paper>
          </Popper>
        </>
      )}
    </Box>
  );
}
