import { useState, useCallback, type ReactNode } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const STORAGE_KEY = 'devdash-collapsed';

function loadCollapsed(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveCollapsed(set: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
}

interface CollapsibleSectionProps {
  id: string;
  title: string;
  children: ReactNode;
  badge?: number;
}

export function CollapsibleSection({ id, title, children, badge }: CollapsibleSectionProps) {
  const [collapsed, setCollapsed] = useState(() => loadCollapsed().has(id));

  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      const set = loadCollapsed();
      if (prev) {
        set.delete(id);
      } else {
        set.add(id);
      }
      saveCollapsed(set);
      return !prev;
    });
  }, [id]);

  return (
    <Box id={id} sx={{ mt: 3 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          mb: collapsed ? 0 : 1.5,
          userSelect: 'none',
        }}
        onClick={toggle}
      >
        <IconButton size="small" sx={{ mr: 0.5 }}>
          {collapsed ? <ExpandMoreIcon fontSize="small" /> : <ExpandLessIcon fontSize="small" />}
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        {badge !== undefined && badge > 0 && (
          <Typography
            component="span"
            variant="caption"
            sx={{
              ml: 1,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              borderRadius: '10px',
              px: 0.8,
              py: 0.1,
              fontSize: '0.7rem',
              fontWeight: 600,
            }}
          >
            {badge}
          </Typography>
        )}
      </Box>
      <Collapse in={!collapsed}>
        {children}
      </Collapse>
    </Box>
  );
}
