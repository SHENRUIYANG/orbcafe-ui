# orbcafe-stdreport-workflow README

## 目标

这个 skill 用于在 ORBCAFE 项目里快速、稳定地实现标准报表/列表页：筛选、表格、分页、变体（Variant）与布局（Layout）持久化、Value Help/F4 查找、quickCreate/quickEdit/quickDelete。

- `useStandardReport` + `CStandardPage`（Hook-first 默认入口）
- `CTable`（table-only 场景）
- `CSmartFilter`（含 `type: 'value-help'` 字段）
- Variant/Layout 持久化
- quickCreate/quickEdit/quickDelete

## 一分钟上手

1. 先看 `references/component-selection.md`，用决策树选 `integrated` 还是 table-only。
2. 直接套 `references/recipes.md` 里的 Recipe 1（integrated report page）。
3. 按 `references/guardrails.md` 强制检查 identity（`metadata.id`/`id`/`appId`）、分页、variant/layout。
4. 涉及 F4/value help 时，同时读取 `skills/orbcafe-ui-component-usage/references/value-help.md`。
5. 用 examples（`examples/app/std-report/page.tsx`）对照验证。

## 场景到组件

- 完整报表页（筛选 + 表格 + 持久化）：`useStandardReport` + `CStandardPage mode="integrated"`
- 只需要表格，不需要 SmartFilter variant：`CTable` 直接用
- 只需要筛选栏 + 自定义表格编排：`CSmartFilter` + 自管状态 + `CTable`（进阶用法，需自行打通 variant/layout 联动）
- Customer/Material/WorkCenter 等主数据查找字段：`CSmartFilter` 字段 `type: 'value-help'` + `valueHelp` 配置，不要另建游离弹窗
- 表格内快速增删改：`CTable`/`CStandardPage` 的 `quickCreate`/`quickEdit`/`quickDelete`

## Identity 与持久化契约

- 必须保持同一业务身份：`metadata.id`（`useStandardReport`）= `CStandardPage.id` = `filterConfig.appId` = `tableProps.appId`；多表页面才用不同 `tableKey` 隔离。
- 标准流程：先在表格工具栏保存 Layout，再保存 Variant——Variant 里的 `layoutRefs` 指向已保存的 Layout id，顺序反了会导致 `layoutId=null`。
- 没有 `serviceUrl`/`variantService` 时自动 fallback 到 localStorage：`orbcafe.variants.${appId}.${tableKey}` 与 `orbcafe.layouts.${appId}.${tableKey}`。

## 推荐示例

- `examples/app/_components/StdReportExampleClient.tsx`
- `examples/app/std-report/page.tsx`

## 常见"没效果"排查

- 忘记设置 `metadata.id`/`id`/`appId` 中的任意一个，导致 variant/layout 读写对不上。
- `CSmartFilter` 和 `CTable` 分离渲染却没有手动打通 `appId`/`tableKey`/layout 联动，导致 variant 只存了筛选值。
- 先保存 Variant、后保存 Layout，导致 `layoutRefs` 为空。
- Value Help 字段手写外部弹窗而不是走 `type: 'value-help'`，导致选中值进不了 filter 状态、variant 保存不到。
- 本地 `file:..` 依赖场景下没有先 `npm run build` 就跑 `examples`。
- 从 `src/components/*` 而不是 `orbcafe-ui` 包入口导入，导致类型或构建产物不一致。
