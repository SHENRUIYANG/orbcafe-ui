---
name: orbcafe-ui-component-usage
description: Precise component selection and implementation guide for the ORBCAFE UI npm library in React/Next.js projects. Use when requests involve building list pages, tables, filter bars, graph report dialogs, detail pages, navigation shells, message dialogs, AI prompt settings, markdown rendering, transitions, i18n integration, or choosing among ORBCAFE UI controls with correct props and hooks.
---

# Orbcafe Ui Component Usage

## Overview

Generate precise ORBCAFE UI usage code from natural language requirements. Prefer minimal, runnable patterns and only publicly exported APIs from `orbcafe-ui`.

## Workflow

1. Classify request into one primary UI task:
- App shell/navigation
- Standard list/report table
- Chart report dialog
- Detail page
- Confirmation/message dialog
- AI prompt settings dialog
- Markdown renderer or page transition

2. Load only needed reference file:
- Component mapping and first choice: `references/component-map.md`
- Drop-in implementation templates: `references/implementation-recipes.md`
- Public API boundaries and guardrails: `references/public-api-guardrails.md`

3. Pick lowest-complexity integration pattern first:
- List/report page: `useStandardReport` + `CStandardPage`
- Table-only view: `CTable`
- Detail page: `CDetailInfoPage`
- App shell: `CAppPageLayout`

4. Return implementation in this order:
- Import block from `orbcafe-ui`
- Minimal runnable component snippet
- Required data shape (metadata/rows/menu/tabs)
- Optional enhancements (graph, quick create/edit/delete, i18n)

5. Apply environment constraints:
- For Next.js App Router, unwrap dynamic `params` in Server Page before passing to Client component.
- If Tailwind is used, include `./node_modules/orbcafe-ui/dist/**/*.{js,mjs}` in `content`.
- Keep first render deterministic to avoid hydration mismatch (`Date.now`, `Math.random`, pathname-only client highlight).

## Guardrails

- Use only APIs exported from `dist/index.d.ts`. Do not import private internals.
- Do not recommend `Atoms/*` components as public API unless they are explicitly exported.
- Use stable machine values plus localized labels for filter options.
- Prefer `CMessageBox` for confirmation/warning dialogs instead of hand-rolled `Dialog`.
- Keep examples type-safe and avoid business-specific hardcoded endpoints unless user asked.

## Output Contract

When answering UI build requests with this skill, output:

1. `Component choice`: why this component/hook pair is the best fit.
2. `Minimal code`: complete snippet the user can paste.
3. `Key props`: only the props that matter for this requirement.
4. `Upgrade path`: one short optional next step (for example add `graphReport`, i18n, or variant/layout persistence).
