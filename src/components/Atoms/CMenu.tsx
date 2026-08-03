'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Children, isValidElement, useEffect, useRef } from 'react';
import type { CSSProperties, ReactElement, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { CButton } from './CButton';
import { resolveOrbSx } from '../../lib/orbis-compat/sx';
import type { OrbSxProps } from '../../lib/orbis-compat/sx';

export interface CMenuItem {
  label: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  icon?: ReactNode;
}

export interface CMenuProps {
  triggerLabel?: ReactNode;
  items?: CMenuItem[];
  /** Custom trigger element — defaults to a neutral CButton. */
  trigger?: ReactNode;
  align?: 'start' | 'center' | 'end';
  anchorEl?: HTMLElement | null;
  open?: boolean;
  onClose?: () => void;
  children?: ReactNode;
  slotProps?: { paper?: { sx?: OrbSxProps; elevation?: number; style?: CSSProperties } };
  PaperProps?: { sx?: OrbSxProps; elevation?: number; style?: CSSProperties };
  anchorReference?: string;
  anchorPosition?: { top: number; left: number };
  transformOrigin?: unknown;
  anchorOrigin?: unknown;
  sx?: OrbSxProps;
}

/**
 * Dropdown menu built on Radix DropdownMenu with ORBIS styling.
 * Keeps the historical triggerLabel/items API.
 */
export const CMenu = ({ triggerLabel, items = [], trigger, align = 'start', anchorEl, open, onClose, children, slotProps, PaperProps, anchorPosition, sx }: CMenuProps) => {
  const controlledMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open !== true) return;

    const handlePointerDown = (event: PointerEvent) => {
      const path = event.composedPath();
      if (controlledMenuRef.current && path.includes(controlledMenuRef.current)) return;
      if (anchorEl && path.includes(anchorEl)) return;
      onClose?.();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose?.();
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [anchorEl, onClose, open]);

  if (open !== undefined) {
    if (!open || typeof document === 'undefined') return null;
    const rect = anchorEl?.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const anchorLeft = rect?.left ?? 16;
    const anchorRight = rect?.right ?? anchorLeft;
    const paperSx = slotProps?.paper?.sx ?? PaperProps?.sx;
    const resolved = resolveOrbSx([...(Array.isArray(paperSx) ? paperSx : paperSx ? [paperSx] : []), ...(Array.isArray(sx) ? sx : sx ? [sx] : [])], 'orb-pop orb-menu', slotProps?.paper?.style ?? PaperProps?.style);
    const menuChildren = Children.map(children, (child) => {
      if (!isValidElement(child) || child.type !== 'option') return child;
      const optionProps = child.props as ReactElement<React.OptionHTMLAttributes<HTMLOptionElement> & { sx?: OrbSxProps }>['props'];
      const { children: optionChildren, disabled, selected } = optionProps;
      const optionResolved = resolveOrbSx(optionProps.sx, `orb-menu-item ${selected ? 'orb-selected' : ''} ${optionProps.className ?? ''}`, optionProps.style);
      return (
        <div
          role="menuitem"
          aria-disabled={disabled || undefined}
          aria-selected={selected || undefined}
          tabIndex={disabled ? -1 : 0}
          id={optionProps.id}
          title={optionProps.title}
          className={optionResolved.className}
          style={optionResolved.style}
          onClick={disabled ? undefined : optionProps.onClick as unknown as React.MouseEventHandler<HTMLDivElement>}
          onKeyDown={(event) => {
            if (!disabled && (event.key === 'Enter' || event.key === ' ')) {
              event.preventDefault();
              (optionProps.onClick as unknown as React.MouseEventHandler<HTMLDivElement> | undefined)?.(event as unknown as React.MouseEvent<HTMLDivElement>);
            }
          }}
        >
          {optionChildren}
        </div>
      );
    });
    return createPortal(
      <div
        ref={controlledMenuRef}
        role="menu"
        className={resolved.className}
        style={{
          ...resolved.style,
          position: 'fixed',
          left: align === 'end' && !anchorPosition ? undefined : anchorPosition?.left ?? anchorLeft,
          right: align === 'end' && !anchorPosition ? Math.max(16, viewportWidth - anchorRight) : undefined,
          top: anchorPosition?.top ?? (rect?.bottom ?? 16) + 6,
          maxWidth: 'calc(100vw - 32px)',
          zIndex: 1301,
        }}
      >
        {menuChildren}
      </div>,
      document.body,
    );
  }
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        {trigger ?? <CButton variant="primary">{triggerLabel}</CButton>}
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="orb-pop orb-menu" align={align} sideOffset={6}>
          {items.map((item, index) => (
            <DropdownMenu.Item
              key={index}
              className="orb-menu-item"
              disabled={item.disabled}
              onSelect={() => item.onClick?.()}
            >
              {item.icon}
              {item.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
