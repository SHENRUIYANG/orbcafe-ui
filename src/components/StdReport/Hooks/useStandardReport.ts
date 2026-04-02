
import { useState, useEffect, useCallback } from 'react';
import { CStandardPageProps } from '../CStandardPage';
import type { GraphReportConfig } from '../../GraphReport/types';
import { useOrbcafeI18n } from '../../../i18n';
import type { IVariantService } from '../CVariantManager';
import { resolveVariantFilters, resolveVariantLayout } from '../Utils/variantUtils';

export interface ReportColumn {
    id: string;
    label: string;
    minWidth?: number;
    align?: 'left' | 'right' | 'center';
    format?: (value: any) => string;
    render?: (value: any, row: any) => React.ReactNode;
    type?: 'string' | 'number' | 'date' | 'boolean';
    [key: string]: any;
}

export interface ReportFilter {
    id: string;
    label: string;
    type: 'text' | 'select' | 'date' | 'number' | 'multi-select';
    options?: { label: string; value: any }[];
    placeholder?: string;
    defaultValue?: any;
    [key: string]: any;
}

export interface ReportMetadata {
    id: string;
    title: string;
    api?: {
        url: string;
        method?: 'GET' | 'POST';
        transformResponse?: (data: any) => any;
    } | ((params: any) => Promise<any>);
    columns: ReportColumn[];
    filters: ReportFilter[];
    variants?: any[]; // Initial variants
    layout?: any; // Initial layout
    graphReport?: GraphReportConfig;
}

export interface UseStandardReportOptions {
    metadata: ReportMetadata;
    fetchData?: (params: any) => Promise<any>; // Optional override for data fetching
    initialRowsPerPage?: number;
    rowsPerPageOptions?: number[];
    tableKey?: string;
    mode?: CStandardPageProps['mode'];
    serviceUrl?: string;
    variantService?: IVariantService;
}

export const useStandardReport = ({
    metadata,
    fetchData,
    initialRowsPerPage = 20,
    rowsPerPageOptions = [20, 50, 100, -1],
    tableKey = 'default',
    mode = 'integrated',
    serviceUrl,
    variantService,
}: UseStandardReportOptions) => {
    const { t } = useOrbcafeI18n();
    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState<any[]>([]);
    const [filters, setFilters] = useState<Record<string, any>>({});
    const [variants, setVariants] = useState<any[]>(metadata.variants || []);
    const [currentLayout, setCurrentLayout] = useState<any>(metadata.layout || null);
    const [currentVariantId, setCurrentVariantId] = useState<string>('');
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
    const [selection, setSelection] = useState<any[]>([]);
    const [order, setOrder] = useState<'asc' | 'desc'>('asc');
    const [orderBy, setOrderBy] = useState<string>('');

    // Initialize default filters
    useEffect(() => {
        const defaultFilters: Record<string, any> = {};
        metadata.filters.forEach(f => {
            if (f.defaultValue !== undefined) {
                defaultFilters[f.id] = f.defaultValue;
            }
        });
        setFilters(defaultFilters);
    }, [metadata.filters]);

    const handleFetchData = useCallback(async (currentFilters: any, currentPage: number, currentRowsPerPage: number, currentOrder?: 'asc' | 'desc', currentOrderBy?: string) => {
        setLoading(true);
        try {
            // Construct params
            const params = {
                ...currentFilters,
                page: currentPage + 1, // API usually 1-based
                limit: currentRowsPerPage,
                sort: currentOrderBy,
                order: currentOrder
            };

            let data;
            if (fetchData) {
                data = await fetchData(params);
            } else if (typeof metadata.api === 'function') {
                data = await metadata.api(params);
            } else if (metadata.api && typeof metadata.api === 'object') {
                // Default fetch implementation if URL is provided
                // This is a placeholder. In a real app, use a proper fetch wrapper
                console.log('Fetching from URL:', metadata.api.url, params);
                // Mock response for now if no real API
                data = { rows: [], total: 0 }; 
            } else {
                // Fallback / Mock
                 console.warn('No API configured for report');
                 data = { rows: [], total: 0 };
            }

            if (data) {
                setRows(data.rows || []);
                setTotal(data.total || 0);
            }
        } catch (error) {
            console.error('Failed to fetch report data', error);
        } finally {
            setLoading(false);
        }
    }, [metadata.api, fetchData]);

    // Initial load and on param change
    useEffect(() => {
        handleFetchData(filters, page, rowsPerPage, order, orderBy);
    }, [handleFetchData, page, rowsPerPage, order, orderBy]); 

    const handleSearch = () => {
        setPage(0); // Reset to first page
        handleFetchData(filters, 0, rowsPerPage, order, orderBy);
    };

    const handleRowsPerPageChange = (nextRowsPerPage: number) => {
        setPage(0);
        setRowsPerPage(nextRowsPerPage);
    };

    const handleSortChange = (property: string, direction: 'asc' | 'desc') => {
        setOrder(direction);
        setOrderBy(property);
    };

    const handleFilterChange = (newFilters: any) => {
        setFilters(newFilters);
    };

    const handleLoadVariant = (variant: any) => {
        setCurrentVariantId(variant?.id || '');

        const resolvedFilters = resolveVariantFilters(variant, tableKey);
        if (resolvedFilters) {
            const nextFilters = resolvedFilters.values ?? resolvedFilters;
            setFilters(nextFilters);
            handleFetchData(nextFilters, 0, rowsPerPage, order, orderBy);
            setPage(0);
        }

        const { layout } = resolveVariantLayout(variant, tableKey);
        if (layout) {
            setCurrentLayout(layout);
        }
    };

    const handleSaveVariant = (variantData: any) => {
        const newVariant = {
            ...variantData,
            id: Date.now().toString(),
            createdAt: new Date().toISOString()
        };
        setVariants(prev => [...prev, newVariant]);
        // In real app, save to backend
    };

    const handleLayoutSave = (layout: any) => {
        setCurrentLayout(layout);
        // In real app, save to backend
    };

    const pageProps: CStandardPageProps = {
        id: metadata.id, // Use metadata.id as the page ID
        title: metadata.title,
        mode,
        filterConfig: {
            appId: metadata.id, // Ensure appId is passed to CSmartFilter
            tableKey,
            fields: metadata.filters,
            filters: filters,
            onFilterChange: handleFilterChange,
            onSearch: handleSearch,
            onVariantLoad: handleLoadVariant,
            onVariantSave: handleSaveVariant,
            onVariantDelete: (id: any) => setVariants(prev => prev.filter(v => v.id !== id)),
            onVariantSetDefault: (id: any) => {
                setVariants(prev => prev.map(v => ({
                    ...v,
                    isDefault: v.id === id
                })));
            },
            variants: variants,
            currentVariantId,
            variantService,
            serviceUrl,
        },
        tableProps: {
            appId: metadata.id, // Ensure appId is passed to CTable for Layout Manager
            tableKey,
            columns: metadata.columns,
            rows: rows,
            loading: loading,
            rowKey: 'id', // Default to 'id', maybe configurable in metadata
            count: total,
            page: page,
            rowsPerPage: rowsPerPage,
            rowsPerPageOptions: rowsPerPageOptions,
            onPageChange: setPage,
            onRowsPerPageChange: handleRowsPerPageChange,
            selectionMode: 'multiple',
            selected: selection,
            onSelectionChange: setSelection,
            onLayoutSave: handleLayoutSave,
            layout: currentLayout,
            title: metadata.title,
            showSummary: true,
            order: order,
            orderBy: orderBy,
            serviceUrl,
            onSortChange: handleSortChange,
            graphReport: metadata.graphReport || { enabled: true, title: `${metadata.title} ${t('graph.reportTitle')}` }
        }
    };

    return {
        pageProps,
        // Expose internal state if needed
        filters,
        rows,
        loading,
        refresh: handleSearch
    };
};
