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

## 推荐搭配

- 状态管理：`Hooks/use-navigation-island.ts`
- 页面壳层：`PageLayout`
