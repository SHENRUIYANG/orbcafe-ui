/**
 * @file 10_Frontend/components/sap/ui/Common/PageComponents/CVariantManager.tsx
 * 
 * @summary Smart Component that encapsulates Variant Management logic (localStorage + UI).
 * @author ORBAICODER
 * @version 1.0.0
 * @date 2026-01-05
 * 
 * @description
 * This component wraps the presentational `CVariantManagement` molecule and adds:
 * 1. Automatic fetching of variants from localStorage.
 * 2. Handling of Save/Delete/SetDefault operations.
 * 3. Management of "Current Variant" state.
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CVariantManagement, VariantMetadata } from './Components/CVariantManagement';

const DEFAULT_API_URL = 'http://127.0.0.1:8515';

export interface IVariantService {
    getVariants: (appId: string) => Promise<VariantMetadata[]>;
    saveVariant: (variant: VariantMetadata, appId: string) => Promise<void>;
    deleteVariant: (id: string) => Promise<void>;
    setDefaultVariant: (id: string, appId: string) => Promise<void>;
}

interface CVariantManagerProps {
    appId: string;
    currentFilters?: Record<string, any> | any[];
    currentLayout?: any;
    currentLayoutId?: string;
    tableKey?: string;
    layoutRefs?: Array<{ tableKey: string; layoutId: string | null }>;
    onLoad: (variant: VariantMetadata) => void;
    variantService?: IVariantService;
    serviceUrl?: string;
    onError?: (message: string) => void;
    onSuccess?: (message: string) => void;
    currentVariantId?: string;
    onVariantChange?: (variantId: string) => void;
}

export const CVariantManager: React.FC<CVariantManagerProps> = ({
    appId,
    tableKey = 'default',
    currentFilters,
    currentLayoutId: propLayoutId,
    layoutRefs,
    onLoad,
    serviceUrl = DEFAULT_API_URL,
    onError,
    onSuccess,
    currentVariantId: propCurrentVariantId,
    onVariantChange
}) => {
    const [variants, setVariants] = useState<VariantMetadata[]>([]);
    const [internalCurrentVariantId, setInternalCurrentVariantId] = useState<string>('');

    const currentVariantId = propCurrentVariantId !== undefined ? propCurrentVariantId : internalCurrentVariantId;

    const handleVariantChange = (id: string) => {
        if (propCurrentVariantId === undefined) {
            setInternalCurrentVariantId(id);
        }
        if (onVariantChange) {
            onVariantChange(id);
        }
    };

    // --- Service Methods (Backend API) ---

    const fetchVariants = useCallback(async () => {
        if (!appId) return [];
        try {
            const response = await fetch(`${serviceUrl}/api/variants?appId=${encodeURIComponent(appId)}&tableKey=${encodeURIComponent(tableKey)}`);
            if (!response.ok) throw new Error('Failed to fetch variants');
            const data: VariantMetadata[] = await response.json();
            
            setVariants(data);
            
            // Check for default variant
            const defaultVariant = data.find((v: VariantMetadata) => v.isDefault);
            if (defaultVariant && !currentVariantId) {
                handleVariantChange(defaultVariant.id);
                onLoad(defaultVariant);
            }
            return data;
        } catch (e) {
            console.error("Error fetching variants", e);
            if (onError) onError('Failed to load variants');
            return [];
        }
    }, [appId, tableKey, serviceUrl, onError, currentVariantId, onLoad]);

    // Initial Load
    useEffect(() => {
        fetchVariants();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appId, tableKey]);

    const handleSave = async (metadata: Omit<VariantMetadata, 'id' | 'createdAt'>) => {
        try {
            // Check for existing variant to merge with (for multi-table support)
            const existingVariant = variants.find(v => v.name === metadata.name);
            const id = existingVariant ? existingVariant.id : Date.now().toString();

            // --- Merge Logic for Filters ---
            let filtersToSave: any[] = [];
            // 1. Load existing
            if (existingVariant) {
                if (Array.isArray(existingVariant.filters)) {
                    filtersToSave = [...existingVariant.filters];
                } else if (existingVariant.filters) {
                    // Migrate legacy single filters
                    filtersToSave = [{ scope: 'default', filters: existingVariant.filters }];
                }
            }
            // 2. Update/Append current
            if (metadata.scope === 'Search' || metadata.scope === 'Both') {
                const currentFiltersData = Array.isArray(currentFilters) ? currentFilters : currentFilters;
                
                if (currentFiltersData) {
                    if (Array.isArray(currentFiltersData) && currentFiltersData.length > 0 && currentFiltersData[0].scope) {
                         // It's already in the format, merge these entries
                         currentFiltersData.forEach((newItem: any) => {
                             const idx = filtersToSave.findIndex((f: any) => f.scope === newItem.scope);
                             if (idx >= 0) filtersToSave[idx] = newItem;
                             else filtersToSave.push(newItem);
                         });
                    } else {
                        // It's a raw filter object for the current tableKey
                        const newItem = { scope: tableKey, filters: currentFiltersData };
                        const idx = filtersToSave.findIndex((f: any) => f.scope === tableKey);
                        if (idx >= 0) filtersToSave[idx] = newItem;
                        else filtersToSave.push(newItem);
                    }
                }
            }

            // --- Merge Logic for Layout Data (Snapshot) ---
            let layoutToSave: any = existingVariant?.layout || {}; 
            
            // --- Merge Logic for Layout References (IDs) ---
            let layoutRefsToSave: any[] = [];
            if (existingVariant && Array.isArray(existingVariant.layoutRefs)) {
                layoutRefsToSave = [...existingVariant.layoutRefs];
            }
            
            if (metadata.scope === 'Layout' || metadata.scope === 'Both') {
                // If explicit refs passed
                if (layoutRefs && layoutRefs.length > 0) {
                     layoutRefs.forEach(ref => {
                        const idx = layoutRefsToSave.findIndex(r => r.tableKey === ref.tableKey);
                        if (idx >= 0) layoutRefsToSave[idx] = ref;
                        else layoutRefsToSave.push(ref);
                     });
                } else {
                    // Use current props
                    const ref = { tableKey: tableKey, layoutId: propLayoutId || null };
                    const idx = layoutRefsToSave.findIndex(r => r.tableKey === tableKey);
                    if (idx >= 0) layoutRefsToSave[idx] = ref;
                    else layoutRefsToSave.push(ref);
                }
            }

            const variantToSave: VariantMetadata = {
                appId, // Required by backend
                tableKey, // Required by backend
                ...metadata,
                id: id,
                createdAt: new Date().toISOString(),
                filters: filtersToSave,
                layout: layoutToSave, // Legacy or snapshot
                layoutRefs: layoutRefsToSave
            } as any; // Cast to any to include appId/tableKey which might not be in frontend interface yet

            const response = await fetch(`${serviceUrl}/api/variants`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(variantToSave)
            });

            if (!response.ok) throw new Error('Failed to save variant');
            
            if (onSuccess) onSuccess('Variant saved successfully');
            
            // Refresh list and select the new variant
            await fetchVariants();
            handleVariantChange(id);

            // Notify parent
            onLoad(variantToSave);
        } catch (e) {
            console.error("Error saving variant", e);
            if (onError) onError('Failed to save variant');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`${serviceUrl}/api/variants/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete variant');

            if (currentVariantId === id) {
                handleVariantChange('');
            }
            
            fetchVariants();
            if (onSuccess) onSuccess('Variant deleted successfully');
        } catch (e) {
            console.error("Error deleting variant", e);
            if (onError) onError('Failed to delete variant');
        }
    };

    const handleSetDefault = async (id: string) => {
        try {
            const variant = variants.find(v => v.id === id);
            if (!variant) return;

            const variantToSave = {
                appId,
                tableKey,
                ...variant,
                isDefault: true
            } as any;

            const response = await fetch(`${serviceUrl}/api/variants`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(variantToSave)
            });

            if (!response.ok) throw new Error('Failed to set default variant');

             await fetchVariants();
             if (onSuccess) onSuccess('Default variant updated');
        } catch (e) {
            console.error("Error setting default variant", e);
            if (onError) onError('Failed to update default variant');
        }
    };

    const handleLoad = (variant: VariantMetadata) => {
        handleVariantChange(variant.id);
        onLoad(variant);
    };

    return (
        <CVariantManagement
            variants={variants}
            currentVariantId={currentVariantId}
            onLoad={handleLoad}
            onSave={handleSave}
            onDelete={handleDelete}
            onSetDefault={handleSetDefault}
        />
    );
};
