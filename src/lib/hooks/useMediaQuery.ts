'use client';

import { useEffect, useState } from 'react';

/**
 * Minimal framework-independent matchMedia hook.
 * Accepts a full media query ('(min-width:900px)') or a shorth breakpoint
 * expression like 'up:900' / 'down:900' (px).
 */
export const useMediaQuery = (query: string): boolean => {
  const normalized = query.startsWith('up:')
    ? `(min-width:${query.slice(3)}px)`
    : query.startsWith('down:')
      ? `(max-width:${query.slice(5)}px)`
      : query;

  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    return window.matchMedia(normalized).matches;
  });

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const media = window.matchMedia(normalized);
    const onChange = () => setMatches(media.matches);
    onChange();
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [normalized]);

  return matches;
};
