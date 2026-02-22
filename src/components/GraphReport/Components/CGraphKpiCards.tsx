import { Box, Paper, Typography } from '@mui/material';
import type { GraphReportKpis } from '../types';

interface CGraphKpiCardsProps {
  kpis: GraphReportKpis;
}

const formatNumber = (value: number, maximumFractionDigits = 2) =>
  value.toLocaleString(undefined, { maximumFractionDigits });

export const CGraphKpiCards = ({ kpis }: CGraphKpiCardsProps) => {
  const cards = [
    { label: 'Total Records', value: formatNumber(kpis.totalRecords, 0), color: 'text.primary' },
    { label: 'Total Report', value: formatNumber(kpis.totalReportHours), color: 'text.primary' },
    { label: 'Total Billable', value: formatNumber(kpis.totalBillableHours), color: 'success.main' },
    { label: 'Efficiency', value: `${kpis.efficiency.toFixed(2)}%`, color: 'warning.main' },
    { label: 'Amount', value: formatNumber(kpis.totalAmount), color: 'info.main' },
    { label: 'Flagged', value: formatNumber(kpis.flaggedCount, 0), color: 'error.main' },
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, minmax(0, 1fr))',
          lg: 'repeat(6, minmax(0, 1fr))',
        },
        gap: 1.5,
      }}
    >
      {cards.map((card) => (
        <Paper
          key={card.label}
          variant="outlined"
          sx={{
            p: 1.5,
            borderRadius: 2,
            minHeight: 96,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {card.label}
          </Typography>
          <Typography variant="h4" fontWeight={800} sx={{ color: card.color }}>
            {card.value}
          </Typography>
        </Paper>
      ))}
    </Box>
  );
};

