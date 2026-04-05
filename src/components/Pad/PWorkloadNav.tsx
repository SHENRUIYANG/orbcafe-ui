'use client';

import { Box, Paper, Stack, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import type { PWorkloadNavItem, PWorkloadNavProps } from './types';

const navigateItem = (router: ReturnType<typeof useRouter>, item: PWorkloadNavItem, onItemSelect?: (item: PWorkloadNavItem) => void) => {
  onItemSelect?.(item);
  if (!item.href) return;
  if (item.href.startsWith('http://') || item.href.startsWith('https://')) {
    window.open(item.href, '_blank');
    return;
  }
  router.push(item.href);
};

export const PWorkloadNav = ({ items, selectedId, orientation = 'auto', onItemSelect, sx }: PWorkloadNavProps) => {
  const theme = useTheme();
  const isPortraitViewport = useMediaQuery('(orientation: portrait)');
  const isCompactViewport = useMediaQuery(theme.breakpoints.down('md'));
  const resolvedOrientation =
    orientation === 'auto' ? (isPortraitViewport || isCompactViewport ? 'portrait' : 'landscape') : orientation;
  const router = useRouter();

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns:
          resolvedOrientation === 'portrait'
            ? 'repeat(2, minmax(0, 1fr))'
            : 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 1.5,
        ...sx,
      }}
    >
      {items.map((item) => {
        const selected = item.id === selectedId;
        const accent = item.color || (selected ? theme.palette.primary.main : theme.palette.divider);

        return (
          <Paper
            key={item.id}
            elevation={0}
            sx={{
              overflow: 'hidden',
              borderRadius: 4,
              border: '1px solid',
              borderColor: selected ? 'primary.main' : 'divider',
              boxShadow: selected ? '0 18px 40px rgba(37, 99, 235, 0.16)' : 'none',
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(30,41,59,0.6)' : 'background.paper',
            }}
          >
            <Box
              component="button"
              type="button"
              disabled={item.disabled}
              onClick={() => navigateItem(router, item, onItemSelect)}
              sx={{
                width: '100%',
                p: 2,
                minHeight: resolvedOrientation === 'portrait' ? 156 : 148,
                display: 'block',
                border: 0,
                background: 'transparent',
                textAlign: 'left',
                cursor: item.disabled ? 'not-allowed' : 'pointer',
                appearance: 'none',
                WebkitAppearance: 'none',
                WebkitTapHighlightColor: 'transparent',
                color: 'text.primary',
              }}
            >
              <Stack spacing={1.5} sx={{ height: '100%' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 3,
                      display: 'grid',
                      placeItems: 'center',
                      color: selected ? '#fff' : 'text.primary',
                      background: selected ? accent : 'action.hover',
                    }}
                  >
                    {item.icon || (
                      <Typography sx={{ fontSize: '1rem', fontWeight: 900 }}>
                        {item.title.slice(0, 1).toUpperCase()}
                      </Typography>
                    )}
                  </Box>

                  {item.badge !== undefined ? (
                    <Box
                      sx={{
                        minWidth: 34,
                        px: 1,
                        py: 0.4,
                        borderRadius: 999,
                        bgcolor: selected ? 'primary.main' : 'action.hover',
                        color: selected ? '#fff' : 'text.secondary',
                        textAlign: 'center',
                        fontWeight: 800,
                        fontSize: '0.8rem',
                      }}
                    >
                      {item.badge}
                    </Box>
                  ) : null}
                </Stack>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: '1rem', fontWeight: 800, lineHeight: 1.25 }}>{item.title}</Typography>
                  {item.caption ? (
                    <Typography sx={{ mt: 0.5, fontSize: '0.74rem', fontWeight: 700, color: 'text.secondary' }}>
                      {item.caption}
                    </Typography>
                  ) : null}
                  {item.description ? (
                    <Typography sx={{ mt: 0.75, fontSize: '0.84rem', lineHeight: 1.45, color: 'text.secondary' }}>
                      {item.description}
                    </Typography>
                  ) : null}
                </Box>
              </Stack>
            </Box>
          </Paper>
        );
      })}
    </Box>
  );
};
