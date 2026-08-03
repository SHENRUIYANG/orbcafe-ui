'use client';

import { useId } from 'react';
import type { ChangeEvent, CSSProperties, ReactNode } from 'react';

export interface CRadioOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

export interface CRadioGroupProps {
  label?: ReactNode;
  options: CRadioOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>, value: string) => void;
  name?: string;
  row?: boolean;
  disabled?: boolean;
  sx?: CSSProperties;
  className?: string;
}

export const CRadioGroup = ({
  label,
  options,
  value,
  defaultValue,
  onChange,
  name,
  row = false,
  disabled,
  sx,
  className,
}: CRadioGroupProps) => {
  const autoName = useId();
  const groupName = name ?? `orb-rdo-${autoName}`;

  return (
    <div className={`orb-fld ${className ?? ''}`} style={sx} role="radiogroup">
      {label && <span className="orb-fld-label">{label}</span>}
      <div style={{ display: 'flex', flexDirection: row ? 'row' : 'column', gap: row ? 24 : 8, flexWrap: 'wrap' }}>
        {options.map((option) => (
          <label key={option.value} className="orb-rdo">
            <input
              type="radio"
              name={groupName}
              value={option.value}
              checked={value !== undefined ? value === option.value : undefined}
              defaultChecked={defaultValue !== undefined ? defaultValue === option.value : undefined}
              onChange={onChange ? (event) => onChange(event, option.value) : undefined}
              disabled={disabled || option.disabled}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};
