/**
 * @file 10_Frontend/components/sap/ui/Common/PageComponents/CLayoutManager.tsx
 *
 * @summary Smart component that encapsulates layout management via backend APIs.
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CLayoutManagement, LayoutMetadata } from '../Molecules/CLayoutManagement';
import { useOrbcafeI18n } from '../../i18n';

export interface CLayoutManagerProps {
    appId: string;
    tableKey?: string; // Optional table identifier for multi-table apps
    currentLayoutData: any; // The actual table state (columns, sort, etc.) to be saved
    onLayoutLoad: (layout: LayoutMetadata) => void;
    targetLayoutId?: string | null;
    activeLayoutId?: string; // Current active layout ID from parent
    serviceUrl?: string;
    onError?: (message: string) => void;
    onSuccess?: (message: string) => void;
}

export const CLayoutManager: React.FC<CLayoutManagerProps> = ({
    appId,
    tableKey = "default",
    currentLayoutData,
    onLayoutLoad,
    targetLayoutId,
    activeLayoutId,
    serviceUrl,
    onError,
    onSuccess
}) => {
    const { t } = useOrbcafeI18n();
    const [layouts, setLayouts] = useState<LayoutMetadata[]>([]);
    const [currentLayoutId, setCurrentLayoutId] = useState<string>('');
    const storageKey = `orbcafe.layouts.${appId}.${tableKey}`;

    interface BackendLayout {
        appId: string;
        tableKey: string;
        layoutId: string;
        name: string;
        isDefault?: boolean;
        isPublic?: boolean;
        layout: any;
        createdAt?: string;
        description?: string;
    }

    const toFrontendLayout = (item: BackendLayout): LayoutMetadata => ({
        id: item.layoutId,
        name: item.name,
        description: item.description ?? '',
        isDefault: Boolean(item.isDefault),
        isPublic: Boolean(item.isPublic),
        createdAt: item.createdAt ?? new Date().toISOString(),
        layoutData: item.layout ?? {}
    });

    const toBackendLayout = (item: LayoutMetadata): BackendLayout => ({
        appId,
        tableKey,
        layoutId: item.id,
        name: item.name,
        description: item.description ?? '',
        isDefault: Boolean(item.isDefault),
        isPublic: Boolean(item.isPublic),
        createdAt: item.createdAt,
        layout: item.layoutData
    });

    const loadLayoutsFromLocal = useCallback((): LayoutMetadata[] => {
        try {
            const raw = localStorage.getItem(storageKey);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) return [];
            return parsed as LayoutMetadata[];
        } catch {
            return [];
        }
    }, [storageKey]);

    const saveLayoutsToLocal = useCallback((nextLayouts: LayoutMetadata[]) => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(nextLayouts));
        } catch {
            // ignore localStorage errors (quota / SSR guards)
        }
    }, [storageKey]);

    // Sync active layout ID from parent
    useEffect(() => {
        if (activeLayoutId !== undefined) {
            setCurrentLayoutId(activeLayoutId);
        }
    }, [activeLayoutId]);

    // Handle targetLayoutId (load request from parent, e.g. from Variant)
    useEffect(() => {
        if (targetLayoutId && layouts.length > 0) {
            const layoutToLoad = layouts.find(l => l.id === targetLayoutId);
            if (layoutToLoad) {
                setCurrentLayoutId(layoutToLoad.id);
                onLayoutLoad(layoutToLoad);
            }
        }
    }, [targetLayoutId, layouts, onLayoutLoad]);

    const fetchLayouts = useCallback(async () => {
        if (!appId) return;
        if (!serviceUrl) {
            const localLayouts = loadLayoutsFromLocal();
            setLayouts(localLayouts);
            const defaultLayout = localLayouts.find((l: LayoutMetadata) => l.isDefault);
            if (defaultLayout && !currentLayoutId && !targetLayoutId) {
                setCurrentLayoutId(defaultLayout.id);
                onLayoutLoad(defaultLayout);
            }
            return;
        }
        try {
            const response = await fetch(
                `${serviceUrl}/api/layouts?appId=${encodeURIComponent(appId)}&tableKey=${encodeURIComponent(tableKey)}`
            );
            if (!response.ok) throw new Error('LAYOUT_FETCH_FAILED');
            const backendData: BackendLayout[] = await response.json();
            const data = backendData.map(toFrontendLayout);
            setLayouts(data);

            const defaultLayout = data.find((l: LayoutMetadata) => l.isDefault);
            if (defaultLayout && !currentLayoutId && !targetLayoutId) {
                setCurrentLayoutId(defaultLayout.id);
                onLayoutLoad(defaultLayout);
            }
        } catch (e) {
            console.error("Error fetching layouts", e);
            const localLayouts = loadLayoutsFromLocal();
            setLayouts(localLayouts);
            const defaultLayout = localLayouts.find((l: LayoutMetadata) => l.isDefault);
            if (defaultLayout && !currentLayoutId && !targetLayoutId) {
                setCurrentLayoutId(defaultLayout.id);
                onLayoutLoad(defaultLayout);
            }
            if (onError) onError(t('layout.toast.loadFallback'));
        }
    }, [appId, tableKey, serviceUrl, onError, currentLayoutId, onLayoutLoad, targetLayoutId, loadLayoutsFromLocal, t]);

    useEffect(() => {
        fetchLayouts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appId, tableKey]);

    const handleSave = async (metadata: Omit<LayoutMetadata, 'id' | 'createdAt' | 'layoutData'>) => {
        const existing = layouts.find(l => l.name === metadata.name);
        const id = existing ? existing.id : Date.now().toString();
        const layoutToSave: LayoutMetadata = {
            id,
            ...metadata,
            createdAt: new Date().toISOString(),
            layoutData: currentLayoutData,
            isDefault: metadata.isDefault ?? false,
            isPublic: metadata.isPublic ?? false
        };
        if (!serviceUrl) {
            const hasReplaced = layouts.some((l) => l.id === id);
            const nextLayouts = hasReplaced
                ? layouts.map((l) => (l.id === id ? layoutToSave : l))
                : [...layouts, layoutToSave];
            setLayouts(nextLayouts);
            saveLayoutsToLocal(nextLayouts);
            setCurrentLayoutId(id);
            onLayoutLoad(layoutToSave);
            if (onSuccess) onSuccess(t('layout.toast.saveLocalSuccess'));
            return;
        }
        try {
            const response = await fetch(`${serviceUrl}/api/layouts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(toBackendLayout(layoutToSave))
            });
            if (!response.ok) throw new Error('LAYOUT_SAVE_FAILED');

            if (onSuccess) onSuccess(t('layout.toast.saveSuccess'));
            await fetchLayouts();
            setCurrentLayoutId(id);
            onLayoutLoad(layoutToSave);
        } catch (e) {
            console.error("Error saving layout", e);
            const hasReplaced = layouts.some((l) => l.id === id);
            const nextLayouts = hasReplaced
                ? layouts.map((l) => (l.id === id ? layoutToSave : l))
                : [...layouts, layoutToSave];
            setLayouts(nextLayouts);
            saveLayoutsToLocal(nextLayouts);
            setCurrentLayoutId(id);
            onLayoutLoad(layoutToSave);
            if (onSuccess) onSuccess(t('layout.toast.saveLocalSuccess'));
            if (onError) onError(t('layout.toast.backendUnavailableSavedLocal'));
        }
    };

    const handleDelete = async (id: string) => {
        if (!serviceUrl) {
            const nextLayouts = layouts.filter((l) => l.id !== id);
            setLayouts(nextLayouts);
            saveLayoutsToLocal(nextLayouts);
            if (currentLayoutId === id) setCurrentLayoutId('');
            if (onSuccess) onSuccess(t('layout.toast.deleteLocalSuccess'));
            return;
        }
        try {
            const response = await fetch(`${serviceUrl}/api/layouts/${encodeURIComponent(id)}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('LAYOUT_DELETE_FAILED');

            if (currentLayoutId === id) setCurrentLayoutId('');
            if (onSuccess) onSuccess(t('layout.toast.deleteSuccess'));
            await fetchLayouts();
        } catch (e) {
            console.error("Error deleting layout", e);
            const nextLayouts = layouts.filter((l) => l.id !== id);
            setLayouts(nextLayouts);
            saveLayoutsToLocal(nextLayouts);
            if (currentLayoutId === id) setCurrentLayoutId('');
            if (onSuccess) onSuccess(t('layout.toast.deleteLocalSuccess'));
            if (onError) onError(t('layout.toast.backendUnavailableDeletedLocal'));
        }
    };

    const handleSetDefault = async (id: string) => {
        if (!serviceUrl) {
            const nextLayouts = layouts.map((l) => ({ ...l, isDefault: l.id === id }));
            setLayouts(nextLayouts);
            saveLayoutsToLocal(nextLayouts);
            if (onSuccess) onSuccess(t('layout.toast.defaultLocalSuccess'));
            return;
        }
        try {
            const layout = layouts.find(l => l.id === id);
            if (!layout) return;

            const response = await fetch(`${serviceUrl}/api/layouts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(toBackendLayout({ ...layout, isDefault: true }))
            });
            if (!response.ok) throw new Error('LAYOUT_DEFAULT_FAILED');

            if (onSuccess) onSuccess(t('layout.toast.defaultSuccess'));
            await fetchLayouts();
        } catch (e) {
            console.error("Error setting default", e);
            const nextLayouts = layouts.map((l) => ({ ...l, isDefault: l.id === id }));
            setLayouts(nextLayouts);
            saveLayoutsToLocal(nextLayouts);
            if (onSuccess) onSuccess(t('layout.toast.defaultLocalSuccess'));
            if (onError) onError(t('layout.toast.backendUnavailableDefaultLocal'));
        }
    };

    const handleLoad = (layout: LayoutMetadata) => {
        setCurrentLayoutId(layout.id);
        onLayoutLoad(layout);
    };

    return (
        <CLayoutManagement
            layouts={layouts}
            currentLayoutId={currentLayoutId}
            onLoad={handleLoad}
            onSave={handleSave}
            onDelete={handleDelete}
            onSetDefault={handleSetDefault}
        />
    );
};
