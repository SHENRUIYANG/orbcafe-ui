'use client';

import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { ChevronLeft, ChevronRight } from '@/components/Icons';

export interface CCalendarProps {
  /** Selected day (single mode). */
  value?: Dayjs | null;
  /** Range mode: start/end selection. */
  rangeStart?: Dayjs | null;
  rangeEnd?: Dayjs | null;
  onChange?: (day: Dayjs) => void;
  /** Visible month — controlled. */
  month?: Dayjs;
  defaultMonth?: Dayjs;
  onMonthChange?: (month: Dayjs) => void;
  minDate?: Dayjs;
  maxDate?: Dayjs;
  /** Hide days outside the visible month. */
  fixedWeekNumber?: boolean;
  locale?: string;
  renderDay?: (day: Dayjs, state: { outsideCurrentMonth: boolean; selected: boolean; today: boolean; disabled: boolean }) => ReactNode;
}

const DOW_KEYS = ['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa'] as const;

const isSameDay = (a?: Dayjs | null, b?: Dayjs | null) => Boolean(a && b && a.isSame(b, 'day'));

/**
 * Month-grid calendar styled per orbis.css (.orb-cal-*).
 * ORBIS calendar primitive. Dayjs in, Dayjs out.
 */
export const CCalendar = ({
  value,
  rangeStart,
  rangeEnd,
  onChange,
  month,
  defaultMonth,
  onMonthChange,
  minDate,
  maxDate,
  locale,
  renderDay,
}: CCalendarProps) => {
  const isControlled = month !== undefined;
  const [internalMonth, setInternalMonth] = useState<Dayjs>(() => defaultMonth ?? value ?? rangeStart ?? dayjs());
  const visibleMonth = (isControlled ? month : internalMonth)!.startOf('month');

  const setMonth = (next: Dayjs) => {
    if (!isControlled) setInternalMonth(next);
    onMonthChange?.(next);
  };

  const localized = useMemo(() => (locale ? visibleMonth.locale(locale) : visibleMonth), [visibleMonth, locale]);

  const weeks = useMemo(() => {
    const firstOfMonth = visibleMonth.startOf('month');
    const gridStart = firstOfMonth.startOf('week');
    const rows: Dayjs[][] = [];
    let cursor = gridStart;
    for (let w = 0; w < 6; w += 1) {
      const row: Dayjs[] = [];
      for (let d = 0; d < 7; d += 1) {
        row.push(cursor);
        cursor = cursor.add(1, 'day');
      }
      rows.push(row);
      // Stop early once we've passed the month end and completed the week
      if (cursor.isAfter(visibleMonth.endOf('month')) && w >= 3) break;
    }
    return rows;
  }, [visibleMonth]);

  const dowLabels = useMemo(() => {
    const base = locale ? dayjs().locale(locale) : dayjs();
    return DOW_KEYS.map((_, i) => base.startOf('week').add(i, 'day').format('dd'));
  }, [locale]);

  const isDisabled = (day: Dayjs) =>
    Boolean((minDate && day.isBefore(minDate.startOf('day'))) || (maxDate && day.isAfter(maxDate.startOf('day'))));

  const isRange = rangeStart !== undefined || rangeEnd !== undefined;

  return (
    <div className="orb-cal">
      <div className="orb-cal-head">
        <button
          type="button"
          className="orb-icon-btn orb-icon-btn-sm"
          aria-label="Previous month"
          onClick={() => setMonth(visibleMonth.subtract(1, 'month'))}
        >
          <ChevronLeft size={16} strokeWidth={2} />
        </button>
        <span className="orb-cal-title" aria-live="polite">
          {localized.format('MMMM YYYY')}
        </span>
        <button
          type="button"
          className="orb-icon-btn orb-icon-btn-sm"
          aria-label="Next month"
          onClick={() => setMonth(visibleMonth.add(1, 'month'))}
        >
          <ChevronRight size={16} strokeWidth={2} />
        </button>
      </div>
      <div className="orb-cal-grid" role="grid">
        {dowLabels.map((dow, i) => (
          <span key={`${dow}-${i}`} className="orb-cal-dow">
            {dow}
          </span>
        ))}
        {weeks.flat().map((day) => {
          const outside = !day.isSame(visibleMonth, 'month');
          const disabled = isDisabled(day);
          const selected = isRange ? isSameDay(day, rangeStart) || isSameDay(day, rangeEnd) : isSameDay(day, value);
          const today = day.isSame(dayjs(), 'day');
          const inRange =
            isRange && rangeStart && rangeEnd && day.isAfter(rangeStart.startOf('day')) && day.isBefore(rangeEnd.startOf('day'));
          const rangeStartDay = isRange && isSameDay(day, rangeStart) && Boolean(rangeEnd);
          const rangeEndDay = isRange && isSameDay(day, rangeEnd) && Boolean(rangeStart);

          const classes = [
            'orb-cal-day',
            outside ? 'orb-is-outside' : undefined,
            today ? 'orb-is-today' : undefined,
            selected ? 'orb-is-selected' : undefined,
            inRange ? 'orb-is-in-range' : undefined,
            rangeStartDay ? 'orb-is-range-start' : undefined,
            rangeEndDay ? 'orb-is-range-end' : undefined,
          ]
            .filter(Boolean)
            .join(' ');

          if (renderDay) {
            return <span key={day.format('YYYY-MM-DD')} className="orb-cal-day-slot">{renderDay(day, { outsideCurrentMonth: outside, selected, today, disabled })}</span>;
          }

          return (
            <button
              key={day.format('YYYY-MM-DD')}
              type="button"
              role="gridcell"
              aria-selected={selected}
              aria-current={today ? 'date' : undefined}
              className={classes}
              disabled={disabled}
              onClick={() => onChange?.(day)}
            >
              {day.date()}
            </button>
          );
        })}
      </div>
    </div>
  );
};
