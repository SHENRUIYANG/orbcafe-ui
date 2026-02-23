/**
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
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

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

import { CSmartFilter } from './CSmartFilter';
import { CLayoutManager } from './CLayoutManager';

// Hooks
import { useCTable } from './Hooks/CTable/useCTable';

// Re-exports for wrappers
export const CTableBody: React.FC<any> = (props) => <TableBody {...props} />;
export const CTableCell: React.FC<CTableCellProps> = (props) => <TableCell {...props} />;
export const CTableContainer: React.FC<CTableContainerProps> = (props) => <TableContainer {...props} />;
export const CTableHead: React.FC<any> = (props) => <TableHead {...props} />;
export const CTableRow: React.FC<CTableRowProps> = (props) => <TableRow {...props} />;

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
  const {
    title = 'Data Table',
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
    page = 0,
    rowsPerPage = 20,
    rowsPerPageOptions = [20, 50, 100, -1],
    count = 0,
    onPageChange,
    onRowsPerPageChange,
    onLayoutSave,
    filterConfig,
    rowKey,
    tableKey = 'default',
    graphReport,
  } = props;

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
    toggleGroupField,
    handleToggleAll,
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
  const { model: graphReportModel } = useGraphReport({
    rows: sortedAndFilteredRows as Record<string, unknown>[],
    config: {
      ...graphReport,
      title: graphReport?.title || `${title} Graphic Report`,
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
          serviceUrl={filterConfig?.variantService ? undefined : undefined} // Use default or passed
      />
  ) : null;


  // --- Render ---

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

  // Mobile View Render (Card View)
  if (isMobile) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
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
      </Box>
    );
  }

  return (
    <Box sx={{ 
        width: fullWidth ? '100%' : 'auto', 
        mb: fitContainer ? 0 : 2,
        ...(fitContainer ? {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0, // Important for nested flex scrolling
            height: '100%'
        } : {})
    }}>
        {filterConfig && (
            <Box sx={{ mb: 2 }}>
                <CSmartFilter
                    fields={filterConfig.fields}
                    filters={filterConfig.filters}
                    onFilterChange={filterConfig.onFilterChange}
                    onSearch={filterConfig.onSearch}
                    variants={filterConfig.variants || []}
                    currentVariantId={filterConfig.currentVariantId}
                    onVariantLoad={handleVariantLoad}
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
                />
            </Box>
        )}

        <Paper sx={{ 
            width: fullWidth ? '100%' : 'auto', 
            mb: fitContainer ? 0 : 2,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            ...(maxHeight ? { height: maxHeight } : 
               fitContainer ? { flex: 1, minHeight: 0 } : {})
        }}>
            {showToolbar && (
                <CTableToolbar
                    filterText={filterText}
                    setFilterText={setFilterText}
                    onRowsPerPageChange={onRowsPerPageChange}
                    rowsPerPage={rowsPerPage}
                    rowsPerPageOptions={rowsPerPageOptions}
                    page={page}
                    count={count}
                    onPageChange={onPageChange}
                    actions={actions}
                    extraTools={extraTools}
                    grouping={grouping}
                    setGroupAnchorEl={setGroupAnchorEl}
                    showSummary={showSummary}
                    setShowSummary={setShowSummary}
                    setAnchorEl={setAnchorEl}
                    setSummaryAnchorEl={setSummaryAnchorEl}
                    handleExport={handleExport}
                    onLayoutSave={(onLayoutSave || (filterConfig?.variantService && filterConfig?.appId)) ? handleLayoutSave : undefined}
                    loading={loading}
                    layoutManager={layoutManager}
                    onOpenGraphReport={graphReportEnabled ? handleOpenGraphReport : undefined}
                />
            )}

            <TableContainer sx={{ 
                flex: 1,
                maxHeight: maxHeight || 'calc(100vh - 320px)',
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
                    <Table
                        sx={{ 
                            minWidth: fullWidth ? 750 : 'auto',
                            width: fullWidth ? '100%' : 'auto',
                            tableLayout: Object.keys(columnWidths).length > 0 ? 'fixed' : 'auto',
                            borderCollapse: 'separate', 
                            borderSpacing: 0 
                        }}
                        aria-labelledby="tableTitle"
                        size="small"
                        stickyHeader={true}
                    >
                        <CSmartTableHead
                            columns={columns}
                            visibleColumns={visibleColumns}
                            order={order}
                            orderBy={orderBy}
                            onRequestSort={handleRequestSort}
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
                            handleClick={handleClick}
                            onSelectionChange={onSelectionChange}
                            grouping={grouping}
                            rowKeyProp={rowKey}
                            page={page}
                            rowsPerPage={rowsPerPage}
                        />
                        {showSummary && (
                            <CTableFooter
                                showSummary={showSummary}
                                columns={columns}
                                visibleColumns={visibleColumns}
                                summaryRow={summaryRow}
                                selectionMode={selectionMode?.toString()}
                                orderBy={orderBy}
                                zIndex={3} // Higher than default sticky header (2) to ensure it stays on top of content
                            />
                        )}
                    </Table>
                </DndContext>
            </TableContainer>
        </Paper>

        {menus}
        {graphReportEnabled && (
            <CGraphReport
                open={graphReportOpen}
                onClose={handleCloseGraphReport}
                model={graphReportModel}
                tableContent={
                    <CTable
                        title="Data Body"
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
    </Box>
  );
};

export const CSmartTable = CTable;
