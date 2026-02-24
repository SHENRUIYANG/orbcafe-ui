import { Box, Typography } from '@mui/material';
import type { GraphHeatmapDatum } from '../../types';

export interface CHeatmapChartProps {
  data: GraphHeatmapDatum[];
}

const toHeatColor = (ratio: number) => {
  const clamped = Math.max(0, Math.min(1, ratio));
  const alpha = 0.2 + clamped * 0.8;
  return `rgba(30, 136, 229, ${alpha})`;
};

export const CHeatmapChart = ({ data }: CHeatmapChartProps) => {
  if (data.length === 0) {
    return <Typography variant="body2" color="text.secondary">No data</Typography>;
  }

  const xLabels = Array.from(new Set(data.map((d) => d.x)));
  const yLabels = Array.from(new Set(data.map((d) => d.y)));
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const valueMap = new Map(data.map((d) => [`${d.y}__${d.x}`, d.value]));

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `120px repeat(${xLabels.length}, minmax(64px, 1fr))`,
          gap: 1,
          minWidth: 120 + xLabels.length * 64,
        }}
      >
        <Box />
        {xLabels.map((x) => (
          <Typography key={x} variant="caption" sx={{ textAlign: 'center', fontWeight: 600 }}>
            {x}
          </Typography>
        ))}

        {yLabels.map((y) => (
          <Box key={y} sx={{ display: 'contents' }}>
            <Typography variant="caption" sx={{ alignSelf: 'center' }}>
              {y}
            </Typography>
            {xLabels.map((x) => {
              const value = valueMap.get(`${y}__${x}`) || 0;
              const ratio = value / maxValue;
              return (
                <Box
                  key={`${y}-${x}`}
                  sx={{
                    height: 36,
                    borderRadius: 1,
                    bgcolor: toHeatColor(ratio),
                    border: '1px solid rgba(148,163,184,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="caption" fontWeight={700}>
                    {value.toFixed(1)}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>
    </Box>
  );
};
