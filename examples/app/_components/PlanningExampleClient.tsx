'use client';

import { useMemo } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import { useTheme } from '@mui/material/styles';
import { LayoutDashboard, Mail, Mic, Settings, Table2 } from 'lucide-react';
import dayjs from 'dayjs';
import {
  CAppPageLayout,
  CPlanningLayout,
  CPageTransition,
  type PlanningTaskRecord,
  type TreeMenuItem,
  usePlanningLayout,
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

const OPERATION_TEMPLATES = [
  { code: '0010', title: 'Steel Tube Cutting', workCenter: 'CUTTING', durationHours: 24 },
  { code: '0020', title: 'Cleaning', workCenter: 'CLEANING', durationHours: 14 },
  { code: '0030', title: 'Grooving', workCenter: 'GROOVING', durationHours: 22 },
  { code: '0040', title: 'Welding', workCenter: 'WELDING', durationHours: 26 },
  { code: '0050', title: 'Pre-Assembly', workCenter: 'PREASSEMBLY', durationHours: 20 },
  { code: '0060', title: 'Painting', workCenter: 'PAINTING', durationHours: 10 },
  { code: '0070', title: 'Silk Printing', workCenter: 'PRINT_GAS', durationHours: 18 },
  { code: '0080', title: 'Nitrogen Charging', workCenter: 'FILLING', durationHours: 12 },
  { code: '0090', title: 'Final Assembly and Packing', workCenter: 'FINAL_ASSEMBLY', durationHours: 25 },
] as const;

const ORDER_COLORS = ['#2563eb', '#0f766e', '#dc2626', '#7c3aed', '#d97706'] as const;

const createPlanningTasks = (): PlanningTaskRecord[] => {
  const tasks: PlanningTaskRecord[] = [];
  const orderCount = 5;
  const startAnchor = dayjs('2026-06-01T08:00:00');

  for (let orderIndex = 0; orderIndex < orderCount; orderIndex += 1) {
    const orderNo = `${orderIndex + 1}`.padStart(4, '0');
    const orderCode = `5000000000${orderNo}`;
    const productName = `Automotive Hood Gas Spring ${orderIndex + 1}50N ${150 + orderIndex * 20}/50`;
    const fgCode = `FG-GS-HOOD-${150 + orderIndex * 20}-050-${250 + orderIndex * 10}N`;
    const orderStart = startAnchor.add(orderIndex, 'hour');
    let opCursor = orderStart;

    const operationEnd = orderStart.add(
      OPERATION_TEMPLATES.reduce((sum, step) => sum + step.durationHours, 0) + OPERATION_TEMPLATES.length,
      'hour',
    );

    tasks.push({
      id: `P-ORDER-${orderNo}`,
      code: orderCode,
      title: productName,
      project: fgCode,
      workCenter: 'PS1',
      startDate: orderStart.toISOString(),
      endDate: operationEnd.toISOString(),
      progress: 30 + orderIndex * 8,
      status: orderIndex === 3 ? 'in-progress' : 'planned',
      priority: 'high',
      owner: { name: `Planner ${orderIndex + 1}`, initials: `P${orderIndex + 1}` },
      color: ORDER_COLORS[orderIndex % ORDER_COLORS.length],
      reorderable: orderIndex !== 0,
    });

    OPERATION_TEMPLATES.forEach((step, stepIndex) => {
      const opStart = opCursor;
      const opEnd = opStart.add(step.durationHours, 'hour');
      const sequenceNo = `${(stepIndex + 1) * 10}`.padStart(4, '0');
      tasks.push({
        id: `P-${orderNo}-${sequenceNo}`,
        code: sequenceNo,
        title: step.title,
        project: productName,
        workCenter: step.workCenter,
        startDate: opStart.toISOString(),
        endDate: opEnd.toISOString(),
        progress: Math.max(5, 18 - orderIndex * 2),
        status: orderIndex === 1 && stepIndex === 4 ? 'blocked' : orderIndex <= 1 ? 'in-progress' : 'planned',
        priority: stepIndex === 4 ? 'critical' : 'medium',
        owner: { name: step.workCenter, initials: step.workCenter.slice(0, 2) },
        color: ORDER_COLORS[(orderIndex + stepIndex) % ORDER_COLORS.length],
        reorderable: step.code !== '0090',
      });
      opCursor = opEnd.add(1, 'hour');
    });
  }

  return tasks;
};

const planningTasks: PlanningTaskRecord[] = createPlanningTasks();

export default function PlanningExampleClient() {
  const planning = usePlanningLayout({
    tasks: planningTasks,
    defaultScale: 'week',
    defaultSelectedTaskId: planningTasks[0]?.id,
    filterAppId: 'planning-gantt-filter',
    filterTableKey: 'planning',
    enableRowReorder: true,
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
        <Box sx={{ height: 'calc(100vh - 120px)', overflow: 'hidden', px: { xs: 1, md: 2 }, pb: 0 }}>
          <Stack spacing={2} sx={{ height: '100%' }}>
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <CPlanningLayout
                filterProps={planning.layoutProps.filterProps}
                ganttProps={{
                  ...planning.layoutProps.ganttProps,
                  title: 'Production Plan',
                  subtitle: 'Project management and production planning table with Gantt timeline',
                  extraTools: (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<MailOutlineIcon fontSize="small" />}
                      onClick={() => console.log('Send planning email')}
                      sx={{ minWidth: 132, height: 36 }}
                    >
                      Send email
                    </Button>
                  ),
                }}
                sx={{ height: '100%' }}
              />
            </Box>
          </Stack>
        </Box>
      </CPageTransition>
    </CAppPageLayout>
  );
}
