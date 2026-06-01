'use client';

import { useMemo } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import { useTheme } from '@mui/material/styles';
import { LayoutDashboard, Mail, Mic, Settings, Table2 } from 'lucide-react';
import {
  CAppPageLayout,
  CPageTransition,
  CPlanningGantt,
  CSmartFilter,
  type PlanningTaskRecord,
  type TreeMenuItem,
  usePlanningGantt,
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

const planningTasks: PlanningTaskRecord[] = [
  {
    id: 'P-100',
    code: 'PP-100',
    title: 'Finalize production demand plan',
    project: 'Q3 Product Launch',
    workCenter: 'Planning',
    startDate: '2026-06-01',
    endDate: '2026-06-08',
    progress: 72,
    status: 'in-progress',
    priority: 'high',
    owner: { name: 'Ruiyang Shen', initials: 'RS' },
    color: '#2563eb',
  },
  {
    id: 'P-110',
    code: 'PP-110',
    title: 'Reserve bottleneck machine capacity',
    project: 'Q3 Product Launch',
    workCenter: 'CNC-02',
    startDate: '2026-06-05',
    endDate: '2026-06-18',
    progress: 44,
    status: 'in-progress',
    priority: 'critical',
    owner: { name: 'Mina Zhang', initials: 'MZ' },
    dependencyIds: ['P-100'],
    color: '#0f766e',
  },
  {
    id: 'P-120',
    code: 'PP-120',
    title: 'Supplier confirmation for long-lead material',
    project: 'Material Readiness',
    workCenter: 'Procurement',
    startDate: '2026-06-10',
    endDate: '2026-06-24',
    progress: 18,
    status: 'blocked',
    priority: 'high',
    owner: { name: 'Anna Keller', initials: 'AK' },
    dependencyIds: ['P-100'],
    color: '#dc2626',
  },
  {
    id: 'P-130',
    code: 'PP-130',
    title: 'Warehouse staging and kitting',
    project: 'Factory Ramp',
    workCenter: 'WH-A',
    startDate: '2026-06-19',
    endDate: '2026-07-02',
    progress: 8,
    status: 'planned',
    priority: 'medium',
    owner: { name: 'Tom Becker', initials: 'TB' },
    dependencyIds: ['P-110', 'P-120'],
    color: '#7c3aed',
  },
  {
    id: 'P-140',
    code: 'PP-140',
    title: 'Pilot manufacturing order run',
    project: 'Factory Ramp',
    workCenter: 'Line 4',
    startDate: '2026-07-03',
    endDate: '2026-07-14',
    progress: 0,
    status: 'not-started',
    priority: 'medium',
    owner: { name: 'Nora Weiss', initials: 'NW' },
    dependencyIds: ['P-130'],
    color: '#d97706',
  },
  {
    id: 'P-150',
    code: 'PP-150',
    title: 'Quality gate and release checklist',
    project: 'Factory Ramp',
    workCenter: 'Quality',
    startDate: '2026-07-12',
    endDate: '2026-07-22',
    progress: 0,
    status: 'planned',
    priority: 'high',
    owner: { name: 'Ken Ito', initials: 'KI' },
    dependencyIds: ['P-140'],
    color: '#0891b2',
  },
];

export default function PlanningExampleClient() {
  const planning = usePlanningGantt({
    tasks: planningTasks,
    defaultScale: 'week',
    defaultSelectedTaskId: 'P-110',
  });

  const menuData: TreeMenuItem[] = useMemo(
    () => [
      { id: 'dashboard', title: 'Login', href: '/', icon: <LayoutDashboard className="w-4 h-4" /> },
      { id: 'std-report', title: 'Standard Report', href: '/std-report', icon: <LayoutDashboard className="w-4 h-4" /> },
      { id: 'kanban', title: 'Kanban', href: '/kanban', icon: <LayoutDashboard className="w-4 h-4" /> },
      { id: 'planning', title: 'Planning Gantt', href: '/planning', icon: <CalendarMonthOutlinedIcon fontSize="small" /> },
      { id: 'pivot-table', title: 'Pivot Table', href: '/pivot-table', icon: <Table2 className="w-4 h-4" /> },
      { id: 'detail-info', title: 'Detail Info', href: '/detail-info/ID-1', icon: <LayoutDashboard className="w-4 h-4" /> },
      { id: 'ai-nav', title: 'AI Nav', href: '/ai-nav', icon: <Mic className="w-4 h-4" /> },
      { id: 'messages', title: 'Messages', href: '/messages', icon: <Mail className="w-4 h-4" /> },
      { id: 'settings', title: 'Settings', href: '/settings', icon: <Settings className="w-4 h-4" /> },
    ],
    [],
  );

  return (
    <CAppPageLayout
      appTitle=""
      menuData={menuData}
      locale="en"
      localeLabel="EN"
      user={{ name: 'Ruiyang Shen', subtitle: 'ruiyang.shen@orbis.de', avatarSrc: '/orbcafe.png' }}
      logo={<HeaderBrandLogo />}
    >
      <CPageTransition transitionKey="planning-demo" variant="fade" durationMs={180}>
        <Box sx={{ height: 'calc(100vh - 120px)', overflow: 'auto', px: { xs: 1, md: 2 }, pb: 2 }}>
          <Stack spacing={2}>
            <CSmartFilter
              {...planning.smartFilterProps}
            />

            <CPlanningGantt
              title="Production Plan"
              subtitle="Project management and production planning table with Gantt timeline"
              {...planning.planningGanttProps}
            />
          </Stack>
        </Box>
      </CPageTransition>
    </CAppPageLayout>
  );
}
