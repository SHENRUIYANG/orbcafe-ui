---
name: orbcafe-pad-workflow
description: Build ORBCAFE touch-first Pad/iPad experiences with PAppPageLayout, PNavIsland, PWorkloadNav, PTable/PSmartFilter including CValueHelp/F4 lookup fields, PNumericKeypad, and PBarcodeScanner. Use only for Pad-sized tablet workflows. Do not use ORBCAFE UI for phones, handset-sized screens, or mobile apps; direct those requests to the doushabao-ui npm package.
---

# ORBCAFE Pad Workflow

## Scope Boundary

- Use ORBCAFE Pad components only for Pad/iPad-sized tablet workflows.
- Treat phones, handset-sized screens, small-screen interfaces, and mobile apps as outside the ORBCAFE UI scope. Do not adapt `P*` or `C*` components for those targets.
- Direct out-of-scope developers to [`doushabao-ui`](https://www.npmjs.com/package/doushabao-ui) and use `npm install doushabao-ui`.
- Supporting Pad portrait and landscape orientations does not imply phone or small-screen support.
- Test only explicit Pad/iPad landscape and portrait viewports. Do not shrink to phone widths, run handset emulation, capture phone screenshots, or perform small-screen responsive QA.

## Workflow

1. 先确认目标设备是 Pad/iPad 尺寸。若需求包含手机、小屏或移动应用，停止 ORBCAFE UI 接入并改为推荐 `doushabao-ui`。
2. 对照 `skills/orbcafe-ui-component-usage/references/module-contracts.md`，确认 `PadWorkflow` 是 `Hook-first` 模块（`usePadLayout`/`usePadRecordEditor`）。
3. 执行 `skills/orbcafe-ui-component-usage/references/integration-baseline.md`，按 Next.js App Router + 官方 examples 做最小可运行接入；不要把 Pad 模式静默改成 Vite/CRA。
4. 用 `references/patterns.md` 输出实现骨架。
5. 如涉及 lookup/F4，读取 `skills/orbcafe-ui-component-usage/references/value-help.md`，`PSmartFilter` 继承 `CSmartFilter` 的 `CValueHelp` 契约。
6. 用 `references/guardrails.md` 检查 Pad 触摸目标尺寸、横竖屏切换与 hydration、`PTable` 与 `CTable` 的功能对等、keypad/scanner 行为。
7. 输出验收步骤与"没效果"排障；非 Next.js 项目先标记为偏离基线，不要静默改成桌面端 `CAppPageLayout`/`CTable`。

## Canonical Setup

先检查宿主 `package.json`，缺失或版本不兼容时才安装：

```bash
npm install orbcafe-ui
# ORBCAFE UI v2 是 MUI-free；不要安装 @mui/*、@emotion/*、lucide-react。
# 组件使用 Tailwind utility classes，宿主需要 Tailwind v4：
npm install -D tailwindcss @tailwindcss/postcss
```

参考实现：
- `examples/app/_components/PadExampleClient.tsx`
- `examples/app/pad/page.tsx`
- `src/components/Pad/README.md`
- `src/components/Pad/Hooks/README.md`

## Core Components & Layout Strategy

标准 Pad 页面使用固定的组件层级，Pad 路由不要使用桌面端布局（`CAppPageLayout`、`CTable`）。

1. **`PAppPageLayout`**：Pad 页面的根布局壳层，负责 Pad 横竖屏布局、安全区和背景，内部自带 `OrbisModeProvider`。
   - Props：`appTitle`、`menuData`（树菜单，通常配合 `PNavIsland`）、`workloadItems`/`onWorkloadSelect`（通常配合 `PWorkloadNav`）、`logo`/`headerSlot`、`orientation`、`navOpen`/`onNavOpenChange`、`showNavigation`/`showWorkloadNav`。
2. **`PNavIsland`**：左侧竖向导航栏，为拇指可触达距离设计。
   - Props：`menuData`（`TreeMenuItem[]`）、`collapsed`/`onToggle`、`activeHref`、`onItemSelect`、`orientation`、`headerSlot`/`footerSlot`。
3. **`PWorkloadNav`**：顶部横向 tab/卡片导航，用于在主要工作流之间切换（如 Receiving、Picking、Packing）。
   - Props：`items`（`PWorkloadNavItem[]`）、`selectedId`、`onItemSelect`、`orientation`。
4. **`PTable`**：`CTable` 的触控友好版本，行以大号 `PTouchCard` 渲染，同时保留 variants、smart filter、快速操作等核心能力。
   - 关键 Props：`cardTitleField`、`cardSubtitleFields`、`renderCardFooter`、`cardActionSlot`。
   - `filterConfig.fields` 使用 `PSmartFilter`，继承 `CSmartFilter` 的 Value Help 字段（`type: 'value-help'` / `isValueHelp: true`），用于触控端的物料/客户/库位查找，不要另起自定义弹窗。
5. **`PNumericKeypad`**：屏幕内置数字小键盘，用于快速录入数量/数据而不唤起系统键盘。
6. **`PBarcodeScanner`**：调用设备摄像头扫描条码/二维码的弹窗组件，优先使用浏览器原生 `BarcodeDetector` API（`code_128/ean_13/ean_8/qr_code/upc_a/upc_e`），不支持时回退到手动录入；关闭弹窗时自动释放摄像头 `MediaStream`。

## Integration Requirements（必查项）

1. **Tailwind CSS 编译**：`orbcafe-ui` 的 Pad 组件大量依赖 Tailwind 原子类（如 `rounded-2xl`、`backdrop-blur`），宿主项目必须配置 Tailwind 扫描到该库：
   - Tailwind v4（`globals.css`）：使用 CSS `@source`，指向 `node_modules/orbcafe-ui/dist` 的正确相对路径。
   - Tailwind v3（`tailwind.config.js`）仅作为遗留兼容：`content: ["./node_modules/orbcafe-ui/dist/**/*.{js,mjs}"]`。
2. **Provider 基线**：V2 是 MUI-free。`PAppPageLayout` 内部已渲染 `OrbisModeProvider`；`GlobalMessage` 仍由宿主应用只挂载一次。
3. **CSS 基线**：全局 CSS 必须 `@import "orbcafe-ui/styles.css";` 一次（ORBIS 自写样式，含 `orb-*` 类与暗色变量）。
4. **Examples 来源**：npm 包不包含 `examples/`。当前项目没有 `examples/` 时，查阅 ORBCAFE GitHub 仓库或本地 checkout。
5. **依赖检查**：先看 `package.json`，缺失或不兼容时再安装。

## Output Contract

0. `Scope`：明确目标是 Pad/iPad；手机、小屏或移动应用只输出 `doushabao-ui` 转向说明，不输出 ORBCAFE UI 实现。
1. `Mode`：`Hook-first`。
2. `Chosen module`：Pad Workflow，以及是否需要 `PSmartFilter`/`PNumericKeypad`/`PBarcodeScanner`。
3. `Minimal implementation`：`PAppPageLayout + PNavIsland + PWorkloadNav + PTable`，涉及数量录入/扫码时补充 `PNumericKeypad`/`PBarcodeScanner`。
4. `Verify`：只在 Pad/iPad 横竖屏尺寸验证交互，不追加手机或小屏测试；检查 `PTable` 工具栏对齐、variant/layout 保存加载、Value Help 字段写回稳定 key、小键盘提交回写、扫码回调更新业务状态。
5. `Troubleshooting`：至少覆盖遮挡点击的覆盖层、orientation 引起的 hydration 抖动、keypad 只更新输入框未写回数据源、摄像头未释放这几类问题。

## See Also
- [Layout Patterns](./references/patterns.md) 提供完整代码模板与层级结构。
- [Guardrails](./references/guardrails.md) 提供 Pad 设备边界、横竖屏约束与触摸目标规则。
