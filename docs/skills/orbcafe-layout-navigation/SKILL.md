---
name: orbcafe-layout-navigation
description: Build ORBCAFE application shell and navigation with CAppPageLayout, NavigationIsland, TreeMenu, useNavigationIsland, pin/favorites, fixed/floating navigation modes, i18n, markdown renderer, and CPageTransition using official Next.js examples patterns. Use for app frame, user menu, locale switching, navigation tree, pinned menu items, Navigation Island display mode, route transition UX, and when navigation renders but pin/search/expand/click behavior has no effect.
---

# ORBCAFE Layout + Navigation

## Workflow

1. 先对照 `skills/orbcafe-ui-component-usage/references/module-contracts.md`，确认这是 `Hook-first` 模块。
2. 执行 `skills/orbcafe-ui-component-usage/references/integration-baseline.md`：默认按 Next.js App Router + 官方 examples 接入。
3. 用 `references/patterns.md` 选择 full shell 或 nav-only。
4. 如果涉及 Navigation Island，必须读取 `references/navigation-island.md`，确认 pin/favorites、fixed/floating display mode、TreeMenu 叶子节点规则和 CAppPageLayout 透传。
5. 用 `references/guardrails.md` 逐条检查 locale、hydration、菜单动作、pin 持久化和动效。
6. 以官方 Next examples 的 layout/providers/page 骨架产出代码；非 Next 项目先标记为偏离基线，不要静默改成 Vite/CRA 范式。

## Canonical Setup

先检查宿主 `package.json`，缺失或版本不兼容时才安装。  
V2 是 MUI-free，`NavigationIsland` / `TreeMenu` / `Button` 的运行时依赖（`@radix-ui/react-slot`、`class-variance-authority`、`tailwind-merge`、`clsx` 等）已随 `orbcafe-ui` 一并安装，消费项目不需要单独安装它们。

标准安装命令：

```bash
npm install orbcafe-ui
# ORBCAFE UI v2 是 MUI-free；不要安装 @mui/*、@emotion/*、lucide-react。
# 组件使用 Tailwind utility classes，宿主需要 Tailwind v4：
npm install -D tailwindcss @tailwindcss/postcss
```

安装后建议做一次依赖验证：

```bash
npm ls orbcafe-ui
# 再确认全局 CSS 里已引入 orbis.css 并配置 Tailwind v4 @source（见 orbcafe-ui-component-usage/integration-baseline.md）
```

官方 examples 不随 npm 包发布。消费项目没有 `examples/` 时，到 ORBCAFE GitHub 仓库或本地 ORBCAFE 源码仓库对照。

本仓库联调：

```bash
npm run build
cd examples
npm install
npm run dev
```

参考实现：
- `examples/app/layout.tsx`
- `examples/app/providers.tsx`
- `examples/app/_components/exampleNavigation.tsx`
- `examples/app/_components/HomeDemoClient.tsx`
- `examples/app/_components/StdReportExampleClient.tsx`
- `src/components/Navigation-Island/README.md`
- `src/components/PageLayout/README.md`

## Output Contract

0. `Mode`: `Hook-first`.
1. `Layout decision`: full shell vs nav-only, fixed vs floating navigation.
2. `Dependency check`: include recommended Navigation Island dependencies and `npm ls ...` check command.
3. `Code snippet`: app frame with minimal props, including pin/favorites when navigation is involved.
4. `Runtime safety`: locale、hydration、route 高亮、localStorage pin 持久化安全策略。
5. `Verify`: 菜单跳转、搜索、展开/折叠、pin 到顶部、locale 切换、用户菜单动作、过渡动画。
6. `Troubleshooting`: 至少包含 3 条“页面看起来没反应”排查项。

## Examples-Based Experience Summary

- 在 App Router 下优先采用 `Server page -> Client page` 分层，不在 client 首屏直接消费 Promise 语义路由参数。
- `usePathname` 高亮逻辑使用 `mounted` 防抖策略，避免 SSR/CSR 首帧不一致。
- `CAppPageLayout` 内部负责壳层，业务页只注入 menu/user/logo/children，避免重复造壳。
- Navigation Island pin/favorites 是标准能力：叶子菜单项可 pin 到顶部 `Pinned` 分组；分组节点不 pin；应用可用 `pinnedNavigationItemIds` / `onPinnedNavigationItemIdsChange` 接管状态。
- `CAppPageLayout` 是首选接入口；只有自定义 shell 时才直接使用 `NavigationIsland + useNavigationIsland`。
- `navigationMode` / `defaultNavigationMode` 控制 fixed/floating；不要在页面层重写一个独立浮动导航系统。
- `CPageTransition` 持续使用 `160-260ms`，仅用 transform/opacity 变换，性能更稳。
- `Providers` 层集中挂载 `OrbisModeProvider + GlobalMessage`（V2 MUI-free），避免每页重复配置；`CAppPageLayout` 已内部渲染这两个 Provider，独立页面才需要手动包裹。
- 如无明确需求，建议不改全局样式文件（如 `app/globals.css`、`styles.css`、tailwind 主题变量）；优先通过组件 props、`sx`、现有 theme 扩展完成调整。
