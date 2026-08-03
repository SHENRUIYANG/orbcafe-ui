# ORBCAFE × ORBIS 视觉改造 + MUI 完全移除实施计划

> 依据：`ORBCAFE-ORBIS-visual-adaptation.zip`（design-handoff + orbis-reference.css + 3 个 reference HTML）
> 决策已确认：① Navigation Island 只换颜色+字体（玻璃效果/结构/交互零改动）② 彻底移除 @mui/material 及全部 MUI peer deps ③ 全量组件改造

---

## 1. 现状盘点（为什么这样规划）

| 现状 | 数据 |
|---|---|
| src 中引用 @mui 的文件 | **95 / 197** |
| MUI peerDependencies（消费者强制安装） | `@mui/material` `@mui/icons-material` `@mui/x-date-pickers` `@emotion/react` `@emotion/styled` |
| MUI 用量 Top | Box(46) Typography(38) Stack(20) Paper(16) IconButton(15) —— 大头是浅层布局包装 |
| 深度依赖点 | CTable(表格族)、CDateRangePicker/CDatePicker(x-date-pickers)、Dialog(2)、Select(3)、Menu(2)、Tooltip(5)、Tabs(1) |
| MUI 图标 | ~100 处 import（`lucide-react` 已是依赖，Nav Island 在用） |
| 主题 | 两处临时 `createTheme`（CAppPageLayout / PAppPageLayout），仅设 palette.mode；另有硬编码 `#1976d2/#90caf9/#93c5fd/#060913…` 散落各处 |
| 公开 API 破坏面 | `Kanban/types.ts` 等暴露 `SxProps<Theme>`；CButton 等 extends MUI Props → **必须 major 版本升级（→ 2.0.0）** |
| 已有非 MUI 基础 | Nav Island 纯 Tailwind+lucide；AgentUI 用 CSS modules + next-themes；examples 用 Tailwind v4 `@source` 扫描 dist |
| 意外收获 | **orbis-reference.css 已给出全部组件级 CSS**（.btn/.inp/.chk/.rdo/.sw/.chip/.badge/.alert/.prog/.skel/.tbl/.card + 双模式 token）→ 直接改编为库样式表，像素级保真且工作量锐减 |

## 2. 目标架构（四层）

```
src/
├─ config/orbis-tokens.ts        # TS 令牌：light/dark 双模式 hex 表（图表等 JS 场景用）
├─ styles/orbis.css              # 唯一样式真相源：token 变量 + 组件类（改编自 orbis-reference.css）
├─ lib/theme/
│   ├─ OrbisModeProvider.tsx     # 模式提供者：documentElement 上切 .orb-dark + data-orb-mode + color-scheme
│   ├─ hooks.ts                  # useOrbMode() / useOrbTokens()（JS 侧读 hex，供 SVG/canvas 图表）
│   └─ orbAlpha.ts               # 替代 MUI alpha() 的小工具（8位hex）
├─ components/Atoms/             # 原语层重写（保留现有文件名/导出名，内部去 MUI）
│   ├─ (新增) CStack.tsx CAlert.tsx CSkeleton.tsx CProgress.tsx CAvatar.tsx
│   ├─ (新增) CDialog.tsx CPopover.tsx CDropdownMenu.tsx CTooltip.tsx CTabs.tsx
│   ├─ (新增) CCalendar.tsx      # dayjs 月历网格（x-date-pickers 替代核心）
│   └─ CButton/CTextField/CSelect/CCheckbox/CRadioGroup/CSwitch/CChip/CBadge/…（去 MUI 重写）
└─ lib/hooks/useMediaQuery.ts    # matchMedia 小钩子（替 MUI useMediaQuery）
```

**样式机制决策**：原语全部用 `orbis.css` 中的类（`.orb-btn` `.orb-inp` `.orb-chip`…，直接移植 reference CSS，命名加 `orb-` 前缀防冲突）；**不再依赖消费者 Tailwind 编译原语**（现有 Tailwind 类仅保留在 Nav Island 等既有代码里）。CSS 变量定义在 `:root` / `.orb-dark`，门户类组件（Dialog/Popover 渲染到 body）天然继承，无需 JS 分支。

**包发布决策**：
- `orbis.css` 通过 tsup `publicDir` 拷入 `dist/orbis.css`；消费者 `import 'orbcafe-ui/dist/orbis.css'`（文档写明）
- `package.json`: `sideEffects` 改为 `["**/*.css"]`（否则 CSS import 会被消费者 bundler tree-shake 掉）
- 删除 5 个 MUI peer deps + devDeps 中残留；新增 4 个 Radix 依赖（headless、无 CSS-in-JS 运行时）：`@radix-ui/react-dialog` `react-popover` `react-dropdown-menu` `react-tooltip`（约 1/7 的体积换 MUI+Emotion）
- `lucide-react` 已是依赖，图标零新增成本
- 版本 **1.4.6 → 2.0.0**（破坏性变更）

## 3. 设计令牌（从 orbis-reference.css 原样落地）

| 令牌 | Light | Dark |
|---|---|---|
| canvas / surface | `#ffffff` / `#f5f5f5` | `#01091a` / `#0a1526` |
| fg / muted / border | `#555` / `#8c8c8c` / `#dbdbdb` | `#fff` / `rgba(255,255,255,.7)` / `rgba(255,255,255,.12)` |
| primary | `#154194` | `#154194`（填充）/ 链接 `#91a8d1` |
| primary-50/100/200/300/600/700 | `#f0f3f9 #dce4f1 #bac9e3 #91a8d1 #0f3276 #08255a` | OKLCh 混合（按 reference color-mix 公式） |
| signal orange | `#fc4c02` — **仅 ≤2px 信号用途**（today 线、风险帽、login 装饰线、alert 左边条） | 同 |
| error | `#ac3101`（橙+黑25%）bg `#fbf1ee` | `#d53f01` |
| 半径/阴影/动效 | 10px / shadow-1·2·3（navy 色调）/ 0.2s ease | 10px / 黑色调阴影 |
| 字体 | **Montserrat**（300 body / 500 label / 600 heading / 700 极少强调），数字 `tabular-nums` | 同 |
| 状态纪律 | success/info=蓝，warning=橙，error=深橙，**无绿无青无紫**；图表系列序：primary→p300→muted→p700 | 同 |

派生色一律用 reference 中的 `color-mix(in oklch, …)` 公式（现代浏览器均支持），不手写近似 hex。

## 4. MUI → 新原语 映射表（codemod 规则）

| MUI | 替换 | 说明 |
|---|---|---|
| `Box` | `<div>` + style/className | 机械替换；`sx={{p:2}}` → `style={{padding:16}}`（MUI 间距 ×8） |
| `Stack spacing={n} direction` | `CStack`（内部原语，flex + gap n×8px） | 保留调用形态，降迁移成本 |
| `Paper elevation` | `CPaper` → `.orb-card` / `.orb-card-raised` | |
| `Typography` | `CTypography` → span/p/h1-h4 + token 字号 | variant 映射到 type scale（32/24/19/16/14/12/11） |
| `Button variant/size` | `CButton` → `.orb-btn{-primary,-secondary,-ghost,-neutral}{,-lg,-sm}` + loading 态（spinner+文案） | 公开 props 重定义为 `variant:'primary'\|'secondary'\|'ghost'\|'neutral'` |
| `IconButton` | `CIconButton` → `.orb-icon-btn` | |
| `TextField/InputBase/InputAdornment/FormControl(Label)/InputLabel/FormHelperText` | `CTextField` 重写：`.orb-fld` label+`.orb-inp`+msg；44px 标准 / 36px dense；focus=primary 边+3px ring；error 族=橙系 | adornment 用绝对定位 slot |
| `Select/MenuItem` | **原生 `<select class="orb-inp">`**（reference 官方做法，自定义 chevron） | 个别需富内容下拉的点位用 CPopover 自绘 |
| `Checkbox/Radio/Switch` | 原生 input + reference 的 `.orb-chk/.orb-rdo/.orb-sw` CSS（reference 已含 SVG 对勾） | |
| `Chip/Badge/Avatar` | `.orb-chip{-blue,-gray,-orange,-outline}` / `.orb-badge` / `.orb-avatar` | tone 映射：success/info→blue、warning→orange、error→orange 深 |
| `Alert/Snackbar` | `CAlert`（`.orb-alert{-info,-success,-warning,-error}` 含 2px 左条）；`CSnackbar` 自绘（.orb-snack） | |
| `LinearProgress/CircularProgress/Skeleton` | `.orb-prog` / `.orb-spin`（reference spinner）/ `.orb-skel` | |
| `Dialog(+Title/Content/Actions)` | `CDialog` = `@radix-ui/react-dialog` + orbis 类 | focus trap/portal/ESC 由 Radix 保证 |
| `Popover/Popper/ClickAwayListener` | `CPopover` = `@radix-ui/react-popover` | |
| `Menu/MenuList` | `CDropdownMenu` = `@radix-ui/react-dropdown-menu` | CMenu 保留导出名 |
| `Tooltip` | `CTooltip` = `@radix-ui/react-tooltip` | |
| `Tabs/Tab` | `CTabs` 自绘（2px primary 下划线，reference 样式） | |
| `Table 族/TableSortLabel/TablePagination` | 原生 `<table class="orb-tbl">` + 排序按钮 + 自绘 pager（reference 有 .pager 样式） | CTable 内部重写，对外 props 不变 |
| `Collapse/Fade/Grow/Slide` | CSS transition / framer-motion（已是依赖） | |
| `x-date-pickers` | `CCalendar`（dayjs 月网格）→ 重写 `CDatePicker`（输入+popover 日历）与 `CDateRangePicker`（双月/范围高亮，沿用现有交互逻辑） | 保留 Dayjs 作为值类型，调用方改动最小 |
| `useTheme` | `useOrbMode()` / `useOrbTokens()` | `theme.palette.mode` 分支 → CSS 变量或 hook |
| `useMediaQuery` | `lib/hooks/useMediaQuery.ts` | |
| `alpha(color, a)` | `orbAlpha(hex, a)`（8位hex）或 CSS `color-mix` | |
| `styled()` | 普通组件 + orbis 类 | |
| `createTheme/ThemeProvider/CssBaseline/GlobalStyles` | `OrbisModeProvider`（CAppPageLayout/PAppPageLayout/Auth 内部接入） | |
| `@mui/icons-material/*` | lucide-react（映射表见 §5） | |

## 5. 图标映射规则（MUI → lucide）

高频：`Close→X` `Search→Search` `Save→Save` `Delete/DeleteOutline→Trash2` `Add/AddRounded→Plus` `DragIndicator→GripVertical` `KeyboardArrowDown/Up/Left/Right→ChevronDown/Up/Left/Right` `KeyboardDoubleArrow*→Chevrons*` `ExpandMore→ChevronDown` `Check*→Check` `CheckCircle→CheckCircle2` `Error→AlertCircle` `Warning→AlertTriangle` `Info→Info` `Settings→Settings` `ViewColumn→Columns3` `Star/StarBorder→Star` `AccountTree→GitBranch`(或 Network) `Functions→Sigma` `Send→SendHorizontal` `Mic→Mic` `Menu→Menu` `Logout→LogOut` `LightMode/DarkMode→Sun/Moon` `FilterList→ListFilter` `QrCodeScanner→ScanLine` `Backspace→Delete` `CalendarMonth→Calendar` `CloudUpload→UploadCloud` `ContentCopy→Copy` `Edit→Pencil` `Download→Download` `Person→User` `Lock→Lock` `Mail→Mail` `Visibility(Off)→Eye(Off)` `Translate/Language→Languages/Globe` `Sort/ArrowUpward/Downward→ArrowUp/Down` `ArrowForward/RightAlt→ArrowRight` `PlayArrow→Play` `UnfoldMore/Less→ChevronsUpDown/ChevronsDownUp` `ClearAll→XCircle` `Camera→Camera` `Desktop→Monitor` `Layers→Layers` `Insights→TrendingUp` `TableRows→Rows3` `Hardware→Wrench` `VpnKey→KeyRound` `Splitscreen→SplitSquareHorizontal` `InsertDriveFile→FileText`。lucide 风格（1.5-2px 线性）正好匹配 reference 内嵌 SVG 的风格。遇到无语义对应的，按上下文选最近似 lucide 图标。

## 6. 阶段拆解（每阶段结束跑 `npm run build` 保绿）

- **Phase A — 地基**：`orbis-tokens.ts` + `styles/orbis.css`（token+全部组件类，改编 reference）+ `OrbisModeProvider/hooks` + Atoms 全量重写 + 新原语（CStack/CAlert/CDialog/CPopover/CDropdownMenu/CTooltip/CTabs/CCalendar/CSkeleton/CProgress/CAvatar）+ `useMediaQuery` + `orbAlpha`。tsup `publicDir` + package.json 骨架（先加 Radix 依赖，MUI 依赖最后阶段才删，保证中间态可编译——不，MUI 一删全局红，所以 **Phase A 完成后立即删 MUI 依赖，之后每个 Phase 修到 build 绿为止**）。
- **Phase B — Molecules**：CMessageBox、CValueHelp、CFilterField、CStatusBadge、CList、CDateRangePicker、CVariantManagement、CLayoutManagement、CAppHeaderActions。
- **Phase C — StdReport**：CTable（935 行，原生 table 重写，保留 props/交互）、CTableHead/Footer/Toolbar/Menu/Mobile、CSmartFilter、CStandardPage、CPageLayout、CVariant/LayoutManager。对照 reference §6 表格样式（表头 11px caps surface 底、行 hover、选中行 p50、数字右对齐 tabular-nums、状态 chip）。
- **Phase D — GraphReport**：全部 chart 卡片去 MUI；系列色改 primary→p300→muted→p700；grid/axis 用 `--chart-grid/--chart-text`；KPI 卡对照 reference stats 样式。
- **Phase E — Kanban + Tree + Planning**：Kanban 列/卡（surface 列、canvas 卡、拖拽 2px primary outline、超 WIP badge 转 error 色）；Gantt 条色（done=muted / run=primary / plan=p200+p700 字 / risk=primary+2px 橙帽、今日线 2px 橙、里程碑 12px 菱形）；CTreeComp。
- **Phase F — PageLayout + Pad + AINav**：CAppPageLayout/PAppPageLayout 删 createTheme → OrbisModeProvider；Pad 触控规格（48px 输入、52px 行、56px 扫码钮、keypad≥52px）对照 reference §4。
- **Phase G — AgentUI + CustomizeAgent + DetailInfo**：聊天气泡（用户 p50/助手 surface）、状态行 11px muted+primary spinner、流式 caret 2px primary；AIBrowserGlow → **agent 运行时 viewport 2px primary 边线**（reference 明确要求替换 glow）；CSS modules 内颜色换 token。
- **Phase H — Auth 登录页**：CAuthPage 按 login reference 重写视觉：桌面 5:7 双栏、品牌面板 `#01091a` + ±45° 菱形格栅（64px pitch，白 5%）+ 3 个 45° 旋转方块（1px 白边 9–20% alpha，一个 primary 35% 填充）+ 唯一 2px×48px 橙色装饰线 + "We digitalize you."；<900px 折叠为品牌横条（56px pitch）；表单白面、44px 输入、focus 3px ring、error alert 橙系、loading=spinner+"Signing in…"；保留全部现有 props/回调/mode 逻辑。
- **Phase I — Navigation Island 换色**（仅 ~12 处）：`#1976d2→#154194`、`#90caf9→#91a8d1`、透明派生用 Tailwind `/10` `/14` 写法或 `color-mix`；字体随全局 Montserrat。**结构、玻璃效果、动画、交互一律不碰。**
- **Phase J — 收尾**：package.json（删 5 MUI peer deps、sideEffects、版本 2.0.0）；examples 应用（providers.tsx 去 MUI provider、globals.css 引入 orbis.css + Montserrat via next/font/google、_components 里 ~10 个 ExampleClient 的 MUI 脚手架换成 div/Tailwind）；docs/index.md 安装说明 + Atoms/Auth 等文档中 MUI 描述更新；skills/* 若提及 MUI/sx 同步修正；CHANGELOG.md 写迁移指南（sx→style、ButtonProps 变更、css import 必需、peer deps 变化）。

## 7. 破坏性变更清单（写入 CHANGELOG 2.0.0）

1. 删除 peer deps：`@mui/material` `@mui/icons-material` `@mui/x-date-pickers` `@emotion/react` `@emotion/styled`；消费者**必须** `import 'orbcafe-ui/dist/orbis.css'`
2. `sx?: SxProps<Theme>` → `sx?: React.CSSProperties`（不再支持响应式对象/theme 回调；`contentSx/floatingSearchSx/containerSx` 同理）
3. `CButton/CSelect/CTextField…` 不再透传 MUI props；variant 枚举变化（`contained→primary`、`outlined→secondary`、`text→ghost`）
4. `createTheme/ThemeProvider` 不再有 MUI 上下文；如消费者在库外自建 MUI 主题不再影响库组件
5. 日期组件仍以 dayjs 为值类型（无破坏），但不再有 LocalizationProvider 要求（内部自处理 locale）
6. 图表系列色/状态色语义变化（success 不再绿色 → 蓝；这是品牌纪律要求）

## 8. 验证方案

1. `npm run build` + `npm run check:ai-contracts` + `npm run pack:check`（确认 dist 含 orbis.css、无 MUI external 残留引用）
2. `grep -r "@mui" src` = 0；`npm ls @mui/material` 在 examples 中不再被 orbcafe-ui 需要
3. examples 应用 `npm run dev`，逐页人工核查（light+dark）：login、std-report、kanban、planning、pivot-table、pad、agent-ui、chat、aipanel、copilot、ctree、detail-info、ai-nav
4. **Playwright 对照**：打开 reference HTML（设计稿）与 examples 对应页面同视口截图对比（重点：登录页 vs login-preview、表格/按钮/芯片/Alert vs core reference、Gantt/Kanban vs modules reference）；视口矩阵抽 390×844 / 1440×900 两档
5. Nav Island 回归：固定/浮动模式、折叠、pin、搜索、拖拽位置 —— 行为应与 main 分支现状完全一致（只许颜色/字体差异）
6. 体积对比：构建后记录 dist 大小 + examples `node_modules` 中 MUI 相关包消失（安装体积报告写入 PR 说明）

## 9. 明确不做

- Navigation Island 的结构/玻璃拟态/动画/交互（仅 §Phase I 的 ~12 处颜色值）
- mermaid、ogl、react-syntax-highlighter、framer-motion 等非 MUI 依赖（可作后续优化，不在本次范围）
- 任何组件的布局结构、交互行为、文案（handoff 合同：color & typography pass）
- reference 中的文档页样式（.doc-head/.panel 等是设计稿自身 chrome，非产品 UI）
- 不提交 git commit（除非另行要求）；建议后续按 Phase 分批 commit

## 10. 风险与对策

| 风险 | 对策 |
|---|---|
| CTable/CDateRangePicker 重写引入回归 | 保留现有 props 与交互逻辑，只换渲染层；examples 页逐项手测 |
| 消费者未引入 orbis.css 导致无样式 | 文档置顶 + examples 示范 + CHANGELOG 醒目标注；css 类全部 `orb-` 前缀避免污染 |
| sx 响应式对象使用者升级困难 | CHANGELOG 提供迁移片段（sx 对象 → style + CSS 类） |
| color-mix 浏览器兼容 | 2023+ 全现代浏览器支持（Chrome 111+/Safari 16.2+/FF 113+），企业目标环境满足；回退方案是在 css 中同时写计算好的 hex（变量逐行注释来源公式） |
| 工作量大、会话中断 | 按 Phase 顺序推进，每 Phase build 保绿即为一个可恢复检查点 |
