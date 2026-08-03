'use client';
import { getOrbCompatMode } from '../../../lib/orbis-compat';
import {  CPaper, CStack, CTypography, CChip } from "../../Atoms";
import { orbAlpha } from "../../../lib/theme";

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
    <CPaper
      sx={[
        (theme) => {
          const accentColor = bucket.accentColor ?? theme.palette.primary.main;
          return {
            position: 'relative',
            minWidth: 0,
            borderRadius: 'var(--orb-r-container)',
            overflow: 'hidden',
            border: `1px solid ${orbAlpha(accentColor, highlighted ? 0.58 : getOrbCompatMode() === 'dark' ? 0.28 : 0.18)}`,
            bgcolor: orbAlpha(theme.palette.background.paper, getOrbCompatMode() === 'dark' ? 0.92 : 0.97),
            boxShadow: highlighted
              ? `0 18px 40px ${orbAlpha(accentColor, 0.22)}`
              : `0 10px 28px ${orbAlpha(theme.palette.common.black, getOrbCompatMode() === 'dark' ? 0.18 : 0.08)}`,
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
      <CStack spacing={1.2} sx={{ p: 1.5 }}>
        <div sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
          <div sx={{ minWidth: 0 }}>
            <div sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              {bucket.icon}
              <CTypography sx={{ fontSize: '0.96rem', fontWeight: 800 }}>{bucket.title}</CTypography>
            </div>
            {bucket.description && (
              <CTypography sx={{ mt: 0.45, fontSize: '0.76rem', color: 'text.secondary', lineHeight: 1.45 }}>
                {bucket.description}
              </CTypography>
            )}
          </div>

          <CStack direction="row" spacing={0.8} sx={{ flexShrink: 0 }}>
            <CChip size="small" label={cardCount} sx={{ fontWeight: 700 }} />
            {typeof bucket.limit === 'number' && (
              <CChip
                size="small"
                label={`${t('kanban.bucket.limit')} ${bucket.limit}`}
                color={cardCount > bucket.limit ? 'warning' : 'default'}
                variant="outlined"
              />
            )}
          </CStack>
        </div>

        {highlighted && (
          <CTypography sx={{ fontSize: '0.72rem', color: 'primary.main', fontWeight: 700 }}>
            {t('kanban.bucket.dropHere')}
          </CTypography>
        )}

        <div
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
            <div
              sx={(theme) => ({
                minHeight: 160,
                borderRadius: 'var(--orb-r-container)',
                border: `1px dashed ${orbAlpha(theme.palette.divider, 0.9)}`,
                bgcolor: getOrbCompatMode() === 'dark' ? orbAlpha(theme.palette.common.white, 0.02) : orbAlpha(theme.palette.primary.main, 0.03),
                display: 'grid',
                placeItems: 'center',
                px: 2,
                textAlign: 'center',
              })}
            >
              <CTypography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
                {emptyLabel ?? bucket.emptyLabel ?? t('kanban.empty')}
              </CTypography>
            </div>
          )}
        </div>
      </CStack>
    </CPaper>
  );
};
