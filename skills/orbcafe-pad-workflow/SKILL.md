---
name: orbcafe-pad-workflow
description: Build ORBCAFE touch-first pad experiences with PAppPageLayout, PNavIsland, PWorkloadNav, PTable/PSmartFilter including CValueHelp/F4 lookup fields, PNumericKeypad, PBarcodeScanner. Use for iPad/平板端, 触控交互, 主数据值帮助, 扫码录入.
---

# ORBCAFE Pad Workflow

## Workflow

1. 先对照 `skills/orbcafe-ui-component-usage/references/module-contracts.md`，确认 `PadWorkflow` 是 `Hook-first` 模块（`usePadLayout`/`usePadRecordEditor`）。
2. 执行 `skills/orbcafe-ui-component-usage/references/integration-baseline.md`，按 Next.js App Router + 官方 examples 做最小可运行接入；不要把 Pad 模式静默改成 Vite/CRA。
3. 用 `references/patterns.md` 输出实现骨架。
4. 如涉及 lookup/F4，读取 `skills/orbcafe-ui-component-usage/references/value-help.md`，`PSmartFilter` 继承 `CSmartFilter` 的 `CValueHelp` 契约。
5. 用 `references/guardrails.md` 检查触摸目标尺寸、横竖屏切换与 hydration、`PTable` 与 `CTable` 的功能对等、keypad/scanner 行为。
6. 输出验收步骤与"没效果"排障；非 Next.js 项目先标记为偏离基线，不要静默改成桌面端 `CAppPageLayout`/`CTable`。

## Canonical Setup

先检查宿主 `package.json`，缺失或版本不兼容时才安装：

```bash
npm install orbcafe-ui @mui/material@^7.3.9 @mui/icons-material@^7.3.9 lucide-react@^0.575.0
```

参考实现：
- `examples/app/_components/PadExampleClient.tsx`
- `examples/app/pad/page.tsx`
- `src/components/Pad/README.md`
- `src/components/Pad/Hooks/README.md`

## Core Components & Layout Strategy

标准 Pad 页面使用固定的组件层级，Pad 路由不要使用桌面端布局（`CAppPageLayout`、`CTable`）。

1. **`PAppPageLayout`**：Pad 页面的根布局壳层，负责响应式外壳、安全区和背景。
   - Props：`navigation`（通常传 `PNavIsland`）、`workloads`（通常传 `PWorkloadNav`）、`header`（品牌 logo/标题）。
2. **`PNavIsland`**：左侧竖向导航栏，为拇指可触达距离设计。
   - Props：`items`（`TreeMenuItem[]`）、`activeId`、`onItemClick`、可选 `collapsed`。
3. **`PWorkloadNav`**：顶部横向 tab/卡片导航，用于在主要工作流之间切换（如 Receiving、Picking、Packing）。
   - Props：`items`（`PWorkloadNavItem[]`）、`activeId`、`onItemClick`。
4. **`PTable`**：`CTable` 的触控友好版本，行以大号 `PTouchCard` 渲染，同时保留 variants、smart filter、快速操作等核心能力。
   - 关键 Props：`cardTitleField`、`cardSubtitleFields`、`renderCardFooter`、`cardActionSlot`。
   - `filterConfig.fields` 使用 `PSmartFilter`，继承 `CSmartFilter` 的 Value Help 字段（`type: 'value-help'` / `isValueHelp: true`），用于触控端的物料/客户/库位查找，不要另起自定义弹窗。
5. **`PNumericKeypad`**：屏幕内置数字小键盘，用于快速录入数量/数据而不唤起系统键盘。
6. **`PBarcodeScanner`**：调用设备摄像头扫描条码/二维码的弹窗组件（底层基于 `html5-qrcode`）。

## Integration Requirements（必查项）

1. **Tailwind CSS 编译**：`orbcafe-ui` 的 Pad 组件大量依赖 Tailwind 原子类（如 `rounded-2xl`、`backdrop-blur`），宿主项目必须配置 Tailwind 扫描到该库：
   - Tailwind v4（`globals.css`）：使用 CSS `@source`，指向 `node_modules/orbcafe-ui/dist` 的正确相对路径。
   - Tailwind v3（`tailwind.config.js`）仅作为遗留兼容：`content: ["./node_modules/orbcafe-ui/dist/**/*.{js,mjs}"]`。
2. **Provider 基线**：确保根层级已包裹 `ThemeProvider`、`CssBaseline`、`LocalizationProvider`（MUI）。
3. **Examples 来源**：npm 包不包含 `examples/`。当前项目没有 `examples/` 时，查阅 ORBCAFE GitHub 仓库或本地 checkout。
4. **依赖检查**：先看 `package.json`，缺失或不兼容时再安装。

## Output Contract

0. `Mode`：`Hook-first`。
1. `Chosen module`：Pad Workflow，以及是否需要 `PSmartFilter`/`PNumericKeypad`/`PBarcodeScanner`。
2. `Minimal implementation`：`PAppPageLayout + PNavIsland + PWorkloadNav + PTable`，涉及数量录入/扫码时补充 `PNumericKeypad`/`PBarcodeScanner`。
3. `Verify`：横竖屏切换后交互不失效、`PTable` 工具栏对齐、variant/layout 保存加载、Value Help 字段写回稳定 key、小键盘提交回写、扫码回调更新业务状态。
4. `Troubleshooting`：至少覆盖遮挡点击的覆盖层、orientation 引起的 hydration 抖动、keypad 只更新输入框未写回数据源、摄像头未释放这几类问题。

## See Also
- [Layout Patterns](./references/patterns.md) 提供完整代码模板与层级结构。
- [Guardrails](./references/guardrails.md) 提供移动端约束与触摸目标规则。
