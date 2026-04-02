'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Chip, Paper, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import ViewKanbanOutlinedIcon from '@mui/icons-material/ViewKanbanOutlined';
import { LayoutDashboard, Mail, Mic, Settings, Table2 } from 'lucide-react';
import {
  CAppPageLayout,
  CKanbanBoard,
  CPageTransition,
  useKanbanBoard,
  type KanbanBucketDefinition,
  type KanbanCardRecord,
  type TreeMenuItem,
} from 'orbcafe-ui';

const bucketDefinitions: KanbanBucketDefinition[] = [
  {
    id: 'intake',
    title: 'Intake',
    description: 'Clarify scope and assign accountable owner.',
    accentColor: '#5B6CFF',
    icon: <Inventory2OutlinedIcon fontSize="small" color="primary" />,
    limit: 3,
  },
  {
    id: 'execution',
    title: 'Execution',
    description: 'Push active delivery work with measurable progress.',
    accentColor: '#0F766E',
    icon: <RocketLaunchOutlinedIcon fontSize="small" sx={{ color: '#0F766E' }} />,
    limit: 4,
  },
  {
    id: 'review',
    title: 'Review',
    description: 'Business confirmation, sign-off and QA checks.',
    accentColor: '#D97706',
    icon: <FactCheckOutlinedIcon fontSize="small" sx={{ color: '#D97706' }} />,
    limit: 2,
  },
  {
    id: 'done',
    title: 'Done',
    description: 'Released items and archived operational work.',
    accentColor: '#059669',
    icon: <TaskAltOutlinedIcon fontSize="small" sx={{ color: '#059669' }} />,
  },
];

const initialCards: KanbanCardRecord[] = [
  {
    id: 'TASK-101',
    bucketId: 'intake',
    title: 'Finalize quarter-close checklist for Germany rollout',
    summary: 'Collect sign-off owners, attach fiscal controls, and lock the cutover sequence.',
    kicker: 'Finance Rollout',
    priority: 'high',
    progress: 18,
    dueDate: 'Due Mar 24',
    assignee: { name: 'Liu, Gang' },
    tags: [
      { id: 'sap', label: 'SAP' },
      { id: 'finance', label: 'Finance', color: 'primary' },
    ],
    metrics: [
      { id: 'eta', label: 'ETA', value: '3d' },
      { id: 'risk', label: 'Risk', value: 'Med' },
      { id: 'owner', label: 'Owner', value: '1' },
    ],
  },
  {
    id: 'TASK-104',
    bucketId: 'intake',
    title: 'Collect warehouse scanner exceptions from pilot team',
    summary: 'Need missing device logs before the next integration window.',
    kicker: 'Warehouse',
    priority: 'medium',
    progress: 6,
    dueDate: 'Due Mar 26',
    assignee: { name: 'Wang, Xinlei' },
    tags: [{ id: 'pilot', label: 'Pilot', color: 'info' }],
    metrics: [
      { id: 'sites', label: 'Sites', value: '2' },
      { id: 'logs', label: 'Logs', value: 'Pending' },
    ],
  },
  {
    id: 'TASK-203',
    bucketId: 'execution',
    title: 'Reconcile API payload mapping for billing export',
    summary: 'Backend payload and UI field IDs still diverge on tax breakdown nodes.',
    kicker: 'Billing',
    priority: 'critical',
    progress: 64,
    dueDate: 'Due Mar 23',
    assignee: { name: 'Shen, Ruiyang' },
    tags: [
      { id: 'api', label: 'API', color: 'warning' },
      { id: 'ui', label: 'UI', color: 'secondary' },
    ],
    metrics: [
      { id: 'bugs', label: 'Open bugs', value: '3' },
      { id: 'owners', label: 'Owners', value: '2' },
      { id: 'env', label: 'Env', value: 'QA' },
    ],
  },
  {
    id: 'TASK-208',
    bucketId: 'execution',
    title: 'Prepare KPI narrative cards for steering dashboard',
    summary: 'Align summary language with MUI graph report visuals and board cadence.',
    kicker: 'Executive View',
    priority: 'medium',
    progress: 52,
    dueDate: 'Due Mar 27',
    assignee: { name: 'Chen, Yan' },
    tags: [{ id: 'kpi', label: 'KPI', color: 'success' }],
    metrics: [
      { id: 'slides', label: 'Slides', value: '8' },
      { id: 'reviewers', label: 'Reviewers', value: '3' },
    ],
  },
  {
    id: 'TASK-302',
    bucketId: 'review',
    title: 'Validate intercompany invoice detail page against legal template',
    summary: 'Check section layout, related records table and search fallback copy.',
    kicker: 'DetailInfo QA',
    priority: 'high',
    progress: 89,
    dueDate: 'Due Mar 25',
    assignee: { name: 'Zhao, Meng' },
    tags: [{ id: 'legal', label: 'Legal', color: 'error' }],
    metrics: [
      { id: 'issues', label: 'Issues', value: '1' },
      { id: 'round', label: 'Round', value: 'R2' },
    ],
  },
  {
    id: 'TASK-401',
    bucketId: 'done',
    title: 'Ship locale-safe navigation shell updates',
    summary: 'Next.js 16 route wrapper and hydration-safe menu shell are already live.',
    kicker: 'Layout',
    priority: 'low',
    progress: 100,
    dueDate: 'Released Mar 21',
    assignee: { name: 'Hu, Amy' },
    tags: [{ id: 'release', label: 'Released', color: 'success' }],
    metrics: [
      { id: 'locale', label: 'Locales', value: '6' },
      { id: 'status', label: 'Status', value: 'Live' },
    ],
  },
];

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

export default function KanbanExampleClient() {
  const router = useRouter();
  const [moveNotice, setMoveNotice] = useState('Drag cards across buckets or open any card into Detail Info.');

  const kanban = useKanbanBoard({
    initialBuckets: bucketDefinitions,
    initialCards,
    onCardMove: ({ card, model, toBucketId }) => {
      const bucket = model.buckets.find((item) => item.id === toBucketId);
      setMoveNotice(`${card.id} moved to ${bucket?.title ?? toBucketId}.`);
    },
  });

  const totalCards = useMemo(
    () => kanban.model.buckets.reduce((sum, bucket) => sum + bucket.cards.length, 0),
    [kanban.model],
  );
  const doneCount = useMemo(
    () => kanban.model.buckets.find((bucket) => bucket.id === 'done')?.cards.length ?? 0,
    [kanban.model],
  );
  const reviewCount = useMemo(
    () => kanban.model.buckets.find((bucket) => bucket.id === 'review')?.cards.length ?? 0,
    [kanban.model],
  );
  const criticalCount = useMemo(
    () => kanban.model.buckets.flatMap((bucket) => bucket.cards).filter((card) => card.priority === 'critical').length,
    [kanban.model],
  );

  const summaryItems = useMemo(
    () => [
      { label: 'Total Cards', value: totalCards, note: 'All workflow items' },
      { label: 'Ready For Review', value: reviewCount, note: 'Business validation queue' },
      { label: 'Released', value: `${Math.round((doneCount / Math.max(totalCards, 1)) * 100)}%`, note: `${doneCount} cards in done` },
      { label: 'Critical', value: criticalCount, note: 'Immediate attention required' },
    ],
    [criticalCount, doneCount, reviewCount, totalCards],
  );

  const menuData: TreeMenuItem[] = useMemo(
    () => [
      { id: 'dashboard', title: 'Dashboard', href: '/', icon: <LayoutDashboard className="w-4 h-4" /> },
      { id: 'std-report', title: 'Standard Report', href: '/std-report', icon: <LayoutDashboard className="w-4 h-4" /> },
      { id: 'kanban', title: 'Kanban', href: '/kanban', icon: <ViewKanbanOutlinedIcon fontSize="small" /> },
      { id: 'pivot-table', title: 'Pivot Table', href: '/pivot-table', icon: <Table2 className="w-4 h-4" /> },
      { id: 'detail-info', title: 'Detail Info', href: '/detail-info/TASK-203?source=kanban&backHref=/kanban', icon: <LayoutDashboard className="w-4 h-4" /> },
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
      <CPageTransition transitionKey="kanban-demo" variant="fade" durationMs={180}>
        <Box sx={{ height: 'calc(100vh - 120px)', overflow: 'auto', px: { xs: 1, md: 2 }, pb: 2 }}>
          <Stack spacing={2}>
            <Paper
              sx={(theme) => ({
                p: { xs: 1.6, md: 2 },
                borderRadius: 4,
                border: `1px solid ${theme.palette.divider}`,
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, rgba(91,108,255,0.18), rgba(15,118,110,0.16))'
                  : 'linear-gradient(135deg, rgba(91,108,255,0.10), rgba(15,118,110,0.10))',
              })}
            >
              <Stack spacing={1.2}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
                  <Box>
                    <Typography sx={{ fontSize: '1.25rem', fontWeight: 800 }}>Kanban Official Example</Typography>
                    <Typography sx={{ mt: 0.4, color: 'text.secondary' }}>
                      Hook-first workflow board with independent bucket/card styles and DetailInfo routing.
                    </Typography>
                  </Box>
                  <Chip color="primary" variant="outlined" label={moveNotice} sx={{ maxWidth: '100%', '& .MuiChip-label': { whiteSpace: 'normal' } }} />
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, minmax(0, 1fr))' }, gap: 1.2 }}>
                  {summaryItems.map((item) => (
                    <Paper key={item.label} sx={{ p: 1.35, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                      <Typography sx={{ fontSize: '0.76rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.35 }}>
                        {item.label}
                      </Typography>
                      <Typography sx={{ mt: 0.35, fontSize: '1.35rem', fontWeight: 800 }}>{item.value}</Typography>
                      <Typography sx={{ mt: 0.35, fontSize: '0.76rem', color: 'text.secondary' }}>{item.note}</Typography>
                    </Paper>
                  ))}
                </Box>
              </Stack>
            </Paper>

            <CKanbanBoard
              {...kanban.boardProps}
              bucketMaxHeight="calc(100vh - 360px)"
              onCardClick={({ card, bucket }) => {
                const params = new URLSearchParams({
                  source: 'kanban',
                  bucket: bucket.id,
                  bucketTitle: bucket.title,
                  backHref: '/kanban',
                });
                router.push(`/detail-info/${card.id}?${params.toString()}`);
              }}
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' }, gap: 1.2 }}>
              <Paper sx={{ p: 1.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 800 }}>Hook</Typography>
                <Typography sx={{ mt: 0.6, fontSize: '0.78rem', color: 'text.secondary', lineHeight: 1.6 }}>
                  Use `useKanbanBoard` to own the board model and feed `boardProps` directly into `CKanbanBoard`.
                </Typography>
              </Paper>
              <Paper sx={{ p: 1.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 800 }}>Tool</Typography>
                <Typography sx={{ mt: 0.6, fontSize: '0.78rem', color: 'text.secondary', lineHeight: 1.6 }}>
                  `moveKanbanCard` and `createKanbanBoardModel` are pure helpers for reducers, optimistic updates and server sync.
                </Typography>
              </Paper>
              <Paper sx={{ p: 1.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 800 }}>Skill</Typography>
                <Typography sx={{ mt: 0.6, fontSize: '0.78rem', color: 'text.secondary', lineHeight: 1.6 }}>
                  Route future Kanban requests through `skills/orbcafe-kanban-detail/SKILL.md` for examples-first usage.
                </Typography>
              </Paper>
            </Box>
          </Stack>
        </Box>
      </CPageTransition>
    </CAppPageLayout>
  );
}
