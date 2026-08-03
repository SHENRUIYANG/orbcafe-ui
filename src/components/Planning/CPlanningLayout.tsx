'use client';
import { SxProps, Theme } from '../../lib/orbis-compat';
import {  CStack } from "../Atoms";

import type { ReactNode } from 'react';
import { CSmartFilter } from '../StdReport/CSmartFilter';
import type { CSmartFilterProps } from '../StdReport/CSmartFilter';
import { CPlanningGantt } from './CPlanningGantt';
import type { CPlanningGanttProps } from './types';

export interface CPlanningLayoutProps {
  filterProps: CSmartFilterProps;
  ganttProps: CPlanningGanttProps;
  spacing?: number;
  sx?: SxProps<Theme>;
  children?: ReactNode;
}

export const CPlanningLayout = ({
  filterProps,
  ganttProps,
  spacing = 2,
  sx,
  children,
}: CPlanningLayoutProps) => {
  const stackSx: SxProps<Theme> = sx
    ? ([{ height: '100%', overflow: 'hidden' }, sx] as SxProps<Theme>)
    : { height: '100%', overflow: 'hidden' };
  const ganttSx: SxProps<Theme> = ganttProps.sx
    ? ([{ height: '100%' }, ganttProps.sx] as SxProps<Theme>)
    : { height: '100%' };

  return (
    <CStack spacing={spacing} sx={stackSx}>
      <div sx={{ flexShrink: 0 }}>
        <CSmartFilter {...filterProps} />
      </div>

      <div sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <CPlanningGantt {...ganttProps} bodyHeight={ganttProps.bodyHeight ?? '100%'} sx={ganttSx} />
      </div>

      {children}
    </CStack>
  );
};
