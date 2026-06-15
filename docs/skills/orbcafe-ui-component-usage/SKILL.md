---
name: orbcafe-ui-component-usage
description: Route ORBCAFE UI requests to the correct module skill and enforce the official Next.js examples-based integration baseline. Use when requests are ambiguous, cross-module, mention CValueHelp/F4/value help/search help lookup, or when prior attempts had "no effect"; classify to StdReport, Graph+Detail+Agent, Kanban+Detail, Layout+Navigation, Pivot+AINav, Pad Workflow, or AgentUI Chat and require canonical Next/examples, dependency, startup, and verification checks.
---

# ORBCAFE UI Router

## Workflow

1. 执行 `references/integration-baseline.md` 的规范基线检查：默认路线是 Next.js App Router + 官方 examples 效果。
2. 使用 `references/component-glossary-i18n.md` 先把用户自然语言（可多语言）映射到组件 canonical 名称。
3. 使用 `references/skill-routing-map.md` 判定目标模块 skill。
4. 使用 `references/module-contracts.md` 先确认目标模块的公共入口、hook 策略、标准 example 与验证方式。
5. 只加载目标模块所需 references，不加载无关内容。
6. 使用 `references/public-export-index.md` 约束导入边界。
7. 如果请求涉及 F4/value help/search help/值帮助/主数据选择，读取 `references/value-help.md` 并把它作为 StdReport、Planning、Pad SmartFilter 的共享字段契约。
8. 如果当前项目不是 Next.js，不要顺手按 Vite/CRA 改写范式；先指出它偏离 ORBCAFE 标准路线，并建议对齐 Next examples。
9. 输出模块决策、最小可运行代码、验收步骤、排障步骤。

## Canonical Baseline (Required)

先检查宿主 `package.json`。仅当缺失或版本不兼容时，才执行安装：

```bash
npm install orbcafe-ui @mui/material@^7.3.9 @mui/icons-material@^7.3.9 @mui/x-date-pickers@^8.27.2 @emotion/react@^11.14.0 @emotion/styled@^11.14.1 dayjs@^1.11.20 lucide-react@^0.575.0 tailwind-merge@^3.5.0 clsx@^2.1.1 class-variance-authority@^0.7.1 @radix-ui/react-slot@^1.2.4
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
   @source "../node_modules/orbcafe-ui/dist";
   @source "../../src";
   ```

   消费项目按自己的全局 CSS 位置调整相对路径。Tailwind v3 `tailwind.config.js content` 只能作为旧项目 fallback，不是 ORBCAFE 默认范式。

2. **Provider 基线要求**: `orbcafe-ui` 组件的正常渲染（特别是弹窗、日期、主题切换和全局消息）强依赖以下 Provider 的包裹。宿主应用的 Root Layout 必须注入：
   - `ThemeProvider` (MUI)
   - `CssBaseline` (MUI)
   - `LocalizationProvider` (MUI X)
   - `GlobalMessage` (orbcafe-ui)

## Output Contract

Always provide:

1. `Decision`: 选择哪个模块 skill，并说明依据。
2. `Name mapping`: 用户自然语言名称 -> canonical API 名称（至少 1 组）。
3. `Paste-ready code`: 仅从 `orbcafe-ui` 入口导入。
4. `Data shape`: 最小必需字段结构。
5. `Verify`: 至少 3 条可执行验收步骤（启动、交互、持久化/回调）。
6. `Troubleshooting`: 至少 3 条“没效果”排查点。

Before writing code, explicitly state one of:

- `Hook-first`: 该模块以公开 hook 为主入口。
- `Component-first`: 该模块以公开组件 + callbacks 为主入口。

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
