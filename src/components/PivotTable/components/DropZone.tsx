import { getOrbCompatMode } from '../../../lib/orbis-compat';
import { LayersClearIcon } from '../../../lib/orbis-compat';
import React from 'react';
import {  CIconButton, CPaper, CTypography, CTooltip } from "../../Atoms";
import { useDroppable } from '@dnd-kit/core';
import type { PivotZone } from '../pivotModel';
import { useOrbcafeI18n } from '../../../i18n';

interface DropZoneProps {
  zone: PivotZone;
  title: string;
  hint: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  itemCount: number;
  onClear?: () => void;
}

export const DropZone: React.FC<DropZoneProps> = ({ zone, title, hint, icon, children, itemCount, onClear }) => {
  const droppableId = `container|${zone}`;
  const { isOver, setNodeRef } = useDroppable({ id: droppableId });
  const { t } = useOrbcafeI18n();

  return (
    <CPaper
      ref={setNodeRef}
      sx={(theme) => ({
        p: 1.1,
        borderRadius: 'var(--orb-r-container)',
        border: '1px dashed',
        borderColor: isOver ? 'primary.main' : theme.palette.divider,
        bgcolor: isOver
          ? getOrbCompatMode() === 'dark'
            ? 'rgba(25, 118, 210, 0.16)'
            : 'rgba(47, 91, 255, 0.06)'
          : getOrbCompatMode() === 'dark'
            ? 'rgba(255,255,255,0.02)'
            : 'rgba(245, 248, 255, 0.86)',
        transition: 'all 120ms ease',
        minHeight: 120,
        display: 'flex',
        flexDirection: 'column',
      })}
    >
      <div sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <div sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
          {icon}
          <CTypography sx={{ fontSize: '0.79rem', fontWeight: 800, letterSpacing: 0.2 }}>{title}</CTypography>
          <CTypography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>({itemCount})</CTypography>
        </div>
        {itemCount > 0 && onClear && (
          <CTooltip title={t('pivot.clearArea')}>
            <CIconButton size="small" onClick={onClear} sx={{ p: 0.25 }}>
              <LayersClearIcon sx={{ fontSize: 16 }} />
            </CIconButton>
          </CTooltip>
        )}
      </div>

      <CTypography sx={{ mt: 0.5, mb: 0.9, fontSize: '0.7rem', color: 'text.secondary' }}>{hint}</CTypography>
      <div sx={{ flex: 1 }}>{children}</div>
    </CPaper>
  );
};
