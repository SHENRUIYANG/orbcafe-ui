'use client';

import { Box, Chip, Paper, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { CKanbanBucketProps } from '../types';
import { useOrbcafeI18n } from '../../../i18n';

export const CKanbanBucket = ({
  bucket,
  cardCount,
  highlighted = false,
  children,
  emptyLabel,
  maxHeight,
  sx,
}: CKanbanBucketProps) => {
  const { t } = useOrbcafeI18n();

  return (
    <Paper
      sx={[
        (theme) => {
          const accentColor = bucket.accentColor ?? theme.palette.primary.main;
          return {
            position: 'relative',
            minWidth: 0,
            borderRadius: 4,
            overflow: 'hidden',
            border: `1px solid ${alpha(accentColor, highlighted ? 0.58 : theme.palette.mode === 'dark' ? 0.28 : 0.18)}`,
            bgcolor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.92 : 0.97),
            boxShadow: highlighted
              ? `0 18px 40px ${alpha(accentColor, 0.22)}`
              : `0 10px 28px ${alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.18 : 0.08)}`,
            transition: 'border-color 140ms ease, box-shadow 140ms ease, transform 140ms ease',
            '&::before': {
              content: '""',
              display: 'block',
              height: 4,
              bgcolor: accentColor,
            },
          };
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      <Stack spacing={1.2} sx={{ p: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              {bucket.icon}
              <Typography sx={{ fontSize: '0.96rem', fontWeight: 800 }}>{bucket.title}</Typography>
            </Box>
            {bucket.description && (
              <Typography sx={{ mt: 0.45, fontSize: '0.76rem', color: 'text.secondary', lineHeight: 1.45 }}>
                {bucket.description}
              </Typography>
            )}
          </Box>

          <Stack direction="row" spacing={0.8} sx={{ flexShrink: 0 }}>
            <Chip size="small" label={cardCount} sx={{ fontWeight: 700 }} />
            {typeof bucket.limit === 'number' && (
              <Chip
                size="small"
                label={`${t('kanban.bucket.limit')} ${bucket.limit}`}
                color={cardCount > bucket.limit ? 'warning' : 'default'}
                variant="outlined"
              />
            )}
          </Stack>
        </Box>

        {highlighted && (
          <Typography sx={{ fontSize: '0.72rem', color: 'primary.main', fontWeight: 700 }}>
            {t('kanban.bucket.dropHere')}
          </Typography>
        )}

        <Box
          sx={{
            minHeight: 220,
            maxHeight,
            overflowY: maxHeight ? 'auto' : 'visible',
            pr: maxHeight ? 0.4 : 0,
          }}
        >
          {cardCount > 0 ? (
            children
          ) : (
            <Box
              sx={(theme) => ({
                minHeight: 160,
                borderRadius: 3,
                border: `1px dashed ${alpha(theme.palette.divider, 0.9)}`,
                bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.02) : alpha(theme.palette.primary.main, 0.03),
                display: 'grid',
                placeItems: 'center',
                px: 2,
                textAlign: 'center',
              })}
            >
              <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
                {emptyLabel ?? bucket.emptyLabel ?? t('kanban.empty')}
              </Typography>
            </Box>
          )}
        </Box>
      </Stack>
    </Paper>
  );
};
