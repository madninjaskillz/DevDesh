import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useQuery } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '../../hooks/useAuth';
import { getIssueDetail, getItemComments } from '../../api/github';
import { formatDate } from '../../utils/dates';

export interface DrawerItem {
  type: 'issue' | 'pr';
  owner: string;
  repo: string;
  number: number;
}

interface DetailDrawerProps {
  open: boolean;
  onClose: () => void;
  item: DrawerItem | null;
}

export function DetailDrawer({ open, onClose, item }: DetailDrawerProps) {
  const { token } = useAuth();

  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ['detail', item?.owner, item?.repo, item?.number],
    queryFn: () => getIssueDetail(item!.owner, item!.repo, item!.number, token!),
    enabled: open && !!item && !!token,
    staleTime: 60_000,
  });

  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ['comments', item?.owner, item?.repo, item?.number],
    queryFn: () => getItemComments(item!.owner, item!.repo, item!.number, token!),
    enabled: open && !!item && !!token,
    staleTime: 60_000,
  });

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 600 }, p: 0 } }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, pb: 1 }}>
        <Typography variant="subtitle2" color="text.secondary">
          {item ? `${item.owner}/${item.repo}` : ''}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ px: 2, pb: 2, overflow: 'auto', flex: 1 }}>
        {detailLoading || !detail ? (
          <>
            <Skeleton height={32} width="80%" />
            <Skeleton height={20} width="40%" sx={{ mt: 1 }} />
            <Skeleton variant="rectangular" height={200} sx={{ mt: 2 }} />
          </>
        ) : (
          <>
            {/* Title and meta */}
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
              #{detail.number} {detail.title}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, flexWrap: 'wrap' }}>
              <Chip
                label={detail.state}
                size="small"
                color={detail.state === 'open' ? 'success' : 'default'}
              />
              {detail.labels.map((label) => (
                <Chip
                  key={label.name}
                  label={label.name}
                  size="small"
                  sx={{ bgcolor: `#${label.color}`, color: isLight(label.color) ? '#000' : '#fff' }}
                />
              ))}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <Avatar src={detail.user.avatar_url} sx={{ width: 20, height: 20 }} />
              <Typography variant="body2" color="text.secondary">
                {detail.user.login} opened on {formatDate(detail.created_at)}
              </Typography>
            </Box>

            {/* Body */}
            {detail.body && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: 'background.default',
                  borderRadius: 1,
                  '& img': { maxWidth: '100%' },
                  '& pre': { overflow: 'auto', p: 1, bgcolor: 'action.hover', borderRadius: 1 },
                  '& code': { fontFamily: '"Roboto Mono", monospace', fontSize: '0.85em' },
                  '& a': { color: 'primary.main' },
                  '& table': { borderCollapse: 'collapse', width: '100%' },
                  '& th, & td': { border: '1px solid', borderColor: 'divider', p: 0.5 },
                }}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{detail.body}</ReactMarkdown>
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            {/* Comments */}
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Recent Comments
            </Typography>

            {commentsLoading ? (
              [...Array(3)].map((_, i) => <Skeleton key={i} height={60} sx={{ my: 1 }} />)
            ) : !comments || comments.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No comments.</Typography>
            ) : (
              comments.slice().reverse().map((comment) => (
                <Box key={comment.id} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Avatar src={comment.user.avatar_url} sx={{ width: 20, height: 20 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {comment.user.login}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(comment.created_at)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      pl: 3.5,
                      '& img': { maxWidth: '100%' },
                      '& pre': { overflow: 'auto', p: 1, bgcolor: 'action.hover', borderRadius: 1 },
                      '& code': { fontFamily: '"Roboto Mono", monospace', fontSize: '0.85em' },
                      '& a': { color: 'primary.main' },
                      '& p': { mt: 0, mb: 0.5 },
                    }}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{comment.body}</ReactMarkdown>
                  </Box>
                </Box>
              ))
            )}

            <Divider sx={{ my: 2 }} />

            <Button
              variant="outlined"
              startIcon={<OpenInNewIcon />}
              href={detail.html_url}
              target="_blank"
              rel="noopener"
              fullWidth
            >
              Open in GitHub
            </Button>
          </>
        )}
      </Box>
    </Drawer>
  );
}

function isLight(hex: string): boolean {
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}
