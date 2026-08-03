'use client';

import { forwardRef } from 'react';
import type { ReactNode } from 'react';
import { resolveOrbSx } from '../../lib/orbis-compat/sx';
import type { OrbSxProps } from '../../lib/orbis-compat/sx';

export interface CAvatarProps {
  /** Text/initials or custom content. */
  children?: ReactNode;
  /** Image source — renders an <img> when provided. */
  src?: string;
  alt?: string;
  /** Diameter in px (default 28 per reference). */
  size?: number;
  variant?: 'circular' | 'rounded' | 'square' | string;
  sx?: OrbSxProps;
  className?: string;
}

export const CAvatar = forwardRef<HTMLSpanElement, CAvatarProps>(
  ({ children, src, alt, size = 28, sx, className }, ref) => {
    const resolved = resolveOrbSx([{ width: size, height: size, fontSize: size * 0.4 }, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])], `orb-avatar ${className ?? ''}`);
    return <span
      ref={ref}
      className={resolved.className}
      style={resolved.style}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt ?? ''} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
      ) : (
        children
      )}
    </span>;
  },
);

CAvatar.displayName = 'CAvatar';
