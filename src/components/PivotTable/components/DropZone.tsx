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
        borderColor: isOver ? 'var(--orb-primary)' : 'var(--orb-p200)',
        bgcolor: isOver
          ? 'var(--orb-p100)'
          : theme.palette.mode === 'dark'
            ? 'var(--orb-surface-2)'
            : 'var(--orb-p50)',
        transition: 'border-color 140ms ease, background-color 140ms ease, box-shadow 140ms ease',
        boxShadow: isOver ? '0 0 0 3px var(--orb-focus-ring)' : 'none',
        minHeight: 120,
        display: 'flex',
        flexDirection: 'column',
      })}
    >
      <div sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <div sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
          {icon}
          <CTypography component="div" sx={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: 0.1, color: 'var(--orb-fg-strong)' }}>{title}</CTypography>
          <CTypography component="div" sx={{ fontSize: '0.73rem', fontWeight: 500, color: 'var(--orb-fg)' }}>({itemCount})</CTypography>
        </div>
        {itemCount > 0 && onClear && (
          <CTooltip title={t('pivot.clearArea')}>
            <CIconButton size="small" onClick={onClear} sx={{ width: 24, height: 24, p: 0 }}>
              <LayersClearIcon size={13} />
            </CIconButton>
          </CTooltip>
        )}
      </div>

      <CTypography component="div" sx={{ mt: 0.5, mb: 0.9, fontSize: '0.72rem', fontWeight: 400, color: 'var(--orb-fg)' }}>{hint}</CTypography>
      <div sx={{ flex: 1 }}>{children}</div>
    </CPaper>
  );
};
