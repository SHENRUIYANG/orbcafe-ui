/**
 * @file 10_Frontend/components/sap/ui/Common/PageComponents/CLayoutManager.tsx
 *
 * @summary Smart component that encapsulates layout management via backend APIs.
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CLayoutManagement, LayoutMetadata } from '../Molecules/CLayoutManagement';

const DEFAULT_API_URL = 'http://127.0.0.1:8515';

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
    serviceUrl = DEFAULT_API_URL,
    onError,
    onSuccess
}) => {
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
        try {
            const response = await fetch(
                `${serviceUrl}/api/layouts?appId=${encodeURIComponent(appId)}&tableKey=${encodeURIComponent(tableKey)}`
            );
            if (!response.ok) throw new Error('Failed to fetch layouts');
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
            if (onError) onError('Failed to load layouts from backend, fallback to local storage');
        }
    }, [appId, tableKey, serviceUrl, onError, currentLayoutId, onLayoutLoad, targetLayoutId, loadLayoutsFromLocal]);

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
        try {
            const response = await fetch(`${serviceUrl}/api/layouts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(toBackendLayout(layoutToSave))
            });
            if (!response.ok) throw new Error('Failed to save layout');

            if (onSuccess) onSuccess('Layout saved successfully');
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
            if (onSuccess) onSuccess('Layout saved to local storage');
            if (onError) onError('Backend unavailable, saved to local storage');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`${serviceUrl}/api/layouts/${encodeURIComponent(id)}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete layout');

            if (currentLayoutId === id) setCurrentLayoutId('');
            if (onSuccess) onSuccess('Layout deleted successfully');
            await fetchLayouts();
        } catch (e) {
            console.error("Error deleting layout", e);
            const nextLayouts = layouts.filter((l) => l.id !== id);
            setLayouts(nextLayouts);
            saveLayoutsToLocal(nextLayouts);
            if (currentLayoutId === id) setCurrentLayoutId('');
            if (onSuccess) onSuccess('Layout deleted from local storage');
            if (onError) onError('Backend unavailable, deleted from local storage');
        }
    };

    const handleSetDefault = async (id: string) => {
        try {
            const layout = layouts.find(l => l.id === id);
            if (!layout) return;

            const response = await fetch(`${serviceUrl}/api/layouts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(toBackendLayout({ ...layout, isDefault: true }))
            });
            if (!response.ok) throw new Error('Failed to set default layout');

            if (onSuccess) onSuccess('Default layout set');
            await fetchLayouts();
        } catch (e) {
            console.error("Error setting default", e);
            const nextLayouts = layouts.map((l) => ({ ...l, isDefault: l.id === id }));
            setLayouts(nextLayouts);
            saveLayoutsToLocal(nextLayouts);
            if (onSuccess) onSuccess('Default layout set in local storage');
            if (onError) onError('Backend unavailable, default saved to local storage');
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
