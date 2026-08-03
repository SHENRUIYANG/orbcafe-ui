'use client';

import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ElementType, ReactNode } from 'react';
import { resolveOrbSx } from '../../lib/orbis-compat/sx';
import type { OrbSxProps } from '../../lib/orbis-compat/sx';

export type CButtonVariant = 'primary' | 'secondary' | 'ghost' | 'neutral';
export type CButtonSize = 'small' | 'medium' | 'large';

export interface CButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
  /** Visual variant. Compatibility values map contained→primary, outlined→secondary, text→ghost. */
  variant?: CButtonVariant | 'contained' | 'outlined' | 'text';
  size?: CButtonSize;
  /** Stretch to fill the parent width. */
  block?: boolean;
  /** Show a spinner and freeze interactions (label stays to keep width stable). */
  loading?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  component?: ElementType;
  href?: string;
  /** ORBIS style override. */
  sx?: OrbSxProps;
}

const LEGACY_VARIANTS: Record<string, CButtonVariant> = {
  contained: 'primary',
  outlined: 'secondary',
  text: 'ghost',
};

const SIZE_CLASS: Record<CButtonSize, string | undefined> = {
  small: 'orb-btn-sm',
  medium: undefined,
  large: 'orb-btn-lg',
};

export const CButton = forwardRef<HTMLButtonElement, CButtonProps>(
  (
    {
      variant = 'primary',
      size = 'medium',
      block = false,
      loading = false,
      startIcon,
      endIcon,
      component,
      href,
      sx,
      className,
      children,
      disabled,
      type = 'button',
      ...rest
    },
    ref,
  ) => {
    const resolvedVariant = LEGACY_VARIANTS[variant] ?? (variant as CButtonVariant);
    const classes = [
      'orb-btn',
      `orb-btn-${resolvedVariant}`,
      SIZE_CLASS[size],
      block ? 'orb-btn-block' : undefined,
      loading ? 'orb-is-loading' : undefined,
      className,
    ]
      .filter(Boolean)
      .join(' ');
    const resolved = resolveOrbSx(sx, classes);
    const Tag = component ?? (href ? 'a' : 'button');

    return (
      <Tag ref={ref} type={Tag === 'button' ? type : undefined} href={href} className={resolved.className} style={resolved.style} disabled={Tag === 'button' ? disabled || loading : undefined} aria-disabled={Tag !== 'button' && (disabled || loading) ? true : undefined} {...rest}>
        {loading && <span className={`orb-spin ${resolvedVariant === 'primary' ? 'orb-spin-light' : ''}`} aria-hidden />}
        {!loading && startIcon}
        {children}
        {!loading && endIcon}
      </Tag>
    );
  },
);

CButton.displayName = 'CButton';
