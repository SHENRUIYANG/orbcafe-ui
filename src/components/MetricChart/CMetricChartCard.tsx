'use client';

import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties, KeyboardEvent, ReactNode } from 'react';
import { CPaper, CSelect, CTypography } from '../Atoms';
import type { OrbSxProps } from '../../lib/orbis-compat/sx';
import { useOrbTokens } from '../../lib/theme';

export const METRIC_CHART_TYPES = [
  'bar',
  'column',
  'line',
  'pie',
  'donut',
  'scatter',
  'bubble',
  'list',
  'metric',
  'progress',
] as const;

export type MetricChartType = (typeof METRIC_CHART_TYPES)[number];

export interface MetricChartDatum {
  id: string;
  label: string;
  value: number;
  secondaryValue?: number;
  color?: string;
}

export interface CMetricChartCardProps {
  title: string;
  subtitle?: ReactNode;
  data?: MetricChartDatum[];
  chartType?: MetricChartType;
  onChartTypeChange?: (chartType: MetricChartType) => void;
  onItemClick?: (item: MetricChartDatum) => void;
  activeId?: string;
  valueFormatter?: (value: number) => string;
  secondaryValueFormatter?: (value: number) => string;
  valueLabel?: string;
  secondaryValueLabel?: string;
  emptyState?: ReactNode;
  loading?: boolean;
  error?: ReactNode;
  maxItems?: number;
  showChartTypeControl?: boolean;
  chartTypeOptions?: MetricChartType[];
  chartTypeLabels?: Partial<Record<MetricChartType, string>>;
  footer?: ReactNode;
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
  sx?: OrbSxProps;
}

const DEFAULT_CHART_LABELS: Record<MetricChartType, string> = {
  bar: 'Bars',
  column: 'Columns',
  line: 'Line',
  pie: 'Pie',
  donut: 'Donut',
  scatter: 'Scatter',
  bubble: 'Bubble',
  list: 'List',
  metric: 'Metric',
  progress: 'Progress',
};

const SVG_WIDTH = 480;
const SVG_HEIGHT = 214;
const SVG_PAD = { top: 18, right: 16, bottom: 38, left: 30 };

const finiteValue = (value: number | undefined): number => (
  typeof value === 'number' && Number.isFinite(value) ? value : 0
);

const formatDefaultValue = (value: number): string => value.toLocaleString(undefined, { maximumFractionDigits: 1 });

const getItemKey = (item: MetricChartDatum, index: number): string => `${item.id || item.label}-${index}`;

const truncateLabel = (label: string, maxLength = 13): string => (
  label.length > maxLength ? `${label.slice(0, Math.max(1, maxLength - 1))}…` : label
);

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const getChartColor = (item: MetricChartDatum, index: number, colors: string[]): string => item.color ?? colors[index % colors.length];

const getChartRange = (data: MetricChartDatum[]) => {
  const values = data.map((item) => finiteValue(item.value));
  const min = Math.min(0, ...values);
  const max = Math.max(0, ...values);
  return { min, max: max === min ? min + 1 : max, range: max === min ? 1 : max - min };
};

const getPoint = (index: number, item: MetricChartDatum, data: MetricChartDatum[]) => {
  const innerWidth = SVG_WIDTH - SVG_PAD.left - SVG_PAD.right;
  const innerHeight = SVG_HEIGHT - SVG_PAD.top - SVG_PAD.bottom;
  const { max, range } = getChartRange(data);
  const x = SVG_PAD.left + (index * innerWidth) / Math.max(data.length - 1, 1);
  const y = SVG_PAD.top + ((max - finiteValue(item.value)) / range) * innerHeight;
  const zeroY = SVG_PAD.top + (max / range) * innerHeight;
  return { x, y, zeroY };
};

const polarToCartesian = (cx: number, cy: number, radius: number, angle: number) => {
  const radians = ((angle - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(radians), y: cy + radius * Math.sin(radians) };
};

const describeSlice = (cx: number, cy: number, outerRadius: number, innerRadius: number, startAngle: number, endAngle: number): string => {
  const startOuter = polarToCartesian(cx, cy, outerRadius, endAngle);
  const endOuter = polarToCartesian(cx, cy, outerRadius, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  if (innerRadius === 0) {
    return `M ${cx} ${cy} L ${startOuter.x} ${startOuter.y} A ${outerRadius} ${outerRadius} 0 ${largeArc} 0 ${endOuter.x} ${endOuter.y} Z`;
  }
  const startInner = polarToCartesian(cx, cy, innerRadius, endAngle);
  const endInner = polarToCartesian(cx, cy, innerRadius, startAngle);
  return `M ${startOuter.x} ${startOuter.y} A ${outerRadius} ${outerRadius} 0 ${largeArc} 0 ${endOuter.x} ${endOuter.y} L ${endInner.x} ${endInner.y} A ${innerRadius} ${innerRadius} 0 ${largeArc} 1 ${startInner.x} ${startInner.y} Z`;
};

const EmptyState = ({ children }: { children: ReactNode }) => (
  <div className="orb-metric-empty" role="status">
    <span className="orb-metric-empty-mark" aria-hidden="true">—</span>
    <CTypography variant="body2" muted>{children}</CTypography>
  </div>
);

const LoadingState = () => (
  <div className="orb-metric-loading" role="status" aria-label="Loading chart">
    <span className="orb-metric-skeleton orb-metric-skeleton-wide" />
    <span className="orb-metric-skeleton" />
    <span className="orb-metric-skeleton orb-metric-skeleton-short" />
    <span className="orb-metric-skeleton orb-metric-skeleton-wide" />
  </div>
);

const InteractiveProps = ({
  item,
  onItemClick,
}: {
  item: MetricChartDatum;
  onItemClick?: (item: MetricChartDatum) => void;
}) => {
  if (!onItemClick) return {};
  const activate = () => onItemClick(item);
  const onKeyDown = (event: KeyboardEvent<SVGElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      activate();
    }
  };
  return {
    role: 'button' as const,
    tabIndex: 0,
    onClick: activate,
    onKeyDown,
    style: { cursor: 'pointer' } as CSSProperties,
  };
};

const LoadingOrEmpty = ({
  loading,
  error,
  hasData,
  emptyState,
  children,
}: {
  loading?: boolean;
  error?: ReactNode;
  hasData: boolean;
  emptyState?: ReactNode;
  children: ReactNode;
}) => {
  if (loading) return <LoadingState />;
  if (error) return <div className="orb-metric-error" role="alert">{error}</div>;
  if (!hasData) return <EmptyState>{emptyState ?? 'No data for the current selection.'}</EmptyState>;
  return <>{children}</>;
};

const HorizontalBars = ({
  data,
  activeId,
  onItemClick,
  valueFormatter,
  colors,
}: {
  data: MetricChartDatum[];
  activeId?: string;
  onItemClick?: (item: MetricChartDatum) => void;
  valueFormatter: (value: number) => string;
  colors: string[];
}) => {
  const max = Math.max(...data.map((item) => Math.abs(finiteValue(item.value))), 1);
  return (
    <div className="orb-metric-bars" role="list" aria-label="Chart data">
      {data.map((item, index) => {
        const value = finiteValue(item.value);
        const width = `${clamp((Math.abs(value) / max) * 100, 0, 100)}%`;
        const isActive = activeId === item.id;
        const content = (
          <>
            <span className="orb-metric-bar-label" title={item.label}>{item.label}</span>
            <span className="orb-metric-bar-track" aria-hidden="true">
              <span className={`orb-metric-bar-fill${isActive ? ' is-active' : ''}`} style={{ width, backgroundColor: getChartColor(item, index, colors) }} />
            </span>
            <span className="orb-metric-bar-value">{valueFormatter(value)}</span>
          </>
        );
        return onItemClick ? (
          <button
            key={getItemKey(item, index)}
            type="button"
            className={`orb-metric-bar-row${isActive ? ' is-active' : ''}`}
            onClick={() => onItemClick(item)}
            title={`${item.label}: ${valueFormatter(value)}`}
            aria-pressed={isActive}
          >
            {content}
          </button>
        ) : (
          <div key={getItemKey(item, index)} className={`orb-metric-bar-row${isActive ? ' is-active' : ''}`} role="listitem">
            {content}
          </div>
        );
      })}
    </div>
  );
};

const ProgressRows = ({
  data,
  activeId,
  onItemClick,
  valueFormatter,
  colors,
}: {
  data: MetricChartDatum[];
  activeId?: string;
  onItemClick?: (item: MetricChartDatum) => void;
  valueFormatter: (value: number) => string;
  colors: string[];
}) => {
  const total = Math.max(data.reduce((sum, item) => sum + Math.max(finiteValue(item.value), 0), 0), 1);
  return (
    <div className="orb-metric-progress" role="list" aria-label="Chart data">
      {data.map((item, index) => {
        const value = Math.max(finiteValue(item.value), 0);
        const percentage = clamp((value / total) * 100, 0, 100);
        const isActive = activeId === item.id;
        const row = (
          <>
            <span className="orb-metric-progress-heading"><span title={item.label}>{item.label}</span><strong>{valueFormatter(value)}</strong></span>
            <span className="orb-metric-bar-track" aria-hidden="true"><span className="orb-metric-bar-fill" style={{ width: `${percentage}%`, backgroundColor: getChartColor(item, index, colors) }} /></span>
          </>
        );
        return onItemClick ? (
          <button key={getItemKey(item, index)} type="button" className={`orb-metric-progress-row${isActive ? ' is-active' : ''}`} onClick={() => onItemClick(item)} aria-pressed={isActive}>{row}</button>
        ) : <div key={getItemKey(item, index)} className={`orb-metric-progress-row${isActive ? ' is-active' : ''}`} role="listitem">{row}</div>;
      })}
    </div>
  );
};

const SvgChart = ({
  type,
  data,
  activeId,
  onItemClick,
  valueFormatter,
  secondaryValueFormatter,
  colors,
  ariaLabel,
}: {
  type: Extract<MetricChartType, 'column' | 'line' | 'scatter' | 'bubble'>;
  data: MetricChartDatum[];
  activeId?: string;
  onItemClick?: (item: MetricChartDatum) => void;
  valueFormatter: (value: number) => string;
  secondaryValueFormatter: (value: number) => string;
  colors: string[];
  ariaLabel: string;
}) => {
  const { min, max, range } = getChartRange(data);
  const innerWidth = SVG_WIDTH - SVG_PAD.left - SVG_PAD.right;
  const innerHeight = SVG_HEIGHT - SVG_PAD.top - SVG_PAD.bottom;
  const zeroY = SVG_PAD.top + (max / range) * innerHeight;
  const labelStep = Math.max(1, Math.ceil(data.length / 6));
  const points = data.map((item, index) => getPoint(index, item, data));
  const linePoints = points.map((point) => `${point.x},${point.y}`).join(' ');
  const secondaryMax = Math.max(...data.map((item) => Math.max(finiteValue(item.secondaryValue), 0)), 1);

  return (
    <div className="orb-metric-svg-wrap">
      <svg className="orb-metric-svg" viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} role="img" aria-label={ariaLabel}>
        <line className="orb-metric-axis" x1={SVG_PAD.left} y1={zeroY} x2={SVG_WIDTH - SVG_PAD.right} y2={zeroY} />
        <line className="orb-metric-grid" x1={SVG_PAD.left} y1={SVG_PAD.top} x2={SVG_PAD.left} y2={SVG_HEIGHT - SVG_PAD.bottom} />
        {(type === 'column') && data.map((item, index) => {
          const point = points[index];
          const value = finiteValue(item.value);
          const height = Math.max(Math.abs(point.y - zeroY), value === 0 ? 2 : 0);
          const x = point.x - Math.min(18, innerWidth / Math.max(data.length * 2, 1));
          const width = Math.min(36, Math.max(10, innerWidth / Math.max(data.length * 1.8, 1)));
          const isActive = activeId === item.id;
          return (
            <g key={getItemKey(item, index)} {...InteractiveProps({ item, onItemClick })} aria-label={`${item.label}: ${valueFormatter(value)}`}>
              <rect className={`orb-metric-column${isActive ? ' is-active' : ''}`} x={x} y={Math.min(point.y, zeroY)} width={width} height={height} rx={4} fill={getChartColor(item, index, colors)} />
              <title>{item.label}: {valueFormatter(value)}</title>
              {(index % labelStep === 0 || data.length <= 6) && <text className="orb-metric-svg-label" x={point.x} y={SVG_HEIGHT - 14} textAnchor="middle">{truncateLabel(item.label)}</text>}
            </g>
          );
        })}
        {(type === 'line' || type === 'scatter' || type === 'bubble') && (
          <>
            {type === 'line' && <polyline className="orb-metric-line" fill="none" points={linePoints} stroke={colors[0]} />}
            {data.map((item, index) => {
              const point = points[index];
              const isActive = activeId === item.id;
              const radius = type === 'bubble' ? 7 + (Math.max(finiteValue(item.secondaryValue), 0) / secondaryMax) * 12 : type === 'scatter' ? 5 : 4;
              return (
                <g key={getItemKey(item, index)} {...InteractiveProps({ item, onItemClick })} aria-label={`${item.label}: ${valueFormatter(finiteValue(item.value))}`}>
                  {type === 'line' && <circle className={`orb-metric-point${isActive ? ' is-active' : ''}`} cx={point.x} cy={point.y} r={isActive ? 6 : 4} fill={getChartColor(item, index, colors)} />}
                  {type !== 'line' && <circle className={`orb-metric-point${isActive ? ' is-active' : ''}`} cx={point.x} cy={point.y} r={radius} fill={getChartColor(item, index, colors)} opacity={type === 'bubble' ? 0.82 : 0.9} />}
                  <title>{item.label}: {valueFormatter(finiteValue(item.value))}{type === 'bubble' && item.secondaryValue !== undefined ? ` · Size: ${secondaryValueFormatter(finiteValue(item.secondaryValue))}` : ''}</title>
                  {(index % labelStep === 0 || data.length <= 6) && <text className="orb-metric-svg-label" x={point.x} y={Math.max(SVG_PAD.top + 8, point.y - radius - 7)} textAnchor="middle">{truncateLabel(item.label)}</text>}
                </g>
              );
            })}
          </>
        )}
        <text className="orb-metric-axis-label" x={SVG_PAD.left} y={SVG_PAD.top - 5}>{valueFormatter(max)}</text>
        {min < 0 && <text className="orb-metric-axis-label" x={SVG_PAD.left} y={SVG_HEIGHT - SVG_PAD.bottom + 14}>{valueFormatter(min)}</text>}
      </svg>
    </div>
  );
};

const CircularChart = ({
  type,
  data,
  activeId,
  onItemClick,
  valueFormatter,
  colors,
  ariaLabel,
}: {
  type: 'pie' | 'donut';
  data: MetricChartDatum[];
  activeId?: string;
  onItemClick?: (item: MetricChartDatum) => void;
  valueFormatter: (value: number) => string;
  colors: string[];
  ariaLabel: string;
}) => {
  const positiveData = data.map((item) => ({ ...item, value: Math.max(finiteValue(item.value), 0) }));
  const total = positiveData.reduce((sum, item) => sum + item.value, 0);
  const radius = 72;
  const center = 92;
  let angle = 0;
  return (
    <div className="orb-metric-circular">
      <svg className="orb-metric-donut" viewBox="0 0 184 184" role="img" aria-label={ariaLabel}>
        {positiveData.map((item, index) => {
          const sweep = (item.value / total) * 360;
          const start = angle;
          angle += sweep;
          const isActive = activeId === item.id;
          const path = sweep >= 359.9
            ? undefined
            : describeSlice(center, center, radius, type === 'donut' ? 46 : 0, start, start + sweep);
          const props = InteractiveProps({ item, onItemClick });
          return path ? (
            <path key={getItemKey(item, index)} className={`orb-metric-slice${isActive ? ' is-active' : ''}`} d={path} fill={getChartColor(item, index, colors)} {...props}>
              <title>{item.label}: {valueFormatter(item.value)} ({((item.value / total) * 100).toFixed(1)}%)</title>
            </path>
          ) : (
            <circle key={getItemKey(item, index)} className={`orb-metric-slice${isActive ? ' is-active' : ''}`} cx={center} cy={center} r={type === 'donut' ? 60 : radius} fill={type === 'donut' ? 'none' : getChartColor(item, index, colors)} stroke={type === 'donut' ? getChartColor(item, index, colors) : undefined} strokeWidth={28} {...props}>
              <title>{item.label}: {valueFormatter(item.value)} (100%)</title>
            </circle>
          );
        })}
        {type === 'donut' && <circle cx={center} cy={center} r={44} fill="var(--orb-surface)" />}
        {type === 'donut' && <text className="orb-metric-donut-total" x={center} y={center + 5} textAnchor="middle">{valueFormatter(total)}</text>}
      </svg>
      <div className="orb-metric-legend" role="list" aria-label="Chart legend">
        {positiveData.map((item, index) => {
          const isActive = activeId === item.id;
          return (
            <button key={getItemKey(item, index)} type="button" className={`orb-metric-legend-item${isActive ? ' is-active' : ''}`} onClick={() => onItemClick?.(item)} disabled={!onItemClick} title={item.label}>
              <span className="orb-metric-legend-dot" style={{ backgroundColor: getChartColor(item, index, colors) }} />
              <span className="orb-metric-legend-label">{item.label}</span>
              <strong>{((item.value / total) * 100).toFixed(0)}%</strong>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const ListChart = ({
  data,
  activeId,
  onItemClick,
  valueFormatter,
  secondaryValueFormatter,
}: {
  data: MetricChartDatum[];
  activeId?: string;
  onItemClick?: (item: MetricChartDatum) => void;
  valueFormatter: (value: number) => string;
  secondaryValueFormatter: (value: number) => string;
}) => (
  <div className="orb-metric-list" role="list" aria-label="Chart data">
    {data.map((item, index) => {
      const content = <><span className="orb-metric-list-label" title={item.label}>{item.label}</span><span className="orb-metric-list-value">{valueFormatter(finiteValue(item.value))}</span>{item.secondaryValue !== undefined && <span className="orb-metric-list-secondary">{secondaryValueFormatter(finiteValue(item.secondaryValue))}</span>}</>;
      return onItemClick ? <button key={getItemKey(item, index)} type="button" className={`orb-metric-list-row${activeId === item.id ? ' is-active' : ''}`} onClick={() => onItemClick(item)} aria-pressed={activeId === item.id}>{content}</button> : <div key={getItemKey(item, index)} className={`orb-metric-list-row${activeId === item.id ? ' is-active' : ''}`} role="listitem">{content}</div>;
    })}
  </div>
);

export const CMetricChartCard = ({
  title,
  subtitle,
  data = [],
  chartType = 'bar',
  onChartTypeChange,
  onItemClick,
  activeId,
  valueFormatter = formatDefaultValue,
  secondaryValueFormatter = formatDefaultValue,
  valueLabel,
  secondaryValueLabel,
  emptyState,
  loading = false,
  error,
  maxItems = 8,
  showChartTypeControl = true,
  chartTypeOptions,
  chartTypeLabels,
  footer,
  ariaLabel,
  className,
  style,
  sx,
}: CMetricChartCardProps) => {
  const tokens = useOrbTokens();
  const [internalChartType, setInternalChartType] = useState<MetricChartType>(chartType);
  const [showAll, setShowAll] = useState(false);
  useEffect(() => setInternalChartType(chartType), [chartType]);

  const currentChartType = internalChartType;
  const colors = useMemo(() => [tokens.chart1, tokens.chart2, tokens.chart3, tokens.chart4, tokens.chart5, tokens.chart6], [tokens]);
  const visibleData = useMemo(() => showAll ? data : data.slice(0, Math.max(1, maxItems)), [data, maxItems, showAll]);
  const overflowCount = Math.max(0, data.length - visibleData.length);
  const hasPieData = visibleData.some((item) => finiteValue(item.value) > 0);
  const hasData = visibleData.length > 0 && (currentChartType !== 'pie' && currentChartType !== 'donut' ? true : hasPieData);
  const options = (chartTypeOptions ?? [currentChartType, 'bar', 'column', 'line', 'pie', 'donut', 'scatter', 'bubble', 'list']).filter((item, index, source) => METRIC_CHART_TYPES.includes(item) && source.indexOf(item) === index);
  const labels = { ...DEFAULT_CHART_LABELS, ...chartTypeLabels };
  const first = visibleData[0];
  const resolvedAriaLabel = ariaLabel ?? `${title} ${labels[currentChartType]} chart`;
  const setChartType = (next: MetricChartType) => {
    setInternalChartType(next);
    onChartTypeChange?.(next);
  };

  const body = currentChartType === 'metric' ? (
    <div className="orb-metric-kpi" role="img" aria-label={resolvedAriaLabel}>
      <span className="orb-metric-kpi-label">{first?.label ?? valueLabel ?? 'Value'}</span>
      <strong>{first ? valueFormatter(finiteValue(first.value)) : '—'}</strong>
      {first?.secondaryValue !== undefined && <span className="orb-metric-kpi-secondary">{secondaryValueLabel ?? 'Compared with'} · {secondaryValueFormatter(finiteValue(first.secondaryValue))}</span>}
    </div>
  ) : currentChartType === 'progress' ? (
    <ProgressRows data={visibleData} activeId={activeId} onItemClick={onItemClick} valueFormatter={valueFormatter} colors={colors} />
  ) : currentChartType === 'bar' ? (
    <HorizontalBars data={visibleData} activeId={activeId} onItemClick={onItemClick} valueFormatter={valueFormatter} colors={colors} />
  ) : currentChartType === 'list' ? (
    <ListChart data={visibleData} activeId={activeId} onItemClick={onItemClick} valueFormatter={valueFormatter} secondaryValueFormatter={secondaryValueFormatter} />
  ) : currentChartType === 'pie' || currentChartType === 'donut' ? (
    <CircularChart type={currentChartType} data={visibleData} activeId={activeId} onItemClick={onItemClick} valueFormatter={valueFormatter} colors={colors} ariaLabel={resolvedAriaLabel} />
  ) : (
    <SvgChart type={currentChartType} data={visibleData} activeId={activeId} onItemClick={onItemClick} valueFormatter={valueFormatter} secondaryValueFormatter={secondaryValueFormatter} colors={colors} ariaLabel={resolvedAriaLabel} />
  );

  return (
    <CPaper elevation={1} variant="outlined" className={`orb-metric-chart-card ${className ?? ''}`} style={style} sx={sx}>
      <div className="orb-metric-chart-header">
        <div className="orb-metric-chart-heading">
          <CTypography variant="subtitle1" component="h3" noWrap title={title}>{title}</CTypography>
          {subtitle && <CTypography variant="caption" muted component="div" noWrap>{subtitle}</CTypography>}
        </div>
        {showChartTypeControl && options.length > 1 && (
          <CSelect
            aria-label={`${title} chart type`}
            className="orb-metric-chart-select"
            value={currentChartType}
            options={options.map((option) => ({ value: option, label: labels[option] }))}
            onChange={(event) => setChartType(event.target.value as MetricChartType)}
            minWidth={108}
            fullWidth={false}
            size="small"
          />
        )}
      </div>
      <div className="orb-metric-chart-body">
        <LoadingOrEmpty loading={loading} error={error} hasData={hasData} emptyState={emptyState}>
          {body}
        </LoadingOrEmpty>
        {overflowCount > 0 && !loading && !error && (
          <button type="button" className="orb-metric-more" onClick={() => setShowAll((current) => !current)}>
            {showAll ? 'Show fewer' : `Show all ${data.length}`}
          </button>
        )}
      </div>
      {footer && <div className="orb-metric-chart-footer">{footer}</div>}
    </CPaper>
  );
};

CMetricChartCard.displayName = 'CMetricChartCard';
