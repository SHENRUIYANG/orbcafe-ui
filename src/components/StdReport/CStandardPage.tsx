/**
 * @file 10_Frontend/components/sap/ui/Common/PageComponents/CStandardPage.tsx
 * @summary Standardized Page Layout for SAP-like Applications (OSM3, etc.)
 * @author ORBAICODER
 * @date 2026-01-05
 * 
 * @description
 * Encapsulates the standard layout pattern:
 * 1. Page Header (optional via CPageLayout)
 * 2. Smart Filter Bar (Top)
 * 3. Data Table (Bottom, filling remaining space)
 * 4. Tightly controlled spacing between components.
 */

'use client';

import React from 'react';
import { Box, Stack } from '@mui/material';
import { CPageLayout } from './Structures/CPageLayout';
import { CTable } from './CTable';
import { CSmartFilter } from './CSmartFilter';
import type { CTableProps } from './Hooks/CTable/types';
import type { CSmartFilterProps } from './CSmartFilter';

export interface CStandardPageProps {
    /** 
     * Unique Identifier for the Page/Report.
     * Used as the `appId` for Variant and Layout persistence.
     * MUST be unique across the system to avoid configuration conflicts.
     */
    id: string;

    /** Page Title */
    title: string;
    
    /** Whether to hide the top breadcrumb/title header */
    hideHeader?: boolean;
    
    /** Configuration for the Smart Filter Bar */
    filterConfig?: CSmartFilterProps;
    
    /** Props for the CTable (excluding filterConfig) */
    tableProps: Omit<CTableProps, 'filterConfig'>;
    
    /** Additional content (Dialogs, Snackbars, etc.) */
    children?: React.ReactNode;

    /**
     * Spacing between Filter and Table
     * Default: 1 (8px) - Much tighter than default CTable behavior
     */
    spacing?: number;

    /**
     * Mode of operation:
     * - 'separated': SmartFilter and CTable are rendered separately (default).
     *   Layout variants are applied via prop updates from parent.
     * - 'integrated': SmartFilter is passed into CTable as filterConfig.
     *   CTable manages the connection between Filter and Table internally.
     */
    mode?: 'separated' | 'integrated';
}

export const CStandardPage = ({
    id,
    title,
    hideHeader = true,
    filterConfig,
    tableProps,
    children,
    spacing = 1,
    mode = 'separated'
}: CStandardPageProps) => {
    // Ensure ID is passed down to components
    const effectiveFilterConfig = filterConfig ? {
        ...filterConfig,
        appId: filterConfig.appId || id
    } : undefined;

    const effectiveTableProps = {
        ...tableProps,
        appId: tableProps.appId || id
    };

    return (
        <CPageLayout title={title} hideHeader={hideHeader}>
            <Stack spacing={spacing} sx={{ height: '100%', overflow: 'hidden' }}>
                {/* Filter Section - Only render if separated */}
                {mode === 'separated' && effectiveFilterConfig && (
                    <Box sx={{ flexShrink: 0 }}>
                        <CSmartFilter {...effectiveFilterConfig} />
                    </Box>
                )}
                
                {/* Table Section */}
                <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                   <CTable 
                        {...effectiveTableProps}
                        fitContainer={true}
                        // If integrated, pass filterConfig. If separated, pass undefined.
                        filterConfig={mode === 'integrated' ? effectiveFilterConfig : undefined} 
                   />
                </Box>
            </Stack>
            {children}
        </CPageLayout>
    );
};
