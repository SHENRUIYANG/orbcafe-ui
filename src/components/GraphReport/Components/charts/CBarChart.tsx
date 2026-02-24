import { Box, Stack, Typography } from '@mui/material';
import type { GraphBarDatum } from '../../types';

export interface CBarChartProps {
  data: GraphBarDatum[];
  orientation?: 'horizontal' | 'vertical';
  valueSuffix?: string;
  minHeight?: number;
  activeName?: string;
  onItemClick?: (item: GraphBarDatum) => void;
}

export const CBarChart = ({
  data,
  orientation = 'horizontal',
  valueSuffix = '',
  minHeight = 210,
  activeName,
  onItemClick,
}: CBarChartProps) => {
  if (data.length === 0) {
    return <Typography variant="body2" color="text.secondary">No data</Typography>;
  }

  const max = Math.max(...data.map((d) => d.value), 1);

  if (orientation === 'vertical') {
    return (
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end', minHeight }}>
        {data.map((item) => (
          <Box key={item.name} sx={{ flex: 1, minWidth: 0 }}>
            <Box
              onClick={() => onItemClick?.(item)}
              sx={{
                height: `${Math.max((item.value / max) * 180, 6)}px`,
                bgcolor: item.name === activeName ? 'primary.dark' : 'primary.main',
                borderRadius: '8px 8px 0 0',
                cursor: onItemClick ? 'pointer' : 'default',
                opacity: activeName && item.name !== activeName ? 0.45 : 1,
              }}
            />
            <Typography variant="caption" noWrap title={item.name} sx={{ display: 'block', mt: 0.5 }}>
              {item.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {item.value.toFixed(1)}{valueSuffix}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <Stack spacing={1}>
      {data.map((item) => (
        <Box key={item.name} sx={{ display: 'grid', gridTemplateColumns: '140px 1fr 64px', gap: 1 }}>
          <Typography variant="caption" color="text.secondary" noWrap title={item.name}>
            {item.name}
          </Typography>
          <Box
            onClick={() => onItemClick?.(item)}
            sx={{
              alignSelf: 'center',
              bgcolor: 'action.hover',
              height: 10,
              borderRadius: 999,
              overflow: 'hidden',
              cursor: onItemClick ? 'pointer' : 'default',
              opacity: activeName && item.name !== activeName ? 0.45 : 1,
            }}
          >
            <Box
              sx={{
                width: `${(item.value / max) * 100}%`,
                height: '100%',
                bgcolor: item.name === activeName ? 'primary.dark' : 'primary.main',
              }}
            />
          </Box>
          <Typography variant="caption" sx={{ textAlign: 'right', fontWeight: 600 }}>
            {item.value.toFixed(1)}{valueSuffix}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
};
