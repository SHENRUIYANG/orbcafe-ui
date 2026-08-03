'use client';

import { forwardRef, useId } from 'react';
import type { ChangeEvent, FocusEvent, InputHTMLAttributes, ReactNode, KeyboardEvent } from 'react';
import { resolveOrbSx } from '../../lib/orbis-compat/sx';
import type { OrbSxProps } from '../../lib/orbis-compat/sx';

export interface CTextFieldProps {
  label?: ReactNode;
  value?: string | number | readonly string[];
  defaultValue?: string | number | readonly string[];
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  autoComplete?: string;
  name?: string;
  id?: string;
  /** Error message — puts the field into the orange error family state. */
  error?: string | boolean;
  /** Helper text shown below the field. */
  helperText?: ReactNode;
  /** Dense 36px variant (tables / filter bars). Standard is 44px. */
  dense?: boolean;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
  select?: boolean;
  multiline?: boolean;
  rows?: number;
  children?: ReactNode;
  variant?: string;
  margin?: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
  /** Leading adornment (icon). */
  startAdornment?: ReactNode;
  /** Trailing adornment (icon/button). */
  endAdornment?: ReactNode;
  /** Compatibility InputProps slot — only startAdornment/endAdornment/readOnly are honoured. */
  InputProps?: { startAdornment?: ReactNode; endAdornment?: ReactNode; readOnly?: boolean; sx?: OrbSxProps; [key: string]: unknown };
  InputLabelProps?: Record<string, unknown>;
  SelectProps?: Record<string, unknown>;
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
  sx?: OrbSxProps;
  className?: string;
}

export const CTextField = forwardRef<HTMLInputElement, CTextFieldProps>(
  (
    {
      label,
      value,
      defaultValue,
      onChange,
      onFocus,
      onBlur,
      onKeyDown,
      type = 'text',
      placeholder,
      disabled,
      readOnly,
      required,
      autoFocus,
      autoComplete,
      name,
      id,
      error,
      helperText,
      dense = false,
      size,
      fullWidth = true,
      select = false,
      multiline = false,
      rows,
      children,
      variant: _variant,
      margin: _margin,
      onClick,
      startAdornment,
      endAdornment,
      InputProps,
      inputProps,
      InputLabelProps: _inputLabelProps,
      SelectProps: _selectProps,
      sx,
      className,
    },
    ref,
  ) => {
    const autoId = useId();
    const inputId = id ?? `orb-tf-${autoId}`;
    const start = startAdornment ?? InputProps?.startAdornment;
    const end = endAdornment ?? InputProps?.endAdornment;
    const errorMessage = typeof error === 'string' ? error : undefined;
    const message = errorMessage ?? helperText;

    const isDense = dense || size === 'small';
    void _variant;
    void _margin;
    void _inputLabelProps;
    void _selectProps;
    const sharedProps = {
      id: inputId,
      className: `orb-inp ${isDense ? 'orb-inp-dense' : ''}`,
      style: fullWidth ? undefined : { width: 'auto' },
      value,
      defaultValue,
      onChange,
      onFocus,
      onBlur,
      onKeyDown,
      placeholder,
      disabled,
      required,
      autoFocus,
      autoComplete,
      name,
      onClick,
      'aria-invalid': Boolean(error),
    } as Record<string, unknown>;
    const input = select ? (
      <select {...sharedProps} ref={ref as React.ForwardedRef<HTMLSelectElement>} onChange={onChange as unknown as React.ChangeEventHandler<HTMLSelectElement>}>{children}</select>
    ) : multiline ? (
      <textarea {...sharedProps} ref={ref as React.ForwardedRef<HTMLTextAreaElement>} onChange={onChange as unknown as React.ChangeEventHandler<HTMLTextAreaElement>} rows={rows} readOnly={readOnly || InputProps?.readOnly} />
    ) : (
      <input
        {...sharedProps}
        ref={ref}
        onChange={onChange}
        type={type}
        readOnly={readOnly || InputProps?.readOnly}
        {...inputProps}
      />
    );
    const resolved = resolveOrbSx(sx, `orb-fld ${error ? 'orb-is-error' : ''} ${className ?? ''}`, { width: fullWidth ? '100%' : undefined });

    return (
      <div
        className={resolved.className}
        style={resolved.style}
      >
        {label && <label htmlFor={inputId}>{label}</label>}
        {start || end ? (
          <div className="orb-inp-adornment-wrap">
            {start && <span className="orb-inp-adornment">{start}</span>}
            {end && <span className="orb-inp-adornment orb-inp-adornment-end">{end}</span>}
            {input}
          </div>
        ) : (
          input
        )}
        {message && <span className="orb-fld-msg">{message}</span>}
      </div>
    );
  },
);

CTextField.displayName = 'CTextField';
