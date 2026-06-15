'use client';

import { useMemo } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import { useTheme } from '@mui/material/styles';
import dayjs from 'dayjs';
import {
  CAppPageLayout,
  CPlanningLayout,
  CPageTransition,
  type PlanningGanttColumn,
  type PlanningTaskRecord,
  usePlanningLayout,
} from 'orbcafe-ui';
import { EXAMPLE_MENU } from './exampleNavigation';

type DemoPlanningTaskRecord = PlanningTaskRecord & {
  orderNo?: string;
  operation?: string;
  operationText?: string;
  resourceGroup?: string;
  workCenterLabel?: string;
  capacity?: string;
  load?: string;
  quantity?: string;
  product?: string;
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

const createPlanningTasks = (): DemoPlanningTaskRecord[] => {
  const tasks: DemoPlanningTaskRecord[] = [];
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
      orderNo: orderCode,
      operation: '',
      operationText: productName,
      resourceGroup: 'PRODUCTION',
      workCenterLabel: 'PS1 - Production Scheduling',
      capacity: 'CAP-PS1',
      load: 'Total order',
      quantity: `${OPERATION_TEMPLATES.length * 240}/${OPERATION_TEMPLATES.length * 240}`,
      product: productName,
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
        orderNo: orderCode,
        operation: sequenceNo,
        operationText: `${sequenceNo} ${step.title}`,
        resourceGroup: step.workCenter,
        workCenterLabel: `${step.workCenter.slice(0, 3)}-${String(stepIndex + 1).padStart(2, '0')} - ${step.title} Line 01`,
        capacity: `CAP-${step.workCenter.slice(0, 3)}-${String(stepIndex + 1).padStart(2, '0')}`,
        load: `${step.durationHours.toFixed(1)}h`,
        quantity: '240/240',
        product: productName,
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

const planningTasks: DemoPlanningTaskRecord[] = createPlanningTasks();

const planningColumns: PlanningGanttColumn[] = [
  { id: 'orderNo', label: 'Order', width: 150 },
  { id: 'operation', label: 'Operation', width: 130 },
  { id: 'operationText', label: 'Activity', width: 250 },
  { id: 'resourceGroup', label: 'Resource Group', width: 160 },
  { id: 'workCenterLabel', label: 'Work Center', width: 280 },
  { id: 'capacity', label: 'Capacity', width: 150 },
  { id: 'load', label: 'Load', width: 120 },
  { id: 'quantity', label: 'Quantity', width: 130 },
  { id: 'startDate', label: 'Start', width: 150 },
  { id: 'endDate', label: 'End', width: 150 },
  { id: 'status', label: 'Status', width: 140 },
  { id: 'product', label: 'Product', width: 280 },
];

export default function PlanningExampleClient() {
  const planning = usePlanningLayout({
    tasks: planningTasks,
    columns: planningColumns,
    defaultScale: 'week',
    defaultSelectedTaskId: planningTasks[0]?.id,
    filterAppId: 'planning-gantt-filter',
    filterTableKey: 'planning',
    enableRowReorder: true,
  });

  const menuData = EXAMPLE_MENU;

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
