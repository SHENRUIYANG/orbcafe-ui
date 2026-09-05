import { CTypography } from '../../../Atoms';

import type { GraphLineDatum } from '../../types';

export interface CLineChartProps {
  data: GraphLineDatum[];
  color?: string;
  valueSuffix?: string;
  height?: number;
}

export const CLineChart = ({
  data,
  color = 'var(--orb-chart-1)',
  valueSuffix = '',
  height = 220,
}: CLineChartProps) => {
  if (data.length === 0) {
    return <CTypography variant="body2" muted>No data</CTypography>;
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
    <div>
      <div component="svg" viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height }}>
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} style={{ stroke: 'var(--orb-chart-grid)' }} />
        <polyline fill="none" style={{ stroke: color }} strokeWidth={3} points={pointsAttr} />
        {points.map((point) => (
          <circle key={point.name} cx={point.x} cy={point.y} r={4} style={{ fill: color }} />
        ))}
      </div>

          <div sx={{ mt: 1, display: 'grid', gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))`, gap: 1 }}>
        {data.map((item) => (
          <div key={item.name} style={{ minWidth: 0 }}>
            <CTypography variant="caption"  title={item.name} sx={{ display: 'block' }}>
              {item.name}
            </CTypography>
            <CTypography variant="caption" muted>
              {item.value.toFixed(1)}{valueSuffix}
            </CTypography>
          </div>
        ))}
      </div>
    </div>
  );
};
