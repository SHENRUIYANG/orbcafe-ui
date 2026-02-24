# PageLayout Hooks

`PageLayout` 的 Hook 用于组合页面壳层能力：顶部 Header + 左侧 Navigation Island + 内容区域。

> 说明：用户头像下拉菜单（`onUserLogout` / `onUserSetting` / `userMenuItems`）属于 `CAppPageLayout` 组件 Props，不在 `usePageLayout` Hook 中配置。

## Hooks

| Hook | Description |
| --- | --- |
| `usePageLayout` | 为 `CAppPageLayout` 提供导航状态与窗口高度相关参数（如 `navigationMaxHeight`）。 |

## usePageLayout

### Usage

```tsx
import { CAppPageLayout, usePageLayout } from 'orbcafe-ui';

const menuData = [
  { id: 'home', title: 'Home', href: '/' },
  { id: 'report', title: 'Report', href: '/std-report' },
];

const { navigationIslandProps, navigationMaxHeight } = usePageLayout({
  menuData,
  initialNavigationCollapsed: false,
});
```

### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `menuData` | `TreeMenuItem[]` | No | Navigation Island 菜单结构。 |
| `initialNavigationCollapsed` | `boolean` | No | 初始是否折叠导航。 |

### Return

| Name | Type | Description |
| --- | --- | --- |
| `navigationIslandProps` | `{ collapsed, onToggle, menuData }` | 可直接透传给 `NavigationIsland`。 |
| `navigationMaxHeight` | `number` | 当前窗口计算后的建议最大高度。 |
