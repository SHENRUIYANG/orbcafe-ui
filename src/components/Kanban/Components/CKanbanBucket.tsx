'use client';

import { Box } from '../../../lib/orbis-compat';
import { CChip, CIconButton, CPaper, CStack, CTextField, CTypography } from '../../Atoms';
import { Check, Edit, X } from '../../Icons';
import { orbAlpha } from '../../../lib/theme';
import { useState, type FormEvent } from 'react';

import type { CKanbanBucketProps } from '../types';
import { useOrbcafeI18n } from '../../../i18n';

export const CKanbanBucket = ({
  bucket,
  cardCount,
  highlighted = false,
  children,
  emptyLabel,
  height,
  maxHeight,
  onRename,
  renameLabel,
  sx,
}: CKanbanBucketProps) => {
  const { t } = useOrbcafeI18n();
  const [isRenaming, setIsRenaming] = useState(false);
  const [draftTitle, setDraftTitle] = useState(bucket.title);

  const cancelRename = () => {
    setDraftTitle(bucket.title);
    setIsRenaming(false);
  };

  const submitRename = (event: FormEvent) => {
    event.preventDefault();
    const nextTitle = draftTitle.trim();
    if (!nextTitle) return;
    if (nextTitle !== bucket.title) onRename?.(nextTitle);
    setDraftTitle(nextTitle);
    setIsRenaming(false);
  };

  return (
    <CPaper
      elevation={0}
      sx={[
        (theme) => {
          const accentColor = bucket.accentColor ?? theme.palette.primary.main;
          return {
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            minHeight: 0,
            height: height ?? maxHeight ?? 560,
            maxHeight,
            borderRadius: 'var(--orb-r-container)',
            overflow: 'hidden',
            border: highlighted ? `1px solid ${orbAlpha(accentColor, 0.65)}` : '1px solid var(--orb-border)',
            bgcolor: 'var(--orb-canvas)',
            boxShadow: highlighted
              ? `0 0 0 2px ${orbAlpha(accentColor, 0.16)}, var(--orb-shadow-2)`
              : 'none',
            transition: 'border-color 140ms ease, box-shadow 140ms ease, transform 140ms ease',
            '&::before': {
              content: '""',
              display: 'block',
              flexShrink: 0,
              height: 3,
              bgcolor: accentColor,
            },
          };
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      <CStack spacing={1.25} sx={{ flex: 1, minHeight: 0, overflow: 'hidden', p: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.25 }}>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minHeight: 28 }}>
              {bucket.icon && (
                <Box sx={{ display: 'inline-flex', flexShrink: 0, color: bucket.accentColor ?? 'var(--orb-primary)' }}>
                  {bucket.icon}
                </Box>
              )}
              {isRenaming ? (
                <Box component="form" onSubmit={submitRename} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flex: 1, minWidth: 0 }}>
                  <CTextField
                    dense
                    autoFocus
                    value={draftTitle}
                    onChange={(event) => setDraftTitle(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Escape') {
                        event.preventDefault();
                        cancelRename();
                      }
                    }}
                    inputProps={{ 'aria-label': renameLabel ?? t('kanban.bucket.rename') }}
                    error={!draftTitle.trim()}
                    sx={{ flex: 1, minWidth: 0 }}
                  />
                  <CIconButton
                    type="submit"
                    size="small"
                    tooltip={t('kanban.bucket.saveRename')}
                    aria-label={t('kanban.bucket.saveRename')}
                    disabled={!draftTitle.trim()}
                  >
                    <Check size={14} />
                  </CIconButton>
                  <CIconButton
                    size="small"
                    tooltip={t('kanban.bucket.cancelRename')}
                    aria-label={t('kanban.bucket.cancelRename')}
                    onClick={cancelRename}
                  >
                    <X size={14} />
                  </CIconButton>
                </Box>
              ) : (
                <CTypography component="div" sx={{ fontSize: 15, fontWeight: 600, lineHeight: 1.35, color: 'text.primary' }}>
                  {bucket.title}
                </CTypography>
              )}
            </Box>
          </Box>

          {!isRenaming && (
            <CStack direction="row" spacing={0.75} sx={{ flexShrink: 0 }}>
              <CChip size="small" label={cardCount} sx={{ minWidth: 24, justifyContent: 'center', fontWeight: 600 }} />
              {typeof bucket.limit === 'number' && (
                <CChip
                  size="small"
                  label={`${t('kanban.bucket.limit')} ${bucket.limit}`}
                  color={cardCount > bucket.limit ? 'warning' : 'default'}
                  variant="outlined"
                />
              )}
              {onRename && (
                <CIconButton
                  size="small"
                  tooltip={renameLabel ?? t('kanban.bucket.rename')}
                  aria-label={renameLabel ?? t('kanban.bucket.rename')}
                  onClick={() => {
                    setDraftTitle(bucket.title);
                    setIsRenaming(true);
                  }}
                  sx={{ width: 26, height: 26 }}
                >
                  <Edit size={14} />
                </CIconButton>
              )}
            </CStack>
          )}
        </Box>

        {highlighted && (
          <CTypography
            component="div"
            sx={{ fontSize: 12, color: bucket.accentColor ?? 'var(--orb-primary)', fontWeight: 500 }}
          >
            {t('kanban.bucket.dropHere')}
          </CTypography>
        )}

        <Box
          sx={{
            flex: 1,
            height: 0,
            minHeight: 0,
            overflowY: 'auto',
            overscrollBehavior: 'contain',
            pr: 0.4,
            scrollbarGutter: 'stable',
          }}
        >
          {cardCount > 0 ? (
            children
          ) : (
            <Box
              sx={{
                minHeight: '100%',
                borderRadius: 'var(--orb-r-container)',
                border: '1px dashed var(--orb-border)',
                bgcolor: 'transparent',
                display: 'grid',
                placeItems: 'center',
                px: 2,
                textAlign: 'center',
              }}
            >
              <CTypography sx={{ fontSize: 13, color: 'text.secondary' }}>
                {emptyLabel ?? bucket.emptyLabel ?? t('kanban.empty')}
              </CTypography>
            </Box>
          )}
        </Box>
      </CStack>
    </CPaper>
  );
};
