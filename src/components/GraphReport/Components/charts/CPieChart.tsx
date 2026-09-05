import { CStack, CTypography } from '../../../Atoms';

import type { GraphPieDatum } from '../../types';

const DEFAULT_COLORS = [
  'var(--orb-chart-1)',
  'var(--orb-chart-2)',
  'var(--orb-chart-5)',
  'var(--orb-chart-negative)',
  'var(--orb-chart-4)',
  'var(--orb-chart-3)',
];

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
    return <CTypography variant="body2" muted>No data</CTypography>;
  }

  let offset = 0;
  const slices = data.map((item, index) => {
    const start = offset;
    offset += item.percent;
    return `${colors[index % colors.length]} ${start}% ${offset}%`;
  });

  return (
    <CStack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <div style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: `conic-gradient(${slices.join(', ')})`,
          position: 'relative',
          flexShrink: 0,
        }}
      >
        {variant === 'donut' && (
              <div style={{
              position: 'absolute',
              inset: Math.round(size * 0.18),
              background: 'background.paper',
              borderRadius: '50%',
            }}
          />
        )}
      </div>
      <CStack spacing={1} sx={{ minWidth: 180 }}>
        {data.map((item, index) => (
          <div
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
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: colors[index % colors.length] }} />
            <CTypography variant="caption" sx={{ flex: 1 }}>
              {item.name}
            </CTypography>
            <CTypography variant="caption" sx={{ fontWeight: 700 }}>
              {item.percent.toFixed(0)}%
            </CTypography>
          </div>
        ))}
      </CStack>
    </CStack>
  );
};
