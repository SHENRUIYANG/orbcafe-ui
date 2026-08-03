'use client';

import { forwardRef } from 'react';
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { resolveOrbSx } from '../../lib/orbis-compat/sx';
import type { OrbResponsive, OrbSxProps } from '../../lib/orbis-compat/sx';

export interface CStackProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  /** Flex direction, including responsive values. */
  direction?: OrbResponsive<'row' | 'column' | 'row-reverse' | 'column-reverse'>;
  /** Gap in 8px units or as a raw CSS length. */
  spacing?: number | string;
  alignItems?: OrbResponsive<CSSProperties['alignItems']>;
  justifyContent?: OrbResponsive<CSSProperties['justifyContent']>;
  flexWrap?: OrbResponsive<CSSProperties['flexWrap']>;
  flex?: OrbResponsive<CSSProperties['flex']>;
  useFlexGap?: boolean;
  sx?: OrbSxProps;
  children?: ReactNode;
}

const toGap = (spacing: number | string | undefined): string | undefined => {
  if (spacing === undefined) return undefined;
  return typeof spacing === 'number' ? `${spacing * 8}px` : spacing;
};

/**
 * Minimal ORBIS flex stack.
 * `spacing={2}` means 16px using the shared 8px unit.
 */
export const CStack = forwardRef<HTMLDivElement, CStackProps>(
  ({ direction = 'column', spacing, alignItems, justifyContent, flexWrap, flex, useFlexGap: _useFlexGap, sx, className, children, ...rest }, ref) => {
    void _useFlexGap;
    const resolved = resolveOrbSx([
      {
        display: 'flex',
        flexDirection: direction as never,
        gap: toGap(spacing),
        alignItems: alignItems as never,
        justifyContent: justifyContent as never,
        flexWrap: flexWrap as never,
        flex: flex as never,
      },
      ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
    ], className);
    return <div
      ref={ref}
      className={resolved.className}
      style={resolved.style}
      {...rest}
    >
      {children}
    </div>;
  },
);

CStack.displayName = 'CStack';
