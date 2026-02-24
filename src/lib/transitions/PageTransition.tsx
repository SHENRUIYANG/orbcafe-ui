'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Box, useMediaQuery } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';

export type PageTransitionVariant = 'none' | 'fade' | 'slide-up' | 'slide-left' | 'scale';

export interface CPageTransitionProps {
  children: ReactNode;
  transitionKey?: string | number;
  variant?: PageTransitionVariant;
  durationMs?: number;
  delayMs?: number;
  easing?: string;
  disabled?: boolean;
  sx?: SxProps<Theme>;
}

interface TransitionFrame {
  from: Record<string, unknown>;
  to: Record<string, unknown>;
}

const TRANSITION_PRESETS: Record<PageTransitionVariant, TransitionFrame> = {
  none: {
    from: {},
    to: {},
  },
  fade: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  'slide-up': {
    from: { opacity: 0, transform: 'translate3d(0, 12px, 0)' },
    to: { opacity: 1, transform: 'translate3d(0, 0, 0)' },
  },
  'slide-left': {
    from: { opacity: 0, transform: 'translate3d(12px, 0, 0)' },
    to: { opacity: 1, transform: 'translate3d(0, 0, 0)' },
  },
  scale: {
    from: { opacity: 0, transform: 'scale(0.985)' },
    to: { opacity: 1, transform: 'scale(1)' },
  },
};

/**
 * Lightweight page transition wrapper.
 * - GPU-friendly properties only (opacity/transform)
 * - no layout-thrashing animation
 * - respects reduced-motion automatically
 */
export const CPageTransition = ({
  children,
  transitionKey,
  variant = 'fade',
  durationMs = 220,
  delayMs = 0,
  easing = 'cubic-bezier(0.22, 1, 0.36, 1)',
  disabled = false,
  sx,
}: CPageTransitionProps) => {
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [phase, setPhase] = useState<'from' | 'to'>('to');

  const motionEnabled = !disabled && !prefersReducedMotion && variant !== 'none';

  useEffect(() => {
    if (!motionEnabled) {
      setPhase('to');
      return;
    }

    setPhase('from');
    let raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(() => {
        setPhase('to');
      });
    });

    return () => cancelAnimationFrame(raf);
  }, [transitionKey, motionEnabled]);

  const preset = TRANSITION_PRESETS[variant];

  const frameSx = useMemo<Record<string, unknown>>(() => {
    if (!motionEnabled) {
      return {
        opacity: 1,
        transform: 'none',
      };
    }

    return phase === 'from' ? preset.from : preset.to;
  }, [motionEnabled, phase, preset.from, preset.to]);

  return (
    <Box
      sx={{
        willChange: motionEnabled ? 'opacity, transform' : 'auto',
        transition: motionEnabled
          ? `opacity ${durationMs}ms ${easing} ${delayMs}ms, transform ${durationMs}ms ${easing} ${delayMs}ms`
          : 'none',
        backfaceVisibility: 'hidden',
        ...frameSx,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};

export const PAGE_TRANSITION_PRESETS = {
  subtle: { variant: 'fade' as const, durationMs: 180 },
  smooth: { variant: 'slide-up' as const, durationMs: 220 },
  snappy: { variant: 'scale' as const, durationMs: 160 },
};

export default CPageTransition;
