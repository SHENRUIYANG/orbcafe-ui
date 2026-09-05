'use client';

import React, { useCallback, useMemo, useState } from 'react';
import {
    CCardPage,
    CPageTransition,
    useCardPage,
    useOrbMode,
    type CCardItem,
    type CardPageMetadata,
    type OrbcafeLocale,
    type SapIconName,
} from 'orbcafe-ui';
import { ExamplePageLayout } from './ExamplePageLayout';
import { EXAMPLE_MENU } from './exampleNavigation';

// --- Mock Data (Ideally this comes from an API) ---

type CategoryValue = 'analytics' | 'productivity' | 'integration' | 'ai';

interface StoreApp extends CCardItem {
    category: CategoryValue;
    vendor: string;
    icon: SapIconName;
}

const RAW_APPS: StoreApp[] = [
    { id: 'APP-001', title: 'Graph Report Studio', description: 'Build interactive analytic reports from any OData source. Drag-and-drop dimensions, KPI tiles and drill-downs included. Ships with 20+ chart presets.', meta: 'v2.4.1 · ORBIS', icon: 'barChart', category: 'analytics', vendor: 'ORBIS' },
    { id: 'APP-002', title: 'Kanban Flow', description: 'Visual task management with WIP limits, swimlanes and SLA badges. Syncs bidirectionally with your backend workflow engine in real time.', meta: 'v1.9.0 · ORBIS', icon: 'checklist', category: 'productivity', vendor: 'ORBIS' },
    { id: 'APP-003', title: 'Pivot Analyzer', description: 'Ad-hoc pivot tables for controllers. Slice millions of rows in the browser, save layouts as variants and share them with your team.', meta: 'v3.1.2 · ORBIS', icon: 'pieChart', category: 'analytics', vendor: 'ORBIS' },
    { id: 'APP-004', title: 'AI Copilot Bridge', description: 'Connect any page to the AI panel. Ships prompt templates for summarization, anomaly detection and natural-language filtering.', meta: 'v0.9.8 · OpenAI Ready', icon: 'activate', category: 'ai', vendor: 'ORBCAFE' },
    { id: 'APP-005', title: 'Value Help Pro', description: 'Advanced F4 value helps with fuzzy search, recent picks and column configuration. Drops into any form without code changes.', meta: 'v1.2.0 · ORBIS', icon: 'search', category: 'integration', vendor: 'ORBIS' },
    { id: 'APP-006', title: 'Planning Gantt', description: 'Interactive Gantt planning with drag-resize, dependencies and capacity views. Built for production planners and project leads.', meta: 'v2.0.3 · ORBIS', icon: 'calendar', category: 'productivity', vendor: 'ORBIS' },
    { id: 'APP-007', title: 'OData Connector Kit', description: 'Type-safe OData v2/v4 client generator with schema introspection, batch support and offline cache. CLI and runtime included.', meta: 'v4.5.0 · ORBCAFE', icon: 'process', category: 'integration', vendor: 'ORBCAFE' },
    { id: 'APP-008', title: 'Smart Insights', description: 'Automatic insight cards on top of your reports: trend detection, outlier highlights and forecast bands with one click.', meta: 'v1.4.6 · ORBCAFE', icon: 'lightbulb', category: 'ai', vendor: 'ORBCAFE' },
    { id: 'APP-009', title: 'Document Inbox', description: 'Central inbox for incoming invoices and delivery notes. OCR pre-fill, approval flow and audit trail included.', meta: 'v2.2.1 · ORBIS', icon: 'receipt', category: 'productivity', vendor: 'ORBIS' },
    { id: 'APP-010', title: 'Tree Master Data', description: 'Hierarchical master data browser with lazy loading, drag-drop re-parenting and inline editing for large BOM-like structures.', meta: 'v1.7.4 · ORBIS', icon: 'tree', category: 'integration', vendor: 'ORBIS' },
    { id: 'APP-011', title: 'Voice Assistant', description: 'Hands-free commands for warehouse and shop-floor scenarios. Multilingual, offline-capable and fully customizable wake words.', meta: 'v0.8.2 · Beta', icon: 'microphone', category: 'ai', vendor: 'ORBCAFE' },
    { id: 'APP-012', title: 'World Logistics Map', description: 'Geo visualization for shipments, plants and suppliers. Live ETAs, route heatmaps and delay alerts on one map.', meta: 'v1.1.9 · ORBIS', icon: 'world', category: 'analytics', vendor: 'ORBIS' },
];

const BASE_APPS: StoreApp[] = RAW_APPS.map((app, i) => ({
    ...app,
    // Extra primitive fields show up automatically in the built-in detail panel
    rating: (4.9 - (i % 6) * 0.2).toFixed(1),
    downloads: 1200 + i * 973,
    releaseDate: `2025-${String((i % 12) + 1).padStart(2, '0')}-15`,
}));

const resolveFilterValue = (params: Record<string, unknown>, key: string): unknown => {
    const rawValue = params[key];
    if (rawValue && typeof rawValue === 'object' && 'value' in rawValue) {
        return (rawValue as { value: unknown }).value;
    }
    return rawValue;
};

const EXAMPLE_TEXT: Record<OrbcafeLocale, {
    localeLabel: string;
    pageTitle: string;
    filterSearch: string;
    searchPlaceholder: string;
    filterCategory: string;
    filterVendor: string;
    categoryAnalytics: string;
    categoryProductivity: string;
    categoryIntegration: string;
    categoryAi: string;
    variantAll: string;
    variantAi: string;
}> = {
    en: {
        localeLabel: 'EN',
        pageTitle: 'Card Page Example',
        filterSearch: 'Search',
        searchPlaceholder: 'Search apps...',
        filterCategory: 'Category',
        filterVendor: 'Vendor',
        categoryAnalytics: 'Analytics',
        categoryProductivity: 'Productivity',
        categoryIntegration: 'Integration',
        categoryAi: 'AI',
        variantAll: 'All Apps',
        variantAi: 'AI Apps',
    },
    zh: {
        localeLabel: '中文',
        pageTitle: '卡片页示例',
        filterSearch: '搜索',
        searchPlaceholder: '搜索应用...',
        filterCategory: '类别',
        filterVendor: '供应商',
        categoryAnalytics: '分析',
        categoryProductivity: '生产力',
        categoryIntegration: '集成',
        categoryAi: 'AI',
        variantAll: '全部应用',
        variantAi: 'AI 应用',
    },
    fr: {
        localeLabel: 'FR',
        pageTitle: 'Exemple de page cartes',
        filterSearch: 'Recherche',
        searchPlaceholder: 'Rechercher des applications...',
        filterCategory: 'Catégorie',
        filterVendor: 'Fournisseur',
        categoryAnalytics: 'Analytique',
        categoryProductivity: 'Productivité',
        categoryIntegration: 'Intégration',
        categoryAi: 'IA',
        variantAll: 'Toutes les apps',
        variantAi: 'Apps IA',
    },
    de: {
        localeLabel: 'DE',
        pageTitle: 'Kartenansicht Beispiel',
        filterSearch: 'Suche',
        searchPlaceholder: 'Apps suchen...',
        filterCategory: 'Kategorie',
        filterVendor: 'Anbieter',
        categoryAnalytics: 'Analytik',
        categoryProductivity: 'Produktivität',
        categoryIntegration: 'Integration',
        categoryAi: 'KI',
        variantAll: 'Alle Apps',
        variantAi: 'KI-Apps',
    },
    ja: {
        localeLabel: '日本語',
        pageTitle: 'カードページ例',
        filterSearch: '検索',
        searchPlaceholder: 'アプリを検索...',
        filterCategory: 'カテゴリ',
        filterVendor: 'ベンダー',
        categoryAnalytics: '分析',
        categoryProductivity: '生産性',
        categoryIntegration: '連携',
        categoryAi: 'AI',
        variantAll: 'すべてのアプリ',
        variantAi: 'AI アプリ',
    },
    ko: {
        localeLabel: '한국어',
        pageTitle: '카드 페이지 예시',
        filterSearch: '검색',
        searchPlaceholder: '앱 검색...',
        filterCategory: '카테고리',
        filterVendor: '공급업체',
        categoryAnalytics: '분석',
        categoryProductivity: '생산성',
        categoryIntegration: '통합',
        categoryAi: 'AI',
        variantAll: '모든 앱',
        variantAi: 'AI 앱',
    },
};

const HeaderBrandLogo = () => {
    const mode = useOrbMode();
    const src = mode === 'dark' ? '/LOGO3.png' : '/LOGO2.png';

    return (
        <img
            src={src}
            alt="ORBCAFE UI"
            style={{ width: 280, maxWidth: '32vw', height: 52, display: 'block', objectFit: 'contain', flexShrink: 0 }}
        />
    );
};

export default function CardPageExampleClient() {
    const [locale, setLocale] = useState<OrbcafeLocale>('en');
    const i18nText = EXAMPLE_TEXT[locale];

    const fetchCardData = useCallback(async (params: Record<string, unknown>) => {
        console.log('Fetching card data with params:', params);

        await new Promise((resolve) => setTimeout(resolve, 400));

        let filtered = [...BASE_APPS];

        const search = resolveFilterValue(params, 'search');
        const category = resolveFilterValue(params, 'category');
        const vendor = resolveFilterValue(params, 'vendor');

        if (search) {
            const q = String(search).toLowerCase();
            filtered = filtered.filter((app) =>
                app.title.toLowerCase().includes(q) ||
                (app.description ?? '').toLowerCase().includes(q)
            );
        }
        if (category) {
            filtered = filtered.filter((app) => app.category === category);
        }
        if (vendor) {
            filtered = filtered.filter((app) => app.vendor === vendor);
        }

        return { rows: filtered, total: filtered.length };
    }, []);

    const cardPageMetadata: CardPageMetadata = useMemo(() => ({
        id: 'card-page-example',
        title: i18nText.pageTitle,
        filters: [
            { id: 'search', label: i18nText.filterSearch, type: 'text', placeholder: i18nText.searchPlaceholder },
            {
                id: 'category',
                label: i18nText.filterCategory,
                type: 'select',
                options: [
                    { label: i18nText.categoryAnalytics, value: 'analytics' },
                    { label: i18nText.categoryProductivity, value: 'productivity' },
                    { label: i18nText.categoryIntegration, value: 'integration' },
                    { label: i18nText.categoryAi, value: 'ai' },
                ],
            },
            {
                id: 'vendor',
                label: i18nText.filterVendor,
                type: 'select',
                options: [
                    { label: 'ORBIS', value: 'ORBIS' },
                    { label: 'ORBCAFE', value: 'ORBCAFE' },
                ],
            },
        ],
        variants: [
            { id: 'v1', name: i18nText.variantAll, isDefault: true, scope: 'Both', filters: [], layout: {} },
            {
                id: 'v2',
                name: i18nText.variantAi,
                scope: 'Search',
                filters: [
                    {
                        scope: 'default',
                        filters: {
                            values: { category: { value: 'ai', operator: 'equals' } },
                            visibleFields: ['search', 'category', 'vendor'],
                        },
                    },
                ],
            },
        ],
    }), [i18nText]);

    const { pageProps } = useCardPage({
        metadata: cardPageMetadata,
        fetchData: fetchCardData,
        onDetailClick: (item) => console.log('[CardPage Example] View details:', item.id, item.title),
        onDownloadClick: (item) => console.log('[CardPage Example] Download:', item.id, item.title),
    });

    return (
        <ExamplePageLayout
            appId="orbcafe-examples"
            appTitle=""
            navigationVariant="v2"
            searchPlacement="header"
            menuData={EXAMPLE_MENU}
            locale={locale}
            localeLabel={i18nText.localeLabel}
            onLocaleChange={setLocale}
            user={{ name: 'Ruiyang Shen', subtitle: 'ruiyang.shen@orbis.de', avatarSrc: '/orbcafe.png' }}
            onUserRefresh={() => window.location.reload()}
            onUserLogout={() => window.location.assign('/login')}
            logo={<HeaderBrandLogo />}
        >
            <CPageTransition transitionKey="card-page" variant="fade" durationMs={180}>
                <div style={{ height: 'calc(100vh - 120px)' }}>
                    <CCardPage {...pageProps} id="card-page-example" />
                </div>
            </CPageTransition>
        </ExamplePageLayout>
    );
}
