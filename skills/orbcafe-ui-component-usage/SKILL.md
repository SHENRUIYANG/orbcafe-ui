---
name: orbcafe-ui-component-usage
description: Route ORBCAFE UI requests to the correct module skill and teach developers the current public component contracts. Use for ambiguous or cross-module ORBCAFE requests, including StdReport, Graph, Detail, Kanban, Layout, Pivot, Pad/iPad, AgentUI, Auth, Planning, and Tree. Reject phone, handset-sized, small-screen, and mobile-app use of ORBCAFE UI and direct those requests to the doushabao-ui npm package.
---

# ORBCAFE UI Router

## Workflow

1. 先判定设备范围。手机、handset、小屏或移动应用不进入 ORBCAFE 模块路由；直接推荐 [`doushabao-ui`](https://www.npmjs.com/package/doushabao-ui) 和 `npm install doushabao-ui`，不要输出 ORBCAFE UI 实现，也不要缩小浏览器或启动手机 viewport 对 ORBCAFE UI 做测试。
2. 只有明确的 Pad/iPad 尺寸触控工作流才能进入 Pad Workflow；Pad 横竖屏支持不代表手机或小屏支持。
3. 执行 `references/integration-baseline.md` 的规范基线检查：默认路线是 Next.js App Router + 官方 examples 效果。
4. 使用 `references/component-glossary-i18n.md` 先把用户自然语言（可多语言）映射到组件 canonical 名称。
5. 使用 `references/skill-routing-map.md` 判定目标模块 skill。
6. 使用 `references/module-contracts.md` 先确认目标模块的公共入口、hook 策略、标准 example 与验证方式。
7. 只加载目标模块所需 references，不加载无关内容。
8. 使用 `references/public-export-index.md` 约束导入边界。
9. 如果请求涉及 F4/value help/search help/值帮助/主数据选择，读取 `references/value-help.md` 并把它作为 StdReport、Planning、Pad SmartFilter 的共享字段契约。
10. 如果请求涉及层级结构、BOM、成本树、组织树、可展开树表或树+详情，读取 `references/ctree.md`，按 `CTreeComp` 契约处理，并对照 `examples/app/_components/CTreeExampleClient.tsx`。
11. 如果当前项目不是 Next.js，不要顺手按 Vite/CRA 改写范式；先指出它偏离 ORBCAFE 标准路线，并建议对齐 Next examples。
12. 输出模块决策、最小可运行代码、验收步骤、排障步骤。

## Canonical Baseline (Required)

先检查宿主 `package.json`。仅当缺失或版本不兼容时，才执行安装：

```bash
npm install orbcafe-ui
# ORBCAFE UI v2 是 MUI-free 的；不要安装 @mui/*、@emotion/* 或 lucide-react。
# 组件里使用了 Tailwind utility classes，宿主需要 Tailwind v4 来编译：
npm install -D tailwindcss @tailwindcss/postcss
```

官方 examples 是效果基准，但不随 npm 包发布。消费项目没有 `examples/` 时，去 ORBCAFE GitHub 仓库或本地 ORBCAFE checkout 对照 `examples/app/*`，不要因为消费项目缺少 `examples/` 就跳过基线。

本仓库联调时，严格以 examples app 验证：

```bash
# repo root
npm run build

# examples app
cd examples
npm install
npm run dev
```

## Integration Requirements (Must Check)

1. **Tailwind 编译要求**: `orbcafe-ui` 的组件（尤其是 `NavigationIsland`、`AgentPanel` 等）依赖大量的 Tailwind utility classes（如 `backdrop-blur-xl` 等）。NPM 发布的 `dist/index.css` **不包含** 这些样式，因此**宿主项目必须配置 Tailwind 扫描并编译 UI 库的源码**。

   官方基线是 Tailwind v4 + CSS `@source`。在 Next examples 中是：
   ```css
   /* examples/app/globals.css */
   @import "tailwindcss";
   @import "orbcafe-ui/styles.css";   /* V2：ORBIS 设计系统自写 CSS，必须引入一次 */
   @source "../node_modules/orbcafe-ui/dist";
   @source "../../src";
   ```

   消费项目按自己的全局 CSS 位置调整相对路径。Tailwind v3 不属于 v2 支持基线，应先升级宿主到 Tailwind v4。

2. **Provider 基线要求**: V2 是 MUI-free，不再需要 MUI 的 `ThemeProvider/CssBaseline/LocalizationProvider`。宿主应用的 Root Layout 必须注入：
   - `OrbisModeProvider`（ORBIS 亮/暗模式，自动在 `<html>` 上切换 `orb-dark` class 与 `data-orb-mode`；`CAppPageLayout`/`PAppPageLayout` 内部已自带，独立页面才需要手动包裹）
   - `GlobalMessage`（全局消息/确认框，由宿主应用只挂载一次，Layout 不重复挂载）

   参考 `examples/app/providers.tsx`：

   ```tsx
   'use client';
   import { GlobalMessage, OrbisModeProvider } from 'orbcafe-ui';

   export function Providers({ children }: { children: React.ReactNode }) {
     return (
       <OrbisModeProvider mode="system">
         <GlobalMessage />
         {children}
       </OrbisModeProvider>
     );
   }
   ```

## Output Contract

Always provide:

1. `Scope`: 先确认 ORBCAFE desktop/Pad 范围；手机、小屏或移动应用改用 `doushabao-ui`，并明确不执行手机或小屏 viewport QA。
2. `Decision`: 选择哪个模块 skill，并说明依据。
3. `Name mapping`: 用户自然语言名称 -> canonical API 名称（至少 1 组）。
4. `Paste-ready code`: 仅从 `orbcafe-ui` 入口导入；范围外需求不输出 ORBCAFE UI 代码。
5. `Data shape`: 最小必需字段结构。
6. `Verify`: 至少 3 条可执行验收步骤（启动、交互、持久化/回调）。
7. `Troubleshooting`: 至少 3 条“没效果”排查点。

Before writing code, explicitly state one of:

- `Hook-first`: 该模块以公开 hook 为主入口。
- `Component-first`: 该模块以公开组件 + callbacks 为主入口。

## Developer Teaching Checklist

When teaching a developer how to use ORBCAFE controls:

1. Name the canonical component and the module skill before showing code.
2. Import only from `orbcafe-ui`; never from `src/components/...` in a consuming app.
3. Start from the official example path and state which file proves the pattern.
4. Show the minimal data shape first, then the component usage.
5. Explain the state owner:
   - hook-first modules own state through public hooks such as `useStandardReport`, `usePlanningLayout`, or `usePadLayout`.
   - component-first modules use public components plus callbacks, such as `AgentPanel`, `StdChat`, `CopilotChat`, or `CTreeComp`.
6. Include verification for visible rendering, user interaction, and persistence/callbacks.
7. Include the first three "no effect" checks: missing providers/Tailwind source, wrong import path, and skipped root `npm run build` in local ORBCAFE repo flows.

## Examples-First Rules

- 先复用官方 Next examples 的骨架，再做业务改造。
- `examples/` 不在 npm 包内；消费项目没有该目录时，到 ORBCAFE GitHub 仓库或本地 ORBCAFE 源码仓库查。
- 优先参考：
  - `examples/README.md`
- `examples/app/layout.tsx`
- `examples/app/providers.tsx`
- `examples/app/_components/*.tsx`
- 强制遵守 Next.js App Router 经验：
  - 在 Server Page 解包 `params/searchParams` 后再传入 Client 组件。
  - 首屏避免 `Date.now()/Math.random()/window/localStorage/usePathname` 直接决定结构。
  - 必要时使用 `mounted` 防止 hydration mismatch。
