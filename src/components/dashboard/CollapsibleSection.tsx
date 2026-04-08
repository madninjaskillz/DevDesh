import { useState, useCallback, useEffect, type ReactNode } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Collapse from '@mui/material/Collapse';
import { useThemeMode, useTextCase } from '../../theme/ThemeProvider';
// WindowChrome type used via themeDef.windowChrome

const STORAGE_KEY = 'devdash-collapsed';

function loadCollapsed(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch { return new Set(); }
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

// ─── Amiga Workbench 1.3 ───
// Blue title bar with horizontal white/blue stripes, close gadget (square) on left, depth gadget on right
function AmigaTitleBar({ title, onToggle, badge }: { title: string; collapsed: boolean; onToggle: () => void; badge?: number }) {
  const gadgetSx = {
    width: 18, height: 14, cursor: 'pointer', bgcolor: '#0055AA',
    border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center',
    '&:hover': { bgcolor: '#3377CC' },
  };
  return (
    <Box onClick={onToggle} sx={{
      display: 'flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none',
      background: 'repeating-linear-gradient(0deg, #0055AA 0px, #0055AA 2px, #FFFFFF 2px, #FFFFFF 4px)',
      border: '2px solid #000', height: 22, px: 0,
    }}>
      {/* Close gadget on left */}
      <Box onClick={(e) => { e.stopPropagation(); onToggle(); }} sx={gadgetSx} />
      {/* Title text on solid background */}
      <Box sx={{ bgcolor: '#0055AA', px: 1, mx: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Typography sx={{ color: '#fff', fontFamily: '"Courier New", monospace', fontWeight: 700, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
          {title}
        </Typography>
        {badge !== undefined && badge > 0 && (
          <Typography component="span" sx={{ color: '#FF8800', fontFamily: '"Courier New", monospace', fontWeight: 700, fontSize: '0.7rem' }}>
            [{badge}]
          </Typography>
        )}
      </Box>
      <Box sx={{ flex: 1 }} />
      {/* Depth gadget on right (front/back toggle) */}
      <Box onClick={(e) => { e.stopPropagation(); onToggle(); }} sx={{ ...gadgetSx, position: 'relative' }}>
        <Box sx={{ width: 8, height: 6, border: '1.5px solid #fff', position: 'absolute' }} />
      </Box>
    </Box>
  );
}

// ─── Mac OS 9 Platinum ───
// Horizontal pinstripes, close box on left (small square), title centered, collapse box on right
function MacOS9TitleBar({ title, collapsed, onToggle, badge }: { title: string; collapsed: boolean; onToggle: () => void; badge?: number }) {
  const boxSx = {
    width: 12, height: 12, cursor: 'pointer', bgcolor: '#C0C0C0',
    border: '1px solid #888', boxShadow: 'inset -1px -1px 0 #666, inset 1px 1px 0 #fff',
    '&:hover': { bgcolor: '#D0D0D0' },
  };
  return (
    <Box onClick={onToggle} sx={{
      display: 'flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none',
      background: 'linear-gradient(180deg, #DDDDEE 0%, #BBBBCC 100%)',
      borderBottom: '1px solid #999', px: 1, py: 0.25, minHeight: 22,
    }}>
      <Box onClick={(e) => { e.stopPropagation(); onToggle(); }} sx={boxSx} />
      <Typography sx={{ flex: 1, textAlign: 'center', fontFamily: '"Lucida Grande", Geneva, sans-serif', fontWeight: 700, fontSize: '0.75rem', color: '#000' }}>
        {title}
        {badge !== undefined && badge > 0 && <span style={{ marginLeft: 6, fontWeight: 400, fontSize: '0.65rem' }}>({badge})</span>}
      </Typography>
      <Box onClick={(e) => { e.stopPropagation(); onToggle(); }} sx={boxSx}>
        <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '7px' }}>
          {collapsed ? '△' : '▽'}
        </Box>
      </Box>
    </Box>
  );
}

// ─── macOS Modern (Aqua/Sonoma) ───
// Traffic lights on left, title centered or left
function MacOSModernTitleBar({ title, onToggle, badge, translucent }: { title: string; collapsed: boolean; onToggle: () => void; badge?: number; translucent?: boolean }) {
  return (
    <Box onClick={onToggle} sx={{
      display: 'flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none',
      bgcolor: translucent ? 'rgba(255,255,255,0.5)' : 'background.paper',
      backdropFilter: translucent ? 'blur(12px)' : undefined,
      borderBottom: '1px solid', borderColor: 'divider', px: 1.5, py: 0.5, minHeight: 28,
    }}>
      {/* Traffic lights */}
      <Box sx={{ display: 'flex', gap: '6px', mr: 1.5 }} onClick={(e) => e.stopPropagation()}>
        <Box onClick={onToggle} sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FF5F57', border: '1px solid #E0443E', cursor: 'pointer', '&:hover': { filter: 'brightness(0.85)' } }} />
        <Box onClick={onToggle} sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FEBC2E', border: '1px solid #DEA123', cursor: 'pointer', '&:hover': { filter: 'brightness(0.85)' } }} />
        <Box onClick={onToggle} sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#28C840', border: '1px solid #1AAB29', cursor: 'pointer', '&:hover': { filter: 'brightness(0.85)' } }} />
      </Box>
      <Typography sx={{ flex: 1, textAlign: 'center', fontSize: '0.8rem', fontWeight: 500, color: 'text.primary' }}>
        {title}
        {badge !== undefined && badge > 0 && <span style={{ marginLeft: 6, opacity: 0.5, fontSize: '0.7rem' }}>({badge})</span>}
      </Typography>
      {/* Spacer to balance traffic lights */}
      <Box sx={{ width: 54 }} />
    </Box>
  );
}

// ─── Windows 3.1 / 95 ───
// Navy blue title bar, beveled buttons on right
function Win9xTitleBar({ title, collapsed, onToggle, badge, xp }: { title: string; collapsed: boolean; onToggle: () => void; badge?: number; xp?: boolean }) {
  // collapsed is used in the button text
  const bg = xp
    ? 'linear-gradient(180deg, #0058E6 0%, #3A81F2 40%, #0044CC 100%)'
    : 'linear-gradient(90deg, #000080 0%, #1084D0 100%)';
  const btnSx = xp ? {
    width: 20, height: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: '3px', border: '1px solid rgba(255,255,255,0.3)',
    backgroundImage: 'linear-gradient(180deg, #4499FF 0%, #2266CC 100%)',
    color: '#fff', fontSize: '9px', fontWeight: 700,
    '&:hover': { backgroundImage: 'linear-gradient(180deg, #55AAFF 0%, #3377DD 100%)' },
  } : {
    width: 16, height: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    bgcolor: '#C0C0C0', border: '1px solid #000',
    boxShadow: 'inset -1px -1px 0 #808080, inset 1px 1px 0 #fff',
    fontSize: '9px', fontWeight: 700,
    '&:active': { boxShadow: 'inset 1px 1px 0 #808080' },
  };

  return (
    <Box onClick={onToggle} sx={{
      display: 'flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none',
      background: bg, px: 0.5, py: 0.25, minHeight: xp ? 26 : 20,
      borderRadius: xp ? '6px 6px 0 0' : undefined,
    }}>
      <Typography sx={{
        flex: 1, color: '#fff', fontFamily: xp ? 'Tahoma, sans-serif' : '"Courier New", monospace',
        fontWeight: 700, fontSize: xp ? '0.8rem' : '0.75rem', ml: 0.5,
        textShadow: xp ? '1px 1px 2px rgba(0,0,0,0.5)' : undefined,
      }}>
        {title}
        {badge !== undefined && badge > 0 && <span style={{ marginLeft: 6, fontWeight: 400, fontSize: '0.65rem' }}>({badge})</span>}
      </Typography>
      <Box sx={{ display: 'flex', gap: '2px' }} onClick={(e) => e.stopPropagation()}>
        <Box onClick={onToggle} sx={btnSx}>{collapsed ? '□' : '_'}</Box>
      </Box>
    </Box>
  );
}

// ─── BeOS ───
// Yellow title bar TAB (not full width), close on left of tab
function BeOSTitleBar({ title, onToggle, badge }: { title: string; collapsed: boolean; onToggle: () => void; badge?: number }) {
  return (
    <Box onClick={onToggle} sx={{
      display: 'flex', alignItems: 'stretch', cursor: 'pointer', userSelect: 'none',
      borderBottom: '1px solid #999', minHeight: 22,
    }}>
      {/* Yellow tab portion */}
      <Box sx={{
        display: 'flex', alignItems: 'center', bgcolor: '#CCCC00', px: 0.5, gap: 0.5,
        borderRight: '1px solid #999',
      }}>
        <Box onClick={(e) => { e.stopPropagation(); onToggle(); }} sx={{
          width: 10, height: 10, bgcolor: '#CCCC00', border: '1px solid #888',
          boxShadow: 'inset -1px -1px 0 #666, inset 1px 1px 0 #fff', cursor: 'pointer',
        }} />
        <Typography sx={{ fontFamily: '"Helvetica Neue", Helvetica, sans-serif', fontWeight: 600, fontSize: '0.75rem', color: '#000', whiteSpace: 'nowrap', px: 0.5 }}>
          {title}
        </Typography>
      </Box>
      {/* Grey remainder */}
      <Box sx={{ flex: 1, bgcolor: '#D4D4D4', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', px: 0.5 }}>
        {badge !== undefined && badge > 0 && (
          <Typography sx={{ fontSize: '0.65rem', color: '#666' }}>({badge})</Typography>
        )}
      </Box>
    </Box>
  );
}

// ─── NeXTSTEP ───
// Dark grey, heavy black border, close/miniaturize buttons
function NeXTSTEPTitleBar({ title, onToggle, badge }: { title: string; collapsed: boolean; onToggle: () => void; badge?: number }) {
  return (
    <Box onClick={onToggle} sx={{
      display: 'flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none',
      bgcolor: '#888888', border: '2px solid #000', px: 0.5, py: 0.25, minHeight: 22,
      boxShadow: 'inset -1px -1px 0 #555, inset 1px 1px 0 #BBB',
    }}>
      <Box onClick={(e) => { e.stopPropagation(); onToggle(); }} sx={{
        width: 14, height: 14, bgcolor: '#888', border: '2px solid #000',
        boxShadow: 'inset -1px -1px 0 #555, inset 1px 1px 0 #BBB', cursor: 'pointer', mr: 0.5,
      }} />
      <Typography sx={{ flex: 1, textAlign: 'center', fontFamily: '"Helvetica Neue", Helvetica, sans-serif', fontWeight: 700, fontSize: '0.75rem', color: '#000' }}>
        {title}
        {badge !== undefined && badge > 0 && <span style={{ marginLeft: 6, fontWeight: 400, fontSize: '0.65rem' }}>({badge})</span>}
      </Typography>
      <Box onClick={(e) => { e.stopPropagation(); onToggle(); }} sx={{
        width: 14, height: 14, bgcolor: '#888', border: '2px solid #000',
        boxShadow: 'inset -1px -1px 0 #555, inset 1px 1px 0 #BBB', cursor: 'pointer', ml: 0.5,
      }} />
    </Box>
  );
}

// ─── IRIX 4Dwm ───
// Purple/indigo with chunky 3D border, menu on left, buttons on right
function IRIXTitleBar({ title, collapsed, onToggle, badge }: { title: string; collapsed: boolean; onToggle: () => void; badge?: number }) {
  return (
    <Box onClick={onToggle} sx={{
      display: 'flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none',
      background: 'linear-gradient(180deg, #7A5AAA 0%, #5A3A8A 100%)',
      border: '2px solid', borderColor: '#5A3A8A',
      boxShadow: 'inset -1px -1px 0 #3A1A6A, inset 1px 1px 0 #9A7ACA',
      px: 0.5, py: 0.25, minHeight: 22,
    }}>
      <Box onClick={(e) => { e.stopPropagation(); onToggle(); }} sx={{
        width: 16, height: 14, bgcolor: '#9A7ACA', border: '1px solid #3A1A6A',
        boxShadow: 'inset -1px -1px 0 #5A3A8A, inset 1px 1px 0 #BAA0DA',
        cursor: 'pointer', mr: 0.5,
      }} />
      <Typography sx={{ flex: 1, fontFamily: '"Helvetica Neue", Helvetica, sans-serif', fontWeight: 700, fontSize: '0.75rem', color: '#fff' }}>
        {title}
        {badge !== undefined && badge > 0 && <span style={{ marginLeft: 6, fontWeight: 400 }}>({badge})</span>}
      </Typography>
      <Box onClick={(e) => { e.stopPropagation(); onToggle(); }} sx={{
        width: 16, height: 14, bgcolor: '#9A7ACA', border: '1px solid #3A1A6A',
        boxShadow: 'inset -1px -1px 0 #5A3A8A, inset 1px 1px 0 #BAA0DA',
        cursor: 'pointer', ml: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '8px', color: '#fff',
      }}>
        {collapsed ? '□' : '_'}
      </Box>
    </Box>
  );
}

// ─── OS/2 Warp ───
// Blue gradient title bar, beveled buttons on right, similar to Win3.1 but blue
function OS2TitleBar({ title, collapsed, onToggle, badge }: { title: string; collapsed: boolean; onToggle: () => void; badge?: number }) {
  return (
    <Box onClick={onToggle} sx={{
      display: 'flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none',
      background: 'linear-gradient(90deg, #004080 0%, #0080C0 100%)',
      px: 0.5, py: 0.25, minHeight: 20,
    }}>
      <Typography sx={{ flex: 1, color: '#fff', fontFamily: '"Helvetica", Arial, sans-serif', fontWeight: 700, fontSize: '0.75rem', ml: 0.5 }}>
        {title}
        {badge !== undefined && badge > 0 && <span style={{ marginLeft: 6, fontWeight: 400 }}>({badge})</span>}
      </Typography>
      <Box onClick={(e) => { e.stopPropagation(); onToggle(); }} sx={{
        width: 16, height: 14, bgcolor: '#C0C0C0', border: '1px solid #000',
        boxShadow: 'inset -1px -1px 0 #808080, inset 1px 1px 0 #fff',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '9px', fontWeight: 700,
      }}>
        {collapsed ? '□' : '_'}
      </Box>
    </Box>
  );
}

// ─── GNOME/Ubuntu ───
// HeaderBar with rounded top, close on right (or left)
function GNOMETitleBar({ title, collapsed, onToggle, badge }: { title: string; collapsed: boolean; onToggle: () => void; badge?: number }) {
  return (
    <Box onClick={onToggle} sx={{
      display: 'flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none',
      bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider',
      px: 1.5, py: 0.5, minHeight: 32,
    }}>
      <Typography sx={{ flex: 1, fontFamily: '"Cantarell", "Roboto", sans-serif', fontWeight: 700, fontSize: '0.85rem', color: 'text.primary' }}>
        {title}
        {badge !== undefined && badge > 0 && <span style={{ marginLeft: 8, fontWeight: 400, opacity: 0.5, fontSize: '0.75rem' }}>({badge})</span>}
      </Typography>
      <Box onClick={(e) => { e.stopPropagation(); onToggle(); }} sx={{
        width: 24, height: 24, borderRadius: '50%', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        '&:hover': { bgcolor: 'action.hover' },
        fontSize: '14px', color: 'text.secondary',
      }}>
        {collapsed ? '＋' : '−'}
      </Box>
    </Box>
  );
}

// ─── Fluent / Windows 11 ───
// Very minimal, subtle
function FluentTitleBar({ title, collapsed, onToggle, badge }: { title: string; collapsed: boolean; onToggle: () => void; badge?: number }) {
  return (
    <Box onClick={onToggle} sx={{
      display: 'flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none',
      bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider',
      px: 1.5, py: 0.5, minHeight: 28,
    }}>
      <Typography sx={{ flex: 1, fontWeight: 600, fontSize: '0.85rem', color: 'text.primary' }}>
        {title}
        {badge !== undefined && badge > 0 && <span style={{ marginLeft: 8, fontWeight: 400, opacity: 0.5, fontSize: '0.75rem' }}>({badge})</span>}
      </Typography>
      <Box onClick={(e) => { e.stopPropagation(); onToggle(); }} sx={{
        width: 28, height: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: '4px', '&:hover': { bgcolor: 'action.hover' },
        fontSize: '12px', color: 'text.secondary',
      }}>
        {collapsed ? '＋' : '−'}
      </Box>
    </Box>
  );
}

// ─── C64 ───
function C64TitleBar({ title, collapsed, onToggle, badge }: { title: string; collapsed: boolean; onToggle: () => void; badge?: number }) {
  return (
    <Box onClick={onToggle} sx={{
      display: 'flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none',
      bgcolor: '#A8A8FF', px: 0.5, py: 0.25, minHeight: 18,
    }}>
      <Typography sx={{ flex: 1, fontFamily: '"Courier New", monospace', fontWeight: 700, fontSize: '0.75rem', color: '#40318D', textTransform: 'uppercase' }}>
        {title}
        {badge !== undefined && badge > 0 && <span style={{ marginLeft: 6 }}>[{badge}]</span>}
      </Typography>
      <Box onClick={(e) => { e.stopPropagation(); onToggle(); }} sx={{
        cursor: 'pointer', fontFamily: '"Courier New", monospace', fontWeight: 700, fontSize: '0.75rem', color: '#40318D',
      }}>
        [{collapsed ? '+' : '-'}]
      </Box>
    </Box>
  );
}

// ─── Default (no OS chrome) ───
function DefaultTitleBar({ title, collapsed, onToggle, badge, icon }: { title: string; collapsed: boolean; onToggle: () => void; badge?: number; icon?: ReactNode }) {
  return (
    <Box onClick={onToggle} sx={{
      display: 'flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none', py: 0.25,
    }}>
      {icon && <Box sx={{ display: 'flex', mr: 0.75, color: 'text.secondary' }}>{icon}</Box>}
      <Typography variant="h6" sx={{ fontWeight: 700 }}>{title}</Typography>
      {badge !== undefined && badge > 0 && (
        <Typography component="span" variant="caption" sx={{
          ml: 1, bgcolor: 'primary.main', color: 'primary.contrastText',
          borderRadius: '10px', px: 0.8, py: 0.1, fontSize: '0.7rem', fontWeight: 600,
        }}>
          {badge}
        </Typography>
      )}
      <Box sx={{ ml: 'auto', color: 'text.secondary', fontSize: '0.9rem' }}>
        {collapsed ? '▸' : '▾'}
      </Box>
    </Box>
  );
}

// ─── Title bar router ───
function ThemedTitleBar({ style, title, collapsed, onToggle, badge, icon }: {
  style: string; title: string; collapsed: boolean; onToggle: () => void; badge?: number; icon?: ReactNode;
}) {
  switch (style) {
    case 'amiga': return <AmigaTitleBar title={title} collapsed={collapsed} onToggle={onToggle} badge={badge} />;
    case 'macos9': return <MacOS9TitleBar title={title} collapsed={collapsed} onToggle={onToggle} badge={badge} />;
    case 'macos': return <MacOSModernTitleBar title={title} collapsed={collapsed} onToggle={onToggle} badge={badge} />;
    case 'macos-translucent': return <MacOSModernTitleBar title={title} collapsed={collapsed} onToggle={onToggle} badge={badge} translucent />;
    case 'win31':
    case 'win95': return <Win9xTitleBar title={title} collapsed={collapsed} onToggle={onToggle} badge={badge} />;
    case 'winxp': return <Win9xTitleBar title={title} collapsed={collapsed} onToggle={onToggle} badge={badge} xp />;
    case 'beos': return <BeOSTitleBar title={title} collapsed={collapsed} onToggle={onToggle} badge={badge} />;
    case 'nextstep': return <NeXTSTEPTitleBar title={title} collapsed={collapsed} onToggle={onToggle} badge={badge} />;
    case 'irix': return <IRIXTitleBar title={title} collapsed={collapsed} onToggle={onToggle} badge={badge} />;
    case 'os2': return <OS2TitleBar title={title} collapsed={collapsed} onToggle={onToggle} badge={badge} />;
    case 'gnome': return <GNOMETitleBar title={title} collapsed={collapsed} onToggle={onToggle} badge={badge} />;
    case 'fluent': return <FluentTitleBar title={title} collapsed={collapsed} onToggle={onToggle} badge={badge} />;
    case 'c64': return <C64TitleBar title={title} collapsed={collapsed} onToggle={onToggle} badge={badge} />;
    default: return <DefaultTitleBar title={title} collapsed={collapsed} onToggle={onToggle} badge={badge} icon={icon} />;
  }
}

export function CollapsibleSection({ id, title, children, badge, icon, autoCollapseWhenEmpty }: CollapsibleSectionProps) {
  const [manuallyToggled, setManuallyToggled] = useState(false);
  const [collapsed, setCollapsed] = useState(() => loadCollapsed().has(id));
  const { themeDef } = useThemeMode();
  const chrome = themeDef.windowChrome;
  const textCase = useTextCase();

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

  const hasWindowFrame = !!chrome;

  return (
    <Box id={id} sx={{ mt: 3, opacity: badge === 0 && collapsed ? 0.6 : 1 }}>
      <ThemedTitleBar
        style={chrome?.buttonStyle ?? 'default'}
        title={textCase(title)}
        collapsed={collapsed}
        onToggle={toggle}
        badge={badge}
        icon={icon}
      />
      <Collapse in={!collapsed}>
        {hasWindowFrame ? (
          <Box sx={{
            border: '1px solid', borderColor: 'divider', borderTop: 'none',
            borderRadius: '0 0 4px 4px', p: 1.5, bgcolor: 'background.paper',
          }}>
            {children}
          </Box>
        ) : children}
      </Collapse>
    </Box>
  );
}
