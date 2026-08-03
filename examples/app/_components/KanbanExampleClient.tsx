'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CAppPageLayout,
  CKanbanBoard,
  CPageTransition,
  CPaper,
  CStack,
  CTypography,
  useOrbMode,
  useKanbanBoard,
  type KanbanBucketDefinition,
  type KanbanCardRecord,
} from 'orbcafe-ui';
import { CircleCheckBig, ClipboardCheck, PackageSearch, Rocket } from 'orbcafe-ui';
import { EXAMPLE_MENU } from './exampleNavigation';

const bucketDefinitions: KanbanBucketDefinition[] = [
  {
    id: 'intake',
    title: 'Intake',
    description: 'Clarify scope and assign accountable owner.',
    accentColor: '#5B6CFF',
    icon: <PackageSearch size={18} color="#2770ff" />,
    limit: 3,
  },
  {
    id: 'execution',
    title: 'Execution',
    description: 'Push active delivery work with measurable progress.',
    accentColor: '#0F766E',
    icon: <Rocket size={18} color="#0F766E" />,
    limit: 4,
  },
  {
    id: 'review',
    title: 'Review',
    description: 'Business confirmation, sign-off and QA checks.',
    accentColor: '#D97706',
    icon: <ClipboardCheck size={18} color="#D97706" />,
    limit: 2,
  },
  {
    id: 'done',
    title: 'Done',
    description: 'Released items and archived operational work.',
    accentColor: '#059669',
    icon: <CircleCheckBig size={18} color="#059669" />,
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
    summary: 'Align summary language with ORBIS graph report visuals and board cadence.',
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

  const menuData = EXAMPLE_MENU;

  return (
    <CAppPageLayout
      appTitle=""
      navigationVariant="v2"
      searchPlacement="header"
      menuData={menuData}
      locale="en"
      localeLabel="EN"
      user={{ name: 'Ruiyang Shen', subtitle: 'ruiyang.shen@orbis.de', avatarSrc: '/orbcafe.png' }}
      onUserRefresh={() => window.location.reload()}
      onUserLogout={() => window.location.assign('/login')}
      logo={<HeaderBrandLogo />}
    >
      <CPageTransition transitionKey="kanban-demo" variant="fade" durationMs={180}>
        <div style={{ height: 'calc(100vh - 120px)', overflow: 'auto', padding: '16px 16px 16px' }}>
          <CStack spacing={2}>
            <CPaper
              style={{
                padding: 16,
                borderRadius: 'var(--orb-r-container)',
                border: '1px solid var(--orb-divider)',
                background: 'linear-gradient(135deg, rgba(91,108,255,0.10), rgba(15,118,110,0.10))',
              }}
            >
              <CStack spacing={1.2}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <div>
                    <CTypography sx={{ fontSize: '1.25rem', fontWeight: 800 }}>Kanban Official Example</CTypography>
                    <CTypography sx={{ marginTop: 4, color: 'var(--orb-muted)' }}>
                      Hook-first workflow board with independent bucket/card styles and DetailInfo routing.
                    </CTypography>
                  </div>
                  <span style={{ fontSize: '0.875rem', padding: '6px 12px', borderRadius: 16, border: '1px solid var(--orb-primary)', color: 'var(--orb-primary)', maxWidth: '100%', whiteSpace: 'normal' }}>
                    {moveNotice}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
                  {summaryItems.map((item) => (
                    <CPaper key={item.label} sx={{ padding: 11, borderRadius: 'var(--orb-r-container)', border: '1px solid var(--orb-divider)' }}>
                      <CTypography sx={{ fontSize: '0.76rem', color: 'var(--orb-muted)', textTransform: 'uppercase', letterSpacing: 0.35 }}>
                        {item.label}
                      </CTypography>
                      <CTypography sx={{ marginTop: 3, fontSize: '1.35rem', fontWeight: 800 }}>{item.value}</CTypography>
                      <CTypography sx={{ marginTop: 3, fontSize: '0.76rem', color: 'var(--orb-muted)' }}>{item.note}</CTypography>
                    </CPaper>
                  ))}
                </div>
              </CStack>
            </CPaper>

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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 10 }}>
              <CPaper sx={{ padding: 12, borderRadius: 'var(--orb-r-container)', border: '1px solid var(--orb-divider)' }}>
                <CTypography sx={{ fontSize: '0.82rem', fontWeight: 800 }}>Hook</CTypography>
                <CTypography sx={{ marginTop: 5, fontSize: '0.78rem', color: 'var(--orb-muted)', lineHeight: 1.6 }}>
                  Use `useKanbanBoard` to own the board model and feed `boardProps` directly into `CKanbanBoard`.
                </CTypography>
              </CPaper>
              <CPaper sx={{ padding: 12, borderRadius: 'var(--orb-r-container)', border: '1px solid var(--orb-divider)' }}>
                <CTypography sx={{ fontSize: '0.82rem', fontWeight: 800 }}>Tool</CTypography>
                <CTypography sx={{ marginTop: 5, fontSize: '0.78rem', color: 'var(--orb-muted)', lineHeight: 1.6 }}>
                  `moveKanbanCard` and `createKanbanBoardModel` are pure helpers for reducers, optimistic updates and server sync.
                </CTypography>
              </CPaper>
              <CPaper sx={{ padding: 12, borderRadius: 'var(--orb-r-container)', border: '1px solid var(--orb-divider)' }}>
                <CTypography sx={{ fontSize: '0.82rem', fontWeight: 800 }}>Skill</CTypography>
                <CTypography sx={{ marginTop: 5, fontSize: '0.78rem', color: 'var(--orb-muted)', lineHeight: 1.6 }}>
                  Route future Kanban requests through `skills/orbcafe-kanban-detail/SKILL.md` for examples-first usage.
                </CTypography>
              </CPaper>
            </div>
          </CStack>
        </div>
      </CPageTransition>
    </CAppPageLayout>
  );
}
