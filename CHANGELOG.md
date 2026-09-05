# Changelog

All notable changes to `orbcafe-ui` are documented in this file.

## [3.0.0] - 2026-09-05

### License Change

- Starting from ORBCAFE UI 3.0.0, ORBCAFE UI is distributed under the
  **ORBCAFE UI Community License** (see `LICENSE`), with commercial licenses
  available for commercial product use (see `COMMERCIAL_LICENSE.md`).
  - Free for personal use, education, research, development, testing,
    evaluation, internal business applications, and community projects.
  - A commercial license is required for commercial SaaS, commercial software
    products, paid customer delivery, OEM / white-label use, redistribution or
    resale, commercial templates, and low-code / UI-builder platforms.
  - Existing versions published under the MIT License (v1.x and v2.x) remain
    available under their original license terms.
- New `CONTRIBUTING.md` with a contributor licensing declaration supporting
  the dual Community + Commercial licensing model.
- `package.json` license field changed from `MIT` to
  `SEE LICENSE IN LICENSE`; `COMMERCIAL_LICENSE.md` added to the published
  npm package contents.

### Added

- New `CardPage` module (`CCardPage` + `CCardGrid` + `CCardDetailPanel` + `useCardPage`): a
  store/catalog-style page layout — smart filter bar on top, responsive card grid below. Each card
  shows an icon, title, a 3-line clamped description, and icon-only "view details" / "download"
  actions. "View details" opens a built-in centered floating detail card (`CCardDetailPanel`,
  portal-rendered, Esc/backdrop/close-button dismissal, full description plus auto-extracted extra
  fields and a footer download action; disable with `detailPanel={false}` or customize with
  `renderDetailContent`). Mirrors the `CStandardPage`/`useStandardReport` conventions (same filter
  bar, variant management, and `{ rows, total }` fetch contract), with i18n keys
  `cardPage.viewDetails` / `cardPage.download` / `cardPage.close` / `cardPage.empty` in all six
  locales. Companion skill at `skills/orbcafe-cardpage-workflow` (routing map and module contracts
  updated). Example page at `examples/app/card-page`, docs at `docs/components/CardPage.md`.
- Brand theming bridged directly to the Open Design desktop app: the new `orbcafe-theme` CLI
  (`npx orbcafe-theme list|show|apply`) discovers local Open Design brand presets — colors and
  fonts — and generates a theme pack into the consumer project (`orbcafe-theme/<brand>.css` +
  fonts + JS tokens), no manual export. Developers without Open Design simply keep the default
  ORBIS theme. New `orbcafe-brand-theme` skill walks coding agents through discover → apply →
  wire → verify. See `docs/guides/brand-theming.md`.
- Prebuilt example theme packs under `orbcafe-ui/themes/*` (orbis, nvidia) with a new package
  export `./themes/*` and JS-side `themes/<brand>.tokens.mjs` for charts/canvas consumers.
- Live brand-theme preview in the examples app: a header switcher (palette button next to the
  user menu) lists the design systems published in the local Open Design app and applies one
  on click, served live by `examples/app/api/brand-themes/*` routes (CSS + brand fonts).
- Presets that ship font files without a `fonts.css` now get `@font-face` rules synthesized
  from the filenames (weights parsed from names like `SemiBd`/`XtraBd`), so their brand font
  still applies.
- New semantic tokens in `orbis.css` / `orbis-tokens.ts`: `--orb-font-brand`, `--orb-inverse-*`,
  `--orb-ai-accent`, `--orb-status-*` (with dark variants), `--orb-chart-1..6` and
  `--orb-chart-positive/negative`, and the full `--orb-nav-*` navigation-island set.
- `CAppPageLayout` controlled theme props: `mode`, `defaultMode`, and `onModeChange`.
- `CAppPageLayout.appId` as a stable namespace for mode, locale, navigation-mode, and pin persistence.
- A consumer-focused `MIGRATION_V2.md` with Next.js App Router, React 19, Tailwind v4, provider, navigation, and rollback guidance.

### Changed

- Token purity refactor: every derived token in `orbis.css` now computes from the base tokens via
  `color-mix()` over `var(--orb-primary)` / `var(--orb-accent)` / `var(--orb-canvas)`, so overriding
  ~15 base tokens re-skins the whole UI (light + dark). Default rendering is unchanged.
- All TSX color literals and Tailwind palette utility classes across components (~500 occurrences)
  replaced with `var(--orb-*)` references; the remaining white/black values are intentional
  glass/scrim constants.
- Removed the stale `BRAND_COLORS` export from `src/config/foundations.ts` (its last consumer,
  the Navigation-Island `chat-send` button, now uses `--orb-primary`).
- The default app-header logo is now an offline package icon instead of a request to `/orbcafe.png`.
- `tailwindcss@^4` is declared as a peer dependency so incompatible hosts receive an install-time warning.
- Migrated AgentUI renderers from `next-themes` to `useOrbMode`, removing the runtime dependency and its React 19 peer warning.
- The exported `dist/index.css` path now resolves to a stylesheet alias for `orbis.css`.

## [2.0.0] - 2026-08-03

### Breaking Changes

- Replaced the MUI implementation with the MUI-free ORBIS design system.
- Removed ORBCAFE's MUI, Emotion, MUI date-picker, and Lucide dependency requirements.
- Added a package `exports` map; unsupported deep imports are no longer available.
- Changed public MUI-specific `sx` types and theme behavior to ORBIS CSS/style compatibility contracts.
- Requires importing `orbcafe-ui/styles.css` once and compiling package utility classes with Tailwind.
- Replaced MUI theme integration with `OrbisModeProvider` and ORBIS CSS variables.

### Upgrade Notes

- Follow `MIGRATION_V2.md`; do not upgrade a production v1 application without a build and visual regression pass.
- Keep stable `TreeMenuItem.id` and navigation targets for pin persistence.
- On v2.0.0, pass an explicit logo and a single application-wide `navigationPinStorageKey`.

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
