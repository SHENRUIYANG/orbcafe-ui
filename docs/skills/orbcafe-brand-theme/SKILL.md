---
name: orbcafe-brand-theme
description: Switch ORBCAFE UI to a brand theme from the developer's local Open Design app (colors + fonts), with zero manual export. Use when the user mentions 切换品牌/主题/配色/字体, "用 Open Design 的主题", "换成 XX 公司风格", brand theme, apply preset, or asks whether the UI can match another company's branding.
---

# ORBCAFE Brand Theme（Open Design 直连）

ORBCAFE UI 默认即 ORBIS 风格，无需任何设置。若开发者本机装了 Open Design，
`orbcafe-theme` CLI 能直接读取其品牌预设（颜色 + 字体）生成主题包——**没有手动导出步骤**。

## Workflow

1. **发现**：`npx orbcafe-theme list --json`
   - 报 Open Design not found，或返回空预设 → 告知用户默认 ORBIS 主题已生效；如果只需要库内置主题，可直接导入 `orbcafe-ui/themes/orbis.css` 或 `orbcafe-ui/themes/nvidia.css`，不需要安装 Open Design。只有需要本机品牌预设时，才建议安装 Open Design 并创建设计系统。
   - 有预设 → 把品牌列表（title + slug）交给用户选择；用户已点名品牌则直接匹配 slug。
2. **应用**：`npx orbcafe-theme apply <slug> --json`
   - 在消费者项目根目录生成 `orbcafe-theme/<slug>.css`（+ `<slug>/fonts/*` + `<slug>.tokens.mjs/.ts`）。
   - 只映射颜色与字体；用户明确要求连圆角等形态也跟随品牌时才加 `--full`。
   - JSON 里的 `importLine` 就是要接的 import；`warning`（如亮色系 primary 白字对比度）必须原样转达用户。
3. **接线**：在样式入口把生成的 import 加在基础样式**之后**：
   - Next.js App Router：`app/layout.tsx`（或 `app/globals.css` 用 `@import`）
   ```ts
   import 'orbcafe-ui/styles.css'
   import '../orbcafe-theme/<slug>.css'   // 路径按实际入口位置调整
   ```
   - 已存在旧的主题 import → 替换而非叠加（多个主题包共存是未定义行为）。
4. **验证**：`npm run build` 通过；明暗两种模式各目检一次主按钮/导航岛/表格选中行/链接色；
   字体检查：元素计算样式的 font-family 首项 = 品牌字体，且网络面板字体文件 200（@font-face url 是相对主题 CSS 的）。
5. **JS 侧 token**（图表、canvas 等读不了 CSS 变量的场景）：
   `import ORB_TOKENS from './orbcafe-theme/<slug>.tokens.mjs'`（默认导出 `{ light, dark }`）。

## Rules

- 不要手改 `orbcafe-theme/` 下的生成文件；预设更新后重跑 `apply` 覆盖。
- 不要把 `orbcafe-theme/` 加进 .gitignore 之外提交策略由用户定；生成物可安全删除重建。
- 主题包是纯 CSS 变量覆盖层，不需要额外 provider，也不影响 `OrbisModeProvider` 的明暗切换。
- 没有 Open Design 的开发者想要预置品牌：可用库内置的 `orbcafe-ui/themes/orbis.css`、`orbcafe-ui/themes/nvidia.css`（示例包，详见 docs/guides/brand-theming.md）。
