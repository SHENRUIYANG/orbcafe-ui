'use client';

import { forwardRef } from 'react';
import type { ChangeEvent, InputHTMLAttributes } from 'react';
import { resolveOrbSx } from '../../lib/orbis-compat/sx';
import type { OrbSxProps } from '../../lib/orbis-compat/sx';

export interface CCheckboxProps {
  label?: React.ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  indeterminate?: boolean;
  name?: string;
  value?: string;
  id?: string;
  size?: 'small' | 'medium';
  color?: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
  sx?: OrbSxProps;
  className?: string;
}

export const CCheckbox = forwardRef<HTMLInputElement, CCheckboxProps>(
  ({ label, checked, defaultChecked, onChange, disabled, indeterminate, name, value, id, size, color, onClick, inputProps, sx, className }, ref) => {
    const resolved = resolveOrbSx([{ ...(size === 'small' ? { fontSize: 13 } : undefined), ...(color ? { color } : undefined) }, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])], `orb-chk ${className ?? ''}`);
    const input = (
      <input
        ref={(node) => {
          if (node) node.indeterminate = Boolean(indeterminate);
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        type="checkbox"
        id={id}
        checked={checked}
        defaultChecked={defaultChecked}
        onChange={onChange}
        readOnly={checked !== undefined && onChange === undefined}
        disabled={disabled}
        name={name}
        value={value}
        onClick={onClick}
        {...inputProps}
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

CCheckbox.displayName = 'CCheckbox';
