---
name: orbcafe-stdreport-workflow
description: Build ORBCAFE standard report/list pages with CStandardPage, CTable, CSmartFilter, CValueHelp/F4 search help fields, useStandardReport, persistence, and quickCreate/quickEdit/quickDelete using official Next.js examples-proven patterns. Use for filters, value help lookup, pagination, variants/layout, or report orchestration, especially when prior implementation had no visible effect.
---

# ORBCAFE StdReport Workflow

## Workflow

1. 执行 `skills/orbcafe-ui-component-usage/references/integration-baseline.md`：默认按 Next.js App Router + 官方 examples 接入。
2. 先对照 `skills/orbcafe-ui-component-usage/references/module-contracts.md`，确认这是 `Hook-first` 模块。
3. 用 `references/component-selection.md` 选择 `integrated` 或 table-only。
4. 基于 `references/recipes.md` 生成最小可运行代码。
5. 用 `references/guardrails.md` 强制检查 identity、分页、SmartFilter variant、CTable layout 持久化、i18n。
6. 按官方 Next examples 补齐验收与排障步骤；非 Next 项目先标记为偏离基线，不要静默改成 Vite/CRA 范式。

## Canonical Setup

先检查宿主 `package.json`，缺失或版本不兼容时才安装：

```bash
npm install orbcafe-ui @mui/material@^7.3.9 @mui/icons-material@^7.3.9 @mui/x-date-pickers@^8.27.2 @emotion/react@^11.14.0 @emotion/styled@^11.14.1 dayjs@^1.11.20 lucide-react@^0.575.0 tailwind-merge@^3.5.0 clsx@^2.1.1 class-variance-authority@^0.7.1 @radix-ui/react-slot@^1.2.4
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
- `examples/app/_components/StdReportExampleClient.tsx`
- `examples/app/std-report/page.tsx`

## Mandatory rules

- 始终设置 identity：
  - `metadata.id` for `useStandardReport`
  - `id` for `CStandardPage`
  - `appId` for standalone `CTable` / `CSmartFilter`
- 默认优先 `useStandardReport + CStandardPage mode="integrated"`。
- 对标准报表，不要手写分离的 `CSmartFilter + CTable` 联动；`integrated` 模式让 `CTable` 能把当前 layout 传给 SmartFilter variant 管理器。
- `metadata.id`、`CStandardPage.id`、`filterConfig.appId`、`tableProps.appId` 必须保持同一个业务身份；除非多表页面要用不同 `tableKey` 做隔离。
- 需要 SAP F4/Search Help 风格字段选择时，使用 `CSmartFilter` 字段的 `type: 'value-help'` 或 `isValueHelp: true` + `valueHelp` 配置；不要手写一个游离在 SmartFilter 外面的 lookup 弹窗。
- 始终从 `orbcafe-ui` 包入口导入，不导入私有 `src/components/*`。
- 需要 locale 时优先用 `CAppPageLayout.locale` 或 `OrbcafeI18nProvider`。
- `quickCreate/quickEdit/quickDelete` 开启时，始终给出 async 回调并写清 payload 结构。
- 后端不支持 `limit=-1` 时，在 `fetchData` 层显式转换，不要把 ALL 模式直接透传。

## Variant/Layout Persistence Canonical Flow

- 标准入口：`useStandardReport({ metadata, tableKey?, serviceUrl?, variantService? })`，直接渲染 `<CStandardPage {...pageProps} />`。
- `CSmartFilter` variant 保存筛选值和筛选栏可见字段：`filters: [{ scope: tableKey, filters: { values, visibleFields } }]`。
- `CTable` layout 保存表格状态：`visibleColumns`、`order`、`orderBy`、`grouping`、`columnWidths`、`showSummary`、`summaryColumns`。
- Variant 的 layout 部分保存的是 `layoutRefs: [{ tableKey, layoutId }]`，不是随手复制一份表格状态；因此标准用户流程是先在表格工具栏保存 Layout，再保存 Variant。
- 如果没有 `serviceUrl` 或 `variantService`，组件使用 localStorage fallback：`orbcafe.variants.${appId}.${tableKey}` 和 `orbcafe.layouts.${appId}.${tableKey}`。
- 若接后端，`serviceUrl` 需要同时支持 `/api/variants` 与 `/api/layouts`；若用 `variantService`，必须实现 `getVariants/saveVariant/deleteVariant/setDefaultVariant` 并保留 `appId/tableKey` 参数。

## Examples-Based Experience Summary

- 先用 `useStandardReport` 产出 `pageProps`，再注入 `tableProps.quick*` 扩展，稳定且可维护。
- 通过 `metadata.variants` 提供默认视图，再让用户落地保存，能减少首次空白配置。
- 默认 variant 建议使用 `scope: 'Both'`，并按 tableKey 保存 scoped filters；不要只写根级 `{ status: 'active' }` 后期待多表页面也稳定。
- 列渲染尽量只做展示转换，筛选值保持机器稳定值（例如 `active/pending/inactive`）。
- Value Help 筛选字段保持机器稳定 key（例如 customerId/materialId/workCenter），只本地化 dialogTitle、列标题和 label。
- 表格放在固定高度容器（例如 `calc(100vh - 120px)`）可避免页面整体滚动抖动。

## Output Contract

0. `Mode`: `Hook-first`.
1. `Pattern`: integrated page or table-only.
2. `Code`: paste-ready, imports from `orbcafe-ui` only.
3. `Data contract`: columns/filters/rows/fetchData shape.
4. `Verify`: 启动页面、筛选生效、分页切换、quick 操作触发、刷新后配置保留。
5. `Troubleshooting`: 至少包含以下排查项：
   - 忘记 `metadata.id/id/appId` 导致变体/布局“没效果”
   - 分离渲染 `CSmartFilter` 和 `CTable` 导致 variant 只保存筛选、不知道当前 table layout
   - 保存 Variant 前没有先保存 Layout，导致 `layoutRefs` 为空或 `layoutId=null`
   - Value Help 字段手写外部弹窗，导致 SmartFilter variant 保存不到选中值
   - 没有先 `npm run build`（本地 `file:..` 依赖场景）
   - 错误导入路径、未按 Next examples 建立 Provider/Client 边界导致组件不渲染
