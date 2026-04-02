'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { LayoutDashboard, Mail, Mic, Settings, Table2 } from 'lucide-react';
import {
  CAppPageLayout,
  CPivotTable,
  CPageTransition,
  type OrbcafeLocale,
  type PivotFieldDefinition,
  type PivotTablePreset,
  type TreeMenuItem,
} from 'orbcafe-ui';

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

const REGIONS = ['North America', 'Europe', 'Asia Pacific'];
const CATEGORIES = ['Hardware', 'Software', 'Services'];
const CHANNELS = ['Direct', 'Partner'];
const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];
const YEARS = [2025, 2026];
const MANAGERS = ['Alice', 'Ben', 'Carmen', 'Diego', 'Eva', 'Frank'];
const PIVOT_PRESET_STORAGE_KEY = 'orbcafe:examples:pivot-presets';

const DEFAULT_PIVOT_PRESETS: PivotTablePreset[] = [
  {
    id: 'preset-revenue-overview',
    name: 'Revenue Overview',
    layout: {
      rows: ['region', 'category'],
      columns: ['quarter'],
      filters: ['year', 'channel'],
      values: [
        { fieldId: 'revenue', aggregation: 'sum' },
        { fieldId: 'profit', aggregation: 'sum' },
        { fieldId: 'marginRate', aggregation: 'avg' },
      ],
    },
    showGrandTotal: true,
  },
  {
    id: 'preset-manager-efficiency',
    name: 'Manager Efficiency',
    layout: {
      rows: ['manager'],
      columns: ['quarter'],
      filters: ['year', 'region'],
      values: [
        { fieldId: 'orderCount', aggregation: 'sum' },
        { fieldId: 'marginRate', aggregation: 'avg' },
      ],
    },
    showGrandTotal: true,
  },
];

const EXAMPLE_TEXT: Record<
  OrbcafeLocale,
  {
    localeLabel: string;
    dashboard: string;
    stdReport: string;
    pivotTable: string;
    detailInfo: string;
    messages: string;
    settings: string;
  }
> = {
  en: {
    localeLabel: 'EN',
    dashboard: 'Dashboard',
    stdReport: 'Standard Report',
    pivotTable: 'Pivot Table',
    detailInfo: 'Detail Info',
    messages: 'Messages',
    settings: 'Settings',
  },
  zh: {
    localeLabel: '中文',
    dashboard: '仪表盘',
    stdReport: '标准报表',
    pivotTable: '透视表',
    detailInfo: '详情页',
    messages: '消息',
    settings: '设置',
  },
  fr: {
    localeLabel: 'FR',
    dashboard: 'Tableau de bord',
    stdReport: 'Rapport standard',
    pivotTable: 'Tableau croisé',
    detailInfo: 'Détail',
    messages: 'Messages',
    settings: 'Paramètres',
  },
  de: {
    localeLabel: 'DE',
    dashboard: 'Dashboard',
    stdReport: 'Standardbericht',
    pivotTable: 'Pivot-Tabelle',
    detailInfo: 'Detailansicht',
    messages: 'Nachrichten',
    settings: 'Einstellungen',
  },
  ja: {
    localeLabel: '日本語',
    dashboard: 'ダッシュボード',
    stdReport: '標準レポート',
    pivotTable: 'ピボットテーブル',
    detailInfo: '詳細情報',
    messages: 'メッセージ',
    settings: '設定',
  },
  ko: {
    localeLabel: '한국어',
    dashboard: '대시보드',
    stdReport: '표준 리포트',
    pivotTable: '피벗 테이블',
    detailInfo: '상세 정보',
    messages: '메시지',
    settings: '설정',
  },
};

const buildPivotDemoRows = (): Record<string, unknown>[] => {
  const rows: Record<string, unknown>[] = [];
  let index = 1;

  YEARS.forEach((year, yearIndex) => {
    QUARTERS.forEach((quarter, quarterIndex) => {
      REGIONS.forEach((region, regionIndex) => {
        CATEGORIES.forEach((category, categoryIndex) => {
          CHANNELS.forEach((channel, channelIndex) => {
            const manager = MANAGERS[(yearIndex + quarterIndex + regionIndex + categoryIndex + channelIndex) % MANAGERS.length];
            const orderCount = 40 + yearIndex * 8 + quarterIndex * 5 + regionIndex * 6 + categoryIndex * 3 + channelIndex * 2;
            const revenueBase = 42000 + yearIndex * 3800 + quarterIndex * 2500 + regionIndex * 4600 + categoryIndex * 2100;
            const revenue = revenueBase + channelIndex * 1300 + orderCount * 95;
            const cost = revenue * (0.58 + categoryIndex * 0.04 + channelIndex * 0.02);
            const profit = revenue - cost;
            const marginRate = profit / revenue;

            rows.push({
              id: `P-${index}`,
              year,
              quarter,
              region,
              category,
              channel,
              manager,
              orderCount,
              revenue: Number(revenue.toFixed(2)),
              cost: Number(cost.toFixed(2)),
              profit: Number(profit.toFixed(2)),
              marginRate: Number(marginRate.toFixed(4)),
            });
            index += 1;
          });
        });
      });
    });
  });

  return rows;
};

const currencyFormatter = (value: number) =>
  value.toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

const percentageFormatter = (value: number) =>
  value.toLocaleString(undefined, {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  });

export default function PivotTableExampleClient() {
  const [locale, setLocale] = useState<OrbcafeLocale>('en');
  const [pivotPresets, setPivotPresets] = useState<PivotTablePreset[]>(() => {
    if (typeof window === 'undefined') {
      return DEFAULT_PIVOT_PRESETS;
    }
    const raw = window.localStorage.getItem(PIVOT_PRESET_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_PIVOT_PRESETS;
    }
    try {
      const parsed = JSON.parse(raw) as PivotTablePreset[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch {
      // Ignore malformed local storage payload and fallback to defaults.
    }
    return DEFAULT_PIVOT_PRESETS;
  });
  const i18nText = EXAMPLE_TEXT[locale];
  const pivotRows = useMemo(() => buildPivotDemoRows(), []);

  const pivotFields: PivotFieldDefinition[] = useMemo(
    () => [
      { id: 'year', label: 'Year', type: 'number' },
      { id: 'quarter', label: 'Quarter', type: 'string' },
      { id: 'region', label: 'Region', type: 'string' },
      { id: 'category', label: 'Category', type: 'string' },
      { id: 'channel', label: 'Channel', type: 'string' },
      { id: 'manager', label: 'Account Manager', type: 'string' },
      { id: 'orderCount', label: 'Order Count', type: 'number', aggregations: ['sum', 'avg', 'count'] },
      { id: 'revenue', label: 'Revenue', type: 'number', formatValue: currencyFormatter },
      { id: 'cost', label: 'Cost', type: 'number', formatValue: currencyFormatter },
      { id: 'profit', label: 'Profit', type: 'number', formatValue: currencyFormatter },
      { id: 'marginRate', label: 'Margin Rate', type: 'number', aggregations: ['avg', 'min', 'max'], formatValue: percentageFormatter },
    ],
    [],
  );

  const menuData: TreeMenuItem[] = useMemo(
    () => [
      { id: 'dashboard', title: i18nText.dashboard, href: '/', icon: <LayoutDashboard className="w-4 h-4" /> },
      { id: 'std-report', title: i18nText.stdReport, href: '/std-report', icon: <LayoutDashboard className="w-4 h-4" /> },
      { id: 'kanban', title: 'Kanban', href: '/kanban', icon: <LayoutDashboard className="w-4 h-4" /> },
      { id: 'pivot-table', title: i18nText.pivotTable, href: '/pivot-table', icon: <Table2 className="w-4 h-4" /> },
      { id: 'detail-info', title: i18nText.detailInfo, href: '/detail-info/ID-1', icon: <LayoutDashboard className="w-4 h-4" /> },
      { id: 'ai-nav', title: 'AI Nav', href: '/ai-nav', icon: <Mic className="w-4 h-4" /> },
      { id: 'messages', title: i18nText.messages, href: '/messages', icon: <Mail className="w-4 h-4" /> },
      { id: 'settings', title: i18nText.settings, href: '/settings', icon: <Settings className="w-4 h-4" /> },
    ],
    [i18nText],
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(PIVOT_PRESET_STORAGE_KEY, JSON.stringify(pivotPresets));
  }, [pivotPresets]);

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
      <CPageTransition transitionKey="pivot-table-demo" variant="fade" durationMs={200}>
        <Box sx={{ p: { xs: 1, md: 2 }, display: 'flex', flexDirection: 'column', gap: 1.2 }}>
          <CPivotTable
            rows={pivotRows}
            fields={pivotFields}
            initialLayout={{
              rows: ['region', 'category'],
              columns: ['quarter'],
              filters: ['year', 'channel'],
              values: [
                { fieldId: 'revenue', aggregation: 'sum' },
                { fieldId: 'profit', aggregation: 'sum' },
                { fieldId: 'marginRate', aggregation: 'avg' },
              ],
            }}
            maxPreviewHeight={520}
            enablePresetManagement
            presets={pivotPresets}
            onPresetsChange={setPivotPresets}
          />
        </Box>
      </CPageTransition>
    </CAppPageLayout>
  );
}
