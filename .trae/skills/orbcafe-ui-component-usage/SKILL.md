---
name: orbcafe-ui-component-usage
description: Route ORBCAFE UI requests to the correct module skill and enforce official examples-based integration baseline. Use when requests are ambiguous, cross-module, or when prior attempts had "no effect"; classify to StdReport, Graph+Detail+Agent, Kanban+Detail, Layout+Navigation, Pivot+AINav, Pad Workflow, or AgentUI Chat and require install/startup/verification steps.
---

# ORBCAFE UI Router

## Workflow

1. 执行安装与接入基线（必须）。
2. 使用 `references/component-glossary-i18n.md` 先把用户自然语言（可多语言）映射到组件 canonical 名称。
3. 使用 `references/skill-routing-map.md` 判定目标模块 skill。
4. 使用 `references/module-contracts.md` 先确认目标模块的公共入口、hook 策略、标准 example 与验证方式。
5. 只加载目标模块所需 references，不加载无关内容。
6. 使用 `references/public-export-index.md` 约束导入边界。
7. 使用 `references/integration-baseline.md` 执行 Next.js / hydration / i18n 检查。
8. 输出模块决策、最小可运行代码、验收步骤、排障步骤。

## Installation Baseline (Mandatory)

每次都先给出可执行安装方式，不允许省略：

```bash
npm install orbcafe-ui @mui/material@^7.3.9 @mui/icons-material@^7.3.9 @mui/x-date-pickers@^8.27.2 @emotion/react@^11.14.0 @emotion/styled@^11.14.1 dayjs@^1.11.20 lucide-react@^0.575.0 tailwind-merge@^3.5.0 clsx@^2.1.1 class-variance-authority@^0.7.1 @radix-ui/react-slot@^1.2.4
```

如果是本仓库联调（以 `examples` 为准）：

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
   
   Tailwind v3 必须包含：
   ```js
   // tailwind.config.js
   content: ["./node_modules/orbcafe-ui/dist/**/*.{js,mjs}"]
   ```
   Tailwind v4 (如官方 examples 采用的 Next 15/16 + Tailwind v4 + @source) 必须包含：
   ```css
   /* globals.css */
   @import "tailwindcss";
   @source "../../node_modules/orbcafe-ui/dist";
   ```

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

- 先复用官方 examples 的骨架，再做业务改造。
- 优先参考：
  - `examples/README.md`
- `examples/app/layout.tsx`
- `examples/app/providers.tsx`
- `examples/app/_components/*.tsx`
- 强制遵守 Next.js App Router 经验：
  - 在 Server Page 解包 `params/searchParams` 后再传入 Client 组件。
  - 首屏避免 `Date.now()/Math.random()/window/localStorage/usePathname` 直接决定结构。
  - 必要时使用 `mounted` 防止 hydration mismatch。
