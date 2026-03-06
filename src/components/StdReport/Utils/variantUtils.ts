/**
 * @file 10_Frontend/components/sap/ui/Common/PageComponents/Utils/variantUtils.ts
 * @summary Utility functions for handling Variant schemas and migrations.
 * @author ORBAICODER
 * @date 2026-02-27
 */

import { VariantMetadata } from '../Components/CVariantManagement';

/**
 * Resolves the filter configuration for a specific table/scope from a variant.
 * Handles both legacy (direct object) and new (scoped array) schemas.
 * 
 * @param variant The variant metadata object
 * @param tableKey The key/scope of the table to find filters for
 * @returns The filter configuration object or null if not found
 */
export const resolveVariantFilters = (variant: VariantMetadata | null | undefined, tableKey: string): any => {
    if (!variant || !variant.filters) return null;

    // 1. New Schema: Array of scoped filters
    if (Array.isArray(variant.filters)) {
        // Try exact match first
        const exactMatch = variant.filters.find((f: any) => f.scope === tableKey);
        if (exactMatch) return exactMatch.filters;

        // Try 'default' scope fallback
        const defaultMatch = variant.filters.find((f: any) => f.scope === 'default');
        if (defaultMatch) return defaultMatch.filters;

        // If only one entry exists and it has no scope or generic scope, maybe return it?
        // For now, strict matching is safer.
        return null;
    }

    // 2. Legacy Schema: Direct object (assuming it applies to the current context)
    if (typeof variant.filters === 'object') {
        return variant.filters;
    }

    return null;
};

/**
 * Resolves the layout configuration or ID for a specific table from a variant.
 * 
 * @param variant The variant metadata object
 * @param tableKey The key of the table
 * @returns Object containing { layout: any, layoutId: string | null }
 */
export const resolveVariantLayout = (variant: VariantMetadata | null | undefined, tableKey: string): { layout: any, layoutId: string | null } => {
    if (!variant) return { layout: null, layoutId: null };

    let layoutId: string | null = null;
    let layout: any = null;

    // 1. Check layoutRefs (New Schema for linked layouts)
    if (Array.isArray(variant.layoutRefs)) {
        const ref = variant.layoutRefs.find((r: any) => r.tableKey === tableKey);
        if (ref) {
            layoutId = ref.layoutId;
        }
    }

    // 2. Fallback to root layoutId (Legacy)
    if (!layoutId && variant.layoutId) {
        layoutId = variant.layoutId;
    }

    // 3. Check embedded layout (Snapshot)
    // If variant.layout is an object, it might be the layout data itself
    if (variant.layout && typeof variant.layout === 'object' && !Array.isArray(variant.layout)) {
        layout = variant.layout;
    }

    return { layoutId, layout };
};
