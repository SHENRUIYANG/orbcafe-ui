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
- Use `type: 'value-help'` or `isValueHelp: true` for SAP Search Help/F4 fields. This keeps selected keys inside SmartFilter state, variants, and `fetchData` params.
- Value Help selected values must be machine-stable keys. Localize display labels and dialog copy only.
- For multi-select Value Help, expect operator `anyOf`; for single-select, expect `equals`.
- `CValueHelp` opens with the F4 key and the search icon; test both.
- Manual input is allowed and validated by default. Invalid typed keys should show `manualInputErrorText` and should not update SmartFilter state.
- Multiple manual values are split by comma, semicolon, or newline.
- Use `selectedItems` or include selected records in `items` when loading saved variants so key-description display can be restored.
- Use `onSearch(query)` for large remote lookup sets; returning an array replaces the dialog result list.

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
- Do not implement Value Help as an unrelated modal beside `CSmartFilter`; it will bypass variant persistence and Adapt Filters visibility.
- Do not disable manual input or validation unless the business process explicitly requires selection-only or free-form keys.

## i18n Constraints

- Wrap pages with `OrbcafeI18nProvider` or parent `CAppPageLayout.locale`.
- Keep filter `value` machine-stable and localize labels only.
