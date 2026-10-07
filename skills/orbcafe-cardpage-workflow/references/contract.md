# CardPage usage contract

## Entry and data

- `useCardPage({ metadata, fetchData, onDetailClick?, onDownloadClick?, tableKey?, serviceUrl?, variantService?, minCardWidth? })` returns `{ pageProps, items, total, filters, loading, refresh }`. Render `<CCardPage {...pageProps} />`.
- `metadata: CardPageMetadata = { id, title, filters: ReportFilter[], variants? }`.
- `fetchData(filters)` returns `Promise<{ rows: CCardItem[], total: number }>`. Only filter values are supplied: this hook does **not** add StdReport's `page/limit/sort/order` parameters and has no built-in pager. The response envelope is shared with StdReport, the request shape is not.
- `CCardItem = { id: string, title: string, description?, icon?, iconNode?, meta?, ...businessFields }`. Keep IDs stable. `icon` is a `SapIconName`; `iconNode` wins when both are supplied.
- Keep metadata/filter arrays and fetch callback stable to avoid resetting filters or repeated fetches. The hook logs fetch failures; handle business error UI in the host.

## Props live at the right level

- `CCardPage` takes `id`, `title`, `filterConfig`, `gridProps`; grid-specific `detailPanel`, `renderDetailContent`, `minCardWidth` belong in `gridProps`.
- `CCardGrid` takes `items` directly. Its `detailPanel` defaults to true; `onDetailClick(item)` still fires when the built-in panel opens. For routing set `gridProps.detailPanel=false` and route in that callback.
- Standalone `CCardDetailPanel` needs a **non-null** `item`, `open`, `onClose`. Use conditional rendering when no item exists; do not pass `item!` while runtime value is null. Its custom renderer is called `renderContent`, while the grid prop is `renderDetailContent`.
- `onDownloadClick(item)` is an event, not a download implementation. The host supplies the download.
- Default details expose primitive extra fields on the item; exclude internal/confidential fields before passing the data, or customize the details.

## Persistence and verification

CardPage variants contain filters/visible fields only; there is no table layout or `layoutRefs`. Keep `metadata.id` and `tableKey` stable. Check Go, saved variant reload, all close mechanisms, both download entrypoints, and route detail with the built-in panel disabled.

Sources: `src/components/CardPage/Hooks/useCardPage.ts`, `CCardPage.tsx`, `CCardGrid.tsx`, `CCardDetailPanel.tsx`; example: `examples/app/_components/CardPageExampleClient.tsx`.
