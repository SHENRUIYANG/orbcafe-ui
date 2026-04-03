'use client';

import { Box } from '@mui/material';
import { CSmartFilter } from '../StdReport/CSmartFilter';
import type { PSmartFilterProps } from './types';

export const PSmartFilter = ({ touchMode = 'comfortable', sx, ...props }: PSmartFilterProps) => {
  const expanded = touchMode === 'expanded';

  return (
    <Box
      sx={{
        '& .MuiPaper-root': {
          borderRadius: 4,
        },
        '& .MuiAutocomplete-root': {
          minWidth: { xs: '100%', md: 260 },
        },
        '& .MuiAutocomplete-root .MuiInputBase-root': {
          backgroundColor: 'transparent !important',
        },
        '& .MuiInputBase-root': {
          minHeight: expanded ? 56 : 50,
          borderRadius: 3,
          fontSize: expanded ? '0.98rem' : '0.92rem',
        },
        '& .MuiInputBase-input': {
          py: expanded ? 1.6 : 1.25,
          fontSize: expanded ? '0.98rem' : '0.92rem',
        },
        '& .MuiInputLabel-root': {
          fontSize: expanded ? '0.95rem' : '0.88rem',
        },
        '& .MuiButton-root': {
          minHeight: expanded ? 48 : 44,
          px: expanded ? 2.25 : 1.75,
          borderRadius: 3,
          fontSize: expanded ? '0.95rem' : '0.88rem',
          fontWeight: 700,
        },
        '& .MuiIconButton-root': {
          width: expanded ? 40 : 36,
          height: expanded ? 40 : 36,
        },
        '& .MuiMenuItem-root': {
          minHeight: expanded ? 44 : 38,
          fontSize: expanded ? '0.95rem' : '0.88rem',
        },
        '& .MuiListSubheader-root': {
          py: 1,
        },
        '& .MuiCheckbox-root': {
          p: expanded ? 1 : 0.75,
        },
        '& .MuiFormControlLabel-label': {
          fontSize: expanded ? '0.95rem' : '0.88rem',
        },
        '& .MuiDialog-paper': {
          borderRadius: 4,
        },
        '& .MuiDialogTitle-root': {
          fontSize: expanded ? '1.05rem' : '0.98rem',
          fontWeight: 800,
        },
        '& .MuiDialogContent-root .MuiInputBase-root': {
          minHeight: 52,
        },
        '& .MuiGrid-root > .MuiGrid-item, & .MuiGrid-root > .MuiGrid-sizeXs-1, & .MuiGrid-root > [class*="MuiGrid-grid-"]': {
          minWidth: 0,
        },
        ...sx,
      }}
    >
      <CSmartFilter {...props} />
    </Box>
  );
};
