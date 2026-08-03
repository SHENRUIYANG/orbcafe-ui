'use client';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import type { ReactNode } from 'react';

export interface CTooltipProps {
  title: ReactNode;
  children: ReactNode;
  /** Delay before showing (ms). */
  enterDelay?: number;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  disabled?: boolean;
}

/**
 * ORBIS tooltip — wraps children with a Radix tooltip styled by orbis.css.
 * Children must be able to hold a ref (all ORBCAFE atoms do).
 */
export const CTooltip = ({ title, children, enterDelay = 300, side = 'top', align = 'center', disabled }: CTooltipProps) => {
  if (!title || disabled) return <>{children}</>;

  return (
    <TooltipPrimitive.Provider delayDuration={enterDelay} skipDelayDuration={200}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content className="orb-tooltip" side={side} align={align} sideOffset={6}>
            {title}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
};
