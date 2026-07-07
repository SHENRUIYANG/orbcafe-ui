# Navigation Island Contract

Use this reference for `NavigationIsland`, `TreeMenu`, `useNavigationIsland`, and `CAppPageLayout` navigation shell work.

## Public APIs

- `CAppPageLayout`
- `NavigationIsland`
- `TreeMenu`
- `useNavigationIsland`
- `type TreeMenuItem`
- `type NavigationIslandDisplayMode`

Import only from `orbcafe-ui`.

## Menu Data

```ts
type TreeMenuItem = {
  id: string;
  title: string;
  description?: string;
  href?: string;
  appurl?: string;
  children?: TreeMenuItem[];
  pinnable?: boolean;
};
```

Rules:

- Keep `id` stable; it is used by expansion and pinned-item state.
- Use `children` for groups.
- Use `href` or `appurl` for navigable leaves.
- Set `pinnable: false` on synthetic groups or items that must not appear in favorites.

## Pin / Favorites

Navigation Island supports pinning leaf menu items to a top pinned section.

Default local persistence:

```tsx
<CAppPageLayout
  appTitle="ORBCAFE"
  menuData={menuData}
  enableNavigationPinning
  navigationPinStorageKey="orbcafe:my-app:pinned-navigation-items"
  defaultPinnedNavigationItemIds={['std-report']}
/>
```

Controlled state:

```tsx
<CAppPageLayout
  appTitle="ORBCAFE"
  menuData={menuData}
  pinnedNavigationItemIds={pinnedIds}
  onPinnedNavigationItemIdsChange={setPinnedIds}
/>
```

Direct component mode:

```tsx
<NavigationIsland
  collapsed={collapsed}
  onToggle={() => setCollapsed((value) => !value)}
  menuData={menuData}
  pinnedItemIds={pinnedIds}
  onPinnedItemIdsChange={setPinnedIds}
/>
```

## Fixed / Floating Mode

Use shell props:

```tsx
<CAppPageLayout
  appTitle="ORBCAFE"
  menuData={menuData}
  navigationMode={mode}
  onNavigationModeChange={setMode}
  showNavigationModeToggle
/>
```

Use `defaultNavigationMode` for uncontrolled first render. Avoid duplicating a second page-local floating navigation layer.

## Verify

- Search filters expected menu items.
- Group expand/collapse works.
- Clicking a leaf routes or calls the expected item action.
- Pinning a leaf shows it in the top pinned section.
- Reload preserves local pinned items when using localStorage mode.
- Controlled pin state calls `onPinnedNavigationItemIdsChange`.
- Fixed/floating mode changes layout without hydration warnings.

## Common Failures

- Pin button is absent because the item is a group or has no `href`/`appurl`.
- Pinned section is empty because stored ids no longer exist in `menuData`.
- Pinned state never persists because a controlled `pinnedItemIds` prop is passed without updating it in `onPinnedItemIdsChange`.
- Floating mode is implemented outside `CAppPageLayout`, creating two competing navigation shells.
- Route highlight mismatches on first paint because browser-only pathname state is read before mount.
