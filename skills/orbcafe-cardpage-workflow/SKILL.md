---
name: orbcafe-cardpage-workflow
description: Build ORBCAFE store/catalog-style card pages with CCardPage, CCardGrid, CCardDetailPanel, CSmartFilter, and useCardPage using official Next.js examples-proven patterns. Use for app-store-like catalogs, card grids with icon/title/3-line description, centered detail panels, view-details/download actions, or filter + card page orchestration, especially when prior implementation had no visible effect.
---

# ORBCAFE CardPage Workflow

## Workflow

1. 执行 `skills/orbcafe-ui-component-usage/references/integration-baseline.md`：默认按 Next.js App Router + 官方 examples 接入。
2. 先对照 `skills/orbcafe-ui-component-usage/references/module-contracts.md`，确认这是 `Hook-first` 模块。
3. 用 `references/component-selection.md` 选择 integrated 卡片页、grid-only 或 standalone 详情面板。
4. 基于 `references/recipes.md` 生成最小可运行代码。
5. 用 `references/guardrails.md` 强制检查 identity、variant 持久化、详情面板开关、图标暗色模式、i18n。
6. 按官方 Next examples 补齐验收与排障步骤；非 Next 项目先标记为偏离基线，不要静默改成 Vite/CRA 范式。

## Canonical Setup

先检查宿主 `package.json`，缺失或版本不兼容时才安装：

```bash
npm install orbcafe-ui
# ORBCAFE UI v2 是 MUI-free；不要安装 @mui/*、@emotion/*、lucide-react。
# 组件使用 Tailwind utility classes，宿主需要 Tailwind v4：
npm install -D tailwindcss @tailwindcss/postcss
```

官方 examples 不随 npm 包发布。消费项目没有 `examples/` 时，到 ORBCAFE GitHub 仓库或本地 ORBCAFE 源码仓库对照。

本仓库联调时，严格按官方顺序：

```bash
# repo root
npm run build

cd examples
npm install
npm run dev
```

参考实现：
- `examples/app/_components/CardPageExampleClient.tsx`
- `examples/app/card-page/page.tsx`

## Mandatory rules

- 始终设置 identity：
  - `metadata.id` for `useCardPage`
  - `id` for `CCardPage`
  - `appId` for standalone `CSmartFilter`
- 默认优先 `useCardPage + CCardPage`（Hook-first），`<CCardPage {...pageProps} />` 直接渲染。
- `metadata.id`、`CCardPage.id`、`filterConfig.appId` 必须保持同一个业务身份；CardPage 没有表格 layout，只有 SmartFilter variant（筛选值 + 可见字段）。
- 详情视图默认走内建 `CCardDetailPanel`（居中浮现卡片，Portal 渲染到 `document.body`），`detailPanel` 默认开启；不要在外层再手写一个重复的详情弹窗。
- 需要路由跳转式详情页时，显式 `detailPanel={false}` 并在 `onDetailClick` 里跳转；不要两者同时启用。
- 卡片数据遵循 `CCardItem`：`{ id, title, description?, icon?, iconNode?, meta? }`；附加业务字段直接平铺在 item 上，详情面板会自动以 label/value 列出原始类型附加字段。
- `fetchData` 返回 `{ rows, total }`，与 `useStandardReport` 完全一致的契约。
- 始终从 `orbcafe-ui` 包入口导入，不导入私有 `src/components/*`。
- 需要 locale 时优先用 `CAppPageLayout.locale` 或 `OrbcafeI18nProvider`。

## Variant Persistence Canonical Flow

- 标准入口：`useCardPage({ metadata, tableKey?, serviceUrl?, variantService? })`，直接渲染 `<CCardPage {...pageProps} />`。
- `CSmartFilter` variant 保存筛选值和筛选栏可见字段：`filters: [{ scope: tableKey, filters: { values, visibleFields } }]`。
- CardPage 没有 CTable，因此没有 Layout/`layoutRefs` 概念；variant 只承载筛选状态，保存即可生效，不需要"先存 Layout 再存 Variant"的顺序。
- 如果没有 `serviceUrl` 或 `variantService`，组件使用 localStorage fallback：`orbcafe.variants.${appId}.${tableKey}`。
- 若接后端，`serviceUrl` 只需支持 `/api/variants`；若用 `variantService`，必须实现 `getVariants/saveVariant/deleteVariant/setDefaultVariant` 并保留 `appId/tableKey` 参数。

## Examples-Based Experience Summary

- 卡片简介固定 3 行截断（超出省略号），不要试图用 sx 覆盖成不定行数；长文案放到详情面板。
- `description` 为空时卡片仍占位对齐（渲染 NBSP），不要传 `undefined` 后期望卡片等高失效。
- 图标默认使用 `icon`（SAP 图标名），组件内部已按 `useOrbMode` 处理暗色模式可见性；自定义 `iconNode` 时业务方需要自己保证暗色模式对比度。
- 详情面板默认列出 `CCardItem` 上所有原始类型（string/number/boolean）附加字段并美化字段名（`releaseDate` → "Release Date"）；复杂结构字段用 `renderDetailContent` 自定义。
- `onDetailClick` 在内建面板打开时也会触发，可用于埋点；`onDownloadClick` 同时服务卡片按钮和面板底部按钮。
- 页面放在固定高度容器（例如 `calc(100vh - 120px)`）可避免页面整体滚动抖动。

## Output Contract

0. `Mode`: `Hook-first`.
1. `Pattern`: integrated card page / grid-only / standalone detail panel.
2. `Code`: paste-ready, imports from `orbcafe-ui` only.
3. `Data contract`: items (CCardItem)/filters/fetchData `{ rows, total }` shape.
4. `Verify`: 启动页面、筛选生效（Go）、variant 保存/加载、查看详情弹出居中详情卡片（Esc/遮罩/关闭按钮均可关闭）、下载回调触发、暗色模式图标可见。
5. `Troubleshooting`: 至少包含以下排查项：
   - 忘记 `metadata.id/id/appId` 导致 variant “没效果”
   - 内建 `detailPanel` 开着又手写外部详情弹窗，出现两套详情 UI
   - 详情面板被页面容器裁剪：不要在页面内自己用 `position: fixed` 包一层，面板必须走组件内建 Portal
   - 暗色模式下自定义 `iconNode` 看不见：未做 mode-aware 颜色
   - 没有先 `npm run build`（本地 `file:..` 依赖场景）
   - 错误导入路径、未按 Next examples 建立 Provider/Client 边界导致组件不渲染
