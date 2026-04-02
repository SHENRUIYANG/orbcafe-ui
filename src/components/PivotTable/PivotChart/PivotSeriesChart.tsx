import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import type { PivotChartType } from '../types';
import type { PivotChartDatum } from './pivotChartUtils';

interface PivotSeriesChartProps {
  data: PivotChartDatum[];
  chartType: Exclude<PivotChartType, 'scatter'>;
  primaryLabel: string;
  secondaryLabel?: string;
  formatPrimaryValue: (value: number) => string;
  formatSecondaryValue?: (value: number) => string;
}

const getSafeMax = (values: number[]) => Math.max(...values, 1);

export const PivotSeriesChart: React.FC<PivotSeriesChartProps> = ({
  data,
  chartType,
  primaryLabel,
  secondaryLabel,
  formatPrimaryValue,
  formatSecondaryValue,
}) => {
  const theme = useTheme();
  const primaryColor = theme.palette.primary.main;
  const secondaryColor = theme.palette.warning.main;

  if (data.length === 0) {
    return null;
  }

  if (chartType === 'bar-horizontal') {
    const maxValue = getSafeMax(
      data.flatMap((item) => [item.primaryValue, item.secondaryValue ?? 0]),
    );

    return (
      <Stack spacing={1.1}>
        {data.map((item) => (
          <Box
            key={item.name}
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '160px 1fr 128px' },
              gap: 1.25,
              alignItems: 'center',
            }}
          >
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700 }} noWrap title={item.name}>
              {item.name}
            </Typography>
            <Stack spacing={0.65}>
              <Box
                sx={{
                  height: 10,
                  borderRadius: 999,
                  overflow: 'hidden',
                  bgcolor: alpha(theme.palette.action.active, 0.08),
                }}
              >
                <Box
                  sx={{
                    width: `${(item.primaryValue / maxValue) * 100}%`,
                    height: '100%',
                    bgcolor: primaryColor,
                  }}
                />
              </Box>
              {secondaryLabel && (
                <Box
                  sx={{
                    height: 8,
                    borderRadius: 999,
                    overflow: 'hidden',
                    bgcolor: alpha(theme.palette.action.active, 0.08),
                  }}
                >
                  <Box
                    sx={{
                      width: `${((item.secondaryValue ?? 0) / maxValue) * 100}%`,
                      height: '100%',
                      bgcolor: secondaryColor,
                    }}
                  />
                </Box>
              )}
            </Stack>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: '0.72rem', textAlign: { xs: 'left', md: 'right' }, fontWeight: 700 }}>
                {formatPrimaryValue(item.primaryValue)}
              </Typography>
              {secondaryLabel && (
                <Typography sx={{ fontSize: '0.72rem', textAlign: { xs: 'left', md: 'right' }, color: 'text.secondary' }}>
                  {(formatSecondaryValue ?? formatPrimaryValue)(item.secondaryValue ?? 0)}
                </Typography>
              )}
            </Box>
          </Box>
        ))}
      </Stack>
    );
  }

  if (chartType === 'bar-vertical') {
    const maxValue = getSafeMax(
      data.flatMap((item) => [item.primaryValue, item.secondaryValue ?? 0]),
    );
    const cellWidth = secondaryLabel ? 92 : 76;

    return (
      <Box sx={{ overflowX: 'auto', pb: 0.5 }}>
        <Box
          sx={{
            minWidth: Math.max(620, data.length * cellWidth),
            display: 'grid',
            gridTemplateColumns: `repeat(${data.length}, minmax(56px, 1fr))`,
            gap: 1,
            alignItems: 'end',
          }}
        >
          {data.map((item) => (
            <Box key={item.name} sx={{ minWidth: 0 }}>
              <Box sx={{ height: 210, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 0.8 }}>
                <Box
                  sx={{
                    width: secondaryLabel ? 16 : 26,
                    minHeight: 8,
                    height: `${Math.max((item.primaryValue / maxValue) * 188, 8)}px`,
                    borderRadius: '10px 10px 2px 2px',
                    bgcolor: primaryColor,
                  }}
                  title={`${primaryLabel}: ${formatPrimaryValue(item.primaryValue)}`}
                />
                {secondaryLabel && (
                  <Box
                    sx={{
                      width: 16,
                      minHeight: 8,
                      height: `${Math.max(((item.secondaryValue ?? 0) / maxValue) * 188, 8)}px`,
                      borderRadius: '10px 10px 2px 2px',
                      bgcolor: secondaryColor,
                    }}
                    title={`${secondaryLabel}: ${(formatSecondaryValue ?? formatPrimaryValue)(item.secondaryValue ?? 0)}`}
                  />
                )}
              </Box>
              <Typography sx={{ fontSize: '0.76rem', fontWeight: 700 }} noWrap title={item.name}>
                {item.name}
              </Typography>
              <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }} noWrap title={formatPrimaryValue(item.primaryValue)}>
                {formatPrimaryValue(item.primaryValue)}
              </Typography>
              {secondaryLabel && (
                <Typography
                  sx={{ fontSize: '0.7rem', color: 'text.secondary' }}
                  noWrap
                  title={(formatSecondaryValue ?? formatPrimaryValue)(item.secondaryValue ?? 0)}
                >
                  {(formatSecondaryValue ?? formatPrimaryValue)(item.secondaryValue ?? 0)}
                </Typography>
              )}
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  const width = Math.max(680, data.length * 74);
  const height = 240;
  const padding = { top: 20, right: 18, bottom: 36, left: 18 };
  const maxValue = getSafeMax(data.flatMap((item) => [item.primaryValue, item.secondaryValue ?? 0]));
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const buildLinePoints = (selector: (item: PivotChartDatum) => number) =>
    data.map((item, index) => {
      const x = padding.left + (index * innerWidth) / Math.max(data.length - 1, 1);
      const y = height - padding.bottom - (selector(item) / maxValue) * innerHeight;
      return { x, y, item };
    });

  const primaryPoints = buildLinePoints((item) => item.primaryValue);
  const secondaryPoints = secondaryLabel
    ? buildLinePoints((item) => item.secondaryValue ?? 0)
    : [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.1 }}>
      <Box sx={{ overflowX: 'auto' }}>
        <Box component="svg" viewBox={`0 0 ${width} ${height}`} sx={{ width: '100%', minWidth: width, height }}>
          <line
            x1={padding.left}
            y1={height - padding.bottom}
            x2={width - padding.right}
            y2={height - padding.bottom}
            stroke={alpha(theme.palette.text.secondary, 0.35)}
          />
          <polyline
            fill="none"
            stroke={primaryColor}
            strokeWidth={3}
            points={primaryPoints.map((point) => `${point.x},${point.y}`).join(' ')}
          />
          {primaryPoints.map((point) => (
            <circle key={`primary-${point.item.name}`} cx={point.x} cy={point.y} r={4} fill={primaryColor}>
              <title>
                {point.item.name}
                {'\n'}
                {primaryLabel}: {formatPrimaryValue(point.item.primaryValue)}
              </title>
            </circle>
          ))}
          {secondaryLabel && (
            <>
              <polyline
                fill="none"
                stroke={secondaryColor}
                strokeWidth={2.5}
                strokeDasharray="5 5"
                points={secondaryPoints.map((point) => `${point.x},${point.y}`).join(' ')}
              />
              {secondaryPoints.map((point) => (
                <circle key={`secondary-${point.item.name}`} cx={point.x} cy={point.y} r={3.5} fill={secondaryColor}>
                  <title>
                    {point.item.name}
                    {'\n'}
                    {secondaryLabel}: {(formatSecondaryValue ?? formatPrimaryValue)(point.item.secondaryValue ?? 0)}
                  </title>
                </circle>
              ))}
            </>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(4, minmax(0, 1fr))' },
          gap: 1,
        }}
      >
        {data.map((item) => (
          <Box
            key={item.name}
            sx={(theme) => ({
              borderRadius: 2,
              px: 1.1,
              py: 0.9,
              border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
              bgcolor: alpha(theme.palette.background.default, 0.35),
            })}
          >
            <Typography sx={{ fontSize: '0.76rem', fontWeight: 700 }} noWrap title={item.name}>
              {item.name}
            </Typography>
            <Typography sx={{ fontSize: '0.71rem', color: 'text.secondary' }}>
              {formatPrimaryValue(item.primaryValue)}
            </Typography>
            {secondaryLabel && (
              <Typography sx={{ fontSize: '0.71rem', color: 'text.secondary' }}>
                {(formatSecondaryValue ?? formatPrimaryValue)(item.secondaryValue ?? 0)}
              </Typography>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
};
