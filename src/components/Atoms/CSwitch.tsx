'use client';

import { forwardRef } from 'react';
import type { ChangeEvent, ReactNode } from 'react';
import { resolveOrbSx } from '../../lib/orbis-compat/sx';
import type { OrbSxProps } from '../../lib/orbis-compat/sx';

export interface CSwitchProps {
  label?: ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (event: ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  disabled?: boolean;
  name?: string;
  id?: string;
  size?: 'small' | 'medium';
  sx?: OrbSxProps;
  className?: string;
}

export const CSwitch = forwardRef<HTMLInputElement, CSwitchProps>(
  ({ label, checked, defaultChecked, onChange, disabled, name, id, size, sx, className }, ref) => {
    const resolved = resolveOrbSx([{ ...(size === 'small' ? { transform: 'scale(.86)', transformOrigin: 'center' } : undefined) }, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])], `orb-sw ${className ?? ''}`);
    const input = (
      <input
        ref={ref}
        type="checkbox"
        role="switch"
        id={id}
        checked={checked}
        defaultChecked={defaultChecked}
        onChange={onChange ? (event) => onChange(event, event.target.checked) : undefined}
        disabled={disabled}
        name={name}
      />
    );

    if (label === undefined || label === null) {
      return (
        <span className={resolved.className} style={resolved.style}>
          {input}
        </span>
      );
    }

    return (
      <label className={resolved.className} style={resolved.style}>
        {input}
        <span>{label}</span>
      </label>
    );
  },
);

CSwitch.displayName = 'CSwitch';
