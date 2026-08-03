'use client';

import type { CSSProperties, KeyboardEvent, ReactNode } from 'react';
import { useRef, useState } from 'react';

export interface CTabItem {
  value: string;
  label: ReactNode;
  disabled?: boolean;
  icon?: ReactNode;
}

export interface CTabsProps {
  items: CTabItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  sx?: CSSProperties;
  className?: string;
}

/**
 * Underline tabs — active tab gets primary text + 2px primary underline
 * (handoff §3). Arrow-key navigation included.
 */
export const CTabs = ({ items, value, defaultValue, onChange, sx, className }: CTabsProps) => {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<string | undefined>(defaultValue ?? items[0]?.value);
  const activeValue = isControlled ? value : internalValue;
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const select = (next: string) => {
    if (!isControlled) setInternalValue(next);
    onChange?.(next);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const enabled = items.filter((item) => !item.disabled);
    const currentIndex = enabled.findIndex((item) => item.value === activeValue);
    const delta = event.key === 'ArrowRight' ? 1 : -1;
    const next = enabled[(currentIndex + delta + enabled.length) % enabled.length];
    if (next) {
      select(next.value);
      const domIndex = items.findIndex((item) => item.value === next.value);
      tabRefs.current[domIndex]?.focus();
    }
  };

  return (
    <div className={`orb-tabs ${className ?? ''}`} role="tablist" style={sx} onKeyDown={onKeyDown}>
      {items.map((item, index) => {
        const active = item.value === activeValue;
        return (
          <button
            key={item.value}
            ref={(node) => {
              tabRefs.current[index] = node;
            }}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={item.disabled}
            className={`orb-tab ${active ? 'orb-is-active' : ''}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            onClick={() => select(item.value)}
          >
            {item.icon}
            {item.label}
          </button>
        );
      })}
    </div>
  );
};
