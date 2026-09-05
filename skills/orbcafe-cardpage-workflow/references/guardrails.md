# CardPage Guardrails

## Public API constraints

- Import from `orbcafe-ui` package entry only (`CCardPage`, `CCardGrid`, `CCardDetailPanel`, `useCardPage`, `CardPageMetadata`, `CCardItem`).
- Do not import private files under `src/components/...` from consumer apps.

## Behavior Constraints

- `useCardPage` + `CCardPage` is the canonical path. Do not hand-wire a separate `CSmartFilter` + `CCardGrid` unless you are prepared to manage variant state yourself.
- `fetchData` must return `{ rows, total }` — the same contract as `useStandardReport`. Rows must satisfy `CCardItem` (`id` and `title` required).
- The card description is always clamped to exactly 3 lines with an ellipsis. Do not override the clamp via `sx`; long content belongs in the detail panel.
- The built-in detail panel (`detailPanel`, default `true`) is a centered floating card rendered via portal. It closes via Esc, backdrop click, and the close button — all three must keep working; do not remove `onClose` wiring.
- `onDetailClick` fires even when the built-in panel opens (use it for analytics). If you want navigation instead, set `detailPanel={false}` explicitly.
- `onDownloadClick` backs both the card's download icon button and the panel footer button; keep one handler with one payload shape.
- `icon` (SAP icon name) is mode-aware out of the box (light: `--orb-primary`, dark: `--orb-p300`). Custom `iconNode` must handle dark-mode contrast itself.
- Put the page in a fixed-height container (e.g. `calc(100vh - 120px)`) to avoid whole-page scroll jitter.
- `minCardWidth` (default `260`) controls grid column count; do not hard-code per-breakpoint column logic around the grid.

## Persistence Constraints

- `metadata.id`, `CCardPage.id`, and `filterConfig.appId` must represent the same page identity. Changing only one of them splits variant persistence across different storage keys.
- CardPage has no table layout: variants store scoped filters only — `filters: [{ scope: tableKey, filters: { values, visibleFields } }]`. There is no `layoutRefs` and no "save Layout first" ordering requirement.
- Use `tableKey` only to isolate multiple card grids inside the same page. Keep the default `tableKey = 'default'` for normal single-grid pages.
- Without `serviceUrl` or `variantService`, persistence falls back to localStorage: `orbcafe.variants.${appId}.${tableKey}`.
- With `serviceUrl`, the host must implement `/api/variants` for the same `appId/tableKey`.
- With `variantService`, preserve `appId` and `tableKey` in all methods (`getVariants/saveVariant/deleteVariant/setDefaultVariant`).

## Anti-Patterns

- Do not build a second, hand-rolled detail modal next to `CCardGrid` while `detailPanel` is still enabled — users get two competing detail UIs. Either customize via `renderDetailContent`, or disable with `detailPanel={false}`.
- Do not wrap `CCardDetailPanel` in your own `position: fixed` overlay inside the page tree; the panel portals to `document.body` precisely because page containers (e.g. `CPageTransition`) carry `will-change: transform`, which clips fixed positioning.
- Do not override `<CCardPage id>` with a different value after spreading `pageProps` unless `filterConfig.appId` is updated to the same identity.
- Do not seed default variants with localized `value`s. Keep values stable and localize labels only.
- Do not use CardPage for dense tabular data; that is StdReport territory.
- Do not pass descriptions without a clamp expectation into the card; if the business needs full text visible on the card itself, CardPage is the wrong module.

## i18n Constraints

- Wrap pages with `OrbcafeI18nProvider` or parent `CAppPageLayout.locale`.
- Built-in copy (`cardPage.viewDetails` / `cardPage.download` / `cardPage.close` / `cardPage.empty`) ships in all six locales (en/zh/fr/de/ja/ko); override per-instance via `detailTooltip` / `downloadTooltip` / `emptyText` only when necessary.
- Keep filter `value`s machine-stable and localize labels only.
