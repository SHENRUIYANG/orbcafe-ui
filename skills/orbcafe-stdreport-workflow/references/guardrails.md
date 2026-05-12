# StdReport Guardrails

## Public API constraints

- Import from `orbcafe-ui` package entry only.
- Do not import private files under `src/components/...` from consumer apps.

## Behavior Constraints

- `useStandardReport` defaults (>= 1.0.6):
  - `initialRowsPerPage = 20`
  - `rowsPerPageOptions = [20, 50, 100, -1]`
  - `-1` means ALL
- When using `CTable` standalone (without `useStandardReport`), pagination must be controlled with `page`, `rowsPerPage`, `count`, `onPageChange`, and `onRowsPerPageChange`. Do not invent a `pagination` prop.
- Changing rows-per-page resets page index to `0`.
- If backend cannot accept `limit = -1`, map it explicitly in `fetchData`.

## Persistence Constraints

- Standard report pages must use `useStandardReport + CStandardPage` in `integrated` mode. This is the canonical path for SmartFilter variant plus CTable layout linkage.
- `metadata.id`, `CStandardPage.id`, `filterConfig.appId`, and `tableProps.appId` must represent the same report identity. Changing only one of them splits persistence across different storage keys.
- Use `tableKey` only to isolate multiple tables inside the same report. Keep the default `tableKey = 'default'` for normal single-table pages.
- SmartFilter variants store scoped filters:
  - `filters: [{ scope: tableKey, filters: { values, visibleFields } }]`
  - `values` are the actual filter values/operators.
  - `visibleFields` is the Adapt Filters state.
- CTable layouts store table UI state:
  - `visibleColumns`, `order`, `orderBy`, `grouping`, `columnWidths`, `showSummary`, `summaryColumns`.
- Variant-to-layout linkage uses `layoutRefs: [{ tableKey, layoutId }]`. A variant does not reliably create a new table layout by itself.
- Canonical user flow for a view containing filters and layout:
  - change filters and Adapt Filters visibility
  - change table columns/sort/grouping/summary/widths
  - save Layout from the table toolbar
  - save Variant from the SmartFilter variant control
  - reload the page and load the variant; filters and the referenced layout must both apply
- Without `serviceUrl` or `variantService`, persistence falls back to localStorage:
  - variants: `orbcafe.variants.${appId}.${tableKey}`
  - layouts: `orbcafe.layouts.${appId}.${tableKey}`
- With `serviceUrl`, the host must implement both `/api/variants` and `/api/layouts` for the same `appId/tableKey`; otherwise one side may fall back locally and make cross-device persistence look broken.
- With `variantService`, preserve `appId` and `tableKey` in all methods. Dropping `tableKey` will make multi-table variants overwrite each other.

## Anti-Patterns

- Do not render `CSmartFilter` above a separate `CTable` for standard pages unless you also manually wire layout load/save, current layout id, variant filters, and tableKey.
- Do not override `<CStandardPage id>` with a different value after spreading `pageProps` unless `filterConfig.appId` and `tableProps.appId` are updated to the same identity.
- Do not seed default variants with localized `value`s. Keep values stable and localize labels only.
- Do not seed `metadata.variants` with root-level filters for new code; use scoped filters with `scope: 'default'` or the explicit `tableKey`.

## i18n Constraints

- Wrap pages with `OrbcafeI18nProvider` or parent `CAppPageLayout.locale`.
- Keep filter `value` machine-stable and localize labels only.
