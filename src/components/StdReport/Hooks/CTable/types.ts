import type { GraphReportConfig } from '../../../GraphReport/types';

export interface CTableQuickCreateConfig {
    enabled?: boolean;
    title?: string;
    description?: string;
    submitLabel?: string;
    cancelLabel?: string;
    fields?: string[];
    excludeFields?: string[];
    initialValues?: Record<string, any>;
    onSubmit?: (payload: Record<string, any>) => void | Promise<void>;
}

export interface CTableQuickEditConfig {
    enabled?: boolean;
    title?: string;
    description?: string;
    submitLabel?: string;
    cancelLabel?: string;
    fields?: string[];
    excludeFields?: string[];
    editableFields?: string[];
    nonEditableFields?: string[];
    primaryKeys?: string[];
    getInitialValues?: (row: Record<string, any>) => Record<string, any>;
    onSubmit?: (payload: Record<string, any>, row: Record<string, any>) => void | Promise<void>;
}

export interface CTableQuickDeleteConfig {
    enabled?: boolean;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: (rows: Record<string, any>[]) => void | Promise<void>;
}

export interface CTableProps {
    appId: string; // Required for Variant/Layout Management
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
    quickCreate?: CTableQuickCreateConfig;
    quickEdit?: CTableQuickEditConfig;
    quickDelete?: CTableQuickDeleteConfig;
    serviceUrl?: string;
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
    isGroupFullyExpanded?: (groupId: string) => boolean;
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
