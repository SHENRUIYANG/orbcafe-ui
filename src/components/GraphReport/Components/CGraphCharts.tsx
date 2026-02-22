import { Box, Paper, Stack, Typography } from '@mui/material';
import type { GraphBarDatum, GraphPieDatum } from '../types';

const PIE_COLORS = ['#1E88E5', '#1ABC9C', '#FBC02D', '#EF5350', '#7E57C2', '#78909C'];

interface CGraphChartsProps {
  billableByPrimary: GraphBarDatum[];
  efficiencyBySecondary: GraphBarDatum[];
  statusDistribution: GraphPieDatum[];
}

const HorizontalBars = ({ data }: { data: GraphBarDatum[] }) => {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <Stack spacing={1}>
      {data.map((item) => (
        <Box key={item.name} sx={{ display: 'grid', gridTemplateColumns: '140px 1fr 64px', gap: 1 }}>
          <Typography variant="caption" color="text.secondary" noWrap title={item.name}>
            {item.name}
          </Typography>
          <Box sx={{ alignSelf: 'center', bgcolor: 'action.hover', height: 10, borderRadius: 999, overflow: 'hidden' }}>
            <Box
              sx={{
                width: `${(item.value / max) * 100}%`,
                height: '100%',
                bgcolor: 'primary.main',
              }}
            />
          </Box>
          <Typography variant="caption" sx={{ textAlign: 'right', fontWeight: 600 }}>
            {item.value.toFixed(1)}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
};

const VerticalBars = ({ data }: { data: GraphBarDatum[] }) => {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end', minHeight: 210 }}>
      {data.map((item) => (
        <Box key={item.name} sx={{ flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              height: `${Math.max((item.value / max) * 180, 6)}px`,
              bgcolor: 'primary.main',
              borderRadius: '8px 8px 0 0',
            }}
          />
          <Typography variant="caption" noWrap title={item.name} sx={{ display: 'block', mt: 0.5 }}>
            {item.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {item.value.toFixed(1)}%
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

const StatusDonut = ({ data }: { data: GraphPieDatum[] }) => {
  if (data.length === 0) {
    return <Typography variant="body2" color="text.secondary">No data</Typography>;
  }

  let offset = 0;
  const slices = data.map((item, index) => {
    const start = offset;
    offset += item.percent;
    return `${PIE_COLORS[index % PIE_COLORS.length]} ${start}% ${offset}%`;
  });
  const gradient = `conic-gradient(${slices.join(', ')})`;

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
      <Box
        sx={{
          width: 180,
          height: 180,
          borderRadius: '50%',
          background: gradient,
          position: 'relative',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 30,
            bgcolor: 'background.paper',
            borderRadius: '50%',
          }}
        />
      </Box>
      <Stack spacing={1} sx={{ minWidth: 180 }}>
        {data.map((item, index) => (
          <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: PIE_COLORS[index % PIE_COLORS.length] }} />
            <Typography variant="caption" sx={{ flex: 1 }}>
              {item.name}
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              {item.percent.toFixed(0)}%
            </Typography>
          </Box>
        ))}
      </Stack>
    </Stack>
  );
};

const ChartCard = ({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) => (
  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
    <Typography variant="subtitle1" fontWeight={700}>
      {title}
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
      {subtitle}
    </Typography>
    {children}
  </Paper>
);

export const CGraphCharts = ({ billableByPrimary, efficiencyBySecondary, statusDistribution }: CGraphChartsProps) => {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 1.5,
        gridTemplateColumns: {
          xs: '1fr',
          lg: '1.2fr 1.2fr 1fr',
        },
      }}
    >
      <ChartCard title="Billable by Dimension" subtitle="Top values by billable hours">
        <HorizontalBars data={billableByPrimary} />
      </ChartCard>

      <ChartCard title="Efficiency by Person" subtitle="Lowest efficiency first">
        <VerticalBars data={efficiencyBySecondary} />
      </ChartCard>

      <ChartCard title="Status Distribution" subtitle="Record ratio by status">
        <StatusDonut data={statusDistribution} />
      </ChartCard>
    </Box>
  );
};

