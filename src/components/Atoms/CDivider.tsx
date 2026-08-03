'use client';

import { forwardRef } from 'react';
import { resolveOrbSx } from '../../lib/orbis-compat/sx';
import type { OrbSxProps } from '../../lib/orbis-compat/sx';

export interface CDividerProps {
  orientation?: 'horizontal' | 'vertical';
  flexItem?: boolean;
  sx?: OrbSxProps;
  className?: string;
}

export const CDivider = forwardRef<HTMLHRElement, CDividerProps>(
  ({ orientation = 'horizontal', flexItem, sx, className }, ref) => {
    const resolved = resolveOrbSx([{ ...(orientation === 'vertical' ? { alignSelf: 'stretch', height: 'auto' } : { width: '100%' }), ...(flexItem ? { alignSelf: 'stretch' } : undefined) }, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])], `${orientation === 'vertical' ? 'orb-divider-v' : 'orb-divider'} ${className ?? ''}`);
    return <hr
      ref={ref}
      aria-orientation={orientation}
      className={resolved.className}
      style={resolved.style}
    />;
  },
);

CDivider.displayName = 'CDivider';
