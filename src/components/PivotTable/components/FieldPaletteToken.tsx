import { getOrbCompatMode } from '../../../lib/orbis-compat';
import { DragIndicatorIcon } from '../../../lib/orbis-compat';
import React from 'react';
import {  CPaper, CTypography } from "../../Atoms";
import { useDraggable } from '@dnd-kit/core';

interface FieldPaletteTokenProps {
  id: string;
  label: string;
  subtitle?: string;
}

interface FieldPaletteTokenUIProps {
  label: string;
  subtitle?: string;
  isDragging?: boolean;
  dragRef?: (node: HTMLElement | null) => void;
  listeners?: Record<string, Function>;
  attributes?: Record<string, unknown>;
  style?: React.CSSProperties;
}

export const FieldPaletteTokenUI: React.FC<FieldPaletteTokenUIProps> = ({
  label,
  subtitle,
  isDragging,
  dragRef,
  listeners,
  attributes,
  style,
}) => {
  return (
    <CPaper
      ref={dragRef}
      {...listeners}
      {...attributes}
      sx={{
        p: 1,
        borderRadius: 'var(--orb-r-container)',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: getOrbCompatMode() === 'dark' ? '#111111' : 'background.paper',
        touchAction: 'none',
      }}
      style={{
        ...style,
        opacity: isDragging ? 0.3 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
    >
      <div sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
        <div
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 0.3,
            borderRadius: 1,
            bgcolor: getOrbCompatMode() === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(17, 24, 39, 0.08)',
          }}
        >
          <DragIndicatorIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
        </div>
        <div sx={{ minWidth: 0 }}>
          <CTypography sx={{ fontSize: '0.82rem', fontWeight: 700, lineHeight: 1.2 }}>{label}</CTypography>
          {subtitle && <CTypography sx={{ fontSize: '0.72rem', color: 'text.secondary', lineHeight: 1.2 }}>{subtitle}</CTypography>}
        </div>
      </div>
    </CPaper>
  );
};

export const FieldPaletteToken: React.FC<FieldPaletteTokenProps> = ({ id, label, subtitle }) => {
  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({ id });

  return (
    <FieldPaletteTokenUI
      label={label}
      subtitle={subtitle}
      isDragging={isDragging}
      dragRef={setNodeRef}
      listeners={listeners as any}
      attributes={attributes as any}
    />
  );
};
