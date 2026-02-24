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
import { CTableHeadProps } from '../Hooks/CTable/types';
import { useOrbcafeI18n } from '../../../i18n';

export const CTableHead = (props: CTableHeadProps) => {
    const { t } = useOrbcafeI18n();
    const { 
        onSelectAllClick, 
        order, 
        orderBy, 
        numSelected = 0, 
        rowCount = 0, 
        onRequestSort, 
        columns, 
        visibleColumns, 
        selectionMode,
        grouping = [],
        isAllExpanded = false,
        handleToggleAll,
        onColumnResize,
        columnWidths
    } = props;
    
    // Resizing state
    const [resizingCol, setResizingCol] = useState<string | null>(null);
    const resizingRef = useRef<{ startX: number; startWidth: number; colId: string } | null>(null);

    const createSortHandler = (property: string) => (_event: React.MouseEvent<unknown>) => {
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

    return (
        <TableHead>
            <TableRow>
                {isSelectionEnabled && (
                    <TableCell
                        padding="checkbox"
                        sx={(theme) => ({
                            width: 48,
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
                        />
                    </TableCell>
                )}
                {showGroupToggle && (
                    <TableCell
                        align="center"
                        padding="checkbox"
                        sx={(theme) => ({
                            width: 44,
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
                                sx={{ p: 0.2 }}
                            >
                                {isAllExpanded ? <UnfoldLessIcon fontSize="small" /> : <UnfoldMoreIcon fontSize="small" />}
                            </IconButton>
                        </Tooltip>
                    </TableCell>
                )}
                {visibleLeafColumns.map((headCell: any) => {
                    const width = columnWidths?.[headCell.id] || headCell.minWidth || 100;
                    
                    return (
                        <TableCell
                            key={headCell.id}
                            align="left"
                            padding={headCell.disablePadding ? 'none' : 'normal'}
                            sortDirection={orderBy === headCell.id ? order : false}
                            style={{ width: width, minWidth: width, maxWidth: width }}
                            sx={(theme) => ({
                                position: 'sticky',
                                top: 0,
                                zIndex: 4,
                                backgroundColor: theme.palette.mode === 'dark' ? '#000000' : '#f5f5f5',
                                color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.text.primary,
                                fontWeight: 'bold',
                                userSelect: 'none'
                            })}
                        >
                            <TableSortLabel
                                active={orderBy === headCell.id}
                                direction={orderBy === headCell.id ? order : 'asc'}
                                onClick={createSortHandler(headCell.id)}
                                sx={(theme) => ({
                                    '&.MuiTableSortLabel-root': {
                                        width: '100%'
                                    },
                                    '& .MuiTableSortLabel-icon': {
                                        color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.text.primary,
                                        opacity: orderBy === headCell.id ? 1 : 0, // Hide icon if not active
                                        transition: 'opacity 0.2s',
                                    },
                                    '&:hover .MuiTableSortLabel-icon': {
                                        opacity: 0.5 // Show semi-transparent on hover
                                    },
                                    '&.Mui-active .MuiTableSortLabel-icon': {
                                        opacity: 1,
                                        color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.text.primary
                                    },
                                    fontWeight: 'bold',
                                    fontSize: '0.85rem',
                                    color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.text.primary
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
                                        pr: 1
                                    }}
                                >
                                    {headCell.label}
                                </Box>
                            </TableSortLabel>
                            
                            {/* Resize Handle */}
                            <Box
                                onMouseDown={(e) => handleMouseDown(e, headCell.id, typeof width === 'number' ? width : 100)}
                                onClick={(e) => e.stopPropagation()}
                                sx={{
                                    position: 'absolute',
                                    right: 0,
                                    top: 0,
                                    bottom: 0,
                                    width: 5,
                                    cursor: 'col-resize',
                                    '&:hover': {
                                        backgroundColor: 'primary.main',
                                        opacity: 0.5
                                    },
                                    zIndex: 1
                                }}
                            />
                        </TableCell>
                    );
                })}
            </TableRow>
        </TableHead>
    );
};
