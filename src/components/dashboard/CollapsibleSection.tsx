import { useState, useCallback, useEffect, type ReactNode } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Collapse from '@mui/material/Collapse';
import { useThemeMode } from '../../theme/ThemeProvider';
import type { WindowChrome } from '../../theme/themes';

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

// === Window button renderers ===

function MacButtons({ onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <Box sx={{ display: 'flex', gap: '6px', mr: 1.5, alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
      <Box onClick={onToggle} sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FF5F57', border: '1px solid #E0443E', cursor: 'pointer', '&:hover': { filter: 'brightness(0.9)' } }} />
      <Box onClick={onToggle} sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FEBC2E', border: '1px solid #DEA123', cursor: 'pointer', '&:hover': { filter: 'brightness(0.9)' } }} />
      <Box onClick={onToggle} sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#28C840', border: '1px solid #1AAB29', cursor: 'pointer', '&:hover': { filter: 'brightness(0.9)' } }} />
    </Box>
  );
}

function Win95Buttons({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const btnSx = {
    width: 16, height: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    bgcolor: '#C0C0C0', border: '1px solid #000',
    boxShadow: 'inset -1px -1px 0 #808080, inset 1px 1px 0 #fff',
    fontSize: '8px', fontFamily: 'Marlett, sans-serif', fontWeight: 700, lineHeight: 1,
    '&:active': { boxShadow: 'inset 1px 1px 0 #808080' },
  };
  return (
    <Box sx={{ display: 'flex', gap: '2px', ml: 'auto' }} onClick={(e) => e.stopPropagation()}>
      <Box onClick={onToggle} sx={btnSx}><span style={{ fontSize: '9px' }}>_</span></Box>
      <Box onClick={onToggle} sx={btnSx}><span style={{ fontSize: '9px' }}>{collapsed ? '□' : '▪'}</span></Box>
    </Box>
  );
}

function WinXPButtons({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const btnSx = {
    width: 20, height: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: '3px', border: '1px solid rgba(0,0,0,0.3)',
    fontSize: '10px', fontWeight: 700, lineHeight: 1, color: '#fff',
  };
  return (
    <Box sx={{ display: 'flex', gap: '2px', ml: 'auto' }} onClick={(e) => e.stopPropagation()}>
      <Box onClick={onToggle} sx={{ ...btnSx, backgroundImage: 'linear-gradient(180deg, #3C8CF5 0%, #1A5FBF 100%)' }}>_</Box>
      <Box onClick={onToggle} sx={{ ...btnSx, backgroundImage: 'linear-gradient(180deg, #3C8CF5 0%, #1A5FBF 100%)' }}>{collapsed ? '□' : '▪'}</Box>
    </Box>
  );
}

function AmigaButtons({ onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const btnSx = {
    width: 20, height: 12, cursor: 'pointer', bgcolor: '#FF8800', border: '2px solid #000',
    '&:hover': { bgcolor: '#FFAA33' },
  };
  return (
    <Box sx={{ display: 'flex', gap: '2px' }} onClick={(e) => e.stopPropagation()}>
      <Box onClick={onToggle} sx={btnSx} />
      <Box sx={{ flex: 1 }} />
      <Box onClick={onToggle} sx={btnSx} />
    </Box>
  );
}

function C64Buttons({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <Box sx={{ display: 'flex', gap: '4px', ml: 'auto' }} onClick={(e) => e.stopPropagation()}>
      <Box onClick={onToggle} sx={{ color: '#A8A8FF', cursor: 'pointer', fontFamily: '"Courier New", monospace', fontWeight: 700, fontSize: '0.8rem', '&:hover': { color: '#fff' } }}>
        [{collapsed ? '+' : '-'}]
      </Box>
    </Box>
  );
}

function DefaultButtons({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <Box onClick={(e) => { e.stopPropagation(); onToggle(); }} sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'text.secondary', fontSize: '1rem' }}>
      {collapsed ? '▸' : '▾'}
    </Box>
  );
}

function MinimalButtons({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <Box onClick={(e) => { e.stopPropagation(); onToggle(); }} sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', opacity: 0.5, '&:hover': { opacity: 1 }, fontSize: '0.8rem', color: 'text.secondary' }}>
      {collapsed ? '＋' : '−'}
    </Box>
  );
}

function WindowButtons({ style, collapsed, onToggle, position }: { style: string; collapsed: boolean; onToggle: () => void; position: 'left' | 'right' }) {
  const buttons = (() => {
    switch (style) {
      case 'macos': return <MacButtons collapsed={collapsed} onToggle={onToggle} />;
      case 'win95': return <Win95Buttons collapsed={collapsed} onToggle={onToggle} />;
      case 'winxp': return <WinXPButtons collapsed={collapsed} onToggle={onToggle} />;
      case 'amiga': return <AmigaButtons collapsed={collapsed} onToggle={onToggle} />;
      case 'c64': return <C64Buttons collapsed={collapsed} onToggle={onToggle} />;
      case 'minimal': return <MinimalButtons collapsed={collapsed} onToggle={onToggle} />;
      default: return <DefaultButtons collapsed={collapsed} onToggle={onToggle} />;
    }
  })();

  return <Box sx={{ display: 'flex', alignItems: 'center', ...(position === 'right' ? { ml: 'auto' } : { mr: 1 }) }}>{buttons}</Box>;
}

export function CollapsibleSection({ id, title, children, badge, icon, autoCollapseWhenEmpty }: CollapsibleSectionProps) {
  const [manuallyToggled, setManuallyToggled] = useState(false);
  const [collapsed, setCollapsed] = useState(() => loadCollapsed().has(id));
  const { mode, themeDef } = useThemeMode();
  const chrome: WindowChrome | undefined = themeDef.windowChrome;

  useEffect(() => {
    if (!autoCollapseWhenEmpty || manuallyToggled) return;
    if (badge !== undefined && badge === 0 && !collapsed) setCollapsed(true);
    else if (badge !== undefined && badge > 0 && collapsed && !loadCollapsed().has(id)) setCollapsed(false);
  }, [badge, autoCollapseWhenEmpty, manuallyToggled, id]);

  const toggle = useCallback(() => {
    setManuallyToggled(true);
    setCollapsed((prev) => {
      const set = loadCollapsed();
      if (prev) set.delete(id); else set.add(id);
      saveCollapsed(set);
      return !prev;
    });
  }, [id]);

  const buttonPosition = chrome?.buttonPosition ?? 'right';
  const buttonStyle = chrome?.buttonStyle ?? 'default';
  const titleBarBg = chrome?.titleBarBg?.(mode);
  const hasTitleBar = !!titleBarBg || !!chrome;

  return (
    <Box id={id} sx={{ mt: 3 }}>
      {/* Title bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          mb: collapsed ? 0 : 1.5,
          userSelect: 'none',
          opacity: badge === 0 && collapsed ? 0.6 : 1,
          ...(titleBarBg ? {
            background: titleBarBg,
            color: '#fff',
            px: 1,
            py: 0.5,
            borderRadius: hasTitleBar ? '4px 4px 0 0' : undefined,
          } : {
            py: 0.25,
          }),
        }}
        onClick={toggle}
      >
        {/* Left buttons (macOS style) */}
        {buttonPosition === 'left' && (
          <WindowButtons style={buttonStyle} collapsed={collapsed} onToggle={toggle} position="left" />
        )}

        {/* Icon */}
        {(chrome?.showIcon !== false) && icon && (
          <Box sx={{ display: 'flex', mr: 0.75, color: titleBarBg ? '#fff' : 'text.secondary', opacity: 0.8 }}>{icon}</Box>
        )}

        {/* Title */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: chrome?.titleFontWeight ?? 700,
            fontSize: chrome?.titleFontSize ?? undefined,
            fontFamily: chrome?.titleFontFamily ?? undefined,
            textTransform: (chrome?.titleTextTransform as any) ?? undefined,
            color: titleBarBg ? '#fff' : undefined,
            flex: buttonPosition === 'right' ? undefined : 1,
          }}
        >
          {title}
        </Typography>

        {/* Badge */}
        {badge !== undefined && badge > 0 && (
          <Typography
            component="span"
            variant="caption"
            sx={{
              ml: 1,
              bgcolor: titleBarBg ? 'rgba(255,255,255,0.25)' : 'primary.main',
              color: titleBarBg ? '#fff' : 'primary.contrastText',
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

        {/* Right buttons (Windows style) */}
        {buttonPosition === 'right' && (
          <WindowButtons style={buttonStyle} collapsed={collapsed} onToggle={toggle} position="right" />
        )}

        {/* Default expand/collapse if no chrome */}
        {!chrome && (
          <Box sx={{ ml: 'auto', color: 'text.secondary', fontSize: '0.9rem' }}>
            {collapsed ? '▸' : '▾'}
          </Box>
        )}
      </Box>

      <Collapse in={!collapsed}>
        {children}
      </Collapse>
    </Box>
  );
}
