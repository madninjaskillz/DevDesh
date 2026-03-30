import { useState } from 'react';
import Chip from '@mui/material/Chip';
import Popover from '@mui/material/Popover';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import NoteIcon from '@mui/icons-material/StickyNote2';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import { colors } from '../../theme/colors';

interface NoteChipProps {
  note: string;
  onSave: (text: string) => void;
}

export function NoteChip({ note, onSave }: NoteChipProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [draft, setDraft] = useState(note);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setDraft(note);
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    if (draft !== note) onSave(draft);
    setAnchorEl(null);
  };

  if (!note) {
    return (
      <Tooltip title="Add a note">
        <IconButton size="small" onClick={handleOpen} sx={{ opacity: 0.4, '&:hover': { opacity: 1 } }}>
          <NoteAddIcon sx={{ fontSize: 16 }} />
          <Popover
            open={!!anchorEl}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          >
            <Box sx={{ p: 1.5, width: 260 }}>
              <TextField
                autoFocus
                size="small"
                fullWidth
                multiline
                minRows={2}
                maxRows={4}
                placeholder="Add a personal note..."
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleClose(); }
                  if (e.key === 'Escape') { setDraft(note); setAnchorEl(null); }
                }}
              />
            </Box>
          </Popover>
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <>
      <Chip
        icon={<NoteIcon sx={{ fontSize: 14 }} />}
        label={note.length > 30 ? note.slice(0, 30) + '...' : note}
        size="small"
        onClick={handleOpen}
        sx={{
          bgcolor: `${colors.yellow[1]}`,
          color: colors.gray[8],
          border: `1px solid ${colors.yellow[4]}`,
          maxWidth: 200,
          cursor: 'pointer',
          '& .MuiChip-label': { fontSize: '0.7rem' },
        }}
      />
      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ p: 1.5, width: 260 }}>
          <TextField
            autoFocus
            size="small"
            fullWidth
            multiline
            minRows={2}
            maxRows={4}
            placeholder="Personal note..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleClose(); }
              if (e.key === 'Escape') { setDraft(note); setAnchorEl(null); }
            }}
          />
          {note && (
            <IconButton size="small" onClick={() => { setDraft(''); onSave(''); setAnchorEl(null); }} sx={{ mt: 0.5 }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </Popover>
    </>
  );
}
