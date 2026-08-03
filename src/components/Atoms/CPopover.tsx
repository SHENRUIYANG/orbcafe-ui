'use client';

import * as PopoverPrimitive from '@radix-ui/react-popover';
import type { CSSProperties, ReactNode } from 'react';

export interface CPopoverProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Element the popover anchors to. */
  trigger: ReactNode;
  children?: ReactNode;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
  /** Match the trigger width (for select-like popovers). */
  matchTriggerWidth?: boolean;
  sx?: CSSProperties;
  className?: string;
}

/** ORBIS popover — Radix Popover + orbis.css chrome. */
export const CPopover = ({
  open,
  defaultOpen,
  onOpenChange,
  trigger,
  children,
  align = 'start',
  side = 'bottom',
  sideOffset = 6,
  matchTriggerWidth = false,
  sx,
  className,
}: CPopoverProps) => (
  <PopoverPrimitive.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
    <PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger>
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        className={`orb-pop ${className ?? ''}`}
        align={align}
        side={side}
        sideOffset={sideOffset}
        style={{ minWidth: matchTriggerWidth ? 'var(--radix-popover-trigger-width)' : undefined, ...sx }}
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        {children}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  </PopoverPrimitive.Root>
);
