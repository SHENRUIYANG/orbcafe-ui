import React from 'react';
import { CPaper, CTypography } from '../../Atoms';
import { useDraggable } from '@dnd-kit/core';
import { PivotDragHandle } from './PivotDragHandle';

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
        borderColor: 'var(--orb-border)',
        bgcolor: 'var(--orb-canvas)',
        boxShadow: 'var(--orb-shadow-1)',
        touchAction: 'none',
        transition: 'border-color 140ms ease, background-color 140ms ease, transform 140ms ease',
        '&:hover': {
          borderColor: 'var(--orb-p200)',
          bgcolor: 'var(--orb-p50)',
          transform: 'translateY(-1px)',
        },
      }}
      style={{
        ...style,
        opacity: isDragging ? 0.3 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
    >
      <div sx={{ display: 'flex', alignItems: 'center', gap: 0.9 }}>
        <div
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 24,
            height: 24,
            borderRadius: 'var(--orb-r)',
            bgcolor: 'var(--orb-p50)',
            border: '1px solid var(--orb-p100)',
          }}
        >
          <PivotDragHandle size={13} subtle />
        </div>
        <div sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.15 }}>
          <CTypography component="div" sx={{ fontSize: '0.84rem', fontWeight: 700, lineHeight: 1.2, color: 'var(--orb-fg-strong)' }}>{label}</CTypography>
          {subtitle && <CTypography component="div" sx={{ fontSize: '0.73rem', fontWeight: 400, color: 'var(--orb-fg)', lineHeight: 1.2 }}>{subtitle}</CTypography>}
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
