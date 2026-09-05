# CardPage Component Selection

## Decision tree

- Need a complete store/catalog page (filter bar + card grid + variants):
  - `useCardPage` + `CCardPage`
- Need only the card grid inside a custom page:
  - `CCardGrid` directly (built-in detail panel stays on by default)
- Need route-navigation detail instead of the floating panel:
  - `CCardGrid` / `CCardPage` with `detailPanel={false}` + `onDetailClick` navigating
- Need only the detail card for an existing custom list:
  - `CCardDetailPanel` standalone (controlled: `item` + `open` + `onClose`)
- Need dense tabular data (columns, sorting, grouping, pagination):
  - Not CardPage — use `orbcafe-stdreport-workflow` (`useStandardReport` + `CStandardPage`)

## First choice defaults

- Start with `useCardPage` + `CCardPage`.
- Keep the built-in detail panel (`detailPanel` defaults to `true`); it is centered, portal-rendered, and closes via Esc/backdrop/close button.
- Move to grid-only (`CCardGrid`) only when the page layout is highly custom.
- Move to `detailPanel={false}` only when the business flow explicitly requires a separate detail route.

## Identity requirements

- `metadata.id` is required in `useCardPage`.
- `id` is required in `CCardPage`.
- `appId` is required in standalone `CSmartFilter` for variant isolation.
- Keep `metadata.id`, `CCardPage.id`, and `filterConfig.appId` aligned.
- Use `tableKey` only when one page contains multiple independent card grids; otherwise leave it as `default`.
