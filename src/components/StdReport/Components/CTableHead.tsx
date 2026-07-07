import React, { useRef, useState, useEffect } from 'react';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Checkbox from '@mui/material/Checkbox';
import TableSortLabel from '@mui/material/TableSortLabel';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import { useSortable, SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CTableHeadProps } from '../Hooks/CTable/types';
import { useOrbcafeI18n } from '../../../i18n';
import { tableControlCheckboxSx, tableControlIconButtonSx, tableGroupControlCellSx, tableSelectionCellSx } from './ctableControlSx';

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
        <TableRow>
            {isSelectionEnabled && (
                <TableCell
                    padding="checkbox"
                    sx={(theme) => ({
                        ...tableSelectionCellSx,
                        position: 'sticky',
                        top: 0,
                        zIndex: 4,
                        backgroundColor: theme.palette.mode === 'dark' ? '#000000' : '#f5f5f5',
                        color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.text.primary,
                    })}
                >
                    <Checkbox
                        color="primary"
                        indeterminate={numSelected > 0 && numSelected < rowCount}
                        checked={rowCount > 0 && numSelected === rowCount}
                        onChange={onSelectAllClick}
                        disabled={selectionMode === 'single'}
                        sx={tableControlCheckboxSx}
                    />
                </TableCell>
            )}
            {showGroupToggle && (
                <TableCell
                    align="center"
                    padding="checkbox"
                    sx={(theme) => ({
                        ...tableGroupControlCellSx,
                        position: 'sticky',
                        top: 0,
                        zIndex: 4,
                        backgroundColor: theme.palette.mode === 'dark' ? '#000000' : '#f5f5f5',
                        color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.text.primary,
                    })}
                >
                    <Tooltip title={groupToggleTitle}>
                        <IconButton
                            size="small"
                            onClick={(event) => {
                                event.stopPropagation();
                                handleToggleAll?.(!isAllExpanded);
                            }}
                            sx={tableControlIconButtonSx}
                        >
                            {isAllExpanded ? <UnfoldLessIcon /> : <UnfoldMoreIcon />}
                        </IconButton>
                    </Tooltip>
                </TableCell>
            )}
            {enableColumnReorder ? (
                <SortableContext items={sortableIds} strategy={horizontalListSortingStrategy}>
                    {headerCells}
                </SortableContext>
            ) : (
                headerCells
            )}
        </TableRow>
    );

    return <TableHead>{headerRow}</TableHead>;
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
        <TableCell
            ref={enableColumnReorder ? setNodeRef : undefined}
            align="left"
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={isActive ? activeSortDirection : false}
            onContextMenu={onContextMenu ? (e) => onContextMenu(e, headCell.id) : undefined}
            style={{ width, minWidth: width, maxWidth: width, ...dragStyle }}
            sx={(theme) => ({
                position: 'sticky',
                top: 0,
                zIndex: 4,
                backgroundColor: theme.palette.mode === 'dark' ? '#000000' : '#f5f5f5',
                color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.text.primary,
                fontWeight: 'bold',
                userSelect: 'none',
                cursor: enableColumnReorder ? (isDragging ? 'grabbing' : 'grab') : undefined,
            })}
            {...(enableColumnReorder ? attributes : {})}
            {...(enableColumnReorder ? listeners : {})}
        >
            {disableSorting ? (
                <Box
                    component="span"
                    sx={(theme) => ({
                        overflow: 'visible',
                        textOverflow: 'clip',
                        whiteSpace: 'normal',
                        lineHeight: 1.2,
                        wordBreak: 'break-word',
                        pr: 1,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5,
                        fontWeight: 'bold',
                        fontSize: '0.85rem',
                        color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.text.primary,
                    })}
                >
                    {headCell.label}
                </Box>
            ) : (
                <TableSortLabel
                    active={isActive}
                    direction={activeSortDirection}
                    onClick={onRequestSort}
                    sx={(theme) => ({
                        '&.MuiTableSortLabel-root': { width: '100%' },
                        '& .MuiTableSortLabel-icon': {
                            color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.text.primary,
                            opacity: isActive ? 1 : 0,
                            transition: 'opacity 0.2s',
                        },
                        '&:hover .MuiTableSortLabel-icon': { opacity: 0.5 },
                        '&.Mui-active .MuiTableSortLabel-icon': {
                            opacity: 1,
                            color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.text.primary,
                        },
                        fontWeight: 'bold',
                        fontSize: '0.85rem',
                        color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.text.primary,
                    })}
                >
                    <Box
                        component="span"
                        sx={{
                            overflow: 'visible',
                            textOverflow: 'clip',
                            whiteSpace: 'normal',
                            lineHeight: 1.2,
                            wordBreak: 'break-word',
                            pr: 1,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.5,
                        }}
                    >
                        {headCell.label}
                        {multiSortInfo && (
                            <Box
                                component="span"
                                sx={(theme) => ({
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minWidth: 16,
                                    height: 16,
                                    px: 0.5,
                                    borderRadius: 999,
                                    fontSize: 10,
                                    fontWeight: 700,
                                    color: '#fff',
                                    backgroundColor: theme.palette.primary.main,
                                })}
                            >
                                {multiSortInfo.priority}
                            </Box>
                        )}
                    </Box>
                </TableSortLabel>
            )}
            {/* Resize Handle — stop pointer events bubbling so drag-to-reorder isn't triggered when resizing. */}
            <Box
                onMouseDown={onResizeMouseDown}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                sx={(theme) => ({
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    bottom: 0,
                    width: 5,
                    cursor: 'col-resize',
                    backgroundColor: 'transparent',
                    transition: 'background-color 120ms ease',
                    '&:hover': {
                        backgroundColor:
                            theme.palette.mode === 'dark'
                                ? 'rgba(148,163,184,0.28)'
                                : 'rgba(15,23,42,0.12)',
                    },
                    zIndex: 1,
                })}
            />
        </TableCell>
    );
};
