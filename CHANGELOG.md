# Changelog

All notable changes to `orbcafe-ui` are documented in this file.

## [1.0.6] - 2026-02-23

### ⚠️ Breaking / Behavior Changes

- `useStandardReport` pagination defaults changed:
  - `initialRowsPerPage`: `10` -> `20`
  - `rowsPerPageOptions`: `[10, 25, 50, 100]` -> `[20, 50, 100, -1]`
  - `-1` now represents `ALL`
  - File: `src/components/StdReport/Hooks/useStandardReport.ts`
- Rows-per-page change now resets to first page (`page = 0`) and triggers page sync callbacks.
  - Files: `src/components/StdReport/Hooks/useStandardReport.ts`, `src/components/StdReport/Hooks/CTable/useCTable.ts`
- `CAppPageLayout` now accepts locale control props and wraps children with internal `OrbcafeI18nProvider`:
  - New props: `locale`, `localeOptions`, `onLocaleChange`
  - Files: `src/components/PageLayout/types.ts`, `src/components/PageLayout/CAppPageLayout.tsx`
- `CTableProps` expanded with `quickCreate` API:
  - New type: `CTableQuickCreateConfig`
  - File: `src/components/StdReport/Hooks/CTable/types.ts`

### Added

- Full i18n module for 6 locales (`en`, `zh`, `fr`, `de`, `ja`, `ko`):
  - `OrbcafeI18nProvider`
  - `useOrbcafeI18n`
  - typed message keys and locale message maps
  - Files: `src/i18n/context.tsx`, `src/i18n/messages.ts`, `src/i18n/index.ts`
- `CTable` toolbar pagination controls (right of search):
  - items-per-page selector
  - page indicator (`Page X of Y`)
  - prev/next buttons
  - File: `src/components/StdReport/Components/CTableToolbar.tsx`
- `CTable` quick-create standard flow:
  - optional standard add button
  - auto-generated create dialog by table columns
  - File: `src/components/StdReport/CTable.tsx`
- Export `CMessageBox` and i18n from package entry:
  - File: `src/index.ts`

### Changed

- Toolbar layout strategy in `CTable`:
  - custom actions (`actions`, `extraTools`) are rendered on the left side of standard toolbar icon group
  - divider placement normalized before standard icon group
  - File: `src/components/StdReport/Components/CTableToolbar.tsx`
- Unified small-font standard to `0.85rem` across smart filter / variant / table-related areas.
  - Files include: `src/components/StdReport/CSmartFilter.tsx`, `src/components/StdReport/Components/CVariantManagement.tsx`, `src/components/StdReport/Components/CTable*`
- Date range picker localization and locale-aware formatting:
  - File: `src/components/Molecules/CDateRangePicker.tsx`
- Graph report titles/labels localized via i18n:
  - Files: `src/components/GraphReport/CGraphReport.tsx`, `src/components/GraphReport/Components/*`, `src/components/GraphReport/Hooks/useGraphReport.ts`

### Fixed

- `rowsPerPage = 50 / 100 / ALL` could show empty table due to stale page index after page-size change.
  - Fixed by resetting page state and synchronizing callbacks.
  - Files: `src/components/StdReport/Hooks/useStandardReport.ts`, `src/components/StdReport/Hooks/CTable/useCTable.ts`
- `ALL` pagination handling in example data provider:
  - `limit = -1` now bypasses slice.
  - File: `examples/app/std-report/page.tsx`
- Table fit-container scrolling behavior stabilized (including grouped rows growth):
  - Files: `src/components/StdReport/CStandardPage.tsx`, `src/components/StdReport/CTable.tsx`
- Sticky header behavior reinforced in grouped table scenarios:
  - File: `src/components/StdReport/Components/CTableHead.tsx`
- Group expand/collapse UX:
  - top-level expand/collapse all
  - recursive expand/collapse state handling
  - Files: `src/components/StdReport/Components/CTableHead.tsx`, `src/components/StdReport/Components/CTableBody.tsx`, `src/components/StdReport/Hooks/CTable/useCTable.ts`

### Documentation

- Root README updated with:
  - `CMessageBox` usage guidance
  - i18n usage and maintenance rules
  - File: `README.md`
- StdReport README expanded with:
  - C-Table toolbar extension conventions
  - quick-create usage
  - i18n notes
  - File: `src/components/StdReport/README.md`

### Upgrade Notes (Recommended)

- If your backend does not support `limit = -1`, map `ALL` to backend-specific behavior in `fetchData`.
- If your pages relied on old default pagination (10 rows), explicitly pass:
  - `initialRowsPerPage`
  - `rowsPerPageOptions`
- If you already used custom table toolbar actions, verify icon order/placement under the new toolbar layout.
- For locale switching, prefer wiring `locale` + `onLocaleChange` at `CAppPageLayout`.
