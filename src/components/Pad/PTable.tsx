'use client';

import React from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import type { PTableProps } from './types';
import { PSmartFilter } from './PSmartFilter';
import { CTableToolbar } from '../StdReport/Components/CTableToolbar';
import { CTableColumnMenu, CTableContextMenu, CTableGroupMenu, CTableSummaryMenu } from '../StdReport/Components/CTableMenu';
import { CLayoutManager } from '../StdReport/CLayoutManager';
import { CGraphReport } from '../GraphReport/CGraphReport';
import { useGraphInteraction } from '../GraphReport/Hooks/useGraphInteraction';
import { useGraphReport } from '../GraphReport/Hooks/useGraphReport';
import { CMessageBox } from '../Molecules/CMessageBox';
import { useCTable } from '../StdReport/Hooks/CTable/useCTable';
import { useOrbcafeI18n } from '../../i18n';

const getCellValue = (column: any, row: Record<string, any>) => {
  const raw = row[column.id];
  if (column.render) {
    return column.render(raw, row);
  }
  if (raw === null || raw === undefined || raw === '') return '--';
  if (column.numeric) {
    if (typeof raw === 'number') return raw.toLocaleString();
    if (typeof raw === 'string' && raw.trim() !== '' && !Number.isNaN(Number(raw))) {
      return Number(raw).toLocaleString();
    }
  }
  return String(raw);
};

const renderCellValue = (value: React.ReactNode) => {
  if (React.isValidElement(value)) {
    return <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>{value}</Box>;
  }
  return (
    <Typography sx={{ mt: 0.2, fontSize: '0.88rem', fontWeight: 800 }}>
      {value}
    </Typography>
  );
};

const getCellText = (column: any, row: Record<string, any>) => {
  const raw = row[column.id];
  if (raw === null || raw === undefined || raw === '') return '--';
  if (column.numeric) {
    if (typeof raw === 'number') return raw.toLocaleString();
    if (typeof raw === 'string' && raw.trim() !== '' && !Number.isNaN(Number(raw))) {
      return Number(raw).toLocaleString();
    }
  }
  return String(raw);
};

const PTableSummaryPanel = ({
  summaryRow,
  visibleColumns,
  columns,
}: {
  summaryRow: Record<string, any>;
  visibleColumns: string[];
  columns: any[];
}) => {
  const summaryColumns = columns.filter((column) => visibleColumns.includes(column.id) && summaryRow[column.id] !== '');
  if (summaryColumns.length === 0) return null;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'action.hover',
      }}
    >
      <Stack spacing={1}>
        <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: 'text.secondary' }}>Summary</Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(132px, 1fr))',
            gap: 1,
          }}
        >
          {summaryColumns.map((column) => (
            <Paper
              key={`summary-${column.id}`}
              elevation={0}
              sx={{
                p: 1.1,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>{column.label}</Typography>
              <Typography sx={{ mt: 0.25, fontSize: '0.96rem', fontWeight: 800 }}>{summaryRow[column.id]}</Typography>
            </Paper>
          ))}
        </Box>
      </Stack>
    </Paper>
  );
};

export const PTable: React.FC<PTableProps> = (props) => {
  const { t } = useOrbcafeI18n();
  const theme = useTheme();
  const {
    title: titleProp,
    showToolbar = true,
    selectionMode,
    selected = [],
    onSelectionChange,
    actions,
    extraTools,
    fitContainer = false,
    fullWidth = false,
    maxHeight,
    loading = false,
    rowsPerPageOptions = [20, 50, 100, -1],
    onLayoutSave,
    filterConfig,
    rowKey,
    tableKey = 'default',
    graphReport,
    quickCreate,
    quickEdit,
    quickDelete,
    serviceUrl,
    orientation = 'auto',
    cardTitleField,
    cardSubtitleFields,
    toolbarSlot,
    emptyState,
    rowHeight = 'comfortable',
    cardActionSlot,
    renderCardFooter,
    onRowClick,
  } = props;

  const title = titleProp || t('table.title.default');
  const isPortraitViewport = useMediaQuery('(orientation: portrait)');
  const isCompactViewport = useMediaQuery(theme.breakpoints.down('md'));
  const resolvedOrientation =
    orientation === 'auto' ? (isPortraitViewport || isCompactViewport ? 'portrait' : 'landscape') : orientation;

  const {
    columns,
    filterText,
    setFilterText,
    visibleColumns,
    showSummary,
    setShowSummary,
    summaryColumns,
    grouping,
    setGrouping,
    expandedGroups,
    groupAnchorEl,
    setGroupAnchorEl,
    summaryAnchorEl,
    setSummaryAnchorEl,
    anchorEl,
    setAnchorEl,
    contextMenu,
    sortedAndFilteredRows,
    summaryRow,
    visibleRows,
    page: tablePage,
    setPage: setTablePage,
    rowsPerPage: tableRowsPerPage,
    setRowsPerPage: setTableRowsPerPage,
    totalDisplayCount,
    setSelected: setTableSelected,
    handleClick,
    toggleSummaryColumn,
    handleExport,
    handleCloseContextMenu,
    toggleColumnVisibility,
    toggleGroupExpand,
    toggleGroupField,
    handleExpandGroupRecursively,
    handleCollapseGroupRecursively,
    handleLayoutLoad,
    handleVariantLoad,
    handleLayoutSave,
    effectiveAppId,
    currentLayoutData,
    currentLayoutId,
    layoutIdToLoad,
    graphReportOpen,
    handleOpenGraphReport,
    handleCloseGraphReport,
  } = useCTable(props);

  const graphReportEnabled = graphReport?.enabled ?? false;
  const graphInteractionEnabled = graphReportEnabled && (graphReport?.interaction?.enabled ?? true);
  const graphInteraction = useGraphInteraction();
  const rowKeyField = rowKey || 'id';

  const selectedRows = React.useMemo(() => {
    const selectedSet = new Set(selected as any[]);
    return (sortedAndFilteredRows as any[]).filter((row: any) => selectedSet.has(row?.[rowKeyField]));
  }, [rowKeyField, selected, sortedAndFilteredRows]);

  const selectedEditRow = selectedRows.length === 1 ? selectedRows[0] : null;
  const quickCreateEnabled = Boolean(quickCreate?.enabled);
  const quickEditEnabled = Boolean(quickEdit?.enabled);
  const quickDeleteEnabled = Boolean(quickDelete?.enabled);
  const quickCreateFieldIds = quickCreate?.fields;
  const quickCreateExcludedFields = quickCreate?.excludeFields || [];
  const quickCreateInitialValues = quickCreate?.initialValues || {};
  const quickEditFieldIds = quickEdit?.fields;
  const quickEditExcludedFields = quickEdit?.excludeFields || [];
  const quickEditEditableFields = quickEdit?.editableFields || [];
  const quickEditNonEditableFields = quickEdit?.nonEditableFields || [];
  const quickEditPrimaryKeys = quickEdit?.primaryKeys?.length ? quickEdit.primaryKeys : [rowKeyField];

  const [quickCreateOpen, setQuickCreateOpen] = React.useState(false);
  const [quickCreateSubmitting, setQuickCreateSubmitting] = React.useState(false);
  const [quickCreateValues, setQuickCreateValues] = React.useState<Record<string, any>>({});
  const [quickEditOpen, setQuickEditOpen] = React.useState(false);
  const [quickEditSubmitting, setQuickEditSubmitting] = React.useState(false);
  const [quickEditValues, setQuickEditValues] = React.useState<Record<string, any>>({});
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = React.useState(false);
  const isBusy = loading || quickCreateSubmitting || quickEditSubmitting || deleteSubmitting;

  const quickCreateColumns = React.useMemo(() => {
    let nextColumns = [...columns];
    if (Array.isArray(quickCreateFieldIds) && quickCreateFieldIds.length > 0) {
      const idSet = new Set(quickCreateFieldIds);
      nextColumns = nextColumns.filter((column: any) => idSet.has(column.id));
    }
    if (quickCreateExcludedFields.length > 0) {
      const excluded = new Set(quickCreateExcludedFields);
      nextColumns = nextColumns.filter((column: any) => !excluded.has(column.id));
    }
    return nextColumns.filter((column: any) => Boolean(column?.id));
  }, [columns, quickCreateExcludedFields, quickCreateFieldIds]);

  const quickEditColumns = React.useMemo(() => {
    let nextColumns = [...columns];
    if (Array.isArray(quickEditFieldIds) && quickEditFieldIds.length > 0) {
      const idSet = new Set(quickEditFieldIds);
      nextColumns = nextColumns.filter((column: any) => idSet.has(column.id));
    }
    if (quickEditExcludedFields.length > 0) {
      const excluded = new Set(quickEditExcludedFields);
      nextColumns = nextColumns.filter((column: any) => !excluded.has(column.id));
    }
    return nextColumns.filter((column: any) => Boolean(column?.id));
  }, [columns, quickEditExcludedFields, quickEditFieldIds]);

  const quickEditPrimaryKeySet = React.useMemo(() => new Set(quickEditPrimaryKeys), [quickEditPrimaryKeys]);
  const quickEditEditableSet = React.useMemo(() => new Set(quickEditEditableFields), [quickEditEditableFields]);
  const quickEditNonEditableSet = React.useMemo(() => new Set(quickEditNonEditableFields), [quickEditNonEditableFields]);

  const isQuickEditFieldEditable = React.useCallback(
    (fieldId: string) => {
      if (quickEditEditableSet.size > 0) {
        return quickEditEditableSet.has(fieldId);
      }
      if (quickEditNonEditableSet.has(fieldId)) {
        return false;
      }
      if (quickEditPrimaryKeySet.has(fieldId)) {
        return false;
      }
      return true;
    },
    [quickEditEditableSet, quickEditNonEditableSet, quickEditPrimaryKeySet],
  );

  React.useEffect(() => {
    if (!graphReportOpen && graphInteraction.hasActiveFilters) {
      graphInteraction.clearAll();
    }
  }, [graphInteraction, graphReportOpen]);

  const handleOpenQuickCreateDialog = () => {
    const initialPayload: Record<string, any> = {};
    quickCreateColumns.forEach((column: any) => {
      initialPayload[column.id] = quickCreateInitialValues[column.id] ?? '';
    });
    setQuickCreateValues(initialPayload);
    setQuickCreateOpen(true);
  };

  const handleQuickCreateFieldChange = (fieldId: string, value: any) => {
    setQuickCreateValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmitQuickCreate = async () => {
    if (!quickCreate?.onSubmit) {
      setQuickCreateOpen(false);
      return;
    }
    try {
      setQuickCreateSubmitting(true);
      await quickCreate.onSubmit(quickCreateValues);
      setQuickCreateOpen(false);
    } finally {
      setQuickCreateSubmitting(false);
    }
  };

  const handleOpenQuickEditDialog = () => {
    if (!selectedEditRow) return;
    const basePayload: Record<string, any> = {};
    quickEditColumns.forEach((column: any) => {
      basePayload[column.id] = selectedEditRow[column.id] ?? '';
    });
    const initialPayload = quickEdit?.getInitialValues
      ? { ...basePayload, ...quickEdit.getInitialValues(selectedEditRow) }
      : basePayload;
    setQuickEditValues(initialPayload);
    setQuickEditOpen(true);
  };

  const handleQuickEditFieldChange = (fieldId: string, value: any) => {
    setQuickEditValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmitQuickEdit = async () => {
    if (!selectedEditRow) return;
    if (!quickEdit?.onSubmit) {
      setQuickEditOpen(false);
      return;
    }
    try {
      setQuickEditSubmitting(true);
      await quickEdit.onSubmit(quickEditValues, selectedEditRow);
      setQuickEditOpen(false);
    } finally {
      setQuickEditSubmitting(false);
    }
  };

  const handleOpenDeleteConfirm = () => {
    if (selectedRows.length === 0) return;
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedRows.length === 0) {
      setDeleteConfirmOpen(false);
      return;
    }
    if (!quickDelete?.onConfirm) {
      setDeleteConfirmOpen(false);
      setTableSelected([]);
      onSelectionChange?.([]);
      return;
    }
    try {
      setDeleteSubmitting(true);
      await quickDelete.onConfirm(selectedRows);
      setDeleteConfirmOpen(false);
      setTableSelected([]);
      onSelectionChange?.([]);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const graphSourceRows = sortedAndFilteredRows as Record<string, unknown>[];
  const { fieldMapping: graphBaseFieldMapping } = useGraphReport({
    rows: graphSourceRows,
    config: {
      ...graphReport,
      title: graphReport?.title || `${title} ${t('graph.reportTitle')}`,
    },
  });

  const graphLinkedRows = React.useMemo(
    () => (graphInteractionEnabled ? graphInteraction.applyRows(graphSourceRows, graphBaseFieldMapping) : graphSourceRows),
    [graphBaseFieldMapping, graphInteraction, graphInteractionEnabled, graphSourceRows],
  );

  const { model: graphReportModel } = useGraphReport({
    rows: graphLinkedRows,
    config: {
      ...graphReport,
      title: graphReport?.title || `${title} ${t('graph.reportTitle')}`,
      fieldMapping: graphBaseFieldMapping,
    },
  });

  const graphTableColumns = graphReportModel.table.columns.map((column) => ({
    id: column.id,
    label: column.label,
    align: column.align || 'left',
    minWidth: 120,
    numeric: column.align === 'right',
  }));

  const layoutManager = effectiveAppId ? (
    <CLayoutManager
      appId={effectiveAppId}
      tableKey={tableKey}
      currentLayoutData={currentLayoutData}
      onLayoutLoad={handleLayoutLoad}
      targetLayoutId={layoutIdToLoad}
      activeLayoutId={currentLayoutId}
      serviceUrl={serviceUrl ?? filterConfig?.serviceUrl}
    />
  ) : null;

  const visibleLeafColumns = columns.filter((column: any) => visibleColumns.includes(column.id));
  const titleColumn =
    visibleLeafColumns.find((column: any) => column.id === cardTitleField) || visibleLeafColumns[0];
  const subtitleColumns =
    (cardSubtitleFields?.map((field) => visibleLeafColumns.find((column: any) => column.id === field)).filter(Boolean) as any[]) ||
    visibleLeafColumns.filter((column: any) => column.id !== titleColumn?.id).slice(0, resolvedOrientation === 'portrait' ? 2 : 3);
  const detailColumns = visibleLeafColumns.filter(
    (column: any) => column.id !== titleColumn?.id && !subtitleColumns.some((item) => item.id === column.id),
  );

  const customToolbarNodes = [toolbarSlot, extraTools].filter(Boolean);

  const menus = (
    <>
      <CTableGroupMenu
        groupAnchorEl={groupAnchorEl}
        setGroupAnchorEl={setGroupAnchorEl}
        grouping={grouping}
        setGrouping={setGrouping}
        columns={columns}
        toggleGroupField={toggleGroupField}
      />

      <CTableColumnMenu
        anchorEl={anchorEl}
        setAnchorEl={setAnchorEl}
        columns={columns}
        visibleColumns={visibleColumns}
        toggleColumnVisibility={toggleColumnVisibility}
      />

      <CTableSummaryMenu
        anchorEl={summaryAnchorEl}
        setAnchorEl={setSummaryAnchorEl}
        showSummary={showSummary}
        setShowSummary={setShowSummary}
        columns={columns}
        summaryColumns={summaryColumns}
        toggleSummaryColumn={toggleSummaryColumn}
      />

      <CTableContextMenu
        contextMenu={contextMenu}
        handleCloseContextMenu={handleCloseContextMenu}
        columns={columns}
        visibleColumns={visibleColumns}
        toggleColumnVisibility={toggleColumnVisibility}
      />
    </>
  );

  const renderRowCard = (row: Record<string, any>, rowId: string | number, rowIndex: number) => {
    const isSelected = selected.includes(rowId);
    const detailGridColumns =
      resolvedOrientation === 'portrait' ? 'repeat(2, minmax(0, 1fr))' : 'repeat(auto-fit, minmax(140px, 1fr))';
    const rowTone = rowIndex % 2 === 0 ? alpha(theme.palette.primary.main, 0.04) : alpha(theme.palette.primary.main, 0.022);
    const subtleBorder = alpha(theme.palette.divider, 0.22);
    return (
      <Paper
        key={rowId}
        elevation={0}
        onClick={() => {
          handleClick({} as any, row);
          onRowClick?.(row);
        }}
        sx={{
          p: rowHeight === 'compact' ? 1.25 : 1.5,
          borderRadius: 4,
          border: '0.5px solid',
          borderColor: isSelected ? alpha(theme.palette.primary.main, 0.38) : subtleBorder,
          background: isSelected
            ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.13)}, ${alpha(theme.palette.primary.main, 0.06)})`
            : `linear-gradient(135deg, ${rowTone}, ${alpha(theme.palette.primary.main, 0.015)})`,
          boxShadow: isSelected ? `0 12px 30px ${alpha(theme.palette.primary.main, 0.2)}` : `0 3px 10px ${alpha(theme.palette.common.black, 0.045)}`,
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          transition: 'border-color 160ms ease, box-shadow 160ms ease, transform 120ms ease, background 160ms ease',
          '&::before': {
            content: '""',
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 4,
            background: isSelected
              ? theme.palette.primary.main
              : rowIndex % 2 === 0
                ? alpha(theme.palette.primary.main, 0.26)
                : alpha(theme.palette.text.primary, 0.16),
          },
          '&:hover': {
            boxShadow: `0 10px 20px ${alpha(theme.palette.primary.main, 0.12)}`,
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'scale(0.995)',
          },
        }}
      >
        <Stack spacing={1.25}>
          <Stack direction="row" spacing={1.25} alignItems="flex-start">
            {selectionMode ? (
              <Checkbox
                checked={isSelected}
                onClick={(event) => event.stopPropagation()}
                onChange={() => handleClick({} as any, row)}
                sx={{ mt: -0.6, ml: -0.6 }}
              />
            ) : null}

            <Box sx={{ flex: 1, minWidth: 0 }}>
              {titleColumn ? (
                <Typography sx={{ fontSize: '1rem', fontWeight: 900, lineHeight: 1.25 }}>
                  {getCellValue(titleColumn, row)}
                </Typography>
              ) : null}

              {subtitleColumns.length > 0 ? (
                <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" sx={{ mt: 0.75 }}>
                  {subtitleColumns.map((column: any) => (
                    <Chip
                      key={`${rowId}-${column.id}`}
                      label={`${column.label}: ${getCellText(column, row)}`}
                      size="small"
                      variant="outlined"
                      sx={{ borderRadius: 999, fontWeight: 600 }}
                    />
                  ))}
                </Stack>
              ) : null}
            </Box>

            {cardActionSlot ? <Box onClick={(event) => event.stopPropagation()}>{cardActionSlot(row)}</Box> : null}
          </Stack>

          {detailColumns.length > 0 ? (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: detailGridColumns,
                gap: 1,
              }}
            >
              {detailColumns.map((column: any) => (
                <Paper
                  key={`${rowId}-${column.id}-detail`}
                  elevation={0}
                  sx={{
                    p: 1,
                    borderRadius: 3,
                    bgcolor: alpha(theme.palette.background.paper, 0.8),
                    border: '0.1px solid',
                    borderColor: alpha(theme.palette.divider, 0.24),
                  }}
                >
                  <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>{column.label}</Typography>
                  {renderCellValue(getCellValue(column, row))}
                </Paper>
              ))}
            </Box>
          ) : null}

          {renderCardFooter ? (
            <>
              <Divider />
              <Box onClick={(event) => event.stopPropagation()}>{renderCardFooter(row)}</Box>
            </>
          ) : null}
        </Stack>
      </Paper>
    );
  };

  return (
    <Box
      sx={{
        width: fullWidth ? '100%' : 'auto',
        mb: fitContainer ? 0 : 2,
        ...(fitContainer
          ? {
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              height: '100%',
              overflow: 'hidden',
            }
          : {}),
      }}
    >
      {filterConfig ? (
        <Box sx={{ mb: 2 }}>
          <PSmartFilter
            {...filterConfig}
            onVariantLoad={(variant) => {
              handleVariantLoad(variant);
              filterConfig.onVariantLoad?.(variant);
            }}
            appId={filterConfig.appId}
            tableKey={tableKey}
            currentLayout={[{ tableKey, layoutData: currentLayoutData }]}
            currentLayoutId={currentLayoutId}
            layoutRefs={[{ tableKey, layoutId: currentLayoutId }]}
            variantService={filterConfig.variantService}
            serviceUrl={serviceUrl ?? filterConfig.serviceUrl}
            touchMode={resolvedOrientation === 'portrait' ? 'expanded' : 'comfortable'}
          />
        </Box>
      ) : null}

      <Paper
        sx={{
          width: fullWidth ? '100%' : 'auto',
          mb: fitContainer ? 0 : 2,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
          '&::before': isBusy
            ? {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '3px',
                background:
                  'linear-gradient(90deg, rgba(25, 118, 210, 0) 0%, rgba(25, 118, 210, 0.25) 25%, rgba(25, 118, 210, 1) 50%, rgba(25, 118, 210, 0.25) 75%, rgba(25, 118, 210, 0) 100%)',
                backgroundSize: '220% 100%',
                animation: 'cTableTopMarquee 1.2s linear infinite',
                zIndex: 6,
                pointerEvents: 'none',
              }
            : {},
          '@keyframes cTableTopMarquee': {
            '0%': { backgroundPosition: '220% 0' },
            '100%': { backgroundPosition: '-120% 0' },
          },
          ...(maxHeight ? { height: maxHeight } : fitContainer ? { flex: 1, minHeight: 0, height: '100%' } : {}),
        }}
      >
        {showToolbar ? (
          <Box
            sx={{
              '& .MuiToolbar-root': {
                minHeight: 60,
                alignItems: { xs: 'flex-start', md: 'center' },
                flexWrap: 'wrap',
                rowGap: 1,
                columnGap: 1,
              },
              '& .MuiToolbar-root > :nth-of-type(1)': {
                width: { xs: '100%', md: 'auto' },
                '& .MuiTextField-root': {
                  width: { xs: '100%', md: 300 },
                },
              },
              '& .MuiToolbar-root > :nth-of-type(2)': {
                flexShrink: 0,
              },
              '& .MuiToolbar-root > :nth-of-type(3)': {
                display: { xs: 'none', md: 'block' },
              },
              '& .MuiToolbar-root > :nth-of-type(4)': {
                ml: 'auto',
                justifyContent: 'flex-end',
                flexWrap: 'wrap',
              },
              '& .MuiInputBase-root': {
                minHeight: 46,
              },
              '& .MuiIconButton-root': {
                width: 40,
                height: 40,
              },
              '& .MuiTypography-root': {
                fontSize: '0.9rem',
              },
              '& .MuiButtonBase-root': {
                borderRadius: 2.5,
              },
            }}
          >
            <CTableToolbar
              filterText={filterText}
              setFilterText={setFilterText}
              onRowsPerPageChange={setTableRowsPerPage}
              rowsPerPage={tableRowsPerPage}
              rowsPerPageOptions={rowsPerPageOptions}
              page={tablePage}
              count={totalDisplayCount}
              onPageChange={setTablePage}
              actions={actions}
              extraTools={customToolbarNodes}
              grouping={grouping}
              setGroupAnchorEl={setGroupAnchorEl}
              showSummary={showSummary}
              setShowSummary={setShowSummary}
              setAnchorEl={setAnchorEl}
              setSummaryAnchorEl={setSummaryAnchorEl}
              handleExport={handleExport}
              showCreateButton={quickCreateEnabled}
              onOpenCreateDialog={handleOpenQuickCreateDialog}
              showEditButton={quickEditEnabled}
              onOpenEditDialog={handleOpenQuickEditDialog}
              editDisabled={selectedRows.length !== 1}
              showDeleteButton={quickDeleteEnabled}
              onOpenDeleteConfirm={handleOpenDeleteConfirm}
              deleteDisabled={selectedRows.length === 0}
              onLayoutSave={(onLayoutSave || (filterConfig?.variantService && filterConfig?.appId)) ? handleLayoutSave : undefined}
              loading={loading}
              layoutManager={layoutManager}
              onOpenGraphReport={graphReportEnabled ? handleOpenGraphReport : undefined}
            />
          </Box>
        ) : null}

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: 'auto',
            p: 1.5,
          }}
        >
          <Stack spacing={1.25}>
            {visibleRows.length === 0 && !loading ? (
              emptyState || (
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    border: '1px dashed',
                    borderColor: 'divider',
                    textAlign: 'center',
                  }}
                >
                  <Typography sx={{ fontSize: '0.92rem', color: 'text.secondary' }}>{t('common.noData')}</Typography>
                </Paper>
              )
            ) : null}

            {visibleRows.map((item: any, index: number) => {
              if (item.type === 'group') {
                const isExpanded = expandedGroups.has(item.id);
                return (
                  <Paper
                    key={item.id}
                    elevation={0}
                    sx={{
                      borderRadius: 4,
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'action.hover',
                    }}
                  >
                    <Box
                      component="button"
                      type="button"
                      onClick={() => toggleGroupExpand(item.id)}
                      sx={{
                        width: '100%',
                        px: 1.5,
                        py: 1.3,
                        border: 0,
                        background: 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        textAlign: 'left',
                        cursor: 'pointer',
                        appearance: 'none',
                        WebkitAppearance: 'none',
                      }}
                    >
                      {isExpanded ? <ExpandMoreRoundedIcon /> : <ChevronRightRoundedIcon />}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: '0.94rem', fontWeight: 800 }}>
                          {item.field}: {item.value}
                        </Typography>
                        <Typography sx={{ mt: 0.2, fontSize: '0.76rem', color: 'text.secondary' }}>
                          {item.count} records
                        </Typography>
                      </Box>
                      {grouping.length > 1 && item.level < grouping.length - 1 ? (
                        <Stack direction="row" spacing={0.5}>
                          <Chip
                            size="small"
                            label={t('table.group.expandAll')}
                            onClick={(event) => {
                              event.stopPropagation();
                              handleExpandGroupRecursively(item.id);
                            }}
                          />
                          <Chip
                            size="small"
                            label={t('table.group.collapseAll')}
                            onClick={(event) => {
                              event.stopPropagation();
                              handleCollapseGroupRecursively(item.id);
                            }}
                          />
                        </Stack>
                      ) : null}
                    </Box>
                  </Paper>
                );
              }

              const row = item.data || item;
              const rowId = item.id || row[rowKeyField] || index;
              return renderRowCard(row, rowId, index);
            })}

            {showSummary ? (
              <PTableSummaryPanel summaryRow={summaryRow} visibleColumns={visibleColumns} columns={columns} />
            ) : null}

            {loading ? (
              <Typography sx={{ py: 1, fontSize: '0.84rem', color: 'text.secondary', textAlign: 'center' }}>
                {t('common.loading')}
              </Typography>
            ) : null}
          </Stack>
        </Box>
      </Paper>

      {quickCreateEnabled ? (
        <Dialog open={quickCreateOpen} onClose={() => !quickCreateSubmitting && setQuickCreateOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle sx={{ fontSize: '1rem', fontWeight: 800 }}>{quickCreate?.title || t('quickCreate.createWithTitle', { title })}</DialogTitle>
          <DialogContent sx={{ pt: '8px !important' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
              {quickCreateColumns.map((column: any) => {
                const type = column.type === 'number' || column.numeric ? 'number' : column.type === 'date' ? 'date' : 'text';
                return (
                  <TextField
                    key={`quick-create-${column.id}`}
                    label={column.label || column.id}
                    value={quickCreateValues[column.id] ?? ''}
                    onChange={(event) => handleQuickCreateFieldChange(column.id, event.target.value)}
                    type={type}
                    fullWidth
                    InputLabelProps={{ shrink: type === 'date' ? true : undefined }}
                  />
                );
              })}
              {quickCreate?.description ? <Alert severity="info">{quickCreate.description}</Alert> : null}
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setQuickCreateOpen(false)} disabled={quickCreateSubmitting}>
              {quickCreate?.cancelLabel || t('common.cancel')}
            </Button>
            <Button onClick={handleSubmitQuickCreate} variant="contained" disabled={quickCreateSubmitting}>
              {quickCreate?.submitLabel || t('common.save')}
            </Button>
          </DialogActions>
        </Dialog>
      ) : null}

      {quickEditEnabled ? (
        <Dialog open={quickEditOpen} onClose={() => !quickEditSubmitting && setQuickEditOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle sx={{ fontSize: '1rem', fontWeight: 800 }}>{quickEdit?.title || t('quickEdit.editWithTitle', { title })}</DialogTitle>
          <DialogContent sx={{ pt: '8px !important' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
              {quickEditColumns.map((column: any) => {
                const type = column.type === 'number' || column.numeric ? 'number' : column.type === 'date' ? 'date' : 'text';
                return (
                  <TextField
                    key={`quick-edit-${column.id}`}
                    label={column.label || column.id}
                    value={quickEditValues[column.id] ?? ''}
                    onChange={(event) => handleQuickEditFieldChange(column.id, event.target.value)}
                    type={type}
                    disabled={!isQuickEditFieldEditable(column.id)}
                    fullWidth
                    InputLabelProps={{ shrink: type === 'date' ? true : undefined }}
                  />
                );
              })}
              {quickEdit?.description ? <Alert severity="info">{quickEdit.description}</Alert> : null}
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setQuickEditOpen(false)} disabled={quickEditSubmitting}>
              {quickEdit?.cancelLabel || t('common.cancel')}
            </Button>
            <Button onClick={handleSubmitQuickEdit} variant="contained" disabled={quickEditSubmitting || !selectedEditRow}>
              {quickEdit?.submitLabel || t('common.save')}
            </Button>
          </DialogActions>
        </Dialog>
      ) : null}

      {quickDeleteEnabled ? (
        <CMessageBox
          open={deleteConfirmOpen}
          type="warning"
          title={quickDelete?.title || t('quickDelete.confirmTitle')}
          message={
            quickDelete?.message ||
            (selectedRows.length > 1
              ? t('quickDelete.confirmMessageMultiple', { count: selectedRows.length })
              : t('quickDelete.confirmMessageSingle'))
          }
          confirmText={quickDelete?.confirmText || t('common.delete')}
          cancelText={quickDelete?.cancelText || t('common.cancel')}
          onClose={() => !deleteSubmitting && setDeleteConfirmOpen(false)}
          onConfirm={handleConfirmDelete}
        />
      ) : null}

      {menus}

      {graphReportEnabled ? (
        <CGraphReport
          open={graphReportOpen}
          onClose={handleCloseGraphReport}
          model={graphReportModel}
          aiAssistant={graphReport?.aiAssistant}
          interaction={
            graphInteractionEnabled
              ? {
                  enabled: true,
                  filters: graphInteraction.filters,
                  fieldMapping: graphBaseFieldMapping,
                  onPrimaryDimensionClick: (value) => graphInteraction.setFilter('primaryDimension', value),
                  onSecondaryDimensionClick: (value) => graphInteraction.setFilter('secondaryDimension', value),
                  onStatusClick: (value) => graphInteraction.setFilter('status', value),
                  onClearFilter: graphInteraction.clearFilter,
                  onClearAll: graphInteraction.clearAll,
                }
              : undefined
          }
          tableContent={
            <PTable
              appId={effectiveAppId || 'graph-report-internal'}
              title={t('graph.dataBody')}
              columns={graphTableColumns}
              rows={graphReportModel.table.rows as any[]}
              rowKey="id"
              fullWidth
              maxHeight="420px"
              rowsPerPage={20}
              rowsPerPageOptions={[20, 50, 100]}
              graphReport={{ enabled: false }}
              showSummary={false}
            />
          }
        />
      ) : null}
    </Box>
  );
};
