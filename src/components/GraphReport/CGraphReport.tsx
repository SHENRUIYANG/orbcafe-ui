import { Box, Chip, Dialog, IconButton, Stack, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { ReactNode } from 'react';
import type { GraphReportModel } from './types';
import { CGraphKpiCards } from './Components/CGraphKpiCards';
import { CGraphCharts } from './Components/CGraphCharts';

export interface CGraphReportProps {
  open: boolean;
  onClose: () => void;
  model: GraphReportModel;
  tableContent: ReactNode;
}

export const CGraphReport = ({ open, onClose, model, tableContent }: CGraphReportProps) => {
  return (
    <Dialog open={open} onClose={onClose} fullScreen>
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Typography variant="h5" fontWeight={800}>
                {model.title}
              </Typography>
              <Chip size="small" label={`${model.kpis.totalRecords} records`} />
            </Stack>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </Box>

        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5, overflow: 'auto', minHeight: 0 }}>
          <CGraphKpiCards kpis={model.kpis} />
          <CGraphCharts
            billableByPrimary={model.charts.billableByPrimary}
            efficiencyBySecondary={model.charts.efficiencyBySecondary}
            statusDistribution={model.charts.statusDistribution}
          />
          {tableContent}
        </Box>
      </Box>
    </Dialog>
  );
};
