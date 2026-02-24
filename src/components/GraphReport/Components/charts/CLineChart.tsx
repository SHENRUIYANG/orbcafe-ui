import { Box, Typography } from '@mui/material';
import type { GraphLineDatum } from '../../types';

export interface CLineChartProps {
  data: GraphLineDatum[];
  color?: string;
  valueSuffix?: string;
  height?: number;
}

export const CLineChart = ({
  data,
  color = '#42A5F5',
  valueSuffix = '',
  height = 220,
}: CLineChartProps) => {
  if (data.length === 0) {
    return <Typography variant="body2" color="text.secondary">No data</Typography>;
  }

  const width = 640;
  const padding = 28;
  const values = data.map((d) => d.value);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const range = max - min || 1;

  const points = data.map((item, index) => {
    const x = padding + (index * (width - padding * 2)) / Math.max(data.length - 1, 1);
    const y = height - padding - ((item.value - min) / range) * (height - padding * 2);
    return { x, y, ...item };
  });

  const pointsAttr = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <Box>
      <Box component="svg" viewBox={`0 0 ${width} ${height}`} sx={{ width: '100%', height }}>
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(148,163,184,0.4)" />
        <polyline fill="none" stroke={color} strokeWidth={3} points={pointsAttr} />
        {points.map((point) => (
          <circle key={point.name} cx={point.x} cy={point.y} r={4} fill={color} />
        ))}
      </Box>

      <Box sx={{ mt: 1, display: 'grid', gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))`, gap: 1 }}>
        {data.map((item) => (
          <Box key={item.name} sx={{ minWidth: 0 }}>
            <Typography variant="caption" noWrap title={item.name} sx={{ display: 'block' }}>
              {item.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {item.value.toFixed(1)}{valueSuffix}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
