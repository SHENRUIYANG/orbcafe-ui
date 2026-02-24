import { Box, Stack, Typography } from '@mui/material';
import type { GraphPieDatum } from '../../types';

const DEFAULT_COLORS = ['#1E88E5', '#1ABC9C', '#FBC02D', '#EF5350', '#7E57C2', '#78909C'];

export interface CPieChartProps {
  data: GraphPieDatum[];
  variant?: 'pie' | 'donut';
  colors?: string[];
  size?: number;
  activeName?: string;
  onItemClick?: (item: GraphPieDatum) => void;
}

export const CPieChart = ({
  data,
  variant = 'donut',
  colors = DEFAULT_COLORS,
  size = 180,
  activeName,
  onItemClick,
}: CPieChartProps) => {
  if (data.length === 0) {
    return <Typography variant="body2" color="text.secondary">No data</Typography>;
  }

  let offset = 0;
  const slices = data.map((item, index) => {
    const start = offset;
    offset += item.percent;
    return `${colors[index % colors.length]} ${start}% ${offset}%`;
  });

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: `conic-gradient(${slices.join(', ')})`,
          position: 'relative',
          flexShrink: 0,
        }}
      >
        {variant === 'donut' && (
          <Box
            sx={{
              position: 'absolute',
              inset: Math.round(size * 0.18),
              bgcolor: 'background.paper',
              borderRadius: '50%',
            }}
          />
        )}
      </Box>
      <Stack spacing={1} sx={{ minWidth: 180 }}>
        {data.map((item, index) => (
          <Box
            key={item.name}
            onClick={() => onItemClick?.(item)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: onItemClick ? 'pointer' : 'default',
              opacity: activeName && item.name !== activeName ? 0.45 : 1,
            }}
          >
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: colors[index % colors.length] }} />
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
