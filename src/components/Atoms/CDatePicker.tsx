'use client';

import { useState } from 'react';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import type { Dayjs } from 'dayjs';
import { Calendar } from '@/components/Icons';
import type { CSSProperties, ReactNode } from 'react';
import { CCalendar } from './CCalendar';
import { CPopover } from './CPopover';

dayjs.extend(customParseFormat);

export interface CDatePickerProps {
  label?: ReactNode;
  value?: Dayjs | null;
  defaultValue?: Dayjs | null;
  onChange?: (value: Dayjs | null) => void;
  minDate?: Dayjs;
  maxDate?: Dayjs;
  disabled?: boolean;
  /** dayjs display format (default YYYY-MM-DD). */
  format?: string;
  placeholder?: string;
  locale?: string;
  dense?: boolean;
  error?: boolean | string;
  helperText?: ReactNode;
  sx?: CSSProperties;
  className?: string;
}

/**
 * ORBIS date picker — text field + calendar popover (CCalendar).
 * ORBIS date picker; values stay Dayjs objects.
 */
export const CDatePicker = ({
  label,
  value,
  defaultValue,
  onChange,
  minDate,
  maxDate,
  disabled,
  format = 'YYYY-MM-DD',
  placeholder,
  locale,
  dense = false,
  error,
  helperText,
  sx,
  className,
}: CDatePickerProps) => {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<Dayjs | null>(defaultValue ?? null);
  const selected = isControlled ? value : internalValue;
  const [open, setOpen] = useState(false);
  const [text, setText] = useState<string | null>(null);

  const commit = (day: Dayjs | null) => {
    if (!isControlled) setInternalValue(day);
    onChange?.(day);
  };

  const displayText = text ?? (selected ? (locale ? selected.locale(locale) : selected).format(format) : '');

  const commitText = () => {
    if (text === null) return;
    const trimmed = text.trim();
    if (!trimmed) {
      commit(null);
    } else {
      const parsed = dayjs(trimmed, format, true);
      if (parsed.isValid() && !(minDate && parsed.isBefore(minDate.startOf('day'))) && !(maxDate && parsed.isAfter(maxDate.startOf('day')))) {
        commit(parsed);
      }
    }
    setText(null);
  };

  const errorMessage = typeof error === 'string' ? error : undefined;
  const message = errorMessage ?? helperText;

  return (
    <div className={`orb-fld ${error ? 'orb-is-error' : ''} ${className ?? ''}`} style={sx}>
      {label && <label>{label}</label>}
      <CPopover
        open={open}
        onOpenChange={setOpen}
        trigger={
          <div className="orb-inp-adornment-wrap" style={{ width: '100%' }}>
            <span className="orb-inp-adornment">
              <Calendar size={15} strokeWidth={1.8} />
            </span>
            <input
              className={`orb-inp ${dense ? 'orb-inp-dense' : ''}`}
              value={displayText}
              placeholder={placeholder ?? format}
              disabled={disabled}
              onFocus={() => setOpen(true)}
              onChange={(event) => setText(event.target.value)}
              onBlur={commitText}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  commitText();
                  setOpen(false);
                }
                if (event.key === 'Escape') setOpen(false);
              }}
            />
          </div>
        }
      >
        <CCalendar
          value={selected}
          onChange={(day) => {
            commit(day);
            setText(null);
            setOpen(false);
          }}
          minDate={minDate}
          maxDate={maxDate}
          locale={locale}
          defaultMonth={selected ?? undefined}
        />
      </CPopover>
      {message && <span className="orb-fld-msg">{message}</span>}
    </div>
  );
};
