'use client';

import React from 'react';
import { CAppPageLayout, CStandardPage, useStandardReport, type ReportMetadata, type TreeMenuItem } from 'orbcafe-ui';
import { Box, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { LayoutDashboard, Settings, Mail } from 'lucide-react';

// --- Metadata Definition ---

// 1. Mock Data (Ideally this comes from an API)
const MOCK_ROWS = Array.from({ length: 50 }).map((_, i) => ({
    id: `ID-${i + 1}`,
    name: `Item Name ${i + 1}`,
    status: i % 3 === 0 ? 'Active' : i % 3 === 1 ? 'Pending' : 'Inactive',
    date: '2025-01-01',
    amount: ((i * 123.45) % 1000).toFixed(2),
    category: i % 2 === 0 ? 'Electronics' : 'Furniture',
}));

// 2. Define Report Metadata
const REPORT_METADATA: ReportMetadata = {
    id: 'std-report-example',
    title: 'Standard Report Example',
    columns: [
        { id: 'id', label: 'ID', minWidth: 50 },
        { id: 'name', label: 'Name', minWidth: 150 },
        { 
            id: 'status', 
            label: 'Status', 
            minWidth: 100,
            render: (value: string) => {
                const color = value === 'Active' ? 'success' : value === 'Pending' ? 'warning' : 'default';
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return <Chip label={value} color={color as any} size="small" variant="outlined" />;
            }
        },
        { id: 'date', label: 'Date', minWidth: 150 },
        { 
            id: 'amount', 
            label: 'Amount', 
            minWidth: 100, 
            align: 'right', 
            numeric: true,
            // render: (value: any) => `$${Number(value).toFixed(2)}` // Removed custom render to test default thousand separator
        },
        { id: 'category', label: 'Category', minWidth: 120 },
    ],
    filters: [
        { id: 'search', label: 'Search', type: 'text', placeholder: 'Search items...' },
        { 
            id: 'status', 
            label: 'Status', 
            type: 'select', 
            options: [
                { label: 'Active', value: 'Active' },
                { label: 'Pending', value: 'Pending' },
                { label: 'Inactive', value: 'Inactive' }
            ] 
        },
        { id: 'dateRange', label: 'Date Range', type: 'date' },
        { id: 'category', label: 'Category', type: 'select', options: [{label: 'Electronics', value: 'Electronics'}, {label: 'Furniture', value: 'Furniture'}] }
    ],
    variants: [
        { id: 'v1', name: 'Default View', isDefault: true, scope: 'Both', filters: [], layout: {} },
        { id: 'v2', name: 'Active Items', scope: 'Search', filters: [{ scope: 'default', filters: { status: 'Active' } }] }
    ]
};

// 3. Mock API Function
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fetchReportData = async (params: any) => {
    console.log('Fetching report data with params:', params);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    let filteredRows = [...MOCK_ROWS];

    // Apply filters (Mock backend logic)
    if (params.search) {
        const q = params.search.toLowerCase();
        filteredRows = filteredRows.filter(row => 
            row.name.toLowerCase().includes(q) || row.id.toLowerCase().includes(q)
        );
    }
    if (params.status) {
        filteredRows = filteredRows.filter(row => row.status === params.status);
    }
    if (params.category) {
        filteredRows = filteredRows.filter(row => row.category === params.category);
    }

    // Sorting
    if (params.sort && params.order) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        filteredRows.sort((a: any, b: any) => {
            const aVal = a[params.sort];
            const bVal = b[params.sort];
            if (aVal < bVal) return params.order === 'asc' ? -1 : 1;
            if (aVal > bVal) return params.order === 'asc' ? 1 : -1;
            return 0;
        });
    }

    // Pagination
    const page = params.page || 1;
    const limit = params.limit || 10;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedRows = filteredRows.slice(start, end);

    return {
        rows: paginatedRows,
        total: filteredRows.length
    };
};

const HeaderBrandLogo = () => {
    const theme = useTheme();
    const src = theme.palette.mode === 'dark' ? '/LOGO3.png' : '/LOGO2.png';

    return (
        <Box
            component="img"
            src={src}
            alt="ORBCAFE UI"
            sx={{ width: 280, maxWidth: '32vw', height: 52, display: 'block', objectFit: 'contain', flexShrink: 0 }}
        />
    );
};

export default function StdReportExample() {
    // 4. Use the Hook
    const { pageProps } = useStandardReport({
        metadata: REPORT_METADATA,
        fetchData: fetchReportData
    });

    const menuData: TreeMenuItem[] = [
        { id: 'dashboard', title: 'Dashboard', href: '/', icon: <LayoutDashboard className="w-4 h-4" /> },
        { id: 'std-report', title: 'Standard Report', href: '/std-report', icon: <LayoutDashboard className="w-4 h-4" /> },
        { id: 'messages', title: 'Messages', href: '/messages', icon: <Mail className="w-4 h-4" /> },
        { id: 'settings', title: 'Settings', href: '/settings', icon: <Settings className="w-4 h-4" /> },
    ];

    return (
        <CAppPageLayout
            appTitle=""
            menuData={menuData}
            localeLabel="EN"
            user={{ name: 'Ruiyang Shen', subtitle: 'ruiyang.shen@orbis.de', avatarSrc: '/orbcafe.png' }}
            logo={<HeaderBrandLogo />}
        >
            <Box sx={{ height: 'calc(100vh - 120px)' }}>
                <CStandardPage {...pageProps}>
                    {/* Optional children for dialogs etc. */}
                </CStandardPage>
            </Box>
        </CAppPageLayout>
    );
}
