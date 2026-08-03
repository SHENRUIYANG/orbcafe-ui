import { TableSortLabel, UnfoldLessIcon, UnfoldMoreIcon } from '../../../lib/orbis-compat';
import React, { useRef, useState, useEffect } from 'react';
import {  CIconButton, CCheckbox, CTooltip } from "../../Atoms";
import { useSortable, SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CTableHeadProps } from '../Hooks/CTable/types';
import { useOrbcafeI18n } from '../../../i18n';
import { TABLE_CONTROL_COLUMN_WIDTH, TABLE_GROUP_CONTROL_COLUMN_WIDTH, tableControlCheckboxSx, tableControlIconButtonSx } from './ctableControlSx';

export const CTableHead = (props: CTableHeadProps) => {
    const { t } = useOrbcafeI18n();
    const {
        onSelectAllClick,
        order,
        orderBy,
        sortBy = [],
        numSelected = 0,
        rowCount = 0,
        onRequestSort,
        onContextMenu,
        columns,
        visibleColumns,
        selectionMode,
        grouping = [],
        isAllExpanded = false,
        handleToggleAll,
        onColumnResize,
        columnWidths,
        enableColumnReorder = false,
        disableSorting = false,
    } = props;

    // Resizing state
    const [resizingCol, setResizingCol] = useState<string | null>(null);
    const resizingRef = useRef<{ startX: number; startWidth: number; colId: string } | null>(null);

    const createSortHandler = (property: string) => (_event: React.MouseEvent<unknown>) => {
        if (disableSorting) return;
        // Prevent sorting if we are resizing
        if (resizingCol) return;
        onRequestSort(property);
    };

    const handleMouseDown = (e: React.MouseEvent, colId: string, currentWidth: number) => {
        e.preventDefault();
        e.stopPropagation();
        setResizingCol(colId);
        resizingRef.current = {
            startX: e.clientX,
            startWidth: currentWidth,
            colId
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = 'col-resize';
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!resizingRef.current) return;

        const { startX, startWidth, colId } = resizingRef.current;
        const diff = e.clientX - startX;
        const newWidth = Math.max(50, startWidth + diff); // Minimum width 50px

        if (onColumnResize) {
            onColumnResize(colId, newWidth);
        }
    };

    const handleMouseUp = () => {
        setResizingCol(null);
        resizingRef.current = null;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
    };

    // Cleanup
    useEffect(() => {
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    const isSelectionEnabled = selectionMode === 'multiple' || selectionMode === 'single';
    const showGroupToggle = grouping.length > 0 && Boolean(handleToggleAll);
    const groupToggleTitle = isAllExpanded ? t('table.group.collapseAll') : t('table.group.expandAll');
    const visibleLeafColumns = columns.filter((c: any) => visibleColumns.includes(c.id));

    const sortByMap = new Map(sortBy.map((rule, idx) => [rule.field, { ...rule, priority: idx + 1 }]));

    const headerCells = visibleLeafColumns.map((headCell: any) => {
        const width = columnWidths?.[headCell.id] || headCell.minWidth || 100;
        const multiSortInfo = sortByMap.get(headCell.id);
        return (
            <SortableHeadCell
                key={headCell.id}
                headCell={headCell}
                width={typeof width === 'number' ? width : 100}
                order={order}
                orderBy={orderBy}
                multiSortInfo={disableSorting ? undefined : multiSortInfo}
                onRequestSort={createSortHandler(headCell.id)}
                onContextMenu={onContextMenu}
                onResizeMouseDown={(e) => handleMouseDown(e, headCell.id, typeof width === 'number' ? width : 100)}
                enableColumnReorder={enableColumnReorder}
                disableSorting={disableSorting}
            />
        );
    });

    const sortableIds = visibleLeafColumns.map((c: any) => c.id);

    const headerRow = (
        <tr>
            {isSelectionEnabled && (
                <th
                    className="orb-table-control-head"
                    style={{ width: TABLE_CONTROL_COLUMN_WIDTH, minWidth: TABLE_CONTROL_COLUMN_WIDTH, maxWidth: TABLE_CONTROL_COLUMN_WIDTH }}
                >
                    <CCheckbox
                        color="primary"
                        indeterminate={numSelected > 0 && numSelected < rowCount}
                        checked={rowCount > 0 && numSelected === rowCount}
                        onChange={onSelectAllClick}
                        disabled={selectionMode === 'single'}
                        sx={tableControlCheckboxSx}
                    />
                </th>
            )}
            {showGroupToggle && (
                <th
                    className="orb-table-control-head"
                    style={{ width: TABLE_GROUP_CONTROL_COLUMN_WIDTH, minWidth: TABLE_GROUP_CONTROL_COLUMN_WIDTH, maxWidth: TABLE_GROUP_CONTROL_COLUMN_WIDTH }}
                >
                    <CTooltip title={groupToggleTitle}>
                        <CIconButton
                            size="small"
                            onClick={(event) => {
                                event.stopPropagation();
                                handleToggleAll?.(!isAllExpanded);
                            }}
                            sx={tableControlIconButtonSx}
                        >
                            {isAllExpanded ? <UnfoldLessIcon /> : <UnfoldMoreIcon />}
                        </CIconButton>
                    </CTooltip>
                </th>
            )}
            {enableColumnReorder ? (
                <SortableContext items={sortableIds} strategy={horizontalListSortingStrategy}>
                    {headerCells}
                </SortableContext>
            ) : (
                headerCells
            )}
        </tr>
    );

    return <thead>{headerRow}</thead>;
};

interface SortableHeadCellProps {
    headCell: any;
    width: number;
    order: 'asc' | 'desc';
    orderBy: string;
    multiSortInfo?: { direction: 'asc' | 'desc'; priority: number };
    onRequestSort: (event: React.MouseEvent<unknown>) => void;
    onContextMenu?: (event: React.MouseEvent, columnId: string) => void;
    onResizeMouseDown: (event: React.MouseEvent) => void;
    enableColumnReorder: boolean;
    disableSorting: boolean;
}

const SortableHeadCell: React.FC<SortableHeadCellProps> = ({
    headCell,
    width,
    order,
    orderBy,
    multiSortInfo,
    onRequestSort,
    onContextMenu,
    onResizeMouseDown,
    enableColumnReorder,
    disableSorting,
}) => {
    const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
        id: headCell.id,
        disabled: !enableColumnReorder,
    });

    const dragStyle: React.CSSProperties = enableColumnReorder
        ? {
              transform: CSS.Transform.toString(transform),
              transition,
              opacity: isDragging ? 0.6 : 1,
          }
        : {};

    const activeSortDirection = disableSorting ? 'asc' : multiSortInfo?.direction ?? (orderBy === headCell.id ? order : 'asc');
    const isActive = !disableSorting && (Boolean(multiSortInfo) || orderBy === headCell.id);

    return (
        <th
            ref={enableColumnReorder ? setNodeRef : undefined}
            className={`orb-table-head-cell ${headCell.numeric ? 'orb-num' : ''} ${enableColumnReorder ? 'orb-is-reorderable' : ''} ${isDragging ? 'orb-is-dragging' : ''}`}
            aria-sort={isActive ? (activeSortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
            onContextMenu={onContextMenu ? (e) => onContextMenu(e, headCell.id) : undefined}
            style={{ width, minWidth: width, maxWidth: width, ...dragStyle }}
            {...(enableColumnReorder ? attributes : {})}
            {...(enableColumnReorder ? listeners : {})}
        >
            {disableSorting ? (
                <span className="orb-table-head-label">
                    {headCell.label}
                </span>
            ) : (
                <TableSortLabel
                    className="orb-table-head-sort"
                    active={isActive}
                    direction={activeSortDirection}
                    onClick={onRequestSort}
                >
                    <span className="orb-table-head-label">
                        {headCell.label}
                        {multiSortInfo && (
                            <span className="orb-table-sort-priority">
                                {multiSortInfo.priority}
                            </span>
                        )}
                    </span>
                </TableSortLabel>
            )}
            {/* Resize Handle — stop pointer events bubbling so drag-to-reorder isn't triggered when resizing. */}
            <div
                className="orb-table-resize-handle"
                onMouseDown={onResizeMouseDown}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
            />
        </th>
    );
};
