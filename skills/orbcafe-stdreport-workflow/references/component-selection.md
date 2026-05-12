# StdReport Component Selection

## Decision tree

- Need complete report page (filter + table + persistence):
  - `useStandardReport` + `CStandardPage`
- Need only table surface inside custom page:
  - `CTable` directly
- Need only filter bar with custom table orchestration:
  - `CSmartFilter` + custom state + `CTable`, but only when you are prepared to wire variant/layout linkage manually

## First choice defaults

- Start with `useStandardReport` + `CStandardPage mode="integrated"`.
- Move to table-only only if layout is highly custom and SmartFilter variants are not required.
- Move to manual `CSmartFilter + CTable` only for advanced pages; this is not the standard report baseline.

## Identity requirements

- `metadata.id` is required in `useStandardReport`.
- `appId` is required in standalone `CTable`/`CSmartFilter` for layout/variant isolation.
- Keep `metadata.id`, `CStandardPage.id`, `filterConfig.appId`, and `tableProps.appId` aligned.
- Use `tableKey` only when one page contains multiple tables; otherwise leave it as `default`.
