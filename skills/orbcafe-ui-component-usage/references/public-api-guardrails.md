# ORBCAFE UI Public API Guardrails

## TOC
- Exported API families
- Key props to get right
- Integration checks
- Verification commands

## Exported API families

Use only symbols exported from `dist/index.d.ts`, including:

- Navigation: `NavigationIsland`, `TreeMenu`, `useNavigationIsland`
- Standard report: `CStandardPage`, `CTable`, `CSmartFilter`, `CLayoutManager`, `CVariantManager`, `useStandardReport`
- Graph report: `CGraphReport`, `useGraphReport`, `useGraphChartData`, `useGraphInteraction`, chart components (`CBarChart`, `CLineChart`, `CComboChart`, `CHeatmapChart`, `CPieChart`, `CFishboneChart`, `CWaterfallChart`, `CGoogleMapChart`, `CAmapChart`)
- Detail page: `CDetailInfoPage`, `useDetailInfo`
- Layout shell: `CAppPageLayout`, `CAppHeader`, `usePageLayout`
- Agent settings: `CCustomizeAgent`
- Dialog: `CMessageBox`
- i18n: `OrbcafeI18nProvider`, `useOrbcafeI18n`
- Rendering and motion: `MarkdownRenderer`, `CPageTransition`

Do not instruct consumers to import private source files from `src/components/...`.

## Key props to get right

- `CTable`:
  - `columns`, `rows` are required.
  - `selectionMode` is opt-in (`single` or `multiple`).
  - Advanced options: `graphReport`, `quickCreate`, `quickEdit`, `quickDelete`.
- `CStandardPage`:
  - `title` and `tableProps` are required.
  - Pair with `useStandardReport` unless custom state orchestration is required.
- `CGraphReport`:
  - Requires `open`, `onClose`, `model`, `tableContent`.
  - `interaction` should be enabled only when filter state is wired.
- `CDetailInfoPage`:
  - Requires `title`, `sections`.
  - `ai.onSubmit` may return markdown text.
- `CAppPageLayout`:
  - Requires `appTitle`, `children`.
  - Optional `menuData`, locale and user menu handlers.
- `CCustomizeAgent`:
  - Requires `open`, `onClose`, `value`.
  - `onSaveAll` should persist both settings and selected template versions.

## Integration checks

- i18n:
  - Use `OrbcafeI18nProvider` or `locale` on `CAppPageLayout`.
  - Keep business values stable (`active`, `inactive`) and localize only labels.
- Next.js App Router:
  - Unwrap `params` in Server Component first, then pass plain values into Client Component.
- Tailwind:
  - Ensure scan path includes `./node_modules/orbcafe-ui/dist/**/*.{js,mjs}`.
- Dialog consistency:
  - Prefer `CMessageBox` for confirmation and warning flows.

## Verification commands

```bash
npm run build
cd examples && npm run lint && npx tsc --noEmit
```
