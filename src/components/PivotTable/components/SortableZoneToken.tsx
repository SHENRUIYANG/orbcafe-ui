import { CloseIcon } from '../../../lib/orbis-compat';
import React from 'react';
import {  CIconButton, CPaper, CTypography } from "../../Atoms";
import { useSortable } from '@dnd-kit/sortable';
import { PivotDragHandle } from './PivotDragHandle';

interface SortableZoneTokenUIProps {
  label: string;
  caption?: string;
  onRemove?: () => void;
  trailing?: React.ReactNode;
  isDragging?: boolean;
  dragRef?: (node: HTMLElement | null) => void;
  listeners?: Record<string, Function>;
  attributes?: Record<string, unknown>;
  style?: React.CSSProperties;
}

interface SortableZoneTokenProps {
  id: string;
  label: string;
  caption?: string;
  onRemove: () => void;
  trailing?: React.ReactNode;
}

export const SortableZoneTokenUI: React.FC<SortableZoneTokenUIProps> = ({
  label,
  caption,
  onRemove,
  trailing,
  isDragging,
  dragRef,
  listeners,
  attributes,
  style,
}) => {
  return (
    <CPaper
      ref={dragRef}
      style={style}
      sx={{
        p: 1,
        borderRadius: 'var(--orb-r-container)',
        border: '1px solid',
        borderColor: 'var(--orb-border)',
        bgcolor: 'var(--orb-canvas)',
        boxShadow: 'var(--orb-shadow-1)',
        touchAction: 'none',
        opacity: isDragging ? 0 : 1,
        transition: 'border-color 140ms ease, background-color 140ms ease, transform 140ms ease',
        '&:hover': {
          borderColor: 'var(--orb-p200)',
          bgcolor: 'var(--orb-p50)',
        },
      }}
    >
      <div sx={{ display: 'flex', alignItems: 'center', gap: 0.9 }}>
        <div
          {...attributes}
          {...listeners}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 24,
            height: 24,
            borderRadius: 'var(--orb-r)',
            bgcolor: 'var(--orb-p50)',
            border: '1px solid var(--orb-p100)',
            cursor: 'grab',
          }}
        >
          <PivotDragHandle size={13} subtle />
        </div>

        <div sx={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 0.15 }}>
          <CTypography component="div" sx={{ fontSize: '0.82rem', fontWeight: 700, lineHeight: 1.2, color: 'var(--orb-fg-strong)' }}>{label}</CTypography>
          {caption && <CTypography component="div" sx={{ fontSize: '0.72rem', fontWeight: 400, color: 'var(--orb-fg)', lineHeight: 1.2 }}>{caption}</CTypography>}
        </div>

        {trailing}

        {onRemove && (
          <CIconButton
            size="small"
            onClick={(event) => {
              event.stopPropagation();
              onRemove();
            }}
            sx={{ width: 24, height: 24, p: 0 }}
          >
            <CloseIcon size={13} />
          </CIconButton>
        )}
      </div>
    </CPaper>
  );
};

export const SortableZoneToken: React.FC<SortableZoneTokenProps> = ({ id, label, caption, onRemove, trailing }) => {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    zIndex: isDragging ? 999 : 'auto',
  };

  return (
    <SortableZoneTokenUI
      label={label}
      caption={caption}
      onRemove={onRemove}
      trailing={trailing}
      isDragging={isDragging}
      dragRef={setNodeRef}
      listeners={listeners as any}
      attributes={attributes as any}
      style={style}
    />
  );
};
