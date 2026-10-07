# Layout and navigation usage contract

## Shell and state

Default composition is **component-first** `<CAppPageLayout appId="my-app" appTitle="My app" menuData={menu}>{children}</CAppPageLayout>`; the shell invokes its hook internally. Public `usePageLayout` and `useNavigationIsland` are for custom composition. Do not invent `<CAppPageLayout {...layout.pageProps} />`.

- `appTitle` and `children` are required; `appId` is optional in TypeScript but should be a stable application identity for persistence.
- `navigationVariant='classic' | 'v2'` chooses the visual generation; `navigationMode='fixed' | 'floating'` chooses placement. These are independent properties.
- Controlled pairs: `mode/onModeChange`, `navigationMode/onNavigationModeChange`, `pinnedNavigationItemIds/onPinnedNavigationItemIdsChange`. Use defaultMode/defaultNavigationMode/defaultPinnedNavigationItemIds for initial uncontrolled values.
- Locale with `onLocaleChange` is host-controlled; without it the shell switches/persists its initial locale. Keep locale and option values separate from application IDs.
- `searchPlacement` defaults to `'hidden'`; choose `'header'` or `'floating'` with `onSearch(query)` / `onSearchAdd()` to enable AI input. `CAppHeader` alone defaults `showSearch=false`.
- Mount `GlobalMessage` once in the host. Layout contains its own OrbisModeProvider. Do not assume every component has `sx`: CAppPageLayout offers contentSx/floatingSearchSx, navigation offers className, and many others use their specific prop types.

## Menu and event names

`TreeMenuItem` has stable `id`, `title`, optional `href/appurl`, `children`, `icon`, `description`, `pinnable`. Groups use children; navigable leaves use href/appurl. Pinning is only for eligible leaves.

| Shell prop | Direct NavigationIsland prop |
| --- | --- |
| `navigationMode` | `displayMode` |
| `onNavigationModeChange` | `onDisplayModeChange` |
| `enableNavigationPinning` | `enablePinning` |
| `navigationPinStorageKey` | `pinStorageKey` |
| `pinnedNavigationItemIds` | `pinnedItemIds` |
| `onPinnedNavigationItemIdsChange` | `onPinnedItemIdsChange` |

Direct NavigationIsland requires `collapsed` and `onToggle`. TreeMenu click handling and route behavior follow its own props; do not mix shell-level names into it. User menu callbacks (`onUserRefresh`, `onUserSetting`, `onUserLogout`) delegate business actions to the host.

`CPageTransition` uses its documented variant/duration props. Brand colors/fonts route to `orbcafe-brand-theme`; light/dark mode is not a brand-preset change.

Sources: `src/components/PageLayout/types.ts`, `CAppPageLayout.tsx`, `Navigation-Island/navigation-island.types.ts`, `tree-menu.tsx`. Verify search opt-in, pin reload, both navigation variants, fixed/floating mode, locale and host-controlled mode.
