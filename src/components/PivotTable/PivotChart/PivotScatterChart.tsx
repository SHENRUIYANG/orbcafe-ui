import React from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';
import type { PivotChartDatum } from './pivotChartUtils';

interface PivotScatterChartProps {
  data: PivotChartDatum[];
  primaryLabel: string;
  secondaryLabel?: string;
  formatPrimaryValue: (value: number) => string;
  formatSecondaryValue?: (value: number) => string;
}

const formatAxisNumber = (value: number) => value.toLocaleString(undefined, { maximumFractionDigits: 1 });

export const PivotScatterChart: React.FC<PivotScatterChartProps> = ({
  data,
  primaryLabel,
  secondaryLabel,
  formatPrimaryValue,
  formatSecondaryValue,
}) => {
  const theme = useTheme();

  if (data.length === 0) {
    return null;
  }

  const width = 720;
  const height = 250;
  const padding = { top: 20, right: 24, bottom: 40, left: 52 };

  const xValues = secondaryLabel ? data.map((item) => item.primaryValue) : data.map((_, index) => index + 1);
  const yValues = secondaryLabel ? data.map((item) => item.secondaryValue ?? 0) : data.map((item) => item.primaryValue);
  const maxX = Math.max(...xValues, 1);
  const maxY = Math.max(...yValues, 1);
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const dots = data.map((item, index) => {
    const rawX = secondaryLabel ? item.primaryValue : index + 1;
    const rawY = secondaryLabel ? item.secondaryValue ?? 0 : item.primaryValue;
    const x = padding.left + (rawX / maxX) * innerWidth;
    const y = height - padding.bottom - (rawY / maxY) * innerHeight;
    return { ...item, x, y, rawX, rawY };
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
      <Box sx={{ overflowX: 'auto' }}>
        <Box component="svg" viewBox={`0 0 ${width} ${height}`} sx={{ width: '100%', minWidth: width, height }}>
          <line
            x1={padding.left}
            y1={height - padding.bottom}
            x2={width - padding.right}
            y2={height - padding.bottom}
            stroke={alpha(theme.palette.text.secondary, 0.35)}
          />
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={height - padding.bottom}
            stroke={alpha(theme.palette.text.secondary, 0.35)}
          />

          {dots.map((dot) => (
            <g key={dot.name}>
              <circle cx={dot.x} cy={dot.y} r={7} fill={alpha(theme.palette.primary.main, 0.18)} />
              <circle cx={dot.x} cy={dot.y} r={4.5} fill={theme.palette.primary.main}>
                <title>
                  {dot.name}
                  {'\n'}
                  {secondaryLabel ? `${primaryLabel}: ${formatPrimaryValue(dot.primaryValue)}` : `${primaryLabel}: ${formatPrimaryValue(dot.primaryValue)}`}
                  {secondaryLabel
                    ? `\n${secondaryLabel}: ${(formatSecondaryValue ?? formatPrimaryValue)(dot.secondaryValue ?? 0)}`
                    : ''}
                </title>
              </circle>
              <text
                x={dot.x}
                y={Math.max(dot.y - 12, padding.top + 8)}
                textAnchor="middle"
                fontSize="10"
                fill={theme.palette.text.secondary}
              >
                {dot.name}
              </text>
            </g>
          ))}

          <text
            x={width / 2}
            y={height - 10}
            textAnchor="middle"
            fontSize="11"
            fill={theme.palette.text.secondary}
          >
            {secondaryLabel ? primaryLabel : 'Index'}
          </text>
          <text
            x={16}
            y={height / 2}
            textAnchor="middle"
            transform={`rotate(-90 16 ${height / 2})`}
            fontSize="11"
            fill={theme.palette.text.secondary}
          >
            {secondaryLabel ?? primaryLabel}
          </text>

          <text
            x={padding.left}
            y={padding.top - 4}
            fontSize="10"
            fill={theme.palette.text.secondary}
          >
            {formatAxisNumber(maxY)}
          </text>
          <text
            x={width - padding.right}
            y={height - padding.bottom + 16}
            textAnchor="end"
            fontSize="10"
            fill={theme.palette.text.secondary}
          >
            {formatAxisNumber(maxX)}
          </text>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' },
          gap: 1,
        }}
      >
        {data.map((item) => (
          <Box
            key={item.name}
            sx={(theme) => ({
              borderRadius: 2,
              px: 1.25,
              py: 1,
              border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
              bgcolor: alpha(theme.palette.background.default, 0.35),
            })}
          >
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700 }} noWrap title={item.name}>
              {item.name}
            </Typography>
            <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
              {primaryLabel}: {formatPrimaryValue(item.primaryValue)}
            </Typography>
            {secondaryLabel && (
              <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
                {secondaryLabel}: {(formatSecondaryValue ?? formatPrimaryValue)(item.secondaryValue ?? 0)}
              </Typography>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
};
