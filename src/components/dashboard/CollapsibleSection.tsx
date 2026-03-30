import { useState, useCallback, useEffect, type ReactNode } from 'react';
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
  icon?: ReactNode;
  autoCollapseWhenEmpty?: boolean;
}

export function CollapsibleSection({ id, title, children, badge, icon, autoCollapseWhenEmpty }: CollapsibleSectionProps) {
  const [manuallyToggled, setManuallyToggled] = useState(false);
  const [collapsed, setCollapsed] = useState(() => loadCollapsed().has(id));

  // Auto-collapse when empty (unless user has manually toggled)
  useEffect(() => {
    if (!autoCollapseWhenEmpty || manuallyToggled) return;
    if (badge !== undefined && badge === 0 && !collapsed) {
      setCollapsed(true);
    } else if (badge !== undefined && badge > 0 && collapsed && !loadCollapsed().has(id)) {
      setCollapsed(false);
    }
  }, [badge, autoCollapseWhenEmpty, manuallyToggled, id]);

  const toggle = useCallback(() => {
    setManuallyToggled(true);
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
          opacity: badge === 0 && collapsed ? 0.6 : 1,
        }}
        onClick={toggle}
      >
        <IconButton size="small" sx={{ mr: 0.5 }}>
          {collapsed ? <ExpandMoreIcon fontSize="small" /> : <ExpandLessIcon fontSize="small" />}
        </IconButton>
        {icon && <Box sx={{ display: 'flex', mr: 0.75, color: 'text.secondary' }}>{icon}</Box>}
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
