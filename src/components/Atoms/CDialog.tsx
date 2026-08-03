'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import type { ReactNode } from 'react';
import { X } from '@/components/Icons';
import { resolveOrbSx } from '../../lib/orbis-compat/sx';
import type { OrbSxProps } from '../../lib/orbis-compat/sx';

export interface CDialogProps {
  open: boolean;
  onClose?: () => void;
  title?: ReactNode;
  children?: ReactNode;
  /** Footer action row. */
  actions?: ReactNode;
  /** Max content width (default 560). */
  maxWidth?: number | string;
  fullWidth?: boolean;
  fullScreen?: boolean;
  PaperProps?: { sx?: OrbSxProps };
  slotProps?: { paper?: { sx?: OrbSxProps } };
  disableRestoreFocus?: boolean;
  keepMounted?: boolean;
  hideCloseButton?: boolean;
  sx?: OrbSxProps;
  className?: string;
}

/**
 * ORBIS dialog — Radix Dialog (focus trap, ESC, portal) + orbis.css chrome.
 * Accessible ORBIS dialog with title, content and action regions.
 */
export const CDialog = ({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = 560,
  fullWidth = false,
  fullScreen = false,
  PaperProps,
  slotProps,
  disableRestoreFocus: _disableRestoreFocus,
  keepMounted: _keepMounted,
  hideCloseButton = false,
  sx,
  className,
}: CDialogProps) => {
  void _disableRestoreFocus;
  void _keepMounted;
  const resolved = resolveOrbSx([
    {
      width: fullScreen ? '100vw' : fullWidth ? 'min(920px, calc(100vw - 32px))' : undefined,
      height: fullScreen ? '100vh' : undefined,
      maxWidth: fullScreen ? 'none' : typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
    },
    ...(Array.isArray(PaperProps?.sx ?? slotProps?.paper?.sx) ? (PaperProps?.sx ?? slotProps?.paper?.sx) as readonly import('../../lib/orbis-compat/sx').OrbSxValue[] : (PaperProps?.sx ?? slotProps?.paper?.sx) ? [(PaperProps?.sx ?? slotProps?.paper?.sx) as import('../../lib/orbis-compat/sx').OrbSxValue] : []),
    ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
  ], `orb-dialog ${className ?? ''}`);
  return <DialogPrimitive.Root open={open} onOpenChange={(next) => { if (!next) onClose?.(); }}>
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="orb-overlay" />
      <DialogPrimitive.Content
        className={resolved.className}
        style={resolved.style}
      >
        {(title || !hideCloseButton) && (
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
            {title ? (
              <DialogPrimitive.Title className="orb-dialog-title">{title}</DialogPrimitive.Title>
            ) : (
              <DialogPrimitive.Title className="orb-visually-hidden">Dialog</DialogPrimitive.Title>
            )}
            {!hideCloseButton && (
              <DialogPrimitive.Close asChild>
                <button type="button" className="orb-icon-btn orb-icon-btn-sm" aria-label="Close" style={{ marginTop: -4, marginRight: -4 }}>
                  <X size={16} strokeWidth={2} />
                </button>
              </DialogPrimitive.Close>
            )}
          </div>
        )}
        <div style={{ minWidth: 0 }}>{children}</div>
        {actions && <div className="orb-dialog-actions">{actions}</div>}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  </DialogPrimitive.Root>;
};
