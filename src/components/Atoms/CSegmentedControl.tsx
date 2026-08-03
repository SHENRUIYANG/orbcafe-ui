'use client';

import { useRef } from 'react';
import type { CSSProperties, HTMLAttributes, KeyboardEvent, ReactNode } from 'react';
import { resolveOrbSx } from '../../lib/orbis-compat/sx';
import type { OrbSxProps } from '../../lib/orbis-compat/sx';
import { CIconButton } from './CIconButton';

export interface CSegmentedControlOption<TValue extends string = string> {
  value: TValue;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface CSegmentedControlProps<TValue extends string = string>
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'style'> {
  value?: TValue | null;
  options: readonly CSegmentedControlOption<TValue>[];
  onValueChange: (value: TValue) => void;
  size?: 'small' | 'medium';
  sx?: OrbSxProps;
}

export const CSegmentedControl = <TValue extends string = string>({
  value,
  options,
  onValueChange,
  size = 'medium',
  sx,
  className,
  ...rest
}: CSegmentedControlProps<TValue>) => {
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const firstEnabledIndex = options.findIndex((option) => !option.disabled);
  const selectedIndex = options.findIndex((option) => option.value === value);

  const selectByKeyboard = (event: KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    const enabledIndices = options
      .map((option, index) => (option.disabled ? -1 : index))
      .filter((index) => index >= 0);
    if (enabledIndices.length === 0) return;

    const currentEnabledIndex = enabledIndices.indexOf(currentIndex);
    let nextIndex: number | undefined;

    if (event.key === 'Home') nextIndex = enabledIndices[0];
    if (event.key === 'End') nextIndex = enabledIndices[enabledIndices.length - 1];
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = enabledIndices[(currentEnabledIndex + 1 + enabledIndices.length) % enabledIndices.length];
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = enabledIndices[(currentEnabledIndex - 1 + enabledIndices.length) % enabledIndices.length];
    }
    if (nextIndex === undefined) return;

    event.preventDefault();
    buttonRefs.current[nextIndex]?.focus();
    onValueChange(options[nextIndex].value);
  };

  const resolved = resolveOrbSx(
    sx,
    ['orb-segmented-control', size === 'small' ? 'orb-segmented-control-sm' : '', className]
      .filter(Boolean)
      .join(' '),
  );
  const controlStyle = {
    ...resolved.style,
    '--orb-segmented-count': Math.max(options.length, 1),
    '--orb-segmented-index': Math.max(selectedIndex, 0),
  } as CSSProperties;

  return (
    <div
      role="radiogroup"
      className={resolved.className}
      style={controlStyle}
      data-has-selection={selectedIndex >= 0 ? 'true' : 'false'}
      {...rest}
    >
      <span className="orb-segmented-control-thumb" aria-hidden="true" />
      {options.map((option, index) => {
        const selected = option.value === value;
        return (
          <CIconButton
            key={option.value}
            ref={(node) => {
              buttonRefs.current[index] = node;
            }}
            className={[
              'orb-segmented-control-item',
              option.icon ? '' : 'orb-segmented-control-item-label',
            ].filter(Boolean).join(' ')}
            size={size}
            tooltip={option.label}
            role="radio"
            aria-label={option.label}
            aria-checked={selected}
            data-selected={selected ? 'true' : undefined}
            disabled={option.disabled}
            tabIndex={selected || (value == null && index === firstEnabledIndex) ? 0 : -1}
            onClick={() => onValueChange(option.value)}
            onKeyDown={(event) => selectByKeyboard(event, index)}
          >
            {option.icon ?? <span className="orb-segmented-control-label">{option.label}</span>}
          </CIconButton>
        );
      })}
    </div>
  );
};
