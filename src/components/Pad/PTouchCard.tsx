'use client';

import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { Box, Chip, IconButton, Paper, Stack, Typography } from '@mui/material';
import DragIndicatorRoundedIcon from '@mui/icons-material/DragIndicatorRounded';
import type { PTouchCardProps } from './types';

const actionColorMap = {
  default: '#475569',
  primary: '#1d4ed8',
  success: '#047857',
  warning: '#b45309',
  error: '#b91c1c',
  info: '#0369a1',
} as const;

export const PTouchCard = ({
  title,
  description,
  kicker,
  icon,
  badges = [],
  metrics = [],
  footer,
  children,
  selected = false,
  draggable = false,
  isDragging = false,
  swipeThreshold = 88,
  startAction,
  endAction,
  dragHandleProps,
  onClick,
  onSwipe,
  sx,
}: PTouchCardProps) => {
  const [translateX, setTranslateX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const pointerIdRef = useRef<number | null>(null);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);

  const hasSwipeActions = Boolean(startAction || endAction);
  const actionWidth = 132;

  const resetSwipe = () => {
    setTranslateX(0);
    setIsSwiping(false);
    pointerIdRef.current = null;
    startXRef.current = 0;
    currentXRef.current = 0;
  };

  const commitSwipe = (direction: 'start' | 'end') => {
    const action = direction === 'start' ? startAction : endAction;
    action?.onTrigger?.();
    onSwipe?.(direction);
    resetSwipe();
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!hasSwipeActions) return;
    const target = event.target as HTMLElement;
    if (target.closest('button, a, input, textarea, [data-no-swipe="true"]')) return;
    pointerIdRef.current = event.pointerId;
    startXRef.current = event.clientX;
    currentXRef.current = event.clientX;
    setIsSwiping(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isSwiping || pointerIdRef.current !== event.pointerId) return;
    currentXRef.current = event.clientX;
    const next = currentXRef.current - startXRef.current;
    const clamped = Math.max(-actionWidth, Math.min(actionWidth, next));
    setTranslateX(clamped);
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isSwiping || pointerIdRef.current !== event.pointerId) return;
    const deltaX = currentXRef.current - startXRef.current;
    if (deltaX >= swipeThreshold && startAction) {
      commitSwipe('start');
      return;
    }
    if (deltaX <= -swipeThreshold && endAction) {
      commitSwipe('end');
      return;
    }
    if (Math.abs(deltaX) < 12) {
      onClick?.();
    }
    resetSwipe();
  };

  const renderAction = (action: typeof startAction, side: 'left' | 'right') => {
    if (!action) return null;
    const backgroundColor = action.backgroundColor || actionColorMap[action.tone || 'default'];

    return (
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          [side]: 0,
          width: actionWidth,
          px: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: side === 'left' ? 'flex-start' : 'flex-end',
          color: '#fff',
          background: `linear-gradient(135deg, ${backgroundColor}, rgba(15,23,42,0.92))`,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          {action.icon}
          <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>{action.label}</Typography>
        </Stack>
      </Box>
    );
  };

  return (
    <Box sx={{ position: 'relative', overflow: 'hidden', borderRadius: 4, ...sx }}>
      {renderAction(startAction, 'left')}
      {renderAction(endAction, 'right')}

      <Paper
        elevation={0}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={resetSwipe}
        sx={(theme) => ({
          position: 'relative',
          zIndex: 1,
          p: 2,
          borderRadius: 4,
          border: '1px solid',
          borderColor: selected ? 'primary.main' : 'divider',
          background:
            theme.palette.mode === 'dark'
              ? 'linear-gradient(180deg, rgba(30,41,59,0.96), rgba(15,23,42,0.92))'
              : 'linear-gradient(180deg, #ffffff, #f8fafc)',
          color: 'text.primary',
          boxShadow: selected
            ? '0 18px 42px rgba(37, 99, 235, 0.18)'
            : '0 12px 28px rgba(15, 23, 42, 0.08)',
          transform: `translate3d(${translateX}px, 0, 0) scale(${isDragging ? 0.985 : 1})`,
          transition: isSwiping ? 'none' : 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
          touchAction: 'pan-y',
          cursor: onClick ? 'pointer' : 'default',
          opacity: isDragging ? 0.9 : 1,
        })}
      >
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            {icon ? <Box sx={{ mt: 0.25 }}>{icon}</Box> : null}

            <Box sx={{ flex: 1, minWidth: 0 }}>
              {kicker ? (
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', color: 'text.secondary' }}>
                  {kicker}
                </Typography>
              ) : null}

              <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, lineHeight: 1.25 }}>{title}</Typography>

              {description ? (
                <Typography sx={{ mt: 0.5, fontSize: '0.9rem', color: 'text.secondary', lineHeight: 1.45 }}>
                  {description}
                </Typography>
              ) : null}
            </Box>

            {draggable ? (
              <Box
                data-no-swipe="true"
                {...dragHandleProps}
                sx={{ alignSelf: 'center', display: 'inline-flex', touchAction: 'none' }}
              >
                <IconButton size="small">
                  <DragIndicatorRoundedIcon />
                </IconButton>
              </Box>
            ) : null}
          </Stack>

          {badges.length > 0 ? (
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {badges.map((badge, index) => (
                <Chip
                  key={index}
                  label={badge}
                  size="small"
                  sx={{ borderRadius: 999, fontWeight: 700, bgcolor: 'action.hover', color: 'text.primary' }}
                />
              ))}
            </Stack>
          ) : null}

          {metrics.length > 0 ? (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                gap: 1,
              }}
            >
              {metrics.map((metric) => (
                <Paper
                  key={metric.id}
                  elevation={0}
                  sx={{
                    p: 1.25,
                    borderRadius: 3,
                    bgcolor: 'action.hover',
                    border: '1px solid',
                    borderColor: 'divider',
                    color: 'text.primary',
                  }}
                >
                  <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>{metric.label}</Typography>
                  <Typography sx={{ fontSize: '1rem', fontWeight: 800, lineHeight: 1.2 }}>{metric.value}</Typography>
                </Paper>
              ))}
            </Box>
          ) : null}

          {children}
          {footer}
        </Stack>
      </Paper>
    </Box>
  );
};
