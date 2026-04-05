'use client';

import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { Box, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  CPageTransition,
  PAppPageLayout,
  PBarcodeScanner,
  PNumericKeypad,
  PTable,
  type OrbcafeLocale,
  type PWorkloadNavItem,
  type TreeMenuItem,
} from 'orbcafe-ui';
import {
  ClipboardList,
  LayoutDashboard,
  Mail,
  Mic,
  PackageCheck,
  PackageSearch,
  ReceiptText,
  ScanLine,
  Settings,
  ShieldCheck,
  TabletSmartphone,
  Truck,
  Warehouse,
} from 'lucide-react';

type WorkloadId = 'receiving' | 'picking' | 'packing' | 'dispatch';
type TaskStatus = 'Queued' | 'Picking' | 'Ready' | 'Blocked';
type TaskPriority = 'Critical' | 'High' | 'Medium' | 'Low';

interface FilterValueShape {
  value: any;
  operator: string;
}

interface PadTaskRecord {
  id: string;
  taskId: string;
  title: string;
  workload: WorkloadId;
  zone: string;
  assignee: string;
  plannedQty: number;
  confirmedQty: number;
  status: TaskStatus;
  priority: TaskPriority;
  shipDate: string;
  wave: string;
  truck: string;
  customer: string;
}

const MENU_TEXT: Record<OrbcafeLocale, { localeLabel: string; dashboard: string; stdReport: string; padDemo: string; pivotTable: string; kanban: string; detailInfo: string; aiNav: string; messages: string; settings: string; }> = {
  en: {
    localeLabel: 'EN',
    dashboard: 'Dashboard',
    stdReport: 'Standard Report',
    padDemo: 'Pad Demo',
    pivotTable: 'Pivot Table',
    kanban: 'Kanban',
    detailInfo: 'Detail Info',
    aiNav: 'AI Nav',
    messages: 'Messages',
    settings: 'Settings',
  },
  zh: {
    localeLabel: '中文',
    dashboard: '仪表盘',
    stdReport: '标准报表',
    padDemo: '平板演示',
    pivotTable: '透视表',
    kanban: '看板',
    detailInfo: '详情页',
    aiNav: 'AI 导航',
    messages: '消息',
    settings: '设置',
  },
  fr: {
    localeLabel: 'FR',
    dashboard: 'Tableau de bord',
    stdReport: 'Rapport standard',
    padDemo: 'Démo tablette',
    pivotTable: 'Tableau croisé',
    kanban: 'Kanban',
    detailInfo: 'Détail',
    aiNav: 'AI Nav',
    messages: 'Messages',
    settings: 'Paramètres',
  },
  de: {
    localeLabel: 'DE',
    dashboard: 'Dashboard',
    stdReport: 'Standardbericht',
    padDemo: 'Pad-Demo',
    pivotTable: 'Pivot-Tabelle',
    kanban: 'Kanban',
    detailInfo: 'Detailansicht',
    aiNav: 'AI Nav',
    messages: 'Nachrichten',
    settings: 'Einstellungen',
  },
  ja: {
    localeLabel: '日本語',
    dashboard: 'ダッシュボード',
    stdReport: '標準レポート',
    padDemo: 'Pad デモ',
    pivotTable: 'ピボットテーブル',
    kanban: 'カンバン',
    detailInfo: '詳細情報',
    aiNav: 'AI Nav',
    messages: 'メッセージ',
    settings: '設定',
  },
  ko: {
    localeLabel: '한국어',
    dashboard: '대시보드',
    stdReport: '표준 리포트',
    padDemo: 'Pad 데모',
    pivotTable: '피벗 테이블',
    kanban: '칸반',
    detailInfo: '상세 정보',
    aiNav: 'AI Nav',
    messages: '메시지',
    settings: '설정',
  },
};

const INITIAL_TASKS: PadTaskRecord[] = [
  { id: '1', taskId: 'RCV-1001', title: 'Receive dairy pallets from ASN 4801', workload: 'receiving', zone: 'Dock-02', assignee: 'Lina', plannedQty: 18, confirmedQty: 12, status: 'Queued', priority: 'High', shipDate: '2026-04-02', wave: 'ASN-4801', truck: 'TRK-210', customer: 'FreshMart' },
  { id: '2', taskId: 'RCV-1002', title: 'Check temperature and labels for yogurt batch', workload: 'receiving', zone: 'Cold-01', assignee: 'Mert', plannedQty: 24, confirmedQty: 24, status: 'Ready', priority: 'Medium', shipDate: '2026-04-02', wave: 'ASN-4802', truck: 'TRK-212', customer: 'FreshMart' },
  { id: '3', taskId: 'PCK-2101', title: 'Wave pick chilled cartons for store cluster east', workload: 'picking', zone: 'A-01', assignee: 'Noah', plannedQty: 36, confirmedQty: 18, status: 'Picking', priority: 'Critical', shipDate: '2026-04-02', wave: 'WAVE-08', truck: 'TRK-310', customer: 'Urban Foods' },
  { id: '4', taskId: 'PCK-2102', title: 'Pick frozen family packs for route south', workload: 'picking', zone: 'A-02', assignee: 'Aria', plannedQty: 28, confirmedQty: 4, status: 'Blocked', priority: 'High', shipDate: '2026-04-03', wave: 'WAVE-08', truck: 'TRK-314', customer: 'MarketSquare' },
  { id: '5', taskId: 'PKG-3201', title: 'Seal and label cartons for gate 03 dispatch', workload: 'packing', zone: 'Line-B', assignee: 'Lina', plannedQty: 20, confirmedQty: 9, status: 'Picking', priority: 'Medium', shipDate: '2026-04-02', wave: 'PK-14', truck: 'TRK-410', customer: 'Retail Hub' },
  { id: '6', taskId: 'PKG-3202', title: 'Print export labels and pallet cards', workload: 'packing', zone: 'Line-C', assignee: 'Mert', plannedQty: 14, confirmedQty: 14, status: 'Ready', priority: 'Low', shipDate: '2026-04-03', wave: 'PK-15', truck: 'TRK-412', customer: 'EuroShop' },
  { id: '7', taskId: 'DSP-4301', title: 'Load route north and verify final carton count', workload: 'dispatch', zone: 'Gate-01', assignee: 'Noah', plannedQty: 30, confirmedQty: 26, status: 'Queued', priority: 'High', shipDate: '2026-04-02', wave: 'LOAD-21', truck: 'TRK-510', customer: 'NorthTrade' },
  { id: '8', taskId: 'DSP-4302', title: 'Release express van after security check', workload: 'dispatch', zone: 'Gate-03', assignee: 'Aria', plannedQty: 12, confirmedQty: 12, status: 'Ready', priority: 'Medium', shipDate: '2026-04-03', wave: 'LOAD-22', truck: 'TRK-512', customer: 'ExpressNow' },
  { id: '9', taskId: 'PCK-2103', title: 'Pick snack assortment for campaign display', workload: 'picking', zone: 'B-04', assignee: 'Lina', plannedQty: 22, confirmedQty: 10, status: 'Queued', priority: 'Low', shipDate: '2026-04-04', wave: 'WAVE-09', truck: 'TRK-316', customer: 'Promo Plus' },
  { id: '10', taskId: 'RCV-1003', title: 'Unload ambient pallets for wholesale channel', workload: 'receiving', zone: 'Dock-05', assignee: 'Aria', plannedQty: 16, confirmedQty: 0, status: 'Queued', priority: 'Low', shipDate: '2026-04-04', wave: 'ASN-4810', truck: 'TRK-218', customer: 'BulkOne' },
  { id: '11', taskId: 'PKG-3203', title: 'Assemble mixed-case promotion bundles', workload: 'packing', zone: 'Line-A', assignee: 'Noah', plannedQty: 18, confirmedQty: 6, status: 'Picking', priority: 'High', shipDate: '2026-04-04', wave: 'PK-16', truck: 'TRK-414', customer: 'Promo Plus' },
  { id: '12', taskId: 'DSP-4303', title: 'Dispatch chilled route west after final QC', workload: 'dispatch', zone: 'Gate-05', assignee: 'Mert', plannedQty: 26, confirmedQty: 21, status: 'Blocked', priority: 'Critical', shipDate: '2026-04-04', wave: 'LOAD-23', truck: 'TRK-518', customer: 'WestLine' },
];

const priorityColorMap: Record<TaskPriority, 'error' | 'warning' | 'info' | 'default'> = {
  Critical: 'error',
  High: 'warning',
  Medium: 'info',
  Low: 'default',
};

const statusColorMap: Record<TaskStatus, 'default' | 'warning' | 'success' | 'error'> = {
  Queued: 'default',
  Picking: 'warning',
  Ready: 'success',
  Blocked: 'error',
};

const createEmptyFilters = (): Record<string, FilterValueShape> => ({
  keyword: { value: '', operator: 'contains' },
  zone: { value: [], operator: 'anyOf' },
  status: { value: [], operator: 'anyOf' },
  shipDate: { value: [null, null], operator: 'between' },
  plannedQty: { value: '', operator: '>=' },
});

const compareNumber = (sourceValue: number, operator: string, filterValue: any) => {
  const rangeFilter = Array.isArray(filterValue) ? filterValue.map((item) => Number(item)) : null;
  const numericFilter = Array.isArray(filterValue) ? Number(filterValue[0] ?? 0) : Number(filterValue);
  switch (operator) {
    case '=':
      return sourceValue === numericFilter;
    case '!=':
      return sourceValue !== numericFilter;
    case '>':
      return sourceValue > numericFilter;
    case '<':
      return sourceValue < numericFilter;
    case '>=':
      return sourceValue >= numericFilter;
    case '<=':
      return sourceValue <= numericFilter;
    case 'between':
      return rangeFilter ? sourceValue >= (rangeFilter[0] || 0) && sourceValue <= (rangeFilter[1] || Number.MAX_SAFE_INTEGER) : true;
    default:
      return true;
  }
};

const matchesText = (sourceValue: string, operator: string, filterValue: string) => {
  const normalizedSource = sourceValue.toLowerCase();
  const normalizedFilter = filterValue.toLowerCase();
  switch (operator) {
    case 'equals':
      return normalizedSource === normalizedFilter;
    case 'notContains':
      return !normalizedSource.includes(normalizedFilter);
    case 'wildcard': {
      const pattern = normalizedFilter.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
      return new RegExp(`^${pattern}$`, 'i').test(sourceValue);
    }
    case 'contains':
    default:
      return normalizedSource.includes(normalizedFilter);
  }
};

const matchesDateRange = (sourceValue: string, filterValue: any) => {
  if (!Array.isArray(filterValue) || filterValue.length !== 2) return true;
  const [start, end] = filterValue;
  const current = dayjs(sourceValue);
  if (!current.isValid()) return false;
  if (start && current.isBefore(dayjs(start), 'day')) return false;
  if (end && current.isAfter(dayjs(end), 'day')) return false;
  return true;
};

const matchesFilters = (task: PadTaskRecord, filters: Record<string, FilterValueShape>) => {
  if (filters.keyword?.value) {
    const keyword = String(filters.keyword.value);
    const haystack = [task.taskId, task.title, task.customer, task.truck].join(' ');
    if (!matchesText(haystack, filters.keyword.operator, keyword)) return false;
  }

  if (Array.isArray(filters.zone?.value) && filters.zone.value.length > 0) {
    if (!filters.zone.value.includes(task.zone)) return false;
  }

  if (Array.isArray(filters.status?.value) && filters.status.value.length > 0) {
    if (!filters.status.value.includes(task.status)) return false;
  }

  if (filters.shipDate?.value && Array.isArray(filters.shipDate.value) && (filters.shipDate.value[0] || filters.shipDate.value[1])) {
    if (!matchesDateRange(task.shipDate, filters.shipDate.value)) return false;
  }

  if (filters.plannedQty?.value !== '' && filters.plannedQty?.value !== null && filters.plannedQty?.value !== undefined) {
    if (!compareNumber(task.plannedQty, filters.plannedQty.operator, filters.plannedQty.value)) return false;
  }

  return true;
};

export default function PadExampleClient() {
  const [locale, setLocale] = useState<OrbcafeLocale>('en');
  const [tasks, setTasks] = useState<PadTaskRecord[]>(INITIAL_TASKS);
  const [activeWorkload, setActiveWorkload] = useState<WorkloadId>('receiving');
  const [filters, setFilters] = useState<Record<string, FilterValueShape>>(createEmptyFilters());
  const [selectedTaskId, setSelectedTaskId] = useState<string>(INITIAL_TASKS[0].id);
  const [keypadValue, setKeypadValue] = useState(String(INITIAL_TASKS[0].confirmedQty));
  const [scannerOpen, setScannerOpen] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState('');
  const [lastAction, setLastAction] = useState('Pad execution workspace ready.');
  const i18nText = MENU_TEXT[locale];

  const selectedTask = useMemo(
    () => tasks.find((task) => task.id === selectedTaskId) || tasks[0],
    [selectedTaskId, tasks],
  );

  const filteredTasks = useMemo(
    () => tasks.filter((task) => task.workload === activeWorkload).filter((task) => matchesFilters(task, filters)),
    [activeWorkload, filters, tasks],
  );

  const workloadItems: PWorkloadNavItem[] = useMemo(() => {
    const base = [
      { id: 'receiving', title: 'Receiving', description: 'Inbound ASN verification and dock confirmation', caption: 'Dock 02-05', icon: <Warehouse size={18} /> },
      { id: 'picking', title: 'Picking', description: 'Wave picking tasks for outbound stores', caption: 'Wave 08-09', icon: <PackageSearch size={18} /> },
      { id: 'packing', title: 'Packing', description: 'Seal, label and bundle parcels', caption: 'Line A-C', icon: <PackageCheck size={18} /> },
      { id: 'dispatch', title: 'Dispatch', description: 'Truck release and route departure', caption: 'Gate 01-05', icon: <Truck size={18} /> },
    ] as const;

    return base.map((item) => ({
      ...item,
      badge: tasks.filter((task) => task.workload === item.id).length,
    }));
  }, [tasks]);

  const menuData: TreeMenuItem[] = useMemo(
    () => [
      { id: 'dashboard', title: i18nText.dashboard, href: '/', icon: <LayoutDashboard className="w-4 h-4" /> },
      { id: 'pad', title: i18nText.padDemo, href: '/pad', icon: <TabletSmartphone className="w-4 h-4" /> },
      { id: 'std-report', title: i18nText.stdReport, href: '/std-report', icon: <ClipboardList className="w-4 h-4" /> },
      {
        id: 'operations',
        title: 'Operations',
        description: 'Other example routes',
        icon: <ReceiptText className="w-4 h-4" />,
        children: [
          { id: 'kanban', title: i18nText.kanban, href: '/kanban' },
          { id: 'pivot-table', title: i18nText.pivotTable, href: '/pivot-table' },
          { id: 'detail-info', title: i18nText.detailInfo, href: '/detail-info/ID-1' },
        ],
      },
      { id: 'ai-nav', title: i18nText.aiNav, href: '/ai-nav', icon: <Mic className="w-4 h-4" /> },
      { id: 'messages', title: i18nText.messages, href: '/chat', icon: <Mail className="w-4 h-4" /> },
      { id: 'settings', title: i18nText.settings, href: '/copilot', icon: <Settings className="w-4 h-4" /> },
    ],
    [i18nText],
  );

  const zoneOptions = useMemo(
    () => Array.from(new Set(tasks.map((task) => task.zone))).map((zone) => ({ label: zone, value: zone })),
    [tasks],
  );

  const filterFields = useMemo(
    () => [
      { id: 'keyword', label: 'Keyword', type: 'text', placeholder: 'Task / customer / truck', hasSearchIcon: true },
      { id: 'zone', label: 'Zone', type: 'multi-select', options: zoneOptions },
      { id: 'status', label: 'Status', type: 'multi-select', options: ['Queued', 'Picking', 'Ready', 'Blocked'].map((status) => ({ label: status, value: status })) },
      { id: 'shipDate', label: 'Ship Date', type: 'date' },
      { id: 'plannedQty', label: 'Planned Qty', type: 'number', placeholder: '>= qty' },
    ],
    [zoneOptions],
  );

  const summaryCards = useMemo(() => {
    const currentTasks = tasks.filter((task) => task.workload === activeWorkload);
    const readyCount = currentTasks.filter((task) => task.status === 'Ready').length;
    const blockedCount = currentTasks.filter((task) => task.status === 'Blocked').length;
    const progress = currentTasks.reduce((sum, task) => sum + (task.plannedQty ? task.confirmedQty / task.plannedQty : 0), 0);
    const progressPct = currentTasks.length > 0 ? Math.round((progress / currentTasks.length) * 100) : 0;

    return [
      { label: 'Visible tasks', value: filteredTasks.length, note: `${currentTasks.length} in current workload` },
      { label: 'Ready', value: readyCount, note: 'Ready for next handoff' },
      { label: 'Blocked', value: blockedCount, note: 'Need operator attention' },
      { label: 'Completion', value: `${progressPct}%`, note: 'Based on confirmed quantities' },
    ];
  }, [activeWorkload, filteredTasks.length, tasks]);

  const tableColumns = useMemo(
    () => [
      { id: 'taskId', label: 'Task ID' },
      { id: 'title', label: 'Task Title' },
      { id: 'zone', label: 'Zone' },
      { id: 'assignee', label: 'Assignee' },
      { id: 'plannedQty', label: 'Planned', numeric: true },
      { id: 'confirmedQty', label: 'Confirmed', numeric: true },
      {
        id: 'status',
        label: 'Status',
        render: (value: TaskStatus) => <Chip size="small" label={value} color={statusColorMap[value]} variant="outlined" />,
      },
      {
        id: 'priority',
        label: 'Priority',
        render: (value: TaskPriority) => <Chip size="small" label={value} color={priorityColorMap[value]} />,
      },
      { id: 'shipDate', label: 'Ship Date' },
      { id: 'truck', label: 'Truck' },
      { id: 'customer', label: 'Customer' },
      { id: 'wave', label: 'Wave / ASN' },
    ],
    [],
  );

  const handleHeaderSearch = (query: string) => {
    setFilters((prev) => ({
      ...prev,
      keyword: {
        ...prev.keyword,
        value: query,
      },
    }));
    setLastAction(`Header search updated to "${query}".`);
  };

  const handleSelectTask = (row: Record<string, any>) => {
    const task = row as PadTaskRecord;
    setSelectedTaskId(task.id);
    setKeypadValue(String(task.confirmedQty));
    setLastAction(`Selected ${task.taskId} for keypad confirmation.`);
  };

  const handleSubmitKeypad = (nextValue: string) => {
    const confirmedQty = Number(nextValue || 0);
    setTasks((current) =>
      current.map((task) => (task.id === selectedTaskId ? { ...task, confirmedQty } : task)),
    );
    setKeypadValue(String(confirmedQty));
    setLastAction(`Confirmed quantity ${confirmedQty} for ${selectedTask?.taskId}.`);
  };

  const handleBarcodeDetected = (rawValue: string) => {
    setLastScannedCode(rawValue);
    setFilters((prev) => ({
      ...prev,
      keyword: {
        ...prev.keyword,
        value: rawValue,
      },
    }));
    setLastAction(`Scanned ${rawValue} and applied it to keyword filter.`);
  };

  return (
    <PAppPageLayout
      appTitle="ORBCAFE Pad Demo"
      menuData={menuData}
      workloadItems={workloadItems}
      workloadSelectedId={activeWorkload}
      onWorkloadSelect={(item) => {
        setActiveWorkload(item.id as WorkloadId);
        setLastAction(`Switched workload to ${item.title}.`);
      }}
      onSearch={handleHeaderSearch}
      locale={locale}
      localeLabel={MENU_TEXT[locale].localeLabel}
      localeOptions={['en', 'zh', 'fr', 'de', 'ja', 'ko']}
      onLocaleChange={(newLocale) => setLocale(newLocale as OrbcafeLocale)}
      user={{ name: 'Pad Operator', subtitle: 'warehouse.touch@orbcafe.dev', avatarSrc: '/orbcafe.png' }}
      actionSlot={<Chip label={i18nText.localeLabel} color="primary" />}
      portraitBottomSlot={
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          <Chip icon={<ShieldCheck size={14} />} label={lastAction} color="primary" variant="outlined" />
        </Stack>
      }
    >
      <CPageTransition transitionKey="pad-demo-example" variant="fade" durationMs={180}>
        <Stack spacing={2} sx={{ minHeight: '100%' }}>
          <Paper
            sx={(theme) => ({
              p: { xs: 1.5, md: 2 },
              borderRadius: 4,
              border: `1px solid ${theme.palette.divider}`,
              background:
                theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, rgba(37,99,235,0.18), rgba(15,118,110,0.16))'
                  : 'linear-gradient(135deg, rgba(37,99,235,0.10), rgba(15,118,110,0.10))',
            })}
          >
            <Stack spacing={1.25}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
                <Box>
                  <Typography sx={{ fontSize: '1.2rem', fontWeight: 900 }}>Touch-first execution cockpit</Typography>
                  <Typography sx={{ mt: 0.5, color: 'text.secondary' }}>
                    Full Pad example with navigation shell, workload switcher, touch report, local variant/layout persistence, and live keypad updates.
                  </Typography>
                </Box>
                <Chip color="primary" variant="outlined" label={lastAction} sx={{ maxWidth: '100%', '& .MuiChip-label': { whiteSpace: 'normal' } }} />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', xl: 'repeat(4, minmax(0, 1fr))' }, gap: 1.2 }}>
                {summaryCards.map((item) => (
                  <Paper key={item.label} sx={{ p: 1.35, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                    <Typography sx={{ fontSize: '0.76rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.35 }}>
                      {item.label}
                    </Typography>
                    <Typography sx={{ mt: 0.35, fontSize: '1.3rem', fontWeight: 900 }}>{item.value}</Typography>
                    <Typography sx={{ mt: 0.35, fontSize: '0.76rem', color: 'text.secondary' }}>{item.note}</Typography>
                  </Paper>
                ))}
              </Box>
            </Stack>
          </Paper>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', xl: 'minmax(0, 1.45fr) minmax(360px, 0.75fr)' },
              gap: 2,
              alignItems: 'start',
            }}
          >
            <PTable
              appId="examples-pad-execution"
              tableKey="execution-queue"
              title={`${workloadItems.find((item) => item.id === activeWorkload)?.title || activeWorkload} Execution Queue`}
              columns={tableColumns}
              rows={filteredTasks}
              rowKey="id"
              rowsPerPage={6}
              rowsPerPageOptions={[6, 12, 20, -1]}
              selectionMode="multiple"
              filterConfig={{
                appId: 'examples-pad-execution',
                tableKey: 'execution-queue',
                fields: filterFields as any,
                filters,
                onFilterChange: (nextFilters: Record<string, FilterValueShape>) => {
                  setFilters(nextFilters);
                },
                onSearch: () => {
                  setLastAction(`Applied filters to ${workloadItems.find((item) => item.id === activeWorkload)?.title}.`);
                },
                onVariantLoad: (variant: any) => {
                  setLastAction(`Loaded view "${variant.name}".`);
                },
              }}
              extraTools={
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setFilters(createEmptyFilters());
                    setLastAction('Reset all pad filters.');
                  }}
                >
                  Reset Filters
                </Button>
              }
              quickCreate={{
                enabled: true,
                title: 'Create Task',
                fields: ['taskId', 'title', 'zone', 'assignee', 'plannedQty', 'confirmedQty', 'status', 'priority', 'shipDate', 'truck', 'customer', 'wave'],
                initialValues: {
                  status: 'Queued',
                  priority: 'Medium',
                  shipDate: dayjs().format('YYYY-MM-DD'),
                  confirmedQty: 0,
                },
                onSubmit: async (payload) => {
                  const nextTask: PadTaskRecord = {
                    id: String(Date.now()),
                    workload: activeWorkload,
                    taskId: payload.taskId || `NEW-${Date.now().toString().slice(-4)}`,
                    title: payload.title || 'New pad task',
                    zone: payload.zone || 'Dock-01',
                    assignee: payload.assignee || 'Lina',
                    plannedQty: Number(payload.plannedQty || 0),
                    confirmedQty: Number(payload.confirmedQty || 0),
                    status: (payload.status || 'Queued') as TaskStatus,
                    priority: (payload.priority || 'Medium') as TaskPriority,
                    shipDate: payload.shipDate || dayjs().format('YYYY-MM-DD'),
                    wave: payload.wave || 'MANUAL',
                    truck: payload.truck || 'TRK-000',
                    customer: payload.customer || 'Walk-in',
                  };
                  setTasks((current) => [nextTask, ...current]);
                  setLastAction(`Created ${nextTask.taskId} in ${activeWorkload}.`);
                },
              }}
              quickEdit={{
                enabled: true,
                editableFields: ['title', 'zone', 'assignee', 'plannedQty', 'confirmedQty', 'status', 'priority', 'shipDate', 'truck', 'customer', 'wave'],
                primaryKeys: ['taskId'],
                onSubmit: async (payload, row) => {
                  setTasks((current) =>
                    current.map((task) =>
                      task.id === row.id
                        ? {
                            ...task,
                            ...payload,
                            plannedQty: Number(payload.plannedQty ?? task.plannedQty),
                            confirmedQty: Number(payload.confirmedQty ?? task.confirmedQty),
                          }
                        : task,
                    ),
                  );
                  setLastAction(`Updated ${row.taskId}.`);
                },
              }}
              quickDelete={{
                enabled: true,
                onConfirm: async (rows) => {
                  const ids = new Set(rows.map((row) => row.id));
                  setTasks((current) => current.filter((task) => !ids.has(task.id)));
                  setLastAction(`Deleted ${rows.length} task(s).`);
                },
              }}
              cardTitleField="title"
              cardSubtitleFields={['taskId', 'zone', 'assignee', 'status']}
              cardActionSlot={(row) => (
                <Chip size="small" label={row.priority} color={priorityColorMap[row.priority as TaskPriority]} />
              )}
              renderCardFooter={(row) => (
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  <Chip size="small" variant="outlined" label={`Truck ${row.truck}`} />
                  <Chip size="small" variant="outlined" label={`Ship ${row.shipDate}`} />
                  <Chip size="small" variant="outlined" label={row.customer} />
                </Stack>
              )}
              onRowClick={handleSelectTask}
            />

            <Stack spacing={2}>
              <Paper
                sx={(theme) => ({
                  p: 2,
                  borderRadius: 4,
                  border: '1px solid',
                  borderColor: 'divider',
                  background:
                    theme.palette.mode === 'dark'
                      ? 'linear-gradient(135deg, rgba(15,23,42,0.92), rgba(30,41,59,0.92))'
                      : 'linear-gradient(135deg, rgba(239,246,255,1), rgba(224,242,254,0.86))',
                })}
              >
                <Stack spacing={1.25}>
                  <Box>
                    <Typography sx={{ fontSize: '1rem', fontWeight: 900 }}>Camera barcode trigger</Typography>
                    <Typography sx={{ mt: 0.35, fontSize: '0.84rem', color: 'text.secondary' }}>
                      Open the scanner dialog, read a barcode, then push the result into the touch filter workflow.
                    </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<ScanLine size={18} />}
                    onClick={() => setScannerOpen(true)}
                    sx={{
                      minHeight: 56,
                      alignSelf: 'flex-start',
                      px: 2.5,
                      borderRadius: 3,
                      fontWeight: 800,
                    }}
                  >
                    Open camera scanner
                  </Button>

                  {lastScannedCode ? (
                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                      <Chip color="success" variant="filled" label={`Last scan: ${lastScannedCode}`} />
                      <Chip variant="outlined" label={`Keyword filter: ${String(filters.keyword?.value || '')}`} />
                    </Stack>
                  ) : null}
                </Stack>
              </Paper>

              <Paper sx={{ p: 2, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                <Stack spacing={1.25}>
                  <Box>
                    <Typography sx={{ fontSize: '1rem', fontWeight: 900 }}>Selected task keypad</Typography>
                    <Typography sx={{ mt: 0.35, fontSize: '0.84rem', color: 'text.secondary' }}>
                      Tap any row card in the pad table, then use the keypad to overwrite its confirmed quantity.
                    </Typography>
                  </Box>

                  {selectedTask ? (
                    <Paper elevation={0} sx={{ p: 1.25, borderRadius: 3, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
                      <Typography sx={{ fontSize: '0.76rem', color: 'text.secondary' }}>{selectedTask.taskId}</Typography>
                      <Typography sx={{ mt: 0.3, fontSize: '0.96rem', fontWeight: 900 }}>{selectedTask.title}</Typography>
                      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
                        <Chip size="small" label={`Zone ${selectedTask.zone}`} />
                        <Chip size="small" label={`Planned ${selectedTask.plannedQty}`} />
                        <Chip size="small" label={`Current ${selectedTask.confirmedQty}`} color="primary" variant="outlined" />
                      </Stack>
                    </Paper>
                  ) : null}

                  <PNumericKeypad
                    title="Confirm quantity"
                    subtitle={selectedTask ? `For ${selectedTask.taskId}` : 'Select a task first'}
                    value={keypadValue}
                    onChange={setKeypadValue}
                    onSubmit={handleSubmitKeypad}
                  />
                </Stack>
              </Paper>

              <Paper sx={{ p: 2, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                <Stack spacing={1}>
                  <Typography sx={{ fontSize: '0.96rem', fontWeight: 900 }}>What this page demonstrates</Typography>
                  <Typography sx={{ fontSize: '0.84rem', color: 'text.secondary', lineHeight: 1.6 }}>
                    1. `PAppPageLayout`: left navigation, top workload cards, responsive pad shell.
                  </Typography>
                  <Typography sx={{ fontSize: '0.84rem', color: 'text.secondary', lineHeight: 1.6 }}>
                    2. `PTable`: touch row cards with the same layout, variant, grouping, summary, export and quick action plumbing as `CTable`.
                  </Typography>
                  <Typography sx={{ fontSize: '0.84rem', color: 'text.secondary', lineHeight: 1.6 }}>
                    3. `PNumericKeypad`: real input that writes back into the currently selected task.
                  </Typography>
                  <Typography sx={{ fontSize: '0.84rem', color: 'text.secondary', lineHeight: 1.6 }}>
                    4. `PBarcodeScanner`: camera-based barcode trigger with manual-entry fallback and callback wiring.
                  </Typography>
                </Stack>
              </Paper>
            </Stack>
          </Box>
        </Stack>
      </CPageTransition>

      <PBarcodeScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onDetected={(result) => handleBarcodeDetected(result.rawValue)}
        onError={(message) => setLastAction(`Scanner warning: ${message}`)}
      />
    </PAppPageLayout>
  );
}
