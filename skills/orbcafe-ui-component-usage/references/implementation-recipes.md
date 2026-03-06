# ORBCAFE UI Implementation Recipes

## TOC
- Recipe 1: Standard report page
- Recipe 2: Table-only with graph and quick actions
- Recipe 3: Detail page with search + AI fallback
- Recipe 4: App shell with locale and user menu
- Recipe 5: Unified confirmation dialog

## Recipe 1: Standard report page

```tsx
import { CStandardPage, useStandardReport, OrbcafeI18nProvider } from 'orbcafe-ui';

const metadata = {
  id: 'orders-report',
  title: 'Orders',
  columns: [
    { id: 'id', label: 'ID' },
    { id: 'customer', label: 'Customer' },
    { id: 'amount', label: 'Amount', type: 'number', align: 'right' as const },
  ],
  filters: [
    { id: 'keyword', label: 'Keyword', type: 'text' as const },
    {
      id: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
    },
  ],
};

export default function OrdersPage() {
  const { pageProps } = useStandardReport({
    metadata,
    fetchData: async () => ({
      rows: [{ id: '1', customer: 'ACME', amount: 1200, status: 'active' }],
      total: 1,
    }),
  });

  return (
    <OrbcafeI18nProvider locale="en">
      <CStandardPage {...pageProps} />
    </OrbcafeI18nProvider>
  );
}
```

## Recipe 2: Table-only with graph and quick actions

```tsx
import { CTable } from 'orbcafe-ui';

<CTable
  title="Orders"
  columns={[
    { id: 'id', label: 'ID' },
    { id: 'status', label: 'Status' },
    { id: 'amount', label: 'Amount', numeric: true },
  ]}
  rows={rows}
  rowKey="id"
  selectionMode="multiple"
  graphReport={{ enabled: true, interaction: { enabled: true } }}
  quickCreate={{
    enabled: true,
    title: 'Create Order',
    onSubmit: async (payload) => createOrder(payload),
  }}
  quickEdit={{
    enabled: true,
    onSubmit: async (payload, row) => updateOrder(row.id, payload),
  }}
  quickDelete={{
    enabled: true,
    onConfirm: async (selectedRows) => deleteOrders(selectedRows.map((r) => r.id)),
  }}
/>;
```

## Recipe 3: Detail page with search + AI fallback

```tsx
import { CDetailInfoPage } from 'orbcafe-ui';

<CDetailInfoPage
  title="Invoice #INV-001"
  sections={[
    {
      id: 'basic',
      title: 'Basic Info',
      fields: [
        { id: 'invoiceId', label: 'Invoice ID', value: 'INV-001' },
        { id: 'customer', label: 'Customer', value: 'Schunk Intec' },
      ],
    },
  ]}
  tabs={[
    {
      id: 'notes',
      label: 'Notes',
      fields: [{ id: 'owner', label: 'Owner', value: 'Ruiyang' }],
    },
  ]}
  ai={{
    enabled: true,
    onSubmit: async (query, context) => {
      if (context.hits.length > 0) return;
      return `### AI Insight\nNo direct field match for **${query}**`;
    },
  }}
/>;
```

## Recipe 4: App shell with locale and user menu

```tsx
import { CAppPageLayout } from 'orbcafe-ui';

<CAppPageLayout
  appTitle="ORBCAFE"
  menuData={[{ id: 'std', title: 'Standard Report', href: '/std-report' }]}
  locale="zh"
  user={{ name: 'Ruiyang Shen', subtitle: 'ruiyang.shen@orbis.de' }}
  onUserSetting={() => router.push('/settings')}
  onUserLogout={() => auth.logout()}
>
  <div>Page Content</div>
</CAppPageLayout>;
```

## Recipe 5: Unified confirmation dialog

```tsx
import { CMessageBox } from 'orbcafe-ui';

<CMessageBox
  open={open}
  type="warning"
  title="Delete record"
  message="Are you sure you want to delete this record?"
  confirmText="Delete"
  cancelText="Cancel"
  onClose={() => setOpen(false)}
  onConfirm={async () => {
    await onDelete();
    setOpen(false);
  }}
/>;
```
