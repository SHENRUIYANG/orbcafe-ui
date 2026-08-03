# Layout Guardrails

## Dependency constraints

- ORBCAFE UI v2 is MUI-free. Do not install `@mui/*`, `@emotion/*`, or `lucide-react` for ORBCAFE components.
- `orbcafe-ui` brings its own runtime dependencies (`@radix-ui/react-slot`, `class-variance-authority`, `tailwind-merge`, `clsx`, etc.). Consumers only need to install `orbcafe-ui` and Tailwind v4 (`tailwindcss` + `@tailwindcss/postcss`) for utility-class compilation.
- Verify with:
  - `npm ls orbcafe-ui`

## i18n constraints

- Use `OrbcafeI18nProvider` at app root or `locale` on `CAppPageLayout`.
- Keep business identifiers stable and localize labels only.

## Next.js constraints

- In App Router, unwrap `params` in Server Page before passing to Client Component.
- Avoid first-render mismatch from pathname-only highlights or browser-only values.

## User menu constraints

- If using default menu, wire `onUserSetting` and `onUserLogout`.
- If using `userMenuItems`, ensure all actions are provided and consistent with auth policy.

## Navigation Island constraints

- Treat `TreeMenuItem.id` as durable state. Changing ids breaks pinned-item persistence.
- Pin/favorites belong in `NavigationIsland` or `CAppPageLayout`, not page-local shortcut lists.
- Pin only leaf navigation items with `href` or `appurl`; group nodes and synthetic sections should use `pinnable: false`.
- Use `enableNavigationPinning={false}` only when the product explicitly forbids favorites.
- Prefer `navigationPinStorageKey` for local persistence; use `pinnedNavigationItemIds` + `onPinnedNavigationItemIdsChange` when app/account settings own the state.
- Use `navigationMode` / `onNavigationModeChange` for fixed/floating mode. Do not fork a second floating nav shell outside ORBCAFE components.
- Verify search, expand/collapse, route click, pin/unpin, top pinned section ordering, and persistence after reload.
- If pin appears to do nothing, check that the item is a leaf with `href`/`appurl`, `enablePinning` is true, ids are stable, and localStorage is available.

## Motion constraints

- Prefer `CPageTransition` variants using transform/opacity and durations around 160-260ms.
- Respect reduced-motion behavior; avoid adding forced animations on top.

## Styling constraints

- Avoid editing `globals.css`, tailwind global tokens, or unrelated page-level CSS unless the user explicitly asks for style system changes.
- Prefer existing `CAppPageLayout`/`NavigationIsland` props, ORBIS `sx` (`OrbSxProps`, supported by all exported components), and current ORBIS theme tokens before introducing new CSS blocks.
