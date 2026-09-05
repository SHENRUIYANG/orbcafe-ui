'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CKanbanBoard,
  CIconButton,
  CPageTransition,
  CSmartFilter,
  CTypography,
  ChevronDown,
  ChevronUp,
  useOrbMode,
  useKanbanBoard,
  type FilterField,
  type FilterValue,
  type KanbanBucketDefinition,
  type KanbanCardRecord,
} from 'orbcafe-ui';
import { ExamplePageLayout } from './ExamplePageLayout';
import { CircleCheckBig, ClipboardCheck, PackageSearch, Rocket } from 'orbcafe-ui';
import { EXAMPLE_MENU } from './exampleNavigation';

const bucketDefinitions: KanbanBucketDefinition[] = [
  {
    id: 'intake',
    title: 'Intake',
    description: 'Clarify scope and assign accountable owner.',
    accentColor: 'var(--orb-chart-1)',
    icon: <PackageSearch size={18} />,
    limit: 3,
  },
  {
    id: 'execution',
    title: 'Execution',
    description: 'Push active delivery work with measurable progress.',
    accentColor: 'var(--orb-chart-2)',
    icon: <Rocket size={18} />,
    limit: 4,
  },
  {
    id: 'review',
    title: 'Review',
    description: 'Business confirmation, sign-off and QA checks.',
    accentColor: 'var(--orb-chart-5)',
    icon: <ClipboardCheck size={18} />,
    limit: 2,
  },
  {
    id: 'done',
    title: 'Done',
    description: 'Released items and archived operational work.',
    accentColor: 'var(--orb-chart-4)',
    icon: <CircleCheckBig size={18} />,
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

const selectedFilterValues = (filters: Record<string, FilterValue>, id: string): string[] => {
  const value = filters[id]?.value;
  if (!value) return [];
  return (Array.isArray(value) ? value : [value]).map(String);
};

const cardMatchesFilters = (card: KanbanCardRecord, filters: Record<string, FilterValue>) => {
  const buckets = selectedFilterValues(filters, 'bucket');
  const priorities = selectedFilterValues(filters, 'priority');
  const assignees = selectedFilterValues(filters, 'assignee');
  const tags = selectedFilterValues(filters, 'tag');

  if (buckets.length > 0 && !buckets.includes(card.bucketId)) return false;
  if (priorities.length > 0 && (!card.priority || !priorities.includes(card.priority))) return false;
  if (assignees.length > 0 && (!card.assignee || !assignees.includes(card.assignee.name))) return false;
  if (tags.length > 0 && !card.tags?.some((tag) => tags.includes(tag.id))) return false;
  return true;
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

export default function KanbanExampleClient() {
  const router = useRouter();
  const [moveNotice, setMoveNotice] = useState('Drag cards across buckets or open any card into Detail Info.');
  const [filters, setFilters] = useState<Record<string, FilterValue>>({});
  const [appliedFilters, setAppliedFilters] = useState<Record<string, FilterValue>>({});
  const [kpisExpanded, setKpisExpanded] = useState(true);

  const kanban = useKanbanBoard({
    initialBuckets: bucketDefinitions,
    initialCards,
    onCardMove: ({ card, model, toBucketId }) => {
      const bucket = model.buckets.find((item) => item.id === toBucketId);
      setMoveNotice(`${card.id} moved to ${bucket?.title ?? toBucketId}.`);
    },
  });

  const filterFields = useMemo<FilterField[]>(() => {
    const cards = kanban.model.buckets.flatMap((bucket) => bucket.cards);
    const assignees = [...new Set(cards.flatMap((card) => card.assignee?.name ? [card.assignee.name] : []))];
    const tags = [...new Map(cards.flatMap((card) => card.tags ?? []).map((tag) => [tag.id, tag])).values()];

    return [
      {
        id: 'bucket',
        label: 'Bucket',
        type: 'multi-select',
        options: kanban.model.buckets.map((bucket) => ({ label: bucket.title, value: bucket.id })),
      },
      {
        id: 'priority',
        label: 'Priority',
        type: 'multi-select',
        options: [
          { label: 'Critical', value: 'critical' },
          { label: 'High', value: 'high' },
          { label: 'Medium', value: 'medium' },
          { label: 'Low', value: 'low' },
        ],
      },
      {
        id: 'assignee',
        label: 'Assignee',
        type: 'multi-select',
        options: assignees.map((name) => ({ label: name, value: name })),
      },
      {
        id: 'tag',
        label: 'Tag',
        type: 'multi-select',
        options: tags.map((tag) => ({ label: tag.label, value: tag.id })),
      },
    ];
  }, [kanban.model]);

  const cardFilter = useCallback(
    (card: KanbanCardRecord) => cardMatchesFilters(card, appliedFilters),
    [appliedFilters],
  );

  const visibleCards = useMemo(
    () => kanban.model.buckets.flatMap((bucket) => bucket.cards).filter((card) => cardMatchesFilters(card, appliedFilters)),
    [appliedFilters, kanban.model],
  );
  const totalCards = visibleCards.length;
  const doneCount = visibleCards.filter((card) => card.bucketId === 'done').length;
  const reviewCount = visibleCards.filter((card) => card.bucketId === 'review').length;
  const criticalCount = visibleCards.filter((card) => card.priority === 'critical').length;

  const summaryItems = useMemo(
    () => [
      { label: 'Total Cards', value: totalCards, note: 'All workflow items', color: 'var(--orb-primary)' },
      { label: 'Ready For Review', value: reviewCount, note: 'Business validation queue', color: 'var(--orb-chart-2)' },
      { label: 'Released', value: `${Math.round((doneCount / Math.max(totalCards, 1)) * 100)}%`, note: `${doneCount} cards in done`, color: 'var(--orb-chart-4)' },
      { label: 'Critical', value: criticalCount, note: 'Immediate attention required', color: 'var(--orb-err)' },
    ],
    [criticalCount, doneCount, reviewCount, totalCards],
  );

  const handleBucketAdd = () => {
    let sequence = kanban.model.buckets.length + 1;
    while (kanban.model.buckets.some((bucket) => bucket.id === `bucket-${sequence}`)) sequence += 1;
    const title = `New bucket ${sequence}`;
    const added = kanban.actions.addBucket({
      id: `bucket-${sequence}`,
      title,
      description: 'New workflow stage.',
      accentColor: `var(--orb-chart-${((sequence - 1) % 5) + 1})`,
    });
    if (added) setMoveNotice(`${title} added. Use the edit button to rename it.`);
  };

  const menuData = EXAMPLE_MENU;

  return (
    <ExamplePageLayout
      appId="orbcafe-examples"
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
        <div
          style={{
            boxSizing: 'border-box',
            height: 'calc(100vh - 120px)',
            minHeight: 0,
            overflow: 'hidden',
            padding: '16px 16px 16px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%', minHeight: 0 }}>
            <section
              style={{
                minWidth: 0,
                padding: '4px 0',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ minWidth: 0 }}>
                  <CTypography component="div" sx={{ fontSize: 19, fontWeight: 600, lineHeight: 1.3 }}>Kanban Official Example</CTypography>
                  <CTypography component="div" sx={{ marginTop: 3, fontSize: 13, color: 'var(--orb-muted)' }}>
                    Hook-first workflow board with independent bucket/card styles and DetailInfo routing.
                  </CTypography>
                </div>
                <span
                  style={{
                    maxWidth: '100%',
                    padding: '5px 9px',
                    border: '1px solid var(--orb-p100)',
                    borderRadius: 'var(--orb-r)',
                    background: 'var(--orb-p50)',
                    color: 'var(--orb-link)',
                    font: '500 12px/1.35 var(--orb-font)',
                    whiteSpace: 'normal',
                  }}
                >
                  {moveNotice}
                </span>
              </div>
            </section>

            <div style={{ paddingBottom: 4 }}>
              <CSmartFilter
                appId="orbcafe-examples-kanban"
                tableKey="kanban-board"
                fields={filterFields}
                filters={filters}
                onFilterChange={setFilters}
                onVariantLoad={() => undefined}
                onSearch={() => setAppliedFilters(filters)}
              />
            </div>

            <section style={{ minWidth: 0 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  minHeight: 28,
                  marginBottom: kpisExpanded ? 6 : 0,
                }}
              >
                <CTypography component="div" sx={{ fontSize: 12, fontWeight: 600, color: 'var(--orb-muted)', textTransform: 'uppercase' }}>
                  Board summary
                </CTypography>
                <CIconButton
                  size="small"
                  tooltip={kpisExpanded ? 'Collapse KPIs' : 'Expand KPIs'}
                  aria-label={kpisExpanded ? 'Collapse KPIs' : 'Expand KPIs'}
                  aria-expanded={kpisExpanded}
                  onClick={() => setKpisExpanded((expanded) => !expanded)}
                >
                  {kpisExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </CIconButton>
              </div>

              {kpisExpanded && (
                <div style={{ overflowX: 'auto' }}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, minmax(190px, 1fr))',
                      minWidth: 760,
                      overflow: 'hidden',
                      border: '1px solid var(--orb-divider)',
                      borderRadius: 'var(--orb-r-container)',
                      background: 'var(--orb-canvas)',
                    }}
                  >
                    {summaryItems.map((item) => (
                      <div
                        key={item.label}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'auto minmax(0, 1fr)',
                          gridTemplateRows: 'auto auto',
                          alignItems: 'center',
                          columnGap: 12,
                          minHeight: 72,
                          padding: '10px 16px',
                          borderRight: item.label === 'Critical' ? 'none' : '1px solid var(--orb-divider)',
                        }}
                      >
                        <CTypography
                          component="div"
                          numeric
                          sx={{ gridRow: '1 / span 2', minWidth: 38, fontSize: 24, fontWeight: 600, lineHeight: 1, color: item.color }}
                        >
                          {item.value}
                        </CTypography>
                        <CTypography component="div" sx={{ alignSelf: 'end', fontSize: 11, fontWeight: 500, color: 'var(--orb-fg)', textTransform: 'uppercase' }}>
                          {item.label}
                        </CTypography>
                        <CTypography component="div" noWrap sx={{ alignSelf: 'start', fontSize: 12, color: 'var(--orb-muted)' }}>
                          {item.note}
                        </CTypography>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <div style={{ flex: '1 1 0%', minWidth: 0, minHeight: 0, overflow: 'hidden' }}>
              <CKanbanBoard
                {...kanban.boardProps}
                searchable
                bucketHeight="100%"
                cardFilter={cardFilter}
                onBucketAdd={handleBucketAdd}
                onBucketRename={(bucketId, title) => {
                  if (kanban.actions.renameBucket(bucketId, title)) {
                    setMoveNotice(`Bucket renamed to ${title}.`);
                  }
                }}
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
            </div>
          </div>
        </div>
      </CPageTransition>
    </ExamplePageLayout>
  );
}
