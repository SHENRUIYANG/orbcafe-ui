import { FormControl } from '../../../lib/orbis-compat';
import React, { useMemo } from 'react';
import {  CTypography, CSelect } from "../../Atoms";
import type { ValueZoneItem } from '../pivotModel';
import type { PivotChartType, PivotFieldDefinition } from '../types';
import { formatAggregatedValue } from '../pivotUtils';
import { useOrbcafeI18n } from '../../../i18n';
import { PivotSectionCard } from '../components/PivotSectionCard';
import { PivotScatterChart } from './PivotScatterChart';
import { PivotSeriesChart } from './PivotSeriesChart';
import {
  buildPivotChartData,
  buildPivotChartDimensionOptions,
  buildPivotChartValueOptions,
} from './pivotChartUtils';

interface PivotChartPanelProps {
  rows: Record<string, unknown>[];
  fieldMap: Map<string, PivotFieldDefinition>;
  rowFields: string[];
  columnFields: string[];
  valueFields: ValueZoneItem[];
  chartDimensionFieldId: string;
  chartPrimaryValueFieldId: string;
  chartSecondaryValueFieldId: string;
  chartType: PivotChartType;
  isCollapsed: boolean;
  onChartDimensionFieldIdChange: (fieldId: string) => void;
  onChartPrimaryValueFieldIdChange: (fieldId: string) => void;
  onChartSecondaryValueFieldIdChange: (fieldId: string) => void;
  onChartTypeChange: (chartType: PivotChartType) => void;
  onToggleCollapse: () => void;
  getAggregationLabel: (aggregation: ValueZoneItem['aggregation']) => string;
}

export const PivotChartPanel: React.FC<PivotChartPanelProps> = ({
  rows,
  fieldMap,
  rowFields,
  columnFields,
  valueFields,
  chartDimensionFieldId,
  chartPrimaryValueFieldId,
  chartSecondaryValueFieldId,
  chartType,
  isCollapsed,
  onChartDimensionFieldIdChange,
  onChartPrimaryValueFieldIdChange,
  onChartSecondaryValueFieldIdChange,
  onChartTypeChange,
  onToggleCollapse,
  getAggregationLabel,
}) => {
  const { t } = useOrbcafeI18n();

  const dimensionOptions = useMemo(
    () => buildPivotChartDimensionOptions(rowFields, columnFields, fieldMap),
    [columnFields, fieldMap, rowFields],
  );
  const valueOptions = useMemo(
    () => buildPivotChartValueOptions(valueFields, fieldMap, getAggregationLabel),
    [fieldMap, getAggregationLabel, valueFields],
  );

  const primaryValue = valueOptions.find((option) => option.fieldId === chartPrimaryValueFieldId) ?? valueOptions[0];
  const secondaryValue =
    valueOptions.find(
      (option) => option.fieldId === chartSecondaryValueFieldId && option.fieldId !== primaryValue?.fieldId,
    ) ?? null;
  const selectedDimension =
    dimensionOptions.find((option) => option.fieldId === chartDimensionFieldId) ?? dimensionOptions[0];
  const subtitle =
    selectedDimension && primaryValue
      ? t('pivot.chart.subtitleReady', {
          dimension: selectedDimension.label,
          measure: secondaryValue ? `${primaryValue.label} / ${secondaryValue.label}` : primaryValue.label,
        })
      : t('pivot.chart.subtitle');

  const chartData = useMemo(() => {
    if (!selectedDimension || !primaryValue) {
      return [];
    }
    return buildPivotChartData({
      rows,
      dimensionFieldId: selectedDimension.fieldId,
      primaryValue: primaryValue.item,
      secondaryValue: secondaryValue?.item,
    });
  }, [primaryValue, rows, secondaryValue, selectedDimension]);

  const formatPrimaryValue = (value: number) => {
    if (!primaryValue) {
      return value.toLocaleString();
    }
    return formatAggregatedValue(value, primaryValue.item, fieldMap);
  };

  const formatSecondaryValue = (value: number) => {
    if (!secondaryValue) {
      return value.toLocaleString();
    }
    return formatAggregatedValue(value, secondaryValue.item, fieldMap);
  };

  const showSelectionToolbar = dimensionOptions.length > 1 || valueOptions.length > 1;

  return (
    <PivotSectionCard
      title={t('pivot.chart.title')}
      subtitle={subtitle}
      collapsed={isCollapsed}
      onToggleCollapse={onToggleCollapse}
      expandAriaLabel={t('pivot.chart.collapse.ariaExpand')}
      collapseAriaLabel={t('pivot.chart.collapse.ariaCollapse')}
      bodySx={{ display: 'flex', flexDirection: 'column', gap: 1.1 }}
    >
      {showSelectionToolbar && (
        <div
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(4, minmax(0, 1fr))' },
            gap: 1,
            alignItems: 'start',
          }}
        >
          <FormControl size="small" sx={{ minWidth: 0, width: '100%' }}>
            <CTypography sx={{ fontSize: '0.68rem', color: 'text.secondary', mb: 0.45 }}>
              {t('pivot.chart.dimension')}
            </CTypography>
            <CSelect
              value={selectedDimension?.fieldId ?? ''}
              onChange={(event) => onChartDimensionFieldIdChange(String(event.target.value))}
              sx={{ fontSize: '0.75rem', height: 32 }}
            >
              {dimensionOptions.map((option) => (
                <option key={option.fieldId} value={option.fieldId} sx={{ fontSize: '0.75rem' }}>
                  {option.label}
                </option>
              ))}
            </CSelect>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 0, width: '100%' }}>
            <CTypography sx={{ fontSize: '0.68rem', color: 'text.secondary', mb: 0.45 }}>
              {t('pivot.chart.primaryMeasure')}
            </CTypography>
            <CSelect
              value={primaryValue?.fieldId ?? ''}
              onChange={(event) => onChartPrimaryValueFieldIdChange(String(event.target.value))}
              sx={{ fontSize: '0.75rem', height: 32 }}
            >
              {valueOptions.map((option) => (
                <option key={option.fieldId} value={option.fieldId} sx={{ fontSize: '0.75rem' }}>
                  {option.label}
                </option>
              ))}
            </CSelect>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 0, width: '100%' }}>
            <CTypography sx={{ fontSize: '0.68rem', color: 'text.secondary', mb: 0.45 }}>
              {t('pivot.chart.secondaryMeasure')}
            </CTypography>
            <CSelect
              value={secondaryValue?.fieldId ?? ''}
              onChange={(event) => onChartSecondaryValueFieldIdChange(String(event.target.value))}
              sx={{ fontSize: '0.75rem', height: 32 }}
            >
              <option value="" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                {t('common.none')}
              </option>
              {valueOptions
                .filter((option) => option.fieldId !== primaryValue?.fieldId)
                .map((option) => (
                  <option key={option.fieldId} value={option.fieldId} sx={{ fontSize: '0.75rem' }}>
                    {option.label}
                  </option>
                ))}
            </CSelect>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 0, width: '100%' }}>
            <CTypography sx={{ fontSize: '0.68rem', color: 'text.secondary', mb: 0.45 }}>
              {t('pivot.chart.chartType')}
            </CTypography>
            <CSelect
              value={chartType}
              onChange={(event) => onChartTypeChange(event.target.value as PivotChartType)}
              sx={{ fontSize: '0.75rem', height: 32 }}
            >
              <option value="bar-vertical" sx={{ fontSize: '0.75rem' }}>
                {t('pivot.chart.style.barVertical')}
              </option>
              <option value="bar-horizontal" sx={{ fontSize: '0.75rem' }}>
                {t('pivot.chart.style.barHorizontal')}
              </option>
              <option value="line" sx={{ fontSize: '0.75rem' }}>
                {t('pivot.chart.style.line')}
              </option>
              <option value="scatter" sx={{ fontSize: '0.75rem' }}>
                {t('pivot.chart.style.scatter')}
              </option>
            </CSelect>
          </FormControl>
        </div>
      )}

      <div>
        {!selectedDimension ? (
          <div sx={{ py: 5, textAlign: 'center' }}>
            <CTypography sx={{ fontSize: '0.86rem', color: 'text.secondary' }}>{t('pivot.chart.emptyNoDimension')}</CTypography>
          </div>
        ) : !primaryValue ? (
          <div sx={{ py: 5, textAlign: 'center' }}>
            <CTypography sx={{ fontSize: '0.86rem', color: 'text.secondary' }}>{t('pivot.chart.emptyNoValue')}</CTypography>
          </div>
        ) : chartData.length === 0 ? (
          <div sx={{ py: 5, textAlign: 'center' }}>
            <CTypography sx={{ fontSize: '0.86rem', color: 'text.secondary' }}>{t('pivot.chart.emptyNoData')}</CTypography>
          </div>
        ) : chartType === 'scatter' ? (
          <PivotScatterChart
            data={chartData}
            primaryLabel={primaryValue.label}
            secondaryLabel={secondaryValue?.label}
            formatPrimaryValue={formatPrimaryValue}
            formatSecondaryValue={formatSecondaryValue}
          />
        ) : (
          <PivotSeriesChart
            data={chartData}
            chartType={chartType}
            primaryLabel={primaryValue.label}
            secondaryLabel={secondaryValue?.label}
            formatPrimaryValue={formatPrimaryValue}
            formatSecondaryValue={formatSecondaryValue}
          />
        )}
      </div>
    </PivotSectionCard>
  );
};
