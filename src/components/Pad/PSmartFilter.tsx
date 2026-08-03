'use client';

import { CSmartFilter } from '../StdReport/CSmartFilter';
import type { PSmartFilterProps } from './types';

export const PSmartFilter = ({ touchMode = 'comfortable', sx, ...props }: PSmartFilterProps) => {
  const expanded = touchMode === 'expanded';

  return (
    <div
      sx={{
        '& .orb-card': {
          borderRadius: 4,
        },
        '& .orb-autocomplete': {
          minWidth: { xs: '100%', md: 260 },
        },
        '& .orb-autocomplete .orb-inp-adornment-wrap, & .orb-inp': {
          backgroundColor: 'transparent !important',
        },
        '& .orb-inp-adornment-wrap, & .orb-inp': {
          minHeight: expanded ? 56 : 50,
          borderRadius: 3,
          fontSize: expanded ? '0.98rem' : '0.92rem',
        },
        '& .orb-inp': {
          py: expanded ? 1.6 : 1.25,
          fontSize: expanded ? '0.98rem' : '0.92rem',
        },
        '& label': {
          fontSize: expanded ? '0.95rem' : '0.88rem',
        },
        '& .orb-btn': {
          minHeight: expanded ? 48 : 44,
          px: expanded ? 2.25 : 1.75,
          borderRadius: 3,
          fontSize: expanded ? '0.95rem' : '0.88rem',
          fontWeight: 700,
        },
        '& .orb-icon-btn': {
          width: expanded ? 40 : 36,
          height: expanded ? 40 : 36,
        },
        '& .orb-menu-item, & option': {
          minHeight: expanded ? 44 : 38,
          fontSize: expanded ? '0.95rem' : '0.88rem',
        },
        '& .orb-list-subheader': {
          py: 1,
        },
        '& .orb-chk': {
          p: expanded ? 1 : 0.75,
        },
        '& .orb-form-control-label > span': {
          fontSize: expanded ? '0.95rem' : '0.88rem',
        },
        '& .orb-dialog': {
          borderRadius: 4,
        },
        '& .orb-dialog-title': {
          fontSize: expanded ? '1.05rem' : '0.98rem',
          fontWeight: 800,
        },
        '& .orb-dialog-content .orb-inp-adornment-wrap, & .orb-inp': {
          minHeight: 52,
        },
        '& .orb-grid > *': {
          minWidth: 0,
        },
        ...sx,
      }}
    >
      <CSmartFilter {...props} />
    </div>
  );
};
