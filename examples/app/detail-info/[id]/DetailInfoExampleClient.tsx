'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { LayoutDashboard, Settings, Mail, Mic, Table2 } from 'lucide-react';
import { CAppPageLayout, CDetailInfoPage, CPageTransition, type TreeMenuItem } from 'orbcafe-ui';

const buildRows = (id: string) => ([
  {
    id: `${id}-1`,
    date: '2026-02-20',
    item: 'Worklog',
    person: 'Liu, Gang',
    amount: 612.5,
    status: 'OK',
  },
  {
    id: `${id}-2`,
    date: '2026-02-21',
    item: 'Worklog',
    person: 'Shen, Ruiyang',
    amount: 1225,
    status: 'OK',
  },
  {
    id: `${id}-3`,
    date: '2026-02-22',
    item: 'Travel',
    person: 'Wang, Xinlei',
    amount: 180.8,
    status: 'Flag',
  },
]);

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

interface DetailInfoExampleClientProps {
  rowId: string;
  source?: string;
  sourceBucketId?: string;
  sourceBucketTitle?: string;
  backHref?: string;
}

export default function DetailInfoExampleClient({
  rowId,
  source,
  sourceBucketId,
  sourceBucketTitle,
  backHref,
}: DetailInfoExampleClientProps) {
  const router = useRouter();

  const rows = useMemo(() => buildRows(rowId), [rowId]);
  const totalAmount = useMemo(
    () => rows.reduce((acc, row) => acc + Number(row.amount || 0), 0).toFixed(2),
    [rows],
  );
  const sourceLabel = source === 'kanban' ? 'Kanban' : undefined;
  const sourceBucketLabel = sourceBucketTitle || sourceBucketId;
  const menuData: TreeMenuItem[] = useMemo(() => [
    { id: 'dashboard', title: 'Dashboard', href: '/', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'std-report', title: 'Standard Report', href: '/std-report', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'kanban', title: 'Kanban', href: '/kanban', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'pivot-table', title: 'Pivot Table', href: '/pivot-table', icon: <Table2 className="w-4 h-4" /> },
    { id: 'detail-info', title: 'Detail Info', href: `/detail-info/${rowId}`, icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'ai-nav', title: 'AI Nav', href: '/ai-nav', icon: <Mic className="w-4 h-4" /> },
    { id: 'messages', title: 'Messages', href: '/messages', icon: <Mail className="w-4 h-4" /> },
    { id: 'settings', title: 'Settings', href: '/settings', icon: <Settings className="w-4 h-4" /> },
  ], [rowId]);
  const sections = useMemo(() => {
    const nextSections = [
      {
        id: 'basic',
        title: 'Basic Information',
        fields: [
          { id: 'id', label: 'ID', value: rowId },
          { id: 'client', label: 'Client', value: 'Schunk Intec Precision Machinery Tr' },
          { id: 'project', label: 'Project', value: 'S4 Rollout project' },
          { id: 'owner', label: 'Owner', value: 'Liu, Gang (Charles)' },
        ],
      },
      {
        id: 'summary',
        title: 'Summary',
        fields: [
          { id: 'recordCount', label: 'Records', value: rows.length },
          { id: 'totalAmount', label: 'Total Amount', value: totalAmount },
          { id: 'currency', label: 'Currency', value: 'USD' },
          {
            id: 'status',
            label: 'Status',
            value: <Chip label="Active" size="small" color="success" variant="outlined" />,
            searchableText: 'Active',
          },
        ],
      },
    ];

    if (sourceLabel) {
      nextSections.push({
        id: 'workflow',
        title: 'Workflow Context',
        fields: [
          { id: 'source', label: 'Source', value: sourceLabel },
          { id: 'bucket', label: 'Current Bucket', value: sourceBucketLabel || 'Not specified' },
        ],
      });
    }

    return nextSections;
  }, [rowId, rows.length, sourceBucketLabel, sourceLabel, totalAmount]);
  const subtitle = sourceLabel
    ? `Opened from ${sourceLabel}${sourceBucketLabel ? ` / ${sourceBucketLabel}` : ''}`
    : 'Standard Detail Page Demo (Info Blocks + Tabs + Table + Search/AI)';

  return (
    <CAppPageLayout
      appTitle=""
      menuData={menuData}
      locale="en"
      localeLabel="EN"
      user={{ name: 'Ruiyang Shen', subtitle: 'ruiyang.shen@orbis.de', avatarSrc: '/orbcafe.png' }}
      logo={<HeaderBrandLogo />}
    >
      <CPageTransition transitionKey={rowId} variant="slide-up" durationMs={220}>
        <Box sx={{ height: 'calc(100vh - 120px)' }}>
          <CDetailInfoPage
            title={`Detail - ${rowId}`}
            subtitle={subtitle}
            onClose={() => router.push(backHref || (sourceLabel ? '/kanban' : '/std-report'))}
            rightHeaderSlot={
              sourceLabel ? (
                <Chip
                  size="small"
                  color="primary"
                  variant="outlined"
                  label={`From ${sourceLabel}${sourceBucketLabel ? ` / ${sourceBucketLabel}` : ''}`}
                />
              ) : undefined
            }
            sections={sections}
          tabs={[
            {
              id: 'audit',
              label: 'Audit Trail',
              description: 'Approval chain and latest audit actions',
              fields: [
                { id: 'createdBy', label: 'Created By', value: 'Liu, Gang' },
                { id: 'approvedBy', label: 'Approved By', value: 'Shen, Ruiyang' },
                { id: 'lastUpdate', label: 'Last Update', value: '2026-02-24 18:30' },
              ],
            },
            {
              id: 'business',
              label: 'Business Context',
              sections: [
                {
                  id: 'scope',
                  title: 'Scope',
                  columns: 1,
                  fields: [
                    { id: 'phase', label: 'Phase', value: 'Go-live Support' },
                    {
                      id: 'description',
                      label: 'Description',
                      value: 'Configure ED1 output sequence and contract print settings.',
                    },
                  ],
                },
                {
                  id: 'risk',
                  title: 'Risk & Exceptions',
                  fields: [
                    { id: 'riskLevel', label: 'Risk Level', value: 'Low' },
                    { id: 'exceptionCount', label: 'Exceptions', value: 1 },
                  ],
                },
              ],
            },
          ]}
          ai={{
            enabled: true,
            placeholder: 'Search field/value first, then AI fallback...',
            onSubmit: async (query) => {
              await new Promise((resolve) => setTimeout(resolve, 400));
              return [
                '### AI Insight',
                `No exact field was found for **${query}**.`,
                '',
                '1. Try searching by `person`, `client`, or `project`.',
                '2. This record has one flagged entry in the related table.',
                `3. Total amount is **${totalAmount} USD**.`,
              ].join('\n');
            },
          }}
          table={{
            tableProps: {
              appId: 'detail-info-example-table',
              rowKey: 'id',
              columns: [
                { id: 'id', label: 'ID' },
                { id: 'date', label: 'Date' },
                { id: 'item', label: 'Item' },
                { id: 'person', label: 'Person' },
                { id: 'amount', label: 'Amount', numeric: true },
                {
                  id: 'status',
                  label: 'Status',
                  render: (value: string) => (
                    <Chip
                      size="small"
                      label={value}
                      color={value === 'Flag' ? 'warning' : 'success'}
                      variant="outlined"
                    />
                  ),
                },
              ],
              rows,
              showToolbar: true,
              showSummary: true,
              maxHeight: '360px',
            },
          }}
          />
        </Box>
      </CPageTransition>
    </CAppPageLayout>
  );
}
