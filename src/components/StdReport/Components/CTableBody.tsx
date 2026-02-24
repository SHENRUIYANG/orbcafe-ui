import React from 'react';
import { TableBody, TableRow, TableCell, Checkbox, IconButton, Typography, Box, Tooltip } from '@mui/material';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import { CTableBodyProps } from '../Hooks/CTable/types';
import { useOrbcafeI18n } from '../../../i18n';

export const CTableBody = (props: CTableBodyProps) => {
    const { t } = useOrbcafeI18n();
    const { 
        visibleRows, 
        visibleColumns, 
        selected = [], 
        handleClick, 
        columns, 
        // grouping = [], 
        toggleGroupExpand,
        expandedGroups = new Set(),
        selectionMode,
        grouping = [],
        isGroupFullyExpanded,
        handleExpandGroupRecursively,
        handleCollapseGroupRecursively,
    } = props;
    
    const isSelected = (id: any) => selected.indexOf(id) !== -1;
    const isSelectionEnabled = selectionMode === 'multiple' || selectionMode === 'single';
    const hasGrouping = grouping.length > 0;

    // Helper to calculate colSpan for group rows
    const totalColumns = visibleColumns.length + (isSelectionEnabled ? 1 : 0) + (hasGrouping ? 1 : 0);

    return (
        <TableBody>
            {visibleRows.map((row: any, index: number) => {
                if (row.type === 'group') {
                    // Render Group Header
                    const isExpanded = expandedGroups.has(row.id);
                    // Determine selection state for group
                    const childIds = row.childIds || [];
                    const selectedChildCount = childIds.filter((id: any) => isSelected(id)).length;
                    const isGroupSelected = childIds.length > 0 && selectedChildCount === childIds.length;
                    const isGroupIndeterminate = selectedChildCount > 0 && selectedChildCount < childIds.length;

                    const handleGroupSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
                        e.stopPropagation();
                        // Need to call props.onSelectionChange
                        if (!props.onSelectionChange) return;

                        if (isGroupSelected) {
                            // Deselect all childIds from current selection
                            const newSelected = selected.filter((id: any) => !childIds.includes(id));
                            props.onSelectionChange(newSelected);
                        } else {
                            // Select all childIds (merge unique)
                            const newSelected = Array.from(new Set([...selected, ...childIds]));
                            props.onSelectionChange(newSelected);
                        }
                    };

                    return (
                        <TableRow 
                            key={row.id}
                            sx={(theme) => ({
                                backgroundColor: theme.palette.mode === 'dark' ? '#111111' : '#f5f5f5',
                                '& .MuiTableCell-root': {
                                    color: theme.palette.text.primary,
                                    borderBottomColor: theme.palette.divider,
                                },
                                '& .MuiIconButton-root': {
                                    color: theme.palette.text.primary,
                                },
                                '& .MuiCheckbox-root': {
                                    color: theme.palette.text.secondary,
                                },
                                '& .MuiCheckbox-root.Mui-checked, & .MuiCheckbox-root.MuiCheckbox-indeterminate': {
                                    color: theme.palette.primary.main,
                                },
                            })}
                        >
                            {isSelectionEnabled && (
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        size="small"
                                        checked={isGroupSelected}
                                        indeterminate={isGroupIndeterminate}
                                        onChange={handleGroupSelect}
                                        onClick={(e) => e.stopPropagation()}
                                        sx={{ p: 0.5 }}
                                    />
                                </TableCell>
                            )}
                            {hasGrouping && (
                                <TableCell padding="checkbox" sx={{ width: 44 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                                        {grouping.length > 1 && row.level < grouping.length - 1 && (
                                            <Tooltip title={isGroupFullyExpanded?.(row.id) ? t('table.group.collapseAll') : t('table.group.expandAll')}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => {
                                                        const fullyExpanded = isGroupFullyExpanded?.(row.id);
                                                        if (fullyExpanded) {
                                                            handleCollapseGroupRecursively?.(row.id);
                                                        } else {
                                                            handleExpandGroupRecursively?.(row.id);
                                                        }
                                                    }}
                                                    sx={{ p: 0.25 }}
                                                >
                                                    {isGroupFullyExpanded?.(row.id) ? (
                                                        <UnfoldLessIcon fontSize="small" />
                                                    ) : (
                                                        <UnfoldMoreIcon fontSize="small" />
                                                    )}
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        <IconButton
                                            size="small"
                                            onClick={() => toggleGroupExpand && toggleGroupExpand(row.id)}
                                            sx={{ p: 0.25 }}
                                        >
                                            {isExpanded ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
                                        </IconButton>
                                    </Box>
                                </TableCell>
                            )}
                            <TableCell colSpan={visibleColumns.length} sx={{ py: 1, pl: (row.level * 3) + 1 }}>
                                <Typography variant="body2" fontWeight="bold" color="text.primary" sx={{ fontSize: '0.85rem' }}>
                                    {row.field}: {row.value} ({row.count})
                                </Typography>
                            </TableCell>
                        </TableRow>
                    );
                } else {
                    // Render Data Row
                    // If row comes from useCTable grouping logic, data is in row.data
                    const data = row.data || row; 
                    const id = row.id || data.id || index;
                    const isItemSelected = isSelected(id);
                    const labelId = `enhanced-table-checkbox-${index}`;
                    
                    // Determine indentation level for data rows
                    // If grouping is active, data rows are at level = grouping.length
                    // We can use row.level if available, otherwise 0
                    const level = row.level !== undefined ? row.level : 0;
                    const indent = level * 4; // 32px per level (theme.spacing(4))

                    return (
                        <TableRow
                            hover
                            onClick={(event: React.MouseEvent) => handleClick && handleClick(event, data)}
                            role="checkbox"
                            aria-checked={isItemSelected}
                            tabIndex={-1}
                            key={id}
                            selected={isItemSelected}
                            sx={{ cursor: 'pointer' }}
                        >
                            {isSelectionEnabled && (
                                <TableCell padding="checkbox" sx={{ pl: indent > 0 ? indent + 1 : undefined }}>
                                    <Checkbox
                                        color="primary"
                                        checked={isItemSelected}
                                        inputProps={{
                                            'aria-labelledby': labelId,
                                        }}
                                    />
                                </TableCell>
                            )}
                            {hasGrouping && <TableCell padding="checkbox" sx={{ width: 44 }} />}
                            {columns.filter((c: any) => visibleColumns.includes(c.id)).map((column: any, colIndex: number) => {
                                // If selection is not enabled, apply indentation to the first data column
                                const isFirstColumn = !isSelectionEnabled && colIndex === 0;
                                const cellSx = isFirstColumn && indent > 0 ? { pl: indent + 2 } : {};

                                return (
                                    <TableCell 
                                        key={column.id} 
                                        align="left"
                                        sx={cellSx}
                                    >
                                        {column.render ? column.render(data[column.id], data) : (
                                            (function formatValue() {
                                                const val = data[column.id];
                                                if (column.numeric) {
                                                    if (typeof val === 'number') return val.toLocaleString();
                                                    if (typeof val === 'string' && val.trim() !== '' && !isNaN(Number(val))) {
                                                        return Number(val).toLocaleString();
                                                    }
                                                }
                                                return val;
                                            })()
                                        )}
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                    );

                }
            })}
            {visibleRows.length === 0 && (
                <TableRow>
                    <TableCell colSpan={totalColumns} align="center">
                        {t('common.noData')}
                    </TableCell>
                </TableRow>
            )}
        </TableBody>
    );
};
