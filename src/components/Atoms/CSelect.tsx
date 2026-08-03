'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Children, forwardRef, isValidElement, useId, useImperativeHandle, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, OptionHTMLAttributes, ReactElement, ReactNode } from 'react';
import { resolveOrbSx } from '../../lib/orbis-compat/sx';
import type { OrbSxProps } from '../../lib/orbis-compat/sx';
import { SapIcon } from '../Icons';

export interface CSelectOption {
  value: string | number;
  label: ReactNode;
  disabled?: boolean;
}

export interface CSelectProps {
  label?: ReactNode;
  options?: CSelectOption[];
  /** Alternatively pass native <option> children. */
  children?: ReactNode;
  value?: string | number | readonly string[];
  defaultValue?: string | number | readonly string[];
  onChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  size?: 'small' | 'medium';
  dense?: boolean;
  fullWidth?: boolean;
  minWidth?: number | string;
  placeholder?: string;
  displayEmpty?: boolean;
  renderValue?: (value: string | number | readonly string[] | undefined) => ReactNode;
  multiple?: boolean;
  MenuProps?: Record<string, unknown>;
  variant?: string;
  disableUnderline?: boolean;
  onClick?: React.MouseEventHandler<HTMLElement>;
  onMouseDown?: React.MouseEventHandler<HTMLElement>;
  error?: boolean | string;
  helperText?: ReactNode;
  name?: string;
  id?: string;
  'aria-label'?: string;
  sx?: OrbSxProps;
  className?: string;
}

/** ORBIS select — custom popup chrome with a hidden native select for forms/refs. */
export const CSelect = forwardRef<HTMLSelectElement, CSelectProps>(
  (
    {
      label,
      options,
      children,
      value,
      defaultValue,
      onChange,
      disabled,
      size,
      dense = true,
      fullWidth = true,
      minWidth,
      placeholder,
      displayEmpty,
      renderValue,
      multiple,
      MenuProps: _menuProps,
      variant: _variant,
      disableUnderline: _disableUnderline,
      onClick,
      onMouseDown,
      error,
      helperText,
      name,
      id,
      'aria-label': ariaLabel,
      sx,
      className,
    },
    ref,
  ) => {
    const autoId = useId();
    const selectId = id ?? `orb-sel-${autoId}`;
    const errorMessage = typeof error === 'string' ? error : undefined;
    const message = errorMessage ?? helperText;
    const nativeSelectRef = useRef<HTMLSelectElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const [open, setOpen] = useState(false);
    const [triggerWidth, setTriggerWidth] = useState(180);
    const [uncontrolledValue, setUncontrolledValue] = useState<string | number | readonly string[]>(defaultValue ?? '');

    useImperativeHandle(ref, () => nativeSelectRef.current as HTMLSelectElement);

    const childOptions = useMemo<CSelectOption[]>(() => Children.toArray(children).flatMap((child) => {
      if (!isValidElement(child) || child.type !== 'option') return [];
      const option = child as ReactElement<OptionHTMLAttributes<HTMLOptionElement>>;
      const optionValue = Array.isArray(option.props.value) ? option.props.value[0] ?? '' : option.props.value ?? '';
      return [{
        value: optionValue,
        label: option.props.children,
        disabled: option.props.disabled,
      }];
    }), [children]);
    const resolvedOptions = options ?? childOptions;
    const effectiveValue = value ?? uncontrolledValue;
    const singleValue = Array.isArray(effectiveValue) ? effectiveValue[0] ?? '' : effectiveValue;
    const selectedKey = String(singleValue ?? '');
    const selectedOption = resolvedOptions.find((option) => String(option.value) === selectedKey);
    const displayedValue = renderValue
      ? renderValue(effectiveValue)
      : selectedOption?.label ?? (selectedKey ? selectedKey : placeholder ?? '');

    void displayEmpty;
    void _variant;
    void _disableUnderline;
    const resolved = resolveOrbSx(sx, `orb-fld ${error ? 'orb-is-error' : ''} ${className ?? ''}`, { width: fullWidth ? '100%' : undefined, minWidth: typeof minWidth === 'number' ? `${minWidth}px` : minWidth });

    if (multiple) {
      return (
        <div className={resolved.className} style={resolved.style}>
          {label && <label htmlFor={selectId}>{label}</label>}
          <select
            ref={ref}
            id={selectId}
            className={`orb-inp ${dense || size === 'small' ? 'orb-inp-dense' : ''}`}
            value={value}
            defaultValue={defaultValue}
            onChange={onChange}
            disabled={disabled}
            name={name}
            multiple
            onClick={onClick}
            onMouseDown={onMouseDown}
            aria-invalid={Boolean(error)}
            aria-label={ariaLabel}
          >
            {placeholder !== undefined && <option value="">{placeholder}</option>}
            {options
              ? options.map((option) => <option key={option.value} value={option.value} disabled={option.disabled}>{option.label}</option>)
              : children}
          </select>
          {message && <span className="orb-fld-msg">{message}</span>}
        </div>
      );
    }

    const commitValue = (nextKey: string) => {
      if (value === undefined) setUncontrolledValue(nextKey);
      const nativeSelect = nativeSelectRef.current;
      if (nativeSelect) {
        const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')?.set;
        setter?.call(nativeSelect, nextKey);
        onChange?.({ target: nativeSelect, currentTarget: nativeSelect } as ChangeEvent<HTMLSelectElement>);
      }
    };

    return (
      <div className={resolved.className} style={resolved.style}>
        {label && <label htmlFor={selectId}>{label}</label>}
        <select
          ref={nativeSelectRef}
          className="orb-visually-hidden"
          tabIndex={-1}
          aria-hidden="true"
          name={name}
          value={selectedKey}
          disabled={disabled}
          onChange={() => undefined}
        >
          {resolvedOptions.map((option) => (
            <option key={String(option.value)} value={option.value} disabled={option.disabled}>{option.label}</option>
          ))}
        </select>

        <DropdownMenu.Root
          open={open}
          onOpenChange={(nextOpen) => {
            if (nextOpen) setTriggerWidth(triggerRef.current?.getBoundingClientRect().width ?? 180);
            setOpen(nextOpen);
          }}
        >
          <DropdownMenu.Trigger asChild>
            <button
              ref={triggerRef}
              id={selectId}
              type="button"
              className={`orb-inp orb-select-trigger ${dense || size === 'small' ? 'orb-inp-dense' : ''}`}
              disabled={disabled}
              aria-invalid={Boolean(error)}
              aria-label={ariaLabel}
              aria-haspopup="listbox"
              data-placeholder={!selectedOption && !selectedKey ? '' : undefined}
              onClick={onClick}
              onMouseDown={onMouseDown}
            >
              <span className="orb-select-value">{displayedValue}</span>
              <SapIcon className="orb-select-chevron" name="slimDown" size={12} />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="orb-pop orb-select-menu"
              align="start"
              sideOffset={5}
              collisionPadding={8}
              style={{ minWidth: triggerWidth }}
            >
              <DropdownMenu.RadioGroup value={selectedKey} onValueChange={commitValue}>
                {resolvedOptions.map((option) => (
                  <DropdownMenu.RadioItem
                    key={String(option.value)}
                    className="orb-select-option"
                    value={String(option.value)}
                    disabled={option.disabled}
                  >
                    <span className="orb-select-check" aria-hidden="true">
                      {String(option.value) === selectedKey ? <SapIcon name="accept" size={13} /> : null}
                    </span>
                    <span>{option.label}</span>
                  </DropdownMenu.RadioItem>
                ))}
              </DropdownMenu.RadioGroup>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
        {message && <span className="orb-fld-msg">{message}</span>}
      </div>
    );
  },
);

CSelect.displayName = 'CSelect';
