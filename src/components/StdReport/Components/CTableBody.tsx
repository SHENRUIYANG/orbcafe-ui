import { KeyboardArrowDownIcon, KeyboardArrowRightIcon, UnfoldLessIcon, UnfoldMoreIcon } from '../../../lib/orbis-compat';
import React from 'react';
import {  CIconButton, CTypography, CCheckbox, CTooltip } from "../../Atoms";
import { CTableBodyProps } from '../Hooks/CTable/types';
import { useOrbcafeI18n } from '../../../i18n';
import {
    tableControlCheckboxSx,
    tableControlIconButtonSx,
    tableGroupControlCellSx,
    tableGroupControlsSx,
    tableSelectionCellSx,
} from './ctableControlSx';

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
        emptyLabel,
        getRowDataKey,
        getRowProps,
        getGroupRowProps,
    } = props;

    const isSelected = (id: any) => selected.indexOf(id) !== -1;
    const isSelectionEnabled = selectionMode === 'multiple' || selectionMode === 'single';
    const hasGrouping = grouping.length > 0;

    // Helper to calculate colSpan for group rows
    const totalColumns = visibleColumns.length + (isSelectionEnabled ? 1 : 0) + (hasGrouping ? 1 : 0);

    return (
        <tbody>
            {visibleRows.map((row: any, index: number) => {
                if (row.type === 'group') {
                    // Render Group Header
                    const isExpanded = expandedGroups.has(row.id);
                    // Determine selection state for group
                    const childIds = row.childIds || [];
                    const selectedChildCount = childIds.filter((id: any) => isSelected(id)).length;
                    const isGroupSelected = childIds.length > 0 && selectedChildCount === childIds.length;
                    const isGroupIndeterminate = selectedChildCount > 0 && selectedChildCount < childIds.length;
                    const groupContext = {
                        entry: row,
                        data: row,
                        id: row.id,
                        index,
                        selected: isGroupSelected,
                        group: true,
                    };
                    const customGroupRowProps = getGroupRowProps?.(groupContext) || {};
                    const {
                        className: customGroupClassName,
                        onClick: customGroupOnClick,
                        ...groupRowProps
                    } = customGroupRowProps;

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
                        <tr
                            key={row.id}
                            {...groupRowProps}
                            data-ctable-row-key={getRowDataKey?.(groupContext)}
                            className={['orb-table-group-row', customGroupClassName].filter(Boolean).join(' ')}
                            onClick={customGroupOnClick}
                            sx={(theme) => ({
                                backgroundColor: 'var(--orb-surface)',
                                '& th, & td': {
                                    color: theme.palette.text.primary,
                                    borderBottomColor: theme.palette.divider,
                                },
                                '& .orb-icon-btn': {
                                    color: theme.palette.text.primary,
                                },
                                '& .orb-chk': {
                                    color: theme.palette.text.secondary,
                                },
                                '& .orb-chk:has(input:checked), & .orb-chk:has(input:indeterminate)': {
                                    color: theme.palette.primary.main,
                                },
                            })}
                        >
                            {isSelectionEnabled && (
                                <td padding="checkbox" sx={tableSelectionCellSx}>
                                    <CCheckbox
                                        size="small"
                                        checked={isGroupSelected}
                                        indeterminate={isGroupIndeterminate}
                                        onChange={handleGroupSelect}
                                        onClick={(e) => e.stopPropagation()}
                                        sx={tableControlCheckboxSx}
                                    />
                                </td>
                            )}
                            {hasGrouping && (
                                <td padding="checkbox" sx={tableGroupControlCellSx}>
                                    <div sx={tableGroupControlsSx}>
                                        {grouping.length > 1 && row.level < grouping.length - 1 && (
                                            <CTooltip title={isGroupFullyExpanded?.(row.id) ? t('table.group.collapseAll') : t('table.group.expandAll')}>
                                                <CIconButton
                                                    size="small"
                                                    onClick={() => {
                                                        const fullyExpanded = isGroupFullyExpanded?.(row.id);
                                                        if (fullyExpanded) {
                                                            handleCollapseGroupRecursively?.(row.id);
                                                        } else {
                                                            handleExpandGroupRecursively?.(row.id);
                                                        }
                                                    }}
                                                    sx={tableControlIconButtonSx}
                                                >
                                                    {isGroupFullyExpanded?.(row.id) ? (
                                                        <UnfoldLessIcon />
                                                    ) : (
                                                        <UnfoldMoreIcon />
                                                    )}
                                                </CIconButton>
                                            </CTooltip>
                                        )}
                                        <CIconButton
                                            size="small"
                                            onClick={() => toggleGroupExpand && toggleGroupExpand(row.id)}
                                            sx={tableControlIconButtonSx}
                                        >
                                            {isExpanded ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
                                        </CIconButton>
                                    </div>
                                </td>
                            )}
                            <td colSpan={visibleColumns.length} sx={{ py: 1, pl: (row.level * 3) + 1 }}>
                                <CTypography variant="body2" fontWeight="bold" color="text.primary" sx={{ fontSize: '0.85rem' }}>
                                    {row.field}: {row.value} ({row.count})
                                </CTypography>
                            </td>
                        </tr>
                    );
                } else {
                    // Render Data Row
                    // If row comes from useCTable grouping logic, data is in row.data
                    const data = row.data || row;
                    const id = row.id || data.id || index;
                    const isItemSelected = isSelected(id);
                    const labelId = `enhanced-table-checkbox-${index}`;
                    const rowContext = {
                        entry: row,
                        data,
                        id,
                        index,
                        selected: isItemSelected,
                        group: false,
                    };
                    const customRowProps = getRowProps?.(rowContext) || {};
                    const {
                        className: customRowClassName,
                        onClick: customRowOnClick,
                        ...rowProps
                    } = customRowProps;

                    // Determine indentation level for data rows
                    // If grouping is active, data rows are at level = grouping.length
                    // We can use row.level if available, otherwise 0
                    const level = row.level !== undefined ? row.level : 0;
                    const indent = level * 4; // 32px per level (theme.spacing(4))

                    return (
                        <tr
                            key={id}
                            {...rowProps}
                            data-ctable-row-key={getRowDataKey?.(rowContext)}
                            className={[isItemSelected ? 'orb-is-selected' : '', customRowClassName].filter(Boolean).join(' ')}
                            onClick={(event: React.MouseEvent<HTMLTableRowElement>) => {
                                customRowOnClick?.(event);
                                if (!event.defaultPrevented) handleClick?.(event, data);
                            }}
                            role={isSelectionEnabled ? 'checkbox' : rowProps.role}
                            aria-checked={isSelectionEnabled ? isItemSelected : rowProps['aria-checked']}
                            tabIndex={rowProps.tabIndex ?? -1}
                        >
                            {isSelectionEnabled && (
                                <td padding="checkbox" sx={tableSelectionCellSx}>
                                    <CCheckbox
                                        color="primary"
                                        checked={isItemSelected}
                                        inputProps={{
                                            'aria-labelledby': labelId,
                                        }}
                                        sx={tableControlCheckboxSx}
                                    />
                                </td>
                            )}
                            {hasGrouping && <td padding="checkbox" sx={tableGroupControlCellSx} />}
                            {columns.filter((c: any) => visibleColumns.includes(c.id)).map((column: any, colIndex: number) => {
                                // Keep control columns fixed; apply grouping indentation to the first data column.
                                const isFirstColumn = colIndex === 0;
                                const cellSx = isFirstColumn && indent > 0 ? { pl: indent + 2 } : {};

                                return (
                                    <td
                                        key={column.id}
                                        className={column.numeric ? 'orb-num' : undefined}
                                        align={column.numeric ? 'right' : 'left'}
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
                                    </td>
                                );
                            })}
                        </tr>
                    );

                }
            })}
            {visibleRows.length === 0 && (
                <tr>
                    <td colSpan={totalColumns} align="center">
                        {emptyLabel ?? t('common.noData')}
                    </td>
                </tr>
            )}
        </tbody>
    );
};
