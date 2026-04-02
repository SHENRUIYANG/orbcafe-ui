import { useState, useMemo, useEffect, useCallback } from 'react';
import { CTableProps } from './types';
import { resolveVariantLayout } from '../../Utils/variantUtils';

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

function getComparator<Key extends keyof any>(
    order: 'asc' | 'desc',
    orderBy: Key,
): (a: { [key in Key]: number | string }, b: { [key in Key]: number | string }) => number {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort<T>(array: readonly T[], comparator: (a: T, b: T) => number) {
    const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) {
            return order;
        }
        return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
}

export const useCTable = (props: CTableProps) => {
    const getDefaultColumnWidth = useCallback((column: any) => {
        const label = String(column?.label ?? column?.id ?? '');
        const estimatedByLabel = label.length * 9 + 64; // text + sort icon + paddings + resize handle
        const configuredMin = typeof column?.minWidth === 'number' ? column.minWidth : 0;
        return Math.max(100, configuredMin, estimatedByLabel);
    }, []);

    const getNumericColumnIds = useCallback(
        () => (props.columns || []).filter((c: any) => Boolean(c?.numeric)).map((c: any) => c.id),
        [props.columns],
    );

    // State
    const [filterText, setFilterText] = useState('');
    const [order, setOrder] = useState<'asc' | 'desc'>(props.order || 'asc');
    const [orderBy, setOrderBy] = useState<string>(props.orderBy || '');
    const [page, setPage] = useState(props.page || 0);
    const [rowsPerPage, setRowsPerPage] = useState(props.rowsPerPage || 20);
    const [selected, setSelected] = useState<any[]>(props.selected || []);
    const [visibleColumns, setVisibleColumns] = useState<string[]>(
        props.columns ? props.columns.map((c: any) => c.id) : []
    );
    const [showSummary, setShowSummary] = useState(props.showSummary || false);
    const [summaryColumns, setSummaryColumns] = useState<string[]>(() => getNumericColumnIds());
    const [grouping, setGrouping] = useState<string[]>([]);
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
        const initial: Record<string, number> = {};
        (props.columns || []).forEach((col: any) => {
            initial[col.id] = getDefaultColumnWidth(col);
        });
        return initial;
    });
    
    // Anchors
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [groupAnchorEl, setGroupAnchorEl] = useState<null | HTMLElement>(null);
    const [summaryAnchorEl, setSummaryAnchorEl] = useState<null | HTMLElement>(null);
    const [contextMenu, setContextMenu] = useState<{ mouseX: number; mouseY: number } | null>(null);
    const [graphReportOpen, setGraphReportOpen] = useState(false);
    const [currentLayoutId, setCurrentLayoutId] = useState<string>('');
    const [layoutIdToLoad, setLayoutIdToLoad] = useState<string>('');

    // Sync props
    useEffect(() => {
        if (props.layout) {
            handleLayoutLoad(props.layout);
        }
    }, [props.layout]);

    useEffect(() => {
        if (props.order !== undefined) setOrder(props.order);
        if (props.orderBy !== undefined) setOrderBy(props.orderBy);
    }, [props.order, props.orderBy]);

    useEffect(() => {
        if (props.selected !== undefined) {
            setSelected(props.selected);
        }
    }, [props.selected]);

    useEffect(() => {
        if (props.page !== undefined) {
            setPage(props.page);
        }
    }, [props.page]);

    useEffect(() => {
        if (props.rowsPerPage !== undefined) {
            setRowsPerPage(props.rowsPerPage);
        }
    }, [props.rowsPerPage]);

    useEffect(() => {
        const numericIds = getNumericColumnIds();
        setSummaryColumns((prev) => {
            const filtered = prev.filter((id) => numericIds.includes(id));
            return filtered;
        });
    }, [getNumericColumnIds]);

    // Ensure newly added columns always have a readable initial width.
    useEffect(() => {
        setColumnWidths((prev) => {
            const next = { ...prev };
            (props.columns || []).forEach((col: any) => {
                if (next[col.id] === undefined) {
                    next[col.id] = getDefaultColumnWidth(col);
                }
            });
            return next;
        });
    }, [props.columns, getDefaultColumnWidth]);

    // Filter Logic
    const filteredRows = useMemo(() => {
        let rows = props.rows || [];
        if (filterText) {
            rows = rows.filter((row: any) => {
                return Object.keys(row).some((key) => {
                    return String(row[key]).toLowerCase().includes(filterText.toLowerCase());
                });
            });
        }
        return rows;
    }, [props.rows, filterText]);

    // Sort Logic
    const sortedRows = useMemo(() => {
        if (props.onSortChange) return filteredRows;
        if (!orderBy) return filteredRows;
        return stableSort(filteredRows, getComparator(order, orderBy));
    }, [filteredRows, order, orderBy, props.onSortChange]);

    // Grouping Helper
    const getGroupedRows = useCallback((rows: any[]) => {
        if (grouping.length === 0) return rows.map(r => ({ type: 'row', data: r, id: r[props.rowKey || 'id'] }));

        // 1. Sort by grouping fields first
        const sortedByGroups = [...rows].sort((a, b) => {
            for (const field of grouping) {
                if (a[field] < b[field]) return -1;
                if (a[field] > b[field]) return 1;
            }
            return 0;
        });

        // Let's build a tree for easier counting and handling
        type GroupNode = {
            key: string;
            field: string;
            value: any;
            children: (GroupNode | any)[];
            count: number;
            level: number;
        };

        const buildTree = (items: any[], depth: number = 0): (GroupNode | any)[] => {
            if (depth >= grouping.length) return items;

            const field = grouping[depth];
            const groups: Record<string, GroupNode> = {};
            const result: (GroupNode | any)[] = [];

            items.forEach(item => {
                const value = item[field];
                const key = `${field}:${value}`; // Simple key
                
                if (!groups[key]) {
                    groups[key] = {
                        key,
                        field,
                        value,
                        children: [],
                        count: 0,
                        level: depth
                    };
                    result.push(groups[key]);
                }
                groups[key].children.push(item);
                groups[key].count++;
            });

            // Recurse
            result.forEach((node: any) => {
                if (node.children) {
                    node.children = buildTree(node.children, depth + 1);
                }
            });

            return result;
        };

        const tree = buildTree(sortedByGroups);

        // Flatten tree respecting expansion
        const flatten = (nodes: (GroupNode | any)[], parentKey: string = ''): any[] => {
            let flatList: any[] = [];
            
            nodes.forEach(node => {
                if (node.children) { // It's a group
                    const fullKey = parentKey ? `${parentKey}>${node.key}` : node.key;
                    const expanded = expandedGroups.has(fullKey);
                    
                    flatList.push({
                        type: 'group',
                id: fullKey,
                field: node.field,
                value: node.value,
                level: node.level,
                count: node.count,
                isExpanded: expanded,
                // Recursively gather all child IDs for this group
                childIds: (function getChildIds(n: GroupNode): any[] {
                    let ids: any[] = [];
                    n.children.forEach(c => {
                        if (c.children) {
                            ids = ids.concat(getChildIds(c));
                        } else {
                            ids.push(c[props.rowKey || 'id']);
                        }
                    });
                    return ids;
                })(node)
                    });

                    if (expanded) {
                        flatList = flatList.concat(flatten(node.children, fullKey));
                    }
                } else { // It's a row
                      flatList.push({ 
                          type: 'row', 
                          data: node, 
                          id: node[props.rowKey || 'id'],
                          level: grouping.length 
                      });
                 }
            });
            return flatList;
        };

        return flatten(tree);

    }, [grouping, expandedGroups, props.rowKey]);

    const getAllGroupKeys = useCallback((rows: any[]) => {
        if (grouping.length === 0) return [] as string[];

        const sortedByGroups = [...rows].sort((a, b) => {
            for (const field of grouping) {
                if (a[field] < b[field]) return -1;
                if (a[field] > b[field]) return 1;
            }
            return 0;
        });

        const keys: string[] = [];

        const visit = (items: any[], depth: number, parentKey: string) => {
            if (depth >= grouping.length) return;
            const field = grouping[depth];
            const groups = new Map<any, any[]>();

            items.forEach((item) => {
                const value = item[field];
                const bucket = groups.get(value);
                if (bucket) {
                    bucket.push(item);
                } else {
                    groups.set(value, [item]);
                }
            });

            groups.forEach((groupItems, value) => {
                const key = `${field}:${value}`;
                const fullKey = parentKey ? `${parentKey}>${key}` : key;
                keys.push(fullKey);
                visit(groupItems, depth + 1, fullKey);
            });
        };

        visit(sortedByGroups, 0, '');
        return keys;
    }, [grouping]);

    // Grouped Rows
    const groupedRows = useMemo(() => {
        return getGroupedRows(sortedRows);
    }, [sortedRows, getGroupedRows]);

    const allGroupKeys = useMemo(() => {
        return getAllGroupKeys(sortedRows);
    }, [sortedRows, getAllGroupKeys]);

    const isServerPaginated = useMemo(() => {
        const rowCount = (props.rows || []).length;
        return typeof props.count === 'number' && props.count > rowCount;
    }, [props.count, props.rows]);

    // Pagination Logic (applied to the flattened grouped list)
    const visibleRows = useMemo(() => {
        // In server-side pagination mode, rows are already paged by backend.
        // Do NOT slice again on the client after grouping.
        if (isServerPaginated) {
            return groupedRows;
        }
        if (rowsPerPage > 0) {
            return groupedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
        }
        return groupedRows;
    }, [groupedRows, page, rowsPerPage, isServerPaginated]);

    const totalDisplayCount = useMemo(() => {
        if (isServerPaginated) {
            return typeof props.count === 'number' ? props.count : groupedRows.length;
        }
        return groupedRows.length;
    }, [groupedRows.length, isServerPaginated, props.count]);

    const toggleGroupExpand = (groupKey: string) => {
        setExpandedGroups((prev) => {
            const next = new Set(prev);
            if (next.has(groupKey)) {
                next.delete(groupKey);
            } else {
                next.add(groupKey);
            }
            return next;
        });
    };

    const handleExpandGroupRecursively = (groupKey: string) => {
        const keysToExpand = allGroupKeys.filter((k) => k === groupKey || k.startsWith(`${groupKey}>`));
        setExpandedGroups((prev) => {
            const next = new Set(prev);
            keysToExpand.forEach((k) => next.add(k));
            return next;
        });
    };
    
    const handleCollapseGroupRecursively = (groupKey: string) => {
        setExpandedGroups((prev) => {
            const next = new Set(prev);
            Array.from(next).forEach((k) => {
                if (k === groupKey || k.startsWith(`${groupKey}>`)) next.delete(k);
            });
            return next;
        });
    };

    const handleToggleAll = (expand: boolean) => {
         if (!expand) {
             setExpandedGroups(new Set());
             return;
         }
         setExpandedGroups(new Set(allGroupKeys));
    };

    const isGroupFullyExpanded = (groupKey: string) => {
        const descendants = allGroupKeys.filter((k) => k.startsWith(`${groupKey}>`));
        if (descendants.length === 0) {
            return expandedGroups.has(groupKey);
        }
        return expandedGroups.has(groupKey) && descendants.every((k) => expandedGroups.has(k));
    };

    const handleRequestSort = (property: string) => {
        const isAsc = orderBy === property && order === 'asc';
        const isDesc = orderBy === property && order === 'desc';

        if (props.onSortChange) {
            if (isAsc) {
                props.onSortChange(property, 'desc');
            } else if (isDesc) {
                props.onSortChange('', 'asc');
            } else {
                props.onSortChange(property, 'asc');
            }
            return;
        }

        if (isAsc) {
            setOrder('desc');
            setOrderBy(property);
        } else if (isDesc) {
            setOrder('asc');
            setOrderBy('');
        } else {
            setOrder('asc');
            setOrderBy(property);
        }
    };

    const handleColumnResize = (columnId: string, width: number) => {
        setColumnWidths(prev => ({
            ...prev,
            [columnId]: width
        }));
    };

    const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const newSelected = filteredRows.map((n: any) => n[props.rowKey || 'id']);
            setSelected(newSelected);
            if (props.onSelectionChange) props.onSelectionChange(newSelected);
            return;
        }
        setSelected([]);
        if (props.onSelectionChange) props.onSelectionChange([]);
    };

    const handleClick = (_event: React.MouseEvent<unknown>, row: any) => {
        const id = row[props.rowKey || 'id'];
        const selectedIndex = selected.indexOf(id);
        let newSelected: any[] = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1),
            );
        }
        setSelected(newSelected);
        if (props.onSelectionChange) props.onSelectionChange(newSelected);
    };

    const handleChangePage = (newPage: number) => {
        setPage(newPage);
        if (props.onPageChange) props.onPageChange(newPage);
    };

    const handleChangeRowsPerPage = (newRowsPerPage: number) => {
        setRowsPerPage(newRowsPerPage);
        setPage(0);
        if (props.onPageChange) props.onPageChange(0);
        if (props.onRowsPerPageChange) props.onRowsPerPageChange(newRowsPerPage);
    };

    const toggleColumnVisibility = (columnId: string) => {
        const currentIndex = visibleColumns.indexOf(columnId);
        const newVisible = [...visibleColumns];

        if (currentIndex === -1) {
            newVisible.push(columnId);
        } else {
            newVisible.splice(currentIndex, 1);
        }
        setVisibleColumns(newVisible);
    };

    const toggleGroupField = (field: string) => {
        const currentIndex = grouping.indexOf(field);
        const newGrouping = [...grouping];

        if (currentIndex === -1) {
            newGrouping.push(field);
        } else {
            newGrouping.splice(currentIndex, 1);
        }
        setGrouping(newGrouping);
    };

    const toggleSummaryColumn = (field: string) => {
        const numericIds = getNumericColumnIds();
        if (!numericIds.includes(field)) return;

        setSummaryColumns((prev) => {
            if (prev.includes(field)) {
                return prev.filter((id) => id !== field);
            }
            return [...prev, field];
        });
    };

    // Layout Save
    const handleLayoutSave = (_e: any) => {
        if (props.onLayoutSave) {
            props.onLayoutSave({
                visibleColumns,
                order,
                orderBy,
                grouping,
                columnWidths,
                showSummary,
                summaryColumns,
            });
        }
    };

    // Variant Load
    const handleVariantLoad = (variant: any) => {
        const { layout, layoutId } = resolveVariantLayout(variant, props.tableKey || 'default');

        if (layoutId) {
            setLayoutIdToLoad(layoutId);
            setCurrentLayoutId(layoutId);
        } else {
            setLayoutIdToLoad('');
            setCurrentLayoutId('');
        }

        if (layout) {
            if (layout.visibleColumns) setVisibleColumns(layout.visibleColumns);
            if (layout.order) setOrder(layout.order);
            if (layout.orderBy) setOrderBy(layout.orderBy);
            if (layout.grouping) setGrouping(layout.grouping);
            if (layout.columnWidths) setColumnWidths(layout.columnWidths);
            if (layout.showSummary !== undefined) setShowSummary(Boolean(layout.showSummary));
            if (Array.isArray(layout.summaryColumns)) setSummaryColumns(layout.summaryColumns);
        }
    };

    const handleLayoutLoad = (layoutMeta: any) => {
        const layout = layoutMeta?.layoutData || layoutMeta?.layout || layoutMeta || {};
        if (layout.visibleColumns) setVisibleColumns(layout.visibleColumns);
        if (layout.order) setOrder(layout.order);
        if (layout.orderBy !== undefined) setOrderBy(layout.orderBy);
        if (layout.grouping) setGrouping(layout.grouping);
        if (layout.columnWidths) setColumnWidths(layout.columnWidths);
        if (layout.showSummary !== undefined) setShowSummary(Boolean(layout.showSummary));
        if (Array.isArray(layout.summaryColumns)) setSummaryColumns(layout.summaryColumns);
        setExpandedGroups(new Set());
        setPage(0);

        if (layoutMeta?.id) {
            setCurrentLayoutId(layoutMeta.id);
        }
        setLayoutIdToLoad('');
    };

    // Sync Layout Prop
    useEffect(() => {
        if (props.layout) {
            // If props.layout is the layout object itself
            handleVariantLoad({ layout: props.layout });
        }
    }, [props.layout]);

    // Context Menu
    const handleContextMenu = (event: React.MouseEvent) => {
        event.preventDefault();
        setContextMenu(
            contextMenu === null
                ? {
                      mouseX: event.clientX + 2,
                      mouseY: event.clientY - 6,
                  }
                : null,
        );
    };

    const handleCloseContextMenu = () => {
        setContextMenu(null);
    };

    // Summary Logic
    const summaryRow = useMemo(() => {
        if (!showSummary) return {};
        
        const summary: Record<string, any> = {};
        props.columns.forEach((col: any) => {
            if (col.numeric && summaryColumns.includes(col.id)) {
                const total = filteredRows.reduce((acc, curr) => {
                    const val = parseFloat(curr[col.id]);
                    return acc + (isNaN(val) ? 0 : val);
                }, 0);
                summary[col.id] = total.toFixed(2);
            } else {
                summary[col.id] = '';
            }
        });
        
        // Label the first visible non-numeric column as "Total" if possible
        const firstCol = props.columns.find((c: any) => visibleColumns.includes(c.id));
        if (firstCol && !firstCol.numeric) {
            summary[firstCol.id] = 'Total';
        }
        
        return summary;
    }, [filteredRows, props.columns, showSummary, summaryColumns, visibleColumns]);

    const handleExport = () => {
        if (!props.columns || !filteredRows) return;
        
        const headers = props.columns.map((c: any) => c.label).join(',');
        const rows = filteredRows.map((row: any) => 
            props.columns.map((c: any) => {
                const val = row[c.id];
                // Handle objects/arrays if necessary, or just stringify
                // Simple CSV escaping
                const stringVal = val === null || val === undefined ? '' : String(val);
                return `"${stringVal.replace(/"/g, '""')}"`;
            }).join(',')
        ).join('\n');
        
        const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${props.title || 'export'}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleOpenGraphReport = () => {
        setGraphReportOpen(true);
    };

    const handleCloseGraphReport = () => {
        setGraphReportOpen(false);
    };

    return {
        isMobile: false,
        columns: props.columns,
        order,
        orderBy,
        filterText,
        setFilterText,
        visibleColumns,
        setVisibleColumns,
        showSummary,
        setShowSummary,
        summaryColumns,
        grouping,
        setGrouping,
        expandedGroups,
        setExpandedGroups,
        groupAnchorEl,
        setGroupAnchorEl,
        summaryAnchorEl,
        setSummaryAnchorEl,
        columnWidths,
        setColumnWidths,
        anchorEl,
        setAnchorEl,
        contextMenu,
        setContextMenu,
        sensors: undefined,
        sortedAndFilteredRows: sortedRows, // Return all sorted rows for external use if needed
        visibleRows, // Pagination applied
        summaryRow,
        page,
        setPage: handleChangePage, // Correct signature
        rowsPerPage,
        setRowsPerPage: handleChangeRowsPerPage,
        totalDisplayCount,
        selected,
        setSelected,
        isAllExpanded: allGroupKeys.length > 0 && allGroupKeys.every((key) => expandedGroups.has(key)),
        handleColumnResize,
        handleRequestSort,
        handleSelectAllClick,
        handleClick,
        toggleSummaryColumn,
        handleDragEnd: () => {},
        handleExport,
        handleContextMenu,
        handleCloseContextMenu,
        toggleColumnVisibility,
        toggleGroupExpand,
        toggleGroupField,
        handleToggleAll,
        handleExpandGroupRecursively,
        handleCollapseGroupRecursively,
        isGroupFullyExpanded,
        handleLayoutLoad,
        handleVariantLoad,
        handleLayoutSave,
        effectiveAppId: props.appId || '',
        currentLayoutData: {
            visibleColumns,
            order,
            orderBy,
            grouping,
            columnWidths,
            showSummary,
            summaryColumns,
        },
        currentLayoutId,
        layoutIdToLoad,
        onPageChange: handleChangePage,
        onRowsPerPageChange: handleChangeRowsPerPage,
        graphReportOpen,
        handleOpenGraphReport,
        handleCloseGraphReport
    };
};
