'use client';

import { forwardRef, useId } from 'react';
import type { ChangeEvent, ReactNode, TextareaHTMLAttributes } from 'react';
import { resolveOrbSx } from '../../lib/orbis-compat/sx';
import type { OrbSxProps } from '../../lib/orbis-compat/sx';

export interface CTextAreaProps {
  label?: ReactNode;
  value?: string;
  defaultValue?: string;
  onChange?: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  rows?: number;
  minRows?: number;
  maxRows?: number;
  /** Compatibility flag for callers migrated from multiline text fields. */
  multiline?: boolean;
  error?: boolean | string;
  helperText?: ReactNode;
  fullWidth?: boolean;
  name?: string;
  id?: string;
  inputProps?: TextareaHTMLAttributes<HTMLTextAreaElement>;
  sx?: OrbSxProps;
  className?: string;
}

export const CTextArea = forwardRef<HTMLTextAreaElement, CTextAreaProps>(
  (
    {
      label,
      value,
      defaultValue,
      onChange,
      placeholder,
      disabled,
      readOnly,
      rows,
      minRows = 3,
      multiline: _multiline,
      error,
      helperText,
      fullWidth = true,
      name,
      id,
      inputProps,
      sx,
      className,
    },
    ref,
  ) => {
    const autoId = useId();
    const areaId = id ?? `orb-ta-${autoId}`;
    const errorMessage = typeof error === 'string' ? error : undefined;
    const message = errorMessage ?? helperText;
    void _multiline;

    const resolved = resolveOrbSx(sx, `orb-fld ${error ? 'orb-is-error' : ''} ${className ?? ''}`, { width: fullWidth ? '100%' : undefined });

    return (
      <div
        className={resolved.className}
        style={resolved.style}
      >
        {label && <label htmlFor={areaId}>{label}</label>}
        <textarea
          ref={ref}
          id={areaId}
          className="orb-inp"
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          rows={rows ?? minRows}
          name={name}
          aria-invalid={Boolean(error)}
          {...inputProps}
        />
        {message && <span className="orb-fld-msg">{message}</span>}
      </div>
    );
  },
);

CTextArea.displayName = 'CTextArea';
