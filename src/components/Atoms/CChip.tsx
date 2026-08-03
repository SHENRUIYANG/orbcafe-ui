'use client';

import { forwardRef } from 'react';
import type { MouseEvent, ReactNode } from 'react';
import { X } from '@/components/Icons';
import { resolveOrbSx } from '../../lib/orbis-compat/sx';
import type { OrbSxProps } from '../../lib/orbis-compat/sx';

export type CChipTone = 'blue' | 'gray' | 'orange' | 'outline';

export interface CChipProps {
  label?: ReactNode;
  children?: ReactNode;
  /** ORBIS tone. Compatibility color values map success/info/primary→blue, warning/error→orange, default→gray. */
  tone?: CChipTone;
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error';
  variant?: 'filled' | 'outlined';
  size?: 'small' | 'medium';
  clickable?: boolean;
  avatar?: ReactNode;
  icon?: ReactNode;
  onDelete?: (event: MouseEvent<HTMLButtonElement>) => void;
  onClick?: (event: MouseEvent<HTMLSpanElement>) => void;
  sx?: OrbSxProps;
  className?: string;
}

const COLOR_TO_TONE: Record<string, CChipTone> = {
  default: 'gray',
  primary: 'blue',
  success: 'blue',
  info: 'blue',
  warning: 'orange',
  error: 'orange',
};

export const CChip = forwardRef<HTMLSpanElement, CChipProps>(
  ({ label, children, tone, color = 'default', variant, size = 'medium', clickable: clickableProp, avatar, icon, onDelete, onClick, sx, className }, ref) => {
    const resolvedTone: CChipTone = tone ?? (variant === 'outlined' && color === 'default' ? 'outline' : COLOR_TO_TONE[color] ?? 'gray');
    const clickable = clickableProp ?? Boolean(onClick);
    const resolved = resolveOrbSx([
      { cursor: clickable ? 'pointer' : undefined, ...(size === 'small' ? { height: 24, fontSize: 11, px: 1 } : undefined) },
      ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
    ], `orb-chip orb-chip-${resolvedTone} ${className ?? ''}`);
    return (
      <span
        ref={ref}
        className={resolved.className}
        style={resolved.style}
        onClick={onClick}
        role={clickable ? 'button' : undefined}
        tabIndex={clickable ? 0 : undefined}
        onKeyDown={clickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(e as unknown as MouseEvent<HTMLSpanElement>); } } : undefined}
      >
        {avatar ?? icon}
        <span className="orb-chip-label">{children ?? label}</span>
        {onDelete && (
          <button
            type="button"
            aria-label="Remove"
            onClick={(e) => { e.stopPropagation(); onDelete(e); }}
            style={{ background: 'none', border: 'none', padding: 0, display: 'inline-flex', cursor: 'pointer', color: 'inherit' }}
          >
            <X size={13} strokeWidth={2} />
          </button>
        )}
      </span>
    );
  },
);

CChip.displayName = 'CChip';
