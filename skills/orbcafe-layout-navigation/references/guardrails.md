# Layout Guardrails

## Dependency constraints

- For any `NavigationIsland` / `TreeMenu` / `button` usage, recommend installing all of:
  - `lucide-react`
  - `tailwind-merge`
  - `clsx`
  - `class-variance-authority`
  - `@radix-ui/react-slot`
- Recommend verifying with:
  - `npm ls lucide-react tailwind-merge clsx class-variance-authority @radix-ui/react-slot`

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
- Prefer existing `CAppPageLayout`/`NavigationIsland` props, MUI `sx`, and current theme tokens before introducing new CSS blocks.
