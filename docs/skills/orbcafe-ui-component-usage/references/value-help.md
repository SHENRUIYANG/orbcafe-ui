# Value Help Contract

Use this reference when the request mentions SAP F4 help, search help, value help, lookup fields, 主数据选择, or 值帮助.

## Canonical API

- Standalone field: `CValueHelp`
- Filter field: `CSmartFilter` / `PSmartFilter` field with `type: 'value-help'` or `isValueHelp: true`
- Import only from `orbcafe-ui`.

## Preferred Integration

- StdReport: put Value Help in `metadata.filters` and render through `useStandardReport + CStandardPage`.
- Planning: put Value Help in `filterFields` passed to `usePlanningLayout` or `usePlanningGantt`.
- Pad: put Value Help in `PTable.filterConfig.fields` or direct `PSmartFilter.fields`.
- Standalone forms: use `CValueHelp` directly only when the field is not part of SmartFilter variant/filter state.

## Minimal Config

```tsx
{
  id: 'customer',
  label: 'Customer',
  type: 'value-help',
  valueHelp: {
    dialogTitle: 'Customer Value Help',
    items: customers,
    columns: [
      { field: 'customerId', label: 'Customer', minWidth: 120 },
      { field: 'customerName', label: 'Name', minWidth: 220 },
      { field: 'country', label: 'Country', minWidth: 90 },
    ],
    getOptionValue: (item) => item.customerId,
    getOptionLabel: (item) => item.customerName,
    getOptionDescription: (item) => item.country,
  },
}
```

## Data Rules

- `getOptionValue` returns the persisted filter key. Keep it stable and non-localized.
- `getOptionLabel` and `columns[].label` are UI text and can be localized.
- Single selection uses filter operator `equals`.
- `mode: 'multiple'` uses filter operator `anyOf`.
- If variants reload with only a raw key visible, provide `selectedItems` or include selected records in `items`.
- Use `onSearch(query)` for remote lookup. Returning an array replaces dialog results.

## Anti-Patterns

- Do not build a separate lookup modal beside SmartFilter for report/planning/pad filters; it will bypass variant state.
- Do not store localized names as filter values.
- Do not confuse barcode scanning with Value Help. Use `PBarcodeScanner` for camera scan and Value Help for searchable master data.
