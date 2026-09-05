'use client';

import { Avatar, Box, LinearProgress } from '../../../lib/orbis-compat';
import { CChip, CPaper, CStack, CTypography } from '../../Atoms';
import { orbAlpha } from '../../../lib/theme';

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

const toneToAccentColor: Record<KanbanCardTone, string> = {
  default: 'var(--orb-primary)',
  success: 'var(--orb-primary)',
  warning: 'var(--orb-accent)',
  info: 'var(--orb-primary)',
  error: 'var(--orb-err)',
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
  const accentColor = toneToAccentColor[tone];
  const clickContext = bucket ? { card, bucket } : undefined;

  return (
    <CPaper
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
        {
          position: 'relative',
          minWidth: 0,
          overflow: 'hidden',
          p: 1.5,
          pl: 1.75,
          borderRadius: 'var(--orb-r-container)',
          border: `1px solid ${orbAlpha(accentColor, 0.24)}`,
          bgcolor: 'var(--orb-canvas)',
          boxShadow: overlay ? 'var(--orb-shadow-3)' : dragging ? 'none' : 'var(--orb-shadow-1)',
          transform: overlay ? 'rotate(1deg) scale(1.01)' : 'none',
          transition: 'transform var(--orb-t-fast), box-shadow var(--orb-t-fast), border-color var(--orb-t-fast)',
          cursor: interactive ? 'pointer' : 'default',
          opacity: dragging ? 0.5 : 1,
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: '0 auto 0 0',
            width: 3,
            bgcolor: accentColor,
          },
          '&:hover': interactive
            ? {
                transform: 'translateY(-1px)',
                borderColor: orbAlpha(accentColor, 0.48),
                boxShadow: 'var(--orb-shadow-2)',
              }
            : undefined,
          '&:focus-visible': interactive
            ? {
                outline: '2px solid var(--orb-focus-solid)',
                outlineOffset: 2,
              }
            : undefined,
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
      elevation={0}
    >
      <CStack spacing={1.25}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            {(card.kicker || bucket?.title) && (
              <CTypography component="div" sx={{ fontSize: 11, fontWeight: 500, color: 'text.secondary', textTransform: 'uppercase' }}>
                {card.kicker ?? bucket?.title}
              </CTypography>
            )}
            <CTypography component="div" sx={{ mt: 0.25, fontSize: 14, fontWeight: 600, lineHeight: 1.4, color: 'text.primary' }}>
              {card.title}
            </CTypography>
          </Box>

          {card.priority && (
            <CChip
              size="small"
              color={paletteColor}
              label={getPriorityLabel(card.priority, t)}
              variant={tone === 'default' ? 'outlined' : 'filled'}
              sx={{ height: 22, flexShrink: 0, fontWeight: 500 }}
            />
          )}
        </Box>

        {card.summary && (
          <CTypography component="div" sx={{ fontSize: 13, fontWeight: 300, color: 'text.secondary', lineHeight: 1.5 }}>
            {card.summary}
          </CTypography>
        )}

        {card.metrics && card.metrics.length > 0 && (
          <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(card.metrics.length, 3)}, minmax(0, 1fr))`, gap: 0.75 }}>
            {card.metrics.slice(0, 3).map((metric) => (
              <Box
                key={metric.id}
                sx={{
                  minWidth: 0,
                  borderRadius: 'var(--orb-r)',
                  px: 1,
                  py: 0.75,
                  bgcolor: 'var(--orb-surface)',
                  border: '1px solid var(--orb-border)',
                }}
              >
                <CTypography component="div" noWrap sx={{ fontSize: 11, fontWeight: 500, color: 'text.secondary', textTransform: 'uppercase' }}>
                  {metric.label}
                </CTypography>
                <CTypography component="div" noWrap numeric sx={{ mt: 0.25, fontSize: 13, fontWeight: 600 }}>
                  {metric.value}
                </CTypography>
              </Box>
            ))}
          </Box>
        )}

        {typeof card.progress === 'number' && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
              <CTypography sx={{ fontSize: 12, color: 'text.secondary' }}>{t('kanban.card.progress')}</CTypography>
              <CTypography numeric sx={{ fontSize: 12, fontWeight: 600 }}>{Math.round(card.progress)}%</CTypography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.max(0, Math.min(100, card.progress))}
              color={accentColor}
              sx={{ height: 4, borderRadius: 2 }}
            />
          </Box>
        )}

        {(card.tags?.length || card.assignee || card.dueDate || card.footer || interactive) && (
          <CStack spacing={0.9}>
            {card.tags && card.tags.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {card.tags.map((tag) => (
                  <CChip key={tag.id} size="small" label={tag.label} color={tag.color ?? 'default'} variant="outlined" />
                ))}
              </Box>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
                {card.assignee && (
                  <>
                    <Avatar src={card.assignee.avatarSrc} sx={{ width: 28, height: 28, fontSize: 11 }}>
                      {card.assignee.initials ?? getInitials(card.assignee.name)}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <CTypography component="div" sx={{ fontSize: 13, fontWeight: 500, lineHeight: 1.3 }} noWrap>
                        {card.assignee.name}
                      </CTypography>
                      {card.dueDate && (
                        <CTypography component="div" sx={{ fontSize: 11, color: 'text.secondary', lineHeight: 1.35 }} noWrap>
                          {card.dueDate}
                        </CTypography>
                      )}
                    </Box>
                  </>
                )}

                {!card.assignee && card.dueDate && (
                  <CTypography sx={{ fontSize: 12, color: 'text.secondary' }}>{card.dueDate}</CTypography>
                )}
              </Box>

              {interactive && (
                <CTypography sx={{ fontSize: 12, color: 'var(--orb-link)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                  {t('kanban.card.openDetail')}
                </CTypography>
              )}
            </Box>

            {card.footer}
          </CStack>
        )}
      </CStack>
    </CPaper>
  );
};
