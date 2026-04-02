'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { CAppPageLayout, CPageTransition, CStandardPage, useStandardReport, type OrbcafeLocale, type ReportMetadata, type TreeMenuItem } from 'orbcafe-ui';
import { Box, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Link from 'next/link';
import { LayoutDashboard, Settings, Mail, Mic, Table2 } from 'lucide-react';

// --- Metadata Definition ---

// 1. Mock Data (Ideally this comes from an API)
type StatusValue = 'active' | 'pending' | 'inactive';
type CategoryValue = 'electronics' | 'furniture';

interface ExampleRow {
    id: string;
    index: number;
    name: string;
    status: StatusValue;
    date: string;
    amount: string;
    category: CategoryValue;
}

const BASE_ROWS: ExampleRow[] = Array.from({ length: 100 }).map((_, i) => ({
    id: `ID-${i + 1}`,
    index: i + 1,
    name: `Item Name ${i + 1}`,
    status: i % 3 === 0 ? 'active' : i % 3 === 1 ? 'pending' : 'inactive',
    date: '2025-01-01',
    amount: ((i * 123.45) % 1000).toFixed(2),
    category: i % 2 === 0 ? 'electronics' : 'furniture',
}));

const EXAMPLE_TEXT: Record<OrbcafeLocale, {
    localeLabel: string;
    reportTitle: string;
    dashboard: string;
    stdReport: string;
    messages: string;
    settings: string;
    filterSearch: string;
    filterStatus: string;
    filterDateRange: string;
    filterCategory: string;
    searchItemsPlaceholder: string;
    itemNamePrefix: string;
    columnName: string;
    columnDate: string;
    columnAmount: string;
    statusActive: string;
    statusPending: string;
    statusInactive: string;
    categoryElectronics: string;
    categoryFurniture: string;
    defaultView: string;
    activeItems: string;
    quickCreateTitle: string;
    quickCreateDescription: string;
    quickCreateSave: string;
    quickCreateCancel: string;
}> = {
    en: {
        localeLabel: 'EN',
        reportTitle: 'Standard Report Example',
        dashboard: 'Dashboard',
        stdReport: 'Standard Report',
        messages: 'Messages',
        settings: 'Settings',
        filterSearch: 'Search',
        filterStatus: 'Status',
        filterDateRange: 'Date Range',
        filterCategory: 'Category',
        searchItemsPlaceholder: 'Search items...',
        itemNamePrefix: 'Item Name',
        columnName: 'Name',
        columnDate: 'Date',
        columnAmount: 'Amount',
        statusActive: 'Active',
        statusPending: 'Pending',
        statusInactive: 'Inactive',
        categoryElectronics: 'Electronics',
        categoryFurniture: 'Furniture',
        defaultView: 'Default View',
        activeItems: 'Active Items',
        quickCreateTitle: 'Create User',
        quickCreateDescription: 'Initial password defaults to user ID and can be reset after creation.',
        quickCreateSave: 'Save',
        quickCreateCancel: 'Cancel',
    },
    zh: {
        localeLabel: '中文',
        reportTitle: '标准报表示例',
        dashboard: '仪表盘',
        stdReport: '标准报表',
        messages: '消息',
        settings: '设置',
        filterSearch: '搜索',
        filterStatus: '状态',
        filterDateRange: '日期范围',
        filterCategory: '类别',
        searchItemsPlaceholder: '搜索条目...',
        itemNamePrefix: '条目',
        columnName: '名称',
        columnDate: '日期',
        columnAmount: '金额',
        statusActive: '启用',
        statusPending: '待处理',
        statusInactive: '停用',
        categoryElectronics: '电子产品',
        categoryFurniture: '家具',
        defaultView: '默认视图',
        activeItems: '启用项',
        quickCreateTitle: '创建用户',
        quickCreateDescription: '初始化密码默认为用户ID，创建后可使用“重置密码”功能修改。',
        quickCreateSave: '保存',
        quickCreateCancel: '取消',
    },
    fr: {
        localeLabel: 'FR',
        reportTitle: 'Exemple de rapport standard',
        dashboard: 'Tableau de bord',
        stdReport: 'Rapport standard',
        messages: 'Messages',
        settings: 'Paramètres',
        filterSearch: 'Recherche',
        filterStatus: 'Statut',
        filterDateRange: 'Plage de dates',
        filterCategory: 'Catégorie',
        searchItemsPlaceholder: 'Rechercher des éléments...',
        itemNamePrefix: 'Élément',
        columnName: 'Nom',
        columnDate: 'Date',
        columnAmount: 'Montant',
        statusActive: 'Actif',
        statusPending: 'En attente',
        statusInactive: 'Inactif',
        categoryElectronics: 'Électronique',
        categoryFurniture: 'Mobilier',
        defaultView: 'Vue par défaut',
        activeItems: 'Éléments actifs',
        quickCreateTitle: "Créer un utilisateur",
        quickCreateDescription: "Le mot de passe initial est l'ID utilisateur et peut être réinitialisé après création.",
        quickCreateSave: 'Enregistrer',
        quickCreateCancel: 'Annuler',
    },
    de: {
        localeLabel: 'DE',
        reportTitle: 'Standardbericht Beispiel',
        dashboard: 'Dashboard',
        stdReport: 'Standardbericht',
        messages: 'Nachrichten',
        settings: 'Einstellungen',
        filterSearch: 'Suche',
        filterStatus: 'Status',
        filterDateRange: 'Datumsbereich',
        filterCategory: 'Kategorie',
        searchItemsPlaceholder: 'Einträge suchen...',
        itemNamePrefix: 'Eintrag',
        columnName: 'Name',
        columnDate: 'Datum',
        columnAmount: 'Betrag',
        statusActive: 'Aktiv',
        statusPending: 'Ausstehend',
        statusInactive: 'Inaktiv',
        categoryElectronics: 'Elektronik',
        categoryFurniture: 'Möbel',
        defaultView: 'Standardansicht',
        activeItems: 'Aktive Einträge',
        quickCreateTitle: 'Benutzer erstellen',
        quickCreateDescription: 'Das Initialpasswort entspricht der Benutzer-ID und kann danach zurückgesetzt werden.',
        quickCreateSave: 'Speichern',
        quickCreateCancel: 'Abbrechen',
    },
    ja: {
        localeLabel: '日本語',
        reportTitle: '標準レポート例',
        dashboard: 'ダッシュボード',
        stdReport: '標準レポート',
        messages: 'メッセージ',
        settings: '設定',
        filterSearch: '検索',
        filterStatus: '状態',
        filterDateRange: '日付範囲',
        filterCategory: 'カテゴリ',
        searchItemsPlaceholder: '項目を検索...',
        itemNamePrefix: '項目',
        columnName: '名称',
        columnDate: '日付',
        columnAmount: '金額',
        statusActive: '有効',
        statusPending: '保留中',
        statusInactive: '無効',
        categoryElectronics: '電子機器',
        categoryFurniture: '家具',
        defaultView: 'デフォルト表示',
        activeItems: '有効項目',
        quickCreateTitle: 'ユーザー作成',
        quickCreateDescription: '初期パスワードはユーザーIDです。作成後に再設定できます。',
        quickCreateSave: '保存',
        quickCreateCancel: 'キャンセル',
    },
    ko: {
        localeLabel: '한국어',
        reportTitle: '표준 리포트 예시',
        dashboard: '대시보드',
        stdReport: '표준 리포트',
        messages: '메시지',
        settings: '설정',
        filterSearch: '검색',
        filterStatus: '상태',
        filterDateRange: '날짜 범위',
        filterCategory: '카테고리',
        searchItemsPlaceholder: '항목 검색...',
        itemNamePrefix: '항목',
        columnName: '이름',
        columnDate: '날짜',
        columnAmount: '금액',
        statusActive: '활성',
        statusPending: '대기',
        statusInactive: '비활성',
        categoryElectronics: '전자제품',
        categoryFurniture: '가구',
        defaultView: '기본 보기',
        activeItems: '활성 항목',
        quickCreateTitle: '사용자 생성',
        quickCreateDescription: '초기 비밀번호는 사용자 ID이며 생성 후 재설정할 수 있습니다.',
        quickCreateSave: '저장',
        quickCreateCancel: '취소',
    },
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
    const [locale, setLocale] = useState<OrbcafeLocale>('en');
    const i18nText = EXAMPLE_TEXT[locale];

    const statusLabelMap: Record<StatusValue, string> = useMemo(() => ({
        active: i18nText.statusActive,
        pending: i18nText.statusPending,
        inactive: i18nText.statusInactive,
    }), [i18nText]);

    const categoryLabelMap: Record<CategoryValue, string> = useMemo(() => ({
        electronics: i18nText.categoryElectronics,
        furniture: i18nText.categoryFurniture,
    }), [i18nText]);

    const localizedRows: ExampleRow[] = useMemo(() => {
        return BASE_ROWS.map((row) => ({
            ...row,
            name: `${i18nText.itemNamePrefix} ${row.index}`,
        }));
    }, [i18nText]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fetchReportData = useCallback(async (params: any) => {
        console.log('Fetching report data with params:', params);

        await new Promise((resolve) => setTimeout(resolve, 500));

        let filteredRows = [...localizedRows];

        if (params.search) {
            const q = String(params.search).toLowerCase();
            filteredRows = filteredRows.filter((row) =>
                row.name.toLowerCase().includes(q) || row.id.toLowerCase().includes(q)
            );
        }
        if (params.status) {
            filteredRows = filteredRows.filter((row) => row.status === params.status);
        }
        if (params.category) {
            filteredRows = filteredRows.filter((row) => row.category === params.category);
        }

        if (params.sort && params.order) {
            const sortKey = params.sort as keyof ExampleRow;
            filteredRows.sort((a, b) => {
                const aVal = a[sortKey];
                const bVal = b[sortKey];
                if (aVal < bVal) return params.order === 'asc' ? -1 : 1;
                if (aVal > bVal) return params.order === 'asc' ? 1 : -1;
                return 0;
            });
        }

        const page = params.page || 1;
        const limit = Number(params.limit) || 10;
        let paginatedRows = filteredRows;
        if (limit > 0) {
            const start = (page - 1) * limit;
            const end = start + limit;
            paginatedRows = filteredRows.slice(start, end);
        }

        return {
            rows: paginatedRows,
            total: filteredRows.length,
        };
    }, [localizedRows]);

    const reportMetadata: ReportMetadata = useMemo(() => ({
        id: 'std-report-example',
        title: i18nText.reportTitle,
        columns: [
            {
                id: 'id',
                label: 'ID',
                minWidth: 50,
                render: (value: string) => (
                    <Link href={`/detail-info/${value}`} style={{ color: 'inherit', textDecoration: 'underline' }}>
                        {value}
                    </Link>
                ),
            },
            { id: 'name', label: i18nText.columnName, minWidth: 150 },
            { 
                id: 'status', 
                label: i18nText.filterStatus, 
                minWidth: 100,
                render: (value: StatusValue) => {
                    const color = value === 'active' ? 'success' : value === 'pending' ? 'warning' : 'default';
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    return <Chip label={statusLabelMap[value] || value} color={color as any} size="small" variant="outlined" />;
                }
            },
            { id: 'date', label: i18nText.columnDate, minWidth: 150 },
            { 
                id: 'amount', 
                label: i18nText.columnAmount, 
                minWidth: 100, 
                align: 'right', 
                numeric: true,
            },
            {
                id: 'category',
                label: i18nText.filterCategory,
                minWidth: 120,
                render: (value: CategoryValue) => categoryLabelMap[value] || value,
            },
        ],
        filters: [
            { id: 'search', label: i18nText.filterSearch, type: 'text', placeholder: i18nText.searchItemsPlaceholder },
            { 
                id: 'status', 
                label: i18nText.filterStatus, 
                type: 'select', 
                options: [
                    { label: i18nText.statusActive, value: 'active' },
                    { label: i18nText.statusPending, value: 'pending' },
                    { label: i18nText.statusInactive, value: 'inactive' }
                ] 
            },
            { id: 'dateRange', label: i18nText.filterDateRange, type: 'date' },
            {
                id: 'category',
                label: i18nText.filterCategory,
                type: 'select',
                options: [
                    { label: i18nText.categoryElectronics, value: 'electronics' },
                    { label: i18nText.categoryFurniture, value: 'furniture' },
                ],
            },
        ],
        variants: [
            { id: 'v1', name: i18nText.defaultView, isDefault: true, scope: 'Both', filters: [], layout: {} },
            { id: 'v2', name: i18nText.activeItems, scope: 'Search', filters: [{ scope: 'default', filters: { status: 'active' } }] }
        ]
    }), [categoryLabelMap, i18nText, statusLabelMap]);

    // 4. Use the Hook
    const { pageProps } = useStandardReport({
        metadata: reportMetadata,
        fetchData: fetchReportData,
    });

    const pagePropsWithCustomAction = {
        ...pageProps,
        tableProps: {
            ...pageProps.tableProps,
            quickCreate: {
                enabled: true,
                title: i18nText.quickCreateTitle,
                description: i18nText.quickCreateDescription,
                submitLabel: i18nText.quickCreateSave,
                cancelLabel: i18nText.quickCreateCancel,
                onSubmit: async (payload: Record<string, unknown>) => {
                    console.log('[StdReport Example] Quick Create payload:', payload);
                },
            },
            quickEdit: {
                enabled: true,
                onSubmit: async (payload: Record<string, unknown>, row: Record<string, unknown>) => {
                    console.log('[StdReport Example] Quick Edit row:', row);
                    console.log('[StdReport Example] Quick Edit payload:', payload);
                },
            },
            quickDelete: {
                enabled: true,
                onConfirm: async (rows: Record<string, unknown>[]) => {
                    console.log('[StdReport Example] Quick Delete rows:', rows);
                },
            },
        },
    };

    const menuData: TreeMenuItem[] = useMemo(() => [
        { id: 'dashboard', title: i18nText.dashboard, href: '/', icon: <LayoutDashboard className="w-4 h-4" /> },
        { id: 'std-report', title: i18nText.stdReport, href: '/std-report', icon: <LayoutDashboard className="w-4 h-4" /> },
        { id: 'kanban', title: 'Kanban', href: '/kanban', icon: <LayoutDashboard className="w-4 h-4" /> },
        { id: 'pivot-table', title: 'Pivot Table', href: '/pivot-table', icon: <Table2 className="w-4 h-4" /> },
        { id: 'detail-info', title: 'Detail Info', href: '/detail-info/ID-1', icon: <LayoutDashboard className="w-4 h-4" /> },
        { id: 'ai-nav', title: 'AI Nav', href: '/ai-nav', icon: <Mic className="w-4 h-4" /> },
        { id: 'messages', title: i18nText.messages, href: '/messages', icon: <Mail className="w-4 h-4" /> },
        { id: 'settings', title: i18nText.settings, href: '/settings', icon: <Settings className="w-4 h-4" /> },
    ], [i18nText]);

    return (
        <CAppPageLayout
            appTitle=""
            menuData={menuData}
            locale={locale}
            localeLabel={i18nText.localeLabel}
            onLocaleChange={setLocale}
            user={{ name: 'Ruiyang Shen', subtitle: 'ruiyang.shen@orbis.de', avatarSrc: '/orbcafe.png' }}
            logo={<HeaderBrandLogo />}
        >
            <CPageTransition transitionKey="std-report" variant="fade" durationMs={180}>
                <Box sx={{ height: 'calc(100vh - 120px)' }}>
                    <CStandardPage {...pagePropsWithCustomAction} id="std-report-example-page">
                        {/* Optional children for dialogs etc. */}
                    </CStandardPage>
                </Box>
            </CPageTransition>
        </CAppPageLayout>
    );
}
