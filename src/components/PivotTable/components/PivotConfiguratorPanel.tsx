import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import FunctionsIcon from '@mui/icons-material/Functions';
import FilterListIcon from '@mui/icons-material/FilterList';
import TableRowsIcon from '@mui/icons-material/TableRows';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { AxisZone, ValueZoneItem } from '../pivotModel';
import type { PivotAggregation, PivotFieldDefinition } from '../types';
import { DropZone } from './DropZone';
import { FieldPaletteToken } from './FieldPaletteToken';
import { PivotSectionCard } from './PivotSectionCard';
import { SortableZoneToken } from './SortableZoneToken';
import { useOrbcafeI18n } from '../../../i18n';

const zoneIconMap: Record<AxisZone | 'values', React.ReactNode> = {
  rows: <TableRowsIcon fontSize="small" />,
  columns: <ViewColumnIcon fontSize="small" />,
  filters: <FilterListIcon fontSize="small" />,
  values: <FunctionsIcon fontSize="small" />,
};

interface PivotConfiguratorPanelProps {
  isConfiguratorCollapsed: boolean;
  onToggleCollapse: () => void;
  availableFields: PivotFieldDefinition[];
  fieldMap: Map<string, PivotFieldDefinition>;
  filterFields: string[];
  columnFields: string[];
  rowFields: string[];
  valueFields: ValueZoneItem[];
  clearZone: (zone: AxisZone | 'values') => void;
  removeFieldFromZone: (zone: AxisZone | 'values', key: string) => void;
  getFilterSelectionSummary: (fieldId: string) => string;
  renderDimensionFilterSelect: (fieldId: string) => React.ReactNode;
  renderAggregationSelect: (item: ValueZoneItem) => React.ReactNode;
  getAggregationLabel: (aggregation: PivotAggregation) => string;
}

export const PivotConfiguratorPanel: React.FC<PivotConfiguratorPanelProps> = ({
  isConfiguratorCollapsed,
  onToggleCollapse,
  availableFields,
  fieldMap,
  filterFields,
  columnFields,
  rowFields,
  valueFields,
  clearZone,
  removeFieldFromZone,
  getFilterSelectionSummary,
  renderDimensionFilterSelect,
  renderAggregationSelect,
  getAggregationLabel,
}) => {
  const { t } = useOrbcafeI18n();
  const summary = [
    `${t('pivot.zone.rows')} ${rowFields.length}`,
    `${t('pivot.zone.columns')} ${columnFields.length}`,
    `${t('pivot.zone.filters')} ${filterFields.length}`,
    `${t('pivot.zone.values')} ${valueFields.length}`,
  ].join(' · ');

  return (
    <PivotSectionCard
      title={t('pivot.config.title')}
      subtitle={summary}
      collapsed={isConfiguratorCollapsed}
      onToggleCollapse={onToggleCollapse}
      expandAriaLabel={t('pivot.collapse.ariaExpand')}
      collapseAriaLabel={t('pivot.collapse.ariaCollapse')}
      unmountOnExit
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '260px 1fr' },
          gap: 2,
        }}
      >
        <DropZone
          zone="palette"
          title={t('pivot.fieldList')}
          hint={t('pivot.availableDimensions')}
          itemCount={availableFields.length}
          icon={<DragIndicatorIcon sx={{ fontSize: 16, color: 'text.secondary' }} />}
        >
          <Stack spacing={0.8} sx={{ maxHeight: 400, overflowY: 'auto', pr: 0.5 }}>
            {availableFields.length === 0 && (
              <Typography sx={{ fontSize: '0.74rem', color: 'text.secondary', py: 1 }}>{t('pivot.allFieldsInUse')}</Typography>
            )}
            {availableFields.map((field) => (
              <FieldPaletteToken
                key={field.id}
                id={`item|palette|${field.id}`}
                label={field.label}
                subtitle={field.type ?? 'string'}
              />
            ))}
          </Stack>
        </DropZone>

        <Stack spacing={2}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <DropZone
              zone="filters"
              title={t('pivot.zone.filters')}
              hint={t('pivot.hint.filters')}
              icon={zoneIconMap.filters}
              itemCount={filterFields.length}
              onClear={() => clearZone('filters')}
            >
              <SortableContext items={filterFields.map((fieldId) => `item|filters|${fieldId}`)} strategy={verticalListSortingStrategy}>
                <Stack spacing={0.7}>
                  {filterFields.map((fieldId) => (
                    <SortableZoneToken
                      key={fieldId}
                      id={`item|filters|${fieldId}`}
                      label={fieldMap.get(fieldId)?.label ?? fieldId}
                      caption={getFilterSelectionSummary(fieldId)}
                      trailing={renderDimensionFilterSelect(fieldId)}
                      onRemove={() => removeFieldFromZone('filters', fieldId)}
                    />
                  ))}
                </Stack>
              </SortableContext>
            </DropZone>

            <DropZone
              zone="columns"
              title={t('pivot.zone.columns')}
              hint={t('pivot.hint.columns')}
              icon={zoneIconMap.columns}
              itemCount={columnFields.length}
              onClear={() => clearZone('columns')}
            >
              <SortableContext items={columnFields.map((fieldId) => `item|columns|${fieldId}`)} strategy={verticalListSortingStrategy}>
                <Stack spacing={0.7}>
                  {columnFields.map((fieldId) => (
                    <SortableZoneToken
                      key={fieldId}
                      id={`item|columns|${fieldId}`}
                      label={fieldMap.get(fieldId)?.label ?? fieldId}
                      caption={`${fieldMap.get(fieldId)?.type ?? 'dimension'} • ${getFilterSelectionSummary(fieldId)}`}
                      trailing={renderDimensionFilterSelect(fieldId)}
                      onRemove={() => removeFieldFromZone('columns', fieldId)}
                    />
                  ))}
                </Stack>
              </SortableContext>
            </DropZone>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <DropZone
              zone="rows"
              title={t('pivot.zone.rows')}
              hint={t('pivot.hint.rows')}
              icon={zoneIconMap.rows}
              itemCount={rowFields.length}
              onClear={() => clearZone('rows')}
            >
              <SortableContext items={rowFields.map((fieldId) => `item|rows|${fieldId}`)} strategy={verticalListSortingStrategy}>
                <Stack spacing={0.7}>
                  {rowFields.map((fieldId) => (
                    <SortableZoneToken
                      key={fieldId}
                      id={`item|rows|${fieldId}`}
                      label={fieldMap.get(fieldId)?.label ?? fieldId}
                      caption={`${fieldMap.get(fieldId)?.type ?? 'dimension'} • ${getFilterSelectionSummary(fieldId)}`}
                      trailing={renderDimensionFilterSelect(fieldId)}
                      onRemove={() => removeFieldFromZone('rows', fieldId)}
                    />
                  ))}
                </Stack>
              </SortableContext>
            </DropZone>

            <DropZone
              zone="values"
              title={t('pivot.zone.values')}
              hint={t('pivot.hint.values')}
              icon={zoneIconMap.values}
              itemCount={valueFields.length}
              onClear={() => clearZone('values')}
            >
              <SortableContext items={valueFields.map((item) => `item|values|${item.tokenId}`)} strategy={verticalListSortingStrategy}>
                <Stack spacing={0.7}>
                  {valueFields.map((item) => {
                    const fieldLabel = fieldMap.get(item.fieldId)?.label ?? item.fieldId;
                    const caption = `${getAggregationLabel(item.aggregation)}(${fieldLabel})`;
                    return (
                      <SortableZoneToken
                        key={item.tokenId}
                        id={`item|values|${item.tokenId}`}
                        label={fieldLabel}
                        caption={caption}
                        trailing={renderAggregationSelect(item)}
                        onRemove={() => removeFieldFromZone('values', item.tokenId)}
                      />
                    );
                  })}
                </Stack>
              </SortableContext>
            </DropZone>
          </Box>
        </Stack>
      </Box>
    </PivotSectionCard>
  );
};
