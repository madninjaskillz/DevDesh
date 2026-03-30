import { useState, useEffect, type ImgHTMLAttributes } from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import BrokenImageIcon from '@mui/icons-material/BrokenImage';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useQuery } from '@tanstack/react-query';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { useAuth } from '../../hooks/useAuth';
import { getIssueDetail, getItemComments } from '../../api/github';
import { formatDate } from '../../utils/dates';

/**
 * GitHub private image URLs need auth headers.
 * This component fetches images with the token and displays them as blob URLs.
 */
function AuthImage({ src, alt, token, ...props }: ImgHTMLAttributes<HTMLImageElement> & { token: string | null }) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!src) { setLoading(false); return; }

    let cancelled = false;
    const needsAuth = src.includes('github.com') || src.includes('githubusercontent.com');

    if (!needsAuth || !token) {
      // Regular image, let browser handle it
      setBlobUrl(src);
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await fetch(src, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'image/*,*/*',
          },
        });
        if (!res.ok) throw new Error(`${res.status}`);
        const blob = await res.blob();
        if (cancelled) return;
        setBlobUrl(URL.createObjectURL(blob));
        setLoading(false);
      } catch {
        if (cancelled) return;
        // Fallback: try without auth (some githubusercontent URLs are public)
        setBlobUrl(src);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (blobUrl && blobUrl.startsWith('blob:')) URL.revokeObjectURL(blobUrl);
    };
  }, [src, token]); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) {
    return (
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', fontSize: '0.8rem' }}>
        <BrokenImageIcon sx={{ fontSize: 16 }} />
        <span>{alt || 'Image'}</span>
      </Box>
    );
  }

  if (loading) {
    return <Skeleton variant="rectangular" width="100%" height={100} sx={{ borderRadius: 1, my: 1 }} />;
  }

  return (
    <img
      {...props}
      src={blobUrl ?? undefined}
      alt={alt}
      onError={() => setError(true)}
      style={{ maxWidth: '100%', height: 'auto', borderRadius: 4, display: 'block', margin: '8px 0' }}
    />
  );
}

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

/** Shared sx for markdown rendered content */
const markdownSx = {
  '& img': { maxWidth: '100%', height: 'auto', borderRadius: 1, my: 1, display: 'block' },
  '& video': { maxWidth: '100%' },
  '& pre': { overflow: 'auto', p: 1.5, bgcolor: 'action.hover', borderRadius: 1, fontSize: '0.8rem', my: 1 },
  '& code': { fontFamily: '"Roboto Mono", monospace', fontSize: '0.85em' },
  '& :not(pre) > code': { bgcolor: 'action.hover', px: 0.5, py: 0.25, borderRadius: 0.5 },
  '& a': { color: 'primary.main', wordBreak: 'break-word' },
  '& table': { borderCollapse: 'collapse', width: '100%', my: 1, fontSize: '0.85rem' },
  '& th, & td': { border: '1px solid', borderColor: 'divider', p: 0.75, textAlign: 'left' },
  '& th': { bgcolor: 'action.hover', fontWeight: 600 },
  '& blockquote': { borderLeft: '3px solid', borderColor: 'divider', pl: 2, ml: 0, my: 1, color: 'text.secondary' },
  '& ul, & ol': { pl: 3 },
  '& li': { mb: 0.5 },
  '& p': { mt: 0, mb: 1, lineHeight: 1.6 },
  '& h1, & h2, & h3, & h4, & h5, & h6': { mt: 2, mb: 1 },
  '& h1': { fontSize: '1.3rem' },
  '& h2': { fontSize: '1.15rem' },
  '& h3': { fontSize: '1rem' },
  '& hr': { border: 'none', borderTop: '1px solid', borderColor: 'divider', my: 2 },
  '& details': { my: 1 },
  '& summary': { cursor: 'pointer', fontWeight: 600, mb: 0.5 },
  '& input[type="checkbox"]': { mr: 0.5 },
} as const;

export function DetailDrawer({ open, onClose, item }: DetailDrawerProps) {
  const { token } = useAuth();

  // Custom markdown components with authenticated image rendering
  const mdComponents: Components = {
    img: ({ src, alt, ...props }) => <AuthImage src={src} alt={alt} token={token} {...props} />,
  };

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
              <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1, ...markdownSx }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={mdComponents}>
                  {detail.body}
                </ReactMarkdown>
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
                <Box
                  key={comment.id}
                  sx={{
                    mb: 2,
                    pb: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:last-child': { borderBottom: 'none' },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Avatar src={comment.user.avatar_url} sx={{ width: 20, height: 20 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {comment.user.login}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(comment.created_at)}
                    </Typography>
                  </Box>
                  <Box sx={{ pl: 3.5, ...markdownSx }}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={mdComponents}>
                      {comment.body}
                    </ReactMarkdown>
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
