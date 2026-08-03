'use client';

import { forwardRef } from 'react';
import type { ReactNode } from 'react';
import { resolveOrbSx } from '../../lib/orbis-compat/sx';
import type { OrbSxProps } from '../../lib/orbis-compat/sx';

export interface CBadgeProps {
  /** Badge content — typically a count or short marker. */
  badgeContent?: ReactNode;
  /** Visual tone; `error` maps to the ORBIS deepened orange, per brand discipline. */
  color?: 'primary' | 'error' | 'muted';
  /** Anchor the badge to the top-right corner of the child. */
  children?: ReactNode;
  /** Hide the badge (keeps DOM for transitions). */
  invisible?: boolean;
  sx?: OrbSxProps;
  className?: string;
}

/**
 * Numeric/status badge. Without children it renders standalone;
 * with children it anchors to their top-right corner.
 */
export const CBadge = forwardRef<HTMLSpanElement, CBadgeProps>(
  ({ badgeContent, color = 'primary', children, invisible = false, sx, className }, ref) => {
    const resolved = resolveOrbSx(sx, className, { display: 'inline-flex', position: children ? 'relative' : undefined });
    const badge = !invisible && badgeContent !== undefined && badgeContent !== null && (
      <span
        className={`orb-badge ${color === 'error' ? 'orb-badge-err' : color === 'muted' ? 'orb-badge-muted' : ''}`}
        style={
          children
            ? { position: 'absolute', top: -6, right: -6, zIndex: 1 }
            : undefined
        }
      >
        {badgeContent}
      </span>
    );

    if (!children) {
      return (
        <span ref={ref} className={resolved.className} style={resolved.style}>
          {badge}
        </span>
      );
    }

    return (
      <span ref={ref} className={resolved.className} style={resolved.style}>
        {children}
        {badge}
      </span>
    );
  },
);

CBadge.displayName = 'CBadge';
