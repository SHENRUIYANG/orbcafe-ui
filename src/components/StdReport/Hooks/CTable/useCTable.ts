import { useState, useMemo, useEffect, useCallback } from 'react';
import { CTableProps } from './types';

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

    // Sync props
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

    // Grouped Rows
    const groupedRows = useMemo(() => {
        return getGroupedRows(sortedRows);
    }, [sortedRows, getGroupedRows]);

    // Pagination Logic (applied to the flattened grouped list)
    const visibleRows = useMemo(() => {
        if (rowsPerPage > 0) {
            return groupedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
        }
        return groupedRows;
    }, [groupedRows, page, rowsPerPage]);

    const toggleGroupExpand = (groupKey: string) => {
        const newExpanded = new Set(expandedGroups);
        if (newExpanded.has(groupKey)) {
            newExpanded.delete(groupKey);
        } else {
            newExpanded.add(groupKey);
        }
        setExpandedGroups(newExpanded);
    };

    const handleExpandGroupRecursively = (groupKey: string) => {
         // This is complex because we need to know all children keys.
         // For now, let's just toggle the single group.
         toggleGroupExpand(groupKey);
    };
    
    const handleCollapseGroupRecursively = (groupKey: string) => {
        // Remove all keys starting with groupKey
        const newExpanded = new Set(expandedGroups);
        Array.from(newExpanded).forEach(k => {
            if (k.startsWith(groupKey)) newExpanded.delete(k);
        });
        setExpandedGroups(newExpanded);
    };

    const handleToggleAll = (expand: boolean) => {
         if (!expand) {
             setExpandedGroups(new Set());
         } else {
             // For expand all, we need to generate all keys. 
             // Maybe we can optimize this later. 
             // For now, we can just "Collapse All" effectively.
         }
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

    // Layout Save
    const handleLayoutSave = (_e: any) => {
        if (props.onLayoutSave) {
            props.onLayoutSave({
                visibleColumns,
                order,
                orderBy,
                grouping,
                columnWidths
            });
        }
    };

    // Variant Load
    const handleVariantLoad = (variant: any) => {
        // Apply variant filters is handled by SmartFilter
        // Here we handle layout if present
        if (variant.layout) {
            if (variant.layout.visibleColumns) setVisibleColumns(variant.layout.visibleColumns);
            if (variant.layout.order) setOrder(variant.layout.order);
            if (variant.layout.orderBy) setOrderBy(variant.layout.orderBy);
            if (variant.layout.grouping) setGrouping(variant.layout.grouping);
            if (variant.layout.columnWidths) setColumnWidths(variant.layout.columnWidths);
        }
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
            if (col.numeric) {
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
    }, [filteredRows, props.columns, showSummary, visibleColumns]);

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
        summaryColumns: [],
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
        selected,
        setSelected,
        isAllExpanded: false,
        handleColumnResize,
        handleRequestSort,
        handleSelectAllClick,
        handleClick,
        toggleSummaryColumn: () => {},
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
        handleLayoutLoad: () => {},
        handleVariantLoad,
        handleLayoutSave,
        effectiveAppId: props.appId || '',
        currentLayoutData: {
            visibleColumns,
            order,
            orderBy,
            grouping,
            columnWidths
        },
        currentLayoutId: '',
        layoutIdToLoad: '',
        onPageChange: handleChangePage,
        onRowsPerPageChange: handleChangeRowsPerPage,
        graphReportOpen,
        handleOpenGraphReport,
        handleCloseGraphReport
    };
};
