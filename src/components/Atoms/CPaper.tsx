'use client';

import { forwardRef } from 'react';
import type { CSSProperties, ElementType, HTMLAttributes } from 'react';
import { resolveOrbSx } from '../../lib/orbis-compat/sx';
import type { OrbSxProps } from '../../lib/orbis-compat/sx';

export interface CPaperProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  /** 0 = flat bordered card; >0 = raised with quiet ORBIS shadow. */
  elevation?: number;
  variant?: 'outlined' | 'elevation' | string;
  component?: ElementType;
  sx?: OrbSxProps;
  style?: CSSProperties;
}

export const CPaper = forwardRef<HTMLDivElement, CPaperProps>(
  ({ elevation = 1, variant, component, sx, style, className, children, ...rest }, ref) => {
    const Tag = component ?? 'div';
    const resolved = resolveOrbSx(sx, `orb-card ${elevation > 0 && variant !== 'outlined' ? 'orb-card-raised' : ''} ${className ?? ''}`, style);
    return <Tag
      ref={ref}
      className={resolved.className}
      style={resolved.style}
      {...rest}
    >
      {children}
    </Tag>;
  },
);

CPaper.displayName = 'CPaper';
