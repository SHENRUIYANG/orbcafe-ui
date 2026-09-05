# orbcafe-cardpage-workflow README

## 目标

这个 skill 用于在 ORBCAFE 项目里快速、稳定地实现商店/目录式卡片页面：上方 SmartFilter 筛选栏 + 下方卡片网格（图标 + 标题 + 3 行简介 + 查看详情/下载），以及居中浮现的详情卡片。

- `useCardPage` + `CCardPage`（Hook-first 默认入口）
- `CCardGrid` / `CCardGridCard`（grid-only 场景）
- `CCardDetailPanel`（内建居中详情卡片，也可 standalone 受控使用）
- `CSmartFilter` variant 持久化（仅筛选，无表格 layout）

## 一分钟上手

1. 先看 `references/component-selection.md`，用决策树选 integrated 卡片页、grid-only 还是 standalone 详情面板。
2. 直接套 `references/recipes.md` 里的 Recipe 1（integrated card page）。
3. 按 `references/guardrails.md` 强制检查 identity（`metadata.id`/`id`/`appId`）、variant 持久化、`detailPanel` 开关。
4. 用 examples（`examples/app/card-page/page.tsx`）对照验证。

## 场景到组件

- 完整卡片目录页（筛选 + 卡片网格 + variant）：`useCardPage` + `CCardPage`
- 只需要卡片网格，嵌入自定义页面：`CCardGrid` 直接用（内建详情面板默认开启）
- 路由跳转式详情：`CCardGrid detailPanel={false}` + `onDetailClick` 里跳转
- 已有自己的列表、只想要详情卡片：`CCardDetailPanel` standalone 受控使用（`item` + `open` + `onClose`）
- 密集数据报表（行列、排序、分组、分页）：不要用 CardPage，走 `orbcafe-stdreport-workflow`

## Identity 与持久化契约

- 必须保持同一业务身份：`metadata.id`（`useCardPage`）= `CCardPage.id` = `filterConfig.appId`。
- CardPage 只有 SmartFilter variant（筛选值 + 可见字段），没有 CTable Layout，也没有 `layoutRefs`。
- 没有 `serviceUrl`/`variantService` 时自动 fallback 到 localStorage：`orbcafe.variants.${appId}.${tableKey}`。
- 详情面板通过 Portal 渲染到 `document.body`——页面容器（如 `CPageTransition`）带 `will-change: transform`，页面内手写 `position: fixed` 会被裁剪；用组件内建面板就不会有这个问题。

## 推荐示例

- `examples/app/_components/CardPageExampleClient.tsx`
- `examples/app/card-page/page.tsx`

## 常见"没效果"排查

- 忘记设置 `metadata.id`/`id`/`appId` 中的任意一个，导致 variant 读写对不上。
- `detailPanel` 默认开启，又在外层手写了一个详情弹窗，点击后出现两套 UI；要自定义就显式 `detailPanel={false}`。
- 期望"查看详情"跳转路由但什么都没发生：`onDetailClick` 只是回调（面板仍会打开），跳转需要 `detailPanel={false}`。
- 暗色模式下自定义 `iconNode` 看不见：内建 `icon` 已做 mode-aware 颜色，自定义节点需要自己处理。
- 本地 `file:..` 依赖场景下没有先 `npm run build` 就跑 `examples`。
- 从 `src/components/*` 而不是 `orbcafe-ui` 包入口导入，导致类型或构建产物不一致。
