# StdReport Recipes

## Recipe 1: Standard integrated report page

```tsx
import { CStandardPage, useStandardReport, OrbcafeI18nProvider } from 'orbcafe-ui';

const tableKey = 'default';

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
  variants: [
    {
      id: 'default-orders',
      name: 'Default',
      isDefault: true,
      scope: 'Both',
      filters: [
        {
          scope: tableKey,
          filters: {
            values: {},
            visibleFields: ['keyword', 'status'],
          },
        },
      ],
      layoutRefs: [{ tableKey, layoutId: null }],
    },
  ],
};

export default function OrdersPage() {
  const { pageProps } = useStandardReport({
    metadata,
    tableKey,
    fetchData: async ({ page, limit, sort, order, ...filters }) => {
      const normalizedLimit = limit === -1 ? 10000 : limit;
      void normalizedLimit;
      void sort;
      void order;
      void filters;

      return {
        rows: [{ id: '1', customer: 'ACME', amount: 1200, status: 'active' }],
        total: 1,
      };
    },
  });

  return (
    <OrbcafeI18nProvider locale="en">
      <CStandardPage {...pageProps} />
    </OrbcafeI18nProvider>
  );
}
```

Persistence notes for Recipe 1:

- Keep `metadata.id`, `CStandardPage.id`, SmartFilter `appId`, and CTable `appId` aligned. With `useStandardReport`, `metadata.id` is propagated for you.
- Use `integrated` mode. `useStandardReport` defaults to it, so `<CStandardPage {...pageProps} />` is enough.
- To save a full user view: save table Layout first, then save SmartFilter Variant. The variant stores `layoutRefs` pointing to the saved layout id.
- Add `serviceUrl` or `variantService` to `useStandardReport` only when backend persistence is required. Without it, variants/layouts persist in localStorage.

## Recipe 2: Table-only (Controlled Pagination) + quick operations + graph entry

```tsx
import { CTable } from 'orbcafe-ui';

<CTable
  appId="orders-table"
  title="Orders"
  columns={[
    { id: 'id', label: 'ID' },
    { id: 'status', label: 'Status' },
    { id: 'amount', label: 'Amount', numeric: true },
  ]}
  rows={rows}
  rowKey="id"
  selectionMode="multiple"
  page={page}
  rowsPerPage={rowsPerPage}
  rowsPerPageOptions={[20, 50, 100, -1]}
  count={total}
  onPageChange={(nextPage) => setPage(nextPage)}
  onRowsPerPageChange={(nextRowsPerPage) => {
    setPage(0);
    setRowsPerPage(nextRowsPerPage);
  }}
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

Table-only persistence notes:

- `CTable` can save/load layout when `appId` is present.
- Table-only mode does not give you SmartFilter variants. If the page needs filter variants plus table layouts, use Recipe 1 unless there is a hard custom layout requirement.
- If you manually combine `CSmartFilter + CTable`, you own the same linkage that integrated mode handles: pass one `appId`, one `tableKey`, current layout id, layout refs, variant load, and layout load/save behavior.
