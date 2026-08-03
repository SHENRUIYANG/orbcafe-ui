import { CStack, CTypography } from '../../../Atoms';

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
    return <CTypography variant="body2" muted>No data</CTypography>;
  }

  const max = Math.max(...data.map((d) => d.value), 1);

  if (orientation === 'vertical') {
    return (
          <div style={{ display: 'flex', gap: 1, alignItems: 'flex-end', minHeight }}>
        {data.map((item) => (
          <div key={item.name} style={{ flex: 1, minWidth: 0 }}>
            <div
              onClick={() => onItemClick?.(item)}
              sx={{
                height: `${Math.max((item.value / max) * 180, 6)}px`,
                background: item.name === activeName ? 'primary.dark' : 'primary.main',
                borderRadius: '8px 8px 0 0',
                cursor: onItemClick ? 'pointer' : 'default',
                opacity: activeName && item.name !== activeName ? 0.45 : 1,
              }}
            />
            <CTypography variant="caption"  title={item.name} sx={{ display: 'block', mt: 0.5 }}>
              {item.name}
            </CTypography>
            <CTypography variant="caption" muted>
              {item.value.toFixed(1)}{valueSuffix}
            </CTypography>
          </div>
        ))}
      </div>
    );
  }

  return (
    <CStack spacing={1}>
      {data.map((item) => (
        <div key={item.name} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 64px', gap: 1 }}>
          <CTypography variant="caption" muted  title={item.name}>
            {item.name}
          </CTypography>
          <div
            onClick={() => onItemClick?.(item)}
            sx={{
              alignSelf: 'center',
              background: 'action.hover',
              height: 10,
              borderRadius: 999,
              overflow: 'hidden',
              cursor: onItemClick ? 'pointer' : 'default',
              opacity: activeName && item.name !== activeName ? 0.45 : 1,
            }}
          >
                <div style={{
                width: `${(item.value / max) * 100}%`,
                height: '100%',
                background: item.name === activeName ? 'primary.dark' : 'primary.main',
              }}
            />
          </div>
          <CTypography variant="caption" sx={{ textAlign: 'right', fontWeight: 600 }}>
            {item.value.toFixed(1)}{valueSuffix}
          </CTypography>
        </div>
      ))}
    </CStack>
  );
};
