'use client';
import { getOrbCompatMode } from '../../lib/orbis-compat';
import { useMediaQuery, useTheme } from '../../lib/orbis-compat';
import {  CPaper, CStack, CTypography } from "../Atoms";

import { useEffect, useState } from 'react';
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isPortraitViewport = useMediaQuery('(orientation: portrait)', { noSsr: true });
  const isCompactViewport = useMediaQuery(theme.breakpoints.down('md'), { noSsr: true });
  const resolvedOrientation =
    orientation === 'auto' ? (isPortraitViewport || isCompactViewport ? 'portrait' : 'landscape') : orientation;

  const router = useRouter();

  return (
    <div
      sx={{
        display: 'grid',
        gridTemplateColumns:
          !mounted || resolvedOrientation === 'portrait'
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
          <CPaper
            key={item.id}
            elevation={0}
            sx={{
              overflow: 'hidden',
              borderRadius: 4,
              border: '1px solid',
              borderColor: selected ? 'primary.main' : 'divider',
              boxShadow: selected ? '0 18px 40px rgba(37, 99, 235, 0.16)' : 'none',
              bgcolor: getOrbCompatMode() === 'dark' ? 'rgba(30,41,59,0.6)' : 'background.paper',
            }}
          >
            <div
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
              <CStack spacing={1.5} sx={{ height: '100%' }}>
                <CStack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <div
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
                      <CTypography sx={{ fontSize: '1rem', fontWeight: 900 }}>
                        {item.title.slice(0, 1).toUpperCase()}
                      </CTypography>
                    )}
                  </div>

                  {item.badge !== undefined ? (
                    <div
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
                    </div>
                  ) : null}
                </CStack>

                <div sx={{ flex: 1, minWidth: 0 }}>
                  <CTypography sx={{ fontSize: '1rem', fontWeight: 800, lineHeight: 1.25 }}>{item.title}</CTypography>
                  {item.caption ? (
                    <CTypography sx={{ mt: 0.5, fontSize: '0.74rem', fontWeight: 700, color: 'text.secondary' }}>
                      {item.caption}
                    </CTypography>
                  ) : null}
                  {item.description ? (
                    <CTypography sx={{ mt: 0.75, fontSize: '0.84rem', lineHeight: 1.45, color: 'text.secondary' }}>
                      {item.description}
                    </CTypography>
                  ) : null}
                </div>
              </CStack>
            </div>
          </CPaper>
        );
      })}
    </div>
  );
};
