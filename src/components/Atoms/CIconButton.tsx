'use client';

import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { CTooltip } from './CTooltip';
import { resolveOrbSx } from '../../lib/orbis-compat/sx';
import type { OrbSxProps } from '../../lib/orbis-compat/sx';

export interface CIconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
  tooltip?: string;
  size?: 'small' | 'medium';
  /** Render in the primary color (e.g. active toggle state). */
  active?: boolean;
  edge?: 'start' | 'end' | false;
  color?: string;
  sx?: OrbSxProps;
}

export const CIconButton = forwardRef<HTMLButtonElement, CIconButtonProps>(
  ({ tooltip, size = 'small', active = false, edge, color, sx, className, children, type = 'button', ...rest }, ref) => {
    const resolved = resolveOrbSx([
      { color: active ? 'var(--orb-primary)' : color, ...(edge === 'start' ? { marginLeft: -8 } : edge === 'end' ? { marginRight: -8 } : undefined) },
      ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
    ], `orb-icon-btn ${size === 'small' ? 'orb-icon-btn-sm' : ''} ${className ?? ''}`);
    const button = (
      <button
        ref={ref}
        type={type}
        className={resolved.className}
        style={resolved.style}
        {...rest}
      >
        {children}
      </button>
    );

    return tooltip ? <CTooltip title={tooltip}>{button}</CTooltip> : button;
  },
);

CIconButton.displayName = 'CIconButton';
