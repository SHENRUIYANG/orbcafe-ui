import type { GraphReportConfig } from '../../../GraphReport/types';

export interface CTableProps {
    appId?: string;
    title?: string;
    showToolbar?: boolean;
    columns: any[];
    rows: any[];
    loading?: boolean;
    rowKey?: string;
    fitContainer?: boolean;
    fullWidth?: boolean;
    maxHeight?: string;
    showSummary?: boolean;
    page?: number;
    rowsPerPage?: number;
    rowsPerPageOptions?: number[];
    count?: number;
    onPageChange?: (page: number) => void;
    onRowsPerPageChange?: (rowsPerPage: number) => void;
    filterConfig?: any;
    selectionMode?: 'single' | 'multiple';
    selected?: any[];
    onSelectionChange?: (selected: any[]) => void;
    actions?: any;
    extraTools?: any;
    onLayoutSave?: (layout: any) => void;
    tableKey?: string;
    layout?: any;
    order?: 'asc' | 'desc';
    orderBy?: string;
    onSortChange?: (property: string, direction: 'asc' | 'desc') => void;
    graphReport?: GraphReportConfig;
}

export interface CTableHeadProps {
    columns: any[];
    visibleColumns: string[];
    order: 'asc' | 'desc';
    orderBy: string;
    onRequestSort: (property: string) => void;
    onContextMenu?: (event: React.MouseEvent, columnId: string) => void;
    selectionMode?: 'single' | 'multiple';
    grouping?: string[];
    isAllExpanded?: boolean;
    handleToggleAll?: (expand: boolean) => void;
    rowCount?: number;
    numSelected?: number;
    onSelectAllClick?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    columnWidths?: Record<string, number>;
    onColumnResize?: (columnId: string, width: number) => void;
}

export interface CTableBodyProps {
    visibleRows: any[];
    columns: any[];
    visibleColumns: string[];
    selectionMode?: 'single' | 'multiple';
    selected?: any[];
    orderBy?: string;
    loading?: boolean;
    expandedGroups?: Set<string>;
    toggleGroupExpand?: (groupId: string) => void;
    handleExpandGroupRecursively?: (groupId: string) => void;
    handleCollapseGroupRecursively?: (groupId: string) => void;
    handleClick?: (event: React.MouseEvent, row: any) => void;
    onSelectionChange?: (selected: any[]) => void;
    grouping?: string[];
    rowKeyProp?: string;
    page?: number;
    rowsPerPage?: number;
}

export interface CTableCellProps {
    children?: React.ReactNode;
    align?: 'inherit' | 'left' | 'center' | 'right' | 'justify';
    scope?: string;
    padding?: 'checkbox' | 'none' | 'normal';
    sortDirection?: 'asc' | 'desc' | false;
    colSpan?: number;
    className?: string;
    sx?: any;
    onClick?: (event: React.MouseEvent) => void;
}

export interface CTableContainerProps {
    children?: React.ReactNode;
    sx?: any;
}

export interface CTableRowProps {
    children?: React.ReactNode;
    hover?: boolean;
    selected?: boolean;
    role?: string;
    ariaChecked?: boolean;
    tabIndex?: number;
    key?: string;
    onClick?: (event: React.MouseEvent) => void;
    sx?: any;
}
