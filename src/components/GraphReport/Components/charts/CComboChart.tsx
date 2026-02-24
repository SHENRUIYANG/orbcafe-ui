import { Box, Stack, Typography } from '@mui/material';
import type { GraphComboDatum } from '../../types';

export interface CComboChartProps {
  data: GraphComboDatum[];
  barColor?: string;
  lineColor?: string;
  height?: number;
}

export const CComboChart = ({
  data,
  barColor = '#64B5F6',
  lineColor = '#FFB74D',
  height = 220,
}: CComboChartProps) => {
  if (data.length === 0) {
    return <Typography variant="body2" color="text.secondary">No data</Typography>;
  }

  const width = 640;
  const padding = 28;
  const maxBar = Math.max(...data.map((d) => d.barValue), 1);
  const maxLine = Math.max(...data.map((d) => d.lineValue), 1);

  const bars = data.map((item, index) => {
    const cellWidth = (width - padding * 2) / data.length;
    const barWidth = Math.max(cellWidth * 0.5, 8);
    const x = padding + index * cellWidth + (cellWidth - barWidth) / 2;
    const barHeight = (item.barValue / maxBar) * (height - padding * 2);
    const y = height - padding - barHeight;
    return { x, y, barHeight, barWidth, item };
  });

  const points = data.map((item, index) => {
    const cellWidth = (width - padding * 2) / data.length;
    const x = padding + index * cellWidth + cellWidth / 2;
    const y = height - padding - (item.lineValue / maxLine) * (height - padding * 2);
    return { x, y, item };
  });

  return (
    <Stack spacing={1.25}>
      <Box component="svg" viewBox={`0 0 ${width} ${height}`} sx={{ width: '100%', height }}>
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(148,163,184,0.4)" />

        {bars.map((bar) => (
          <rect
            key={bar.item.name}
            x={bar.x}
            y={bar.y}
            width={bar.barWidth}
            height={Math.max(bar.barHeight, 4)}
            rx={6}
            fill={barColor}
          />
        ))}

        <polyline
          fill="none"
          stroke={lineColor}
          strokeWidth={3}
          points={points.map((point) => `${point.x},${point.y}`).join(' ')}
        />
        {points.map((point) => (
          <circle key={`${point.item.name}-line`} cx={point.x} cy={point.y} r={3.5} fill={lineColor} />
        ))}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))`, gap: 1 }}>
        {data.map((item) => (
          <Box key={item.name} sx={{ minWidth: 0 }}>
            <Typography variant="caption" noWrap title={item.name} sx={{ display: 'block' }}>
              {item.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              Bar: {item.barValue.toFixed(1)}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              Line: {item.lineValue.toFixed(1)}
            </Typography>
          </Box>
        ))}
      </Box>
    </Stack>
  );
};
