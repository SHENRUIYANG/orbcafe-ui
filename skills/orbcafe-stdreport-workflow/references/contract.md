# StdReport usage contract

## State and data

- Default entry: `useStandardReport({ metadata, fetchData, tableKey?, serviceUrl?, variantService? })` → `<CStandardPage {...pageProps} />`. The hook owns rows, loading, filters, selection and pagination. Keep `metadata` and `fetchData` stable (module constants / `useMemo` / `useCallback`); changing them each render can reset filters or trigger repeated fetches.
- `metadata: ReportMetadata` requires `{ id, title, columns, filters }`. Columns use `{ id, label, type?, render?(value, row) }`; each row needs a stable `id` by default. Filter fields use `{ id, label, type, options?, defaultValue?, valueHelp? }`.
- `fetchData({ ...filters, page, limit, sort, order })` returns `Promise<{ rows, total }>`. API `page` is **1-based**; `CTable.page` is **0-based**. `total` is the filtered total before paging. `limit=-1` means all rows and needs explicit backend handling.
- `metadata.api` as a function is supported. The object form `{ url, method }` currently only logs and returns an empty placeholder; a URL alone does **not** perform an HTTP request. Supply `fetchData` or a function API for real data.
- SmartFilter values may be operator objects (for example `{ operator: 'equals', value: 'C1000' }`), not just primitive strings. Translate them in the backend adapter; inspect `FilterValue` and the example service.
- Filter edits change draft values; Go/search applies them. Fetch errors are logged and loading clears; the host must provide user-visible error/retry behavior where needed.

## Callbacks and persistence

| Entry | Actual callback / host responsibility |
| --- | --- |
| `quickCreate.onSubmit` | `(payload: Record<string, any>) => void | Promise<void>`; create on server, then refresh rows. |
| `quickEdit.onSubmit` | `(payload, originalRow) => void | Promise<void>`; stable primary keys come from the row. |
| `quickDelete.onConfirm` | `(rows: Record<string, any>[]) => void | Promise<void>`; receives row objects, not IDs. |
| `CTable.onSelectionChange` | Receives selected row keys; resolve rows via `rowKey` before business operations. |
| `CTable.onSortChange` | `(property, direction)`; server paging requires a matching server sort. |
| `variantService` | `getVariants(appId, tableKey?)`, `saveVariant(variant, appId, tableKey?)`, `deleteVariant(id)`, `setDefaultVariant(id, appId, tableKey?)`. `deleteVariant` does not receive appId/tableKey. |

Save Layout before Variant so `layoutRefs: [{ tableKey, layoutId }]` points to a saved layout. Without a service, the namespace is `orbcafe.variants.${appId}.${tableKey}` / `orbcafe.layouts.${appId}.${tableKey}`. A custom `variantService` does not implement layout persistence; layouts use `serviceUrl` or their local fallback.

## Verify against source

Read `src/components/StdReport/Hooks/useStandardReport.ts`, `Hooks/CTable/types.ts`, `CVariantManager.tsx`, and `examples/app/_components/StdReportExampleClient.tsx`. Check real fetch parameters, Go, pagination, quick-operation refresh, and Layout→Variant→reload. Exact type references are exported from `orbcafe-ui`; the source paths above are inspection paths only.
