import { Box, Typography } from '@mui/material';
import type { GraphWaterfallDatum } from '../../types';

export interface CWaterfallChartProps {
  data: GraphWaterfallDatum[];
  height?: number;
}

export const CWaterfallChart = ({ data, height = 240 }: CWaterfallChartProps) => {
  if (data.length === 0) {
    return <Typography variant="body2" color="text.secondary">No data</Typography>;
  }

  let running = 0;
  const bars = data.map((item) => {
    const start = item.type === 'total' ? 0 : running;
    const end = item.type === 'total' ? item.value : running + item.value;
    if (item.type !== 'total') {
      running = end;
    }
    return { ...item, start, end, delta: end - start };
  });

  const values = bars.flatMap((b) => [b.start, b.end]);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const width = 680;
  const padding = 30;
  const range = max - min || 1;

  const yFor = (v: number) => height - padding - ((v - min) / range) * (height - padding * 2);

  return (
    <Box>
      <Box component="svg" viewBox={`0 0 ${width} ${height}`} sx={{ width: '100%', height }}>
        <line x1={padding} y1={yFor(0)} x2={width - padding} y2={yFor(0)} stroke="rgba(148,163,184,0.4)" />

        {bars.map((bar, index) => {
          const cellWidth = (width - padding * 2) / bars.length;
          const barWidth = Math.max(cellWidth * 0.55, 8);
          const x = padding + index * cellWidth + (cellWidth - barWidth) / 2;
          const top = yFor(Math.max(bar.start, bar.end));
          const bottom = yFor(Math.min(bar.start, bar.end));
          const color =
            bar.type === 'total'
              ? '#42A5F5'
              : bar.delta >= 0
                ? '#66BB6A'
                : '#EF5350';

          return (
            <g key={bar.name}>
              <rect x={x} y={top} width={barWidth} height={Math.max(bottom - top, 4)} rx={6} fill={color} />
              <text x={x + barWidth / 2} y={top - 6} textAnchor="middle" fill="currentColor" fontSize="11">
                {bar.end.toFixed(1)}
              </text>
            </g>
          );
        })}
      </Box>

      <Box sx={{ mt: 1, display: 'grid', gridTemplateColumns: `repeat(${bars.length}, minmax(0, 1fr))`, gap: 1 }}>
        {bars.map((bar) => (
          <Typography key={bar.name} variant="caption" noWrap title={bar.name}>
            {bar.name}
          </Typography>
        ))}
      </Box>
    </Box>
  );
};
