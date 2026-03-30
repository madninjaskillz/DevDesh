import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import type { ShortcutConfig } from '../../hooks/useKeyboardShortcuts';

interface ShortcutsDialogProps {
  open: boolean;
  onClose: () => void;
  shortcuts: ShortcutConfig[];
}

export function ShortcutsDialog({ open, onClose, shortcuts }: ShortcutsDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Keyboard Shortcuts</DialogTitle>
      <DialogContent>
        <Table size="small">
          <TableBody>
            {shortcuts.map((s) => (
              <TableRow key={s.key}>
                <TableCell sx={{ width: 60 }}>
                  <Chip
                    label={s.key === '?' ? '?' : s.key}
                    size="small"
                    sx={{ fontFamily: '"Roboto Mono", monospace', fontWeight: 700, minWidth: 32 }}
                  />
                </TableCell>
                <TableCell>{s.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
}
