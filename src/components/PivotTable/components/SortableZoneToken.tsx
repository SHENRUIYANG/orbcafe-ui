import React from 'react';
import { Box, IconButton, Paper, Typography } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import CloseIcon from '@mui/icons-material/Close';
import { useSortable } from '@dnd-kit/sortable';

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
    <Paper
      ref={dragRef}
      style={style}
      sx={(theme) => ({
        p: 1,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: theme.palette.mode === 'dark' ? '#111111' : 'background.paper',
        touchAction: 'none',
        opacity: isDragging ? 0 : 1,
      })}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
        <Box
          {...attributes}
          {...listeners}
          sx={(theme) => ({
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 0.25,
            borderRadius: 1,
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(17, 24, 39, 0.08)',
            cursor: 'grab',
          })}
        >
          <DragIndicatorIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
        </Box>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, lineHeight: 1.2 }}>{label}</Typography>
          {caption && <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', lineHeight: 1.2 }}>{caption}</Typography>}
        </Box>

        {trailing}

        {onRemove && (
          <IconButton
            size="small"
            onClick={(event) => {
              event.stopPropagation();
              onRemove();
            }}
            sx={{ p: 0.2 }}
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        )}
      </Box>
    </Paper>
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
