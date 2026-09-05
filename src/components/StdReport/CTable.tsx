import { Alert, CButton, CDialog, CPaper, CTextField } from '../../lib/orbis-compat';
/**
import {  CButton, CPaper, CTextField, CDialog } from "../Atoms";
 * @file 10_Frontend/components/sap/ui/Common/Structures/CTable.tsx
 *
 * @summary Core frontend CTable module for the ORBAI Core project
 * @author ORBAICODER
 * @version 1.0.0
 * @date 2025-01-19
 *
 * @description
 * This file is responsible for:
 *  - Implementing CTable functionality within frontend workflows
 *  - Integrating with shared ORBAI Core application processes under frontend
 *
 * @logic
 * 1. Import required dependencies and configuration
 * 2. Execute the primary logic for CTable
 * 3. Export the resulting APIs, hooks, or components for reuse
 *
 * @changelog
 * V1.0.0 - 2025-01-19 - Initial creation
 */

/**
 * File Overview
 *
 * START CODING
 *
 * --------------------------
 * SECTION 1: CTable Core Logic
 * Section overview and description.
 * --------------------------
 */

'use client';

import React from 'react';

// Dnd Kit
import {
  DndContext,
  closestCenter,
} from '@dnd-kit/core';
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';

// Types
import type {
    CTableProps,
    CTableCellProps,
    CTableContainerProps,
    CTableRowProps
} from './Hooks/CTable/types';

// Components
import { CTableToolbar } from './Components/CTableToolbar';
import { CTableHead as CSmartTableHead } from './Components/CTableHead';
import { CTableBody as CSmartTableBody } from './Components/CTableBody';
import { CTableFooter } from './Components/CTableFooter';
import { CTableMobile } from './Components/CTableMobile';
import { CTableGroupMenu, CTableColumnMenu, CTableContextMenu, CTableSummaryMenu } from './Components/CTableMenu';
import { CGraphReport } from '../GraphReport/CGraphReport';
import { useGraphReport } from '../GraphReport/Hooks/useGraphReport';
import { useGraphInteraction } from '../GraphReport/Hooks/useGraphInteraction';

import { CSmartFilter } from './CSmartFilter';
import { CLayoutManager } from './CLayoutManager';
import { CMessageBox } from '../Molecules/CMessageBox';
import { useOrbcafeI18n } from '../../i18n';

// Hooks
import { useCTable } from './Hooks/CTable/useCTable';

// Re-exports for wrappers
export const CTableBody: React.FC<any> = (props) => <tbody {...props} />;
export const CTableCell: React.FC<CTableCellProps> = ({ align, ...props }) => <td align={align === 'inherit' ? undefined : align} {...props} />;
export const CTableContainer: React.FC<CTableContainerProps> = (props) => <div {...props} />;
export const CTableHead: React.FC<any> = (props) => <thead {...props} />;
export const CTableRow: React.FC<CTableRowProps> = (props) => <tr {...props} />;

/**
 * --------------------------
 * SECTION 2: CTable Component
 * --------------------------
 */

/**
 * CTable
 *
 * A powerful, feature-rich data table component designed for the SAP Frontend architecture.
 *
 * Key Features:
 * - Integrated Smart Filter Bar (Optional)
 * - Sort, Filter, Pagination
 * - Multi-level Grouping (Drag & Drop or Menu)
 * - Column Visibility & Reordering
 * - Sticky Header & Summary Footer
 * - Export to CSV
 * - Responsive Layout (Mobile Card View)
 * - Auto-fit Height Mode (Flexbox)
 *
 * @param props.fitContainer - If true, the table expands to fill the parent container's remaining height (Flexbox).
 *                             Requires parent to be a flex column with defined height.
 * @param props.maxHeight - Explicit max height string (e.g., '500px' or 'calc(100vh - 200px)').
 *                          Use this if fitContainer is false or for specific constraints.
 * @param props.showSummary - If true, shows a sticky footer row with column summations.
 * @param props.onLayoutSave - Callback fired when the user clicks the "Save Layout" button.
 *                             Passes the current table configuration (columns, sort, grouping, etc.).
 * @param props.layout - External layout configuration object to control the table's state.
 *                       Used for loading saved variants.
 * @param props.filterConfig - Optional configuration to enable integrated Smart Filter Bar.
 */
export const CTable: React.FC<CTableProps> = (props) => {
  const { t } = useOrbcafeI18n();
  const TABLE_FONT_SIZE = '0.85rem';
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
    disableGrouping = false,
    disableSorting = false,
  } = props;
  const title = titleProp || t('table.title.default');

  const {
    isMobile,
    columns,
    order,
    orderBy,
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
    columnWidths,
    anchorEl,
    setAnchorEl,
    contextMenu,
    sensors,
    sortedAndFilteredRows,
    summaryRow,
    visibleRows,
    isAllExpanded,
    page: tablePage,
    setPage: setTablePage,
    rowsPerPage: tableRowsPerPage,
    setRowsPerPage: setTableRowsPerPage,
    totalDisplayCount,
    setSelected: setTableSelected,
    handleColumnResize,
    handleRequestSort,
    handleSelectAllClick,
    handleClick,
    toggleSummaryColumn,
    handleDragEnd,
    handleExport,
    handleContextMenu,
    handleCloseContextMenu,
    toggleColumnVisibility,
    toggleGroupExpand,
    handleToggleAll,
    handleExpandGroupRecursively,
    handleCollapseGroupRecursively,
    isGroupFullyExpanded,
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
  const quickCreateEnabled = Boolean(quickCreate?.enabled);
  const quickEditEnabled = Boolean(quickEdit?.enabled);
  const quickDeleteEnabled = Boolean(quickDelete?.enabled);
  const quickCreateFieldIds = quickCreate?.fields;
  const quickCreateExcludedFields = quickCreate?.excludeFields || [];
  const quickCreateInitialValues = quickCreate?.initialValues || {};
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

  const rowKeyField = rowKey || 'id';

  const selectedRows = React.useMemo(() => {
    const selectedSet = new Set(selected as any[]);
    return (sortedAndFilteredRows as any[]).filter((row: any) => selectedSet.has(row?.[rowKeyField]));
  }, [selected, sortedAndFilteredRows, rowKeyField]);

  const selectedEditRow = selectedRows.length === 1 ? selectedRows[0] : null;

  const quickEditFieldIds = quickEdit?.fields;
  const quickEditExcludedFields = quickEdit?.excludeFields || [];
  const quickEditEditableFields = quickEdit?.editableFields || [];
  const quickEditNonEditableFields = quickEdit?.nonEditableFields || [];
  const quickEditPrimaryKeys = quickEdit?.primaryKeys?.length ? quickEdit.primaryKeys : [rowKeyField];

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

  const isQuickEditFieldEditable = React.useCallback((fieldId: string) => {
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
  }, [quickEditEditableSet, quickEditNonEditableSet, quickEditPrimaryKeySet]);

  React.useEffect(() => {
    if (!graphReportOpen && graphInteraction.hasActiveFilters) {
      graphInteraction.clearAll();
    }
  }, [graphReportOpen, graphInteraction.hasActiveFilters, graphInteraction.clearAll]);

  const handleOpenQuickCreateDialog = () => {
    const initialPayload: Record<string, any> = {};
    quickCreateColumns.forEach((column: any) => {
      initialPayload[column.id] = quickCreateInitialValues[column.id] ?? '';
    });
    setQuickCreateValues(initialPayload);
    setQuickCreateOpen(true);
  };

  const handleCloseQuickCreateDialog = () => {
    if (!quickCreateSubmitting) {
      setQuickCreateOpen(false);
    }
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
    if (!selectedEditRow) {
      return;
    }
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

  const handleCloseQuickEditDialog = () => {
    if (!quickEditSubmitting) {
      setQuickEditOpen(false);
    }
  };

  const handleQuickEditFieldChange = (fieldId: string, value: any) => {
    setQuickEditValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmitQuickEdit = async () => {
    if (!selectedEditRow) {
      return;
    }
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
    if (selectedRows.length === 0) {
      return;
    }
    setDeleteConfirmOpen(true);
  };

  const handleCloseDeleteConfirm = () => {
    if (!deleteSubmitting) {
      setDeleteConfirmOpen(false);
    }
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
    () =>
      graphInteractionEnabled
        ? graphInteraction.applyRows(graphSourceRows, graphBaseFieldMapping)
        : graphSourceRows,
    [graphInteractionEnabled, graphInteraction.applyRows, graphSourceRows, graphBaseFieldMapping],
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


  // --- Render ---

  const menus = (
    <>
        {!disableGrouping && (
            <CTableGroupMenu
                groupAnchorEl={groupAnchorEl}
                setGroupAnchorEl={setGroupAnchorEl}
                grouping={grouping}
                setGrouping={setGrouping}
                columns={columns}
            />
        )}

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

  // Mobile View Render (Card View)
  if (isMobile) {
    return (
      <div sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
          {filterConfig && (
              <CSmartFilter
                  fields={filterConfig.fields}
                  filters={filterConfig.filters}
                  onFilterChange={filterConfig.onFilterChange}
                  onSearch={filterConfig.onSearch}
                  variants={filterConfig.variants || []}
                  currentVariantId={filterConfig.currentVariantId}
                  onVariantLoad={filterConfig.onVariantLoad!}
                  onVariantSave={filterConfig.onVariantSave!}
                  onVariantDelete={filterConfig.onVariantDelete!}
                  onVariantSetDefault={filterConfig.onVariantSetDefault!}
                  appId={filterConfig.appId}
                  tableKey={tableKey}
                  currentLayout={[{ tableKey, layoutData: currentLayoutData }]}
                  variantService={filterConfig.variantService}
                  serviceUrl={serviceUrl ?? filterConfig.serviceUrl}
              />
          )}
          <CTableMobile
            title={title}
            loading={loading}
            showSummary={showSummary}
            setShowSummary={setShowSummary}
            setAnchorEl={setAnchorEl}
            setSummaryAnchorEl={setSummaryAnchorEl}
            filterText={filterText}
            setFilterText={setFilterText}
            sortedAndFilteredRows={sortedAndFilteredRows}
            selected={selected}
            columns={columns}
            visibleColumns={visibleColumns}
            summaryRow={summaryRow}
            handleClick={handleClick}
            selectionMode={selectionMode}
          />
          {menus}
      </div>
    );
  }

  return (
    <div sx={{
        width: fullWidth ? '100%' : 'auto',
        mb: fitContainer ? 0 : 2,
        ...(fitContainer ? {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0, // Important for nested flex scrolling
            height: '100%',
            overflow: 'hidden',
        } : {})
    }}>
        {filterConfig && (
            <div sx={{ mb: 2 }}>
                <CSmartFilter
                    fields={filterConfig.fields}
                    filters={filterConfig.filters}
                    onFilterChange={filterConfig.onFilterChange}
                    onSearch={filterConfig.onSearch}
                    variants={filterConfig.variants || []}
                    currentVariantId={filterConfig.currentVariantId}
                    onVariantLoad={(variant) => {
                        handleVariantLoad(variant);
                        if (filterConfig.onVariantLoad) {
                            filterConfig.onVariantLoad(variant);
                        }
                    }}
                    onVariantSave={filterConfig.onVariantSave!}
                    onVariantDelete={filterConfig.onVariantDelete!}
                    onVariantSetDefault={filterConfig.onVariantSetDefault!}
                    loading={loading}
                    appId={filterConfig.appId}
                    tableKey={tableKey}
                    currentLayout={[{ tableKey, layoutData: currentLayoutData }]}
                    currentLayoutId={currentLayoutId}
                    layoutRefs={[{ tableKey, layoutId: currentLayoutId }]}
                    variantService={filterConfig.variantService}
                    serviceUrl={serviceUrl ?? filterConfig.serviceUrl}
                />
            </div>
        )}

        <CPaper className="orb-ctable-surface" sx={{
            width: fullWidth ? '100%' : 'auto',
            mb: fitContainer ? 0 : 2,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative',
            '&::before': isBusy ? {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '3px',
                background: 'linear-gradient(90deg, color-mix(in oklch, var(--orb-primary) 0%, transparent) 0%, color-mix(in oklch, var(--orb-primary) 25%, transparent) 25%, var(--orb-primary) 50%, color-mix(in oklch, var(--orb-primary) 25%, transparent) 75%, color-mix(in oklch, var(--orb-primary) 0%, transparent) 100%)',
                backgroundSize: '220% 100%',
                animation: 'cTableTopMarquee 1.2s linear infinite',
                zIndex: 6,
                pointerEvents: 'none',
            } : {},
            '@keyframes cTableTopMarquee': {
                '0%': {
                    backgroundPosition: '220% 0',
                },
                '100%': {
                    backgroundPosition: '-120% 0',
                },
            },
            ...(maxHeight ? { height: maxHeight } :
               fitContainer ? { flex: 1, minHeight: 0, height: '100%' } : {})
        }}>
            {showToolbar && (
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
                    extraTools={extraTools}
                    grouping={grouping}
                    disableGrouping={disableGrouping}
                    groupAnchorEl={groupAnchorEl}
                    setGroupAnchorEl={setGroupAnchorEl}
                    showSummary={showSummary}
                    setShowSummary={setShowSummary}
                    anchorEl={anchorEl}
                    setAnchorEl={setAnchorEl}
                    summaryAnchorEl={summaryAnchorEl}
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
            )}

            <div sx={{
                flex: 1,
                ...(maxHeight
                  ? { maxHeight, height: maxHeight }
                  : fitContainer
                    ? { height: 0, maxHeight: 'none' }
                    : { maxHeight: 'calc(100vh - 320px)' }),
                overflowY: 'auto',
                overflowX: 'auto',
                position: 'relative',
                minHeight: 0 // Important for nested flex scrolling
            }}>
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                    modifiers={[restrictToHorizontalAxis]}
                >
                    <table
                        className="orb-tbl orb-ctable"
                        style={{
                            minWidth: fullWidth ? 750 : undefined,
                            width: fullWidth ? '100%' : 'auto',
                            tableLayout: Object.keys(columnWidths).length > 0 ? 'fixed' : 'auto',
                            borderCollapse: 'separate',
                            borderSpacing: 0,
                            fontSize: TABLE_FONT_SIZE,
                        }}
                        aria-labelledby="tableTitle"
                    >
                        <CSmartTableHead
                            columns={columns}
                            visibleColumns={visibleColumns}
                            order={order}
                            orderBy={orderBy}
                            onRequestSort={handleRequestSort}
                            disableSorting={disableSorting}
                            onContextMenu={handleContextMenu}
                            selectionMode={selectionMode}
                            grouping={grouping}
                            isAllExpanded={isAllExpanded}
                            handleToggleAll={handleToggleAll}
                            rowCount={sortedAndFilteredRows.length}
                            numSelected={selected.length}
                            onSelectAllClick={handleSelectAllClick}
                            columnWidths={columnWidths}
                            onColumnResize={handleColumnResize}
                        />

                        <CSmartTableBody
                            visibleRows={visibleRows}
                            columns={columns}
                            visibleColumns={visibleColumns}
                            selectionMode={selectionMode}
                            selected={selected}
                            orderBy={orderBy}
                            loading={loading}
                            expandedGroups={expandedGroups}
                            toggleGroupExpand={toggleGroupExpand}
                            handleExpandGroupRecursively={handleExpandGroupRecursively}
                            handleCollapseGroupRecursively={handleCollapseGroupRecursively}
                            isGroupFullyExpanded={isGroupFullyExpanded}
                            handleClick={handleClick}
                            onSelectionChange={onSelectionChange}
                            grouping={grouping}
                            rowKeyProp={rowKey}
                            page={tablePage}
                            rowsPerPage={tableRowsPerPage}
                        />
                        {showSummary && (
                            <CTableFooter
                                showSummary={showSummary}
                                columns={columns}
                                visibleColumns={visibleColumns}
                                summaryRow={summaryRow}
                                selectionMode={selectionMode?.toString()}
                                grouping={grouping}
                                columnWidths={columnWidths}
                                orderBy={orderBy}
                                zIndex={3} // Higher than default sticky header (2) to ensure it stays on top of content
                            />
                        )}
                    </table>
                </DndContext>
            </div>
        </CPaper>

        {quickCreateEnabled && (
            <CDialog
                open={quickCreateOpen}
                onClose={handleCloseQuickCreateDialog}
                fullWidth
                maxWidth="sm"
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: 2,
                            border: (theme) => `1px solid ${theme.palette.divider}`,
                            bgcolor: 'background.paper',
                        },
                    },
                }}
            >
                <div className="orb-dialog-title" sx={{ fontSize: '0.85rem', fontWeight: 700, pb: 1 }}>
                    {quickCreate?.title || t('quickCreate.createWithTitle', { title })}
                </div>
                <div className="orb-dialog-content" sx={{ pt: '8px !important' }}>
                    <div sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                        {quickCreateColumns.map((column: any) => {
                            const type = column.type === 'number' || column.numeric ? 'number' : column.type === 'date' ? 'date' : 'text';
                            const label = column.label || column.id;
                            return (
                                <CTextField
                                    key={`quick-create-${column.id}`}
                                    label={label}
                                    value={quickCreateValues[column.id] ?? ''}
                                    onChange={(event) => handleQuickCreateFieldChange(column.id, event.target.value)}
                                    type={type}
                                    size="small"
                                    fullWidth
                                    InputLabelProps={{
                                        shrink: type === 'date' ? true : undefined,
                                        sx: { fontSize: '0.85rem' },
                                    }}
                                    InputProps={{ sx: { fontSize: '0.85rem' } }}
                                />
                            );
                        })}

                        {quickCreate?.description && (
                            <Alert severity="info" sx={{ fontSize: '0.85rem', '& span': { fontSize: '0.85rem' } }}>
                                {quickCreate.description}
                            </Alert>
                        )}
                    </div>
                </div>
                <div className="orb-dialog-actions" sx={{ px: 3, pb: 2 }}>
                    <CButton onClick={handleCloseQuickCreateDialog} sx={{ fontSize: '0.85rem' }} disabled={quickCreateSubmitting}>
                        {quickCreate?.cancelLabel || t('common.cancel')}
                    </CButton>
                    <CButton
                        onClick={handleSubmitQuickCreate}
                        variant="contained"
                        sx={{ fontSize: '0.85rem', fontWeight: 700 }}
                        disabled={quickCreateSubmitting}
                    >
                        {quickCreate?.submitLabel || t('common.save')}
                    </CButton>
                </div>
            </CDialog>
        )}

        {quickEditEnabled && (
            <CDialog
                open={quickEditOpen}
                onClose={handleCloseQuickEditDialog}
                fullWidth
                maxWidth="sm"
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: 2,
                            border: (theme) => `1px solid ${theme.palette.divider}`,
                            bgcolor: 'background.paper',
                        },
                    },
                }}
            >
                <div className="orb-dialog-title" sx={{ fontSize: '0.85rem', fontWeight: 700, pb: 1 }}>
                    {quickEdit?.title || t('quickEdit.editWithTitle', { title })}
                </div>
                <div className="orb-dialog-content" sx={{ pt: '8px !important' }}>
                    <div sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                        {quickEditColumns.map((column: any) => {
                            const type = column.type === 'number' || column.numeric ? 'number' : column.type === 'date' ? 'date' : 'text';
                            const label = column.label || column.id;
                            const editable = isQuickEditFieldEditable(column.id);
                            return (
                                <CTextField
                                    key={`quick-edit-${column.id}`}
                                    label={label}
                                    value={quickEditValues[column.id] ?? ''}
                                    onChange={(event) => handleQuickEditFieldChange(column.id, event.target.value)}
                                    type={type}
                                    size="small"
                                    fullWidth
                                    disabled={!editable}
                                    InputLabelProps={{
                                        shrink: type === 'date' ? true : undefined,
                                        sx: { fontSize: '0.85rem' },
                                    }}
                                    InputProps={{ sx: { fontSize: '0.85rem' } }}
                                />
                            );
                        })}

                        {quickEdit?.description && (
                            <Alert severity="info" sx={{ fontSize: '0.85rem', '& span': { fontSize: '0.85rem' } }}>
                                {quickEdit.description}
                            </Alert>
                        )}
                    </div>
                </div>
                <div className="orb-dialog-actions" sx={{ px: 3, pb: 2 }}>
                    <CButton onClick={handleCloseQuickEditDialog} sx={{ fontSize: '0.85rem' }} disabled={quickEditSubmitting}>
                        {quickEdit?.cancelLabel || t('common.cancel')}
                    </CButton>
                    <CButton
                        onClick={handleSubmitQuickEdit}
                        variant="contained"
                        sx={{ fontSize: '0.85rem', fontWeight: 700 }}
                        disabled={quickEditSubmitting || !selectedEditRow}
                    >
                        {quickEdit?.submitLabel || t('common.save')}
                    </CButton>
                </div>
            </CDialog>
        )}

        {quickDeleteEnabled && (
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
                onClose={handleCloseDeleteConfirm}
                onConfirm={handleConfirmDelete}
            />
        )}

        {menus}
        {graphReportEnabled && (
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
                    <CTable
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
                    />
                }
            />
        )}
    </div>
  );
};

export const CSmartTable = CTable;
