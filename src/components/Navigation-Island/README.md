# Navigation-Island

灵动导航组件（侧边导航 + 树菜单）。

## 快速使用

```tsx
import { NavigationIsland } from 'orbcafe-ui';

<NavigationIsland
  collapsed={false}
  onToggle={() => {}}
  menuData={[
    { id: 'home', title: 'Home', href: '/' },
    { id: 'report', title: 'Report', href: '/std-report' },
  ]}
  colorMode="dark"
/>
```

## Pin / 收藏夹

`NavigationIsland` 默认开启 pin 功能。用户点击叶子菜单项右侧的图钉后，该功能会出现在菜单顶部的 `Pinned` 分组中，并通过 `localStorage` 持久化。

```tsx
<NavigationIsland
  collapsed={false}
  onToggle={() => {}}
  menuData={menuData}
  pinStorageKey="my-app:pinned-navigation-items"
/>
```

需要由应用接管状态时，传入受控 ids：

```tsx
<NavigationIsland
  collapsed={false}
  onToggle={() => {}}
  menuData={menuData}
  pinnedItemIds={pinnedIds}
  onPinnedItemIdsChange={setPinnedIds}
/>
```

如需关闭：

```tsx
<NavigationIsland
  collapsed={false}
  onToggle={() => {}}
  menuData={menuData}
  enablePinning={false}
/>
```

## 推荐搭配

- 状态管理：`Hooks/use-navigation-island.ts`
- 页面壳层：`PageLayout`
