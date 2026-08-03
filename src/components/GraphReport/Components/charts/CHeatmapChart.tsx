import { CTypography } from '../../../Atoms';

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
    return <CTypography variant="body2" muted>No data</CTypography>;
  }

  const xLabels = Array.from(new Set(data.map((d) => d.x)));
  const yLabels = Array.from(new Set(data.map((d) => d.y)));
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const valueMap = new Map(data.map((d) => [`${d.y}__${d.x}`, d.value]));

  return (
        <div style={{ overflowX: 'auto' }}>
          <div style={{
          display: 'grid',
          gridTemplateColumns: `120px repeat(${xLabels.length}, minmax(64px, 1fr))`,
          gap: 1,
          minWidth: 120 + xLabels.length * 64,
        }}
      >
        <div />
        {xLabels.map((x) => (
          <CTypography key={x} variant="caption" sx={{ textAlign: 'center', fontWeight: 600 }}>
            {x}
          </CTypography>
        ))}

        {yLabels.map((y) => (
          <div key={y} style={{ display: 'contents' }}>
            <CTypography variant="caption" sx={{ alignSelf: 'center' }}>
              {y}
            </CTypography>
            {xLabels.map((x) => {
              const value = valueMap.get(`${y}__${x}`) || 0;
              const ratio = value / maxValue;
              return (
                <div
                  key={`${y}-${x}`}
                  sx={{
                    height: 36,
                    borderRadius: 1,
                    background: toHeatColor(ratio),
                    border: '1px solid rgba(148,163,184,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CTypography variant="caption" sx={{ fontWeight: 700 }}>
                    {value.toFixed(1)}
                  </CTypography>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
