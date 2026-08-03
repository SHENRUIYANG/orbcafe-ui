'use client';

import { forwardRef } from 'react';
import type { ElementType, HTMLAttributes, ReactNode } from 'react';
import { resolveOrbSx } from '../../lib/orbis-compat/sx';
import type { OrbSxProps } from '../../lib/orbis-compat/sx';

/**
 * ORBIS type scale (handoff §2):
 * h1 32/600 · h2 24/600 · h3 19/600 · subtitle 16/500 ·
 * body 16/300 · body2 14/300 · label 13/500 · caption 12/500 muted · overline 11/500 caps
 */
export type CTypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'subtitle1'
  | 'subtitle2'
  | 'body1'
  | 'body2'
  | 'label'
  | 'caption'
  | 'overline'
  | 'inherit';

const VARIANT_CLASS: Record<Exclude<CTypographyVariant, 'inherit'>, string> = {
  h1: 'orb-h1',
  h2: 'orb-h2',
  h3: 'orb-h3',
  h4: 'orb-h3',
  h5: 'orb-subtitle',
  h6: 'orb-subtitle',
  subtitle1: 'orb-subtitle',
  subtitle2: 'orb-label',
  body1: 'orb-body',
  body2: 'orb-body-dense',
  label: 'orb-label',
  caption: 'orb-meta',
  overline: 'orb-overline',
};

const VARIANT_TAG: Record<string, ElementType> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
};

export interface CTypographyProps extends Omit<HTMLAttributes<HTMLElement>, 'style'> {
  variant?: CTypographyVariant;
  component?: ElementType;
  /** Muted (secondary) text color. */
  muted?: boolean;
  /** Right-aligned tabular numerals for data contexts. */
  numeric?: boolean;
  color?: string;
  noWrap?: boolean;
  fontWeight?: number | string;
  children?: ReactNode;
  sx?: OrbSxProps;
}

export const CTypography = forwardRef<HTMLElement, CTypographyProps>(
  ({ variant = 'body1', component, muted = false, numeric = false, color, noWrap = false, fontWeight, sx, className, children, ...rest }, ref) => {
    const Tag = component ?? VARIANT_TAG[variant] ?? 'span';
    const variantClass = variant === 'inherit' ? undefined : VARIANT_CLASS[variant];
    const classes = [variantClass, className].filter(Boolean).join(' ');
    const resolved = resolveOrbSx([
      {
        ...(muted ? { color: 'var(--orb-muted)' } : undefined),
        ...(color ? { color } : undefined),
        ...(numeric ? { fontVariantNumeric: 'tabular-nums' } : undefined),
        ...(fontWeight ? { fontWeight } : undefined),
        ...(noWrap ? { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } : undefined),
      },
      ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
    ], classes);

    return (
      <Tag ref={ref} className={resolved.className} style={resolved.style} {...rest}>
        {children}
      </Tag>
    );
  },
);

CTypography.displayName = 'CTypography';
