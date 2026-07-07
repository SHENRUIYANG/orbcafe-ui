# Integration Baseline

## Required checks

- Canonical target:
  - ORBCAFE UI implementations should match the official Next.js examples first.
  - Treat Vite/CRA/other hosts as non-canonical. Do not silently adapt the architecture; first state that the project is off the ORBCAFE baseline and recommend migrating or implementing the page in Next.js.
  - If the user explicitly requests a temporary non-Next workaround, keep it scoped and label it as divergent from the canonical examples.
- Examples source:
  - The npm package ships the built library, not the `examples/` app.
  - When `examples/` is not present in the current project, inspect the ORBCAFE GitHub repository or a local checkout of the repository for `examples/app/*`.
  - Do not fail because `examples/` is missing from a consuming project; fetch or reference the source repository examples instead.
- Dependency gate:
  - Check the host `package.json` first.
  - Run `npm install ...` only when required packages are missing or versions are incompatible.
  - In this repository, run root `npm run build` before testing the local `examples` app when `examples` depends on the local package.
- Import path:
  - `import { ... } from 'orbcafe-ui'`
- Contract path:
  - classify with `skill-routing-map.md`
  - confirm module contract in `module-contracts.md`
- Next.js App Router:
  - unwrap dynamic `params` in Server Page, then pass plain props to Client Component.
  - place browser-only interaction state in Client Components.
- Hydration safety:
  - avoid first-render `Date.now()`, `Math.random()`, direct browser-only branching.
- Tailwind baseline:
  - Canonical examples use Tailwind v4 CSS `@source`.
  - In the Next examples app, `examples/app/globals.css` uses `@source "../node_modules/orbcafe-ui/dist";` and `@source "../../src";`.
  - In a consuming Next app using Tailwind v4, add the correct relative `@source` path from that app's global CSS to `node_modules/orbcafe-ui/dist`.
  - Tailwind v3 `content` configuration is legacy fallback only; do not present it as the ORBCAFE default.
- i18n:
  - use `OrbcafeI18nProvider` or `CAppPageLayout.locale`.
  - for library text, use `useOrbcafeI18n().t()`.
  - keep option `value` stable, localize `label` only.
  - locale resources source: `src/i18n/messages.ts`.

## Version-sensitive notes (>= 1.4.5)

- `useStandardReport` default rows-per-page is `20` and includes `-1` (`ALL`).
- `CAppPageLayout` supports `locale`, `localeOptions`, `onLocaleChange`.
- `CTable` includes `quickCreate` config.
- `CValueHelp` is exported from package entry and is the shared F4/search-help contract for StdReport, Planning, and Pad filters.
- `Auth` is public through `CAuthPage` / `useAuthPage`.
- `Planning` is public through `CPlanningLayout` / `CPlanningGantt` plus `usePlanningLayout` / `usePlanningGantt`; SmartFilter and row reorder are part of the expected Planning experience.
- `AgentUI` is exported from package entry and should be consumed via `AgentPanel` / `StdChat` / `CopilotChat` / `AIBrowserGlow`, not internal renderers.
- `Tree` is public through `CTreeComp` for hierarchy tree/table + split detail pages.
- `NavigationIsland` supports pin/favorites and fixed/floating display mode through package-entry APIs and `CAppPageLayout` pass-through props.
