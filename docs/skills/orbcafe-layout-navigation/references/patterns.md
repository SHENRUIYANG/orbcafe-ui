# Layout Patterns

## Pattern 1: Full application shell

```tsx
import { CAppPageLayout } from 'orbcafe-ui';

<CAppPageLayout
  appId="operations-portal"
  appTitle="ORBCAFE"
  menuData={[{ id: 'std', title: 'Standard Report', href: '/std-report' }]}
  locale="zh"
  user={{ name: 'Ruiyang Shen', subtitle: 'ruiyang.shen@orbis.de' }}
  enableNavigationPinning
  defaultPinnedNavigationItemIds={['std']}
  pinnedNavigationSectionTitle="Pinned"
  defaultNavigationMode="fixed"
  onUserSetting={() => router.push('/settings')}
  onUserLogout={() => auth.logout()}
>
  <div>Page Content</div>
</CAppPageLayout>;
```

Use `CAppPageLayout` for normal products. It passes navigation mode and pinned-item state into `NavigationIsland`, derives stable preference keys from `appId`, and keeps the shell contract in one place. The `appTitle` fallback remains for compatibility only.

## Pattern 2: Nav-only + custom content orchestration

```tsx
import { NavigationIsland, useNavigationIsland } from 'orbcafe-ui';

const nav = useNavigationIsland({ menuData });

<NavigationIsland
  menuData={menuData}
  collapsed={nav.collapsed}
  onToggle={nav.toggleCollapsed}
  enablePinning
  pinStorageKey="my-app:pinned-navigation-items"
  defaultPinnedItemIds={['std']}
/>;
```

Use direct `NavigationIsland` only when the app has its own shell. Pin only real navigable leaf items (`href` or `appurl`); group nodes should remain containers.

## Pattern 3: Controlled theme, pin/favorites, and display mode

```tsx
import {
  CAppPageLayout,
  type NavigationIslandDisplayMode,
  type OrbModeSetting,
} from 'orbcafe-ui';

const [themeMode, setThemeMode] = useState<OrbModeSetting>('system');
const [navigationMode, setNavigationMode] = useState<NavigationIslandDisplayMode>('floating');
const [pinnedIds, setPinnedIds] = useState<string[]>(['std-report']);

<CAppPageLayout
  appId="operations-portal"
  appTitle="ORBCAFE"
  menuData={menuData}
  mode={themeMode}
  onModeChange={setThemeMode}
  navigationMode={navigationMode}
  onNavigationModeChange={setNavigationMode}
  pinnedNavigationItemIds={pinnedIds}
  onPinnedNavigationItemIdsChange={setPinnedIds}
>
  <main />
</CAppPageLayout>;
```

Use controlled props when the host app stores preferences in a backend/profile service. Use uncontrolled `defaultPinnedNavigationItemIds` + `navigationPinStorageKey` for local persistence.

## Pattern 4: Markdown + transition utility

```tsx
import { MarkdownRenderer, CPageTransition } from 'orbcafe-ui';

<CPageTransition transitionKey={pathname} variant="slide-up" durationMs={220}>
  <MarkdownRenderer markdown={markdownText} />
</CPageTransition>;
```
