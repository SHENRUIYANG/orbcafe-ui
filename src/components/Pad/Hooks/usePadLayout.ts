'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { POrientation } from '../types';

export interface UsePadLayoutOptions {
  orientation?: POrientation;
  defaultNavigationOpen?: boolean;
  onNavOpenChange?: (open: boolean) => void;
}

export interface UsePadLayoutResult {
  resolvedOrientation: Exclude<POrientation, 'auto'>;
  isPortraitViewport: boolean;
  isCompactViewport: boolean;
  navigationOpen: boolean;
  setNavigationOpen: (open: boolean) => void;
  toggleNavigationOpen: () => void;
}

export const usePadLayout = ({
  orientation = 'auto',
  defaultNavigationOpen,
  onNavOpenChange,
}: UsePadLayoutOptions = {}): UsePadLayoutResult => {
  const theme = useTheme();
  const isPortraitViewport = useMediaQuery('(orientation: portrait)', { noSsr: true });
  const isCompactViewport = useMediaQuery(theme.breakpoints.down('md'), { noSsr: true });

  const resolvedOrientation = useMemo<Exclude<POrientation, 'auto'>>(
    () => (orientation === 'auto' ? (isPortraitViewport || isCompactViewport ? 'portrait' : 'landscape') : orientation),
    [isCompactViewport, isPortraitViewport, orientation],
  );

  const [navigationOpen, setNavigationOpenState] = useState(defaultNavigationOpen ?? resolvedOrientation === 'landscape');

  useEffect(() => {
    setNavigationOpenState(defaultNavigationOpen ?? resolvedOrientation === 'landscape');
  }, [defaultNavigationOpen, resolvedOrientation]);

  const setNavigationOpen = (open: boolean) => {
    setNavigationOpenState(open);
    onNavOpenChange?.(open);
  };

  const toggleNavigationOpen = () => setNavigationOpen(!navigationOpen);

  return {
    resolvedOrientation,
    isPortraitViewport,
    isCompactViewport,
    navigationOpen,
    setNavigationOpen,
    toggleNavigationOpen,
  };
};

