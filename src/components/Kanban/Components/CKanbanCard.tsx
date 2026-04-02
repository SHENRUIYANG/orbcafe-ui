'use client';

import { Avatar, Box, Chip, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { CKanbanCardProps, KanbanCardPriority, KanbanCardTone } from '../types';
import { useOrbcafeI18n } from '../../../i18n';

const toneToPaletteColor: Record<Exclude<KanbanCardTone, 'default'>, 'success' | 'warning' | 'info' | 'error'> = {
  success: 'success',
  warning: 'warning',
  info: 'info',
  error: 'error',
};

const priorityToTone: Record<KanbanCardPriority, Exclude<KanbanCardTone, 'default'>> = {
  critical: 'error',
  high: 'warning',
  medium: 'info',
  low: 'success',
};

const getPriorityLabel = (
  priority: KanbanCardPriority,
  t: (key: 'kanban.priority.critical' | 'kanban.priority.high' | 'kanban.priority.medium' | 'kanban.priority.low') => string,
) => {
  switch (priority) {
    case 'critical':
      return t('kanban.priority.critical');
    case 'high':
      return t('kanban.priority.high');
    case 'medium':
      return t('kanban.priority.medium');
    case 'low':
      return t('kanban.priority.low');
    default:
      return priority;
  }
};

const getInitials = (name?: string) => {
  if (!name) return 'NA';
  return name
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
};

export const CKanbanCard = ({ card, bucket, dragging = false, overlay = false, onClick, sx }: CKanbanCardProps) => {
  const { t } = useOrbcafeI18n();
  const interactive = Boolean(onClick && bucket);
  const tone: KanbanCardTone = card.tone ?? (card.priority ? priorityToTone[card.priority] : 'default');
  const paletteColor = tone === 'default' ? 'primary' : toneToPaletteColor[tone];
  const clickContext = bucket ? { card, bucket } : undefined;

  return (
    <Paper
      onClick={interactive ? () => clickContext && onClick?.(clickContext) : undefined}
      onKeyDown={
        interactive
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                if (clickContext) onClick?.(clickContext);
              }
            }
          : undefined
      }
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      sx={[
        (theme) => {
          const accentColor = tone === 'default' ? theme.palette.primary.main : theme.palette[paletteColor].main;
          return {
            position: 'relative',
            overflow: 'hidden',
            p: 1.4,
            borderRadius: 3,
            border: `1px solid ${alpha(accentColor, theme.palette.mode === 'dark' ? 0.42 : 0.2)}`,
            bgcolor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.96 : 0.98),
            boxShadow: overlay
              ? `0 20px 45px ${alpha(theme.palette.common.black, 0.24)}`
              : dragging
                ? 'none'
                : `0 8px 24px ${alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.18 : 0.08)}`,
            transform: overlay ? 'rotate(1deg) scale(1.01)' : 'none',
            transition: 'transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease',
            cursor: interactive ? 'pointer' : 'default',
            opacity: dragging ? 0.5 : 1,
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: '0 auto 0 0',
              width: 4,
              bgcolor: accentColor,
            },
            '&:hover': interactive
              ? {
                  transform: 'translateY(-1px)',
                  boxShadow: `0 14px 32px ${alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.28 : 0.12)}`,
                }
              : undefined,
          };
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      <Stack spacing={1.1}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            {(card.kicker || bucket?.title) && (
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: 0.4, color: 'text.secondary', textTransform: 'uppercase' }}>
                {card.kicker ?? bucket?.title}
              </Typography>
            )}
            <Typography sx={{ mt: 0.2, fontSize: '0.98rem', fontWeight: 800, lineHeight: 1.3 }}>
              {card.title}
            </Typography>
          </Box>

          {card.priority && (
            <Chip
              size="small"
              color={paletteColor}
              label={getPriorityLabel(card.priority, t)}
              variant={tone === 'default' ? 'outlined' : 'filled'}
              sx={{ height: 22, fontWeight: 700 }}
            />
          )}
        </Box>

        {card.summary && (
          <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary', lineHeight: 1.5 }}>
            {card.summary}
          </Typography>
        )}

        {card.metrics && card.metrics.length > 0 && (
          <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(card.metrics.length, 3)}, minmax(0, 1fr))`, gap: 0.9 }}>
            {card.metrics.slice(0, 3).map((metric) => (
              <Box
                key={metric.id}
                sx={(theme) => ({
                  borderRadius: 2,
                  px: 1,
                  py: 0.8,
                  bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.05) : alpha(theme.palette.primary.main, 0.05),
                })}
              >
                <Typography sx={{ fontSize: '0.68rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.35 }}>
                  {metric.label}
                </Typography>
                <Typography sx={{ fontSize: '0.86rem', fontWeight: 700 }}>{metric.value}</Typography>
              </Box>
            ))}
          </Box>
        )}

        {typeof card.progress === 'number' && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>{t('kanban.card.progress')}</Typography>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700 }}>{Math.round(card.progress)}%</Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.max(0, Math.min(100, card.progress))}
              color={paletteColor}
              sx={{ height: 8, borderRadius: 999 }}
            />
          </Box>
        )}

        {(card.tags?.length || card.assignee || card.dueDate || card.footer || interactive) && (
          <Stack spacing={0.9}>
            {card.tags && card.tags.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {card.tags.map((tag) => (
                  <Chip key={tag.id} size="small" label={tag.label} color={tag.color ?? 'default'} variant="outlined" />
                ))}
              </Box>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, minWidth: 0 }}>
                {card.assignee && (
                  <>
                    <Avatar src={card.assignee.avatarSrc} sx={{ width: 28, height: 28, fontSize: '0.75rem' }}>
                      {card.assignee.initials ?? getInitials(card.assignee.name)}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, lineHeight: 1.2 }} noWrap>
                        {card.assignee.name}
                      </Typography>
                      {card.dueDate && (
                        <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', lineHeight: 1.2 }} noWrap>
                          {card.dueDate}
                        </Typography>
                      )}
                    </Box>
                  </>
                )}

                {!card.assignee && card.dueDate && (
                  <Typography sx={{ fontSize: '0.76rem', color: 'text.secondary' }}>{card.dueDate}</Typography>
                )}
              </Box>

              {interactive && (
                <Typography sx={{ fontSize: '0.72rem', color: 'primary.main', fontWeight: 700, whiteSpace: 'nowrap' }}>
                  {t('kanban.card.openDetail')}
                </Typography>
              )}
            </Box>

            {card.footer}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
};
