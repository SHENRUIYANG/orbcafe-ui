'use client';

import { useMemo } from 'react';
import type { CPlanningLayoutProps } from '../CPlanningLayout';
import type { UsePlanningGanttOptions, UsePlanningGanttResult } from './usePlanningGantt';
import { usePlanningGantt } from './usePlanningGantt';

export interface UsePlanningLayoutOptions extends UsePlanningGanttOptions {}

export interface UsePlanningLayoutResult extends UsePlanningGanttResult {
  layoutProps: Pick<CPlanningLayoutProps, 'filterProps' | 'ganttProps'>;
}

export const usePlanningLayout = (options: UsePlanningLayoutOptions): UsePlanningLayoutResult => {
  const planning = usePlanningGantt(options);

  const layoutProps = useMemo<UsePlanningLayoutResult['layoutProps']>(
    () => ({
      filterProps: planning.smartFilterProps,
      ganttProps: planning.planningGanttProps,
    }),
    [planning.planningGanttProps, planning.smartFilterProps],
  );

  return {
    ...planning,
    layoutProps,
  };
};
