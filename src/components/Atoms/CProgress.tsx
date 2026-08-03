'use client';

import type { CSSProperties } from 'react';
import { resolveOrbSx } from '../../lib/orbis-compat/sx';
import type { OrbSxProps } from '../../lib/orbis-compat/sx';

export interface CProgressProps {
  /** 0–100; omit for indeterminate animation. */
  value?: number;
  color?: string;
  variant?: 'determinate' | 'indeterminate';
  sx?: OrbSxProps;
  className?: string;
}

/** Linear progress bar — ORBIS track + primary fill (4px, per reference). */
export const CProgress = ({ value, variant, color, sx, className }: CProgressProps) => {
  const indeterminate = variant === 'indeterminate' || value === undefined;
  const resolved = resolveOrbSx(sx, `orb-prog ${className ?? ''}`);
  return (
    <div
      className={resolved.className}
      role="progressbar"
      aria-valuenow={indeterminate ? undefined : Math.round(value)}
      aria-valuemin={indeterminate ? undefined : 0}
      aria-valuemax={indeterminate ? undefined : 100}
      style={resolved.style}
    >
      <i
        style={
          indeterminate
            ? { width: '40%', animation: 'orb-prog-ind 1.2s ease-in-out infinite' }
            : { width: `${Math.min(100, Math.max(0, value))}%`, background: color }
        }
      />
      {indeterminate && (
        <style>{`@keyframes orb-prog-ind { 0% { margin-left: -40%; } 100% { margin-left: 100%; } }`}</style>
      )}
    </div>
  );
};

export interface CSkeletonProps {
  width?: number | string;
  height?: number | string;
  variant?: 'text' | 'rectangular' | 'circular';
  sx?: CSSProperties;
  className?: string;
}

export const CSkeleton = ({ width, height = 14, variant = 'rectangular', sx, className }: CSkeletonProps) => (
  <div
    className={`orb-skel ${className ?? ''}`}
    style={{
      width,
      height: variant === 'text' ? height : height,
      borderRadius: variant === 'circular' ? '50%' : variant === 'text' ? 6 : 'var(--orb-r)',
      ...sx,
    }}
  />
);

export interface CSpinnerProps {
  size?: number;
  /** Light spinner for primary-filled surfaces. */
  onPrimary?: boolean;
  sx?: CSSProperties;
  className?: string;
}

export const CSpinner = ({ size = 12, onPrimary = false, sx, className }: CSpinnerProps) => (
  <span
    className={`orb-spin ${onPrimary ? 'orb-spin-light' : ''} ${className ?? ''}`}
    style={{ width: size, height: size, ...sx }}
    role="status"
    aria-label="Loading"
  />
);
