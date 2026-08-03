'use client';

import type { TreeMenuItem } from 'orbcafe-ui';
import {
  Bot,
  ChartNoAxesCombined,
  ClipboardList,
  LayoutDashboard,
  MessageSquare,
  PanelRight,
  TabletSmartphone,
  Table2,
  TreePine,
} from 'orbcafe-ui';

export const buildExampleMenu = (detailInfoHref = '/detail-info/ID-1'): TreeMenuItem[] => [
  {
    id: 'overview',
    title: 'Overview',
    icon: <LayoutDashboard className="w-4 h-4" />,
    children: [
      { id: 'dashboard', title: 'Dashboard', href: '/' },
      { id: 'login', title: 'Login', href: '/login' },
    ],
  },
  {
    id: 'reports',
    title: 'Reports',
    icon: <Table2 className="w-4 h-4" />,
    children: [
      { id: 'std-report', title: 'Standard Report', href: '/std-report' },
      { id: 'ctree', title: 'CTree', href: '/ctree', icon: <TreePine className="w-4 h-4" /> },
      {
        id: 'analytics',
        title: 'Analytics',
        icon: <ChartNoAxesCombined className="w-4 h-4" />,
        children: [
          { id: 'pivot-table', title: 'Pivot Table', href: '/pivot-table' },
          { id: 'detail-info', title: 'Detail Info', href: detailInfoHref },
        ],
      },
    ],
  },
  {
    id: 'operations',
    title: 'Operations',
    icon: <ClipboardList className="w-4 h-4" />,
    children: [
      { id: 'planning', title: 'Planning Gantt', href: '/planning' },
      { id: 'kanban', title: 'Kanban', href: '/kanban' },
      { id: 'pad', title: 'Pad Demo', href: '/pad', icon: <TabletSmartphone className="w-4 h-4" /> },
    ],
  },
  {
    id: 'ai-tools',
    title: 'AI Tools',
    icon: <Bot className="w-4 h-4" />,
    children: [
      { id: 'chat', title: 'Chat', href: '/chat', icon: <MessageSquare className="w-4 h-4" /> },
      { id: 'copilot', title: 'Copilot', href: '/copilot', icon: <PanelRight className="w-4 h-4" /> },
      { id: 'aipanel', title: 'AI Panel', href: '/aipanel' },
      { id: 'ai-nav', title: 'AI Nav', href: '/ai-nav' },
    ],
  },
];

export const EXAMPLE_MENU = buildExampleMenu();
