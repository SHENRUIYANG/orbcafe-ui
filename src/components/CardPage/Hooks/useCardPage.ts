'use client';

/**
 * @file useCardPage.ts
 * @summary Data hook for CCardPage — mirrors useStandardReport for card catalogs.
 *
 * @description
 * Wires a metadata-driven definition (filters + variants) to the CCardPage
 * component: manages filter state, variant load/save and data fetching, and
 * returns ready-to-spread `pageProps` for `CCardPage`.
 *
 * The `fetchData` contract is identical to `useStandardReport`
 * (`{ rows, total }`), so the same backend endpoint can serve both a table
 * report and a card catalog.
 */

import { useCallback, useEffect, useState } from 'react';
import type { CCardPageProps } from '../CCardPage';
import type { CCardItem } from '../CCardGrid';
import type { ReportFilter } from '../../StdReport/Hooks/useStandardReport';
import type { IVariantService } from '../../StdReport/CVariantManager';
import { resolveVariantFilters } from '../../StdReport/Utils/variantUtils';

export interface CardPageMetadata {
    id: string;
    title: string;
    /** Filter fields for the smart filter bar (same shape as StdReport) */
    filters: ReportFilter[];
    /** Initial filter variants */
    variants?: any[];
}

export interface UseCardPageOptions {
    metadata: CardPageMetadata;
    /** Data source. Receives filter + paging params, resolves to `{ rows, total }`. */
    fetchData?: (params: Record<string, unknown>) => Promise<{ rows: CCardItem[]; total: number }>;
    tableKey?: string;
    variantService?: IVariantService;
    serviceUrl?: string;
    /** Called when the "view details" button of a card is pressed */
    onDetailClick?: (item: CCardItem) => void;
    /** Called when the "download" button of a card is pressed */
    onDownloadClick?: (item: CCardItem) => void;
    /** Minimum card width in px for the responsive grid */
    minCardWidth?: number;
}

export const useCardPage = ({
    metadata,
    fetchData,
    tableKey = 'default',
    variantService,
    serviceUrl,
    onDetailClick,
    onDownloadClick,
    minCardWidth,
}: UseCardPageOptions) => {
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<CCardItem[]>([]);
    const [total, setTotal] = useState(0);
    const [filters, setFilters] = useState<Record<string, any>>({});
    const [variants, setVariants] = useState<any[]>(metadata.variants || []);
    const [currentVariantId, setCurrentVariantId] = useState<string>('');

    // Initialize default filters
    useEffect(() => {
        const defaultFilters: Record<string, any> = {};
        metadata.filters.forEach((f) => {
            if (f.defaultValue !== undefined) {
                defaultFilters[f.id] = f.defaultValue;
            }
        });
        setFilters(defaultFilters);
    }, [metadata.filters]);

    const handleFetchData = useCallback(
        async (currentFilters: Record<string, any>) => {
            setLoading(true);
            try {
                const data = fetchData
                    ? await fetchData({ ...currentFilters })
                    : { rows: [] as CCardItem[], total: 0 };
                setItems(data?.rows || []);
                setTotal(data?.total || 0);
            } catch (error) {
                console.error('Failed to fetch card page data', error);
            } finally {
                setLoading(false);
            }
        },
        [fetchData],
    );

    // Initial load
    useEffect(() => {
        handleFetchData(filters);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [handleFetchData]);

    const handleSearch = () => {
        handleFetchData(filters);
    };

    const handleFilterChange = (newFilters: Record<string, any>) => {
        setFilters(newFilters);
    };

    const handleLoadVariant = (variant: any) => {
        setCurrentVariantId(variant?.id || '');

        const resolvedFilters = resolveVariantFilters(variant, tableKey);
        if (resolvedFilters) {
            const nextFilters = resolvedFilters.values ?? resolvedFilters;
            setFilters(nextFilters);
            handleFetchData(nextFilters);
        }
    };

    const handleSaveVariant = (variantData: any) => {
        const newVariant = {
            ...variantData,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
        };
        setVariants((prev) => [...prev, newVariant]);
        // In a real app, persist to the backend here
    };

    const pageProps: CCardPageProps = {
        id: metadata.id,
        title: metadata.title,
        filterConfig: {
            appId: metadata.id,
            tableKey,
            fields: metadata.filters,
            filters,
            onFilterChange: handleFilterChange,
            onSearch: handleSearch,
            onVariantLoad: handleLoadVariant,
            onVariantSave: handleSaveVariant,
            onVariantDelete: (id: any) => setVariants((prev) => prev.filter((v) => v.id !== id)),
            onVariantSetDefault: (id: any) => {
                setVariants((prev) => prev.map((v) => ({ ...v, isDefault: v.id === id })));
            },
            variants,
            currentVariantId,
            variantService,
            serviceUrl,
        },
        gridProps: {
            items,
            loading,
            onDetailClick,
            onDownloadClick,
            minCardWidth,
        },
    };

    return {
        pageProps,
        items,
        total,
        filters,
        loading,
        refresh: handleSearch,
    };
};
