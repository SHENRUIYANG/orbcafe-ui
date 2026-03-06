import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
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
    <Paper
      ref={dragRef}
      {...listeners}
      {...attributes}
      sx={(theme) => ({
        p: 1,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: theme.palette.mode === 'dark' ? '#111111' : 'background.paper',
        touchAction: 'none',
      })}
      style={{
        ...style,
        opacity: isDragging ? 0.3 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
        <Box
          sx={(theme) => ({
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 0.3,
            borderRadius: 1,
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(17, 24, 39, 0.08)',
          })}
        >
          <DragIndicatorIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, lineHeight: 1.2 }}>{label}</Typography>
          {subtitle && <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', lineHeight: 1.2 }}>{subtitle}</Typography>}
        </Box>
      </Box>
    </Paper>
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
