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
import { useOrbcafeI18n } from '../../i18n';

export interface IVariantService {
    getVariants: (appId: string, tableKey?: string) => Promise<VariantMetadata[]>;
    saveVariant: (variant: VariantMetadata, appId: string, tableKey?: string) => Promise<void>;
    deleteVariant: (id: string) => Promise<void>;
    setDefaultVariant: (id: string, appId: string, tableKey?: string) => Promise<void>;
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
    variantService,
    serviceUrl,
    onError,
    onSuccess,
    currentVariantId: propCurrentVariantId,
    onVariantChange
}) => {
    const { t } = useOrbcafeI18n();
    const [variants, setVariants] = useState<VariantMetadata[]>([]);
    const [internalCurrentVariantId, setInternalCurrentVariantId] = useState<string>('');
    const storageKey = `orbcafe.variants.${appId}.${tableKey}`;

    const currentVariantId = propCurrentVariantId !== undefined ? propCurrentVariantId : internalCurrentVariantId;

    const handleVariantChange = (id: string) => {
        if (propCurrentVariantId === undefined) {
            setInternalCurrentVariantId(id);
        }
        if (onVariantChange) {
            onVariantChange(id);
        }
    };

    const loadVariantsFromLocal = useCallback((): VariantMetadata[] => {
        try {
            const raw = localStorage.getItem(storageKey);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) return [];
            return parsed as VariantMetadata[];
        } catch {
            return [];
        }
    }, [storageKey]);

    const saveVariantsToLocal = useCallback((nextVariants: VariantMetadata[]) => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(nextVariants));
        } catch {
            // ignore localStorage errors
        }
    }, [storageKey]);

    const applyVariants = useCallback((data: VariantMetadata[]) => {
        setVariants(data);
        const defaultVariant = data.find((v: VariantMetadata) => v.isDefault);
        if (defaultVariant && !currentVariantId) {
            handleVariantChange(defaultVariant.id);
            onLoad(defaultVariant);
        }
    }, [currentVariantId, onLoad, handleVariantChange]);

    // --- Service Methods (Backend API) ---

    const fetchVariants = useCallback(async () => {
        if (!appId) return [];
        try {
            let data: VariantMetadata[] = [];
            if (variantService) {
                data = await variantService.getVariants(appId, tableKey);
            } else if (serviceUrl) {
                const response = await fetch(`${serviceUrl}/api/variants?appId=${encodeURIComponent(appId)}&tableKey=${encodeURIComponent(tableKey)}`);
                if (!response.ok) throw new Error(t('variant.toast.fetchFailed'));
                data = await response.json();
            } else {
                data = loadVariantsFromLocal();
            }
            applyVariants(data);
            return data;
        } catch (e) {
            console.error("Error fetching variants", e);
            const localData = loadVariantsFromLocal();
            applyVariants(localData);
            if (onError) onError(t('variant.toast.fetchFailed'));
            return localData;
        }
    }, [appId, tableKey, variantService, serviceUrl, loadVariantsFromLocal, applyVariants, onError, t]);

    // Initial Load
    useEffect(() => {
        fetchVariants();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appId, tableKey]);

    const handleSave = async (metadata: Omit<VariantMetadata, 'id' | 'createdAt'>) => {
        let id = Date.now().toString();
        let variantToSave!: VariantMetadata;
        try {
            // Check for existing variant to merge with (for multi-table support)
            const existingVariant = variants.find(v => v.name === metadata.name);
            id = existingVariant ? existingVariant.id : Date.now().toString();

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

            variantToSave = {
                appId, // Required by backend
                tableKey, // Required by backend
                ...metadata,
                id: id,
                createdAt: new Date().toISOString(),
                filters: filtersToSave,
                layout: layoutToSave, // Legacy or snapshot
                layoutRefs: layoutRefsToSave
            } as any; // Cast to any to include appId/tableKey which might not be in frontend interface yet

            if (variantService) {
                await variantService.saveVariant(variantToSave, appId, tableKey);
            } else if (serviceUrl) {
                const response = await fetch(`${serviceUrl}/api/variants`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(variantToSave)
                });
                if (!response.ok) throw new Error(t('variant.toast.saveFailed'));
            } else {
                const hasReplaced = variants.some((v) => v.id === id);
                const nextVariants = hasReplaced
                    ? variants.map((v) => (v.id === id ? variantToSave : v))
                    : [...variants, variantToSave];
                setVariants(nextVariants);
                saveVariantsToLocal(nextVariants);
            }
            
            if (onSuccess) onSuccess(t('variant.toast.saveSuccess'));
            
            // Refresh list and select the new variant
            if (variantService || serviceUrl) {
                await fetchVariants();
            }
            handleVariantChange(id);

            // Notify parent
            onLoad(variantToSave);
        } catch (e) {
            console.error("Error saving variant", e);
            const hasReplaced = variants.some((v) => v.id === id);
            const nextVariants = hasReplaced
                ? variants.map((v) => (v.id === id ? variantToSave : v))
                : [...variants, variantToSave];
            setVariants(nextVariants);
            saveVariantsToLocal(nextVariants);
            handleVariantChange(id);
            onLoad(variantToSave);
            if (onError) onError(t('variant.toast.saveFailed'));
        }
    };

    const handleDelete = async (id: string) => {
        try {
            if (variantService) {
                await variantService.deleteVariant(id);
            } else if (serviceUrl) {
                const response = await fetch(`${serviceUrl}/api/variants/${id}`, {
                    method: 'DELETE'
                });
                if (!response.ok) throw new Error(t('variant.toast.deleteFailed'));
            } else {
                const nextVariants = variants.filter((v) => v.id !== id);
                setVariants(nextVariants);
                saveVariantsToLocal(nextVariants);
            }

            if (currentVariantId === id) {
                handleVariantChange('');
            }
            
            if (variantService || serviceUrl) {
                fetchVariants();
            }
            if (onSuccess) onSuccess(t('variant.toast.deleteSuccess'));
        } catch (e) {
            console.error("Error deleting variant", e);
            const nextVariants = variants.filter((v) => v.id !== id);
            setVariants(nextVariants);
            saveVariantsToLocal(nextVariants);
            if (currentVariantId === id) {
                handleVariantChange('');
            }
            if (onError) onError(t('variant.toast.deleteFailed'));
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

            if (variantService) {
                await variantService.setDefaultVariant(id, appId, tableKey);
            } else if (serviceUrl) {
                const response = await fetch(`${serviceUrl}/api/variants`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(variantToSave)
                });
                if (!response.ok) throw new Error(t('variant.toast.defaultFailed'));
            } else {
                const nextVariants = variants.map((v) => ({ ...v, isDefault: v.id === id }));
                setVariants(nextVariants);
                saveVariantsToLocal(nextVariants);
            }

            if (variantService || serviceUrl) {
                await fetchVariants();
            }
            if (onSuccess) onSuccess(t('variant.toast.defaultSuccess'));
        } catch (e) {
            console.error("Error setting default variant", e);
            const nextVariants = variants.map((v) => ({ ...v, isDefault: v.id === id }));
            setVariants(nextVariants);
            saveVariantsToLocal(nextVariants);
            if (onError) onError(t('variant.toast.defaultFailed'));
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
