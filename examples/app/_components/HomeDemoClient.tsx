'use client';

import { NavigationIsland, Button, TreeMenuItem, useNavigationIsland } from 'orbcafe-ui';
import { 
  Home, 
  Settings, 
  User, 
  Mail, 
  Bell,
  LayoutDashboard,
  Table2,
  Mic,
  MessageSquare,
  Bot,
  PanelRight,
  TabletSmartphone,
} from 'lucide-react';

export default function DemoPage() {
  // 模拟菜单数据
  const menuData: TreeMenuItem[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      href: '/',
    },
    {
      id: 'chat-example',
      title: 'Chat App',
      icon: <MessageSquare className="w-4 h-4" />,
      href: '/chat',
    },
    {
      id: 'copilot-example',
      title: 'Copilot',
      icon: <Bot className="w-4 h-4" />,
      href: '/copilot',
    },
    {
      id: 'aipanel-example',
      title: 'AI Panel',
      icon: <PanelRight className="w-4 h-4" />,
      href: '/aipanel',
    },
    {
      id: 'messages',
      title: 'Messages',
      icon: <Mail className="w-4 h-4" />,
      children: [
        { id: 'inbox', title: 'Inbox', href: '/messages/inbox' },
        { id: 'sent', title: 'Sent', href: '/messages/sent' },
      ]
    },
    {
      id: 'std-report',
      title: 'Standard Report',
      icon: <LayoutDashboard className="w-4 h-4" />,
      href: '/std-report',
    },
    {
      id: 'kanban',
      title: 'Kanban',
      icon: <LayoutDashboard className="w-4 h-4" />,
      href: '/kanban',
    },
    {
      id: 'pad',
      title: 'Pad Demo',
      icon: <TabletSmartphone className="w-4 h-4" />,
      href: '/pad',
    },
    {
      id: 'pivot-table',
      title: 'Pivot Table',
      icon: <Table2 className="w-4 h-4" />,
      href: '/pivot-table',
    },
    {
      id: 'detail-info',
      title: 'Detail Info',
      icon: <LayoutDashboard className="w-4 h-4" />,
      href: '/detail-info/ID-1',
    },
    {
      id: 'ai-nav',
      title: 'AI Nav',
      icon: <Mic className="w-4 h-4" />,
      href: '/ai-nav',
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: <Settings className="w-4 h-4" />,
      children: [
        { 
          id: 'profile', 
          title: 'Profile', 
          icon: <User className="w-4 h-4" />,
          href: '/settings/profile' 
        },
        { 
          id: 'notifications', 
          title: 'Notifications', 
          icon: <Bell className="w-4 h-4" />,
          href: '/settings/notifications' 
        },
      ]
    }
  ];

  const { navigationIslandProps } = useNavigationIsland({
    initialCollapsed: false,
    content: menuData,
  });

  return (
    <div className="flex h-screen bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-gray-900 dark:to-gray-800 p-8 gap-8">
      {/* 侧边栏展示 */}
      <div className="h-full flex flex-col gap-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Navigation Island</h2>
        <NavigationIsland {...navigationIslandProps} />
      </div>

      {/* 主内容区域展示其他组件 */}
      <div className="flex-1 flex flex-col gap-8 overflow-y-auto">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Button Variants</h2>
          <div className="flex flex-wrap gap-4 p-6 bg-white/50 dark:bg-black/20 backdrop-blur-xl rounded-2xl border border-white/20">
            <Button variant="default">Default Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="destructive">Destructive Button</Button>
            <Button variant="link">Link Button</Button>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Button Sizes</h2>
          <div className="flex flex-wrap items-center gap-4 p-6 bg-white/50 dark:bg-black/20 backdrop-blur-xl rounded-2xl border border-white/20">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon"><Home className="w-4 h-4" /></Button>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Interactive States</h2>
          <div className="flex flex-wrap gap-4 p-6 bg-white/50 dark:bg-black/20 backdrop-blur-xl rounded-2xl border border-white/20">
            <Button disabled>Disabled</Button>
            <Button className="animate-pulse">Loading...</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
