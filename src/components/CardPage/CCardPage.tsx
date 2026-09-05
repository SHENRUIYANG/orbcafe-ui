'use client';

/**
 * @file CCardPage.tsx
 * @summary Standardized "store-like" page layout for ORBCAFE applications.
 *
 * @description
 * Encapsulates the standard catalog/store layout pattern:
 * 1. Page Header (optional via CPageLayout)
 * 2. Smart Filter Bar (top, same CSmartFilter as CStandardPage)
 * 3. Card Grid (bottom, filling remaining space)
 *
 * Mirrors CStandardPage so reports (table) and catalogs (cards) share the
 * same filter bar, variant management and spacing conventions.
 */

import React from 'react';
import { CStack } from '../Atoms';
import { CPageLayout } from '../StdReport/Structures/CPageLayout';
import { CSmartFilter, type CSmartFilterProps } from '../StdReport/CSmartFilter';
import { CCardGrid, type CCardGridProps } from './CCardGrid';

export interface CCardPageProps {
    /**
     * Unique identifier for the page.
     * Used as the `appId` for filter variant persistence.
     * MUST be unique across the system to avoid configuration conflicts.
     */
    id: string;

    /** Page title */
    title: string;

    /** Whether to hide the top breadcrumb/title header */
    hideHeader?: boolean;

    /** Configuration for the Smart Filter Bar */
    filterConfig?: CSmartFilterProps;

    /** Props for the card grid */
    gridProps: CCardGridProps;

    /** Additional content (dialogs, snackbars, etc.) */
    children?: React.ReactNode;

    /**
     * Spacing between filter bar and card grid.
     * Default: 1 (8px) - same convention as CStandardPage.
     */
    spacing?: number;
}

export const CCardPage = ({
    id,
    title,
    hideHeader = true,
    filterConfig,
    gridProps,
    children,
    spacing = 1,
}: CCardPageProps) => {
    const effectiveFilterConfig = filterConfig
        ? { ...filterConfig, appId: filterConfig.appId || id }
        : undefined;

    return (
        <CPageLayout title={title} hideHeader={hideHeader}>
            <CStack spacing={spacing} sx={{ height: '100%', overflow: 'hidden' }}>
                {effectiveFilterConfig && (
                    <div sx={{ flexShrink: 0 }}>
                        <CSmartFilter {...effectiveFilterConfig} />
                    </div>
                )}

                <div sx={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <CCardGrid {...gridProps} />
                </div>
            </CStack>
            {children}
        </CPageLayout>
    );
};
