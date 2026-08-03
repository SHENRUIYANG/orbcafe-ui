'use client';

import { forwardRef } from 'react';
import type { ReactNode } from 'react';
import { resolveOrbSx } from '../../lib/orbis-compat/sx';
import type { OrbSxProps } from '../../lib/orbis-compat/sx';

export type CAlertSeverity = 'info' | 'success' | 'warning' | 'error';

export interface CAlertProps {
  severity?: CAlertSeverity;
  /** Bold leading line. */
  title?: ReactNode;
  children?: ReactNode;
  onClose?: () => void;
  sx?: OrbSxProps;
  className?: string;
}

/**
 * ORBIS alert. Brand discipline: info/success use ORBIS blue,
 * warning uses signal orange, error uses deepened orange — no green/red.
 */
export const CAlert = forwardRef<HTMLDivElement, CAlertProps>(
  ({ severity = 'info', title, children, onClose, sx, className }, ref) => {
    const resolved = resolveOrbSx(sx, `orb-alert orb-alert-${severity} ${className ?? ''}`);
    return <div ref={ref} role="alert" className={resolved.className} style={resolved.style}>
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && <b>{title}</b>}
        {children && <span>{children}</span>}
      </div>
      {onClose && (
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            color: 'inherit',
            font: '500 14px/1 var(--orb-font)',
            opacity: 0.7,
          }}
        >
          ✕
        </button>
      )}
    </div>;
  },
);

CAlert.displayName = 'CAlert';
